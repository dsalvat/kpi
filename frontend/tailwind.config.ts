import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        secondary: "var(--color-secondary)",
        "secondary-light": "var(--color-secondary-light)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        "success-light": "var(--color-success-light)",
        warning: "var(--color-warning)",
        "warning-light": "var(--color-warning-light)",
        danger: "var(--color-danger)",
        "danger-light": "var(--color-danger-light)",
        "blue-money": "var(--color-blue-money)",
        "blue-money-light": "var(--color-blue-money-light)",
        "green-money": "var(--color-green-money)",
        "green-money-light": "var(--color-green-money-light)",
        okr: "var(--color-okr)",
        "okr-light": "var(--color-okr-light)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "status-ok": "var(--status-ok)",
        "status-warning": "var(--status-warning)",
        "status-ko": "var(--status-ko)",
        "status-nodata": "var(--status-nodata)",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"Menlo"', "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      borderRadius: {
        card: "12px",
      },
      zIndex: {
        nav: "100",
        tooltip: "500",
        modal: "1000",
      },
    },
  },
  plugins: [],
} satisfies Config;
