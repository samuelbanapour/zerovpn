import { Power, Shield, ShieldOff } from "lucide-react";
import { useVpnStore } from "../../stores/vpnStore";
import { useServerStore } from "../../stores/serverStore";

export default function ConnectionStatus() {
  const connected = useVpnStore((s) => s.status.connected);
  const connectionState = useVpnStore((s) => s.connectionState);
  const server_name = useVpnStore((s) => s.status.server_name);
  const { connect, disconnect } = useVpnStore();
  const selectedServerId = useServerStore((s) => s.selectedServerId);

  const handleToggle = () => {
    if (connected) {
      disconnect();
    } else if (selectedServerId) {
      connect(selectedServerId);
    }
  };

  const isTransitioning = connectionState === "connecting" || connectionState === "disconnecting";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Big connection button */}
      <button
        onClick={handleToggle}
        disabled={isTransitioning || (!connected && !selectedServerId)}
        className={`relative flex items-center justify-center w-40 h-40 rounded-full transition-all duration-300 ${
          connected
            ? "bg-accent/20 border-2 border-accent animate-glow"
            : "bg-surface-raised border-2 border-border hover:border-accent/50"
        } disabled:opacity-50 disabled:cursor-not-allowed group`}
      >
        {/* Pulse rings when connected */}
        {connected && (
          <>
            <span className="absolute inset-0 rounded-full border border-accent/30 animate-ping" />
            <span className="absolute inset-2 rounded-full border border-accent/20 animate-pulse-slow" />
          </>
        )}

        <div className="flex flex-col items-center gap-2 z-10">
          {connected ? (
            <Shield size={40} className="text-accent" />
          ) : (
            <ShieldOff size={40} className="text-text-muted group-hover:text-text-secondary" />
          )}
          <span
            className={`text-sm font-semibold ${
              connected ? "text-accent" : "text-text-secondary"
            }`}
          >
            {isTransitioning
              ? connectionState === "connecting"
                ? "Connecting..."
                : "Disconnecting..."
              : connected
              ? "Connected"
              : "Disconnected"}
          </span>
        </div>
      </button>

      {/* Server info */}
      {connected && server_name && (
        <div className="text-center">
          <p className="text-sm text-text-muted">Active server</p>
          <p className="text-lg font-medium text-text-primary">{server_name}</p>
        </div>
      )}

      {!connected && !selectedServerId && (
        <p className="text-sm text-text-muted">Select a server to connect</p>
      )}

      {/* Quick connect button */}
      {connected && (
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors"
        >
          <Power size={16} />
          Disconnect
        </button>
      )}
    </div>
  );
}
