import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "@/api/client";
import type { BudgetItemCreate, BudgetItemUpdate, BudgetLookupCategory, BudgetLookupCreate, BudgetLookupUpdate } from "@/types/budget";

export function useBudgetItems(year: number, includeInactive = false) {
  return useQuery({
    queryKey: ["budget", "items", year, includeInactive],
    queryFn: () => budgetApi.list(year, includeInactive).then((r) => r.data),
    enabled: !!year,
  });
}

export function useBudgetSummary(year: number) {
  return useQuery({
    queryKey: ["budget", "summary", year],
    queryFn: () => budgetApi.summary(year).then((r) => r.data),
    enabled: !!year,
  });
}

export function useBudgetYears() {
  return useQuery({
    queryKey: ["budget", "years"],
    queryFn: () => budgetApi.years().then((r) => r.data.years),
  });
}

export function useCreateBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetItemCreate) => budgetApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useUpdateBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetItemUpdate }) =>
      budgetApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useDeleteBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

// ── Budget Lookups ──

export function useBudgetLookups(category?: BudgetLookupCategory, includeInactive = false) {
  return useQuery({
    queryKey: ["budget", "lookups", category, includeInactive],
    queryFn: () => budgetApi.listLookups(category, includeInactive).then((r) => r.data),
  });
}

export function useCreateBudgetLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetLookupCreate) => budgetApi.createLookup(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget", "lookups"] });
    },
  });
}

export function useUpdateBudgetLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetLookupUpdate }) =>
      budgetApi.updateLookup(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget", "lookups"] });
    },
  });
}

export function useDeleteBudgetLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.deleteLookup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget", "lookups"] });
    },
  });
}
