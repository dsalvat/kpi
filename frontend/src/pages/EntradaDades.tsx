import { useState, useMemo } from "react";
import { useKPIs, useKPIValues, useCreateKPIValue, useUpdateKPIValue, useDeleteKPIValue } from "@/hooks/useKPIs";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { cn, formatNumber } from "@/lib/utils";
import type { KPIDefinition, KPIStatus, KPIValue } from "@/types/kpi";
import {
  Database,
  Wifi,
  WifiOff,
  Trash2,
  AlertCircle,
  ChevronRight,
  Save,
  Star,
} from "lucide-react";

const MONTHS_SHORT = ["Gen", "Feb", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Des"];
const MONTHS_FULL = ["Gener", "Febrer", "Marc", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

type GroupFilter = "all" | "serveis" | "projectes";

export default function EntradaDades() {
  const year = useAppStore((s) => s.selectedYear);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [selectedKPI, setSelectedKPI] = useState<KPIDefinition | null>(null);

  const { data: allKpis, isLoading: loadingServeis } = useKPIs({ group: "serveis" });
  const { data: prjKpis, isLoading: loadingProjectes } = useKPIs({ group: "projectes" });

  const isLoading = loadingServeis || loadingProjectes;

  const kpis = useMemo(() => {
    const srv = allKpis ?? [];
    const prj = prjKpis ?? [];
    if (groupFilter === "serveis") return srv;
    if (groupFilter === "projectes") return prj;
    return [...srv, ...prj];
  }, [allKpis, prjKpis, groupFilter]);

  const sourceCounts = useMemo(() => {
    const counts = { manual: 0, auto: 0 };
    for (const k of kpis) {
      if (k.source === "manual") counts.manual++;
      else counts.auto++;
    }
    return counts;
  }, [kpis]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"Entrada de Dades "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Selecciona un indicador per gestionar els seus valors mensuals.
        </p>
      </div>

      {/* Toolbar */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.03s" }}
      >
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {(["all", "serveis", "projectes"] as const).map((g) => (
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
              {g === "all" ? "Tots" : g === "serveis" ? "Serveis" : "Projectes"}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <WifiOff className="h-3 w-3" strokeWidth={2} />
            {sourceCounts.manual} manual
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3 text-emerald-400" strokeWidth={2} />
            {sourceCounts.auto} automatitzat
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* KPI list + edit panel layout */}
      {!isLoading && kpis.length > 0 && (
        <div
          className="animate-fade-in-up grid gap-6 lg:grid-cols-[340px_1fr]"
          style={{ animationDelay: "0.06s" }}
        >
          {/* Left: KPI selector list */}
          <div className="card overflow-hidden">
            <div className="border-b border-border-subtle bg-overlay-subtle px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Indicadors ({kpis.length})
              </span>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {kpis.map((kpi) => {
                const status = (kpi.current_status ?? "no_data") as KPIStatus;
                const isSelected = selectedKPI?.id === kpi.id;
                const isAuto = kpi.source !== "manual";
                return (
                  <button
                    key={kpi.id}
                    onClick={() => setSelectedKPI(isSelected ? null : kpi)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-secondary/10 border-l-2 border-l-secondary"
                        : "hover:bg-overlay-subtle border-l-2 border-l-transparent",
                    )}
                  >
                    <StatusDot status={status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-data text-[10px] font-semibold uppercase tracking-wider text-secondary">
                          {kpi.code}
                        </span>
                        {kpi.is_annual_objective && (
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" strokeWidth={1.5} aria-label="Objectiu anual" />
                        )}
                        {isAuto && (
                          <Wifi className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2} />
                        )}
                      </div>
                      <p className="truncate text-[12px] text-text-secondary">
                        {kpi.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {kpi.current_value != null ? (
                        <span className="text-data text-[12px] font-semibold text-text-primary">
                          {formatNumber(kpi.current_value)}
                          <span className="ml-0.5 text-[10px] font-normal text-text-tertiary">{kpi.unit}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">—</span>
                      )}
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform",
                        isSelected && "rotate-90 text-secondary",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Edit panel for selected KPI */}
          {selectedKPI ? (
            <KPIEditPanel kpi={selectedKPI} year={year} />
          ) : (
            <div className="card flex items-center justify-center p-12">
              <div className="text-center">
                <Database className="mx-auto h-10 w-10 text-text-tertiary/30" strokeWidth={1.5} />
                <p className="mt-3 text-[14px] font-medium text-text-secondary">
                  Selecciona un indicador
                </p>
                <p className="mt-1 text-[12px] text-text-tertiary">
                  Fes clic a un KPI de la llista per editar els seus valors mensuals.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Edit panel for a single KPI ── */
function KPIEditPanel({ kpi, year }: { kpi: KPIDefinition; year: number }) {
  const { data: values, isLoading } = useKPIValues(kpi.code);

  const valuesByMonth = useMemo(() => {
    const map = new Map<number, KPIValue>();
    if (values) {
      for (const v of values) map.set(v.month, v);
    }
    return map;
  }, [values]);

  const filledCount = valuesByMonth.size;

  return (
    <div className="card overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-data text-[12px] font-semibold uppercase tracking-wider text-secondary">
              {kpi.code}
            </span>
            {kpi.is_annual_objective && (
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={1.5} aria-label="Objectiu anual" />
            )}
            <span className="text-[13px] font-medium text-text-primary">
              {kpi.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-[11px] text-text-tertiary">
            <span>
              Target: <span className="text-data font-medium text-text-secondary">{formatNumber(kpi.target)} {kpi.unit}</span>
            </span>
            <span>
              {kpi.direction === "higher_better" ? "Mes es millor" : "Menys es millor"}
            </span>
            <span>
              {filledCount}/12 mesos amb dades
            </span>
          </div>
        </div>
      </div>

      {/* Month grid */}
      {isLoading ? (
        <div className="p-5">
          <div className="h-40 animate-shimmer rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-border-subtle sm:grid-cols-3 lg:grid-cols-4">
          {MONTHS_FULL.map((monthName, i) => (
            <MonthEditor
              key={i}
              kpi={kpi}
              month={i + 1}
              monthName={monthName}
              year={year}
              entry={valuesByMonth.get(i + 1) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Month editor card ── */
function MonthEditor({
  kpi,
  month,
  monthName,
  year,
  entry,
}: {
  kpi: KPIDefinition;
  month: number;
  monthName: string;
  year: number;
  entry: KPIValue | null;
}) {
  const hasValue = entry !== null;
  const currentValue = hasValue ? Number(entry.value) : null;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateKPIValue(kpi.code);
  const updateMutation = useUpdateKPIValue(kpi.code);
  const deleteMutation = useDeleteKPIValue(kpi.code);

  let cellStatus: KPIStatus = "no_data";
  if (currentValue !== null && Number(kpi.target) !== 0) {
    const progress =
      kpi.direction === "lower_better"
        ? Math.min(1, Number(kpi.target) / currentValue)
        : Math.min(1, currentValue / Number(kpi.target));
    if (progress >= 0.95) cellStatus = "ok";
    else if (progress >= 0.8) cellStatus = "warning";
    else cellStatus = "ko";
  }

  const statusColor: Record<KPIStatus, string> = {
    ok: "text-emerald-400",
    warning: "text-amber-400",
    ko: "text-red-400",
    no_data: "text-text-tertiary",
  };

  const startEdit = () => {
    setEditValue(hasValue ? String(currentValue) : "");
    setEditNotes(entry?.notes ?? "");
    setEditing(true);
    setConfirmDelete(false);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setConfirmDelete(false);
    setError(null);
  };

  const saveValue = async () => {
    const numericValue = editValue.trim();
    if (!numericValue) return;
    setError(null);
    try {
      if (entry) {
        await updateMutation.mutateAsync({
          valueId: entry.id,
          data: { value: Number(numericValue), notes: editNotes.trim() || undefined },
        });
      } else {
        await createMutation.mutateAsync({
          year,
          month,
          value: Number(numericValue),
          notes: editNotes.trim() || undefined,
        });
      }
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desant");
    }
  };

  const deleteValue = async () => {
    if (!entry) return;
    setError(null);
    try {
      await deleteMutation.mutateAsync(entry.id);
      setEditing(false);
      setConfirmDelete(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error eliminant");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const inputClass =
    "w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors";

  if (editing) {
    return (
      <div className="bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-text-primary">{monthName}</span>
          <span className="text-[10px] text-text-tertiary">{MONTHS_SHORT[month - 1]} {year}</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Valor ({kpi.unit})
            </label>
            <input
              type="number"
              step="any"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Target: ${formatNumber(kpi.target)}`}
              autoFocus
              className={cn(inputClass, "text-data")}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveValue();
                if (e.key === "Escape") cancelEdit();
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Notes
            </label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Opcional"
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveValue();
                if (e.key === "Escape") cancelEdit();
              }}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={2} />
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={saveValue}
              disabled={isPending || !editValue.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-40"
            >
              {isPending ? (
                "..."
              ) : (
                <>
                  <Save className="h-3 w-3" strokeWidth={2} />
                  Guardar
                </>
              )}
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover"
            >
              Cancel·lar
            </button>
            {entry && (
              <div className="ml-auto">
                {confirmDelete ? (
                  <button
                    onClick={deleteValue}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={2} />
                    Confirmar
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={2} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="flex w-full flex-col bg-surface p-4 text-left transition-colors hover:bg-overlay-subtle"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-secondary">{monthName}</span>
        <StatusDot status={cellStatus} />
      </div>
      {hasValue ? (
        <>
          <span className={cn("text-data text-lg font-semibold", statusColor[cellStatus])}>
            {formatNumber(currentValue!)}
            <span className="ml-1 text-[11px] font-normal text-text-tertiary">{kpi.unit}</span>
          </span>
          {entry.notes && (
            <span className="mt-1 truncate text-[10px] text-text-tertiary">{entry.notes}</span>
          )}
        </>
      ) : (
        <span className="text-[12px] text-text-tertiary/50">
          Clic per afegir
        </span>
      )}
    </button>
  );
}

/* ── Status dot ── */
function StatusDot({ status }: { status: KPIStatus }) {
  const colors: Record<KPIStatus, string> = {
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    ko: "bg-red-500",
    no_data: "bg-slate-600",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", colors[status])}
      role="status"
      aria-label={status}
    />
  );
}
