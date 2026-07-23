export const APP_NAME = "ZeroVPN";
export const APP_VERSION = "0.1.0";

export const POLL_INTERVAL = 2000; // 2 seconds for VPN status
export const STATS_INTERVAL = 1000; // 1 second for traffic stats

export const DEFAULT_DNS = ["1.1.1.1", "1.0.0.1"];
export const DEFAULT_MTU = 1420;
export const DEFAULT_PORT = 51820;

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/servers", label: "Servers", icon: "Server" },
  { path: "/settings", label: "Settings", icon: "Settings" },
  { path: "/routing", label: "Routing", icon: "Route" },
  { path: "/account", label: "Account", icon: "User" },
] as const;
