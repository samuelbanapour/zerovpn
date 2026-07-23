use serde::{Deserialize, Serialize};

/// A parsed WireGuard .conf file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WireGuardConfig {
    pub interface: InterfaceConfig,
    pub peer: PeerConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterfaceConfig {
    pub private_key: String,
    pub address: Vec<String>,
    pub dns: Option<Vec<String>>,
    pub mtu: Option<u32>,
    pub table: Option<String>,
    pub pre_up: Option<String>,
    pub post_up: Option<String>,
    pub pre_down: Option<String>,
    pub post_down: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerConfig {
    pub public_key: String,
    pub preshared_key: Option<String>,
    pub allowed_ips: Vec<String>,
    pub endpoint: String,
    pub persistent_keepalive: Option<u32>,
}

/// Parse a WireGuard .conf file content into a WireGuardConfig.
pub fn parse_conf(content: &str) -> Result<WireGuardConfig, String> {
    let mut interface = InterfaceConfig {
        private_key: String::new(),
        address: Vec::new(),
        dns: None,
        mtu: None,
        table: None,
        pre_up: None,
        post_up: None,
        pre_down: None,
        post_down: None,
    };
    let mut peer = PeerConfig {
        public_key: String::new(),
        preshared_key: None,
        allowed_ips: Vec::new(),
        endpoint: String::new(),
        persistent_keepalive: None,
    };

    let mut current_section = "";

    for line in content.lines() {
        let line = line.trim();

        // Skip comments and empty lines
        if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
            continue;
        }

        // Section headers
        if line.eq_ignore_ascii_case("[Interface]") {
            current_section = "interface";
            continue;
        }
        if line.eq_ignore_ascii_case("[Peer]") {
            current_section = "peer";
            continue;
        }

        // Parse key = value pairs
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim().to_lowercase();
            let value = value.trim();

            match current_section {
                "interface" => match key.as_str() {
                    "privatekey" => interface.private_key = value.to_string(),
                    "address" => {
                        interface.address = value.split(',').map(|s| s.trim().to_string()).collect()
                    }
                    "dns" => {
                        let dns: Vec<String> =
                            value.split(',').map(|s| s.trim().to_string()).collect();
                        interface.dns = Some(dns);
                    }
                    "mtu" => {
                        interface.mtu = value.parse().ok();
                    }
                    "table" => interface.table = Some(value.to_string()),
                    "preup" => interface.pre_up = Some(value.to_string()),
                    "postup" => interface.post_up = Some(value.to_string()),
                    "predown" => interface.pre_down = Some(value.to_string()),
                    "postdown" => interface.post_down = Some(value.to_string()),
                    _ => {}
                },
                "peer" => match key.as_str() {
                    "publickey" => peer.public_key = value.to_string(),
                    "presharedkey" => peer.preshared_key = Some(value.to_string()),
                    "allowedips" => {
                        peer.allowed_ips = value.split(',').map(|s| s.trim().to_string()).collect()
                    }
                    "endpoint" => peer.endpoint = value.to_string(),
                    "persistentkeepalive" => {
                        peer.persistent_keepalive = value.parse().ok();
                    }
                    _ => {}
                },
                _ => {}
            }
        }
    }

    if interface.private_key.is_empty() {
        return Err("Missing [Interface] PrivateKey".to_string());
    }
    if peer.public_key.is_empty() {
        return Err("Missing [Peer] PublicKey".to_string());
    }
    if peer.endpoint.is_empty() {
        return Err("Missing [Peer] Endpoint".to_string());
    }

    Ok(WireGuardConfig { interface, peer })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_basic_conf() {
        let conf = r#"
[Interface]
PrivateKey = yAnz5TF+lXXJte14tji3zlMNq+hd2rYUIgJBgB3fBmk=
Address = 10.0.0.2/32
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = xTIBA5rboUvnH4htodjb6e697QjLERt1NAB4mZqp8Dg=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 198.51.100.1:51820
        "#
        .trim();

        let result = parse_conf(conf).unwrap();
        assert_eq!(result.interface.address, vec!["10.0.0.2/32"]);
        assert_eq!(
            result.interface.dns,
            Some(vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()])
        );
        assert_eq!(result.peer.endpoint, "198.51.100.1:51820");
        assert_eq!(result.peer.allowed_ips, vec!["0.0.0.0/0", "::/0"]);
    }
}
