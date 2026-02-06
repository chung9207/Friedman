//! Integration tests for the Friedman CLI sidecar.
//!
//! These tests verify that the Rust command layer produces argument lists
//! that are accepted by the real Friedman-cli Julia binary. Each test
//! mirrors the exact args built by `src/commands/*.rs`.
//!
//! Two assertion levels:
//!   - `assert_args_accepted` — lenient: no arg-parse errors (computational errors OK)
//!   - `assert_success` — strict: exit 0 + valid JSON in stdout
//!
//! Requirements:
//!   - Julia installed (juliaup, Homebrew, or on PATH)
//!   - Sidecar deps installed: `./scripts/setup-sidecar.sh`
//!
//! Run all sidecar tests:
//!   cargo test -p friedman-app --test sidecar_integration -- --ignored
//!
//! Run a single test:
//!   cargo test -p friedman-app --test sidecar_integration test_var_estimate -- --ignored

use std::path::PathBuf;
use std::process::{Command, Output};
use std::sync::OnceLock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static JULIA_PATH: OnceLock<PathBuf> = OnceLock::new();

fn julia_path() -> &'static PathBuf {
    JULIA_PATH.get_or_init(|| find_julia().expect("Julia not found"))
}

fn find_julia() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let candidates = [
        home.join(".juliaup/bin/julia"),
        PathBuf::from("/opt/homebrew/bin/julia"),
        PathBuf::from("/usr/local/bin/julia"),
        home.join(".juliaup/bin/julia.exe"),
    ];
    for c in &candidates {
        if c.exists() {
            return Some(c.clone());
        }
    }
    // Fallback: hope it's on PATH
    Some(PathBuf::from("julia"))
}

fn sidecar_project_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("sidecar")
}

fn sidecar_main_jl() -> PathBuf {
    sidecar_project_dir().join("main.jl")
}

fn test_csv() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("fixtures")
        .join("test_macro_large.csv")
}

/// Spawn `julia --project=<sidecar> --startup-file=no main.jl <args> --format=json`
/// and return the process output.
fn run_friedman(args: &[&str]) -> Output {
    let julia = julia_path();
    let project = sidecar_project_dir();
    let main = sidecar_main_jl();

    assert!(main.exists(), "Sidecar main.jl not found at {}", main.display());

    let mut cmd = Command::new(julia);
    cmd.arg(format!("--project={}", project.display()))
        .arg("--startup-file=no")
        .arg(&main);

    for arg in args {
        cmd.arg(arg);
    }
    cmd.arg("--format=json");

    cmd.output().expect("Failed to spawn Julia process")
}

/// Extract the first JSON object or array from mixed stdout.
///
/// Mirrors the `extract_json()` function in `sidecar.rs`.
/// The Julia sidecar prints diagnostic text around the JSON payload;
/// this finds the first `{` or `[` and its matching closing delimiter.
fn extract_json_from_stdout(raw: &str) -> Option<serde_json::Value> {
    // Fast path: entire output is valid JSON
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(raw) {
        return Some(v);
    }

    // Find the first '{' or '['
    let start = raw.find(|c: char| c == '{' || c == '[')?;

    let open = raw.as_bytes()[start];
    let close = if open == b'{' { b'}' } else { b']' };

    // Walk forward tracking nesting depth (ignoring chars inside strings)
    let mut depth = 0i32;
    let mut in_string = false;
    let mut escape = false;
    let mut end = None;

    for (i, b) in raw[start..].bytes().enumerate() {
        if escape {
            escape = false;
            continue;
        }
        if b == b'\\' && in_string {
            escape = true;
            continue;
        }
        if b == b'"' {
            in_string = !in_string;
            continue;
        }
        if in_string {
            continue;
        }
        if b == open {
            depth += 1;
        } else if b == close {
            depth -= 1;
            if depth == 0 {
                end = Some(start + i + 1);
                break;
            }
        }
    }

    let end = end?;
    serde_json::from_str(&raw[start..end]).ok()
}

/// Result classification for a sidecar invocation.
#[derive(Debug)]
enum RunResult {
    /// Exit 0, valid JSON extracted from stdout
    Success(serde_json::Value),
    /// Non-zero exit but args were accepted (computational/data error)
    ComputationalError { code: i32, stderr: String },
    /// Args were rejected by the CLI parser
    ArgParseError { stderr: String },
    /// Exit 0 but no valid JSON found in stdout
    NoJsonOutput { stdout: String },
}

fn classify(output: &Output) -> RunResult {
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    // Patterns that indicate the CLI didn't recognize our arguments
    let arg_error_patterns = [
        "unknown option",
        "unrecognized option",
        "missing required argument",
        "invalid argument",
        "Expected argument",
        "no such command",
        "Unknown command",
    ];

    let is_arg_error = arg_error_patterns
        .iter()
        .any(|pat| stderr.to_lowercase().contains(&pat.to_lowercase()));

    if is_arg_error {
        return RunResult::ArgParseError { stderr };
    }

    if output.status.success() {
        match extract_json_from_stdout(&stdout) {
            Some(json) => RunResult::Success(json),
            None => {
                eprintln!("  [warn] exit 0 but no JSON found in stdout");
                eprintln!("  [warn] stdout: {}", &stdout[..stdout.len().min(500)]);
                RunResult::NoJsonOutput { stdout }
            }
        }
    } else {
        let code = output.status.code().unwrap_or(-1);
        RunResult::ComputationalError { code, stderr }
    }
}

