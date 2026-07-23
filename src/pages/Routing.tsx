import { useState } from "react";
import { Plus, Trash2, Globe, AppWindow } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";

interface ExcludedRoute {
  id: string;
  type: "ip" | "app";
  value: string;
}

export default function Routing() {
  const [excludedRoutes, setExcludedRoutes] = useState<ExcludedRoute[]>([
    { id: "1", type: "app", value: "Spotify" },
    { id: "2", type: "ip", value: "192.168.1.0/24" },
  ]);
  const [newRoute, setNewRoute] = useState("");
  const [routeType, setRouteType] = useState<"ip" | "app">("ip");
  const [bypassDns, setBypassDns] = useState(false);
  const [lanAccess, setLanAccess] = useState(true);

  const addRoute = () => {
    if (!newRoute.trim()) return;
    setExcludedRoutes([
      ...excludedRoutes,
      { id: Date.now().toString(), type: routeType, value: newRoute.trim() },
    ]);
    setNewRoute("");
  };

  const removeRoute = (id: string) => {
    setExcludedRoutes(excludedRoutes.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary">Routing</h1>

      {/* Split tunneling */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Split Tunneling</h2>
        <p className="text-sm text-text-muted mb-4">
          Exclude specific apps or IP addresses from the VPN tunnel. Traffic to these
          destinations will go directly through your regular internet connection.
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <Toggle
            label="Allow LAN access"
            description="Access local network devices while connected to VPN"
            checked={lanAccess}
            onChange={setLanAccess}
          />
          <Toggle
            label="Bypass DNS"
            description="Use your default DNS server instead of the VPN's DNS"
            checked={bypassDns}
            onChange={setBypassDns}
          />
        </div>
      </Card>

      {/* Excluded routes */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Excluded Routes</h2>

        {/* Add route form */}
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder={routeType === "ip" ? "192.168.1.0/24 or 10.0.0.0/8" : "App name"}
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRoute()}
            />
          </div>
          <div className="flex gap-1 bg-surface-overlay rounded-lg border border-border p-0.5">
            <button
              onClick={() => setRouteType("ip")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                routeType === "ip"
                  ? "bg-accent/20 text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Globe size={12} />
              IP
            </button>
            <button
              onClick={() => setRouteType("app")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                routeType === "app"
                  ? "bg-accent/20 text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <AppWindow size={12} />
              App
            </button>
          </div>
          <Button size="sm" onClick={addRoute}>
            <Plus size={16} />
          </Button>
        </div>

        {/* Route list */}
        <div className="flex flex-col gap-2">
          {excludedRoutes.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">
              No excluded routes configured.
            </p>
          ) : (
            excludedRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-overlay"
              >
                <div className="flex items-center gap-2">
                  {route.type === "ip" ? (
                    <Globe size={14} className="text-blue-400" />
                  ) : (
                    <AppWindow size={14} className="text-purple-400" />
                  )}
                  <span className="text-sm text-text-primary font-mono">{route.value}</span>
                  <span className="text-xs text-text-muted uppercase">{route.type}</span>
                </div>
                <button
                  onClick={() => removeRoute(route.id)}
                  className="p-1 text-text-muted hover:text-danger rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
