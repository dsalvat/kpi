import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/client";
import { useAppStore } from "@/store";

export function useDashboard() {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["dashboard", year],
    queryFn: () => dashboardApi.get(year).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
