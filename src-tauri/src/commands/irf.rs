use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

#[derive(Debug, Deserialize)]
pub struct IrfComputeParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String, // cholesky|sign|narrative|longrun|arias
    #[serde(default = "default_ci")]
    pub ci: String, // none|bootstrap|theoretical
    #[serde(default = "default_replications")]
    pub replications: u32,
    #[serde(default)]
    pub bayesian: bool,
    #[serde(default)]
    pub config: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
}

fn default_shock() -> u32 { 1 }
fn default_horizons() -> u32 { 20 }
fn default_id() -> String { "cholesky".into() }
fn default_ci() -> String { "bootstrap".into() }
fn default_replications() -> u32 { 1000 }
fn default_draws() -> u32 { 2000 }
fn default_sampler() -> String { "nuts".into() }

/// `friedman irf compute <data> [--lags N] [--shock N] [--horizons N] [--id cholesky] [--ci bootstrap] [--replications N] [--bayesian] ...`
#[tauri::command]
pub async fn irf_compute(
    app: AppHandle,
    params: IrfComputeParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let replications = params.replications.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "irf", "compute", &params.data,
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
