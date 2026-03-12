import { useState, useMemo } from "react";
import {
  useBudgetItems,
  useBudgetSummary,
  useBudgetLookups,
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
} from "@/hooks/useBudget";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { cn } from "@/lib/utils";
import type { BudgetItem, BudgetItemCreate, BudgetItemUpdate } from "@/types/budget";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  TrendingUp,
  Building2,
  FileText,
} from "lucide-react";

/* ── Constants ── */

type TeamFilter = "all" | string;

// Fallback values used while lookups load
const FALLBACK_TEAMS = ["Sistemas", "Integracions", "Transformació", "Director IT", "ALTRES"];
const FALLBACK_EXPENSE_TYPES = ["Equips Informàtics", "Consultoria", "Llicència", "Infraestructura Cloud", "Suport/Helpdesk"];
const FALLBACK_CLASSIFICATIONS = ["Manteniment", "Seguretat", "Ciberseguridad", "Plataformes"];
const FALLBACK_COST_CENTERS = ["DESOPI", "CA - Ametller"];

const STATUS_LABELS: Record<string, string> = {
  pendent: "Pendent",
  aprovat: "Aprovat",
  no_pressupostat: "No pressupostat",
  executat: "Executat",
  "cancel·lat": "Cancel·lat",
};

const STATUS_COLORS: Record<string, string> = {
  pendent: "bg-amber-500/10 text-amber-400",
  aprovat: "bg-blue-500/10 text-blue-400",
  no_pressupostat: "bg-red-500/10 text-red-400",
  executat: "bg-emerald-500/10 text-emerald-400",
  "cancel·lat": "bg-gray-500/10 text-gray-400",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pendent: Clock,
  aprovat: CheckCircle2,
  no_pressupostat: Ban,
  executat: CheckCircle2,
  "cancel·lat": XCircle,
};

