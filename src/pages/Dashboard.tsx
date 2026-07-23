import { useVpnStore } from "../stores/vpnStore";
import { useServerStore } from "../stores/serverStore";
import { useTrafficStats } from "../hooks/useTrafficStats";
import ConnectionStatus from "../components/vpn/ConnectionStatus";
import TrafficStats from "../components/vpn/TrafficStats";
import ConnectionTimer from "../components/vpn/ConnectionTimer";
import Card from "../components/ui/Card";
import { Globe, Lock, Server } from "lucide-react";

export default function Dashboard() {
  const { local_ip, public_ip, connected } = useVpnStore((s) => s.status);
  const servers = useServerStore((s) => s.servers);

  useTrafficStats();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      {/* Connection status */}
      <ConnectionStatus />

      {/* Traffic stats */}
      {connected && (
        <>
          <TrafficStats />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ConnectionTimer />
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-overlay">
                  <Lock size={18} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Local IP</p>
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {local_ip || "---"}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-overlay">
                  <Globe size={18} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Public IP</p>
                  <p className="text-sm font-medium text-text-primary font-mono">
                    {public_ip || "---"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Quick server list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary">Available Servers</h2>
          </div>
          <span className="text-xs text-text-muted">{servers.length} servers</span>
        </div>
        <div className="flex flex-col gap-2">
          {servers.slice(0, 3).map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-overlay"
            >
              <span className="text-sm text-text-primary">{server.name}</span>
              {server.latency_ms !== null && (
                <span className="text-xs text-text-muted">{server.latency_ms}ms</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
