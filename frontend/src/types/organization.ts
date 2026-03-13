export interface Company {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface CompanyCreate {
  name: string;
  slug: string;
}

export interface Member {
  id: string;
  company_id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string | null;
  role: "director" | "responsable" | "coordinador" | "membre";
  active: boolean;
}

export interface MemberCreate {
  team_id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string | null;
  role?: string;
}

export interface MemberUpdate {
  team_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string | null;
  role?: string;
  active?: boolean;
}

export interface Team {
  id: string;
  area_id: string;
  name: string;
  code: string;
  description: string | null;
  coordinador_id: string | null;
  coordinador: Member | null;
  active: boolean;
  members: Member[];
}

export interface TeamCreate {
  area_id: string;
  name: string;
  code: string;
  description?: string | null;
  coordinador_id?: string | null;
}

export interface Area {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  responsable_id: string | null;
  responsable: Member | null;
  active: boolean;
  teams: Team[];
}

export interface AreaCreate {
  department_id: string;
  name: string;
  code: string;
  description?: string | null;
  responsable_id?: string | null;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  director_id: string | null;
  director: Member | null;
  active: boolean;
  areas: Area[];
}

export interface DepartmentCreate {
  name: string;
  code: string;
  description?: string | null;
  director_id?: string | null;
}

export interface MemberSummary {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  team_id: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  code: string;
  area_id: string;
}
