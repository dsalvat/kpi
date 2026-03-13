import { useState, useEffect } from "react";
import {
  useCompanies,
  useCreateCompany,
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useCreateArea,
  useDeleteArea,
  useCreateTeam,
  useDeleteTeam,
  useCreateMember,
  useDeleteMember,
} from "@/hooks/useOrganization";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type {
  Department,
  Area,
  Team,
  Member,
} from "@/types/organization";
import {
  Building2,
  Users,
  UserCircle,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Shield,
  Crown,
  Star,
  Mail,
  Briefcase,
} from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Users; color: string }> = {
  director: { label: "Director", icon: Crown, color: "text-amber-600 bg-amber-500/10" },
  responsable: { label: "Responsable", icon: Shield, color: "text-blue-600 bg-blue-500/10" },
  coordinador: { label: "Coordinador", icon: Star, color: "text-purple-600 bg-purple-500/10" },
  membre: { label: "Membre", icon: UserCircle, color: "text-text-secondary bg-overlay-hover" },
};

export default function Departament() {
  const { selectedCompanyId, setSelectedCompanyId } = useAppStore();
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const createCompany = useCreateCompany();

  // Auto-select first company
  useEffect(() => {
    if (!selectedCompanyId && companies && companies.length > 0) {
      setSelectedCompanyId(companies[0]!.id);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId]);

  const { data: departments, isLoading: loadingDepts } = useDepartments(
    selectedCompanyId ?? undefined,
  );

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", slug: "" });

  const isLoading = loadingCompanies || loadingDepts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          Departament
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Estructura organitzativa: empreses, departaments, arees, equips i
          membres
        </p>
      </div>

      {/* Company selector */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.03s" }}
      >
        <label className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
          Empresa
        </label>
        {loadingCompanies ? (
          <div className="h-9 w-48 animate-shimmer rounded-lg" />
        ) : companies && companies.length > 0 ? (
          <select
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}
        <button
          onClick={() => setShowCompanyForm(true)}
          className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-secondary/90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Nova empresa
        </button>
      </div>

      {/* New company form */}
      {showCompanyForm && (
        <div className="card animate-fade-in-up p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-display text-[15px] font-semibold text-text-primary">
              Nova empresa
            </h3>
            <button
              onClick={() => setShowCompanyForm(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-overlay-hover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                Nom
              </label>
              <input
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                placeholder="Nom de l'empresa"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="w-40">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                Slug
              </label>
              <input
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                placeholder="empresa-slug"
                value={newCompany.slug}
                onChange={(e) =>
                  setNewCompany((p) => ({
                    ...p,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
              />
            </div>
            <button
              onClick={() => {
                if (newCompany.name && newCompany.slug) {
                  createCompany.mutate(newCompany, {
                    onSuccess: (company) => {
                      setSelectedCompanyId(company.id);
                      setShowCompanyForm(false);
                      setNewCompany({ name: "", slug: "" });
                    },
                  });
                }
              }}
              disabled={!newCompany.name || !newCompany.slug}
              className="rounded-xl bg-secondary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty — no company */}
      {!isLoading && (!companies || companies.length === 0) && !showCompanyForm && (
        <EmptyState
          title="Sense empreses"
          description="Crea la primera empresa per gestionar l'estructura organitzativa."
        />
      )}

      {/* Department tree */}
      {!isLoading && selectedCompanyId && departments && (
        <DepartmentTree
          companyId={selectedCompanyId}
          departments={departments}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Department tree                                           */
/* ════════════════════════════════════════════════════════════ */

function DepartmentTree({
  companyId,
  departments,
}: {
  companyId: string;
  departments: Department[];
}) {
  const createDept = useCreateDepartment();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Departaments"
          icon={Building2}
          count={departments.length}
        />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-secondary/90"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Nou departament
        </button>
      </div>

      {showForm && (
        <InlineForm
          fields={[
            {
              label: "Codi",
              value: form.code,
              onChange: (v) => setForm((p) => ({ ...p, code: v.toUpperCase() })),
              placeholder: "IT",
              width: "w-24",
            },
            {
              label: "Nom",
              value: form.name,
              onChange: (v) => setForm((p) => ({ ...p, name: v })),
              placeholder: "Departament IT",
            },
          ]}
          onSubmit={() => {
            if (form.code && form.name) {
              createDept.mutate(
                { companyId, data: form },
                {
                  onSuccess: () => {
                    setShowForm(false);
                    setForm({ name: "", code: "" });
                  },
                },
              );
            }
          }}
          onCancel={() => setShowForm(false)}
          isLoading={createDept.isPending}
        />
      )}

      {departments.length === 0 && !showForm && (
        <EmptyState
          title="Sense departaments"
          description="Crea el primer departament."
        />
      )}

      {departments.map((dept) => (
        <DepartmentCard key={dept.id} department={dept} companyId={companyId} />
      ))}
    </section>
  );
}

/* ── Department card ── */

function DepartmentCard({
  department: dept,
  companyId,
}: {
  department: Department;
  companyId: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const deleteDept = useDeleteDepartment();
  const createArea = useCreateArea();
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: "", code: "" });

  return (
    <div className="card overflow-hidden animate-fade-in-up">
      {/* Department header */}
      <div
        className="flex cursor-pointer items-center gap-3 border-b border-border-subtle px-5 py-3.5 transition-colors hover:bg-overlay-subtle"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/8">
          <Building2 className="h-4 w-4 text-secondary" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-data text-[11px] font-semibold uppercase tracking-wider text-secondary">
              {dept.code}
            </span>
            <span className="text-[15px] font-semibold text-text-primary">
              {dept.name}
            </span>
          </div>
          {dept.director && (
            <p className="mt-0.5 text-[12px] text-text-tertiary">
              Director: {dept.director.first_name} {dept.director.last_name}
            </p>
          )}
        </div>
        <span className="text-[11px] text-text-tertiary">
          {dept.areas.length} arees
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-text-tertiary transition-transform",
            expanded && "rotate-90",
          )}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Eliminar departament ${dept.code}?`))
              deleteDept.mutate(dept.id);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>

      {/* Areas */}
      {expanded && (
        <div className="bg-overlay-subtle/50 px-5 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Arees ({dept.areas.length})
            </span>
            <button
              onClick={() => setShowAreaForm(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-secondary hover:bg-secondary/8"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Afegir area
            </button>
          </div>

          {showAreaForm && (
            <InlineForm
              fields={[
                {
                  label: "Codi",
                  value: areaForm.code,
                  onChange: (v) =>
                    setAreaForm((p) => ({ ...p, code: v.toUpperCase() })),
                  placeholder: "OPS",
                  width: "w-24",
                },
                {
                  label: "Nom",
                  value: areaForm.name,
                  onChange: (v) => setAreaForm((p) => ({ ...p, name: v })),
                  placeholder: "Operacions IT",
                },
              ]}
              onSubmit={() => {
                if (areaForm.code && areaForm.name) {
                  createArea.mutate(
                    { department_id: dept.id, ...areaForm },
                    {
                      onSuccess: () => {
                        setShowAreaForm(false);
                        setAreaForm({ name: "", code: "" });
                      },
                    },
                  );
                }
              }}
              onCancel={() => setShowAreaForm(false)}
              isLoading={createArea.isPending}
            />
          )}

          <div className="space-y-3">
            {dept.areas.map((area) => (
              <AreaCard key={area.id} area={area} companyId={companyId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Area card ── */

function AreaCard({ area, companyId }: { area: Area; companyId: string }) {
  const [expanded, setExpanded] = useState(true);
  const deleteArea = useDeleteArea();
  const createTeam = useCreateTeam();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", code: "" });

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div
        className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-overlay-subtle"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-text-tertiary transition-transform",
            expanded && "rotate-90",
          )}
        />
        <span className="text-data text-[10px] font-semibold uppercase tracking-wider text-blue-600">
          {area.code}
        </span>
        <span className="text-[13px] font-medium text-text-primary">
          {area.name}
        </span>
        {area.responsable && (
          <span className="text-[11px] text-text-tertiary">
            — {area.responsable.first_name} {area.responsable.last_name}
          </span>
        )}
        <span className="ml-auto text-[11px] text-text-tertiary">
          {area.teams.length} equips
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Eliminar area ${area.code}?`))
              deleteArea.mutate(area.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border-subtle px-4 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Equips ({area.teams.length})
            </span>
            <button
              onClick={() => setShowTeamForm(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-secondary hover:bg-secondary/8"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Afegir equip
            </button>
          </div>

          {showTeamForm && (
            <InlineForm
              fields={[
                {
                  label: "Codi",
                  value: teamForm.code,
                  onChange: (v) =>
                    setTeamForm((p) => ({ ...p, code: v.toUpperCase() })),
                  placeholder: "SIS",
                  width: "w-24",
                },
                {
                  label: "Nom",
                  value: teamForm.name,
                  onChange: (v) => setTeamForm((p) => ({ ...p, name: v })),
                  placeholder: "Equip Sistemes",
                },
              ]}
              onSubmit={() => {
                if (teamForm.code && teamForm.name) {
                  createTeam.mutate(
                    { area_id: area.id, ...teamForm },
                    {
                      onSuccess: () => {
                        setShowTeamForm(false);
                        setTeamForm({ name: "", code: "" });
                      },
                    },
                  );
                }
              }}
              onCancel={() => setShowTeamForm(false)}
              isLoading={createTeam.isPending}
            />
          )}

          <div className="space-y-2">
            {area.teams.map((team) => (
              <TeamCard key={team.id} team={team} companyId={companyId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Team card ── */

function TeamCard({ team, companyId }: { team: Team; companyId: string }) {
  const [expanded, setExpanded] = useState(false);
  const deleteTeam = useDeleteTeam();
  const createMember = useCreateMember();
  const deleteMember = useDeleteMember();
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    role: "membre",
  });

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated">
      <div
        className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-overlay-subtle"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 text-text-tertiary transition-transform",
            expanded && "rotate-90",
          )}
        />
        <Users className="h-3.5 w-3.5 text-purple-500" strokeWidth={1.8} />
        <span className="text-data text-[10px] font-semibold uppercase tracking-wider text-purple-600">
          {team.code}
        </span>
        <span className="text-[13px] font-medium text-text-primary">
          {team.name}
        </span>
        {team.coordinador && (
          <span className="text-[11px] text-text-tertiary">
            — {team.coordinador.first_name} {team.coordinador.last_name}
          </span>
        )}
        <span className="ml-auto text-[11px] text-text-tertiary">
          {team.members.length} membres
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Eliminar equip ${team.code}?`))
              deleteTeam.mutate(team.id);
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border-subtle px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Membres
            </span>
            <button
              onClick={() => setShowMemberForm(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-secondary hover:bg-secondary/8"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Afegir membre
            </button>
          </div>

          {showMemberForm && (
            <div className="mb-3 rounded-lg border border-border bg-bg p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Nom"
                  value={memberForm.first_name}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, first_name: e.target.value }))
                  }
                />
                <input
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Cognom"
                  value={memberForm.last_name}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, last_name: e.target.value }))
                  }
                />
                <input
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Email"
                  value={memberForm.email}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <select
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary focus:border-secondary focus:outline-none"
                  value={memberForm.role}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, role: e.target.value }))
                  }
                >
                  <option value="membre">Membre</option>
                  <option value="coordinador">Coordinador</option>
                  <option value="responsable">Responsable</option>
                  <option value="director">Director</option>
                </select>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Carrec (opcional)"
                  value={memberForm.position}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, position: e.target.value }))
                  }
                />
                <button
                  onClick={() => {
                    if (
                      memberForm.first_name &&
                      memberForm.last_name &&
                      memberForm.email
                    ) {
                      createMember.mutate(
                        {
                          companyId,
                          data: {
                            team_id: team.id,
                            first_name: memberForm.first_name,
                            last_name: memberForm.last_name,
                            email: memberForm.email,
                            position: memberForm.position || null,
                            role: memberForm.role,
                          },
                        },
                        {
                          onSuccess: () => {
                            setShowMemberForm(false);
                            setMemberForm({
                              first_name: "",
                              last_name: "",
                              email: "",
                              position: "",
                              role: "membre",
                            });
                          },
                        },
                      );
                    }
                  }}
                  disabled={
                    !memberForm.first_name ||
                    !memberForm.last_name ||
                    !memberForm.email
                  }
                  className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
                >
                  Afegir
                </button>
                <button
                  onClick={() => setShowMemberForm(false)}
                  className="rounded-lg px-2 py-1.5 text-[12px] text-text-tertiary hover:bg-overlay-hover"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          )}

          {/* Members list */}
          {team.members.length === 0 && !showMemberForm ? (
            <p className="py-2 text-center text-[12px] text-text-tertiary">
              Sense membres
            </p>
          ) : (
            <div className="space-y-1">
              {team.members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onDelete={() => {
                    if (
                      confirm(
                        `Eliminar ${member.first_name} ${member.last_name}?`,
                      )
                    )
                      deleteMember.mutate(member.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Member row ── */

function MemberRow({
  member,
  onDelete,
}: {
  member: Member;
  onDelete: () => void;
}) {
  const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG["membre"]!;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-overlay-subtle">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          roleConfig.color,
        )}
      >
        <RoleIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-text-primary">
          {member.first_name} {member.last_name}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
          {member.position && (
            <span className="flex items-center gap-0.5">
              <Briefcase className="h-3 w-3" strokeWidth={1.5} />
              {member.position}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Mail className="h-3 w-3" strokeWidth={1.5} />
            {member.email}
          </span>
        </div>
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          roleConfig.color,
        )}
      >
        {roleConfig.label}
      </span>
      <button
        onClick={onDelete}
        className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Shared components                                         */
/* ════════════════════════════════════════════════════════════ */

function SectionHeader({
  title,
  icon: Icon,
  count,
}: {
  title: string;
  icon: typeof Building2;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/8">
        <Icon className="h-4 w-4 text-secondary" strokeWidth={1.8} />
      </div>
      <h2 className="text-display text-[15px] font-semibold text-text-primary">
        {title}
      </h2>
      {count != null && (
        <span className="text-data text-[11px] font-medium text-text-tertiary">
          {count}
        </span>
      )}
    </div>
  );
}

interface FormField {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width?: string;
}

function InlineForm({
  fields,
  onSubmit,
  onCancel,
  isLoading,
}: {
  fields: FormField[];
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="mb-3 flex items-end gap-2 rounded-lg border border-border bg-bg p-3">
      {fields.map((f) => (
        <div key={f.label} className={f.width ?? "flex-1"}>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            {f.label}
          </label>
          <input
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
            placeholder={f.placeholder}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
      >
        {isLoading ? "..." : "Crear"}
      </button>
      <button
        onClick={onCancel}
        className="rounded-lg px-2 py-1.5 text-[12px] text-text-tertiary hover:bg-overlay-hover"
      >
        Cancel·lar
      </button>
    </div>
  );
}
