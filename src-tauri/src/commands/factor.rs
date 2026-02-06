use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct FactorStaticParams {
    pub data: String,
    #[serde(default)]
    pub nfactors: Option<u32>,
    #[serde(default = "default_criterion")]
    pub criterion: String,
}

#[derive(Debug, Deserialize)]
pub struct FactorDynamicParams {
    pub data: String,
    #[serde(default)]
    pub nfactors: Option<u32>,
    #[serde(default = "default_factor_lags")]
    pub factor_lags: u32,
    #[serde(default = "default_method")]
    pub method: String,
}

#[derive(Debug, Deserialize)]
pub struct FactorGdfmParams {
    pub data: String,
    #[serde(default)]
    pub nfactors: Option<u32>,
    #[serde(default)]
    pub dynamic_rank: Option<u32>,
}

fn default_criterion() -> String { "ic1".into() }
fn default_factor_lags() -> u32 { 1 }
fn default_method() -> String { "twostep".into() }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman factor static <data> [--nfactors N] [--criterion ic1]`
#[tauri::command]
pub async fn factor_static(
    app: AppHandle,
    params: FactorStaticParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["factor", "static", &params.data];

    let nf_str;
    if let Some(nf) = params.nfactors {
        nf_str = nf.to_string();
        args.push("--nfactors");
        args.push(&nf_str);
    }

    args.push("--criterion");
    args.push(&params.criterion);

    run_friedman_command(&app, args).await
}

/// `friedman factor dynamic <data> [--nfactors N] [--factor-lags N] [--method twostep]`
#[tauri::command]
pub async fn factor_dynamic(
    app: AppHandle,
    params: FactorDynamicParams,
) -> Result<serde_json::Value, FriedmanError> {
    let fl = params.factor_lags.to_string();

    let mut args = vec!["factor", "dynamic", &params.data];

    let nf_str;
    if let Some(nf) = params.nfactors {
        nf_str = nf.to_string();
        args.push("--nfactors");
        args.push(&nf_str);
    }

    args.push("--factor-lags");
    args.push(&fl);
    args.push("--method");
    args.push(&params.method);

    run_friedman_command(&app, args).await
}

/// `friedman factor gdfm <data> [--nfactors N] [--dynamic-rank N]`
#[tauri::command]
pub async fn factor_gdfm(
    app: AppHandle,
    params: FactorGdfmParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["factor", "gdfm", &params.data];

    let nf_str;
    if let Some(nf) = params.nfactors {
        nf_str = nf.to_string();
        args.push("--nfactors");
        args.push(&nf_str);
    }

    let dr_str;
    if let Some(dr) = params.dynamic_rank {
        dr_str = dr.to_string();
        args.push("--dynamic-rank");
        args.push(&dr_str);
    }

    run_friedman_command(&app, args).await
}
