import { create } from "zustand";

interface AppState {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: 2025,
  setSelectedYear: (year) => set({ selectedYear: year }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
