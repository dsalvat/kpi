import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { okrApi } from "@/api/client";
import { useAppStore } from "@/store";
import type {
  OKRObjectiveCreate,
  OKRObjectiveUpdate,
  OKRKeyResultCreate,
  OKRKeyResultUpdate,
} from "@/types/okr";

export function useOKRs() {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["okrs", year],
    queryFn: () => okrApi.list(year).then((r) => r.data),
  });
}

export function useUpdateQuarterly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { actual?: number; notes?: string; reset_auto?: boolean };
    }) => okrApi.updateQuarterly(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Objective CRUD ───────────────────────────────────────────

export function useCreateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OKRObjectiveCreate) =>
      okrApi.createObjective(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OKRObjectiveUpdate }) =>
      okrApi.updateObjective(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => okrApi.deleteObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Key Result CRUD ──────────────────────────────────────────

export function useCreateKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OKRKeyResultCreate) =>
      okrApi.createKeyResult(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OKRKeyResultUpdate }) =>
      okrApi.updateKeyResult(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => okrApi.deleteKeyResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
