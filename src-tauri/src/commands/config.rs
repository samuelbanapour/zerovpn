use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub id: String,
    pub name: String,
    pub address: String,
    pub port: u16,
    pub public_key: String,
    pub endpoint: String,
    pub dns: Option<String>,
    pub allowed_ips: Vec<String>,
    pub last_connected: Option<u64>,
    pub latency_ms: Option<u32>,
}

/// List all saved servers.
#[tauri::command]
pub fn list_servers() -> Result<Vec<ServerConfig>, String> {
    // Stub: return sample servers
    Ok(vec![
        ServerConfig {
            id: "srv-001".to_string(),
            name: "US East (Virginia)".to_string(),
            address: "10.0.0.2/32".to_string(),
            port: 51820,
            public_key: "SamplePublicKey1==".to_string(),
            endpoint: "us-east.example.com".to_string(),
            dns: Some("1.1.1.1".to_string()),
            allowed_ips: vec!["0.0.0.0/0".to_string()],
            last_connected: None,
            latency_ms: Some(42),
        },
        ServerConfig {
            id: "srv-002".to_string(),
            name: "EU West (Amsterdam)".to_string(),
            address: "10.0.0.3/32".to_string(),
            port: 51820,
            public_key: "SamplePublicKey2==".to_string(),
            endpoint: "eu-west.example.com".to_string(),
            dns: Some("1.1.1.1".to_string()),
            allowed_ips: vec!["0.0.0.0/0".to_string()],
            last_connected: None,
            latency_ms: Some(128),
        },
        ServerConfig {
            id: "srv-003".to_string(),
            name: "Asia Pacific (Tokyo)".to_string(),
            address: "10.0.0.4/32".to_string(),
            port: 51820,
            public_key: "SamplePublicKey3==".to_string(),
            endpoint: "ap.example.com".to_string(),
            dns: Some("1.1.1.1".to_string()),
            allowed_ips: vec!["0.0.0.0/0".to_string()],
            last_connected: None,
            latency_ms: Some(185),
        },
    ])
}

/// Add a new server configuration.
#[tauri::command]
pub fn add_server(
    name: String,
    endpoint: String,
    public_key: String,
    address: String,
    dns: Option<String>,
) -> Result<ServerConfig, String> {
    log::info!("Adding server: {} ({})", name, endpoint);

    Ok(ServerConfig {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        address,
        port: 51820,
        public_key,
        endpoint,
        dns,
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        last_connected: None,
        latency_ms: None,
    })
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
) -> Result<ServerConfig, String> {
    log::info!("Updating server: {}", id);

    // Stub: return updated config
    Ok(ServerConfig {
        id: id.clone(),
        name: name.unwrap_or_else(|| "Updated Server".to_string()),
        address: address.unwrap_or_else(|| "10.0.0.2/32".to_string()),
        port: 51820,
        public_key: public_key.unwrap_or_else(|| "UpdatedKey==".to_string()),
        endpoint: endpoint.unwrap_or_else(|| "updated.example.com".to_string()),
        dns,
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        last_connected: None,
        latency_ms: None,
    })
}

/// Remove a server by ID.
#[tauri::command]
pub fn remove_server(id: String) -> Result<(), String> {
    log::info!("Removing server: {}", id);
    Ok(())
}

/// Import a WireGuard .conf file and add it as a server.
/// TODO: Parse real .conf format from file path.
#[tauri::command]
pub fn import_conf(path: String) -> Result<ServerConfig, String> {
    log::info!("Importing config from: {}", path);

    // Stub: parse would go here
    Ok(ServerConfig {
        id: uuid::Uuid::new_v4().to_string(),
        name: "Imported Server".to_string(),
        address: "10.0.0.5/32".to_string(),
        port: 51820,
        public_key: "ImportedPublicKey==".to_string(),
        endpoint: "imported.example.com".to_string(),
        dns: Some("1.1.1.1".to_string()),
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        last_connected: None,
        latency_ms: None,
    })
}
