import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processApi } from "@/api/client";
import type { ProcessLabelCreate, ProcessLabelUpdate, ProcessDocumentCreate, ProcessDocumentUpdate } from "@/types/process";

// ── Labels ──

export function useProcessLabels(companyId: string | undefined) {
  return useQuery({
    queryKey: ["process-labels", companyId],
    queryFn: () => processApi.listLabels(companyId!).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useCreateProcessLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: ProcessLabelCreate }) =>
      processApi.createLabel(companyId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["process-labels"] }),
  });
}

export function useUpdateProcessLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessLabelUpdate }) =>
      processApi.updateLabel(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-labels"] });
      qc.invalidateQueries({ queryKey: ["process-documents"] });
    },
  });
}

export function useDeleteProcessLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processApi.deleteLabel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-labels"] });
      qc.invalidateQueries({ queryKey: ["process-documents"] });
    },
  });
}

// ── Documents ──

export function useProcessDocuments(companyId: string | undefined, labelId?: string) {
  return useQuery({
    queryKey: ["process-documents", companyId, labelId],
    queryFn: () => processApi.listDocuments(companyId!, labelId).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useProcessDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: ["process-document", documentId],
    queryFn: () => processApi.getDocument(documentId!).then((r) => r.data),
    enabled: !!documentId,
  });
}

export function useCreateProcessDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: ProcessDocumentCreate }) =>
      processApi.createDocument(companyId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["process-documents"] }),
  });
}

export function useUpdateProcessDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessDocumentUpdate }) =>
      processApi.updateDocument(id, data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["process-documents"] });
      qc.invalidateQueries({ queryKey: ["process-document", variables.id] });
    },
  });
}

export function useDeleteProcessDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processApi.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["process-documents"] }),
  });
}
