import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kpiApi } from "@/api/client";
import type { KPIValueCreate, KPIValueUpdate } from "@/types/kpi";
import { useAppStore } from "@/store";

export function useKPIs(opts?: { category?: string; group?: string }) {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["kpis", opts?.category, opts?.group, year],
    queryFn: () =>
      kpiApi.list(opts?.category, year, opts?.group).then((r) => r.data),
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

export function useUpdateKPIValue(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: KPIValueUpdate }) =>
      kpiApi.updateValue(code, valueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpi-values", code] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteKPIValue(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => kpiApi.deleteValue(code, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpi-values", code] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
