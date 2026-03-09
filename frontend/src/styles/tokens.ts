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
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  okr: "#a78bfa",
  blueMoney: "#3b82f6",
  greenMoney: "#10b981",
  accent: "#22d3ee",
} as const;

/** Returns theme-aware chart helper colors by reading CSS variables. */
export function getChartThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    grid: style.getPropertyValue("--color-border").trim() || "#1e293b",
    axis: style.getPropertyValue("--color-border").trim() || "#1e293b",
    tickFill: style.getPropertyValue("--color-text-tertiary").trim() || "#64748b",
    surface: style.getPropertyValue("--color-surface").trim() || "#0d1526",
    primary: style.getPropertyValue("--color-primary").trim() || "#060b18",
  };
}
