export type KPIStatus = "ok" | "warning" | "ko" | "no_data";
export type KPIGroup = "serveis" | "projectes" | "valor";

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
  n8n_workflow_id: string | null;
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
  n8n_workflow_id?: string;
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
  n8n_workflow_id?: string | null;
  active?: boolean;
  years?: number[];
}

export interface KPIValue {
  id: string;
  year: number;
  month: number;
  value: number;
  collected_at: string;
  collection_method: string;
  notes: string | null;
}

export interface KPIValueCreate {
  year: number;
  month: number;
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