/// Assert that args were accepted by the CLI (no parse errors).
/// Computational errors (bad data, insufficient obs) are acceptable.
fn assert_args_accepted(label: &str, output: &Output) {
    let result = classify(output);
    match &result {
        RunResult::Success(json) => {
            eprintln!("  [OK] {label}: success, JSON keys: {:?}",
                json.as_object().map(|o| o.keys().collect::<Vec<_>>()));
        }
        RunResult::ComputationalError { code, stderr } => {
            eprintln!("  [OK] {label}: computational error (exit {code}), args accepted");
            eprintln!("  stderr: {}", &stderr[..stderr.len().min(300)]);
        }
        RunResult::NoJsonOutput { .. } => {
            eprintln!("  [OK] {label}: exit 0, no JSON (args accepted)");
        }
        RunResult::ArgParseError { stderr } => {
            panic!(
                "\n\n=== ARG PARSE ERROR for '{label}' ===\n\
                The CLI rejected our arguments. This means the Rust command\n\
                is building args that don't match the real Friedman-cli interface.\n\n\
                stderr:\n{stderr}\n"
            );
        }
    }
}

/// Strict assertion: requires exit 0 + valid JSON extracted from stdout.
/// Unlike `assert_args_accepted`, this catches runtime crashes that produce
/// non-zero exit codes or fail to emit JSON.
fn assert_success(label: &str, output: &Output) {
    let result = classify(output);
    match &result {
        RunResult::Success(json) => {
            eprintln!("  [OK] {label}: success, JSON keys: {:?}",
                json.as_object().map(|o| o.keys().collect::<Vec<_>>()));
        }
        RunResult::ComputationalError { code, stderr } => {
            panic!(
                "\n\n=== RUNTIME ERROR for '{label}' ===\n\
                The sidecar exited with code {code}.\n\
                This command's args were accepted but computation failed.\n\n\
                stderr:\n{}\n",
                &stderr[..stderr.len().min(1000)]
            );
        }
        RunResult::NoJsonOutput { stdout } => {
            panic!(
                "\n\n=== NO JSON OUTPUT for '{label}' ===\n\
                The sidecar exited 0 but no valid JSON was found in stdout.\n\
                This likely means the command printed non-JSON output or\n\
                the JSON output format has changed.\n\n\
                stdout (first 1000 chars):\n{}\n",
                &stdout[..stdout.len().min(1000)]
            );
        }
        RunResult::ArgParseError { stderr } => {
            panic!(
                "\n\n=== ARG PARSE ERROR for '{label}' ===\n\
                The CLI rejected our arguments. This means the Rust command\n\
                is building args that don't match the real Friedman-cli interface.\n\n\
                stderr:\n{stderr}\n"
            );
        }
    }
}

// ===========================================================================
// VAR (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_var_estimate_defaults() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "estimate", csv_str,
        "--trend", "constant",
    ]);
    assert_args_accepted("var estimate (defaults)", &output);
}

#[test]
#[ignore]
fn test_var_estimate_with_lags() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "estimate", csv_str,
        "--lags", "2",
        "--trend", "none",
    ]);
    assert_args_accepted("var estimate (lags=2, trend=none)", &output);
}

#[test]
#[ignore]
fn test_var_estimate_all_trends() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    for trend in &["none", "constant", "trend", "both"] {
        let output = run_friedman(&[
            "var", "estimate", csv_str,
            "--lags", "1",
            "--trend", trend,
        ]);
        assert_args_accepted(&format!("var estimate (trend={trend})"), &output);
    }
}

#[test]
#[ignore]
fn test_var_lagselect() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "lagselect", csv_str,
        "--max-lags", "12",
        "--criterion", "aic",
    ]);
    assert_args_accepted("var lagselect (aic)", &output);

    for crit in &["bic", "hqc"] {
        let output = run_friedman(&[
            "var", "lagselect", csv_str,
            "--max-lags", "8",
            "--criterion", crit,
        ]);
        assert_args_accepted(&format!("var lagselect ({crit})"), &output);
    }
}

#[test]
#[ignore]
fn test_var_stability() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&["var", "stability", csv_str]);
    assert_args_accepted("var stability (auto lags)", &output);

    let output = run_friedman(&[
        "var", "stability", csv_str,
        "--lags", "2",
    ]);
    assert_args_accepted("var stability (lags=2)", &output);
}

#[test]
#[ignore]
fn test_var_irf() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Mirrors: commands/var.rs var_irf
    let output = run_friedman(&[
        "var", "irf", csv_str,
        "--shock", "1",
        "--horizons", "10",
        "--id", "cholesky",
        "--ci", "bootstrap",
        "--replications", "100",
    ]);
    assert_args_accepted("var irf (cholesky, bootstrap)", &output);
}

#[test]
#[ignore]
fn test_var_irf_with_lags() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "irf", csv_str,
        "--shock", "1",
        "--horizons", "10",
        "--id", "cholesky",
        "--ci", "none",
        "--replications", "100",
        "--lags", "2",
    ]);
    assert_args_accepted("var irf (with lags)", &output);
}

#[test]
#[ignore]
fn test_var_fevd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "fevd", csv_str,
        "--horizons", "10",
        "--id", "cholesky",
    ]);
    assert_args_accepted("var fevd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_var_fevd_with_lags() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "fevd", csv_str,
        "--horizons", "10",
        "--id", "cholesky",
        "--lags", "2",
    ]);
    assert_args_accepted("var fevd (with lags)", &output);
}

#[test]
#[ignore]
fn test_var_hd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "hd", csv_str,
        "--id", "cholesky",
    ]);
    assert_args_accepted("var hd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_var_hd_with_lags() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "hd", csv_str,
        "--id", "cholesky",
        "--lags", "2",
    ]);
    assert_args_accepted("var hd (with lags)", &output);
}

