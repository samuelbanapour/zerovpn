import { create } from "zustand";
import type { AppSettings } from "../types";

interface SettingsStore {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    start_on_boot: false,
    minimize_to_tray: true,
    kill_switch: false,
    auto_connect: false,
    dns_servers: ["1.1.1.1", "1.0.0.1"],
    mtu: 1420,
    last_used_server: null,
    theme: "dark",
  },

  updateSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),
}));
