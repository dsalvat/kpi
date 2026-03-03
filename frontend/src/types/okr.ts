export interface OKRQuarterlyData {
  id: string;
  year: number;
  quarter: number;
  target: number | null;
  actual: number | null;
  progress: number | null;
  is_manual: boolean;
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
  progress: number | null;
  key_results: OKRKeyResult[];
}

export interface OKRSummary {
  year: number;
  objectives: OKRObjective[];
  overall_progress: number | null;
}
