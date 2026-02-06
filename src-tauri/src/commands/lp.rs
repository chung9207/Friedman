use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI v0.1.3
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct LpEstimateParams {
    pub data: String,
    #[serde(default = "default_method")]
    pub method: String, // standard|iv|smooth|state|propensity|robust
    #[serde(default = "default_shock")]
    pub shock: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_control_lags")]
    pub control_lags: u32,
    #[serde(default = "default_vcov")]
    pub vcov: String,
    // iv-specific
    #[serde(default)]
    pub instruments: String,
    // smooth-specific
    #[serde(default)]
    pub knots: Option<u32>,
    #[serde(default)]
    pub lambda: Option<f64>,
    // state-specific
    #[serde(default)]
    pub state_var: Option<u32>,
    #[serde(default)]
    pub gamma: Option<f64>,
    #[serde(default)]
    pub transition: Option<String>,
    // propensity/robust
    #[serde(default)]
    pub treatment: Option<u32>,
    #[serde(default)]
    pub score_method: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LpIrfParams {
    pub data: String,
    #[serde(default)]
    pub shock: Option<u32>,
    #[serde(default)]
    pub shocks: Option<String>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default)]
    pub var_lags: Option<u32>,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub ci: Option<String>,
    #[serde(default)]
    pub replications: Option<u32>,
    #[serde(default)]
    pub conf_level: Option<f64>,
    #[serde(default)]
    pub vcov: Option<String>,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct LpFevdParams {
    pub data: String,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default)]
    pub var_lags: Option<u32>,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub vcov: Option<String>,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct LpHdParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default)]
    pub var_lags: Option<u32>,
    #[serde(default = "default_id")]
    pub id: String,
    #[serde(default)]
    pub vcov: Option<String>,
    #[serde(default)]
    pub config: String,
}

#[derive(Debug, Deserialize)]
pub struct LpForecastParams {
    pub data: String,
    #[serde(default)]
    pub shock: Option<u32>,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default)]
    pub shock_size: Option<f64>,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default)]
    pub vcov: Option<String>,
    #[serde(default)]
    pub ci_method: Option<String>,
    #[serde(default)]
    pub conf_level: Option<f64>,
    #[serde(default)]
    pub n_boot: Option<u32>,
}

fn default_method() -> String { "standard".into() }
fn default_shock() -> u32 { 1 }
fn default_horizons() -> u32 { 20 }
fn default_control_lags() -> u32 { 4 }
fn default_vcov() -> String { "newey_west".into() }
fn default_id() -> String { "cholesky".into() }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman lp estimate <data> --method=standard|iv|smooth|state|propensity|robust [method-specific args]`
#[tauri::command]
pub async fn lp_estimate(
    app: AppHandle,
    params: LpEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let shock = params.shock.to_string();
    let horizons = params.horizons.to_string();
    let control_lags = params.control_lags.to_string();

    let mut args = vec![
        "lp", "estimate", &params.data,
        "--method", &params.method,
        "--shock", &shock,
        "--horizons", &horizons,
        "--control-lags", &control_lags,
        "--vcov", &params.vcov,
    ];

    // Method-specific args
    if !params.instruments.is_empty() {
        args.push("--instruments");
        args.push(&params.instruments);
    }

    let knots_str;
    if let Some(knots) = params.knots {
        knots_str = knots.to_string();
        args.push("--knots");
        args.push(&knots_str);
    }

    let lambda_str;
    if let Some(lambda) = params.lambda {
        lambda_str = lambda.to_string();
        args.push("--lambda");
        args.push(&lambda_str);
    }

    let sv_str;
    if let Some(sv) = params.state_var {
        sv_str = sv.to_string();
        args.push("--state-var");
        args.push(&sv_str);
    }

    let gamma_str;
    if let Some(gamma) = params.gamma {
        gamma_str = gamma.to_string();
        args.push("--gamma");
        args.push(&gamma_str);
    }

    if let Some(ref transition) = params.transition {
        args.push("--transition");
        args.push(transition);
    }

    let treatment_str;
    if let Some(treatment) = params.treatment {
        treatment_str = treatment.to_string();
        args.push("--treatment");
        args.push(&treatment_str);
    }

    if let Some(ref sm) = params.score_method {
        args.push("--score-method");
        args.push(sm);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp irf <data> [--shock N] [--shocks 1,2,3] [--horizons N] [--lags N] [--var-lags N] [--id cholesky] [--ci bootstrap] [--replications N] [--vcov ...]`
