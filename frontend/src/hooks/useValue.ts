import { useQuery } from "@tanstack/react-query";
import { valueApi } from "@/api/client";
import { useAppStore } from "@/store";

export function useValueSummary() {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["value-summary", year],
    queryFn: () => valueApi.getSummary(year).then((r) => r.data),
  });
}

export function useROI() {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["value-roi", year],
    queryFn: () => valueApi.getRoi(year).then((r) => r.data),
  });
}
