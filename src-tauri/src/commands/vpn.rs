use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnStatus {
    pub connected: bool,
    pub server_id: Option<String>,
    pub server_name: Option<String>,
    pub local_ip: Option<String>,
    pub public_ip: Option<String>,
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub connected_since: Option<u64>,
}

impl Default for VpnStatus {
    fn default() -> Self {
        Self {
            connected: false,
            server_id: None,
            server_name: None,
            local_ip: None,
            public_ip: None,
            bytes_sent: 0,
            bytes_received: 0,
            connected_since: None,
        }
    }
}

/// Connect to a VPN server by ID.
/// TODO: Wire up real WireGuard tunnel management.
#[tauri::command]
pub fn connect_vpn(server_id: String) -> Result<VpnStatus, String> {
    log::info!("Connecting to server: {}", server_id);

    // Stub: return a mock connected status
    Ok(VpnStatus {
        connected: true,
        server_id: Some(server_id.clone()),
        server_name: Some(format!("Server {}", server_id)),
        local_ip: Some("10.0.0.2".to_string()),
        public_ip: Some("203.0.113.42".to_string()),
        bytes_sent: 0,
        bytes_received: 0,
        connected_since: Some(current_timestamp()),
    })
}

/// Disconnect from the current VPN.
/// TODO: Wire up real WireGuard tunnel teardown.
#[tauri::command]
pub fn disconnect_vpn() -> Result<VpnStatus, String> {
    log::info!("Disconnecting VPN");

    // Stub: return disconnected status
    Ok(VpnStatus::default())
}

/// Get the current VPN connection status.
/// TODO: Wire up real status polling from WireGuard interface.
#[tauri::command]
pub fn get_vpn_status() -> Result<VpnStatus, String> {
    Ok(VpnStatus::default())
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
