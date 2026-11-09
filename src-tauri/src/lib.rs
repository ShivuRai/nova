pub mod commands;
pub mod database;
pub mod system;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = database::Database::init().expect("failed to initialize sqlite database");
    let monitor = system::SystemMonitor::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(db)
        .manage(monitor)
        .setup(|app| {
            if let Some(window) = app.get_webview_window("island") {
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let screen_size = monitor.size();
                    let scale_factor = monitor.scale_factor();
                    let window_logical_width = 740.0;
                    let screen_logical_width = screen_size.width as f64 / scale_factor;
                    let x = (screen_logical_width - window_logical_width) / 2.0;
                    let y = 0.0;
                    let _ = window.set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)));
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_system_metrics,
            commands::save_setting,
            commands::get_setting,
            commands::set_island_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
