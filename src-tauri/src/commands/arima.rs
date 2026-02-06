use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ArimaEstimateParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_one")]
    pub p: u32,
    #[serde(default)]
    pub d: u32,
    #[serde(default)]
    pub q: u32,
    #[serde(default = "default_method")]
    pub method: String,
}

#[derive(Debug, Deserialize)]
pub struct ArimaAutoParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default = "default_max_order")]
    pub max_p: u32,
    #[serde(default = "default_max_diff")]
    pub max_d: u32,
    #[serde(default = "default_max_order")]
    pub max_q: u32,
    #[serde(default = "default_criterion")]
    pub criterion: String,
    #[serde(default = "default_method")]
    pub method: String,
}

#[derive(Debug, Deserialize)]
pub struct ArimaForecastParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default)]
    pub p: Option<u32>,
    #[serde(default)]
    pub d: u32,
    #[serde(default)]
    pub q: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_confidence")]
    pub confidence: f64,
    #[serde(default = "default_method")]
    pub method: String,
}

fn default_column() -> u32 { 1 }
fn default_one() -> u32 { 1 }
fn default_max_order() -> u32 { 5 }
fn default_max_diff() -> u32 { 2 }
fn default_method() -> String { "css_mle".into() }
fn default_criterion() -> String { "bic".into() }
fn default_horizons() -> u32 { 12 }
fn default_confidence() -> f64 { 0.95 }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman arima estimate <data> [--column N] [--p N] [--d N] [--q N] [--method css_mle]`
#[tauri::command]
pub async fn arima_estimate(
    app: AppHandle,
    params: ArimaEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let p = params.p.to_string();
    let d = params.d.to_string();
    let q = params.q.to_string();

    let args = vec![
        "arima", "estimate", &params.data,
        "--column", &column,
        "--p", &p,
        "--d", &d,
        "--q", &q,
        "--method", &params.method,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman arima auto <data> [--column N] [--max-p N] [--max-d N] [--max-q N] [--criterion bic] [--method css_mle]`
#[tauri::command]
pub async fn arima_auto(
    app: AppHandle,
    params: ArimaAutoParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let max_p = params.max_p.to_string();
    let max_d = params.max_d.to_string();
    let max_q = params.max_q.to_string();

    let args = vec![
        "arima", "auto", &params.data,
        "--column", &column,
        "--max-p", &max_p,
        "--max-d", &max_d,
        "--max-q", &max_q,
        "--criterion", &params.criterion,
        "--method", &params.method,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman arima forecast <data> [--column N] [--p N] [--d N] [--q N] [--horizons N] [--confidence F] [--method css_mle]`
#[tauri::command]
pub async fn arima_forecast(
    app: AppHandle,
    params: ArimaForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let d = params.d.to_string();
    let q = params.q.to_string();
    let horizons = params.horizons.to_string();
    let confidence = params.confidence.to_string();

    let mut args = vec![
        "arima", "forecast", &params.data,
        "--column", &column,
        "--d", &d,
        "--q", &q,
        "--horizons", &horizons,
        "--confidence", &confidence,
        "--method", &params.method,
    ];

    let p_str;
    if let Some(p) = params.p {
        p_str = p.to_string();
        args.push("--p");
        args.push(&p_str);
    }

    run_friedman_command(&app, args).await
}
