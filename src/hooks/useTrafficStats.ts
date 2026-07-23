import { useEffect, useRef } from "react";
import { useVpnStore } from "../stores/vpnStore";
import { STATS_INTERVAL } from "../lib/constants";

export function useTrafficStats() {
  const updateStats = useVpnStore((s) => s.updateStats);
  const connected = useVpnStore((s) => s.status.connected);
  const prevUp = useRef(0);
  const prevDown = useRef(0);

  useEffect(() => {
    if (!connected) return;

    // Stub: simulate traffic stats for UI development
    const interval = setInterval(() => {
      prevUp.current += Math.random() * 50000;
      prevDown.current += Math.random() * 200000;
      updateStats(prevUp.current, prevDown.current);
    }, STATS_INTERVAL);

    return () => {
      clearInterval(interval);
      prevUp.current = 0;
      prevDown.current = 0;
    };
  }, [connected, updateStats]);
}
