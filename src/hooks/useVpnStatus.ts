import { useEffect } from "react";
import { useVpnStore } from "../stores/vpnStore";
import { POLL_INTERVAL } from "../lib/constants";

export function useVpnStatus() {
  const refreshStatus = useVpnStore((s) => s.refreshStatus);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshStatus]);
}
