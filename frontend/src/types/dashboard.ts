import type { KPIDefinition } from "./kpi";
import type { OKRSummary } from "./okr";
import type { ProjectsSummary } from "./project";
import type { ValueSummary } from "./value";

export interface Dashboard {
  year: number;
  kpi_summary: KPIDefinition[];
  projects_summary: ProjectsSummary;
  okr_summary: OKRSummary;
  value_summary: ValueSummary;
  recent_updates: RecentUpdate[];
}

export interface RecentUpdate {
  kpi_code: string;
  kpi_name: string;
  value: number;
  month: number;
  year: number;
  collection_method: string;
}
