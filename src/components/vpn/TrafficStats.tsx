import { ArrowUp, ArrowDown } from "lucide-react";
import { useVpnStore } from "../../stores/vpnStore";
import Card from "../ui/Card";

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec >= 1048576) {
    return `${(bytesPerSec / 1048576).toFixed(1)} MB/s`;
  }
  if (bytesPerSec >= 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${bytesPerSec.toFixed(0)} B/s`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

export default function TrafficStats() {
  const stats = useVpnStore((s) => s.stats);
  const connected = useVpnStore((s) => s.status.connected);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/15">
            <ArrowUp size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Upload</p>
            <p className="text-lg font-semibold text-text-primary">
              {connected ? formatSpeed(stats.speed_up) : "---"}
            </p>
            <p className="text-xs text-text-muted">
              {connected ? formatBytes(stats.bytes_sent) : "0 B"} total
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/15">
            <ArrowDown size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Download</p>
            <p className="text-lg font-semibold text-text-primary">
              {connected ? formatSpeed(stats.speed_down) : "---"}
            </p>
            <p className="text-xs text-text-muted">
              {connected ? formatBytes(stats.bytes_received) : "0 B"} total
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
