export const APP_NAME = "ZeroVPN";
export const APP_VERSION = "0.1.0";

export const POLL_INTERVAL = 2000; // 2 seconds for VPN status
export const STATS_INTERVAL = 1000; // 1 second for traffic stats

export const DEFAULT_DNS = ["1.1.1.1", "1.0.0.1"];
export const DEFAULT_MTU = 1420;
export const DEFAULT_PORT = 51820;

export const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/servers", label: "Servers", icon: "Server" },
  { path: "/settings", label: "Settings", icon: "Settings" },
  { path: "/routing", label: "Routing", icon: "Route" },
  { path: "/account", label: "Account", icon: "User" },
] as const;

// ---------------------------------------------------------------------------
// Server regions & countries (NordVPN-style)
// ---------------------------------------------------------------------------

export type Region = "all" | "americas" | "europe" | "asia_pacific" | "mea";

export interface Country {
  code: string;   // ISO 3166-1 alpha-2
  name: string;   // Display name
  region: Exclude<Region, "all">;
}

/** Full country list grouped by region. */
export const COUNTRIES: Country[] = [
  // Americas
  { code: "US", name: "United States", region: "americas" },
  { code: "CA", name: "Canada", region: "americas" },
  { code: "MX", name: "Mexico", region: "americas" },
  { code: "BR", name: "Brazil", region: "americas" },
  { code: "AR", name: "Argentina", region: "americas" },
  { code: "CL", name: "Chile", region: "americas" },
  { code: "CO", name: "Colombia", region: "americas" },
  { code: "PE", name: "Peru", region: "americas" },

  // Europe
  { code: "GB", name: "United Kingdom", region: "europe" },
  { code: "DE", name: "Germany", region: "europe" },
  { code: "FR", name: "France", region: "europe" },
  { code: "ES", name: "Spain", region: "europe" },
  { code: "IT", name: "Italy", region: "europe" },
  { code: "NL", name: "Netherlands", region: "europe" },
  { code: "SE", name: "Sweden", region: "europe" },
  { code: "NO", name: "Norway", region: "europe" },
  { code: "FI", name: "Finland", region: "europe" },
  { code: "DK", name: "Denmark", region: "europe" },
  { code: "PL", name: "Poland", region: "europe" },
  { code: "AT", name: "Austria", region: "europe" },
  { code: "CH", name: "Switzerland", region: "europe" },
  { code: "BE", name: "Belgium", region: "europe" },
  { code: "PT", name: "Portugal", region: "europe" },
  { code: "IE", name: "Ireland", region: "europe" },
  { code: "RO", name: "Romania", region: "europe" },
  { code: "CZ", name: "Czech Republic", region: "europe" },
  { code: "HU", name: "Hungary", region: "europe" },
  { code: "GR", name: "Greece", region: "europe" },
  { code: "BG", name: "Bulgaria", region: "europe" },
  { code: "SK", name: "Slovakia", region: "europe" },
  { code: "LT", name: "Lithuania", region: "europe" },
  { code: "SI", name: "Slovenia", region: "europe" },
  { code: "HR", name: "Croatia", region: "europe" },
  { code: "LU", name: "Luxembourg", region: "europe" },
  { code: "LV", name: "Latvia", region: "europe" },
  { code: "EE", name: "Estonia", region: "europe" },
  { code: "MT", name: "Malta", region: "europe" },
  { code: "CY", name: "Cyprus", region: "europe" },

  // Asia Pacific
  { code: "JP", name: "Japan", region: "asia_pacific" },
  { code: "KR", name: "South Korea", region: "asia_pacific" },
  { code: "IN", name: "India", region: "asia_pacific" },
  { code: "AU", name: "Australia", region: "asia_pacific" },
  { code: "NZ", name: "New Zealand", region: "asia_pacific" },
  { code: "SG", name: "Singapore", region: "asia_pacific" },
  { code: "HK", name: "Hong Kong", region: "asia_pacific" },

  // Middle East & Africa
  { code: "ZA", name: "South Africa", region: "mea" },
  { code: "EG", name: "Egypt", region: "mea" },
  { code: "NG", name: "Nigeria", region: "mea" },
  { code: "KE", name: "Kenya", region: "mea" },
  { code: "AE", name: "United Arab Emirates", region: "mea" },
  { code: "SA", name: "Saudi Arabia", region: "mea" },
  { code: "TR", name: "Turkey", region: "mea" },
  { code: "IL", name: "Israel", region: "mea" },
];

/** Region tab labels. */
export const REGION_TABS: { key: Region; label: string }[] = [
  { key: "all", label: "All" },
  { key: "americas", label: "Americas" },
  { key: "europe", label: "Europe" },
  { key: "asia_pacific", label: "Asia Pacific" },
  { key: "mea", label: "Middle East & Africa" },
];

/** Look up a country by ISO code. */
export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/** Convert a 2-letter ISO country code to a flag emoji (🇺🇸, etc.). */
export function countryFlag(code: string): string {
  if (code.length !== 2) return "\u{1F310}"; // globe emoji fallback
  const base = 0x1f1e6; // regional indicator symbol letter A
  const hi = base + (code.charCodeAt(0) - 65); // 'A' = 65
  const lo = base + (code.charCodeAt(1) - 65);
  return String.fromCodePoint(hi, lo);
}

/**
 * Get all countries belonging to a region.
 * Pass "all" to return every country.
 */
export function countriesInRegion(region: Region): Country[] {
  if (region === "all") return COUNTRIES;
  return COUNTRIES.filter((c) => c.region === region);
}
