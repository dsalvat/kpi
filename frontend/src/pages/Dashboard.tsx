import { useMemo } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAppStore } from "@/store";
import { MoneyCard } from "@/components/value/MoneyCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatNumber, formatPercent, formatCurrency } from "@/lib/utils";
import type { KPIDefinition, KPIStatus } from "@/types/kpi";
import {
  AlertCircle,
  Monitor,
  FolderKanban,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
} from "lucide-react";

export default function Dashboard() {
  const year = useAppStore((s) => s.selectedYear);
  const { data, isLoading, error } = useDashboard();

  // Split KPIs into SRV-*, PRJ-M*, and strategic
  const { srvKPIs, prjKPIs, strategicKPIs } = useMemo(() => {
    if (!data?.kpi_summary) return { srvKPIs: [], prjKPIs: [], strategicKPIs: [] };
    return {
      srvKPIs: data.kpi_summary.filter((k) => k.code.startsWith("SRV")),
      prjKPIs: data.kpi_summary.filter((k) => k.code.startsWith("PRJ")),
      strategicKPIs: data.kpi_summary.filter((k) => k.is_annual_objective),
    };
  }, [data]);

  // KPI status counts for serveis
  const srvCounts = useMemo(() => {
    const c = { ok: 0, warning: 0, ko: 0, no_data: 0 };
    for (const k of srvKPIs) {
      const s = (k.current_status ?? "no_data") as KPIStatus;
      c[s]++;
    }
    return c;
  }, [srvKPIs]);

  if (error) {
    return (
      <div className="card flex items-center gap-4 border-l-[3px] border-l-danger p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-light">
          <AlertCircle
            className="h-5 w-5 text-danger"
            strokeWidth={1.8}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            Error carregant el dashboard
          </p>
          <p className="mt-0.5 text-[13px] text-text-tertiary">
            Comprova que el backend estigui funcionant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"Dashboard "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Resum executiu del Departament de Sistemes IT
        </p>
      </div>

      {/* ── 0. KPIs Estratègics — annual objectives ── */}
      {!isLoading && strategicKPIs.length > 0 && (
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.02s" }}
        >
          <SectionHeader title="KPIs Estratègics" icon={Star}>
            <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/20">
              <Star className="h-3 w-3 fill-amber-400" strokeWidth={1.5} />
              Objectius anuals lligats a variable
            </span>
          </SectionHeader>
          <KPICompactTable kpis={strategicKPIs} showStar />
        </section>
      )}

      {/* ── 1. KPIs Serveis — compact table ── */}
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "0.03s" }}
      >
        <SectionHeader title="KPIs Serveis" icon={Monitor}>
          {!isLoading && srvKPIs.length > 0 && (
            <div className="flex items-center gap-2">
              <StatusCount status="ok" count={srvCounts.ok} />
              <StatusCount status="warning" count={srvCounts.warning} />
              <StatusCount status="ko" count={srvCounts.ko} />
            </div>
          )}
        </SectionHeader>

        {isLoading ? (
          <SkeletonCard />
        ) : srvKPIs.length > 0 ? (
          <KPICompactTable kpis={srvKPIs} />
        ) : (
          <EmptyState
            title="Sense KPIs"
            description="No hi ha KPIs de serveis."
          />
        )}
      </section>

      {/* ── 2. Projectes + Valor al Negoci — side by side ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projectes */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.06s" }}
        >
          <SectionHeader title="Projectes IT" icon={FolderKanban} />
          {isLoading ? (
            <SkeletonCard />
          ) : data?.projects_summary ? (
            <div className="card p-5">
              <div className="grid grid-cols-4 gap-3">
                <StatPill
                  label="Actius"
                  value={data.projects_summary.active}
                  icon={Clock}
                  color="text-blue-600"
                />
                <StatPill
                  label="En risc"
                  value={data.projects_summary.at_risk}
                  icon={AlertTriangle}
                  color="text-amber-600"
                />
                <StatPill
                  label="Completats"
                  value={data.projects_summary.completed}
                  icon={CheckCircle2}
                  color="text-emerald-600"
                />
                <StatPill
                  label="Compl. mitja"
                  value={
                    data.projects_summary.avg_completion_pct != null
                      ? `${Math.round(data.projects_summary.avg_completion_pct)}%`
                      : "—"
                  }
                  color="text-text-primary"
                />
              </div>

              {/* Mini project KPIs */}
              {prjKPIs.length > 0 && (
                <div className="mt-4 border-t border-border-subtle pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {prjKPIs.slice(0, 4).map((kpi) => (
                      <MiniKPI key={kpi.id} kpi={kpi} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>

        {/* Valor al Negoci */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.09s" }}
        >
          <SectionHeader title="Valor al Negoci" icon={TrendingUp} />
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : data?.value_summary ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <MoneyCard
                  type="blue"
                  title="Blue Money"
                  subtitle="Eficiencia IT"
                  total={data.value_summary.blue_money_total}
                  target={data.value_summary.blue_money_target}
                />
                <MoneyCard
                  type="green"
                  title="Green Money"
                  subtitle="Valor al Negoci"
                  total={data.value_summary.green_money_total}
                  target={data.value_summary.green_money_target}
                />
              </div>
              <div className="card flex items-center justify-between px-5 py-3">
                <span className="text-[12px] font-medium uppercase tracking-wider text-text-tertiary">
                  Valor total IT
                </span>
                <span className="text-data text-lg font-bold text-secondary">
                  {formatCurrency(
                    data.value_summary.blue_money_total +
                      data.value_summary.green_money_total,
                  )}
                </span>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* ── 3. OKRs — compact progress bars ── */}
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "0.12s" }}
      >
        <SectionHeader title={`OKRs ${year}`} icon={Target}>
          {data?.okr_summary?.overall_progress != null && (
            <span className="rounded-lg bg-okr-light px-2.5 py-1 text-data text-[11px] font-semibold text-okr ring-1 ring-inset ring-okr/10">
              {formatPercent(data.okr_summary.overall_progress)}
            </span>
          )}
        </SectionHeader>
        {isLoading ? (
          <SkeletonCard />
        ) : data?.okr_summary?.objectives &&
          data.okr_summary.objectives.length > 0 ? (
          <div className="card divide-y divide-border-subtle">
            {data.okr_summary.objectives.map((obj) => {
              const pct =
                obj.progress != null
                  ? Math.round(obj.progress * 100)
                  : null;
              return (
                <div
                  key={obj.id}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <span className="text-data w-8 shrink-0 text-[12px] font-semibold text-okr">
                    {obj.code}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] text-text-secondary">
                    {obj.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-okr-light sm:block">
                      <div
                        className="h-full rounded-full bg-okr transition-all duration-500"
                        style={{
                          width: `${Math.min(pct ?? 0, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-data w-10 text-right text-[13px] font-semibold text-text-primary">
                      {pct != null ? `${pct}%` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Sense OKRs"
            description="No hi ha OKRs definits per a aquest any."
          />
        )}
      </section>
    </div>
  );
}

/* ── Section header with icon ── */
function SectionHeader({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Monitor;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/8">
          <Icon className="h-3.5 w-3.5 text-secondary" strokeWidth={1.8} />
        </div>
        <h2 className="text-display text-[14px] font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* ── Compact KPI table ── */
function KPICompactTable({ kpis, showStar }: { kpis: KPIDefinition[]; showStar?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-overlay-subtle">
            <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Codi
            </th>
            <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Indicador
            </th>
            <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Valor
            </th>
            <th className="hidden px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary sm:table-cell">
              Target
            </th>
            <th className="px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Estat
            </th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => {
            const status = (kpi.current_status ?? "no_data") as KPIStatus;
            return (
              <tr
                key={kpi.id}
                className="border-b border-border-subtle last:border-b-0 transition-colors hover:bg-overlay-subtle"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-data text-[11px] font-semibold uppercase tracking-wider text-secondary">
                      {kpi.code}
                    </span>
                    {(showStar || kpi.is_annual_objective) && (
                      <Star
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                        strokeWidth={1.5}
                        aria-label="Objectiu anual"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-text-secondary">{kpi.name}</td>
                <td className="px-4 py-2 text-right">
                  {kpi.current_value != null ? (
                    <span className="text-data font-semibold text-text-primary">
                      {formatNumber(kpi.current_value)}
                      <span className="ml-0.5 text-[11px] font-normal text-text-tertiary">
                        {kpi.unit}
                      </span>
                    </span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-2 text-right text-data text-text-tertiary sm:table-cell">
                  {formatNumber(kpi.target)} {kpi.unit}
                </td>
                <td className="px-4 py-2 text-center">
                  <StatusDot status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Status dot ── */
const statusDotColors: Record<KPIStatus, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  ko: "bg-red-500",
  no_data: "bg-slate-400",
};

function StatusDot({ status }: { status: KPIStatus }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        statusDotColors[status],
      )}
      role="status"
      aria-label={status}
    />
  );
}

/* ── Status count mini-badge ── */
function StatusCount({
  status,
  count,
}: {
  status: KPIStatus;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
      <span
        className={cn("h-1.5 w-1.5 rounded-full", statusDotColors[status])}
      />
      {count}
    </span>
  );
}

/* ── Stat pill for projects ── */
function StatPill({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon?: typeof Clock;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {Icon && (
          <Icon className={cn("h-3 w-3", color)} strokeWidth={2} />
        )}
        <span className={cn("text-data text-lg font-semibold", color)}>
          {value}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
    </div>
  );
}

/* ── Mini KPI for project section ── */
function MiniKPI({ kpi }: { kpi: KPIDefinition }) {
  const status = (kpi.current_status ?? "no_data") as KPIStatus;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-overlay-subtle px-3 py-2">
      <StatusDot status={status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-text-tertiary">{kpi.name}</p>
      </div>
      <span className="text-data shrink-0 text-[12px] font-semibold text-text-primary">
        {kpi.current_value != null
          ? `${formatNumber(kpi.current_value)}${kpi.unit}`
          : "—"}
      </span>
    </div>
  );
}
