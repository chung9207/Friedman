use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct NongaussianFasticaParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_fastica_method")]
    pub method: String,
    #[serde(default = "default_contrast")]
    pub contrast: String,
}

#[derive(Debug, Deserialize)]
pub struct NongaussianMlParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_distribution")]
    pub distribution: String,
}

#[derive(Debug, Deserialize)]
pub struct NongaussianHeteroskedasticityParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_heterosk_method")]
    pub method: String,
    #[serde(default)]
    pub config: Option<String>,
    #[serde(default = "default_regimes")]
    pub regimes: u32,
}

#[derive(Debug, Deserialize)]
pub struct NongaussianNormalityParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct NongaussianIdentifiabilityParams {
    pub data: String,
    #[serde(default)]
    pub lags: Option<u32>,
    #[serde(default = "default_test_type")]
    pub test: String,
    #[serde(default = "default_fastica_method")]
    pub method: String,
    #[serde(default = "default_contrast")]
    pub contrast: String,
}

fn default_fastica_method() -> String { "fastica".into() }
fn default_contrast() -> String { "logcosh".into() }
fn default_distribution() -> String { "student_t".into() }
fn default_heterosk_method() -> String { "markov".into() }
fn default_regimes() -> u32 { 2 }
fn default_test_type() -> String { "all".into() }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman nongaussian fastica <data> [--lags N] [--method fastica] [--contrast logcosh]`
#[tauri::command]
pub async fn nongaussian_fastica(
    app: AppHandle,
    params: NongaussianFasticaParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["nongaussian", "fastica", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    args.push("--method");
    args.push(&params.method);
    args.push("--contrast");
    args.push(&params.contrast);

    run_friedman_command(&app, args).await
}

/// `friedman nongaussian ml <data> [--lags N] [--distribution student_t]`
#[tauri::command]
pub async fn nongaussian_ml(
    app: AppHandle,
    params: NongaussianMlParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["nongaussian", "ml", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    args.push("--distribution");
    args.push(&params.distribution);

    run_friedman_command(&app, args).await
}

/// `friedman nongaussian heteroskedasticity <data> [--lags N] [--method markov] [--config FILE] [--regimes N]`
#[tauri::command]
pub async fn nongaussian_heteroskedasticity(
    app: AppHandle,
    params: NongaussianHeteroskedasticityParams,
) -> Result<serde_json::Value, FriedmanError> {
    let regimes_str = params.regimes.to_string();
    let mut args = vec!["nongaussian", "heteroskedasticity", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    args.push("--method");
    args.push(&params.method);

    if let Some(ref config) = params.config {
        args.push("--config");
        args.push(config);
    }

    args.push("--regimes");
    args.push(&regimes_str);

    run_friedman_command(&app, args).await
}

/// `friedman nongaussian normality <data> [--lags N]`
#[tauri::command]
pub async fn nongaussian_normality(
    app: AppHandle,
    params: NongaussianNormalityParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["nongaussian", "normality", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    run_friedman_command(&app, args).await
}

/// `friedman nongaussian identifiability <data> [--lags N] [--test all] [--method fastica] [--contrast logcosh]`
#[tauri::command]
pub async fn nongaussian_identifiability(
    app: AppHandle,
    params: NongaussianIdentifiabilityParams,
) -> Result<serde_json::Value, FriedmanError> {
    let mut args = vec!["nongaussian", "identifiability", &params.data];

    let lags_str;
    if let Some(lags) = params.lags {
        lags_str = lags.to_string();
        args.push("--lags");
        args.push(&lags_str);
    }

    args.push("--test");
    args.push(&params.test);
    args.push("--method");
    args.push(&params.method);
    args.push("--contrast");
    args.push(&params.contrast);

    run_friedman_command(&app, args).await
}
