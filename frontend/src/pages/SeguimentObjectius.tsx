import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Target,
  User,
  Activity,
  Briefcase,
  Link2,
  Minus,
  ClipboardList,
  Save,
  X,
} from "lucide-react";
import { useAppStore } from "@/store";
import { useScorecardTree, useAddIndicatorValue } from "@/hooks/useScorecards";
import type { ScorecardTreeNode, ScorecardIndicator } from "@/types/scorecard";

/* ════════════════════════════════════════════════════════════ */
/*  STATUS HELPERS                                              */
/* ════════════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  ok: { icon: "✅", label: "OK", color: "text-emerald-600", bg: "bg-emerald-50" },
  warning: { icon: "⚠️", label: "Alerta", color: "text-amber-600", bg: "bg-amber-50" },
  ko: { icon: "🔴", label: "KO", color: "text-red-600", bg: "bg-red-50" },
  no_data: { icon: "⚪", label: "Sense dades", color: "text-gray-400", bg: "bg-gray-50" },
} as const;

function StatusBadge({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[(status as keyof typeof STATUS_CONFIG) ?? "no_data"] ?? STATUS_CONFIG.no_data;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number | null; size?: number }) {
  const pct = score != null ? Math.round(score * 100) : null;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = pct != null ? circumference * (1 - pct / 100) : circumference;

  let strokeColor = "stroke-gray-200";
  if (pct != null) {
    if (pct >= 95) strokeColor = "stroke-emerald-500";
    else if (pct >= 80) strokeColor = "stroke-amber-500";
    else strokeColor = "stroke-red-500";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="currentColor" strokeWidth={3} className="text-gray-100" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className={`transition-all duration-700 ${strokeColor}`} />
      </svg>
      <span className="absolute text-[11px] font-bold text-text-primary">
        {pct != null ? `${pct}%` : "—"}
      </span>
    </div>
  );
}

function ProgressBar({ value, className = "" }: { value: number | null; className?: string }) {
  const pct = value != null ? Math.round(value * 100) : 0;
  let barColor = "bg-gray-200";
  if (value != null) {
    if (value >= 0.95) barColor = "bg-emerald-500";
    else if (value >= 0.80) barColor = "bg-amber-500";
    else barColor = "bg-red-500";
  }

  return (
    <div className={`h-1.5 w-full rounded-full bg-gray-100 ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  INDICATOR ROW                                               */
/* ════════════════════════════════════════════════════════════ */

