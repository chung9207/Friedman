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

#[derive(Debug, Deserialize)]
pub struct BvarIrfParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct BvarFevdParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct BvarHdParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct BvarForecastParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_draws")]
    pub draws: u32,
    #[serde(default = "default_sampler")]
    pub sampler: String,
    #[serde(default)]
    pub config: String,
}

fn default_lags() -> u32 { 4 }
fn default_prior() -> String { "minnesota".into() }
fn default_draws() -> u32 { 2000 }
fn default_sampler() -> String { "nuts".into() }
fn default_method() -> String { "mean".into() }
fn default_shock() -> u32 { 1 }
fn default_horizons() -> u32 { 20 }
fn default_id() -> String { "cholesky".into() }

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

/// `friedman bvar irf <data> [--lags N] [--shock N] [--horizons N] [--id cholesky] [--draws N] [--sampler nuts] [--config path]`
#[tauri::command]
pub async fn bvar_irf(
    app: AppHandle,
    params: BvarIrfParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "irf", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--id", &params.id,
        "--draws", &draws,
        "--sampler", &params.sampler,
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

/// `friedman bvar fevd <data> [--lags N] [--horizons N] [--id cholesky] [--draws N] [--sampler nuts] [--config path]`
#[tauri::command]
pub async fn bvar_fevd(
    app: AppHandle,
    params: BvarFevdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "fevd", &params.data,
        "--horizons", &horizons,
        "--id", &params.id,
        "--draws", &draws,
        "--sampler", &params.sampler,
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

/// `friedman bvar hd <data> [--lags N] [--id cholesky] [--draws N] [--sampler nuts] [--config path]`
#[tauri::command]
pub async fn bvar_hd(
    app: AppHandle,
    params: BvarHdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "hd", &params.data,
        "--id", &params.id,
        "--draws", &draws,
        "--sampler", &params.sampler,
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

/// `friedman bvar forecast <data> [--lags N] [--horizons N] [--draws N] [--sampler nuts] [--config path]`
#[tauri::command]
pub async fn bvar_forecast(
    app: AppHandle,
    params: BvarForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();
    let draws = params.draws.to_string();

    let mut args = vec![
        "bvar", "forecast", &params.data,
        "--horizons", &horizons,
        "--draws", &draws,
        "--sampler", &params.sampler,
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
