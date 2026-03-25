import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/client";
import type {
  CompanyCreate,
  DepartmentCreate,
  AreaCreate,
  TeamCreate,
  MemberCreate,
  MemberUpdate,
} from "@/types/organization";

// ── Companies ──

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => organizationApi.listCompanies().then((r) => r.data),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyCreate) =>
      organizationApi.createCompany(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompanyCreate> }) =>
      organizationApi.updateCompany(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteCompany(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

// ── Departments (includes nested areas > teams > members) ──

export function useDepartments(companyId: string | undefined) {
  return useQuery({
    queryKey: ["departments", companyId],
    queryFn: () =>
      organizationApi.listDepartments(companyId!).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: DepartmentCreate;
    }) => organizationApi.createDepartment(companyId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => organizationApi.updateDepartment(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

// ── Areas ──

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AreaCreate) =>
      organizationApi.createArea(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => organizationApi.updateArea(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteArea(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

// ── Teams ──

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamCreate) =>
      organizationApi.createTeam(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => organizationApi.updateTeam(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

// ── Members ──

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: MemberCreate;
    }) => organizationApi.createMember(companyId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["members-summary"] });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdate }) =>
      organizationApi.updateMember(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["members-summary"] });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["members-summary"] });
    },
  });
}

export function useTeamsSummary(companyId: string | null) {
  return useQuery({
    queryKey: ["teams-summary", companyId],
    queryFn: () =>
      organizationApi.listTeamsSummary(companyId!).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useMembers(companyId: string | null) {
  return useQuery({
    queryKey: ["members", companyId],
    queryFn: () =>
      organizationApi.listMembers(companyId!).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useMembersSummary(companyId: string | null) {
  return useQuery({
    queryKey: ["members-summary", companyId],
    queryFn: () =>
      organizationApi.listMembersSummary(companyId!).then((r) => r.data),
    enabled: !!companyId,
  });
}
