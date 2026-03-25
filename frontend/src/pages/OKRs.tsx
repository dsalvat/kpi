import { useMemo, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useOKRs, useUpdateQuarterly } from "@/hooks/useOKRs";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { getChartThemeColors } from "@/styles/tokens";
import type { OKRObjective, OKRKeyResult, OKRQuarterlyData } from "@/types/okr";
import { ChevronDown, Pencil, Check, X, Zap, Link2, Users, FolderKanban, RotateCcw } from "lucide-react";

const OBJ_COLORS: string[] = [
  "#2563eb", // O1 blue
  "#7c3aed", // O2 purple
  "#059669", // O3 green
  "#d97706", // O4 amber
  "#dc2626", // O5 red
];

function getObjColor(index: number): string {
  return OBJ_COLORS[index % OBJ_COLORS.length] ?? "#2563eb";
}

export default function OKRs() {
  const year = useAppStore((s) => s.selectedYear);
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const { data: objectives, isLoading } = useOKRs();
  const [expandedObj, setExpandedObj] = useState<string | null>(null);
  const themeColors = useMemo(() => getChartThemeColors(), [resolvedTheme]);

  // Overall progress
  const overallProgress = useMemo(() => {
    if (!objectives || objectives.length === 0) return null;
    const progs = objectives
      .map((o) => o.progress)
      .filter((p): p is number => p != null);
    if (progs.length === 0) return null;
    return progs.reduce((a, b) => a + b, 0) / progs.length;
  }, [objectives]);

  // Radial chart data
  const radialData = useMemo(() => {
    if (!objectives) return [];
    return objectives.map((obj, i) => ({
      name: obj.code,
      value: obj.progress != null ? Math.round(obj.progress * 100) : 0,
      fill: getObjColor(i),
    }));
  }, [objectives]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"OKRs "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Objectius i Key Results del Departament IT
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!objectives || objectives.length === 0) && (
        <EmptyState
          title="Sense OKRs"
          description="No hi ha OKRs definits per a aquest any."
        />
      )}

      {!isLoading && objectives && objectives.length > 0 && (
        <>
          {/* Summary strip */}
          <div
            className="animate-fade-in-up grid gap-4 lg:grid-cols-[1fr_200px]"
            style={{ animationDelay: "0.03s" }}
          >
            {/* Progress cards */}
            <div className="grid gap-3 sm:grid-cols-5">
              {objectives.map((obj, i) => (
                <button
                  key={obj.id}
                  onClick={() =>
                    setExpandedObj(expandedObj === obj.id ? null : obj.id)
                  }
                  className={cn(
                    "card-interactive p-3 text-left",
                    expandedObj === obj.id &&
                      "ring-2 ring-okr/30 border-okr/20",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                      style={{
                        backgroundColor:
                          getObjColor(i),
                      }}
                    >
                      {obj.code}
                    </span>
                    <span className="text-data text-lg font-semibold text-text-primary">
                      {obj.progress != null
                        ? `${Math.round(obj.progress * 100)}%`
                        : "\u2014"}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-tight text-text-tertiary">
                    {obj.title}
                  </p>
                </button>
              ))}
            </div>

            {/* Radial chart */}
            <div className="card flex flex-col items-center justify-center p-3">
              <div className="relative h-[120px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="35%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={4}
                      background={{ fill: themeColors.grid }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                {overallProgress != null && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-data text-lg font-bold text-text-primary">
                      {Math.round(overallProgress * 100)}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary">
                      Global
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Objective cards */}
          <div className="space-y-4">
            {objectives.map((obj, i) => (
              <ObjectiveCard
                key={obj.id}
                objective={obj}
                color={getObjColor(i)}
                expanded={expandedObj === obj.id}
                onToggle={() =>
                  setExpandedObj(expandedObj === obj.id ? null : obj.id)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Objective card ── */
function ObjectiveCard({
  objective,
  color,
  expanded,
  onToggle,
}: {
  objective: OKRObjective;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const progressPct =
    objective.progress != null ? Math.round(objective.progress * 100) : null;

  return (
    <div
      className={cn(
        "card overflow-hidden animate-fade-in-up",
        expanded && "ring-1 ring-okr/15",
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-overlay-subtle"
      >
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {objective.code}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold text-text-primary">
            {objective.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
            {objective.owner && <span>{objective.owner}</span>}
            {objective.responsible_team_name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                <Users className="h-2.5 w-2.5" />
                {objective.responsible_team_name}
              </span>
            )}
            {objective.responsible_member_name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
                {objective.responsible_member_name}
              </span>
            )}
            <span>
              {objective.key_results.length} Key Results
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {progressPct != null && (
            <div className="flex items-center gap-2">
              <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-overlay-active sm:block">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progressPct, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span
                className="text-data text-sm font-semibold"
                style={{ color }}
              >
                {progressPct}%
              </span>
            </div>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-tertiary transition-transform",
              expanded && "rotate-180",
            )}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* Expanded KRs */}
      {expanded && (
        <div className="border-t border-border-subtle bg-overlay-subtle/50 p-5">
          <div className="space-y-3">
            {objective.key_results.map((kr: OKRKeyResult) => (
              <KRDetailRow key={kr.id} kr={kr} objColor={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Detailed KR row with editable quarterly values ── */
function KRDetailRow({
  kr,
  objColor,
}: {
  kr: OKRKeyResult;
  objColor: string;
}) {
  const [editingQd, setEditingQd] = useState<string | null>(null);
  const progressPct =
    kr.annual_progress != null ? Math.round(kr.annual_progress * 100) : null;

  const confidenceConfig: Record<
    string,
    { className: string }
  > = {
    Alta: {
      className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    },
    Mitjana: {
      className: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    },
    Baixa: {
      className: "bg-red-500/10 text-red-400 ring-red-500/20",
    },
  };

  const hasLinkages = kr.kpi_code || kr.project_name || kr.responsible_team_name;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4">
      {/* KR header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-data text-[12px] font-semibold"
              style={{ color: objColor }}
            >
              {kr.code}
            </span>
            {kr.confidence && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                  confidenceConfig[kr.confidence]?.className ??
                    "bg-slate-500/10 text-slate-400 ring-slate-500/20",
                )}
              >
                {kr.confidence}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-text-secondary">{kr.title}</p>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-text-tertiary">
            <span>
              {"Baseline: "}
              <span className="text-data font-medium">
                {kr.baseline ?? "\u2014"}
              </span>
            </span>
            <span>
              {"Target: "}
              <span className="text-data font-medium">
                {kr.annual_target} {kr.unit}
              </span>
            </span>
            <span>
              {kr.direction === "higher_better"
                ? "Mes es millor"
                : "Menys es millor"}
            </span>
          </div>

          {/* Linkages row */}
          {hasLinkages && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {kr.kpi_code && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400 ring-1 ring-inset ring-sky-500/20">
                  <Link2 className="h-2.5 w-2.5" />
                  KPI: {kr.kpi_code}
                  {kr.kpi_name && <span className="text-sky-400/70"> {kr.kpi_name}</span>}
                </span>
              )}
              {kr.project_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                  <FolderKanban className="h-2.5 w-2.5" />
                  {kr.project_name}
                </span>
              )}
              {kr.responsible_team_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                  <Users className="h-2.5 w-2.5" />
                  {kr.responsible_team_name}
                </span>
              )}
              {kr.responsible_member_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
                  {kr.responsible_member_name}
                </span>
              )}
            </div>
          )}
        </div>
        {progressPct != null && (
          <span
            className="text-data shrink-0 text-lg font-bold"
            style={{ color: objColor }}
          >
            {progressPct}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {progressPct != null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-overlay-active">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              backgroundColor: objColor,
            }}
          />
        </div>
      )}

      {/* Quarterly data grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {kr.quarterly_data.map((qd) => (
          <QuarterCell
            key={qd.id}
            qd={qd}
            kr={kr}
            editing={editingQd === qd.id}
            onEdit={() => setEditingQd(editingQd === qd.id ? null : qd.id)}
            onDone={() => setEditingQd(null)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Quarter cell with inline edit ── */
function QuarterCell({
  qd,
  kr,
  editing,
  onEdit,
  onDone,
}: {
  qd: OKRQuarterlyData;
  kr: OKRKeyResult;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  const [value, setValue] = useState(
    qd.actual != null ? String(qd.actual) : "",
  );
  const mutation = useUpdateQuarterly();

  const handleSave = async () => {
    if (!value) return;
    await mutation.mutateAsync({
      id: qd.id,
      data: { actual: Number(value) },
    });
    onDone();
  };

  const handleResetAuto = async () => {
    await mutation.mutateAsync({
      id: qd.id,
      data: { reset_auto: true },
    });
    onDone();
  };

  // Calculate quarter status
  const hasActual = qd.actual != null;
  const hasTarget = qd.target != null;
  let qStatus: "ok" | "warning" | "pending" = "pending";
  if (hasActual && hasTarget) {
    const progress =
      kr.direction === "lower_better"
        ? Math.min(1, Number(qd.target) / Number(qd.actual))
        : Math.min(1, Number(qd.actual) / Number(qd.target));
    qStatus = progress >= 0.95 ? "ok" : "warning";
  }

  const statusDot = {
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    pending: "bg-slate-400",
  };

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-okr/30 bg-okr-light/30 p-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase text-text-tertiary">
            Q{qd.quarter}
          </p>
          {qd.is_manual && kr.kpi_id && (
            <button
              onClick={handleResetAuto}
              disabled={mutation.isPending}
              className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] text-sky-400 hover:bg-sky-500/10 disabled:opacity-50"
              title="Tornar a auto-calcul"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Auto
            </button>
          )}
        </div>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-overlay-muted px-2 py-1 text-data text-[12px] text-text-primary focus:border-okr focus:outline-none focus:ring-1 focus:ring-okr/30"
          autoFocus
        />
        <div className="mt-1.5 flex gap-1">
          <button
            onClick={handleSave}
            disabled={mutation.isPending || !value}
            className="flex h-5 w-5 items-center justify-center rounded bg-okr text-white disabled:opacity-50"
          >
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </button>
          <button
            onClick={onDone}
            className="flex h-5 w-5 items-center justify-center rounded bg-overlay-active text-text-secondary"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onEdit}
      className="group rounded-lg border border-border-subtle bg-surface-elevated p-2 text-left transition-colors hover:border-okr/30 hover:bg-okr-light/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-[10px] font-semibold uppercase text-text-tertiary">
            Q{qd.quarter}
          </p>
          {qd.is_auto_calculated && (
            <Zap className="h-2.5 w-2.5 text-sky-400" aria-label="Auto-calculat des del KPI" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              statusDot[qStatus],
            )}
          />
          <Pencil className="h-2.5 w-2.5 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <div className="mt-1">
        {hasTarget && (
          <p className="text-[10px] text-text-tertiary">
            {"T: "}
            <span className="text-data font-medium">
              {Number(qd.target).toLocaleString("ca-ES")}
            </span>
          </p>
        )}
        <p className="text-[11px]">
          {"A: "}
          {hasActual ? (
            <span className={cn(
              "text-data font-semibold",
              qd.is_auto_calculated ? "text-sky-400" : "text-text-primary",
            )}>
              {Number(qd.actual).toLocaleString("ca-ES", { maximumFractionDigits: 2 })}
            </span>
          ) : (
            <span className="text-text-tertiary">{"\u2014"}</span>
          )}
        </p>
      </div>
      {qd.progress != null && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-overlay-active">
          <div
            className={cn(
              "h-full rounded-full",
              qStatus === "ok" ? "bg-emerald-500" : "bg-amber-500",
            )}
            style={{
              width: `${Math.min(Math.round(qd.progress * 100), 100)}%`,
            }}
          />
        </div>
      )}
    </button>
  );
}
