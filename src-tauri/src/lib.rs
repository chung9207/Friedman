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
            // bvar
            commands::bvar::bvar_estimate,
            commands::bvar::bvar_posterior,
            // irf
            commands::irf::irf_compute,
            // fevd
            commands::fevd::fevd_compute,
            // hd
            commands::hd::hd_compute,
            // lp
            commands::lp::lp_estimate,
            commands::lp::lp_iv,
            commands::lp::lp_smooth,
            commands::lp::lp_state,
            commands::lp::lp_propensity,
            commands::lp::lp_multi,
            commands::lp::lp_robust,
            // factor
            commands::factor::factor_static,
            commands::factor::factor_dynamic,
            commands::factor::factor_gdfm,
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
            commands::arima::arima_auto,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Friedman");
}