#[tauri::command]
pub async fn lp_irf(
    app: AppHandle,
    params: LpIrfParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();

    let mut args = vec![
        "lp", "irf", &params.data,
        "--horizons", &horizons,
        "--id", &params.id,
    ];

    let shock_str;
    if let Some(shock) = params.shock {
        shock_str = shock.to_string();
        args.push("--shock");
        args.push(&shock_str);
    }

    if let Some(ref shocks) = params.shocks {
        args.push("--shocks");
        args.push(shocks);
    }

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    let vl_str;
    if let Some(vl) = params.var_lags {
        vl_str = vl.to_string();
        args.push("--var-lags");
        args.push(&vl_str);
    }

    if let Some(ref ci) = params.ci {
        args.push("--ci");
        args.push(ci);
    }

    let rep_str;
    if let Some(rep) = params.replications {
        rep_str = rep.to_string();
        args.push("--replications");
        args.push(&rep_str);
    }

    let cl_str;
    if let Some(cl) = params.conf_level {
        cl_str = cl.to_string();
        args.push("--conf-level");
        args.push(&cl_str);
    }

    if let Some(ref vcov) = params.vcov {
        args.push("--vcov");
        args.push(vcov);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp fevd <data> [--horizons N] [--lags N] [--var-lags N] [--id cholesky] [--vcov ...]`
#[tauri::command]
pub async fn lp_fevd(
    app: AppHandle,
    params: LpFevdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();

    let mut args = vec![
        "lp", "fevd", &params.data,
        "--horizons", &horizons,
        "--id", &params.id,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    let vl_str;
    if let Some(vl) = params.var_lags {
        vl_str = vl.to_string();
        args.push("--var-lags");
        args.push(&vl_str);
    }

    if let Some(ref vcov) = params.vcov {
        args.push("--vcov");
        args.push(vcov);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp hd <data> [--lags N] [--var-lags N] [--id cholesky] [--vcov ...]`
#[tauri::command]
pub async fn lp_hd(
    app: AppHandle,
    params: LpHdParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec![
        "lp", "hd", &params.data,
        "--id", &params.id,
    ];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    let vl_str;
    if let Some(vl) = params.var_lags {
        vl_str = vl.to_string();
        args.push("--var-lags");
        args.push(&vl_str);
    }

    if let Some(ref vcov) = params.vcov {
        args.push("--vcov");
        args.push(vcov);
    }

    if !params.config.is_empty() {
        args.push("--config");
        args.push(&params.config);
    }

    run_friedman_command(&app, args).await
}

/// `friedman lp forecast <data> [--shock N] [--horizons N] [--shock-size F] [--lags N] [--vcov ...] [--ci-method ...] [--conf-level F] [--n-boot N]`
#[tauri::command]
pub async fn lp_forecast(
    app: AppHandle,
    params: LpForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizons = params.horizons.to_string();

    let mut args = vec![
        "lp", "forecast", &params.data,
        "--horizons", &horizons,
    ];

    let shock_str;
    if let Some(shock) = params.shock {
        shock_str = shock.to_string();
        args.push("--shock");
        args.push(&shock_str);
    }

    let ss_str;
    if let Some(ss) = params.shock_size {
        ss_str = ss.to_string();
        args.push("--shock-size");
        args.push(&ss_str);
    }

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    if let Some(ref vcov) = params.vcov {
        args.push("--vcov");
        args.push(vcov);
    }

    if let Some(ref ci) = params.ci_method {
        args.push("--ci-method");
        args.push(ci);
    }

    let cl_str;
    if let Some(cl) = params.conf_level {
        cl_str = cl.to_string();
        args.push("--conf-level");
        args.push(&cl_str);
    }

    let nb_str;
    if let Some(nb) = params.n_boot {
        nb_str = nb.to_string();
        args.push("--n-boot");
        args.push(&nb_str);
    }

    run_friedman_command(&app, args).await
}
