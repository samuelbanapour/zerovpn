import { MapPin, Wifi, Trash2 } from "lucide-react";
import type { ServerConfig } from "../../types";
import { useServerStore } from "../../stores/serverStore";
import { useVpnStore } from "../../stores/vpnStore";

interface ServerCardProps {
  server: ServerConfig;
}

export default function ServerCard({ server }: ServerCardProps) {
  const { selectServer, removeServer, selectedServerId } = useServerStore();
  const connect = useVpnStore((s) => s.connect);
  const connected = useVpnStore((s) => s.status.connected);
  const isSelected = selectedServerId === server.id;
  const isActive = connected && isSelected;

  const getLatencyColor = (ms: number | null) => {
    if (ms === null) return "text-text-muted";
    if (ms < 50) return "text-accent";
    if (ms < 150) return "text-warning";
    return "text-danger";
  };

  const handleConnect = () => {
    selectServer(server.id);
    connect(server.id);
  };

  const handleSelect = () => {
    selectServer(server.id);
  };

  return (
    <div
      onClick={handleSelect}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-accent/10 border-accent/30"
          : isSelected
          ? "bg-surface-overlay border-accent/20"
          : "bg-surface-raised border-border hover:border-border-hover"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
            isActive ? "bg-accent/20" : "bg-surface-overlay"
          }`}
        >
          <MapPin size={18} className={isActive ? "text-accent" : "text-text-secondary"} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{server.name}</p>
          <p className="text-xs text-text-muted truncate">{server.endpoint}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {server.latency_ms !== null && (
          <div className="flex items-center gap-1.5">
            <Wifi size={14} className={getLatencyColor(server.latency_ms)} />
            <span className={`text-xs font-medium ${getLatencyColor(server.latency_ms)}`}>
              {server.latency_ms}ms
            </span>
          </div>
        )}

        {isActive ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              useVpnStore.getState().disconnect();
            }}
            className="px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConnect();
            }}
            className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
          >
            Connect
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeServer(server.id);
          }}
          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
