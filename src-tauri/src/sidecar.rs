use std::path::PathBuf;

use tauri::{AppHandle, Manager, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

use crate::error::FriedmanError;

/// How we invoke the Friedman CLI.
enum SidecarMode {
    /// A compiled standalone binary (PackageCompiler output).
    Binary(PathBuf),
    /// Dev-mode: invoke `julia --project=<cli_project> <bin_script>`.
    Julia {
        julia: PathBuf,
        project_dir: PathBuf,
        bin_script: PathBuf,
    },
}

/// Resolve how to run friedman-cli.
///
/// Priority:
/// 1. Compiled binary in the Tauri resource directory (production builds).
/// 2. Compiled binary in `src-tauri/binaries/` (local compiled build).
/// 3. Dev-mode fallback: `julia --project=src-tauri/sidecar src-tauri/sidecar/main.jl`
///    where `src-tauri/sidecar/` contains a Julia environment that pulls
///    Friedman-cli from <https://github.com/chung9207/Friedman-cli>.
///    Run `./scripts/setup-sidecar.sh` once to install the Julia deps.
fn resolve_sidecar(app: &AppHandle) -> Result<SidecarMode, FriedmanError> {
    // 1. Bundled resource directory (production)
    if let Ok(resource_dir) = app.path().resource_dir() {
        for name in &["friedman-cli", "friedman-cli.exe"] {
            let candidate = resource_dir.join(name);
            if candidate.exists() {
                return Ok(SidecarMode::Binary(candidate));
            }
        }
    }

    // 2. Dev-mode compiled binary
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    for name in &["friedman-cli", "friedman-cli.exe"] {
        let candidate = manifest.join("binaries").join(name);
        if candidate.exists() {
            return Ok(SidecarMode::Binary(candidate));
        }
    }

    // 3. Dev-mode Julia fallback: use the sidecar/ Julia environment
    //    that depends on Friedman-cli from GitHub.
    let sidecar_dir = manifest.join("sidecar");
    let main_script = sidecar_dir.join("main.jl");
    if main_script.exists() {
        let julia = which_julia()?;
        return Ok(SidecarMode::Julia {
            julia,
            project_dir: sidecar_dir,
            bin_script: main_script,
        });
    }

    Err(FriedmanError::SidecarExec(
        "friedman-cli binary not found. For dev mode, run ./scripts/setup-sidecar.sh first."
            .into(),
    ))
}

/// Find the `julia` binary on PATH or common install locations.
fn which_julia() -> Result<PathBuf, FriedmanError> {
    // Check common locations
    let candidates = [
        // juliaup (macOS/Linux)
        dirs::home_dir().map(|h| h.join(".juliaup").join("bin").join("julia")),
        // Homebrew
        Some(PathBuf::from("/opt/homebrew/bin/julia")),
        // Linux
        Some(PathBuf::from("/usr/local/bin/julia")),
        // juliaup on Windows
        dirs::home_dir().map(|h| h.join(".juliaup").join("bin").join("julia.exe")),
    ];

    for candidate in candidates.into_iter().flatten() {
        if candidate.exists() {
            return Ok(candidate);
        }
    }

    // Last resort: hope it's on PATH
    Ok(PathBuf::from("julia"))
}

/// Run a friedman-cli command, capture stdout, and parse the result as JSON.
///
/// `--format=json` is automatically appended so every invocation returns
/// machine-readable output.
pub async fn run_friedman_command(
    app: &AppHandle,
    args: Vec<&str>,
) -> Result<serde_json::Value, FriedmanError> {
    let mode = resolve_sidecar(app)?;

    let mut cmd_args: Vec<String> = args.iter().map(|s| s.to_string()).collect();
    cmd_args.push("--format=json".to_string());

    let output = match &mode {
        SidecarMode::Binary(bin) => {
            Command::new(bin)
                .args(&cmd_args)
                .output()
                .await
                .map_err(|e| FriedmanError::SidecarExec(format!("Failed to spawn sidecar: {e}")))?
        }
        SidecarMode::Julia { julia, project_dir, bin_script } => {
            Command::new(julia)
                .arg(format!("--project={}", project_dir.display()))
                .arg("--startup-file=no")
                .arg(bin_script)
                .args(&cmd_args)
                .output()
                .await
                .map_err(|e| FriedmanError::SidecarExec(format!("Failed to spawn julia: {e}")))?
        }
    };

    if !output.status.success() {
        let code = output.status.code().unwrap_or(-1);
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        return Err(FriedmanError::SidecarExit { code, stderr });
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(&stdout)
        .map_err(|e| FriedmanError::JsonParse(format!("{e}: {stdout}")))
}

/// Run a friedman-cli command while streaming stderr progress lines as Tauri
/// events.
///
/// Each line written to stderr by the sidecar is emitted as a global event
/// named `friedman://progress/{job_id}` so the front-end can display a
/// progress indicator.
pub async fn run_friedman_command_with_progress(
    app: &AppHandle,
    job_id: &str,
    args: Vec<&str>,
) -> Result<serde_json::Value, FriedmanError> {
    let mode = resolve_sidecar(app)?;

    let mut cmd_args: Vec<String> = args.iter().map(|s| s.to_string()).collect();
    cmd_args.push("--format=json".to_string());

    let mut child = match &mode {
        SidecarMode::Binary(bin) => {
            Command::new(bin)
                .args(&cmd_args)
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .spawn()
                .map_err(|e| FriedmanError::SidecarExec(format!("Failed to spawn sidecar: {e}")))?
        }
        SidecarMode::Julia { julia, project_dir, bin_script } => {
            Command::new(julia)
                .arg(format!("--project={}", project_dir.display()))
                .arg("--startup-file=no")
                .arg(bin_script)
                .args(&cmd_args)
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .spawn()
                .map_err(|e| FriedmanError::SidecarExec(format!("Failed to spawn julia: {e}")))?
        }
    };

    // Stream stderr in the background
    let event_name = format!("friedman://progress/{job_id}");
    let app_clone = app.clone();
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| FriedmanError::SidecarExec("Failed to capture stderr".into()))?;

    let stderr_handle = tokio::spawn(async move {
        let reader = BufReader::new(stderr);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            let _ = app_clone.emit(&event_name, &line);
        }
    });

    let output = child
        .wait_with_output()
        .await
        .map_err(|e| FriedmanError::SidecarExec(format!("Sidecar wait failed: {e}")))?;

    // Ensure the stderr reader finishes
    let _ = stderr_handle.await;

    if !output.status.success() {
        let code = output.status.code().unwrap_or(-1);
        let stderr_str = String::from_utf8_lossy(&output.stderr).to_string();
        return Err(FriedmanError::SidecarExit {
            code,
            stderr: stderr_str,
        });
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(&stdout)
        .map_err(|e| FriedmanError::JsonParse(format!("{e}: {stdout}")))
}
