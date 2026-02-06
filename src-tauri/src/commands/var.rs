use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI interface
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct VarEstimateParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_trend")]
    pub trend: String, // none|constant|trend|both
}

#[derive(Debug, Deserialize)]
pub struct VarLagSelectParams {
    pub data: String,
    #[serde(default = "default_max_lags")]
    pub max_lags: u32,
    #[serde(default = "default_criterion")]
    pub criterion: String, // aic|bic|hqc
}

#[derive(Debug, Deserialize)]
pub struct VarStabilityParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct VarIrfParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default = "default_ci")]
    pub ci: String,
    #[serde(default = "default_replications")]
    pub replications: u32,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct VarFevdParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct VarHdParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct VarForecastParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_confidence")]
    pub confidence: f64,
}

fn default_trend() -> String { "constant".into() }
fn default_max_lags() -> u32 { 12 }
fn default_criterion() -> String { "aic".into() }
fn default_shock() -> u32 { 1 }
fn default_horizons() -> u32 { 20 }
fn default_id() -> String { "cholesky".into() }
fn default_ci() -> String { "bootstrap".into() }
fn default_replications() -> u32 { 1000 }
fn default_confidence() -> f64 { 0.95 }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman var estimate <data> [--lags N] [--trend constant] [--format json]`
#[tauri::command]
pub async fn var_estimate(
    app: AppHandle,
    params: VarEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["var", "estimate", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    args.push("--trend");
    args.push(&params.trend);

    run_friedman_command(&app, args).await
}

/// `friedman var lagselect <data> [--max-lags N] [--criterion aic]`
#[tauri::command]
pub async fn var_lagselect(
    app: AppHandle,
    params: VarLagSelectParams,
) -> Result<serde_json::Value, FriedmanError> {
    let max_lags = params.max_lags.to_string();

    let args = vec![
        "var", "lagselect", &params.data,
        "--max-lags", &max_lags,
        "--criterion", &params.criterion,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman var stability <data> [--lags N] [--format json]`
#[tauri::command]
pub async fn var_stability(
    app: AppHandle,
    params: VarStabilityParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["var", "stability", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    run_friedman_command(&app, args).await
}

/// `friedman var irf <data> [--lags N] [--shock N] [--horizons N] [--id cholesky] [--ci bootstrap] [--replications N] [--config path]`
#[tauri::command]
pub async fn var_irf(
    app: AppHandle,
    params: VarIrfParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let replications = params.replications.to_string();

    let mut args = vec![
        "var", "irf", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--id", &params.id,
        "--ci", &params.ci,
        "--replications", &replications,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman var fevd <data> [--lags N] [--horizons N] [--id cholesky] [--config path]`
#[tauri::command]
pub async fn var_fevd(
    app: AppHandle,
    params: VarFevdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();

    let mut args = vec![
        "var", "fevd", &params.data,
        "--horizons", &horizons,
        "--id", &params.id,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman var hd <data> [--lags N] [--id cholesky] [--config path]`
#[tauri::command]
pub async fn var_hd(
    app: AppHandle,
    params: VarHdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec![
        "var", "hd", &params.data,
        "--id", &params.id,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman var forecast <data> [--lags N] [--horizons N] [--confidence F]`
#[tauri::command]
pub async fn var_forecast(
    app: AppHandle,
    params: VarForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();
    let confidence = params.confidence.to_string();

    let mut args = vec![
        "var", "forecast", &params.data,
        "--horizons", &horizons,
        "--confidence", &confidence,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    run_friedman_command(&app, args).await
}
