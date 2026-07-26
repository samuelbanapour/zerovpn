use tauri::State;

use crate::config::servers::{ServerConfig, ServerStore};

/// List all saved servers (persisted to disk).
#[tauri::command]
pub fn list_servers(store: State<'_, ServerStore>) -> Result<Vec<ServerConfig>, String> {
    Ok(store.get_servers())
}

/// Add a new server configuration manually (no .conf file).
#[tauri::command]
pub fn add_server(
    name: String,
    endpoint: String,
    public_key: String,
    address: String,
    dns: Option<String>,
    store: State<'_, ServerStore>,
) -> Result<ServerConfig, String> {
    log::info!("Adding server: {} ({})", name, endpoint);

    let server = ServerConfig {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        address,
        port: endpoint
            .split(':')
            .last()
            .and_then(|p| p.parse().ok())
            .unwrap_or(51820),
        public_key,
        endpoint,
        dns,
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: None,
        country_name: None,
        city: None,
        built_in: false,
    };

    store.add_server(server.clone());
    Ok(server)
}

/// Update an existing server configuration.
#[tauri::command]
pub fn update_server(
    id: String,
    name: Option<String>,
    endpoint: Option<String>,
    public_key: Option<String>,
    address: Option<String>,
    dns: Option<String>,
    store: State<'_, ServerStore>,
) -> Result<ServerConfig, String> {
    log::info!("Updating server: {}", id);

    store
        .update_server(&id, |s| {
            if let Some(v) = name {
                s.name = v;
            }
            if let Some(v) = endpoint {
                s.endpoint = v;
            }
            if let Some(v) = public_key {
                s.public_key = v;
            }
            if let Some(v) = address {
                s.address = v;
            }
            s.dns = dns.clone();
        })
        .ok_or_else(|| format!("Server '{}' not found", id))
}

/// Remove a server by ID.
#[tauri::command]
pub fn remove_server(id: String, store: State<'_, ServerStore>) -> Result<(), String> {
    log::info!("Removing server: {}", id);
    store.remove_server(&id);
    Ok(())
}

/// Import a WireGuard .conf file and add it as a server.
#[tauri::command]
pub async fn import_conf(path: String, store: State<'_, ServerStore>) -> Result<ServerConfig, String> {
    log::info!("Importing config from: {}", path);

    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Cannot read {}: {}", path, e))?;

    let wg = crate::vpn::config::parse_conf(&content)?;

    // Derive a display name from the file stem.
    let name = std::path::Path::new(&path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Imported Server")
        .to_string();

    let server = ServerConfig {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        address: wg.interface.address.first().cloned().unwrap_or_default(),
        port: wg
            .peer
            .endpoint
            .split(':')
            .last()
            .and_then(|p| p.parse().ok())
            .unwrap_or(51820),
        public_key: wg.peer.public_key.clone(),
        endpoint: wg.peer.endpoint.clone(),
        dns: wg
            .interface
            .dns
            .as_deref()
            .and_then(|d| d.first())
            .cloned(),
        allowed_ips: wg.peer.allowed_ips.clone(),
        last_connected: None,
        latency_ms: None,
        private_key: Some(wg.interface.private_key.clone()),
        favorite: false,
        country: None,
        country_name: None,
        city: None,
        built_in: false,
    };

    store.add_server(server.clone());
    Ok(server)
}

/// Toggle favorite status for a server.
#[tauri::command]
pub fn toggle_favorite(id: String, store: State<'_, ServerStore>) -> Result<ServerConfig, String> {
    store
        .toggle_favorite(&id)
        .ok_or_else(|| format!("Server '{}' not found", id))
}

/// Get app settings.
#[tauri::command]
pub fn get_settings(store: State<'_, crate::config::store::AppSettings>) -> Result<crate::config::store::AppSettings, String> {
    // `State<T>` itself is `Clone` (it's a cheap reference wrapper), so a bare
    // `store.clone()` would clone the wrapper, not the inner settings. Deref
    // explicitly to clone the `AppSettings` value.
    Ok(store.inner().clone())
}

/// Save app settings.
#[tauri::command]
pub async fn save_settings(
    settings: crate::config::store::AppSettings,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    crate::config::store::save_settings(&app_handle, &settings)
        .map_err(|e| format!("Failed to save settings: {}", e))
}

/// Fetch community servers from a URL.
#[tauri::command]
pub async fn fetch_community_servers(
    url: String,
    store: State<'_, ServerStore>,
) -> Result<Vec<ServerConfig>, String> {
    let servers = crate::vpn::servers::community::fetch_community_servers(&url).await?;
    for s in &servers {
        store.add_server(s.clone());
    }
    Ok(servers)
}
