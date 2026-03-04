import { cn } from "@/lib/utils";
import type { KPIStatus } from "@/types/kpi";

const statusConfig: Record<
  KPIStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  ok: {
    label: "OK",
    dotClass: "bg-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  warning: {
    label: "Alerta",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  },
  ko: {
    label: "KO",
    dotClass: "bg-red-400",
    badgeClass: "bg-red-500/10 text-red-400 ring-red-500/20",
  },
  no_data: {
    label: "Sense dades",
    dotClass: "bg-slate-500",
    badgeClass: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
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
