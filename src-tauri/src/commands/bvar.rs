use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

#[derive(Debug, Deserialize)]
pub struct BvarEstimateParams {
    pub data: String,
    #[serde(default = "default_lags")]
    pub lags: u32,
    #[serde(default = "default_prior")]
    pub prior: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct BvarPosteriorParams {
    pub data: String,
    #[serde(default = "default_lags")]
    pub lags: u32,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default = "default_method")]
    pub method: String,
    #[serde(default)]
    pub config: String,
}

fn default_lags() -> u32 { 4 }
fn default_prior() -> String { "minnesota".into() }
fn default_draws() -> u32 { 2000 }
fn default_sampler() -> String { "nuts".into() }
fn default_method() -> String { "mean".into() }

/// `friedman bvar estimate <data> [--lags N] [--prior minnesota] [--draws N] [--sampler nuts] [--config path]`
#[tauri::command]
pub async fn bvar_estimate(
    app: AppHandle,
    params: BvarEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let lags = params.lags.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "estimate", &params.data,
        "--lags", &lags,
        "--prior", &params.prior,
        "--draws", &draws,
        "--sampler", &params.sampler,
    ];

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman bvar posterior <data> [--lags N] [--draws N] [--sampler nuts] [--method mean]`
#[tauri::command]
pub async fn bvar_posterior(
    app: AppHandle,
    params: BvarPosteriorParams,
) -> Result<serde_json::Value, FriedmanError> {
    let lags = params.lags.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "posterior", &params.data,
        "--lags", &lags,
        "--draws", &draws,
        "--sampler", &params.sampler,
        "--method", &params.method,
    ];

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}
