/// Get the WireGuard config directory for the current platform.
pub fn get_wg_config_dir() -> Option<std::path::PathBuf> {
    match std::env::consts::OS {
        "macos" => {
            // /etc/wireguard or ~/Library/Application Support/ZeroVPN
            dirs::home_dir().map(|h| h.join("Library/Application Support/ZeroVPN/wireguard"))
        }
        "linux" => Some(std::path::PathBuf::from("/etc/wireguard")),
        "windows" => {
            // %USERPROFILE%\WireGuard
            dirs::home_dir().map(|h| h.join("WireGuard"))
        }
        _ => None,
    }
}

/// Check if the current user has admin/root privileges.
pub fn is_admin() -> bool {
    match std::env::consts::OS {
        "linux" | "macos" => {
            // `id -u` prints the effective UID; "0" means root.
            std::process::Command::new("id")
                .arg("-u")
                .output()
                .map(|o| o.stdout.starts_with(b"0"))
                .unwrap_or(false)
        }
        "windows" => {
            // Check admin group membership (simplified)
            false
        }
        _ => false,
    }
}