function IndicatorRow({ indicator, year }: { indicator: ScorecardIndicator; year: number }) {
  const [showForm, setShowForm] = useState(false);
  const [formValue, setFormValue] = useState("");
  const [actionsDone, setActionsDone] = useState("");
  const [actionsNext, setActionsNext] = useState("");
  const addValue = useAddIndicatorValue();

  const handleSubmit = () => {
    const numValue = parseFloat(formValue);
    if (isNaN(numValue)) return;

    const periodType = indicator.frequency;
    const now = new Date();
    let period = 0;
    if (periodType === "monthly") period = now.getMonth() + 1;
    else if (periodType === "quarterly") period = Math.ceil((now.getMonth() + 1) / 3);

    addValue.mutate({
      indicatorId: indicator.id,
      data: {
        year,
        period_type: periodType,
        period,
        value: numValue,
        actions_done: actionsDone || undefined,
        actions_next: actionsNext || undefined,
      },
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormValue("");
        setActionsDone("");
        setActionsNext("");
      },
    });
  };

  const lastValue = indicator.values.length > 0
    ? indicator.values[indicator.values.length - 1]
    : null;

  return (
    <div className="group">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg/60">
        {/* Weight */}
        <span className="w-12 shrink-0 text-right text-[11px] font-medium text-text-tertiary">
          {indicator.weight_pct}%
        </span>

        {/* Name + shared badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-medium text-text-primary">
              {indicator.name}
            </span>
            {indicator.shared_group_id && (
              <Link2 className="h-3 w-3 shrink-0 text-secondary" strokeWidth={2} />
            )}
          </div>
          {indicator.description && (
            <p className="mt-0.5 truncate text-[11px] text-text-tertiary">{indicator.description}</p>
          )}
        </div>

        {/* Current value */}
        <div className="w-20 text-right">
          {indicator.current_value != null ? (
            <span className="text-[13px] font-semibold font-mono text-text-primary">
              {indicator.current_value}{indicator.unit === "%" ? "%" : ` ${indicator.unit}`}
            </span>
          ) : (
            <span className="text-[11px] text-text-tertiary">—</span>
          )}
        </div>

        {/* Target */}
        <div className="w-16 text-right">
          <span className="text-[11px] text-text-tertiary">
            /{indicator.target_value}{indicator.unit === "%" ? "%" : ""}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-24">
          <ProgressBar value={indicator.progress} />
        </div>

        {/* Status */}
        <div className="w-20">
          <StatusBadge status={indicator.status} />
        </div>

        {/* Add value button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md p-1 text-text-tertiary opacity-0 transition-all hover:bg-secondary/10 hover:text-secondary group-hover:opacity-100"
          title="Registrar valor"
        >
          <ClipboardList className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Inline value form */}
      {showForm && (
        <div className="ml-16 mr-4 mb-2 rounded-lg border border-border bg-surface p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                Valor ({indicator.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="h-8 w-24 rounded-md border border-border bg-bg px-2 text-[13px] focus:border-secondary focus:outline-none"
                placeholder={String(indicator.target_value)}
                autoFocus
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                Accions realitzades
              </label>
              <input
                type="text"
                value={actionsDone}
                onChange={(e) => setActionsDone(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-bg px-2 text-[13px] focus:border-secondary focus:outline-none"
                placeholder="Què s'ha fet..."
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                Accions pròxima revisió
              </label>
              <input
                type="text"
                value={actionsNext}
                onChange={(e) => setActionsNext(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-bg px-2 text-[13px] focus:border-secondary focus:outline-none"
                placeholder="Què es farà..."
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleSubmit}
                disabled={!formValue || addValue.isPending}
                className="flex h-8 items-center gap-1 rounded-md bg-secondary px-3 text-[12px] font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
              >
                <Save className="h-3 w-3" /> Desar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-8 items-center rounded-md px-2 text-text-tertiary hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Last value context */}
          {lastValue && (
            <div className="mt-2 rounded-md bg-bg/60 px-3 py-1.5 text-[11px] text-text-tertiary">
              Últim valor: <strong>{lastValue.value}</strong> ({lastValue.period_type} {lastValue.period})
              {lastValue.actions_done && <> · Fet: {lastValue.actions_done}</>}
              {lastValue.actions_next && <> · Pròxim: {lastValue.actions_next}</>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SCORECARD DETAIL                                            */
/* ════════════════════════════════════════════════════════════ */

function ScorecardDetail({ node, year }: { node: ScorecardTreeNode; year: number }) {
  const sc = node.scorecard;
  if (!sc) return null;

  const operational = sc.indicators.filter((i) => i.category === "operational");
  const management = sc.indicators.filter((i) => i.category === "management");

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">{sc.name}</h3>
        <ScoreRing score={node.overall_score} size={52} />
      </div>

      {/* Operational */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-secondary" strokeWidth={2} />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-secondary">
              Indicadors Operacionals
            </span>
            <span className="text-[11px] text-text-tertiary">({sc.operational_weight}%)</span>
          </div>
          <span className="text-[13px] font-semibold text-text-primary">
            {node.operational_score != null ? `${Math.round(node.operational_score * 100)}%` : "—"}
          </span>
        </div>
        <ProgressBar value={node.operational_score} className="mb-2" />
        <div className="space-y-0">
          {operational.map((ind) => (
            <IndicatorRow key={ind.id} indicator={ind} year={year} />
          ))}
        </div>
      </div>

      {/* Management */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-primary">
              Indicadors de Gestió
            </span>
            <span className="text-[11px] text-text-tertiary">({sc.management_weight}%)</span>
          </div>
          <span className="text-[13px] font-semibold text-text-primary">
            {node.management_score != null ? `${Math.round(node.management_score * 100)}%` : "—"}
          </span>
        </div>
        <ProgressBar value={node.management_score} className="mb-2" />
        <div className="space-y-0">
          {management.map((ind) => (
            <IndicatorRow key={ind.id} indicator={ind} year={year} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  TREE NODE                                                   */
/* ════════════════════════════════════════════════════════════ */

const LEVEL_STYLES = {
  department: {
    icon: Building2,
    bgHeader: "bg-primary/5 border-primary/20",
    textColor: "text-primary",
  },
  area: {
    icon: Target,
    bgHeader: "bg-secondary/5 border-secondary/20",
    textColor: "text-secondary",
  },
  team: {
    icon: User,
    bgHeader: "bg-emerald-500/5 border-emerald-500/20",
    textColor: "text-emerald-700",
  },
} as const;

function TreeNode({ node, year, depth = 0 }: { node: ScorecardTreeNode; year: number; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const style = LEVEL_STYLES[node.org_level];
  const Icon = style.icon;
  const hasChildren = node.children.length > 0;
  const hasScorecard = node.scorecard != null;

  const levelLabel = node.org_level === "department" ? "Departament"
    : node.org_level === "area" ? "Àrea"
    : "Equip";

  return (
    <div className={depth > 0 ? "ml-4 border-l-2 border-border/40 pl-4" : ""}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm ${style.bgHeader}`}
      >
        {(hasChildren || hasScorecard) ? (
          expanded
            ? <ChevronDown className={`h-4 w-4 ${style.textColor}`} />
            : <ChevronRight className={`h-4 w-4 ${style.textColor}`} />
        ) : (
          <Minus className="h-4 w-4 text-text-tertiary" />
        )}
        <Icon className={`h-4.5 w-4.5 ${style.textColor}`} strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.textColor}`}>
              {levelLabel}
            </span>
            <span className="text-[14px] font-semibold text-text-primary">
              {node.org_entity_name}
            </span>
          </div>
          {node.responsible_name && (
            <span className="text-[11px] text-text-tertiary">{node.responsible_name}</span>
          )}
        </div>
        <ScoreRing score={node.overall_score} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-2">
          {hasScorecard && <ScorecardDetail node={node} year={year} />}
          {hasChildren && (
            <div className="mt-3 space-y-3">
              {node.children.map((child) => (
                <TreeNode key={child.org_entity_id} node={child} year={year} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PAGE                                                        */
/* ════════════════════════════════════════════════════════════ */

export default function SeguimentObjectius() {
  const { selectedYear, selectedCompanyId } = useAppStore();
  const { data: tree, isLoading } = useScorecardTree(selectedCompanyId, selectedYear);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Seguiment Objectius</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Objectius departamentals, per àrea i per equip — Any {selectedYear}
        </p>
      </div>

      {/* Summary cards */}
      {tree && tree.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tree.map((dept) => {
            const totalTeams = dept.children.reduce((acc, a) => acc + a.children.length, 0);
            const teamsWithScore = dept.children
              .flatMap((a) => a.children)
              .filter((t) => t.overall_score != null);

            return (
              <div key={dept.org_entity_id} className="card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-primary">
                    {dept.org_entity_name}
                  </span>
                  <ScoreRing score={dept.overall_score} size={44} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[18px] font-bold text-text-primary">
                      {dept.children.length}
                    </div>
                    <div className="text-[10px] text-text-tertiary">Àrees</div>
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-text-primary">{totalTeams}</div>
                    <div className="text-[10px] text-text-tertiary">Equips</div>
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-text-primary">
                      {teamsWithScore.length}/{totalTeams}
                    </div>
                    <div className="text-[10px] text-text-tertiary">Amb dades</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* No company selected */}
      {!selectedCompanyId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Building2 className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-[14px] text-text-secondary">Selecciona una empresa per veure els objectius</p>
        </div>
      )}

      {/* Tree */}
      {tree && (
        <div className="space-y-4">
          {tree.map((node) => (
            <TreeNode key={node.org_entity_id} node={node} year={selectedYear} />
          ))}
        </div>
      )}
    </div>
  );
}
