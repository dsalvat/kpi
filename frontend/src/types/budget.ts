export type CapexOpex = "CAPEX" | "OPEX";

export type BudgetStatus =
  | "pendent"
  | "aprovat"
  | "no_pressupostat"
  | "executat"
  | "cancel·lat";

export type BudgetLookupCategory = "team" | "expense_type" | "classification" | "cost_center";

export interface BudgetItem {
  id: string;
  year: number;
  provider: string;
  managing_team: string;
  concept: string;
  expense_type: string;
  classification: string;
  capex_opex: CapexOpex;
  cost_center: string | null;
  previous_year_budget: number | null;
  previous_year_cost: number | null;
  monthly_amount: number | null;
  annual_amount: number | null;
  status: BudgetStatus;
  delivered: boolean;
  reviewed: boolean;
  actual_amount: number | null;
  invoice_reference: string | null;
  order_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  execution_pct: number | null;
  deviation: number | null;
}

export interface BudgetItemCreate {
  year: number;
  provider: string;
  managing_team: string;
  concept: string;
  expense_type: string;
  classification: string;
  capex_opex: CapexOpex;
  cost_center?: string | null;
  previous_year_budget?: number | null;
  previous_year_cost?: number | null;
  monthly_amount?: number | null;
  annual_amount?: number | null;
  status?: string;
  delivered?: boolean;
  reviewed?: boolean;
  actual_amount?: number | null;
  invoice_reference?: string | null;
  order_reference?: string | null;
  notes?: string | null;
}

export interface BudgetItemUpdate {
  provider?: string;
  managing_team?: string;
  concept?: string;
  expense_type?: string;
  classification?: string;
  capex_opex?: string;
  cost_center?: string | null;
  previous_year_budget?: number | null;
  previous_year_cost?: number | null;
  monthly_amount?: number | null;
  annual_amount?: number | null;
  status?: string;
  delivered?: boolean;
  reviewed?: boolean;
  actual_amount?: number | null;
  invoice_reference?: string | null;
  order_reference?: string | null;
  notes?: string | null;
}

export interface BudgetTeamSummary {
  team: string;
  budget: number;
  actual: number;
  items: number;
}

export interface BudgetSummary {
  year: number;
  total_budget: number;
  total_actual: number;
  total_items: number;
  capex_budget: number;
  opex_budget: number;
  capex_actual: number;
  opex_actual: number;
  by_team: BudgetTeamSummary[];
  by_status: Record<string, number>;
  execution_pct: number | null;
}

export interface BudgetLookup {
  id: string;
  category: BudgetLookupCategory;
  value: string;
  display_order: number;
  active: boolean;
}

export interface BudgetLookupCreate {
  category: BudgetLookupCategory;
  value: string;
  display_order?: number;
}

export interface BudgetLookupUpdate {
  value?: string;
  display_order?: number;
  active?: boolean;
}
