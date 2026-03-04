export const colors = {
  primary: "var(--color-primary)",
  primaryLight: "var(--color-primary-light)",
  secondary: "var(--color-secondary)",
  secondaryLight: "var(--color-secondary-light)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  blueMoney: "var(--color-blue-money)",
  greenMoney: "var(--color-green-money)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  okr: "var(--color-okr)",
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  border: "var(--color-border)",
} as const;

export const statusColors = {
  ok: "var(--status-ok)",
  warning: "var(--status-warning)",
  ko: "var(--status-ko)",
  no_data: "var(--status-nodata)",
} as const;

export const chartColors = {
  primary: "#060b18",
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  okr: "#a78bfa",
  blueMoney: "#3b82f6",
  greenMoney: "#10b981",
  accent: "#22d3ee",
  /* Dark theme chart helpers */
  grid: "#1e293b",
  axis: "#1e293b",
  tickFill: "#64748b",
  surface: "#0d1526",
} as const;
