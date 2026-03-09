import { create } from "zustand";

export type Theme = "light" | "dark" | "auto";

function getAutoTheme(): "light" | "dark" {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 20 ? "light" : "dark";
}

interface AppState {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: 2025,
  setSelectedYear: (year) => set({ selectedYear: year }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: "auto",
  setTheme: (theme) =>
    set({
      theme,
      resolvedTheme: theme === "auto" ? getAutoTheme() : theme,
    }),
  resolvedTheme: getAutoTheme(),
}));
