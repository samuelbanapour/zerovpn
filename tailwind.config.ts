import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0e17",
          raised: "#111827",
          overlay: "#1a2332",
        },
        accent: {
          DEFAULT: "#06d6a0",
          hover: "#05c493",
          muted: "#06d6a020",
        },
        danger: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        border: {
          DEFAULT: "#1e293b",
          hover: "#334155",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(6, 214, 160, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(6, 214, 160, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
