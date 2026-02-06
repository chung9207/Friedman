use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct LpEstimateParams {
    pub data: String,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_control_lags")]
    pub control_lags: u32,
    #[serde(default = "default_vcov")]
    pub vcov: String,
}

#[derive(Debug, Deserialize)]
pub struct LpIvParams {
    pub data: String,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default)]
    pub instruments: String, // path to instruments CSV
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_control_lags")]
    pub control_lags: u32,
    #[serde(default = "default_vcov")]
    pub vcov: String,
}

#[derive(Debug, Deserialize)]
pub struct LpSmoothParams {
    pub data: String,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_knots")]
    pub knots: u32,
    #[serde(default)]
    pub lambda: f64,
}

#[derive(Debug, Deserialize)]
pub struct LpStateParams {
    pub data: String,
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default)]
    pub state_var: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_gamma")]
    pub gamma: f64,
    #[serde(default = "default_state_method")]
    pub method: String,
}

#[derive(Debug, Deserialize)]
pub struct LpPropensityParams {
    pub data: String,
    #[serde(default = "default_treatment")]
    pub treatment: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_score_method")]
    pub score_method: String,
}

#[derive(Debug, Deserialize)]
pub struct LpMultiParams {
    pub data: String,
    #[serde(default)]
    pub shocks: String, // comma-separated indices
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_control_lags")]
    pub control_lags: u32,
    #[serde(default = "default_vcov")]
    pub vcov: String,
}

#[derive(Debug, Deserialize)]
pub struct LpRobustParams {
    pub data: String,
    #[serde(default = "default_treatment")]
    pub treatment: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_score_method")]
    pub score_method: String,
}

fn default_shock() -> u32 { 1 }
fn default_horizons() -> u32 { 20 }
fn default_control_lags() -> u32 { 4 }
fn default_vcov() -> String { "newey_west".into() }
fn default_knots() -> u32 { 3 }
fn default_gamma() -> f64 { 1.5 }
fn default_state_method() -> String { "logistic".into() }
fn default_treatment() -> u32 { 1 }
fn default_score_method() -> String { "logit".into() }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman lp estimate <data> [--shock N] [--horizons N] [--control-lags N] [--vcov newey_west]`
#[tauri::command]
pub async fn lp_estimate(
    app: AppHandle,
    params: LpEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let control_lags = params.control_lags.to_string();

    let args = vec![
        "lp", "estimate", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--control-lags", &control_lags,
        "--vcov", &params.vcov,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman lp iv <data> [--shock N] [--instruments path] [--horizons N] [--control-lags N] [--vcov ...]`
#[tauri::command]
pub async fn lp_iv(
    app: AppHandle,
    params: LpIvParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let control_lags = params.control_lags.to_string();

    let mut args = vec![
        "lp", "iv", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--control-lags", &control_lags,
        "--vcov", &params.vcov,
    ];

    if !params.instruments.is_empty() {
        args.push("--instruments");
        args.push(&params.instruments);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp smooth <data> [--shock N] [--horizons N] [--knots N] [--lambda F]`
#[tauri::command]
pub async fn lp_smooth(
    app: AppHandle,
    params: LpSmoothParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let knots = params.knots.to_string();
    let lambda = params.lambda.to_string();

    let args = vec![
        "lp", "smooth", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--knots", &knots,
        "--lambda", &lambda,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman lp state <data> [--shock N] [--state-var N] [--horizons N] [--gamma F] [--method logistic]`
#[tauri::command]
pub async fn lp_state(
    app: AppHandle,
    params: LpStateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let gamma = params.gamma.to_string();

    let mut args = vec![
        "lp", "state", &params.data,
        "--shock", &shock,
        "--horizons", &horizons,
        "--gamma", &gamma,
        "--method", &params.method,
    ];

    let sv_str;
    if let Some(sv) = params.state_var {
        sv_str = sv.to_string();
        args.push("--state-var");
        args.push(&sv_str);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp propensity <data> [--treatment N] [--horizons N] [--score-method logit]`
#[tauri::command]
pub async fn lp_propensity(
    app: AppHandle,
    params: LpPropensityParams,
) -> Result<serde_json::Value, FriedmanError> {
    let treatment = params.treatment.to_string();
    let horizons = params.horizons.to_string();

    let args = vec![
        "lp", "propensity", &params.data,
        "--treatment", &treatment,
        "--horizons", &horizons,
        "--score-method", &params.score_method,
    ];

    run_friedman_command(&app, args).await
}

/// `friedman lp multi <data> [--shocks 1,2,3] [--horizons N] [--control-lags N] [--vcov ...]`
#[tauri::command]
pub async fn lp_multi(
    app: AppHandle,
    params: LpMultiParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();
    let control_lags = params.control_lags.to_string();

    let mut args = vec![
        "lp", "multi", &params.data,
        "--horizons", &horizons,
        "--control-lags", &control_lags,
        "--vcov", &params.vcov,
    ];

    if !params.shocks.is_empty() {
        args.push("--shocks");
        args.push(&params.shocks);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp robust <data> [--treatment N] [--horizons N] [--score-method logit]`
#[tauri::command]
pub async fn lp_robust(
    app: AppHandle,
    params: LpRobustParams,
) -> Result<serde_json::Value, FriedmanError> {
    let treatment = params.treatment.to_string();
    let horizons = params.horizons.to_string();

    let args = vec![
        "lp", "robust", &params.data,
        "--treatment", &treatment,
        "--horizons", &horizons,
        "--score-method", &params.score_method,
    ];

    run_friedman_command(&app, args).await
}
