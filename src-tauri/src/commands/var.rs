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

fn default_trend() -> String {
    "constant".into()
}

fn default_max_lags() -> u32 {
    12
}

fn default_criterion() -> String {
    "aic".into()
}

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
        "var",
        "lagselect",
        &params.data,
        "--max-lags",
        &max_lags,
        "--criterion",
        &params.criterion,
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
