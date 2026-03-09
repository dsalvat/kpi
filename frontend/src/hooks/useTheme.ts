import { useEffect } from "react";
import { useAppStore } from "@/store";

/**
 * Applies the resolved theme to <html data-theme="...">.
 * In "auto" mode, re-checks every 60s so the switch at 7:00/20:00 is seamless.
 */
export function useThemeEffect() {
  const theme = useAppStore((s) => s.theme);
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const setTheme = useAppStore((s) => s.setTheme);

  // Apply to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Auto-refresh every 60s when in auto mode
  useEffect(() => {
    if (theme !== "auto") return;
    const interval = setInterval(() => {
      // Re-trigger auto calculation
      setTheme("auto");
    }, 60_000);
    return () => clearInterval(interval);
  }, [theme, setTheme]);
}
