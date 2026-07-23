import { create } from "zustand";
import type { VpnStatus, TrafficStats, ConnectionState } from "../types";
import { connectVpn, disconnectVpn, getVpnStatus } from "../lib/tauri";

interface VpnStore {
  status: VpnStatus;
  connectionState: ConnectionState;
  stats: TrafficStats;
  error: string | null;
  connect: (serverId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  updateStats: (bytesUp: number, bytesDown: number) => void;
}

export const useVpnStore = create<VpnStore>((set, get) => ({
  status: {
    connected: false,
    server_id: null,
    server_name: null,
    local_ip: null,
    public_ip: null,
    bytes_sent: 0,
    bytes_received: 0,
    connected_since: null,
  },
  connectionState: "disconnected",
  stats: { bytes_sent: 0, bytes_received: 0, speed_up: 0, speed_down: 0 },
  error: null,

  connect: async (serverId: string) => {
    try {
      set({ connectionState: "connecting", error: null });
      const status = await connectVpn(serverId);
      set({
        status,
        connectionState: status.connected ? "connected" : "disconnected",
      });
    } catch (err) {
      set({
        connectionState: "error",
        error: String(err),
      });
    }
  },

  disconnect: async () => {
    try {
      set({ connectionState: "disconnecting", error: null });
      const status = await disconnectVpn();
      set({
        status,
        connectionState: "disconnected",
        stats: { bytes_sent: 0, bytes_received: 0, speed_up: 0, speed_down: 0 },
      });
    } catch (err) {
      set({
        connectionState: "error",
        error: String(err),
      });
    }
  },

  refreshStatus: async () => {
    try {
      const status = await getVpnStatus();
      const currentState = get().connectionState;
      if (currentState === "connecting" || currentState === "disconnecting") return;
      set({
        status,
        connectionState: status.connected ? "connected" : "disconnected",
      });
    } catch {
      // Silently ignore status refresh errors
    }
  },

  updateStats: (bytesUp: number, bytesDown: number) => {
    const prev = get().stats;
    set({
      stats: {
        bytes_sent: bytesUp,
        bytes_received: bytesDown,
        speed_up: Math.max(0, bytesUp - prev.bytes_sent),
        speed_down: Math.max(0, bytesDown - prev.bytes_received),
      },
    });
  },
}));
