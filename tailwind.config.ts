import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        accent: {
          red: "var(--color-accent-red)",
          "red-deep": "var(--color-accent-red-deep)",
          orange: "var(--color-accent-orange)",
          glow: "var(--color-accent-glow)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "Anton", "Impact", "sans-serif"],
        heading: ["var(--font-heading)", "Space Grotesk", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF2A2A 0%, #FF003C 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(255,42,42,0.15) 0%, rgba(255,0,60,0.15) 100%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,42,42,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(255,23,68,0.45)" },
        },
        "border-spin": {
          "0%": { "--angle": "0deg" },
          "100%": { "--angle": "360deg" },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
        "marquee-fast": "marquee 18s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        "border-spin": "border-spin 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