#[test]
#[ignore]
fn test_var_forecast() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "forecast", csv_str,
        "--horizons", "12",
        "--confidence", "0.95",
    ]);
    assert_args_accepted("var forecast (defaults)", &output);

    let output = run_friedman(&[
        "var", "forecast", csv_str,
        "--horizons", "6",
        "--confidence", "0.9",
        "--lags", "2",
    ]);
    assert_args_accepted("var forecast (lags=2)", &output);
}

// ===========================================================================
// BVAR (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_bvar_estimate() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "estimate", csv_str,
        "--lags", "4",
        "--prior", "minnesota",
        "--draws", "500",
        "--sampler", "nuts",
    ]);
    assert_args_accepted("bvar estimate (defaults)", &output);
}

#[test]
#[ignore]
fn test_bvar_posterior() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "posterior", csv_str,
        "--lags", "2",
        "--draws", "500",
        "--sampler", "nuts",
        "--method", "mean",
    ]);
    assert_args_accepted("bvar posterior (mean)", &output);

    let output = run_friedman(&[
        "bvar", "posterior", csv_str,
        "--lags", "2",
        "--draws", "500",
        "--sampler", "nuts",
        "--method", "median",
    ]);
    assert_args_accepted("bvar posterior (median)", &output);
}

#[test]
#[ignore]
fn test_bvar_irf() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "irf", csv_str,
        "--shock", "1",
        "--horizons", "10",
        "--id", "cholesky",
        "--draws", "500",
        "--sampler", "nuts",
    ]);
    assert_args_accepted("bvar irf (cholesky)", &output);

    let output = run_friedman(&[
        "bvar", "irf", csv_str,
        "--shock", "1",
        "--horizons", "10",
        "--id", "cholesky",
        "--draws", "500",
        "--sampler", "nuts",
        "--lags", "2",
    ]);
    assert_args_accepted("bvar irf (with lags)", &output);
}

#[test]
#[ignore]
fn test_bvar_fevd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "fevd", csv_str,
        "--horizons", "10",
        "--id", "cholesky",
        "--draws", "500",
        "--sampler", "nuts",
    ]);
    assert_args_accepted("bvar fevd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_bvar_hd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "hd", csv_str,
        "--id", "cholesky",
        "--draws", "500",
        "--sampler", "nuts",
    ]);
    assert_args_accepted("bvar hd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_bvar_forecast() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "bvar", "forecast", csv_str,
        "--horizons", "12",
        "--draws", "500",
        "--sampler", "nuts",
    ]);
    assert_args_accepted("bvar forecast (defaults)", &output);
}

// ===========================================================================
// LP (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_lp_estimate_standard() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "standard",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
    ]);
    assert_args_accepted("lp estimate standard (newey_west)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_vcov_variants() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    for vcov in &["white", "driscoll_kraay"] {
        let output = run_friedman(&[
            "lp", "estimate", csv_str,
            "--method", "standard",
            "--shock", "1",
            "--horizons", "8",
            "--control-lags", "2",
            "--vcov", vcov,
        ]);
        assert_args_accepted(&format!("lp estimate standard (vcov={vcov})"), &output);
    }
}

#[test]
#[ignore]
fn test_lp_estimate_iv() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "iv",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
    ]);
    assert_args_accepted("lp estimate iv (no instruments)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_smooth() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "smooth",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--knots", "3",
        "--lambda", "0",
    ]);
    assert_args_accepted("lp estimate smooth", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_state() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "state",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--gamma", "1.5",
        "--transition", "logistic",
    ]);
    assert_args_accepted("lp estimate state (logistic)", &output);

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "state",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--gamma", "1.5",
        "--transition", "logistic",
        "--state-var", "2",
    ]);
    assert_args_accepted("lp estimate state (with state-var)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_propensity() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "propensity",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--treatment", "1",
        "--score-method", "logit",
    ]);
    assert_args_accepted("lp estimate propensity (logit)", &output);

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "propensity",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--treatment", "1",
        "--score-method", "probit",
    ]);
    assert_args_accepted("lp estimate propensity (probit)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_robust() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", csv_str,
        "--method", "robust",
        "--shock", "1",
        "--horizons", "10",
        "--control-lags", "4",
        "--vcov", "newey_west",
        "--treatment", "1",
        "--score-method", "logit",
    ]);
    assert_args_accepted("lp estimate robust", &output);
}

#[test]
#[ignore]
fn test_lp_irf() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Single shock
    let output = run_friedman(&[
        "lp", "irf", csv_str,
        "--shock", "1",
        "--horizons", "10",
        "--id", "cholesky",
    ]);
    assert_args_accepted("lp irf (single shock)", &output);

    // Multiple shocks
    let output = run_friedman(&[
        "lp", "irf", csv_str,
        "--shocks", "1,2",
        "--horizons", "10",
        "--id", "cholesky",
    ]);
    assert_args_accepted("lp irf (multi shock)", &output);
}

#[test]
#[ignore]
fn test_lp_fevd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "fevd", csv_str,
        "--horizons", "10",
        "--id", "cholesky",
    ]);
    assert_args_accepted("lp fevd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_lp_hd() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "hd", csv_str,
        "--id", "cholesky",
    ]);
    assert_args_accepted("lp hd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_lp_forecast() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "forecast", csv_str,
        "--horizons", "12",
    ]);
    assert_args_accepted("lp forecast (defaults)", &output);

    let output = run_friedman(&[
        "lp", "forecast", csv_str,
        "--shock", "1",
        "--horizons", "6",
        "--shock-size", "1.0",
        "--lags", "2",
        "--vcov", "newey_west",
    ]);
    assert_args_accepted("lp forecast (with options)", &output);
}

