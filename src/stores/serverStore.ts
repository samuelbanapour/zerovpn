import { create } from "zustand";
import type { ServerConfig } from "../types";
import { listServers, addServer, removeServer, updateServer } from "../lib/tauri";

interface ServerStore {
  servers: ServerConfig[];
  selectedServerId: string | null;
  loading: boolean;
  error: string | null;
  fetchServers: () => Promise<void>;
  addServer: (name: string, endpoint: string, publicKey: string, address: string, dns: string | null) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  updateServer: (id: string, updates: Partial<ServerConfig>) => Promise<void>;
  selectServer: (id: string | null) => void;
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: [],
  selectedServerId: null,
  loading: false,
  error: null,

  fetchServers: async () => {
    set({ loading: true, error: null });
    try {
      const servers = await listServers();
      set({ servers, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  addServer: async (name, endpoint, publicKey, address, dns) => {
    try {
      const server = await addServer(name, endpoint, publicKey, address, dns);
      set((state) => ({ servers: [...state.servers, server] }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  removeServer: async (id) => {
    try {
      await removeServer(id);
      set((state) => ({
        servers: state.servers.filter((s) => s.id !== id),
        selectedServerId: state.selectedServerId === id ? null : state.selectedServerId,
      }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  updateServer: async (id, updates) => {
    try {
      const updated = await updateServer(
        id,
        updates.name,
        updates.endpoint,
        updates.public_key,
        updates.address,
        updates.dns
      );
      set((state) => ({
        servers: state.servers.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  selectServer: (id) => set({ selectedServerId: id }),
}));
