use reqwest;
use crate::config::servers::ServerConfig;

/// A single entry from a community server list (JSON format).
#[derive(serde::Deserialize)]
pub struct CommunityServerEntry {
    pub name: String,
    pub country: String,
    #[serde(default)]
    pub country_name: Option<String>,
    #[serde(default)]
    pub city: Option<String>,
    pub endpoint: String,
    pub public_key: String,
    #[serde(default)]
    pub preshared_key: Option<String>,
    pub address: String,
    #[serde(default)]
    pub dns: Option<String>,
    #[serde(default)]
    pub allowed_ips: Option<Vec<String>>,
}

/// Fetch WireGuard servers from a community-maintained JSON URL.
///
/// Expected JSON format:
/// ```json
/// [
///   {
///     "name": "US Free #1",
///     "country": "US",
///     "country_name": "United States",
///     "city": "New York",
///     "endpoint": "198.51.100.1:51820",
///     "public_key": "...",
///     "address": "10.0.0.2/32",
///     "dns": "1.1.1.1"
///   }
/// ]
/// ```
pub async fn fetch_community_servers(url: &str) -> Result<Vec<ServerConfig>, String> {
    let resp = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to fetch community servers: {}", e))?;

    let entries: Vec<CommunityServerEntry> = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse community server list: {}", e))?;

    let servers = entries
        .into_iter()
        .map(|e| {
            ServerConfig {
                id: uuid::Uuid::new_v4().to_string(),
                name: e.name,
                address: e.address,
                port: e
                    .endpoint
                    .split(':')
                    .last()
                    .and_then(|p| p.parse().ok())
                    .unwrap_or(51820),
                public_key: e.public_key,
                endpoint: e.endpoint,
                dns: e.dns,
                allowed_ips: e.allowed_ips.unwrap_or_else(|| vec!["0.0.0.0/0".to_string()]),
                last_connected: None,
                latency_ms: None,
                private_key: None, // user must import their own
                favorite: false,
                country: Some(e.country),
                country_name: e.country_name,
                city: e.city,
                built_in: false,
            }
        })
        .collect();

    Ok(servers)
}