// ===========================================================================
// Factor Models (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_factor_estimate_static() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Auto nfactors
    let output = run_friedman(&[
        "factor", "estimate", "static", csv_str,
        "--criterion", "ic1",
    ]);
    assert_args_accepted("factor estimate static (auto)", &output);

    // Explicit nfactors
    let output = run_friedman(&[
        "factor", "estimate", "static", csv_str,
        "--nfactors", "2",
        "--criterion", "ic1",
    ]);
    assert_args_accepted("factor estimate static (nfactors=2)", &output);
}

#[test]
#[ignore]
fn test_factor_estimate_dynamic() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "factor", "estimate", "dynamic", csv_str,
        "--factor-lags", "1",
        "--method", "twostep",
    ]);
    assert_args_accepted("factor estimate dynamic (twostep)", &output);

    let output = run_friedman(&[
        "factor", "estimate", "dynamic", csv_str,
        "--nfactors", "2",
        "--factor-lags", "1",
        "--method", "em",
    ]);
    assert_args_accepted("factor estimate dynamic (em, nfactors=2)", &output);
}

#[test]
#[ignore]
fn test_factor_estimate_gdfm() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Auto
    let output = run_friedman(&["factor", "estimate", "gdfm", csv_str]);
    assert_args_accepted("factor estimate gdfm (auto)", &output);

    // Explicit
    let output = run_friedman(&[
        "factor", "estimate", "gdfm", csv_str,
        "--nfactors", "2",
        "--dynamic-rank", "1",
    ]);
    assert_args_accepted("factor estimate gdfm (explicit)", &output);
}

// ===========================================================================
// Unit Root & Cointegration Tests (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_adf() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "adf", csv_str,
        "--column", "2",
        "--trend", "constant",
    ]);
    assert_args_accepted("test adf (constant)", &output);

    let output = run_friedman(&[
        "test", "adf", csv_str,
        "--column", "2",
        "--max-lags", "8",
        "--trend", "trend",
    ]);
    assert_args_accepted("test adf (trend, max-lags=8)", &output);
}

#[test]
#[ignore]
fn test_kpss() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "kpss", csv_str,
        "--column", "2",
        "--trend", "constant",
    ]);
    assert_args_accepted("test kpss (constant)", &output);

    let output = run_friedman(&[
        "test", "kpss", csv_str,
        "--column", "2",
        "--trend", "trend",
    ]);
    assert_args_accepted("test kpss (trend)", &output);
}

#[test]
#[ignore]
fn test_pp() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "pp", csv_str,
        "--column", "2",
        "--trend", "constant",
    ]);
    assert_args_accepted("test pp (constant)", &output);
}

#[test]
#[ignore]
fn test_za() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "za", csv_str,
        "--column", "2",
        "--trend", "both",
        "--trim", "0.15",
    ]);
    assert_args_accepted("test za (both, trim=0.15)", &output);

    let output = run_friedman(&[
        "test", "za", csv_str,
        "--column", "2",
        "--trend", "intercept",
        "--trim", "0.1",
    ]);
    assert_args_accepted("test za (intercept)", &output);
}

#[test]
#[ignore]
fn test_np() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "np", csv_str,
        "--column", "2",
        "--trend", "constant",
    ]);
    assert_args_accepted("test np (constant)", &output);
}

#[test]
#[ignore]
fn test_johansen() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "johansen", csv_str,
        "--lags", "2",
        "--trend", "constant",
    ]);
    assert_args_accepted("test johansen (lags=2, constant)", &output);
}

// ===========================================================================
// GMM (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_gmm_estimate() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "gmm", "estimate", csv_str,
        "--weighting", "twostep",
    ]);
    assert_args_accepted("gmm estimate (no config)", &output);
}

// ===========================================================================
// ARIMA (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_arima_estimate() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Explicit p (manual mode)
    let output = run_friedman(&[
        "arima", "estimate", csv_str,
        "--column", "2",
        "--p", "1",
        "--d", "0",
        "--q", "0",
        "--method", "css_mle",
    ]);
    assert_args_accepted("arima estimate (1,0,0)", &output);

    let output = run_friedman(&[
        "arima", "estimate", csv_str,
        "--column", "2",
        "--p", "1",
        "--d", "1",
        "--q", "1",
        "--method", "mle",
    ]);
    assert_args_accepted("arima estimate (1,1,1 mle)", &output);
}

#[test]
#[ignore]
fn test_arima_estimate_auto() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Auto mode: omit --p, use --max-p/--max-d/--max-q/--criterion
    let output = run_friedman(&[
        "arima", "estimate", csv_str,
        "--column", "2",
        "--d", "0",
        "--q", "0",
        "--method", "css_mle",
        "--max-p", "3",
        "--max-d", "1",
        "--max-q", "3",
        "--criterion", "bic",
    ]);
    assert_args_accepted("arima estimate auto (bic)", &output);

    let output = run_friedman(&[
        "arima", "estimate", csv_str,
        "--column", "2",
        "--d", "0",
        "--q", "0",
        "--method", "css_mle",
        "--max-p", "5",
        "--max-d", "2",
        "--max-q", "5",
        "--criterion", "aic",
    ]);
    assert_args_accepted("arima estimate auto (aic)", &output);
}

#[test]
#[ignore]
fn test_arima_forecast() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // With explicit p
    let output = run_friedman(&[
        "arima", "forecast", csv_str,
        "--column", "2",
        "--d", "0",
        "--q", "0",
        "--horizons", "12",
        "--confidence", "0.95",
        "--method", "css_mle",
        "--p", "1",
    ]);
    assert_args_accepted("arima forecast (1,0,0)", &output);

    // Without p (auto)
    let output = run_friedman(&[
        "arima", "forecast", csv_str,
        "--column", "2",
        "--d", "0",
        "--q", "0",
        "--horizons", "6",
        "--confidence", "0.9",
        "--method", "css_mle",
    ]);
    assert_args_accepted("arima forecast (auto p)", &output);
}

