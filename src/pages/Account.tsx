import { User, Shield, HardDrive, Cpu } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Account() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary">Account</h1>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-overlay border border-border">
            <User size={28} className="text-text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Local Account</h2>
            <p className="text-sm text-text-muted">
              ZeroVPN runs locally on your device. No account needed.
            </p>
          </div>
        </div>
      </Card>

      {/* Device info */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Device Information</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Platform</span>
            </div>
            <Badge variant="neutral">{navigator.platform}</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Architecture</span>
            </div>
            <Badge variant="neutral">{navigator.userAgent.includes("arm") ? "ARM" : "x86_64"}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Protocol</span>
            </div>
            <Badge variant="success">WireGuard</Badge>
          </div>
        </div>
      </Card>

      {/* Coming soon */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Coming Soon</h3>
        <p className="text-sm text-text-muted">
          Cloud sync for server configurations, subscription management, and multi-device support
          are on the roadmap.
        </p>
      </Card>
    </div>
  );
}
