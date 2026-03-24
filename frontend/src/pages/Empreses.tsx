import { useState, useEffect, useMemo } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useCreateArea,
  useDeleteArea,
  useCreateTeam,
  useDeleteTeam,
  useCreateMember,
  useDeleteMember,
  useUpdateMember,
} from "@/hooks/useOrganization";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type {
  Company,
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
  Pencil,
  Check,
  Globe,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════ */
/*  Helpers                                                    */
/* ════════════════════════════════════════════════════════════ */

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Users; color: string }> = {
  director: { label: "Director", icon: Crown, color: "text-amber-600 bg-amber-500/10" },
  responsable: { label: "Responsable", icon: Shield, color: "text-blue-600 bg-blue-500/10" },
  coordinador: { label: "Coordinador", icon: Star, color: "text-purple-600 bg-purple-500/10" },
  membre: { label: "Membre", icon: UserCircle, color: "text-text-secondary bg-overlay-hover" },
};

/* ════════════════════════════════════════════════════════════ */
/*  Main page                                                  */
/* ════════════════════════════════════════════════════════════ */

export default function Empreses() {
  const { selectedCompanyId, setSelectedCompanyId } = useAppStore();
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  // Auto-select first company
  useEffect(() => {
    if (!selectedCompanyId && companies && companies.length > 0) {
      setSelectedCompanyId(companies[0]!.id);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId]);

  // Clear selection if company was deleted
  useEffect(() => {
    if (selectedCompanyId && companies && !companies.find((c) => c.id === selectedCompanyId)) {
      setSelectedCompanyId(companies.length > 0 ? companies[0]!.id : null);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId]);

  const { data: departments, isLoading: loadingDepts } = useDepartments(
    selectedCompanyId ?? undefined,
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isLoading = loadingCompanies || loadingDepts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          Empreses
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Gestio d'empreses i estructura organitzativa
        </p>
      </div>

      {/* Company section */}
      <section className="animate-fade-in-up space-y-3" style={{ animationDelay: "0.03s" }}>
        <div className="flex items-center justify-between">
          <SectionHeader title="Empreses" icon={Globe} count={companies?.length} />
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Nova empresa
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <CompanyCreateForm
            existingSlugs={(companies ?? []).map((c) => c.slug)}
            onSubmit={(data) => {
              createCompany.mutate(data, {
                onSuccess: (company) => {
                  setSelectedCompanyId(company.id);
                  setShowCreateForm(false);
                },
              });
            }}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createCompany.isPending}
          />
        )}

        {/* Company list */}
        {loadingCompanies ? (
          <div className="space-y-2">
            <SkeletonCard />
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="space-y-2">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isSelected={company.id === selectedCompanyId}
                isEditing={editingId === company.id}
                existingSlugs={(companies ?? []).filter((c) => c.id !== company.id).map((c) => c.slug)}
                onSelect={() => setSelectedCompanyId(company.id)}
                onEditStart={() => setEditingId(company.id)}
                onEditEnd={() => setEditingId(null)}
                onUpdate={(data) => {
                  updateCompany.mutate(
                    { id: company.id, data },
                    { onSuccess: () => setEditingId(null) },
                  );
                }}
                onDelete={() => {
                  if (confirm(`Eliminar empresa "${company.name}"? Tots els departaments, arees, equips i membres s'eliminaran.`)) {
                    deleteCompany.mutate(company.id);
                  }
                }}
                isUpdating={updateCompany.isPending}
              />
            ))}
          </div>
        ) : !showCreateForm ? (
          <EmptyState
            title="Sense empreses"
            description="Crea la primera empresa per gestionar l'estructura organitzativa."
          />
        ) : null}
      </section>

      {/* Department tree */}
      {selectedCompanyId && (
        <DepartmentTree
          companyId={selectedCompanyId}
          departments={departments ?? []}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Company components                                         */
/* ════════════════════════════════════════════════════════════ */

function CompanyCreateForm({
  existingSlugs,
  onSubmit,
  onCancel,
  isLoading,
}: {
  existingSlugs: string[];
  onSubmit: (data: { name: string; slug: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  const autoSlug = useMemo(() => toSlug(name), [name]);
  const effectiveSlug = slugManual ? slug : autoSlug;
  const slugExists = existingSlugs.includes(effectiveSlug);
  const canSubmit = name.trim() && effectiveSlug && !slugExists;

  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-display text-[15px] font-semibold text-text-primary">
          Nova empresa
        </h3>
        <button
          onClick={onCancel}
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
            autoFocus
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
            placeholder="Nom de l'empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-52">
          <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            Slug
            {!slugManual && name && (
              <span className="normal-case tracking-normal text-text-tertiary/60">(auto)</span>
            )}
          </label>
          <input
            autoComplete="off"
            className={cn(
              "w-full rounded-lg border bg-bg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-secondary/20",
              slugExists ? "border-red-400 focus:border-red-400" : "border-border focus:border-secondary",
            )}
            placeholder="empresa-slug"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
            }}
            onFocus={() => {
              if (!slugManual) {
                setSlug(autoSlug);
                setSlugManual(true);
              }
            }}
          />
          {slugExists && (
            <p className="mt-0.5 text-[11px] text-red-500">Slug ja existeix</p>
          )}
        </div>
        <button
          onClick={() => canSubmit && onSubmit({ name: name.trim(), slug: effectiveSlug })}
          disabled={!canSubmit || isLoading}
          className="rounded-xl bg-secondary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          {isLoading ? "..." : "Crear"}
        </button>
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  isSelected,
  isEditing,
  existingSlugs,
  onSelect,
  onEditStart,
  onEditEnd,
  onUpdate,
  onDelete,
  isUpdating,
}: {
  company: Company;
  isSelected: boolean;
  isEditing: boolean;
  existingSlugs: string[];
  onSelect: () => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  onUpdate: (data: { name?: string; slug?: string }) => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const [editName, setEditName] = useState(company.name);
  const [editSlug, setEditSlug] = useState(company.slug);

  const slugExists = editSlug !== company.slug && existingSlugs.includes(editSlug);
  const canSave = editName.trim() && editSlug && !slugExists && (editName !== company.name || editSlug !== company.slug);

  if (isEditing) {
    return (
      <div className="card animate-fade-in border-secondary/30 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Nom
            </label>
            <input
              autoFocus
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave) onUpdate({ name: editName.trim(), slug: editSlug });
                if (e.key === "Escape") onEditEnd();
              }}
            />
          </div>
          <div className="w-52">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Slug
            </label>
            <input
              autoComplete="off"
              className={cn(
                "w-full rounded-lg border bg-bg px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-secondary/20",
                slugExists ? "border-red-400 focus:border-red-400" : "border-border focus:border-secondary",
              )}
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave) onUpdate({ name: editName.trim(), slug: editSlug });
                if (e.key === "Escape") onEditEnd();
              }}
            />
            {slugExists && (
              <p className="mt-0.5 text-[11px] text-red-500">Slug ja existeix</p>
            )}
          </div>
          <button
            onClick={() => canSave && onUpdate({ name: editName.trim(), slug: editSlug })}
            disabled={!canSave || isUpdating}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={onEditEnd}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:bg-overlay-hover"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "card flex cursor-pointer items-center gap-3 px-4 py-3 transition-all hover:border-secondary/30",
        isSelected && "border-secondary/40 bg-secondary/3 ring-1 ring-secondary/10",
      )}
    >
      <div className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        isSelected ? "bg-secondary/12" : "bg-overlay-hover",
      )}>
        <Building2 className={cn("h-4.5 w-4.5", isSelected ? "text-secondary" : "text-text-tertiary")} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[14px] font-semibold", isSelected ? "text-text-primary" : "text-text-secondary")}>
          {company.name}
        </p>
        <p className="text-[11px] text-text-tertiary font-mono">{company.slug}</p>
      </div>
      {isSelected && (
        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary uppercase tracking-wider">
          Seleccionada
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditName(company.name);
          setEditSlug(company.slug);
          onEditStart();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-secondary/8 hover:text-secondary"
        title="Editar empresa"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        title="Eliminar empresa"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Department tree                                           */
/* ════════════════════════════════════════════════════════════ */

function DepartmentTree({
  companyId,
  departments,
  isLoading: parentLoading,
}: {
  companyId: string;
  departments: Department[];
  isLoading: boolean;
}) {
  const createDept = useCreateDepartment();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  if (parentLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

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
                  onError: (err) => {
                    console.error("Create department failed:", err);
                    alert(`Error creant departament: ${err instanceof Error ? err.message : String(err)}`);
                  },
                },
              );
            }
          }}
          onCancel={() => setShowForm(false)}
          isLoading={createDept.isPending}
          submitDisabled={!form.code || !form.name}
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
              submitDisabled={!areaForm.code || !areaForm.name}
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
              submitDisabled={!teamForm.code || !teamForm.name}
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
                  autoComplete="off"
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Nom"
                  value={memberForm.first_name}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, first_name: e.target.value }))
                  }
                />
                <input
                  autoComplete="off"
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
                  placeholder="Cognom"
                  value={memberForm.last_name}
                  onChange={(e) =>
                    setMemberForm((p) => ({ ...p, last_name: e.target.value }))
                  }
                />
                <input
                  autoComplete="off"
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
                  autoComplete="off"
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
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email,
    position: member.position ?? "",
    role: member.role,
  });
  const updateMember = useUpdateMember();
  const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG["membre"]!;
  const RoleIcon = roleConfig.icon;

  const handleSave = () => {
    updateMember.mutate(
      { id: member.id, data: { ...form, position: form.position || null } },
      { onSuccess: () => setEditing(false) },
    );
  };

  const inputCls = "h-7 rounded border border-border bg-bg px-2 text-[12px] focus:border-secondary focus:outline-none";

  if (editing) {
    return (
      <div className="rounded-lg border border-secondary/20 bg-secondary/3 px-2.5 py-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <input value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className={inputCls} placeholder="Nom" autoFocus />
          <input value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className={inputCls} placeholder="Cognom" />
          <input value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls} placeholder="Email" />
          <input value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className={inputCls} placeholder="Càrrec" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <select value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as "director" | "responsable" | "coordinador" | "membre" })}
            className={`${inputCls} w-36`}>
            <option value="director">Director</option>
            <option value="responsable">Responsable</option>
            <option value="coordinador">Coordinador</option>
            <option value="membre">Membre</option>
          </select>
          <div className="flex-1" />
          <button onClick={handleSave} disabled={!form.first_name || !form.last_name || updateMember.isPending}
            className="flex h-7 items-center gap-1 rounded-md bg-secondary px-3 text-[11px] font-medium text-white hover:bg-secondary/90 disabled:opacity-50">
            <Check className="h-3 w-3" /> Desar
          </button>
          <button onClick={() => { setEditing(false); setForm({ first_name: member.first_name, last_name: member.last_name, email: member.email, position: member.position ?? "", role: member.role }); }}
            className="flex h-7 items-center rounded-md px-2 text-[11px] text-text-tertiary hover:bg-gray-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-overlay-subtle">
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
        onClick={() => setEditing(true)}
        className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary opacity-0 hover:bg-secondary/10 hover:text-secondary group-hover:opacity-100"
        title="Editar membre"
      >
        <Pencil className="h-3 w-3" strokeWidth={1.8} />
      </button>
      <button
        onClick={onDelete}
        className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary opacity-0 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
        title="Eliminar membre"
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
  submitDisabled,
}: {
  fields: FormField[];
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <div className="mb-3 flex items-end gap-2 rounded-lg border border-border bg-bg p-3">
      {fields.map((f) => (
        <div key={f.label} className={f.width ?? "flex-1"}>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            {f.label}
          </label>
          <input
            autoComplete="off"
            className={cn(
              "w-full rounded-lg border bg-surface px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none",
              !f.value && submitDisabled !== undefined ? "border-red-300" : "border-border",
            )}
            placeholder={f.placeholder}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={onSubmit}
        disabled={isLoading || submitDisabled}
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
