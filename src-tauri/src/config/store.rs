use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub start_on_boot: bool,
    pub minimize_to_tray: bool,
    pub kill_switch: bool,
    pub auto_connect: bool,
    pub dns_servers: Vec<String>,
    pub mtu: u32,
    pub last_used_server: Option<String>,
    pub theme: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            start_on_boot: false,
            minimize_to_tray: true,
            kill_switch: false,
            auto_connect: false,
            dns_servers: vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()],
            mtu: 1420,
            last_used_server: None,
            theme: "dark".to_string(),
        }
    }
}

static mut SETTINGS: Option<AppSettings> = None;

fn get_config_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let config_dir = app_handle
        .path()
        .app_config_dir()
        .expect("Failed to get app config dir");
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("settings.json")
}

/// Initialize the settings store. Called once at startup.
pub fn init_store(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let path = get_config_path(app_handle);
    let settings = if path.exists() {
        let data = fs::read_to_string(&path)?;
        serde_json::from_str(&data)?
    } else {
        let settings = AppSettings::default();
        let data = serde_json::to_string_pretty(&settings)?;
        fs::write(&path, data)?;
        settings
    };

    unsafe {
        SETTINGS = Some(settings);
    }

    Ok(())
}

/// Get current app settings.
pub fn get_settings() -> AppSettings {
    unsafe { SETTINGS.clone().unwrap_or_default() }
}

/// Save app settings to disk.
pub fn save_settings(
    app_handle: &tauri::AppHandle,
    settings: &AppSettings,
) -> Result<(), Box<dyn std::error::Error>> {
    let path = get_config_path(app_handle);
    let data = serde_json::to_string_pretty(settings)?;
    fs::write(&path, data)?;

    unsafe {
        SETTINGS = Some(settings.clone());
    }

    Ok(())
}
