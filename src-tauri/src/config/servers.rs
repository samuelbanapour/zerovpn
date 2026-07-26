use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::RwLock;
use tauri::Manager;

// ---------------------------------------------------------------------------
// ServerConfig — shared between commands and config
// ---------------------------------------------------------------------------

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
    /// WireGuard private key — stored in Rust only, never serialized to the frontend.
    #[serde(skip)]
    pub private_key: Option<String>,
    /// Whether this server is marked as a favorite.
    #[serde(default)]
    pub favorite: bool,
    /// ISO 3166-1 alpha-2 country code, e.g. "US", "DE".
    #[serde(default)]
    pub country: Option<String>,
    /// Human-readable country name.
    #[serde(default)]
    pub country_name: Option<String>,
    /// City name.
    #[serde(default)]
    pub city: Option<String>,
    /// Whether this is a built-in curated server (not user-added).
    #[serde(default)]
    pub built_in: bool,
}

// ---------------------------------------------------------------------------
// ServerStore — thread-safe persistent server list
// ---------------------------------------------------------------------------

pub struct ServerStore {
    servers: RwLock<Vec<ServerConfig>>,
    path: PathBuf,
}

impl ServerStore {
    /// Create a new store backed by the given file path.
    fn new(path: PathBuf) -> Self {
        Self {
            servers: RwLock::new(Vec::new()),
            path,
        }
    }

    /// Load servers from disk. Called once at startup.
    fn load(&self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.path.exists() {
            return Ok(());
        }
        let data = fs::read_to_string(&self.path)?;
        let servers: Vec<ServerConfig> = serde_json::from_str(&data)?;
        *self.servers.write().unwrap() = servers;
        Ok(())
    }

    /// Save servers to disk. Called after every mutation.
    fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let guard = self.servers.read().unwrap();
        let data = serde_json::to_string_pretty(&*guard)?;
        drop(guard);
        // Write to temp file then rename for atomicity.
        let tmp = self.path.with_extension("json.tmp");
        fs::write(&tmp, &data)?;
        fs::rename(&tmp, &self.path)?;
        Ok(())
    }

    // -- Public API (used by Tauri commands) --

    pub fn get_servers(&self) -> Vec<ServerConfig> {
        self.servers.read().unwrap().clone()
    }

    pub fn get_server(&self, id: &str) -> Option<ServerConfig> {
        self.servers.read().unwrap().iter().find(|s| s.id == id).cloned()
    }

    pub fn add_server(&self, server: ServerConfig) {
        self.servers.write().unwrap().push(server);
        let _ = self.save();
    }

    pub fn update_server(&self, id: &str, update: impl FnOnce(&mut ServerConfig)) -> Option<ServerConfig> {
        let mut guard = self.servers.write().unwrap();
        let server = guard.iter_mut().find(|s| s.id == id)?;
        update(server);
        let result = server.clone();
        drop(guard);
        let _ = self.save();
        Some(result)
    }

    pub fn remove_server(&self, id: &str) -> bool {
        let mut guard = self.servers.write().unwrap();
        let len_before = guard.len();
        guard.retain(|s| s.id != id);
        let removed = guard.len() < len_before;
        drop(guard);
        if removed {
            let _ = self.save();
        }
        removed
    }

    pub fn set_last_connected(&self, id: &str, timestamp: u64) {
        self.update_server(id, |s| s.last_connected = Some(timestamp));
    }

    pub fn update_latency(&self, id: &str, latency_ms: Option<u32>) {
        self.update_server(id, |s| s.latency_ms = latency_ms);
    }

    pub fn toggle_favorite(&self, id: &str) -> Option<ServerConfig> {
        self.update_server(id, |s| s.favorite = !s.favorite)
    }
}

// ---------------------------------------------------------------------------
// Initialization — called from lib.rs .setup()
// ---------------------------------------------------------------------------

/// Initialize the server store. Loads existing data from disk, registers the
/// store as Tauri managed state, and optionally seeds built-in servers.
pub fn init_store(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let config_dir = app_handle
        .path()
        .app_config_dir()
        .expect("Failed to get app config dir");
    fs::create_dir_all(&config_dir)?;

    let path = config_dir.join("servers.json");
    let store = ServerStore::new(path);
    store.load()?;

    // Seed built-in servers if the list is empty.
    if store.get_servers().is_empty() {
        seed_builtin_servers(&store);
    }

    app_handle.manage(store);
    Ok(())
}

// ---------------------------------------------------------------------------
// Built-in free WireGuard servers (curated)
// ---------------------------------------------------------------------------

fn seed_builtin_servers(store: &ServerStore) {
    use crate::vpn::servers::curated::curated_servers;

    for server in curated_servers() {
        store.add_server(server);
    }
}
