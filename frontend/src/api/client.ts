import axios from "axios";
import type { Dashboard } from "@/types/dashboard";
import type { KPIDefinition, KPIValue, KPIValueCreate, KPIValueUpdate, KPIStatusResponse } from "@/types/kpi";
import type { Project } from "@/types/project";
import type { OKRObjective } from "@/types/okr";
import type { ValueSummary, ROI } from "@/types/value";

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
};

export const projectApi = {
  list: () => api.get<Project[]>("/projects/"),
  update: (code: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${code}`, data),
};

export const okrApi = {
  list: (year?: number) =>
    api.get<OKRObjective[]>("/okrs/", { params: { year } }),
  updateQuarterly: (id: string, data: { actual?: number; notes?: string }) =>
    api.put(`/okrs/quarterly/${id}`, data),
};

export const valueApi = {
  getSummary: (year?: number) =>
    api.get<ValueSummary>("/value/", { params: { year } }),
  getRoi: (year?: number) =>
    api.get<ROI>("/value/roi", { params: { year } }),
};

export default api;
