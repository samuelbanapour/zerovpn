import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useVpnStore } from "../../stores/vpnStore";
import Card from "../ui/Card";

function formatUptime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ConnectionTimer() {
  const connectedSince = useVpnStore((s) => s.status.connected_since);
  const connected = useVpnStore((s) => s.status.connected);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!connected || !connectedSince) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setElapsed(now - connectedSince);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [connected, connectedSince]);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-overlay">
          <Clock size={18} className="text-text-secondary" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Uptime</p>
          <p className="text-lg font-mono font-semibold text-text-primary">
            {connected ? formatUptime(elapsed) : "00:00:00"}
          </p>
        </div>
      </div>
    </Card>
  );
}
