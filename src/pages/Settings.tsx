import { useSettingsStore } from "../stores/settingsStore";
import Card from "../components/ui/Card";
import Toggle from "../components/ui/Toggle";
import Input from "../components/ui/Input";

export default function Settings() {
  const { settings, updateSetting } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      {/* General */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">General</h2>
        <div className="flex flex-col gap-4">
          <Toggle
            label="Start on boot"
            description="Launch ZeroVPN when your system starts"
            checked={settings.start_on_boot}
            onChange={(v) => updateSetting("start_on_boot", v)}
          />
          <Toggle
            label="Minimize to tray"
            description="Keep ZeroVPN running in the system tray when closed"
            checked={settings.minimize_to_tray}
            onChange={(v) => updateSetting("minimize_to_tray", v)}
          />
          <Toggle
            label="Auto-connect"
            description="Automatically connect to the last used server on launch"
            checked={settings.auto_connect}
            onChange={(v) => updateSetting("auto_connect", v)}
          />
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Security</h2>
        <div className="flex flex-col gap-4">
          <Toggle
            label="Kill switch"
            description="Block all internet traffic if the VPN connection drops"
            checked={settings.kill_switch}
            onChange={(v) => updateSetting("kill_switch", v)}
          />
        </div>
      </Card>

      {/* Protocol */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Protocol</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="MTU"
            type="number"
            value={settings.mtu}
            onChange={(e) => updateSetting("mtu", parseInt(e.target.value) || 1420)}
            helperText="Maximum Transmission Unit. Default: 1420"
          />
          <Input
            label="DNS Servers"
            value={settings.dns_servers.join(", ")}
            onChange={(e) =>
              updateSetting(
                "dns_servers",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
            helperText="Comma-separated DNS servers. Default: 1.1.1.1, 1.0.0.1"
          />
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-2">About</h2>
        <p className="text-sm text-text-secondary">
          ZeroVPN v0.1.0
        </p>
        <p className="text-xs text-text-muted mt-1">
          Self-hosted WireGuard VPN client. Built with Tauri + React.
        </p>
      </Card>
    </div>
  );
}
