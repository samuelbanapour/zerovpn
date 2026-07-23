import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Settings,
  Route,
  User,
  Shield,
} from "lucide-react";
import { NAV_ITEMS } from "../../lib/constants";
import { useVpnStore } from "../../stores/vpnStore";

const iconMap: Record<string, React.ComponentType<{ size?: string | number }>> = {
  LayoutDashboard,
  Server,
  Settings,
  Route,
  User,
};

export default function Sidebar() {
  const connected = useVpnStore((s) => s.status.connected);

  return (
    <aside className="flex flex-col w-16 lg:w-60 h-full bg-surface border-r border-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
          <Shield size={18} className="text-accent" />
        </div>
        <span className="hidden lg:block text-lg font-bold text-text-primary">
          ZeroVPN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-150 ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                }`
              }
            >
              {Icon && <Icon size={20} />}
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Connection indicator */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-accent animate-pulse" : "bg-text-muted"
            }`}
          />
          <span className="hidden lg:block text-xs text-text-muted">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </aside>
  );
}
