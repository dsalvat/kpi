import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kpiApi } from "@/api/client";
import type { KPIValueCreate } from "@/types/kpi";
import { useAppStore } from "@/store";

export function useKPIs(category?: string) {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["kpis", category, year],
    queryFn: () => kpiApi.list(category, year).then((r) => r.data),
  });
}

export function useKPIValues(code: string) {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["kpi-values", code, year],
    queryFn: () => kpiApi.getValues(code, year).then((r) => r.data),
    enabled: !!code,
  });
}

export function useCreateKPIValue(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KPIValueCreate) => kpiApi.createValue(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpi-values", code] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
