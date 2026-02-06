use serde::Deserialize;
use tauri::AppHandle;

use crate::error::FriedmanError;
use crate::sidecar::run_friedman_command;

// ---------------------------------------------------------------------------
// Parameter structs — matching actual CLI v0.1.3
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct ArimaEstimateParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default)]
    pub p: Option<u32>, // None = auto mode
    #[serde(default)]
    pub d: u32,
    #[serde(default)]
    pub q: u32,
    #[serde(default = "default_method")]
    pub method: String,
    // Auto-mode params (used when p is None)
    #[serde(default)]
    pub max_p: Option<u32>,
    #[serde(default)]
    pub max_d: Option<u32>,
    #[serde(default)]
    pub max_q: Option<u32>,
    #[serde(default)]
    pub criterion: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ArimaForecastParams {
    pub data: String,
    #[serde(default = "default_column")]
    pub column: u32,
    #[serde(default)]
    pub p: Option<u32>,
    #[serde(default)]
    pub d: u32,
    #[serde(default)]
    pub q: u32,
    #[serde(default = "default_horizons")]
    pub horizons: u32,
    #[serde(default = "default_confidence")]
    pub confidence: f64,
    #[serde(default = "default_method")]
    pub method: String,
}

fn default_column() -> u32 { 1 }
fn default_method() -> String { "css_mle".into() }
fn default_horizons() -> u32 { 12 }
fn default_confidence() -> f64 { 0.95 }

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// `friedman arima estimate <data> [--column N] [--p N] [--d N] [--q N] [--method css_mle]`
/// When --p is omitted, auto mode is used: `--max-p N --max-d N --max-q N --criterion bic`
#[tauri::command]
pub async fn arima_estimate(
    app: AppHandle,
    params: ArimaEstimateParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let d = params.d.to_string();
    let q = params.q.to_string();

    let mut args = vec![
        "arima", "estimate", &params.data,
        "--column", &column,
        "--d", &d,
        "--q", &q,
        "--method", &params.method,
    ];

    let p_str;
    let mp_str;
    let md_str;
    let mq_str;
    if let Some(p) = params.p {
        p_str = p.to_string();
        args.push("--p");
        args.push(&p_str);
    } else {
        // Auto mode
        if let Some(mp) = params.max_p {
            mp_str = mp.to_string();
            args.push("--max-p");
            args.push(&mp_str);
        }
        if let Some(md) = params.max_d {
            md_str = md.to_string();
            args.push("--max-d");
            args.push(&md_str);
        }
        if let Some(mq) = params.max_q {
            mq_str = mq.to_string();
            args.push("--max-q");
            args.push(&mq_str);
        }
        if let Some(ref crit) = params.criterion {
            args.push("--criterion");
            args.push(crit);
        }
    }

    run_friedman_command(&app, args).await
}

/// `friedman arima forecast <data> [--column N] [--p N] [--d N] [--q N] [--horizons N] [--confidence F] [--method css_mle]`
#[tauri::command]
pub async fn arima_forecast(
    app: AppHandle,
    params: ArimaForecastParams,
) -> Result<serde_json::Value, FriedmanError> {
    let column = params.column.to_string();
    let d = params.d.to_string();
    let q = params.q.to_string();
    let horizons = params.horizons.to_string();
    let confidence = params.confidence.to_string();

    let mut args = vec![
        "arima", "forecast", &params.data,
        "--column", &column,
        "--d", &d,
        "--q", &q,
        "--horizons", &horizons,
        "--confidence", &confidence,
        "--method", &params.method,
    ];

    let p_str;
    if let Some(p) = params.p {
        p_str = p.to_string();
        args.push("--p");
        args.push(&p_str);
    }

    run_friedman_command(&app, args).await
}
