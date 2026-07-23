mod commands;
mod config;
mod utils;
mod vpn;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // VPN commands
            commands::vpn::connect_vpn,
            commands::vpn::disconnect_vpn,
            commands::vpn::get_vpn_status,
            // Config commands
            commands::config::list_servers,
            commands::config::add_server,
            commands::config::update_server,
            commands::config::remove_server,
            commands::config::import_conf,
            // System commands
            commands::system::get_system_info,
        ])
        .setup(|app| {
            // Initialize config store on startup
            let app_handle = app.handle().clone();
            config::store::init_store(&app_handle)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ZeroVPN");
}
