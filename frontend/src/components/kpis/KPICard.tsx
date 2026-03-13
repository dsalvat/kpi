import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatNumber } from "@/lib/utils";
import type { KPIDefinition } from "@/types/kpi";
import { Star } from "lucide-react";

interface KPICardProps {
  kpi: KPIDefinition;
  onClick?: () => void;
  active?: boolean;
}

const statusAccent: Record<string, string> = {
  ok: "border-l-emerald-500",
  warning: "border-l-amber-500",
  ko: "border-l-red-500",
  no_data: "border-l-slate-400",
};

export function KPICard({ kpi, onClick, active }: KPICardProps) {
  const progress =
    kpi.current_value != null && kpi.target
      ? kpi.direction === "lower_better"
        ? Math.min(1, kpi.target / kpi.current_value)
        : Math.min(1, kpi.current_value / kpi.target)
      : null;

  const progressPct = progress != null ? Math.round(progress * 100) : 0;
  const status = kpi.current_status ?? "no_data";

  return (
    <button
      onClick={onClick}
      className={cn(
        "card-interactive w-full border-l-[3px] p-4 text-left",
        statusAccent[status] ?? "border-l-slate-400",
        onClick && "cursor-pointer",
        active && "ring-2 ring-secondary/30 border-secondary/20",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-secondary">
              {kpi.code}
            </p>
            {kpi.is_annual_objective && (
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                strokeWidth={1.5}
                aria-label="Objectiu anual lligat a variable"
              />
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-snug font-medium text-text-secondary">
            {kpi.name}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Value + Target row */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        {kpi.current_value != null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-data text-xl font-semibold text-text-primary">
              {formatNumber(kpi.current_value)}
            </span>
            <span className="text-[12px] text-text-tertiary">{kpi.unit}</span>
          </div>
        ) : (
          <span className="text-[13px] text-text-tertiary">Sense dades</span>
        )}
        <span className="text-[11px] text-text-tertiary">
          Target: {formatNumber(kpi.target)} {kpi.unit}
        </span>
      </div>

      {/* Progress bar */}
      {progress != null && (
        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-overlay-active">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  status === "ok" && "bg-emerald-500",
                  status === "warning" && "bg-amber-500",
                  status === "ko" && "bg-red-500",
                  status === "no_data" && "bg-slate-500",
                )}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
            <span className="text-data text-[11px] font-medium text-text-secondary">
              {progressPct}%
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-text-tertiary">
        <div className="h-1 w-1 rounded-full bg-text-tertiary/50" />
        {kpi.source === "manual" ? "Entrada manual" : kpi.source}
      </div>
    </button>
  );
}
