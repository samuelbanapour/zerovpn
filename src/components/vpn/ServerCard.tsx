import { Trash2, Zap } from "lucide-react";
import type { ServerConfig } from "../../types";
import { useServerStore } from "../../stores/serverStore";
import { useVpnStore } from "../../stores/vpnStore";
import { countryFlag } from "../../lib/constants";

interface ServerCardProps {
  server: ServerConfig;
}

// ---------------------------------------------------------------------------
// Latency bar — NordVPN-style colour-coded 5-segment bar
// ---------------------------------------------------------------------------

function LatencyBar({ ms }: { ms: number | null }) {
  // 5 segments that fill green → yellow → red based on latency
  const filled = ms === null ? 0 : ms < 30 ? 5 : ms < 60 ? 4 : ms < 100 ? 3 : ms < 150 ? 2 : 1;

  const segmentColor = (index: number) => {
    if (index >= filled) return "bg-surface-overlay";
    if (filled >= 4) return "bg-accent";       // excellent — cyan/green
    if (filled === 3) return "bg-warning";      // medium — amber
    return "bg-danger";                          // high latency — red
  };

  return (
    <div className="flex items-end gap-0.5 h-4" aria-label={ms !== null ? `${ms}ms latency` : "latency unknown"}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm transition-colors ${segmentColor(i)}`}
          style={{ height: `${((i + 1) / 5) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServerCard
// ---------------------------------------------------------------------------

export default function ServerCard({ server }: ServerCardProps) {
  const { selectServer, removeServer, selectedServerId } = useServerStore();
  const connect = useVpnStore((s) => s.connect);
  const connected = useVpnStore((s) => s.status.connected);
  const isSelected = selectedServerId === server.id;
  const isActive = connected && isSelected;

  const flag = server.country ? countryFlag(server.country) : "🌐";
  const location = [server.city, server.country_name ?? server.country]
    .filter(Boolean)
    .join(", ");

  const latencyLabel =
    server.latency_ms === null
      ? "—"
      : server.latency_ms < 30
      ? "Excellent"
      : server.latency_ms < 60
      ? "Good"
      : server.latency_ms < 100
      ? "Fair"
      : "Poor";

  const latencyTextColor =
    server.latency_ms === null
      ? "text-text-muted"
      : server.latency_ms < 60
      ? "text-accent"
      : server.latency_ms < 100
      ? "text-warning"
      : "text-danger";

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectServer(server.id);
    connect(server.id);
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    useVpnStore.getState().disconnect();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeServer(server.id);
  };

  return (
    <div
      onClick={() => selectServer(server.id)}
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-accent/10 border-accent/30"
          : isSelected
          ? "bg-surface-overlay border-accent/20"
          : "bg-surface-raised border-border hover:border-border-hover hover:bg-surface-overlay"
      }`}
    >
      {/* Flag */}
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg text-xl shrink-0 select-none ${
          isActive ? "bg-accent/20" : "bg-surface-overlay"
        }`}
        aria-label={server.country_name ?? server.country ?? "Server"}
      >
        {flag}
      </div>

      {/* Name + location */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary truncate">{server.name}</p>

          {/* Connected badge */}
          {isActive && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent/20 text-accent border border-accent/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Connected
            </span>
          )}
        </div>

        <p className="text-xs text-text-muted truncate mt-0.5">
          {location || server.endpoint}
        </p>
      </div>

      {/* Latency meter */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-14">
        <LatencyBar ms={server.latency_ms} />
        <span className={`text-[10px] font-medium ${latencyTextColor}`}>
          {server.latency_ms !== null ? `${server.latency_ms}ms` : "—"}
        </span>
      </div>

      {/* Latency label — hidden on small cards */}
      <div className="hidden sm:block shrink-0 w-16 text-right">
        <span className={`text-xs font-medium ${latencyTextColor}`}>{latencyLabel}</span>
      </div>

      {/* Actions — revealed on hover (or always visible when active) */}
      <div
        className={`flex items-center gap-2 shrink-0 transition-opacity duration-150 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {isActive ? (
          <button
            onClick={handleDisconnect}
            className="px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Zap size={12} />
            Connect
          </button>
        )}

        <button
          onClick={handleDelete}
          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
          aria-label="Remove server"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
