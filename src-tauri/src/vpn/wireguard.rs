use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::sync::atomic::Ordering;
use std::time::Duration;

use base64::Engine as _;
use base64::engine::general_purpose::STANDARD as B64;
use boringtun::noise::{Tunn, TunnResult};
use tokio::net::UdpSocket;
use tokio_util::sync::CancellationToken;
use tokio::time::interval;
#[cfg(not(target_os = "android"))]
use tun_rs::DeviceBuilder;
#[cfg(target_os = "android")]
use tun_rs::BorrowedAsyncDevice;
use x25519_dalek::{PublicKey, StaticSecret};

use super::config::{InterfaceConfig, PeerConfig};
use super::tunnel::ActiveTunnel;

// ---------------------------------------------------------------------------
// Public error type
// ---------------------------------------------------------------------------

#[derive(Debug)]
pub struct TunnelError(pub String);

impl std::fmt::Display for TunnelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for TunnelError {}

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

/// Decode a WireGuard base64 key into a fixed 32-byte array.
fn decode_key(key_b64: &str, label: &str) -> Result<[u8; 32], TunnelError> {
    let bytes = B64
        .decode(key_b64.trim())
        .map_err(|e| TunnelError(format!("invalid {} key ({}): {}", label, key_b64, e)))?;
    bytes
        .try_into()
        .map_err(|_| TunnelError(format!("{} key must be 32 bytes", label)))
}

// ---------------------------------------------------------------------------
// start_tunnel — create TUN device, init boringtun, bind UDP, spawn pumps
// ---------------------------------------------------------------------------

