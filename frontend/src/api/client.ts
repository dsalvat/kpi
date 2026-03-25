import axios from "axios";
import type { Credential, CredentialCreate, CredentialUpdate, CredentialSummary, Connector, ConnectorCreate, ConnectorUpdate, ConnectorSummary } from "@/types/connector";
import type { Dashboard } from "@/types/dashboard";
import type { KPIDefinition, KPIDefinitionCreate, KPIDefinitionUpdate, KPIValue, KPIValueCreate, KPIValueUpdate, KPIStatusResponse } from "@/types/kpi";
import type { Project, ProjectCreate } from "@/types/project";
import type { OKRObjective, OKRKeyResult, OKRObjectiveCreate, OKRObjectiveUpdate, OKRKeyResultCreate, OKRKeyResultUpdate } from "@/types/okr";
import type { ValueSummary, ROI } from "@/types/value";
import type { BudgetItem, BudgetItemCreate, BudgetItemUpdate, BudgetSummary, BudgetLookup, BudgetLookupCreate, BudgetLookupUpdate, BudgetLookupCategory } from "@/types/budget";
import type { Company, CompanyCreate, Department, DepartmentCreate, Area, AreaCreate, Team, TeamCreate, TeamSummary, Member, MemberCreate, MemberUpdate, MemberSummary } from "@/types/organization";
import type { ProcessLabel, ProcessLabelCreate, ProcessLabelUpdate, ProcessDocument, ProcessDocumentCreate, ProcessDocumentUpdate, ProcessDocumentSummary } from "@/types/process";
import type { ScorecardTreeNode, IndicatorValueCreate, IndicatorValue } from "@/types/scorecard";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>("/auth/login", {
      username,
      password,
    }),
  me: () => api.get("/auth/me"),
};

export const dashboardApi = {
  get: (year?: number) =>
    api.get<Dashboard>(year ? `/dashboard/year/${year}` : "/dashboard/"),
};

export const kpiApi = {
  list: (category?: string, year?: number, group?: string) =>
    api.get<KPIDefinition[]>("/kpis/", { params: { category, group, year } }),
  getValues: (code: string, year: number) =>
    api.get<KPIValue[]>(`/kpis/${code}/values`, { params: { year } }),
  createValue: (code: string, data: KPIValueCreate) =>
    api.post<KPIValue>(`/kpis/${code}/values`, data),
  updateValue: (code: string, valueId: string, data: KPIValueUpdate) =>
    api.put<KPIValue>(`/kpis/${code}/values/${valueId}`, data),
  deleteValue: (code: string, valueId: string) =>
    api.delete(`/kpis/${code}/values/${valueId}`),
  getStatus: (code: string) =>
    api.get<KPIStatusResponse>(`/kpis/${code}/status`),
  listAll: (includeInactive?: boolean) =>
    api.get<KPIDefinition[]>("/kpis/all", { params: { include_inactive: includeInactive } }),
  create: (data: KPIDefinitionCreate) =>
    api.post<KPIDefinition>("/kpis/", data),
  update: (code: string, data: KPIDefinitionUpdate) =>
    api.put<KPIDefinition>(`/kpis/${code}`, data),
  deleteDefinition: (code: string) =>
    api.delete(`/kpis/${code}`),
  getAvailableYears: () =>
    api.get<{ year: number; kpi_count: number }[]>("/kpis/years/available"),
  activateYear: (year: number) =>
    api.post<{ year: number; kpis_added: number }>(`/kpis/years/${year}/activate`),
  deactivateYear: (year: number) =>
    api.post<{ year: number; kpis_removed: number }>(`/kpis/years/${year}/deactivate`),
};

export const credentialApi = {
  list: (activeOnly = false) =>
    api.get<Credential[]>("/settings/credentials/", { params: { active_only: activeOnly } }),
  summary: () =>
    api.get<CredentialSummary[]>("/settings/credentials/summary"),
  create: (data: CredentialCreate) =>
    api.post<Credential>("/settings/credentials/", data),
  update: (id: string, data: CredentialUpdate) =>
    api.put<Credential>(`/settings/credentials/${id}`, data),
  delete: (id: string) =>
    api.delete(`/settings/credentials/${id}`),
};

