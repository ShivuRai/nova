use crate::database::Database;
use crate::system::{SystemMetrics, SystemMonitor};
use tauri::{AppHandle, Manager, State, Window};

#[tauri::command]
pub fn get_system_metrics(monitor: State<'_, SystemMonitor>) -> Result<SystemMetrics, String> {
    Ok(monitor.get_metrics())
}

#[tauri::command]
pub fn save_setting(
    db: State<'_, Database>,
    key: String,
    value: String,
) -> Result<(), String> {
    db.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_setting(db: State<'_, Database>, key: String) -> Result<Option<String>, String> {
    db.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_island_state(
    window: Window,
    expanded: bool,
    width: f64,
    height: f64,
) -> Result<(), String> {
    // When expanding or collapsing, resize the window dynamically
    let _ = expanded;
    let new_size = tauri::LogicalSize::new(width, height);
    let _ = window.set_size(tauri::Size::Logical(new_size));
    Ok(())
}
