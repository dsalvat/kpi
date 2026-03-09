import { useState, useMemo } from "react";
import {
  useAllKPIs,
  useAvailableYears,
  useActivateYear,
  useDeactivateYear,
  useCreateKPIDefinition,
  useUpdateKPIDefinition,
  useDeleteKPIDefinition,
} from "@/hooks/useKPIs";
import { useConnectorsSummary } from "@/hooks/useConnectors";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { cn } from "@/lib/utils";
import type {
  KPIDefinition,
  KPIDefinitionCreate,
  KPIDefinitionUpdate,
  KPIGroup,
} from "@/types/kpi";
import type { SourceType } from "@/types/connector";
import {
  Settings2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
  Search,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type GroupFilter = "all" | KPIGroup;

const GROUP_LABELS: Record<GroupFilter, string> = {
  all: "Tots",
  serveis: "Serveis",
  projectes: "Projectes",
  valor: "Valor Negoci",
};

const GROUP_PREFIX: Record<KPIGroup, string> = {
  serveis: "SRV-",
  projectes: "PRJ-",
  valor: "VAL-",
};

const SUBCATEGORIES: Record<KPIGroup, string[]> = {
  serveis: ["disponibilitat", "incidents", "helpdesk", "qualitat", "eficiència", "seguretat"],
  projectes: ["projectes", "eficiència", "qualitat"],
  valor: ["valor", "estalvi", "ingressos"],
};

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 2 + i);

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  manual: "Manual",
  api_rest: "API REST",
  ai_agent: "Agent IA (Rovo)",
};

function buildEmptyForm(group: KPIGroup = "serveis"): KPIDefinitionCreate {
  return {
    code: GROUP_PREFIX[group],
    name: "",
    description: "",
    calculation_method: "",
    group,
    category: SUBCATEGORIES[group][0] ?? "serveis",
    unit: "%",
    target: 0,
    direction: "higher_better",
    source: "manual",
    source_type: "manual",
    connector_id: null,
    active: true,
    years: [CURRENT_YEAR],
  };
}

/** Given a code and old/new group, return the code with updated prefix */
function reprefix(code: string, oldGroup: KPIGroup, newGroup: KPIGroup): string {
  const oldPrefix = GROUP_PREFIX[oldGroup];
  const newPrefix = GROUP_PREFIX[newGroup];
  if (code.startsWith(oldPrefix)) {
    return newPrefix + code.slice(oldPrefix.length);
  }
  // If code doesn't match old prefix, just prepend new prefix
  return newPrefix + code.replace(/^[A-Z]+-/, "");
}

