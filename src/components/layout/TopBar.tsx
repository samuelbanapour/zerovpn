import { Power } from "lucide-react";
import { useVpnStore } from "../../stores/vpnStore";
import { useServerStore } from "../../stores/serverStore";
import Badge from "../ui/Badge";

export default function TopBar() {
  const connected = useVpnStore((s) => s.status.connected);
  const connectionState = useVpnStore((s) => s.connectionState);
  const { connect, disconnect } = useVpnStore();
  const selectedServerId = useServerStore((s) => s.selectedServerId);

  const handleToggle = () => {
    if (connected) {
      disconnect();
    } else if (selectedServerId) {
      connect(selectedServerId);
    }
  };

  const statusBadge = () => {
    if (connectionState === "connecting" || connectionState === "disconnecting") {
      return <Badge variant="warning">{connectionState === "connecting" ? "Connecting..." : "Disconnecting..."}</Badge>;
    }
    if (connectionState === "error") {
      return <Badge variant="error">Error</Badge>;
    }
    return connected ? (
      <Badge variant="success">Connected</Badge>
    ) : (
      <Badge variant="neutral">Disconnected</Badge>
    );
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        {statusBadge()}
      </div>

      <button
        onClick={handleToggle}
        disabled={connectionState === "connecting" || connectionState === "disconnecting"}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          connected
            ? "bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30"
            : "bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Power size={16} />
        {connected ? "Disconnect" : "Connect"}
      </button>
    </header>
  );
}
