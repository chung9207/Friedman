use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

#[derive(Debug, Deserialize)]
pub struct FevdComputeParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub bayesian: bool,
    #[serde(default)]
    pub config: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
}

fn default_horizons() -> u32 { 20 }
fn default_id() -> String { "cholesky".into() }
fn default_draws() -> u32 { 2000 }
fn default_sampler() -> String { "nuts".into() }

/// `friedman fevd compute <data> [--lags N] [--horizons N] [--id cholesky] [--bayesian] ...`
#[tauri::command]
pub async fn fevd_compute(
    app: AppHandle,
    params: FevdComputeParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "fevd", "compute", &params.data,
        "--horizons", &horizons,
        "--id", &params.id,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    if params.bayesian {
        args.push("--bayesian");
        args.push("--draws");
        args.push(&draws);
        args.push("--sampler");
        args.push(&params.sampler);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}
