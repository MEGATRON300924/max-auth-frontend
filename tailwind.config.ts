import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#05070D",
          raised: "#0A0E18",
          overlay: "#0D1220",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.10)",
          hover: "rgba(255,255,255,0.09)",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        aurora: {
          blue: "#3B82F6",
          violet: "#8B5CF6",
          magenta: "#D946EF",
          amber: "#F59E0B",
        },
        success: { DEFAULT: "#22C55E", subtle: "rgba(34,197,94,0.12)" },
        warning: { DEFAULT: "#F59E0B", subtle: "rgba(245,158,11,0.12)" },
        danger: { DEFAULT: "#EF4444", subtle: "rgba(239,68,68,0.12)" },
        info: { DEFAULT: "#3B82F6", subtle: "rgba(59,130,246,0.12)" },
        ink: {
          DEFAULT: "#F5F7FA",
          muted: "#A3ADC2",
          faint: "#6B7386",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(59,130,246,0.45)",
        "glow-lg": "0 0 80px -16px rgba(59,130,246,0.55)",
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      backdropBlur: { xs: "2px" },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.05)" },
          "66%": { transform: "translate(-2%, 3%) scale(0.98)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        drift: "drift 22s ease-in-out infinite",
        "drift-slow": "drift 34s ease-in-out infinite reverse",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
