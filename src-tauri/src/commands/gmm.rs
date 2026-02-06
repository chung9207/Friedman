use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

#[derive(Debug, Deserialize)]
pub struct GmmEstimateParams {
    pub data: String,
    #[serde(default)]
    pub config: String,
    #[serde(default = "default_weighting")]
    pub weighting: String,
}

fn default_weighting() -> String { "twostep".into() }

/// `friedman gmm estimate <data> [--config path] [--weighting twostep]`
#[tauri::command]
pub async fn gmm_estimate(
    app: AppHandle,
    params: GmmEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec![
        "gmm", "estimate", &params.data,
        "--weighting", &params.weighting,
    ];

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}
