use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::config::servers::ServerStore;
use crate::vpn::config::{InterfaceConfig, PeerConfig};
use crate::vpn::tunnel::ActiveTunnel;
use crate::vpn::wireguard::start_tunnel;

// ---------------------------------------------------------------------------
// Shared state type
// ---------------------------------------------------------------------------

/// Global tunnel state managed by Tauri.
/// Registered via `.manage(TunnelState::default())` in `lib.rs`.
pub type TunnelState = Mutex<Option<ActiveTunnel>>;

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

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

impl VpnStatus {
    fn from_active(t: &ActiveTunnel) -> Self {
        Self {
            connected: true,
            server_id: Some(t.server_id.clone()),
            server_name: Some(t.server_name.clone()),
            local_ip: Some(t.local_ip.clone()),
            public_ip: None, // Fetched separately via pub_ip()
            bytes_sent: t.bytes_sent(),
            bytes_received: t.bytes_received(),
            connected_since: Some(t.connected_since),
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Fetch the current public IP via an external API.
async fn fetch_public_ip() -> Option<String> {
    use reqwest::Client;
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .ok()?;

    for url in &[
        "https://api.ipify.org",
        "https://ifconfig.me/ip",
        "https://icanhazip.com",
    ] {
        match client.get(*url).send().await {
            Ok(resp) => {
                if let Ok(ip) = resp.text().await {
                    let ip = ip.trim().to_string();
                    if !ip.is_empty() {
                        return Some(ip);
                    }
                }
            }
            Err(_) => continue,
        }
    }
    None
}

// ---------------------------------------------------------------------------
// connect_vpn
// ---------------------------------------------------------------------------

/// Connect to a VPN server by its stored ID.
#[tauri::command]
pub async fn connect_vpn(
    server_id: String,
    tunnel_state: State<'_, TunnelState>,
    server_store: State<'_, ServerStore>,
) -> Result<VpnStatus, String> {
    log::info!("connect_vpn: server_id={}", server_id);

    // Tear down any existing tunnel before starting a new one.
    {
        let mut guard = tunnel_state.lock().unwrap();
        if let Some(existing) = guard.take() {
            existing.shutdown();
        }
    }

    // Look up the saved server configuration.
    let server = server_store
        .get_server(&server_id)
        .ok_or_else(|| format!("Server '{}' not found", server_id))?;

    let private_key = server
        .private_key
        .as_deref()
        .ok_or("Server has no private key — import its .conf file first")?
        .to_string();

    let iface_cfg = InterfaceConfig {
        private_key,
        address: vec![server.address.clone()],
        dns: server.dns.as_deref().map(|d| vec![d.to_string()]),
        mtu: None,
        table: None,
        pre_up: None,
        post_up: None,
        pre_down: None,
        post_down: None,
        android_fd: None,
    };

    let peer_cfg = PeerConfig {
        public_key: server.public_key.clone(),
        preshared_key: None,
        allowed_ips: server.allowed_ips.clone(),
        endpoint: server.endpoint.clone(),
        persistent_keepalive: Some(25),
    };

    // Start the real WireGuard tunnel.
    let tunnel = start_tunnel(&server.id, &server.name, &iface_cfg, &peer_cfg)
        .await
        .map_err(|e| e.to_string())?;

    let mut status = VpnStatus::from_active(&tunnel);

    // Fetch public IP asynchronously.
    let public_ip = fetch_public_ip().await;
    status.public_ip = public_ip;

    // Record last connected time.
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    server_store.set_last_connected(&server_id, now);

    // Store the active tunnel in shared state.
    *tunnel_state.lock().unwrap() = Some(tunnel);

    Ok(status)
}

// ---------------------------------------------------------------------------
// disconnect_vpn
// ---------------------------------------------------------------------------

/// Gracefully tear down the active WireGuard tunnel.
#[tauri::command]
pub async fn disconnect_vpn(state: State<'_, TunnelState>) -> Result<VpnStatus, String> {
    log::info!("disconnect_vpn: tearing down tunnel");

    let mut guard = state.lock().unwrap();
    if let Some(tunnel) = guard.take() {
        tunnel.shutdown();
    } else {
        log::warn!("disconnect_vpn called but no tunnel is active");
    }

    Ok(VpnStatus::default())
}

// ---------------------------------------------------------------------------
// get_vpn_status
// ---------------------------------------------------------------------------

/// Poll the current VPN status and live traffic byte counters.
#[tauri::command]
pub fn get_vpn_status(state: State<'_, TunnelState>) -> Result<VpnStatus, String> {
    let guard = state.lock().unwrap();
    match guard.as_ref() {
        Some(tunnel) => Ok(VpnStatus::from_active(tunnel)),
        None => Ok(VpnStatus::default()),
    }
}
