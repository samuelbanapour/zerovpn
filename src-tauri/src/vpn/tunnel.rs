use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio_util::sync::CancellationToken;

/// Live state for an active WireGuard session.
///
/// Held inside `State<Mutex<Option<ActiveTunnel>>>` in Tauri.
/// The pump tasks keep `Arc` clones of the byte counters and the
/// cancellation token; dropping or cancelling this struct tears everything down.
pub struct ActiveTunnel {
    pub server_id: String,
    pub server_name: String,
    /// First VPN address assigned to the interface (e.g. "10.0.0.2").
    pub local_ip: String,
    /// Unix timestamp (seconds) at which the tunnel was established.
    pub connected_since: u64,
    /// Running total bytes sent through the TUN → UDP path.
    pub bytes_sent: Arc<AtomicU64>,
    /// Running total bytes received through the UDP → TUN path.
    pub bytes_received: Arc<AtomicU64>,
    /// Signal the pump tasks to shut down.
    pub cancel: CancellationToken,
}

impl ActiveTunnel {
    pub fn new(
        server_id: impl Into<String>,
        server_name: impl Into<String>,
        local_ip: impl Into<String>,
        connected_since: u64,
        cancel: CancellationToken,
    ) -> Self {
        Self {
            server_id: server_id.into(),
            server_name: server_name.into(),
            local_ip: local_ip.into(),
            connected_since,
            bytes_sent: Arc::new(AtomicU64::new(0)),
            bytes_received: Arc::new(AtomicU64::new(0)),
            cancel,
        }
    }

    pub fn bytes_sent(&self) -> u64 {
        self.bytes_sent.load(Ordering::Relaxed)
    }

    pub fn bytes_received(&self) -> u64 {
        self.bytes_received.load(Ordering::Relaxed)
    }

    /// Request the pump tasks to stop.  Does not wait for them to finish.
    pub fn shutdown(&self) {
        self.cancel.cancel();
    }
}

impl Drop for ActiveTunnel {
    fn drop(&mut self) {
        self.cancel.cancel();
    }
}
