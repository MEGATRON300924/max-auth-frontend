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
        accent: { DEFAULT: "rgb(var(--accent) / <alpha-value>)", foreground: "rgb(var(--accent-foreground) / <alpha-value>)" },
        brand: {
          50: "rgb(var(--accent) / 0.06)",
          100: "rgb(var(--accent) / 0.12)",
          200: "rgb(var(--accent) / 0.2)",
          300: "rgb(var(--accent) / 0.4)",
          400: "rgb(var(--accent) / 0.65)",
          500: "rgb(var(--accent))",
          600: "rgb(var(--accent))",
          700: "rgb(var(--accent))",
          800: "rgb(var(--accent))",
          900: "rgb(var(--accent))",
        },
        success: { DEFAULT: "#16A34A", subtle: "rgb(var(--success-subtle) / <alpha-value>)" },
        warning: { DEFAULT: "#D97706", subtle: "rgb(var(--warning-subtle) / <alpha-value>)" },
        danger: { DEFAULT: "#DC2626", subtle: "rgb(var(--danger-subtle) / <alpha-value>)" },
        info: { DEFAULT: "rgb(var(--accent))", subtle: "rgb(var(--info-subtle) / <alpha-value>)" },
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
        xl: "0.625rem",
        "2xl": "0.75rem",
        "3xl": "0.875rem",
      },
      boxShadow: {
        glow: "none",
        "glow-lg": "none",
        glass: "none",
      },
      backdropBlur: { xs: "2px" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.2s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
