import { cn } from "@/lib/utils";
import type { OKRKeyResult } from "@/types/okr";

interface KRProgressBarProps {
  kr: OKRKeyResult;
}

const confidenceConfig: Record<string, { label: string; className: string }> = {
  Alta: { label: "Alta", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10" },
  Mitjana: { label: "Mitjana", className: "bg-amber-50 text-amber-700 ring-amber-600/10" },
  Baixa: { label: "Baixa", className: "bg-red-50 text-red-700 ring-red-600/10" },
};

export function KRProgressBar({ kr }: KRProgressBarProps) {
  const progressPct =
    kr.annual_progress != null ? Math.round(kr.annual_progress * 100) : null;

  return (
    <div className="rounded-lg border border-border-subtle bg-white p-3.5 transition-colors hover:border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-data text-[11px] font-semibold text-okr">
            {kr.code}
          </span>
          <span className="ml-2 text-[12px] text-text-secondary">
            {kr.title}
          </span>
        </div>
        {kr.confidence && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
              confidenceConfig[kr.confidence]?.className ?? "bg-slate-50 text-slate-500 ring-slate-500/10",
            )}
          >
            {kr.confidence}
          </span>
        )}
      </div>

      {/* Quarterly data */}
      <div className="mt-2.5 flex gap-4">
        {kr.quarterly_data.map((qd) => (
          <div key={qd.quarter} className="text-[11px]">
            <span className="font-medium text-text-tertiary">Q{qd.quarter}</span>
            <span className="ml-1.5">
              {qd.actual != null ? (
                <span className="text-data font-medium text-text-primary">
                  {Number(qd.actual).toFixed(1)}
                </span>
              ) : (
                <span className="text-text-tertiary">--</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {progressPct != null && (
        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-okr-light">
            <div
              className="h-full rounded-full bg-okr transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-data text-[10px] text-text-tertiary">
            {progressPct}%
          </p>
        </div>
      )}
    </div>
  );
}
