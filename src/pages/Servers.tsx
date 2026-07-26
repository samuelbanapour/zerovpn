import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Search, Plus, Upload, Globe } from "lucide-react";
import { useServerStore } from "../stores/serverStore";
import ServerCard from "../components/vpn/ServerCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  REGION_TABS,
  COUNTRIES,
  countryFlag,
  getCountry,
  type Region,
} from "../lib/constants";

// ---------------------------------------------------------------------------
// Servers page — NordVPN-style region tabs + server list
// ---------------------------------------------------------------------------

export default function Servers() {
  const { servers, loading, fetchServers, addServer, importConf } = useServerStore();

  // Filter state
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<Region>("all");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Add-server form state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");
  const [newPublicKey, setNewPublicKey] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newCity, setNewCity] = useState("");

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filtered = servers.filter((s) => {
    // Region filter
    if (region !== "all") {
      const country = s.country ? getCountry(s.country) : undefined;
      if (!country || country.region !== region) return false;
    }

    // Text search — name, endpoint, country name, city
    if (search) {
      const q = search.toLowerCase();
      const inName = s.name.toLowerCase().includes(q);
      const inEndpoint = s.endpoint.toLowerCase().includes(q);
      const inCountry = (s.country_name ?? "").toLowerCase().includes(q);
      const inCity = (s.city ?? "").toLowerCase().includes(q);
      if (!inName && !inEndpoint && !inCountry && !inCity) return false;
    }

    return true;
  });

  // Group filtered servers by country for display
  const byCountry = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    const key = s.country ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  // Sort country groups: countries with a known code first, then unknown
  const countryGroups = Object.entries(byCountry).sort(([a], [b]) => {
    if (a === "__none__") return 1;
    if (b === "__none__") return -1;
    const nameA = getCountry(a)?.name ?? a;
    const nameB = getCountry(b)?.name ?? b;
    return nameA.localeCompare(nameB);
  });

  // ---------------------------------------------------------------------------
  // Add-server handler
  // ---------------------------------------------------------------------------

  const handleAdd = async () => {
    if (!newName || !newEndpoint || !newPublicKey || !newAddress) return;
    await addServer(newName, newEndpoint, newPublicKey, newAddress, "1.1.1.1");
    setNewName("");
    setNewEndpoint("");
    setNewPublicKey("");
    setNewAddress("");
    setNewCountry("");
    setNewCity("");
    setShowAdd(false);
  };

  // ---------------------------------------------------------------------------
  // Import .conf handler
  // ---------------------------------------------------------------------------

  const handleImport = async () => {
    setImportError(null);
    try {
      const path = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "WireGuard config", extensions: ["conf"] }],
      });
      if (!path) return; // user cancelled

      setImporting(true);
      await importConf(path);
    } catch (err) {
      setImportError(String(err));
    } finally {
      setImporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Servers</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleImport} disabled={importing}>
            <Upload size={16} />
            {importing ? "Importing…" : "Import .conf"}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} />
            Add Server
          </Button>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {REGION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRegion(tab.key)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              region === tab.key
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Import error */}
      {importError && (
        <div className="px-4 py-2.5 bg-danger/10 border border-danger/30 rounded-xl text-sm text-danger">
          Failed to import .conf: {importError}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by country, city or server name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Add-server form */}
      {showAdd && (
        <div className="bg-surface-raised border border-border rounded-xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Add New Server</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Server Name"
              placeholder="My VPN Server"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Endpoint"
              placeholder="vpn.example.com:51820"
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
            />
            <Input
              label="Public Key"
              placeholder="Base64 public key"
              value={newPublicKey}
              onChange={(e) => setNewPublicKey(e.target.value)}
            />
            <Input
              label="Address"
              placeholder="10.0.0.2/32"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />

            {/* Country selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Country (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none select-none">
                  {newCountry ? countryFlag(newCountry) : <Globe size={14} className="text-text-muted" />}
                </span>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-overlay border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="City (optional)"
              placeholder="New York"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Add Server
            </Button>
          </div>
        </div>
      )}

      {/* Server list */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading servers…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
          <Globe size={40} className="opacity-30" />
          <p className="text-sm">
            {search || region !== "all"
              ? "No servers match your filters."
              : "No servers configured. Add one to get started."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {countryGroups.map(([code, group]) => {
            const country = code !== "__none__" ? getCountry(code) : undefined;
            const groupLabel = country
              ? `${countryFlag(code)} ${country.name}`
              : "Other";

            return (
              <div key={code} className="flex flex-col gap-2">
                {/* Country group header — only show when there are multiple groups */}
                {countryGroups.length > 1 && (
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">
                    {groupLabel}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {group.map((s) => (
                    <ServerCard key={s.id} server={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
