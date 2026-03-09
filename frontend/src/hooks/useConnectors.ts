import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { credentialApi, connectorApi } from "@/api/client";
import type { CredentialCreate, CredentialUpdate, ConnectorCreate, ConnectorUpdate } from "@/types/connector";

// ── Credentials ──

export function useCredentials(activeOnly = false) {
  return useQuery({
    queryKey: ["credentials", activeOnly],
    queryFn: () => credentialApi.list(activeOnly).then((r) => r.data),
  });
}

export function useCredentialsSummary() {
  return useQuery({
    queryKey: ["credentials-summary"],
    queryFn: () => credentialApi.summary().then((r) => r.data),
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CredentialCreate) => credentialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["credentials-summary"] });
    },
  });
}

export function useUpdateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CredentialUpdate }) =>
      credentialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["credentials-summary"] });
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => credentialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["credentials-summary"] });
    },
  });
}

// ── Connectors ──

export function useConnectors(activeOnly = false) {
  return useQuery({
    queryKey: ["connectors", activeOnly],
    queryFn: () => connectorApi.list(activeOnly).then((r) => r.data),
  });
}

export function useConnectorsSummary() {
  return useQuery({
    queryKey: ["connectors-summary"],
    queryFn: () => connectorApi.summary().then((r) => r.data),
  });
}

export function useCreateConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectorCreate) => connectorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
      queryClient.invalidateQueries({ queryKey: ["connectors-summary"] });
    },
  });
}

export function useUpdateConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConnectorUpdate }) =>
      connectorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
      queryClient.invalidateQueries({ queryKey: ["connectors-summary"] });
    },
  });
}

export function useDeleteConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => connectorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
      queryClient.invalidateQueries({ queryKey: ["connectors-summary"] });
    },
  });
}
