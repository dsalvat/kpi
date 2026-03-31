import type { SourceType } from "./connector";

export type KPIStatus = "ok" | "warning" | "ko" | "no_data";
export type KPIGroup = "serveis" | "projectes" | "valor";
export type KPIFrequency = "monthly" | "weekly";

export interface KPIDefinition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  calculation_method: string | null;
  group: KPIGroup;
  category: string;
  unit: string;
  target: number;
  direction: "higher_better" | "lower_better";
  source: string;
  source_type: SourceType;
  connector_id: string | null;
  connector_name: string | null;
  n8n_workflow_id: string | null;
  frequency: KPIFrequency;
  is_annual_objective: boolean;
  active: boolean;
  years: number[];
  current_value: number | null;
  current_status: KPIStatus | null;
  current_month: number | null;
}

export interface KPIDefinitionCreate {
  code: string;
  name: string;
  description?: string;
  calculation_method?: string;
  group: KPIGroup;
  category: string;
  unit: string;
  target: number;
  direction: "higher_better" | "lower_better";
  source?: string;
  source_type?: SourceType;
  connector_id?: string | null;
  n8n_workflow_id?: string;
  frequency?: KPIFrequency;
  is_annual_objective?: boolean;
  active?: boolean;
  years: number[];
}

export interface KPIDefinitionUpdate {
  code?: string;
  name?: string;
  description?: string | null;
  calculation_method?: string | null;
  group?: KPIGroup;
  category?: string;
  unit?: string;
  target?: number;
  direction?: "higher_better" | "lower_better";
  source?: string;
  source_type?: SourceType;
  connector_id?: string | null;
  n8n_workflow_id?: string | null;
  frequency?: KPIFrequency;
  is_annual_objective?: boolean;
  active?: boolean;
  years?: number[];
}

export interface KPIValue {
  id: string;
  year: number;
  month: number;
  week: number | null;
  value: number;
  collected_at: string;
  collection_method: string;
  notes: string | null;
}

export interface KPIValueCreate {
  year: number;
  month?: number;
  week?: number;
  value: number;
  notes?: string;
}

export interface KPIValueUpdate {
  value: number;
  notes?: string;
}

export interface KPIStatusResponse {
  code: string;
  name: string;
  status: KPIStatus;
  value: number | null;
  target: number;
  progress: number | null;
}
