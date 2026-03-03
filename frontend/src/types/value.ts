export interface ValueItem {
  id: string;
  project_id: string | null;
  type: "blue_money" | "green_money";
  code: string;
  initiative: string;
  hours_saved_annual: number | null;
  hourly_rate_eur: number | null;
  operational_savings_eur: number | null;
  direct_savings_eur: number | null;
  revenues_enabled_eur: number | null;
  commercial_savings_eur: number | null;
  it_attribution_pct: number | null;
  year: number;
  computed_value: number | null;
}

export interface ValueSummary {
  year: number;
  blue_money_total: number;
  green_money_total: number;
  blue_money_target: number | null;
  green_money_target: number | null;
  blue_items: ValueItem[];
  green_items: ValueItem[];
}

export interface ROI {
  year: number;
  blue_total: number;
  green_total: number;
  total_value: number;
  total_investment: number | null;
  roi: number | null;
}