export const connectorApi = {
  list: (activeOnly = false) =>
    api.get<Connector[]>("/settings/connectors/", { params: { active_only: activeOnly } }),
  summary: () =>
    api.get<ConnectorSummary[]>("/settings/connectors/summary"),
  create: (data: ConnectorCreate) =>
    api.post<Connector>("/settings/connectors/", data),
  update: (id: string, data: ConnectorUpdate) =>
    api.put<Connector>(`/settings/connectors/${id}`, data),
  delete: (id: string) =>
    api.delete(`/settings/connectors/${id}`),
};

export const projectApi = {
  list: () => api.get<Project[]>("/projects/"),
  create: (data: ProjectCreate) =>
    api.post<Project>("/projects/", data),
  update: (code: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${code}`, data),
  delete: (code: string) =>
    api.delete(`/projects/${code}`),
};

export const okrApi = {
  list: (year?: number) =>
    api.get<OKRObjective[]>("/okrs/", { params: { year } }),
  createObjective: (data: OKRObjectiveCreate) =>
    api.post<OKRObjective>("/okrs/", data),
  updateObjective: (id: string, data: OKRObjectiveUpdate) =>
    api.put<OKRObjective>(`/okrs/${id}`, data),
  deleteObjective: (id: string) =>
    api.delete(`/okrs/${id}`),
  createKeyResult: (data: OKRKeyResultCreate) =>
    api.post<OKRKeyResult>("/okrs/key-results/", data),
  updateKeyResult: (id: string, data: OKRKeyResultUpdate) =>
    api.put<OKRKeyResult>(`/okrs/key-results/${id}`, data),
  deleteKeyResult: (id: string) =>
    api.delete(`/okrs/key-results/${id}`),
  updateQuarterly: (id: string, data: { actual?: number; notes?: string; reset_auto?: boolean }) =>
    api.put(`/okrs/quarterly/${id}`, data),
};

export const valueApi = {
  getSummary: (year?: number) =>
    api.get<ValueSummary>("/value/", { params: { year } }),
  getRoi: (year?: number) =>
    api.get<ROI>("/value/roi", { params: { year } }),
};

export const budgetApi = {
  list: (year: number, includeInactive = false) =>
    api.get<BudgetItem[]>("/budget/", { params: { year, include_inactive: includeInactive } }),
  get: (id: string) =>
    api.get<BudgetItem>(`/budget/${id}/`),
  create: (data: BudgetItemCreate) =>
    api.post<BudgetItem>("/budget/", data),
  update: (id: string, data: BudgetItemUpdate) =>
    api.put<BudgetItem>(`/budget/${id}/`, data),
  delete: (id: string) =>
    api.delete(`/budget/${id}/`),
  summary: (year: number) =>
    api.get<BudgetSummary>(`/budget/summary/`, { params: { year } }),
  years: () =>
    api.get<{ years: number[] }>("/budget/years/"),
  listLookups: (category?: BudgetLookupCategory, includeInactive = false) =>
    api.get<BudgetLookup[]>("/budget/lookups/", { params: { category, include_inactive: includeInactive } }),
  createLookup: (data: BudgetLookupCreate) =>
    api.post<BudgetLookup>("/budget/lookups/", data),
  updateLookup: (id: string, data: BudgetLookupUpdate) =>
    api.put<BudgetLookup>(`/budget/lookups/${id}/`, data),
  deleteLookup: (id: string) =>
    api.delete(`/budget/lookups/${id}/`),
};

export const organizationApi = {
  // Companies
  listCompanies: () =>
    api.get<Company[]>("/organization/companies/"),
  createCompany: (data: CompanyCreate) =>
    api.post<Company>("/organization/companies/", data),
  updateCompany: (id: string, data: Partial<Company>) =>
    api.put<Company>(`/organization/companies/${id}`, data),
  deleteCompany: (id: string) =>
    api.delete(`/organization/companies/${id}`),

  // Departments
  listDepartments: (companyId: string) =>
    api.get<Department[]>(`/organization/companies/${companyId}/departments/`),
  createDepartment: (companyId: string, data: DepartmentCreate) =>
    api.post<Department>(`/organization/companies/${companyId}/departments/`, data),
  updateDepartment: (id: string, data: Partial<Department>) =>
    api.put<Department>(`/organization/departments/${id}`, data),
  deleteDepartment: (id: string) =>
    api.delete(`/organization/departments/${id}`),

  // Areas
  createArea: (data: AreaCreate) =>
    api.post<Area>("/organization/areas/", data),
  updateArea: (id: string, data: Partial<Area>) =>
    api.put<Area>(`/organization/areas/${id}`, data),
  deleteArea: (id: string) =>
    api.delete(`/organization/areas/${id}`),

  // Teams
  createTeam: (data: TeamCreate) =>
    api.post<Team>("/organization/teams/", data),
  updateTeam: (id: string, data: Partial<Team>) =>
    api.put<Team>(`/organization/teams/${id}`, data),
  deleteTeam: (id: string) =>
    api.delete(`/organization/teams/${id}`),
  listTeamsSummary: (companyId: string) =>
    api.get<TeamSummary[]>(`/organization/companies/${companyId}/teams/summary`),

  // Members
  listMembers: (companyId: string, params?: { team_id?: string; unassigned?: boolean }) =>
    api.get<Member[]>(`/organization/companies/${companyId}/members/`, { params }),
  listMembersSummary: (companyId: string) =>
    api.get<MemberSummary[]>(`/organization/companies/${companyId}/members/summary`),
  createMember: (companyId: string, data: MemberCreate) =>
    api.post<Member>(`/organization/companies/${companyId}/members/`, data),
  updateMember: (id: string, data: MemberUpdate) =>
    api.put<Member>(`/organization/members/${id}`, data),
  deleteMember: (id: string) =>
    api.delete(`/organization/members/${id}`),
};

export const processApi = {
  // Labels
  listLabels: (companyId: string) =>
    api.get<ProcessLabel[]>(`/processes/companies/${companyId}/labels/`),
  createLabel: (companyId: string, data: ProcessLabelCreate) =>
    api.post<ProcessLabel>(`/processes/companies/${companyId}/labels/`, data),
  updateLabel: (labelId: string, data: ProcessLabelUpdate) =>
    api.put<ProcessLabel>(`/processes/labels/${labelId}`, data),
  deleteLabel: (labelId: string) =>
    api.delete(`/processes/labels/${labelId}`),

  // Documents
  listDocuments: (companyId: string, labelId?: string) =>
    api.get<ProcessDocumentSummary[]>(`/processes/companies/${companyId}/documents/`, {
      params: labelId ? { label_id: labelId } : undefined,
    }),
  getDocument: (documentId: string) =>
    api.get<ProcessDocument>(`/processes/documents/${documentId}`),
  createDocument: (companyId: string, data: ProcessDocumentCreate) =>
    api.post<ProcessDocument>(`/processes/companies/${companyId}/documents/`, data),
  updateDocument: (documentId: string, data: ProcessDocumentUpdate) =>
    api.put<ProcessDocument>(`/processes/documents/${documentId}`, data),
  deleteDocument: (documentId: string) =>
    api.delete(`/processes/documents/${documentId}`),
};

export interface IndicatorUpdateData {
  name?: string;
  description?: string;
  category?: string;
  indicator_type?: string;
  target_value?: number;
  unit?: string;
  weight_pct?: number;
  direction?: string;
  frequency?: string;
  start_date?: string | null;
  end_date?: string | null;
  source?: string | null;
}

export const scorecardApi = {
  getTree: (companyId: string, year: number) =>
    api.get<ScorecardTreeNode[]>("/scorecards/tree/", { params: { company_id: companyId, year } }),
  addValue: (indicatorId: string, data: IndicatorValueCreate) =>
    api.post<IndicatorValue>(`/scorecards/indicators/${indicatorId}/values/`, data),
  updateValue: (valueId: string, data: Partial<IndicatorValueCreate>) =>
    api.put<IndicatorValue>(`/scorecards/values/${valueId}`, data),
  updateIndicator: (indicatorId: string, data: IndicatorUpdateData) =>
    api.put(`/scorecards/indicators/${indicatorId}`, data),
};

export default api;
