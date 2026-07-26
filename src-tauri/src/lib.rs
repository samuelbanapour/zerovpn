mod commands;
mod config;
mod utils;
mod vpn;

use std::sync::Mutex;

use crate::vpn::tunnel::ActiveTunnel;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Build a multi-threaded Tokio runtime that the async Tauri commands will
    // use for the WireGuard pump loop tasks.
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to build Tokio runtime");

    let _enter = rt.enter();

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        // Register the active-tunnel mutex so Tauri can inject it into commands.
        .manage(Mutex::<Option<ActiveTunnel>>::new(None))
        .invoke_handler(tauri::generate_handler![
            // VPN tunnel commands
            commands::vpn::connect_vpn,
            commands::vpn::disconnect_vpn,
            commands::vpn::get_vpn_status,
            // Server config commands
            commands::config::list_servers,
            commands::config::add_server,
            commands::config::update_server,
            commands::config::remove_server,
            commands::config::import_conf,
            commands::config::toggle_favorite,
            commands::config::get_settings,
            commands::config::save_settings,
            commands::config::fetch_community_servers,
            // System info
            commands::system::get_system_info,
        ])
        .setup(|app| {
            // Initialise settings store from disk.
            let app_handle = app.handle().clone();
            config::store::init_store(&app_handle)?;

            // Initialise server store from disk (seeds built-in servers if empty).
            config::servers::init_store(&app_handle)?;

            Ok(())
        })
        // Drive the Tauri event loop inside our Tokio runtime so async commands work.
        .run(tauri::generate_context!())
        .expect("error while running ZeroVPN");

    // Keep the runtime alive until after `run()` returns (app quit).
    drop(rt);
}
