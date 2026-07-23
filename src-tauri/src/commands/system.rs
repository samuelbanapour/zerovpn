use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

/// Get system information for the dashboard.
#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: "0.1.0".to_string(),
    })
}
