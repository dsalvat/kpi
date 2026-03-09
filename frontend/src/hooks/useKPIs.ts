import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kpiApi } from "@/api/client";
import type { KPIDefinitionCreate, KPIDefinitionUpdate, KPIValueCreate, KPIValueUpdate } from "@/types/kpi";
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

// ── Master Data (KPI Definition CRUD) ──

export function useAllKPIs(includeInactive = false) {
  return useQuery({
    queryKey: ["kpis-all", includeInactive],
    queryFn: () => kpiApi.listAll(includeInactive).then((r) => r.data),
  });
}

export function useCreateKPIDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KPIDefinitionCreate) => kpiApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpis-all"] });
    },
  });
}

export function useUpdateKPIDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: KPIDefinitionUpdate }) =>
      kpiApi.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpis-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteKPIDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => kpiApi.deleteDefinition(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpis-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Year Management ──

export function useAvailableYears() {
  return useQuery({
    queryKey: ["kpi-years"],
    queryFn: () => kpiApi.getAvailableYears().then((r) => r.data),
  });
}

export function useActivateYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (year: number) => kpiApi.activateYear(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-years"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpis-all"] });
    },
  });
}

export function useDeactivateYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (year: number) => kpiApi.deactivateYear(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-years"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["kpis-all"] });
    },
  });
}
