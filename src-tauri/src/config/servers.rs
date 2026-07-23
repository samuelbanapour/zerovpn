use crate::commands::config::ServerConfig;

/// In-memory server list.
/// TODO: Persist to disk for real usage.
static mut SERVERS: Vec<ServerConfig> = Vec::new();

/// Get all servers.
pub fn get_servers() -> Vec<ServerConfig> {
    unsafe { SERVERS.clone() }
}

/// Add a server to the list.
pub fn add_server(server: ServerConfig) {
    unsafe {
        SERVERS.push(server);
    }
}

/// Remove a server by ID.
pub fn remove_server(id: &str) -> bool {
    unsafe {
        let len_before = SERVERS.len();
        SERVERS.retain(|s| s.id != id);
        SERVERS.len() < len_before
    }
}

/// Get a server by ID.
pub fn get_server(id: &str) -> Option<ServerConfig> {
    unsafe { SERVERS.iter().find(|s| s.id == id).cloned() }
}
