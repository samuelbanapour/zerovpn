use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TunnelState {
    Disconnected,
    Connecting,
    Connected,
    Disconnecting,
    Error(String),
}

/// Represents a WireGuard tunnel instance.
/// TODO: Replace stubs with real wireguard-go/boringtun integration.
pub struct Tunnel {
    pub id: String,
    pub interface: String,
    pub state: TunnelState,
}

impl Tunnel {
    pub fn new(id: &str) -> Self {
        Self {
            id: id.to_string(),
            interface: format!("wg-{}", &id[..8.min(id.len())]),
            state: TunnelState::Disconnected,
        }
    }

    /// Bring up the tunnel interface.
    /// TODO: Implement real WireGuard tunnel creation.
    pub fn bring_up(&mut self, _config_path: &str) -> Result<(), String> {
        log::info!("Bringing up tunnel on interface: {}", self.interface);
        self.state = TunnelState::Connected;
        Ok(())
    }

    /// Bring down the tunnel interface.
    /// TODO: Implement real WireGuard tunnel teardown.
    pub fn bring_down(&mut self) -> Result<(), String> {
        log::info!("Bringing down tunnel on interface: {}", self.interface);
        self.state = TunnelState::Disconnected;
        Ok(())
    }

    /// Get current tunnel state.
    pub fn status(&self) -> &TunnelState {
        &self.state
    }
}
