export interface Project {
  id: string;
  code: string;
  name: string;
  sponsor: string | null;
  status: "active" | "completed" | "at_risk" | "blocked";
  start_date: string | null;
  planned_end_date: string | null;
  actual_end_date: string | null;
  budget_eur: number | null;
  actual_cost_eur: number | null;
  completion_pct: number | null;
  sponsor_satisfaction: number | null;
  is_strategic: boolean;
}

export interface ProjectCreate {
  code: string;
  name: string;
  sponsor?: string | null;
  status?: string;
  start_date?: string | null;
  planned_end_date?: string | null;
  budget_eur?: number | null;
  completion_pct?: number | null;
  description?: string | null;
  is_strategic?: boolean;
}

export interface ProjectsSummary {
  total: number;
  active: number;
  at_risk: number;
  completed: number;
  blocked: number;
  avg_completion_pct: number | null;
}
