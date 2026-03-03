import { cn } from "@/lib/utils";
import type { KPIStatus } from "@/types/kpi";

const statusConfig: Record<
  KPIStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  ok: {
    label: "OK",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },
  warning: {
    label: "Alerta",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/10",
  },
  ko: {
    label: "KO",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 ring-red-600/10",
  },
  no_data: {
    label: "Sense dades",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-50 text-slate-500 ring-slate-500/10",
  },
};

interface StatusBadgeProps {
  status: KPIStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        config.badgeClass,
        className,
      )}
      role="status"
      aria-label={`Estat: ${config.label}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