export default function MasterDades() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingKPI, setEditingKPI] = useState<KPIDefinition | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showYearManager, setShowYearManager] = useState(false);

  const { data: kpis, isLoading } = useAllKPIs(includeInactive);

  const filtered = useMemo(() => {
    if (!kpis) return [];
    let list = kpis;
    if (groupFilter !== "all") {
      list = list.filter((k) => k.group === groupFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (k) =>
          k.code.toLowerCase().includes(q) ||
          k.name.toLowerCase().includes(q) ||
          (k.description ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [kpis, groupFilter, searchQuery]);

  const openCreate = () => {
    setEditingKPI(null);
    setCreatingNew(true);
  };

  const openEdit = (kpi: KPIDefinition) => {
    setCreatingNew(false);
    setEditingKPI(kpi);
  };

  const closeForm = () => {
    setCreatingNew(false);
    setEditingKPI(null);
  };

  const showForm = creatingNew || editingKPI !== null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          Master de Dades
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Gestiona les definicions d'indicadors: codi, nom, descripció, mètode de càlcul i anys associats.
        </p>
      </div>

      {/* Toolbar */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.03s" }}
      >
        {/* Group filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {(Object.keys(GROUP_LABELS) as GroupFilter[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                groupFilter === g
                  ? "bg-secondary text-white"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-overlay-muted",
              )}
            >
              {GROUP_LABELS[g]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cercar indicador..."
            className="rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors w-56"
          />
        </div>

        {/* Include inactive toggle */}
        <button
          onClick={() => setIncludeInactive(!includeInactive)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-muted"
        >
          {includeInactive ? (
            <ToggleRight className="h-4 w-4 text-secondary" strokeWidth={2} />
          ) : (
            <ToggleLeft className="h-4 w-4 text-text-tertiary" strokeWidth={2} />
          )}
          Inactius
        </button>

        {/* Year manager toggle */}
        <button
          onClick={() => setShowYearManager(!showYearManager)}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
            showYearManager
              ? "border-secondary bg-secondary/10 text-secondary"
              : "border-border bg-surface text-text-secondary hover:bg-overlay-muted",
          )}
        >
          <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
          Gestió d'Anys
        </button>

        {/* Create button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nou indicador
        </button>
      </div>

      {/* Year manager panel */}
      {showYearManager && <YearManager />}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Content: table + form side panel */}
      {!isLoading && (
        <div
          className={cn(
            "animate-fade-in-up grid gap-6",
            showForm ? "lg:grid-cols-[1fr_420px]" : "grid-cols-1",
          )}
          style={{ animationDelay: "0.06s" }}
        >
          {/* KPI table */}
          <div className="card overflow-hidden">
            <div className="border-b border-border-subtle bg-overlay-subtle px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Indicadors ({filtered.length})
              </span>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Settings2 className="mx-auto h-10 w-10 text-text-tertiary/30" strokeWidth={1.5} />
                    <p className="mt-3 text-[14px] font-medium text-text-secondary">
                      Cap indicador trobat
                    </p>
                    <p className="mt-1 text-[12px] text-text-tertiary">
                      Ajusta els filtres o crea un nou indicador.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-overlay-subtle text-left">
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Codi</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Nom</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Grup</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Subcategoria</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Target</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Anys</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Estat</th>
                      <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((kpi) => (
                      <KPIRow
                        key={kpi.id}
                        kpi={kpi}
                        isEditing={editingKPI?.id === kpi.id}
                        isExpanded={expandedId === kpi.id}
                        onToggleExpand={() => setExpandedId(expandedId === kpi.id ? null : kpi.id)}
                        onEdit={() => openEdit(kpi)}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Side form panel */}
          {showForm && (
            <KPIForm
              kpi={editingKPI}
              onClose={closeForm}
            />
          )}
        </div>
      )}
    </div>
  );
}

const GROUP_COLORS: Record<KPIGroup, string> = {
  serveis: "bg-blue-500/10 text-blue-400",
  projectes: "bg-amber-500/10 text-amber-400",
  valor: "bg-emerald-500/10 text-emerald-400",
};

/* ── Table row ── */
function KPIRow({
  kpi,
  isEditing,
  isExpanded,
  onToggleExpand,
  onEdit,
}: {
  kpi: KPIDefinition;
  isEditing: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-border-subtle transition-colors",
          isEditing
            ? "bg-secondary/5"
            : "hover:bg-overlay-subtle",
          !kpi.active && "opacity-50",
        )}
      >
        <td className="px-4 py-2.5">
          <span className="text-data text-[11px] font-semibold uppercase tracking-wider text-secondary">
            {kpi.code}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-left text-[13px] font-medium text-text-primary hover:text-secondary transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 shrink-0 text-text-tertiary" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-3 w-3 shrink-0 text-text-tertiary" strokeWidth={2} />
            )}
            {kpi.name}
          </button>
        </td>
        <td className="px-4 py-2.5">
          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", GROUP_COLORS[kpi.group])}>
            {GROUP_LABELS[kpi.group]}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <span className="rounded-md bg-overlay-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary capitalize">
            {kpi.category}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-data text-[12px] font-medium text-text-primary">
            {Number(kpi.target)} {kpi.unit}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <div className="flex flex-wrap gap-1">
            {kpi.years.length > 0 ? (
              kpi.years.map((y) => (
                <span
                  key={y}
                  className="rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold text-secondary"
                >
                  {y}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-text-tertiary">—</span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5">
          {kpi.active ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Actiu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
              Inactiu
            </span>
          )}
        </td>
        <td className="px-4 py-2.5">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-secondary"
            aria-label={`Editar ${kpi.code}`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-border-subtle">
          <td colSpan={8} className="bg-overlay-subtle px-6 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Descripció
                </p>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {kpi.description || "Sense descripció"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Mètode de càlcul
                </p>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {kpi.calculation_method || "No especificat"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Font de dades
                </p>
                <p className="text-[12px] text-text-secondary">
                  {kpi.source_type === "manual" ? "Manual" : kpi.source_type === "api_rest" ? "API REST" : "Agent IA"}
                  {kpi.connector_name && (
                    <span className="ml-1.5 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                      {kpi.connector_name}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Direcció
                </p>
                <p className="text-[12px] text-text-secondary">
                  {kpi.direction === "higher_better" ? "Més és millor ↑" : "Menys és millor ↓"}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Create / Edit form ── */
function KPIForm({
  kpi,
  onClose,
}: {
  kpi: KPIDefinition | null;
  onClose: () => void;
}) {
  const isNew = kpi === null;

  const { data: connectorsSummary } = useConnectorsSummary();

  const [form, setForm] = useState<KPIDefinitionCreate>(() => {
    if (kpi) {
      return {
        code: kpi.code,
        name: kpi.name,
        description: kpi.description ?? "",
        calculation_method: kpi.calculation_method ?? "",
        group: kpi.group,
        category: kpi.category,
        unit: kpi.unit,
        target: Number(kpi.target),
        direction: kpi.direction as "higher_better" | "lower_better",
        source: kpi.source,
        source_type: kpi.source_type ?? "manual",
        connector_id: kpi.connector_id ?? null,
        n8n_workflow_id: kpi.n8n_workflow_id ?? undefined,
        active: kpi.active,
        years: [...kpi.years],
      };
    }
    return buildEmptyForm();
  });

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createMutation = useCreateKPIDefinition();
  const updateMutation = useUpdateKPIDefinition();
  const deleteMutation = useDeleteKPIDefinition();

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const setField = <K extends keyof KPIDefinitionCreate>(key: K, value: KPIDefinitionCreate[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGroupChange = (newGroup: KPIGroup) => {
    setForm((prev) => {
      const newCode = reprefix(prev.code, prev.group, newGroup);
      const subcats = SUBCATEGORIES[newGroup];
      const newCategory = subcats.includes(prev.category) ? prev.category : (subcats[0] ?? prev.category);
      return { ...prev, group: newGroup, code: newCode, category: newCategory };
    });
  };

  const toggleYear = (year: number) => {
    setForm((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year].sort(),
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.code.trim() || !form.name.trim()) {
      setError("Codi i nom són obligatoris.");
      return;
    }
    // Validate code prefix matches group
    const expectedPrefix = GROUP_PREFIX[form.group];
    if (!form.code.startsWith(expectedPrefix)) {
      setError(`El codi ha de començar amb ${expectedPrefix} per al grup ${GROUP_LABELS[form.group]}.`);
      return;
    }
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
      } else {
        const update: KPIDefinitionUpdate = {
          code: form.code !== kpi!.code ? form.code : undefined,
          name: form.name,
          description: form.description || null,
          calculation_method: form.calculation_method || null,
          group: form.group,
          category: form.category,
          unit: form.unit,
          target: form.target,
          direction: form.direction,
          source: form.source,
          source_type: form.source_type,
          connector_id: form.source_type === "manual" ? null : form.connector_id,
          active: form.active,
          years: form.years,
        };
        await updateMutation.mutateAsync({ code: kpi!.code, data: update });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desant";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!kpi) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync(kpi.code);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error eliminant");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors";

  const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-tertiary";

  const currentSubcats = SUBCATEGORIES[form.group];

  return (
    <div className="card overflow-hidden">
      {/* Form header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">
          {isNew ? "Nou indicador" : `Editar ${kpi!.code}`}
        </span>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-text-primary"
          aria-label="Tancar formulari"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Form body */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-5 space-y-4">
        {/* Group selector */}
        <div>
          <label className={labelClass}>Grup</label>
          <div className="flex gap-2">
            {(["serveis", "projectes", "valor"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGroupChange(g)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors",
                  form.group === g
                    ? GROUP_COLORS[g] + " ring-1 ring-current"
                    : "border border-border bg-overlay-muted text-text-tertiary hover:bg-overlay-hover",
                )}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        {/* Code + Name */}
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <div>
            <label className={labelClass}>Codi</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setField("code", e.target.value.toUpperCase())}
              placeholder={GROUP_PREFIX[form.group] + "01"}
              className={cn(inputClass, "text-data")}
              maxLength={20}
            />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="SLA Global Xarxa"
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Descripció</label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Descripció de l'indicador..."
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {/* Calculation method */}
        <div>
          <label className={labelClass}>Mètode de càlcul</label>
          <textarea
            value={form.calculation_method ?? ""}
            onChange={(e) => setField("calculation_method", e.target.value)}
            placeholder="Fórmula o descripció del càlcul..."
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {/* Subcategory + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Subcategoria</label>
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className={inputClass}
            >
              {currentSubcats.map((sc) => (
                <option key={sc} value={sc}>
                  {sc.charAt(0).toUpperCase() + sc.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Unitat</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setField("unit", e.target.value)}
              placeholder="%, h, €, /10"
              className={cn(inputClass, "text-data")}
              maxLength={20}
            />
          </div>
        </div>

        {/* Target + Direction */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Target</label>
            <input
              type="number"
              step="any"
              value={form.target}
              onChange={(e) => setField("target", Number(e.target.value))}
              className={cn(inputClass, "text-data")}
            />
          </div>
          <div>
            <label className={labelClass}>Direcció</label>
            <select
              value={form.direction}
              onChange={(e) => setField("direction", e.target.value as "higher_better" | "lower_better")}
              className={inputClass}
            >
              <option value="higher_better">Més és millor ↑</option>
              <option value="lower_better">Menys és millor ↓</option>
            </select>
          </div>
        </div>

        {/* Source type */}
        <div>
          <label className={labelClass}>Tipus de Font</label>
          <div className="flex gap-2">
            {(["manual", "api_rest", "ai_agent"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setField("source_type", st);
                  if (st === "manual") setField("connector_id", null);
                }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors",
                  form.source_type === st
                    ? "bg-secondary/15 text-secondary ring-1 ring-secondary/30"
                    : "border border-border bg-overlay-muted text-text-tertiary hover:bg-overlay-hover",
                )}
              >
                {SOURCE_TYPE_LABELS[st]}
              </button>
            ))}
          </div>
        </div>

        {/* Connector selector (for api_rest and ai_agent) */}
        {form.source_type !== "manual" && (
          <div>
            <label className={labelClass}>
              Connector {form.source_type === "api_rest" ? "API" : "Agent IA"}
            </label>
            <select
              value={form.connector_id ?? ""}
              onChange={(e) => setField("connector_id", e.target.value || null)}
              className={inputClass}
            >
              <option value="">— Selecciona un connector —</option>
              {(connectorsSummary ?? [])
                .filter((c) => c.type === form.source_type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            {(connectorsSummary ?? []).filter((c) => c.type === form.source_type).length === 0 && (
              <p className="mt-1 text-[11px] text-amber-400">
                No hi ha connectors d'aquest tipus. Crea'n un a Configuració.
              </p>
            )}
          </div>
        )}

        {/* Source (legacy descriptive field) */}
        <div>
          <label className={labelClass}>Font descriptiva</label>
          <input
            type="text"
            value={form.source ?? "manual"}
            onChange={(e) => setField("source", e.target.value)}
            placeholder="manual, meraki, sap..."
            className={inputClass}
          />
        </div>

        {/* Years */}
        <div>
          <label className={labelClass}>Anys associats</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => toggleYear(y)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  form.years.includes(y)
                    ? "bg-secondary text-white"
                    : "border border-border bg-overlay-muted text-text-tertiary hover:text-text-secondary hover:bg-overlay-hover",
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setField("active", !form.active)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              form.active ? "bg-secondary" : "bg-overlay-active",
            )}
            role="switch"
            aria-checked={form.active}
            aria-label="Indicador actiu"
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                form.active && "translate-x-5",
              )}
            />
          </button>
          <span className="text-[12px] font-medium text-text-secondary">
            {form.active ? "Actiu" : "Inactiu"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      {/* Form footer */}
      <div className="flex items-center gap-2 border-t border-border-subtle bg-overlay-subtle px-5 py-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-40"
        >
          {isPending ? (
            "..."
          ) : (
            <>
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
              {isNew ? "Crear" : "Guardar"}
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover"
        >
          Cancel·lar
        </button>
        {!isNew && (
          <div className="ml-auto">
            {confirmDelete ? (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Confirmar eliminació
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Year Manager ── */
function YearManager() {
  const { data: years, isLoading } = useAvailableYears();
  const activateMutation = useActivateYear();
  const deactivateMutation = useDeactivateYear();
  const [confirmDeactivate, setConfirmDeactivate] = useState<number | null>(null);

  const CURRENT_YEAR = new Date().getFullYear();
  const ALL_YEARS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 2 + i);

  const yearMap = useMemo(() => {
    const map = new Map<number, number>();
    if (years) {
      for (const y of years) map.set(y.year, y.kpi_count);
    }
    return map;
  }, [years]);

  const handleActivate = async (year: number) => {
    await activateMutation.mutateAsync(year);
  };

  const handleDeactivate = async (year: number) => {
    await deactivateMutation.mutateAsync(year);
    setConfirmDeactivate(null);
  };

  const isPending = activateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="animate-fade-in-up card overflow-hidden" style={{ animationDelay: "0.03s" }}>
      <div className="flex items-center gap-2 border-b border-border-subtle bg-overlay-subtle px-5 py-3">
        <Calendar className="h-4 w-4 text-secondary" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-text-primary">
          Gestió d'Anys
        </span>
        <span className="text-[11px] text-text-tertiary">
          — Activa un any per assignar-lo a tots els indicadors actius
        </span>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="h-12 animate-shimmer rounded-lg" />
        ) : (
          <div className="flex flex-wrap gap-3">
            {ALL_YEARS.map((year) => {
              const count = yearMap.get(year);
              const isActive = count !== undefined && count > 0;
              const isConfirming = confirmDeactivate === year;

              return (
                <div
                  key={year}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-5 py-3 transition-colors",
                    isActive
                      ? "border-secondary/30 bg-secondary/5"
                      : "border-border bg-overlay-muted",
                  )}
                >
                  <span className={cn(
                    "text-data text-lg font-bold",
                    isActive ? "text-secondary" : "text-text-tertiary",
                  )}>
                    {year}
                  </span>

                  {isActive ? (
                    <>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                        {count} indicadors
                      </span>
                      {isConfirming ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeactivate(year)}
                            disabled={isPending}
                            className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDeactivate(null)}
                            className="rounded-md bg-overlay-muted px-2 py-1 text-[10px] font-medium text-text-tertiary transition-colors hover:bg-overlay-hover"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeactivate(year)}
                          disabled={isPending}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        >
                          <XCircle className="h-3 w-3" strokeWidth={2} />
                          Desactivar
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-text-tertiary">
                        No actiu
                      </span>
                      <button
                        onClick={() => handleActivate(year)}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-md bg-secondary/10 px-3 py-1 text-[10px] font-semibold text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-40"
                      >
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                        Activar
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
