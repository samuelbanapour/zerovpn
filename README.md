# ZeroVPN

Self-hosted WireGuard VPN client built with Tauri + React.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide icons
- **Backend**: Tauri 2.x, Rust
- **VPN Protocol**: WireGuard (stubbed for initial UI development)

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (Vite only)
npm run dev

# Run with Tauri (full desktop app)
npx tauri dev

# Build for production
npx tauri build
```

## Project Structure

```
src-tauri/          # Rust backend (Tauri commands, VPN management)
src/                # React frontend
  components/       # Reusable UI components
  pages/            # Route-based pages (Dashboard, Servers, Settings, Routing, Account)
  stores/           # Zustand state management
  hooks/            # Custom React hooks
  lib/              # Utilities and Tauri invoke wrappers
  types/            # TypeScript type definitions
```

## Pages

- **Dashboard**: Connection status, traffic stats, uptime timer, IP info
- **Servers**: Browse, add, import WireGuard configs, connect/disconnect
- **Settings**: Start on boot, minimize to tray, kill switch, DNS, MTU
- **Routing**: Split tunneling, exclude apps/IPs from VPN tunnel
- **Account**: Device info, local account details

## Status

Phase 1 complete: Full UI shell with mock data. WireGuard tunnel management is stubbed — all Tauri commands return mock responses so the frontend can be developed and tested independently. Real WireGuard integration is planned for Phase 2.
