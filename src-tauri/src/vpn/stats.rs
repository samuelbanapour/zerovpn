use serde::{Deserialize, Serialize};

/// Traffic statistics for the VPN connection.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TrafficStats {
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub packets_sent: u64,
    pub packets_received: u64,
    pub connection_uptime_secs: u64,
    pub last_updated: u64,
}

impl TrafficStats {
    /// Create a new zeroed stats instance.
    pub fn new() -> Self {
        Self::default()
    }

    /// Get formatted bytes sent as human-readable string.
    pub fn format_bytes_sent(&self) -> String {
        format_bytes(self.bytes_sent)
    }

    /// Get formatted bytes received as human-readable string.
    pub fn format_bytes_received(&self) -> String {
        format_bytes(self.bytes_received)
    }
}

/// Format bytes into human-readable string (KB, MB, GB).
pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

/// Format seconds into human-readable uptime string.
pub fn format_uptime(secs: u64) -> String {
    let hours = secs / 3600;
    let minutes = (secs % 3600) / 60;
    let seconds = secs % 60;

    if hours > 0 {
        format!("{}h {}m {}s", hours, minutes, seconds)
    } else if minutes > 0 {
        format!("{}m {}s", minutes, seconds)
    } else {
        format!("{}s", seconds)
    }
}