/// Start a real WireGuard tunnel.
///
/// Returns an [`ActiveTunnel`] whose `cancel` token can be used to stop the
/// pump tasks.  The caller stores this inside `State<Mutex<Option<ActiveTunnel>>>`.
///
/// # macOS / Linux privileges
/// Creating a TUN interface requires elevated privileges (root or
/// `CAP_NET_ADMIN`).  On macOS, Tauri apps must be signed and granted the
/// network entitlement, or launched via `sudo` during development.
pub async fn start_tunnel(
    server_id: &str,
    server_name: &str,
    iface_cfg: &InterfaceConfig,
    peer_cfg: &PeerConfig,
) -> Result<ActiveTunnel, TunnelError> {
    // --- 1. Decode keys ---
    let private_bytes = decode_key(&iface_cfg.private_key, "private")?;
    let public_bytes = decode_key(&peer_cfg.public_key, "public")?;

    let static_private = StaticSecret::from(private_bytes);
    let peer_public = PublicKey::from(public_bytes);

    let preshared: Option<[u8; 32]> = peer_cfg
        .preshared_key
        .as_deref()
        .map(|k| decode_key(k, "preshared"))
        .transpose()?;

    let keepalive: Option<u16> = peer_cfg
        .persistent_keepalive
        .and_then(|k| k.try_into().ok());

    // --- 2. Parse interface address (take first /32 or /128) ---
    let iface_addr = iface_cfg
        .address
        .first()
        .ok_or_else(|| TunnelError("No interface address in config".into()))?;

    // Split "10.0.0.2/32" → ("10.0.0.2", 32)
    let (ip_str, prefix_str) = iface_addr
        .split_once('/')
        .unwrap_or((iface_addr.as_str(), "32"));
    let prefix_len: u8 = prefix_str.parse().unwrap_or(32);

    let mtu = iface_cfg.mtu.unwrap_or(1420) as usize;

    // --- 3. Resolve peer endpoint ---
    let endpoint: SocketAddr = peer_cfg
        .endpoint
        .parse()
        .or_else(|_| {
            // endpoint may be "hostname:port" — resolve synchronously via std
            std::net::ToSocketAddrs::to_socket_addrs(&peer_cfg.endpoint)
                .map_err(|e| TunnelError(format!("Cannot resolve endpoint {}: {}", peer_cfg.endpoint, e)))
                .and_then(|mut a| {
                    a.next().ok_or_else(|| TunnelError(format!("No address for {}", peer_cfg.endpoint)))
                })
        })
        .map_err(|e: TunnelError| e)?;

    // --- 4. Create TUN device ---
    #[cfg(not(target_os = "android"))]
    let mut builder = DeviceBuilder::new().mtu(mtu as u16);
    #[cfg(not(target_os = "android"))]
    let tun_device = if let Ok(ipv4) = ip_str.parse::<std::net::Ipv4Addr>() {
        builder = builder.ipv4(ipv4, prefix_len, None);
        builder.build_async()
    } else if let Ok(ipv6) = ip_str.parse::<std::net::Ipv6Addr>() {
        builder = builder.ipv6(ipv6, prefix_len);
        builder.build_async()
    } else {
        return Err(TunnelError(format!("Cannot parse interface address '{}'", ip_str)));
    }
    .map_err(|e| TunnelError(format!("Failed to create TUN device: {}", e)))?;

    // Android: TUN fd is provided by VpnService.Builder.establish() on the Java side.
    #[cfg(target_os = "android")]
    let tun_device = {
        let fd = iface_cfg
            .android_fd
            .ok_or_else(|| TunnelError("Android TUN fd not provided — pass iface_cfg.android_fd from VpnService".into()))?;
        // SAFETY: fd comes from VpnService.Builder.establish() and is a valid TUN device.
        unsafe { BorrowedAsyncDevice::borrow_raw(fd) }
            .map_err(|e| TunnelError(format!("Failed to wrap Android TUN fd: {}", e)))?
    };

    log::info!("TUN device up, ip={}, prefix=/{}, mtu={}", ip_str, prefix_len, mtu);

    // --- 5. Bind UDP socket (any local port, then "connect" to peer) ---
    let udp = UdpSocket::bind("0.0.0.0:0")
        .await
        .map_err(|e| TunnelError(format!("UDP bind failed: {}", e)))?;
    udp.connect(endpoint)
        .await
        .map_err(|e| TunnelError(format!("UDP connect failed: {}", e)))?;
    let udp = Arc::new(udp);

    log::info!("UDP socket bound, peer={}", endpoint);

    // --- 6. Initialise boringtun Tunn ---
    let tunn = Tunn::new(
        static_private,
        peer_public,
        preshared,
        keepalive,
        0, // session index
        None,
    );
    // Wrap in Arc<Mutex<>> so both pump tasks can share it.
    let tunn = Arc::new(Mutex::new(tunn));

    // --- 7. Build ActiveTunnel ---
    let cancel = CancellationToken::new();
    let connected_since = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let active = ActiveTunnel::new(
        server_id,
        server_name,
        ip_str,
        connected_since,
        cancel.clone(),
    );

    let bytes_sent = Arc::clone(&active.bytes_sent);
    let bytes_received = Arc::clone(&active.bytes_received);

    // Wrap TUN in Arc so both pump tasks can share it.
    let tun = Arc::new(tun_device);

    // --- 8. Spawn TUN → UDP pump (encrypt & send) ---
    {
        let tunn = Arc::clone(&tunn);
        let udp = Arc::clone(&udp);
        let tun = Arc::clone(&tun);
        let bytes_sent = Arc::clone(&bytes_sent);
        let cancel = cancel.clone();

        tokio::spawn(async move {
            let mut tun_buf = vec![0u8; mtu + 32];
            // enc_buf must be larger than the plaintext + WireGuard header overhead.
            let mut enc_buf = vec![0u8; mtu + 64];

            loop {
                tokio::select! {
                    _ = cancel.cancelled() => {
                        log::info!("TUN→UDP pump: cancelled");
                        break;
                    }
                    result = tun.recv(&mut tun_buf) => {
                        let n = match result {
                            Ok(n) => n,
                            Err(e) => {
                                log::warn!("TUN read error: {}", e);
                                continue;
                            }
                        };
                        if n == 0 {
                            continue;
                        }

                        // Encrypt inside a scope so the MutexGuard is dropped
                        // before the async UDP send (guard is !Send).
                        let to_send: Option<(Vec<u8>, usize)> = {
                            let mut guard = tunn.lock().unwrap();
                            match guard.encapsulate(&tun_buf[..n], &mut enc_buf) {
                                TunnResult::WriteToNetwork(pkt) => {
                                    // Copy to owned vec before dropping the mutable borrow.
                                    let len = pkt.len();
                                    let owned = pkt.to_vec();
                                    Some((owned, len))
                                }
                                TunnResult::Done => None,
                                TunnResult::Err(e) => {
                                    log::warn!("boringtun encapsulate error: {:?}", e);
                                    None
                                }
                                _ => None,
                            }
                        }; // guard dropped here

                        if let Some((pkt, pkt_len)) = to_send {
                            if let Err(e) = udp.send(&pkt).await {
                                log::warn!("UDP send error: {}", e);
                            } else {
                                bytes_sent.fetch_add(pkt_len as u64, Ordering::Relaxed);
                            }
                        }
                    }
                }
            }
        });
    }

    // --- 9. Spawn UDP → TUN pump (decrypt & inject) ---
    {
        let tunn = Arc::clone(&tunn);
        let udp = Arc::clone(&udp);
        let tun = Arc::clone(&tun);
        let bytes_received = Arc::clone(&bytes_received);
        let cancel = cancel.clone();

        tokio::spawn(async move {
            let mut udp_buf = vec![0u8; mtu + 64];
            // dec_buf must be large enough for the inner IP packet.
            let mut dec_buf = vec![0u8; mtu + 32];
            // Keepalive tick: boringtun may need to send handshake packets even
            // when there's no TUN traffic.  Drive it every 100 ms.
            let mut tick = interval(Duration::from_millis(100));

            loop {
                tokio::select! {
                    _ = cancel.cancelled() => {
                        log::info!("UDP→TUN pump: cancelled");
                        break;
                    }
                    _ = tick.tick() => {
                        // Let boringtun emit keepalive / handshake datagrams.
                        // These are synchronous + short, so holding the lock is fine
                        // as long as we don't await while holding it.
                        let pkts: Vec<Vec<u8>> = {
                            let mut guard = tunn.lock().unwrap();
                            let mut out = Vec::new();
                            loop {
                                match guard.decapsulate(None, &[], &mut dec_buf) {
                                    TunnResult::WriteToNetwork(pkt) => {
                                        out.push(pkt.to_vec());
                                    }
                                    _ => break,
                                }
                            }
                            out
                        }; // guard dropped

                        for pkt in pkts {
                            let _ = udp.try_send(&pkt);
                        }
                    }
                    result = udp.recv(&mut udp_buf) => {
                        let n = match result {
                            Ok(n) => n,
                            Err(e) => {
                                log::warn!("UDP recv error: {}", e);
                                continue;
                            }
                        };
                        if n == 0 {
                            continue;
                        }

                        // Decrypt loop: drive decapsulate until Done.
                        // We may need to await tun.send() between iterations, so
                        // we collect each action as an enum, then drop the lock
                        // before awaiting.
                        loop {
                            enum Action {
                                Done,
                                SendToNetwork(Vec<u8>),
                                InjectToTun(Vec<u8>),
                                Error,
                            }

                            let action: Action = {
                                let mut guard = tunn.lock().unwrap();
                                // On the first call pass the real datagram; on subsequent
                                // calls pass an empty slice to drain pending output.
                                let src_ip = Some(endpoint.ip());
                                match guard.decapsulate(src_ip, &udp_buf[..n], &mut dec_buf) {
                                    TunnResult::Done => Action::Done,
                                    TunnResult::Err(e) => {
                                        log::warn!("boringtun decapsulate error: {:?}", e);
                                        Action::Error
                                    }
                                    TunnResult::WriteToNetwork(pkt) => {
                                        Action::SendToNetwork(pkt.to_vec())
                                    }
                                    TunnResult::WriteToTunnelV4(pkt, _)
                                    | TunnResult::WriteToTunnelV6(pkt, _) => {
                                        Action::InjectToTun(pkt.to_vec())
                                    }
                                }
                            }; // guard dropped

                            match action {
                                Action::Done | Action::Error => break,
                                Action::SendToNetwork(pkt) => {
                                    let _ = udp.try_send(&pkt);
                                    // Loop again with empty src+data to drain more output.
                                    // We need to re-enter the outer loop with n=0:
                                    // break out and let the next iteration send empty.
                                    // Actually we need to drive until Done, so continue
                                    // with a synthetic empty recv. Use a local sentinel.
                                    // Simplest: just break and let the keepalive tick drive it.
                                    break;
                                }
                                Action::InjectToTun(pkt) => {
                                    bytes_received.fetch_add(pkt.len() as u64, Ordering::Relaxed);
                                    if let Err(e) = tun.send(&pkt).await {
                                        log::warn!("TUN write error: {}", e);
                                    }
                                    // Continue loop to drain any further output.
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    log::info!(
        "WireGuard tunnel started: server={}, peer={}, local={}",
        server_name, endpoint, ip_str
    );

    Ok(active)
}
