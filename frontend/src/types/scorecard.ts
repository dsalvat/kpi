export interface IndicatorValue {
  id: string;
  indicator_id: string;
  year: number;
  period_type: "monthly" | "quarterly" | "annual";
  period: number;
  value: number;
  collected_at: string;
  collection_method: string;
  notes: string | null;
  actions_done: string | null;
  actions_next: string | null;
}

export interface IndicatorValueCreate {
  year: number;
  period_type: "monthly" | "quarterly" | "annual";
  period: number;
  value: number;
  collection_method?: string;
  notes?: string;
  actions_done?: string;
  actions_next?: string;
}

export interface ScorecardIndicator {
  id: string;
  scorecard_id: string;
  name: string;
  description: string | null;
  category: "operational" | "management";
  indicator_type: "continuous" | "binary" | "count";
  target_value: number;
  unit: string;
  weight_pct: number;
  direction: "higher_better" | "lower_better";
  frequency: "monthly" | "quarterly" | "annual";
  source: string | null;
  source_config: Record<string, unknown> | null;
  kpi_definition_id: string | null;
  project_id: string | null;
  connector_id: string | null;
  shared_group_id: string | null;
  order_idx: number;
  active: boolean;
  values: IndicatorValue[];
  // Computed
  current_value: number | null;
  progress: number | null;
  status: "ok" | "warning" | "ko" | "no_data" | null;
}

export interface Scorecard {
  id: string;
  company_id: string;
  year: number;
  org_level: "department" | "area" | "team";
  org_entity_id: string;
  name: string;
  operational_weight: number;
  management_weight: number;
  active: boolean;
  indicators: ScorecardIndicator[];
  // Computed
  operational_score: number | null;
  management_score: number | null;
  overall_score: number | null;
  org_entity_name: string | null;
  responsible_name: string | null;
}

export interface ScorecardTreeNode {
  org_level: "department" | "area" | "team";
  org_entity_id: string;
  org_entity_name: string;
  responsible_name: string | null;
  overall_score: number | null;
  operational_score: number | null;
  management_score: number | null;
  scorecard: Scorecard | null;
  children: ScorecardTreeNode[];
}
