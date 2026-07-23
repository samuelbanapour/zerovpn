import { invoke } from "@tauri-apps/api/core";
import type { ServerConfig, VpnStatus, SystemInfo } from "../types";

// VPN commands
export async function connectVpn(serverId: string): Promise<VpnStatus> {
  return invoke("connect_vpn", { serverId });
}

export async function disconnectVpn(): Promise<VpnStatus> {
  return invoke("disconnect_vpn");
}

export async function getVpnStatus(): Promise<VpnStatus> {
  return invoke("get_vpn_status");
}

// Config commands
export async function listServers(): Promise<ServerConfig[]> {
  return invoke("list_servers");
}

export async function addServer(
  name: string,
  endpoint: string,
  publicKey: string,
  address: string,
  dns: string | null
): Promise<ServerConfig> {
  return invoke("add_server", { name, endpoint, publicKey, address, dns });
}

export async function updateServer(
  id: string,
  name?: string,
  endpoint?: string,
  publicKey?: string,
  address?: string,
  dns?: string | null
): Promise<ServerConfig> {
  return invoke("update_server", { id, name, endpoint, publicKey, address, dns });
}

export async function removeServer(id: string): Promise<void> {
  return invoke("remove_server", { id });
}

export async function importConf(path: string): Promise<ServerConfig> {
  return invoke("import_conf", { path });
}

// System commands
export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke("get_system_info");
}
