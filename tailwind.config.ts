import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0B0F17",
          light: "#111827",
          card: "#141C2B",
          border: "#232F45",
        },
        paper: {
          DEFAULT: "#161F30",
          light: "#1E293B",
          accent: "#28354D",
        },
        gold: {
          DEFAULT: "#F59E0B",
          glow: "#FBBF24",
          dark: "#B45309",
        },
        stamp: {
          red: "#EF4444",
          green: "#10B981",
          amber: "#F59E0B",
        },
      },
      fontFamily: {
        display: ["'Outfit'", "'Space Grotesk'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        dossier: "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.05)",
        stamp: "0 0 20px currentColor, inset 0 0 10px currentColor",
        neon: "0 0 25px rgba(245, 158, 11, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
