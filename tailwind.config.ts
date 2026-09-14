import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "rgb(var(--base) / <alpha-value>)",
          raised: "rgb(var(--base-raised) / <alpha-value>)",
          overlay: "rgb(var(--base-overlay) / <alpha-value>)",
        },
        glass: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          border: "rgb(var(--border) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
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
          violet: "#6366F1",
          magenta: "#8B5CF6",
          amber: "#F59E0B",
        },
        success: { DEFAULT: "#16A34A", subtle: "rgb(var(--success-subtle) / <alpha-value>)" },
        warning: { DEFAULT: "#D97706", subtle: "rgb(var(--warning-subtle) / <alpha-value>)" },
        danger: { DEFAULT: "#DC2626", subtle: "rgb(var(--danger-subtle) / <alpha-value>)" },
        info: { DEFAULT: "#2563EB", subtle: "rgb(var(--info-subtle) / <alpha-value>)" },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 8px 24px -12px rgba(37,99,235,0.35)",
        "glow-lg": "0 12px 32px -14px rgba(37,99,235,0.4)",
        glass: "0 8px 24px rgba(15,23,42,0.08)",
      },
      backdropBlur: { xs: "2px" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