// ===========================================================================
// Factor Forecast (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_factor_forecast() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    // Auto nfactors
    let output = run_friedman(&[
        "factor", "forecast", csv_str,
        "--horizon", "6",
        "--ci-method", "none",
    ]);
    assert_args_accepted("factor forecast (auto)", &output);

    // Explicit nfactors
    let output = run_friedman(&[
        "factor", "forecast", csv_str,
        "--nfactors", "2",
        "--horizon", "6",
    ]);
    assert_args_accepted("factor forecast (nfactors=2)", &output);

    // With model type
    let output = run_friedman(&[
        "factor", "forecast", csv_str,
        "--nfactors", "2",
        "--horizon", "6",
        "--model", "dynamic",
        "--factor-lags", "1",
        "--method", "twostep",
    ]);
    assert_args_accepted("factor forecast (dynamic)", &output);
}

// ===========================================================================
// Non-Gaussian SVAR (lenient)
// ===========================================================================

#[test]
#[ignore]
fn test_nongaussian_fastica() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "fastica", csv_str,
        "--lags", "2",
        "--method", "fastica",
        "--contrast", "logcosh",
    ]);
    assert_args_accepted("nongaussian fastica (logcosh)", &output);

    let output = run_friedman(&[
        "nongaussian", "fastica", csv_str,
        "--lags", "2",
        "--method", "jade",
    ]);
    assert_args_accepted("nongaussian fastica (jade)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_ml() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "ml", csv_str,
        "--lags", "2",
        "--distribution", "student_t",
    ]);
    assert_args_accepted("nongaussian ml (student_t)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_heteroskedasticity() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "heteroskedasticity", csv_str,
        "--lags", "2",
        "--method", "markov",
        "--regimes", "2",
    ]);
    assert_args_accepted("nongaussian heteroskedasticity (markov)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_normality() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "normality", csv_str,
        "--lags", "2",
    ]);
    assert_args_accepted("nongaussian normality", &output);
}

#[test]
#[ignore]
fn test_nongaussian_identifiability() {
    let csv = test_csv();
    let csv_str = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "identifiability", csv_str,
        "--lags", "2",
        "--test", "all",
        "--method", "fastica",
        "--contrast", "logcosh",
    ]);
    assert_args_accepted("nongaussian identifiability (all)", &output);
}

// ===========================================================================
// STRICT TESTS — require exit 0 + valid JSON
// ===========================================================================

#[test]
#[ignore]
fn test_var_estimate_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["var", "estimate", c, "--lags", "2", "--trend", "constant"]);
    assert_success("var estimate", &output);
}

#[test]
#[ignore]
fn test_var_lagselect_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["var", "lagselect", c, "--max-lags", "8", "--criterion", "aic"]);
    assert_success("var lagselect", &output);
}

#[test]
#[ignore]
fn test_var_stability_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["var", "stability", c, "--lags", "2"]);
    assert_success("var stability", &output);
}

#[test]
#[ignore]
fn test_var_irf_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "irf", c, "--shock", "1", "--horizons", "10",
        "--id", "cholesky", "--ci", "none", "--replications", "100", "--lags", "2",
    ]);
    assert_success("var irf (cholesky)", &output);
}

#[test]
#[ignore]
fn test_var_fevd_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "fevd", c, "--horizons", "10", "--id", "cholesky", "--lags", "2",
    ]);
    assert_success("var fevd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_var_hd_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["var", "hd", c, "--id", "cholesky", "--lags", "2"]);
    assert_success("var hd (cholesky)", &output);
}

#[test]
#[ignore]
fn test_var_forecast_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "var", "forecast", c, "--horizons", "12", "--confidence", "0.95", "--lags", "2",
    ]);
    assert_success("var forecast", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", c, "--method", "standard", "--shock", "1", "--horizons", "10",
        "--control-lags", "4", "--vcov", "newey_west",
    ]);
    assert_success("lp estimate standard (newey_west)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_smooth_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", c, "--method", "smooth", "--shock", "1", "--horizons", "10",
        "--control-lags", "4", "--vcov", "newey_west", "--knots", "3", "--lambda", "0",
    ]);
    assert_success("lp estimate smooth", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_state_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", c, "--method", "state", "--shock", "1", "--horizons", "10",
        "--control-lags", "4", "--vcov", "newey_west", "--gamma", "1.5", "--transition", "logistic",
    ]);
    assert_success("lp estimate state (logistic)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_propensity_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", c, "--method", "propensity", "--shock", "1", "--horizons", "10",
        "--control-lags", "4", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit",
    ]);
    assert_success("lp estimate propensity (logit)", &output);
}

#[test]
#[ignore]
fn test_lp_estimate_robust_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "estimate", c, "--method", "robust", "--shock", "1", "--horizons", "10",
        "--control-lags", "4", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit",
    ]);
    assert_success("lp estimate robust", &output);
}

#[test]
#[ignore]
fn test_lp_irf_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "lp", "irf", c, "--shocks", "1,2", "--horizons", "10", "--id", "cholesky",
    ]);
    assert_success("lp irf (multi shock)", &output);
}

#[test]
#[ignore]
fn test_factor_estimate_static_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["factor", "estimate", "static", c, "--nfactors", "2", "--criterion", "ic1"]);
    assert_success("factor estimate static (nfactors=2)", &output);
}

