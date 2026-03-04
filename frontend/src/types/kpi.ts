export type KPIStatus = "ok" | "warning" | "ko" | "no_data";

export interface KPIDefinition {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  target: number;
  direction: "higher_better" | "lower_better";
  source: string;
  n8n_workflow_id: string | null;
  active: boolean;
  current_value: number | null;
  current_status: KPIStatus | null;
  current_month: number | null;
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
