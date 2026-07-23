export interface ServerConfig {
  id: string;
  name: string;
  address: string;
  port: number;
  public_key: string;
  endpoint: string;
  dns: string | null;
  allowed_ips: string[];
  last_connected: number | null;
  latency_ms: number | null;
}

export interface VpnStatus {
  connected: boolean;
  server_id: string | null;
  server_name: string | null;
  local_ip: string | null;
  public_ip: string | null;
  bytes_sent: number;
  bytes_received: number;
  connected_since: number | null;
}

export interface TrafficStats {
  bytes_sent: number;
  bytes_received: number;
  speed_up: number;
  speed_down: number;
}

export interface AppSettings {
  start_on_boot: boolean;
  minimize_to_tray: boolean;
  kill_switch: boolean;
  auto_connect: boolean;
  dns_servers: string[];
  mtu: number;
  last_used_server: string | null;
  theme: string;
}

export interface SystemInfo {
  os: string;
  arch: string;
  version: string;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "disconnecting" | "error";
