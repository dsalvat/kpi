export interface ProcessLabel {
  id: string;
  company_id: string;
  name: string;
  color: string | null;
  active: boolean;
}

export interface ProcessLabelCreate {
  name: string;
  color?: string | null;
}

export interface ProcessLabelUpdate {
  name?: string;
  color?: string | null;
  active?: boolean;
}

export interface ProcessDocument {
  id: string;
  company_id: string;
  title: string;
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  labels: ProcessLabel[];
}

export interface ProcessDocumentCreate {
  title: string;
  content?: string;
  created_by?: string | null;
  label_ids?: string[];
}

export interface ProcessDocumentUpdate {
  title?: string;
  content?: string;
  label_ids?: string[];
  active?: boolean;
}

export interface ProcessDocumentSummary {
  id: string;
  title: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  labels: ProcessLabel[];
}
