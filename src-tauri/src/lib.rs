mod commands;
mod error;
mod sidecar;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // data
            commands::data::load_csv,
            commands::data::load_xlsx,
            commands::data::get_dataset,
            commands::data::list_datasets,
            commands::data::preview_data,
            // var
            commands::var::var_estimate,
            commands::var::var_lagselect,
            commands::var::var_stability,
            commands::var::var_irf,
            commands::var::var_fevd,
            commands::var::var_hd,
            commands::var::var_forecast,
            // bvar
            commands::bvar::bvar_estimate,
            commands::bvar::bvar_posterior,
            commands::bvar::bvar_irf,
            commands::bvar::bvar_fevd,
            commands::bvar::bvar_hd,
            commands::bvar::bvar_forecast,
            // lp
            commands::lp::lp_estimate,
            commands::lp::lp_irf,
            commands::lp::lp_fevd,
            commands::lp::lp_hd,
            commands::lp::lp_forecast,
            // factor
            commands::factor::factor_estimate,
            commands::factor::factor_forecast,
            // test
            commands::test::test_adf,
            commands::test::test_kpss,
            commands::test::test_pp,
            commands::test::test_za,
            commands::test::test_np,
            commands::test::test_johansen,
            // gmm
            commands::gmm::gmm_estimate,
            // arima
            commands::arima::arima_estimate,
            commands::arima::arima_forecast,
            // nongaussian
            commands::nongaussian::nongaussian_fastica,
            commands::nongaussian::nongaussian_ml,
            commands::nongaussian::nongaussian_heteroskedasticity,
            commands::nongaussian::nongaussian_normality,
            commands::nongaussian::nongaussian_identifiability,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Friedman");
}
