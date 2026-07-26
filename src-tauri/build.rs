fn main() {
    // Register our app's own commands so `tauri-build` autogenerates
    // `allow-$command` / `deny-$command` permissions for each of them —
    // otherwise the capability file below has nothing valid to reference.
    let attributes = tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "connect_vpn",
            "disconnect_vpn",
            "get_vpn_status",
            "list_servers",
            "add_server",
            "update_server",
            "remove_server",
            "import_conf",
            "toggle_favorite",
            "get_settings",
            "save_settings",
            "fetch_community_servers",
            "get_system_info",
        ]),
    );

    tauri_build::try_build(attributes).expect("failed to run tauri-build");
}