#[test]
#[ignore]
fn test_factor_estimate_dynamic_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "factor", "estimate", "dynamic", c, "--factor-lags", "1", "--method", "twostep",
    ]);
    assert_success("factor estimate dynamic (twostep)", &output);
}

#[test]
#[ignore]
fn test_factor_estimate_gdfm_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["factor", "estimate", "gdfm", c]);
    assert_success("factor estimate gdfm (auto)", &output);
}

#[test]
#[ignore]
fn test_adf_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["test", "adf", c, "--column", "2", "--trend", "constant"]);
    assert_success("test adf (constant)", &output);
}

#[test]
#[ignore]
fn test_kpss_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["test", "kpss", c, "--column", "2", "--trend", "constant"]);
    assert_success("test kpss (constant)", &output);
}

#[test]
#[ignore]
fn test_pp_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["test", "pp", c, "--column", "2", "--trend", "constant"]);
    assert_success("test pp (constant)", &output);
}

#[test]
#[ignore]
fn test_za_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "test", "za", c, "--column", "2", "--trend", "both", "--trim", "0.15",
    ]);
    assert_success("test za (both)", &output);
}

#[test]
#[ignore]
fn test_np_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["test", "np", c, "--column", "2", "--trend", "constant"]);
    assert_success("test np (constant)", &output);
}

#[test]
#[ignore]
fn test_johansen_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["test", "johansen", c, "--lags", "2", "--trend", "constant"]);
    assert_success("test johansen", &output);
}

#[test]
#[ignore]
fn test_arima_estimate_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "arima", "estimate", c, "--column", "2",
        "--p", "1", "--d", "0", "--q", "0", "--method", "css_mle",
    ]);
    assert_success("arima estimate (1,0,0)", &output);
}

#[test]
#[ignore]
fn test_arima_estimate_auto_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "arima", "estimate", c, "--column", "2",
        "--d", "0", "--q", "0", "--method", "css_mle",
        "--max-p", "3", "--max-d", "1", "--max-q", "3",
        "--criterion", "bic",
    ]);
    assert_success("arima estimate auto (bic)", &output);
}

#[test]
#[ignore]
fn test_arima_forecast_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "arima", "forecast", c, "--column", "2",
        "--p", "1", "--d", "0", "--q", "0",
        "--horizons", "12", "--confidence", "0.95", "--method", "css_mle",
    ]);
    assert_success("arima forecast (1,0,0)", &output);
}

#[test]
#[ignore]
fn test_factor_forecast_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "factor", "forecast", c, "--nfactors", "2", "--horizon", "6", "--ci-method", "none",
    ]);
    assert_success("factor forecast (nfactors=2)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_fastica_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "fastica", c, "--lags", "2",
        "--method", "fastica", "--contrast", "logcosh",
    ]);
    assert_success("nongaussian fastica (logcosh)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_ml_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "ml", c, "--lags", "2", "--distribution", "student_t",
    ]);
    assert_success("nongaussian ml (student_t)", &output);
}

#[test]
#[ignore]
fn test_nongaussian_normality_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&["nongaussian", "normality", c, "--lags", "2"]);
    assert_success("nongaussian normality", &output);
}

#[test]
#[ignore]
fn test_nongaussian_identifiability_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let output = run_friedman(&[
        "nongaussian", "identifiability", c, "--lags", "2",
        "--test", "all", "--method", "fastica", "--contrast", "logcosh",
    ]);
    assert_success("nongaussian identifiability (all)", &output);
}

// ===========================================================================
// Smoke tests
// ===========================================================================

