use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI v0.1.3
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct FactorEstimateParams {
    pub data: String,
    pub model_type: String, // static|dynamic|gdfm
    #[serde(default)]
    pub nfactors: Option<u32>,
    // static-specific
    #[serde(default)]
    pub criterion: Option<String>,
    // dynamic-specific
    #[serde(default)]
    pub factor_lags: Option<u32>,
    #[serde(default)]
    pub method: Option<String>,
    // gdfm-specific
    #[serde(default)]
    pub dynamic_rank: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct FactorForecastParams {
    pub data: String,
    #[serde(default)]
    pub nfactors: Option<u32>,
    #[serde(default = "default_horizon")]
    pub horizon: u32,
    #[serde(default = "default_ci_method")]
    pub ci_method: String,
    #[serde(default = "default_conf_level")]
    pub conf_level: f64,
    #[serde(default)]
    pub model: Option<String>, // static|dynamic|gdfm
    #[serde(default)]
    pub factor_lags: Option<u32>,
    #[serde(default)]
    pub method: Option<String>,
    #[serde(default)]
    pub dynamic_rank: Option<u32>,
}

fn default_horizon() -> u32 { 12 }
fn default_ci_method() -> String { "none".into() }
fn default_conf_level() -> f64 { 0.95 }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman factor estimate static|dynamic|gdfm <data> [model-specific opts]`
#[tauri::command]
pub async fn factor_estimate(
    app: AppHandle,
    params: FactorEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["factor", "estimate", &params.model_type, &params.data];

    let nf_str;
    if let Some(nf) = params.nfactors {
        nf_str = nf.to_string();
        args.push("--nfactors");
        args.push(&nf_str);
    }

    if let Some(ref criterion) = params.criterion {
        args.push("--criterion");
        args.push(criterion);
    }

    let fl_str;
    if let Some(fl) = params.factor_lags {
        fl_str = fl.to_string();
        args.push("--factor-lags");
        args.push(&fl_str);
    }

    if let Some(ref method) = params.method {
        args.push("--method");
        args.push(method);
    }

    let dr_str;
    if let Some(dr) = params.dynamic_rank {
        dr_str = dr.to_string();
        args.push("--dynamic-rank");
        args.push(&dr_str);
    }

    run_friedman_command(&app, args).await
}

/// `friedman factor forecast <data> [--nfactors N] [--horizon N] [--ci-method none] [--conf-level F] [--model static|dynamic|gdfm] [model-specific opts]`
#[tauri::command]
pub async fn factor_forecast(
    app: AppHandle,
    params: FactorForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let horizon = params.horizon.to_string();
    let conf_level = params.conf_level.to_string();

    let mut args = vec!["factor", "forecast", &params.data];

    let nf_str;
    if let Some(nf) = params.nfactors {
        nf_str = nf.to_string();
        args.push("--nfactors");
        args.push(&nf_str);
    }

    args.push("--horizon");
    args.push(&horizon);
    args.push("--ci-method");
    args.push(&params.ci_method);
    args.push("--conf-level");
    args.push(&conf_level);

    if let Some(ref model) = params.model {
        args.push("--model");
        args.push(model);
    }

    let fl_str;
    if let Some(fl) = params.factor_lags {
        fl_str = fl.to_string();
        args.push("--factor-lags");
        args.push(&fl_str);
    }

    if let Some(ref method) = params.method {
        args.push("--method");
        args.push(method);
    }

    let dr_str;
    if let Some(dr) = params.dynamic_rank {
        dr_str = dr.to_string();
        args.push("--dynamic-rank");
        args.push(&dr_str);
    }

    run_friedman_command(&app, args).await
}
