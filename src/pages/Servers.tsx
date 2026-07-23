import { useEffect, useState } from "react";
import { Search, Plus, Upload } from "lucide-react";
import { useServerStore } from "../stores/serverStore";
import ServerCard from "../components/vpn/ServerCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Servers() {
  const { servers, loading, fetchServers, addServer } = useServerStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");
  const [newPublicKey, setNewPublicKey] = useState("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.endpoint.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newName || !newEndpoint || !newPublicKey || !newAddress) return;
    await addServer(newName, newEndpoint, newPublicKey, newAddress, "1.1.1.1");
    setNewName("");
    setNewEndpoint("");
    setNewPublicKey("");
    setNewAddress("");
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Servers</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload size={16} />
            Import .conf
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} />
            Add Server
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search servers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Add server form */}
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
        <div className="text-center py-12 text-text-muted">Loading servers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          {search ? "No servers match your search." : "No servers configured. Add one to get started."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}
