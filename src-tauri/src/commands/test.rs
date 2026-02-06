use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI (unit root & cointegration tests)
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct TestAdfParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default)]
    pub max_lags: Option<u32>,
    #[serde(default = "default_trend")]
    pub trend: String,
}

#[derive(Debug, Deserialize)]
pub struct TestKpssParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_trend")]
    pub trend: String,
}

#[derive(Debug, Deserialize)]
pub struct TestPpParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_trend")]
    pub trend: String,
}

#[derive(Debug, Deserialize)]
pub struct TestZaParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_za_trend")]
    pub trend: String,
    #[serde(default = "default_trim")]
    pub trim: f64,
}

#[derive(Debug, Deserialize)]
pub struct TestNpParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_trend")]
    pub trend: String,
}

#[derive(Debug, Deserialize)]
pub struct TestJohansenParams {
    pub data: String,
    #[serde(default = "default_lags")]
    pub lags: u32,
    #[serde(default = "default_trend")]
    pub trend: String,
}

fn default_column() -> u32 { 1 }
fn default_trend() -> String { "constant".into() }
fn default_za_trend() -> String { "both".into() }
fn default_trim() -> f64 { 0.15 }
fn default_lags() -> u32 { 2 }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman test adf <data> [--column N] [--max-lags N] [--trend constant]`
#[tauri::command]
pub async fn test_adf(
    app: AppHandle,
    params: TestAdfParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();

    let mut args = vec![
        "test", "adf", &params.data,
        "--column", &column,
        "--trend", &params.trend,
    ];

    let ml_str;
    if let Some(ml) = params.max_lags {
        ml_str = ml.to_string();
        args.push("--max-lags");
        args.push(&ml_str);
    }

    run_friedman_command(&app, args).await
}

/// `friedman test kpss <data> [--column N] [--trend constant]`
#[tauri::command]
pub async fn test_kpss(
    app: AppHandle,
    params: TestKpssParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();

    let args = vec![
        "test", "kpss", &params.data,
        "--column", &column,
        "--trend", &params.trend,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman test pp <data> [--column N] [--trend constant]`
#[tauri::command]
pub async fn test_pp(
    app: AppHandle,
    params: TestPpParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();

    let args = vec![
        "test", "pp", &params.data,
        "--column", &column,
        "--trend", &params.trend,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman test za <data> [--column N] [--trend both] [--trim 0.15]`
#[tauri::command]
pub async fn test_za(
    app: AppHandle,
    params: TestZaParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let trim = params.trim.to_string();

    let args = vec![
        "test", "za", &params.data,
        "--column", &column,
        "--trend", &params.trend,
        "--trim", &trim,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman test np <data> [--column N] [--trend constant]`
#[tauri::command]
pub async fn test_np(
    app: AppHandle,
    params: TestNpParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();

    let args = vec![
        "test", "np", &params.data,
        "--column", &column,
        "--trend", &params.trend,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman test johansen <data> [--lags N] [--trend constant]`
#[tauri::command]
pub async fn test_johansen(
    app: AppHandle,
    params: TestJohansenParams,
) -> Result<serde_json::Value, FriedmanError> {
    let lags = params.lags.to_string();

    let args = vec![
        "test", "johansen", &params.data,
        "--lags", &lags,
        "--trend", &params.trend,
    ];

    run_friedman_command(&app, args).await
}
