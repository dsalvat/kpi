export interface OKRQuarterlyData {
  id: string;
  year: number;
  quarter: number;
  target: number | null;
  actual: number | null;
  progress: number | null;
  is_manual: boolean;
  is_auto_calculated: boolean;
  notes: string | null;
  updated_at: string | null;
}

export interface OKRKeyResult {
  id: string;
  code: string;
  title: string;
  unit: string;
  baseline: number | null;
  annual_target: number;
  direction: "higher_better" | "lower_better";
  kpi_id: string | null;
  kpi_aggregation: string | null;
  kpi_code: string | null;
  kpi_name: string | null;
  project_id: string | null;
  project_name: string | null;
  responsible_team_id: string | null;
  responsible_member_id: string | null;
  responsible_team_name: string | null;
  responsible_member_name: string | null;
  confidence: "Alta" | "Mitjana" | "Baixa" | null;
  annual_progress: number | null;
  quarterly_data: OKRQuarterlyData[];
}

export interface OKRObjective {
  id: string;
  year: number;
  code: string;
  title: string;
  owner: string | null;
  responsible_team_id: string | null;
  responsible_member_id: string | null;
  responsible_team_name: string | null;
  responsible_member_name: string | null;
  progress: number | null;
  key_results: OKRKeyResult[];
}

export interface OKRSummary {
  year: number;
  objectives: OKRObjective[];
  overall_progress: number | null;
}

// ── Create / Update types ────────────────────────────────────

export interface OKRObjectiveCreate {
  year: number;
  code: string;
  title: string;
  owner?: string | null;
  responsible_team_id?: string | null;
  responsible_member_id?: string | null;
  order_idx?: number;
}

export interface OKRObjectiveUpdate {
  title?: string;
  owner?: string | null;
  responsible_team_id?: string | null;
  responsible_member_id?: string | null;
  order_idx?: number;
}

export interface OKRKeyResultCreate {
  objective_id: string;
  code: string;
  title: string;
  unit: string;
  baseline?: number | null;
  annual_target: number;
  direction: "higher_better" | "lower_better";
  kpi_id?: string | null;
  kpi_aggregation?: string | null;
  project_id?: string | null;
  responsible_team_id?: string | null;
  responsible_member_id?: string | null;
  confidence?: "Alta" | "Mitjana" | "Baixa" | null;
}

export interface OKRKeyResultUpdate {
  title?: string;
  unit?: string;
  baseline?: number | null;
  annual_target?: number;
  direction?: "higher_better" | "lower_better";
  kpi_id?: string | null;
  kpi_aggregation?: string | null;
  project_id?: string | null;
  responsible_team_id?: string | null;
  responsible_member_id?: string | null;
  confidence?: "Alta" | "Mitjana" | "Baixa" | null;
}