/// Lenient smoke test — all command groups, args-accepted only.
#[test]
#[ignore]
fn test_smoke_all_groups() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    let commands: Vec<(&str, Vec<&str>)> = vec![
        // VAR
        ("var estimate",      vec!["var", "estimate", c, "--lags", "1", "--trend", "constant"]),
        ("var lagselect",     vec!["var", "lagselect", c, "--max-lags", "4", "--criterion", "aic"]),
        ("var stability",     vec!["var", "stability", c, "--lags", "1"]),
        ("var irf",           vec!["var", "irf", c, "--shock", "1", "--horizons", "5", "--id", "cholesky", "--ci", "none", "--replications", "100"]),
        ("var fevd",          vec!["var", "fevd", c, "--horizons", "5", "--id", "cholesky"]),
        ("var hd",            vec!["var", "hd", c, "--id", "cholesky"]),
        ("var forecast",      vec!["var", "forecast", c, "--horizons", "6", "--confidence", "0.95"]),
        // BVAR
        ("bvar estimate",     vec!["bvar", "estimate", c, "--lags", "2", "--prior", "minnesota", "--draws", "200", "--sampler", "nuts"]),
        ("bvar posterior",    vec!["bvar", "posterior", c, "--lags", "2", "--draws", "200", "--sampler", "nuts", "--method", "mean"]),
        ("bvar irf",          vec!["bvar", "irf", c, "--shock", "1", "--horizons", "5", "--id", "cholesky", "--draws", "200", "--sampler", "nuts"]),
        ("bvar fevd",         vec!["bvar", "fevd", c, "--horizons", "5", "--id", "cholesky", "--draws", "200", "--sampler", "nuts"]),
        ("bvar hd",           vec!["bvar", "hd", c, "--id", "cholesky", "--draws", "200", "--sampler", "nuts"]),
        ("bvar forecast",     vec!["bvar", "forecast", c, "--horizons", "6", "--draws", "200", "--sampler", "nuts"]),
        // LP
        ("lp estimate std",   vec!["lp", "estimate", c, "--method", "standard", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west"]),
        ("lp estimate iv",    vec!["lp", "estimate", c, "--method", "iv", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west"]),
        ("lp estimate smooth", vec!["lp", "estimate", c, "--method", "smooth", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west", "--knots", "3", "--lambda", "0"]),
        ("lp estimate state", vec!["lp", "estimate", c, "--method", "state", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west", "--gamma", "1.5", "--transition", "logistic"]),
        ("lp estimate propensity", vec!["lp", "estimate", c, "--method", "propensity", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit"]),
        ("lp estimate robust", vec!["lp", "estimate", c, "--method", "robust", "--shock", "1", "--horizons", "5", "--control-lags", "2", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit"]),
        ("lp irf",            vec!["lp", "irf", c, "--shocks", "1,2", "--horizons", "5", "--id", "cholesky"]),
        ("lp fevd",           vec!["lp", "fevd", c, "--horizons", "5", "--id", "cholesky"]),
        ("lp hd",             vec!["lp", "hd", c, "--id", "cholesky"]),
        ("lp forecast",       vec!["lp", "forecast", c, "--horizons", "6"]),
        // Factor
        ("factor est static", vec!["factor", "estimate", "static", c, "--criterion", "ic1"]),
        ("factor est dynamic", vec!["factor", "estimate", "dynamic", c, "--factor-lags", "1", "--method", "twostep"]),
        ("factor est gdfm",   vec!["factor", "estimate", "gdfm", c]),
        ("factor forecast",   vec!["factor", "forecast", c, "--horizon", "6", "--ci-method", "none"]),
        // Tests
        ("test adf",          vec!["test", "adf", c, "--column", "2", "--trend", "constant"]),
        ("test kpss",         vec!["test", "kpss", c, "--column", "2", "--trend", "constant"]),
        ("test pp",           vec!["test", "pp", c, "--column", "2", "--trend", "constant"]),
        ("test za",           vec!["test", "za", c, "--column", "2", "--trend", "both", "--trim", "0.15"]),
        ("test np",           vec!["test", "np", c, "--column", "2", "--trend", "constant"]),
        ("test johansen",     vec!["test", "johansen", c, "--lags", "2", "--trend", "constant"]),
        // GMM
        ("gmm estimate",      vec!["gmm", "estimate", c, "--weighting", "twostep"]),
        // ARIMA
        ("arima estimate",    vec!["arima", "estimate", c, "--column", "2", "--p", "1", "--d", "0", "--q", "0", "--method", "css_mle"]),
        ("arima est auto",    vec!["arima", "estimate", c, "--column", "2", "--d", "0", "--q", "0", "--method", "css_mle", "--max-p", "3", "--max-d", "1", "--max-q", "3", "--criterion", "bic"]),
        ("arima forecast",    vec!["arima", "forecast", c, "--column", "2", "--d", "0", "--q", "0", "--horizons", "6", "--confidence", "0.95", "--method", "css_mle", "--p", "1"]),
        // Non-Gaussian SVAR
        ("ng fastica",        vec!["nongaussian", "fastica", c, "--lags", "2", "--method", "fastica", "--contrast", "logcosh"]),
        ("ng ml",             vec!["nongaussian", "ml", c, "--lags", "2", "--distribution", "student_t"]),
        ("ng heterosked",     vec!["nongaussian", "heteroskedasticity", c, "--lags", "2", "--method", "markov", "--regimes", "2"]),
        ("ng normality",      vec!["nongaussian", "normality", c, "--lags", "2"]),
        ("ng identifiability", vec!["nongaussian", "identifiability", c, "--lags", "2", "--test", "all", "--method", "fastica", "--contrast", "logcosh"]),
    ];

    let mut failures = Vec::new();

    for (label, args) in &commands {
        eprintln!("\n--- Running: {label} ---");
        let output = run_friedman(args);
        let result = classify(&output);

        match &result {
            RunResult::Success(_) => {
                eprintln!("  [PASS] {label}: success");
            }
            RunResult::ComputationalError { code, stderr } => {
                eprintln!("  [PASS] {label}: computational error (exit {code}), args accepted");
                if !stderr.is_empty() {
                    eprintln!("  stderr: {}", &stderr[..stderr.len().min(200)]);
                }
            }
            RunResult::NoJsonOutput { .. } => {
                eprintln!("  [PASS] {label}: exit 0, no JSON (args accepted)");
            }
            RunResult::ArgParseError { stderr } => {
                eprintln!("  [FAIL] {label}: ARG PARSE ERROR");
                eprintln!("  stderr: {stderr}");
                failures.push(format!("{label}: {}", &stderr[..stderr.len().min(200)]));
            }
        }
    }

    if !failures.is_empty() {
        panic!(
            "\n\n=== {} COMMAND(S) HAD ARG PARSE ERRORS ===\n{}\n\n\
            These commands are building arguments that don't match\n\
            the real Friedman-cli interface. Fix the Rust commands.\n",
            failures.len(),
            failures.join("\n")
        );
    }
}

/// Strict smoke test — all non-Bayesian, non-GMM, non-LP-IV commands must
/// produce exit 0 + valid JSON.
#[test]
#[ignore]
fn test_smoke_strict() {
    let csv = test_csv();
    let c = csv.to_str().unwrap();

    // Commands that should produce valid JSON with the large test fixture.
    // Excludes: GMM (needs config TOML), LP IV (needs instruments), BVAR (slow).
    let commands: Vec<(&str, Vec<&str>)> = vec![
        ("var estimate",      vec!["var", "estimate", c, "--lags", "2", "--trend", "constant"]),
        ("var lagselect",     vec!["var", "lagselect", c, "--max-lags", "8", "--criterion", "aic"]),
        ("var stability",     vec!["var", "stability", c, "--lags", "2"]),
        ("var irf",           vec!["var", "irf", c, "--shock", "1", "--horizons", "10", "--id", "cholesky", "--ci", "none", "--replications", "100", "--lags", "2"]),
        ("var fevd",          vec!["var", "fevd", c, "--horizons", "10", "--id", "cholesky", "--lags", "2"]),
        ("var hd",            vec!["var", "hd", c, "--id", "cholesky", "--lags", "2"]),
        ("var forecast",      vec!["var", "forecast", c, "--horizons", "12", "--confidence", "0.95", "--lags", "2"]),
        ("lp estimate std",   vec!["lp", "estimate", c, "--method", "standard", "--shock", "1", "--horizons", "10", "--control-lags", "4", "--vcov", "newey_west"]),
        ("lp estimate smooth", vec!["lp", "estimate", c, "--method", "smooth", "--shock", "1", "--horizons", "10", "--control-lags", "4", "--vcov", "newey_west", "--knots", "3", "--lambda", "0"]),
        ("lp estimate state", vec!["lp", "estimate", c, "--method", "state", "--shock", "1", "--horizons", "10", "--control-lags", "4", "--vcov", "newey_west", "--gamma", "1.5", "--transition", "logistic"]),
        ("lp estimate propensity", vec!["lp", "estimate", c, "--method", "propensity", "--shock", "1", "--horizons", "10", "--control-lags", "4", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit"]),
        ("lp estimate robust", vec!["lp", "estimate", c, "--method", "robust", "--shock", "1", "--horizons", "10", "--control-lags", "4", "--vcov", "newey_west", "--treatment", "1", "--score-method", "logit"]),
        ("lp irf",            vec!["lp", "irf", c, "--shocks", "1,2", "--horizons", "10", "--id", "cholesky"]),
        ("factor est static", vec!["factor", "estimate", "static", c, "--nfactors", "2", "--criterion", "ic1"]),
        ("factor est dynamic", vec!["factor", "estimate", "dynamic", c, "--factor-lags", "1", "--method", "twostep"]),
        ("factor est gdfm",   vec!["factor", "estimate", "gdfm", c]),
        ("test adf",          vec!["test", "adf", c, "--column", "2", "--trend", "constant"]),
        ("test kpss",         vec!["test", "kpss", c, "--column", "2", "--trend", "constant"]),
        ("test pp",           vec!["test", "pp", c, "--column", "2", "--trend", "constant"]),
        ("test za",           vec!["test", "za", c, "--column", "2", "--trend", "both", "--trim", "0.15"]),
        ("test np",           vec!["test", "np", c, "--column", "2", "--trend", "constant"]),
        ("test johansen",     vec!["test", "johansen", c, "--lags", "2", "--trend", "constant"]),
        ("arima estimate",    vec!["arima", "estimate", c, "--column", "2", "--p", "1", "--d", "0", "--q", "0", "--method", "css_mle"]),
        ("arima est auto",    vec!["arima", "estimate", c, "--column", "2", "--d", "0", "--q", "0", "--method", "css_mle", "--max-p", "3", "--max-d", "1", "--max-q", "3", "--criterion", "bic"]),
        ("arima forecast",    vec!["arima", "forecast", c, "--column", "2", "--p", "1", "--d", "0", "--q", "0", "--horizons", "12", "--confidence", "0.95", "--method", "css_mle"]),
        ("factor forecast",   vec!["factor", "forecast", c, "--nfactors", "2", "--horizon", "6", "--ci-method", "none"]),
        ("ng fastica",        vec!["nongaussian", "fastica", c, "--lags", "2", "--method", "fastica", "--contrast", "logcosh"]),
        ("ng ml",             vec!["nongaussian", "ml", c, "--lags", "2", "--distribution", "student_t"]),
        ("ng normality",      vec!["nongaussian", "normality", c, "--lags", "2"]),
        ("ng identifiability", vec!["nongaussian", "identifiability", c, "--lags", "2", "--test", "all", "--method", "fastica", "--contrast", "logcosh"]),
    ];

    let mut failures = Vec::new();

    for (label, args) in &commands {
        eprintln!("\n--- Running (strict): {label} ---");
        let output = run_friedman(args);
        let result = classify(&output);

        match &result {
            RunResult::Success(json) => {
                eprintln!("  [PASS] {label}: success, JSON keys: {:?}",
                    json.as_object().map(|o| o.keys().collect::<Vec<_>>()));
            }
            RunResult::ComputationalError { code, stderr } => {
                eprintln!("  [FAIL] {label}: runtime error (exit {code})");
                let msg = &stderr[..stderr.len().min(300)];
                eprintln!("  stderr: {msg}");
                failures.push(format!("{label}: exit {code} — {msg}"));
            }
            RunResult::NoJsonOutput { stdout } => {
                eprintln!("  [FAIL] {label}: no JSON in stdout");
                let msg = &stdout[..stdout.len().min(300)];
                eprintln!("  stdout: {msg}");
                failures.push(format!("{label}: no JSON output"));
            }
            RunResult::ArgParseError { stderr } => {
                eprintln!("  [FAIL] {label}: ARG PARSE ERROR");
                eprintln!("  stderr: {stderr}");
                failures.push(format!("{label}: arg parse — {}", &stderr[..stderr.len().min(200)]));
            }
        }
    }

    if !failures.is_empty() {
        panic!(
            "\n\n=== {} COMMAND(S) FAILED (strict) ===\n{}\n\n\
            These commands must exit 0 and produce valid JSON.\n\
            Fix the sidecar or the Rust commands.\n",
            failures.len(),
            failures.join("\n")
        );
    }
}
