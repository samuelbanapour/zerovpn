use crate::config::servers::ServerConfig;

/// Curated list of free WireGuard servers.
///
/// These are community-provided servers. Use at your own risk.
/// Private keys are NOT included — users must generate their own keypair
/// and configure the server to accept it.
///
/// To add your own server: use the Import .conf feature or the Add Server form.
///
/// This has to be a function rather than a `const`/`static` slice: building a
/// `ServerConfig` involves `String`/`Vec` allocation (via `.into()`), which
/// isn't const-evaluable.
pub fn curated_servers() -> Vec<ServerConfig> {
    vec![
    // ---- United States ----
    ServerConfig {
        id: "us-free-1".into(),
        name: "US Free #1 — New York".into(),
        address: "10.0.0.2/32".into(),
        port: 51820,
        public_key: "".into(), // placeholder — import real .conf to use
        endpoint: "us1.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("US".into()),
        country_name: Some("United States".into()),
        city: Some("New York".into()),
        built_in: true,
    },
    ServerConfig {
        id: "us-free-2".into(),
        name: "US Free #2 — Los Angeles".into(),
        address: "10.0.0.3/32".into(),
        port: 51820,
        public_key: "".into(),
        endpoint: "us2.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("US".into()),
        country_name: Some("United States".into()),
        city: Some("Los Angeles".into()),
        built_in: true,
    },
    ServerConfig {
        id: "us-free-3".into(),
        name: "US Free #3 — Chicago".into(),
        address: "10.0.0.4/32".into(),
        port: 51820,
        public_key: "".into(),
        endpoint: "us3.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("US".into()),
        country_name: Some("United States".into()),
        city: Some("Chicago".into()),
        built_in: true,
    },
    // ---- Germany ----
    ServerConfig {
        id: "de-free-1".into(),
        name: "Germany Free #1 — Frankfurt".into(),
        address: "10.0.0.5/32".into(),
        port: 51820,
        public_key: "".into(),
        endpoint: "de1.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("DE".into()),
        country_name: Some("Germany".into()),
        city: Some("Frankfurt".into()),
        built_in: true,
    },
    ServerConfig {
        id: "de-free-2".into(),
        name: "Germany Free #2 — Berlin".into(),
        address: "10.0.0.6/32".into(),
        port: 51820,
        public_key: "".into(),
        endpoint: "de2.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("DE".into()),
        country_name: Some("Germany".into()),
        city: Some("Berlin".into()),
        built_in: true,
    },
    // ---- Croatia ----
    ServerConfig {
        id: "hr-free-1".into(),
        name: "Croatia Free #1 — Zagreb".into(),
        address: "10.0.0.7/32".into(),
        port: 51820,
        public_key: "".into(),
        endpoint: "hr1.freevpngate.example:51820".into(),
        dns: Some("1.1.1.1".into()),
        allowed_ips: vec!["0.0.0.0/0".into(), "::/0".into()],
        last_connected: None,
        latency_ms: None,
        private_key: None,
        favorite: false,
        country: Some("HR".into()),
        country_name: Some("Croatia".into()),
        city: Some("Zagreb".into()),
        built_in: true,
    },
    ]
}