function formatEur(val: number | null | undefined): string {
  if (val == null) return "—";
  return new Intl.NumberFormat("ca-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

function buildEmptyForm(year: number, teams: string[], expenseTypes: string[], classifications: string[]): BudgetItemCreate {
  return {
    year,
    provider: "",
    managing_team: teams[0] ?? "",
    concept: "",
    expense_type: expenseTypes[0] ?? "",
    classification: classifications[0] ?? "",
    capex_opex: "OPEX",
    cost_center: null,
    previous_year_budget: null,
    previous_year_cost: null,
    monthly_amount: null,
    annual_amount: null,
    status: "pendent",
    delivered: false,
    reviewed: false,
    actual_amount: null,
    invoice_reference: null,
    order_reference: null,
    notes: null,
  };
}

/* ── Main Page ── */

export default function GestioPressupostaria() {
  const selectedYear = useAppStore((s) => s.selectedYear);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: items, isLoading } = useBudgetItems(selectedYear);
  const { data: summary } = useBudgetSummary(selectedYear);
  const { data: allLookups } = useBudgetLookups();

  const lookups = useMemo(() => {
    const active = (allLookups ?? []).filter((l) => l.active);
    const byCategory = (cat: string) =>
      active.filter((l) => l.category === cat).sort((a, b) => a.display_order - b.display_order).map((l) => l.value);
    return {
      teams: byCategory("team").length > 0 ? byCategory("team") : FALLBACK_TEAMS,
      expenseTypes: byCategory("expense_type").length > 0 ? byCategory("expense_type") : FALLBACK_EXPENSE_TYPES,
      classifications: byCategory("classification").length > 0 ? byCategory("classification") : FALLBACK_CLASSIFICATIONS,
      costCenters: byCategory("cost_center").length > 0 ? byCategory("cost_center") : FALLBACK_COST_CENTERS,
    };
  }, [allLookups]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = items;
    if (teamFilter !== "all") {
      list = list.filter((i) => i.managing_team === teamFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.provider.toLowerCase().includes(q) ||
          i.concept.toLowerCase().includes(q) ||
          (i.notes ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, teamFilter, searchQuery]);

  const showForm = creatingNew || editingItem !== null;

  const openCreate = () => {
    setEditingItem(null);
    setCreatingNew(true);
  };
  const openEdit = (item: BudgetItem) => {
    setCreatingNew(false);
    setEditingItem(item);
  };
  const closeForm = () => {
    setCreatingNew(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          Gestió Pressupostària
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Partides pressupostàries, seguiment d'execució i control de despesa — {selectedYear}
        </p>
      </div>

      {/* Summary cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Toolbar */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.03s" }}
      >
        {/* Team filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setTeamFilter("all")}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              teamFilter === "all"
                ? "bg-secondary text-white"
                : "text-text-tertiary hover:text-text-secondary hover:bg-overlay-muted",
            )}
          >
            Tots
          </button>
          {lookups.teams.map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                teamFilter === t
                  ? "bg-secondary text-white"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-overlay-muted",
              )}
            >
              {t}
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
            placeholder="Cercar proveïdor, concepte..."
            className="rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors w-64"
          />
        </div>

        {/* Create */}
        <button
          onClick={openCreate}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nova partida
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <div
          className={cn(
            "animate-fade-in-up grid gap-6",
            showForm ? "lg:grid-cols-[1fr_480px]" : "grid-cols-1",
          )}
          style={{ animationDelay: "0.06s" }}
        >
          {/* Table */}
          <div className="card overflow-hidden">
            <div className="border-b border-border-subtle bg-overlay-subtle px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Partides ({filtered.length})
              </span>
            </div>
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Wallet className="mx-auto h-10 w-10 text-text-tertiary/30" strokeWidth={1.5} />
                    <p className="mt-3 text-[14px] font-medium text-text-secondary">
                      Cap partida trobada
                    </p>
                    <p className="mt-1 text-[12px] text-text-tertiary">
                      Ajusta els filtres o crea una nova partida.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-overlay-subtle text-left">
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Proveïdor</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Concepte</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Equip</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Tipus</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Pressupost</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Executat</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Estat</th>
                      <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <BudgetRow
                        key={item.id}
                        item={item}
                        isEditing={editingItem?.id === item.id}
                        isExpanded={expandedId === item.id}
                        onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        onEdit={() => openEdit(item)}
                      />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-overlay-subtle">
                      <td colSpan={4} className="px-3 py-2.5 text-[11px] font-bold text-text-secondary uppercase">
                        Total ({filtered.length} partides)
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-data text-[12px] font-bold text-text-primary">
                          {formatEur(filtered.reduce((sum, i) => sum + (Number(i.annual_amount) || 0), 0))}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-data text-[12px] font-bold text-text-primary">
                          {formatEur(filtered.reduce((sum, i) => sum + (Number(i.actual_amount) || 0), 0))}
                        </span>
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>

          {/* Side form */}
          {showForm && (
            <BudgetForm
              item={editingItem}
              year={selectedYear}
              lookups={lookups}
              onClose={closeForm}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Summary Cards ── */

function SummaryCards({ summary }: { summary: { total_budget: number; total_actual: number; capex_budget: number; opex_budget: number; capex_actual: number; opex_actual: number; total_items: number; execution_pct: number | null; by_team: { team: string; budget: number; actual: number; items: number }[] } }) {
  const cards = [
    {
      label: "Pressupost Total",
      value: formatEur(Number(summary.total_budget)),
      sub: `${summary.total_items} partides`,
      color: "text-secondary",
      bg: "bg-secondary/8",
      icon: Wallet,
    },
    {
      label: "Executat",
      value: formatEur(Number(summary.total_actual)),
      sub: summary.execution_pct != null ? `${summary.execution_pct}% executat` : "Sense dades",
      color: summary.execution_pct != null && summary.execution_pct > 100 ? "text-red-400" : "text-emerald-400",
      bg: summary.execution_pct != null && summary.execution_pct > 100 ? "bg-red-500/8" : "bg-emerald-500/8",
      icon: summary.execution_pct != null && summary.execution_pct > 100 ? TrendingUp : TrendingUp,
    },
    {
      label: "CAPEX",
      value: formatEur(Number(summary.capex_budget)),
      sub: `Exec. ${formatEur(Number(summary.capex_actual))}`,
      color: "text-blue-400",
      bg: "bg-blue-500/8",
      icon: Building2,
    },
    {
      label: "OPEX",
      value: formatEur(Number(summary.opex_budget)),
      sub: `Exec. ${formatEur(Number(summary.opex_actual))}`,
      color: "text-purple-400",
      bg: "bg-purple-500/8",
      icon: FileText,
    },
  ];

  return (
    <div className="animate-fade-in-up grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: "0.02s" }}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="card group relative overflow-hidden px-5 py-4"
        >
          <div className={cn("absolute right-3 top-3 rounded-lg p-2", c.bg)}>
            <c.icon className={cn("h-4 w-4", c.color)} strokeWidth={2} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {c.label}
          </p>
          <p className={cn("mt-1 text-data text-[22px] font-bold", c.color)}>
            {c.value}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Table Row ── */

function BudgetRow({
  item,
  isEditing,
  isExpanded,
  onToggleExpand,
  onEdit,
}: {
  item: BudgetItem;
  isEditing: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  const StatusIcon = STATUS_ICONS[item.status] ?? Clock;

  return (
    <>
      <tr
        className={cn(
          "border-b border-border-subtle transition-colors",
          isEditing ? "bg-secondary/5" : "hover:bg-overlay-subtle",
        )}
      >
        <td className="px-3 py-2.5">
          <span className="text-[12px] font-semibold text-text-primary">{item.provider}</span>
        </td>
        <td className="px-3 py-2.5 max-w-[250px]">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-left text-[12px] text-text-secondary hover:text-secondary transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 shrink-0 text-text-tertiary" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-3 w-3 shrink-0 text-text-tertiary" strokeWidth={2} />
            )}
            <span className="truncate">{item.concept}</span>
          </button>
        </td>
        <td className="px-3 py-2.5">
          <span className="rounded-md bg-overlay-muted px-2 py-0.5 text-[10px] font-medium text-text-secondary">
            {item.managing_team}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <span className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-semibold",
            item.capex_opex === "CAPEX" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400",
          )}>
            {item.capex_opex}
          </span>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className="text-data text-[12px] font-medium text-text-primary">
            {formatEur(Number(item.annual_amount))}
          </span>
        </td>
        <td className="px-3 py-2.5 text-right">
          {item.actual_amount != null ? (
            <div className="text-right">
              <span className={cn(
                "text-data text-[12px] font-medium",
                item.deviation != null && Number(item.deviation) > 0 ? "text-red-400" : "text-emerald-400",
              )}>
                {formatEur(Number(item.actual_amount))}
              </span>
              {item.execution_pct != null && (
                <span className="ml-1 text-[10px] text-text-tertiary">
                  ({item.execution_pct}%)
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-text-tertiary">—</span>
          )}
        </td>
        <td className="px-3 py-2.5">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            STATUS_COLORS[item.status] ?? "bg-gray-500/10 text-gray-400",
          )}>
            <StatusIcon className="h-3 w-3" strokeWidth={2} />
            {STATUS_LABELS[item.status] ?? item.status}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-secondary"
            aria-label={`Editar ${item.provider}`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-border-subtle">
          <td colSpan={8} className="bg-overlay-subtle px-5 py-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Tipus de despesa
                </p>
                <p className="text-[12px] text-text-secondary">{item.expense_type}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Classificació
                </p>
                <p className="text-[12px] text-text-secondary">{item.classification}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Centre de Cost
                </p>
                <p className="text-[12px] text-text-secondary">{item.cost_center || "—"}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Pressupost any anterior
                </p>
                <p className="text-data text-[12px] text-text-secondary">
                  {formatEur(Number(item.previous_year_budget))}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Cost any anterior
                </p>
                <p className="text-data text-[12px] text-text-secondary">
                  {formatEur(Number(item.previous_year_cost))}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Import Mensual
                </p>
                <p className="text-data text-[12px] text-text-secondary">
                  {formatEur(Number(item.monthly_amount))}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Comanda
                </p>
                <p className="text-[12px] text-text-secondary">{item.order_reference || "—"}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Referència factura
                </p>
                <p className="text-[12px] text-text-secondary">{item.invoice_reference || "—"}</p>
              </div>
              {item.notes && (
                <div className="sm:col-span-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Notes
                  </p>
                  <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {item.notes}
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Create / Edit Form ── */

interface LookupData {
  teams: string[];
  expenseTypes: string[];
  classifications: string[];
  costCenters: string[];
}

function BudgetForm({
  item,
  year,
  lookups,
  onClose,
}: {
  item: BudgetItem | null;
  year: number;
  lookups: LookupData;
  onClose: () => void;
}) {
  const isNew = item === null;

  const [form, setForm] = useState<BudgetItemCreate>(() => {
    if (item) {
      return {
        year: item.year,
        provider: item.provider,
        managing_team: item.managing_team,
        concept: item.concept,
        expense_type: item.expense_type,
        classification: item.classification,
        capex_opex: item.capex_opex as "CAPEX" | "OPEX",
        cost_center: item.cost_center,
        previous_year_budget: item.previous_year_budget != null ? Number(item.previous_year_budget) : null,
        previous_year_cost: item.previous_year_cost != null ? Number(item.previous_year_cost) : null,
        monthly_amount: item.monthly_amount != null ? Number(item.monthly_amount) : null,
        annual_amount: item.annual_amount != null ? Number(item.annual_amount) : null,
        status: item.status,
        delivered: item.delivered,
        reviewed: item.reviewed,
        actual_amount: item.actual_amount != null ? Number(item.actual_amount) : null,
        invoice_reference: item.invoice_reference,
        order_reference: item.order_reference,
        notes: item.notes,
      };
    }
    return buildEmptyForm(year, lookups.teams, lookups.expenseTypes, lookups.classifications);
  });

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createMutation = useCreateBudgetItem();
  const updateMutation = useUpdateBudgetItem();
  const deleteMutation = useDeleteBudgetItem();

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const setField = <K extends keyof BudgetItemCreate>(key: K, value: BudgetItemCreate[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.provider.trim() || !form.concept.trim()) {
      setError("Proveïdor i concepte són obligatoris.");
      return;
    }
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
      } else {
        const update: BudgetItemUpdate = {
          provider: form.provider,
          managing_team: form.managing_team,
          concept: form.concept,
          expense_type: form.expense_type,
          classification: form.classification,
          capex_opex: form.capex_opex,
          cost_center: form.cost_center,
          previous_year_budget: form.previous_year_budget,
          previous_year_cost: form.previous_year_cost,
          monthly_amount: form.monthly_amount,
          annual_amount: form.annual_amount,
          status: form.status,
          delivered: form.delivered,
          reviewed: form.reviewed,
          actual_amount: form.actual_amount,
          invoice_reference: form.invoice_reference,
          order_reference: form.order_reference,
          notes: form.notes,
        };
        await updateMutation.mutateAsync({ id: item!.id, data: update });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desant");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error eliminant");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors";
  const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-tertiary";

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">
          {isNew ? "Nova partida" : `Editar — ${item!.provider}`}
        </span>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-text-primary"
          aria-label="Tancar formulari"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-5 space-y-4">
        {/* Provider + Team */}
        <div className="grid grid-cols-[1fr_140px] gap-3">
          <div>
            <label className={labelClass}>Proveïdor</label>
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setField("provider", e.target.value)}
              placeholder="Accon Software, Arsys..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Equip</label>
            <select
              value={form.managing_team}
              onChange={(e) => setField("managing_team", e.target.value)}
              className={inputClass}
            >
              {lookups.teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Concept */}
        <div>
          <label className={labelClass}>Concepte</label>
          <textarea
            value={form.concept}
            onChange={(e) => setField("concept", e.target.value)}
            placeholder="Provisió d'equips, Llicències Microsoft..."
            rows={2}
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {/* Expense type + Classification */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipus de despesa</label>
            <select
              value={form.expense_type}
              onChange={(e) => setField("expense_type", e.target.value)}
              className={inputClass}
            >
              {lookups.expenseTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Classificació</label>
            <select
              value={form.classification}
              onChange={(e) => setField("classification", e.target.value)}
              className={inputClass}
            >
              {lookups.classifications.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CAPEX/OPEX */}
        <div>
          <label className={labelClass}>CAPEX / OPEX</label>
          <div className="flex gap-2">
            {(["CAPEX", "OPEX"] as const).map((co) => (
              <button
                key={co}
                type="button"
                onClick={() => setField("capex_opex", co)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors",
                  form.capex_opex === co
                    ? co === "CAPEX"
                      ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                      : "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30"
                    : "border border-border bg-overlay-muted text-text-tertiary hover:bg-overlay-hover",
                )}
              >
                {co}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Center */}
        <div>
          <label className={labelClass}>Centre de Cost</label>
          <select
            value={form.cost_center ?? ""}
            onChange={(e) => setField("cost_center", e.target.value || null)}
            className={inputClass}
          >
            <option value="">— Sense centre de cost —</option>
            {lookups.costCenters.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Section: Amounts */}
        <div className="rounded-lg border border-border-subtle bg-overlay-subtle p-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Imports
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Import Anual</label>
              <input
                type="number"
                step="any"
                value={form.annual_amount ?? ""}
                onChange={(e) => setField("annual_amount", e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00"
                className={cn(inputClass, "text-data")}
              />
            </div>
            <div>
              <label className={labelClass}>Import Mensual</label>
              <input
                type="number"
                step="any"
                value={form.monthly_amount ?? ""}
                onChange={(e) => setField("monthly_amount", e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00"
                className={cn(inputClass, "text-data")}
              />
            </div>
            <div>
              <label className={labelClass}>Pressupost any anterior</label>
              <input
                type="number"
                step="any"
                value={form.previous_year_budget ?? ""}
                onChange={(e) => setField("previous_year_budget", e.target.value ? Number(e.target.value) : null)}
                className={cn(inputClass, "text-data")}
              />
            </div>
            <div>
              <label className={labelClass}>Cost any anterior</label>
              <input
                type="number"
                step="any"
                value={form.previous_year_cost ?? ""}
                onChange={(e) => setField("previous_year_cost", e.target.value ? Number(e.target.value) : null)}
                className={cn(inputClass, "text-data")}
              />
            </div>
          </div>
        </div>

        {/* Section: Execution */}
        <div className="rounded-lg border border-border-subtle bg-overlay-subtle p-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Execució
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Import executat</label>
              <input
                type="number"
                step="any"
                value={form.actual_amount ?? ""}
                onChange={(e) => setField("actual_amount", e.target.value ? Number(e.target.value) : null)}
                placeholder="0.00"
                className={cn(inputClass, "text-data")}
              />
            </div>
            <div>
              <label className={labelClass}>Estat</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={inputClass}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Comanda</label>
              <input
                type="text"
                value={form.order_reference ?? ""}
                onChange={(e) => setField("order_reference", e.target.value || null)}
                placeholder="B400018..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Referència factura</label>
              <input
                type="text"
                value={form.invoice_reference ?? ""}
                onChange={(e) => setField("invoice_reference", e.target.value || null)}
                placeholder="FAC-2026-001"
                className={inputClass}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setField("delivered", !form.delivered)}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  form.delivered ? "bg-emerald-500" : "bg-overlay-active",
                )}
                role="switch"
                aria-checked={form.delivered}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                  form.delivered && "translate-x-4",
                )} />
              </button>
              <span className="text-[11px] text-text-secondary">Entregat</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setField("reviewed", !form.reviewed)}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  form.reviewed ? "bg-secondary" : "bg-overlay-active",
                )}
                role="switch"
                aria-checked={form.reviewed}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                  form.reviewed && "translate-x-4",
                )} />
              </button>
              <span className="text-[11px] text-text-secondary">Revisat</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setField("notes", e.target.value || null)}
            placeholder="Comentaris, observacions..."
            rows={3}
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border-subtle bg-overlay-subtle px-5 py-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-40"
        >
          {isPending ? "..." : (
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
                Confirmar
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
