import { useDashboard } from "@/hooks/useDashboard";
import { useAppStore } from "@/store";
import { KPICard } from "@/components/kpis/KPICard";
import { MoneyCard } from "@/components/value/MoneyCard";
import { KRProgressBar } from "@/components/okrs/KRProgressBar";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatPercent } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const year = useAppStore((s) => s.selectedYear);
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="card flex items-center gap-4 border-l-[3px] border-l-danger p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-light">
          <AlertCircle className="h-5 w-5 text-danger" strokeWidth={1.8} />
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
    <div className="space-y-10">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"Dashboard "}
          <span className="text-data text-lg font-medium text-text-tertiary">{year}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Resum executiu del Departament de Sistemes IT
        </p>
      </div>

      {/* KPIs Operatius */}
      <section className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <SectionHeader title="KPIs Operatius" />
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : data?.kpi_summary && data.kpi_summary.length > 0 ? (
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.kpi_summary.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sense KPIs"
            description="No hi ha KPIs definits per a aquest any."
          />
        )}
      </section>

      {/* Projectes + Valor Negoci */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Projects */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <SectionHeader title="Projectes IT" />
          {isLoading ? (
            <SkeletonCard />
          ) : data?.projects_summary ? (
            <div className="card p-6">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <StatBlock
                  label="Actius"
                  value={data.projects_summary.active}
                  color="text-secondary"
                />
                <StatBlock
                  label="En risc"
                  value={data.projects_summary.at_risk}
                  color="text-warning"
                />
                <StatBlock
                  label="Completats"
                  value={data.projects_summary.completed}
                  color="text-success"
                />
                <StatBlock
                  label="Bloquejats"
                  value={data.projects_summary.blocked}
                  color="text-danger"
                />
              </div>
              {data.projects_summary.avg_completion_pct != null && (
                <div className="mt-5 border-t border-border-subtle pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Completament mitja
                  </p>
                  <p className="mt-1 text-data text-xl font-semibold text-text-primary">
                    {Math.round(data.projects_summary.avg_completion_pct)}%
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </section>

        {/* Value */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <SectionHeader title="Valor al Negoci" />
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : data?.value_summary ? (
            <div className="grid gap-4 sm:grid-cols-2">
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
          ) : null}
        </section>
      </div>

      {/* OKRs */}
      <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="mb-5 flex items-center justify-between">
          <SectionHeader title={`OKRs ${year}`} noMargin />
          {data?.okr_summary?.overall_progress != null && (
            <span className="rounded-lg bg-okr-light px-3 py-1.5 text-data text-[12px] font-semibold text-okr ring-1 ring-inset ring-okr/10">
              Progres global: {formatPercent(data.okr_summary.overall_progress)}
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : data?.okr_summary?.objectives &&
          data.okr_summary.objectives.length > 0 ? (
          <div className="stagger-children space-y-5">
            {data.okr_summary.objectives.map((obj) => (
              <div key={obj.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-data text-[13px] font-semibold text-okr">
                        {obj.code}
                      </span>
                      <span className="text-[13px] font-medium text-text-primary">
                        {obj.title}
                      </span>
                    </div>
                    {obj.owner && (
                      <p className="mt-1 text-[11px] text-text-tertiary">
                        {obj.owner}
                      </p>
                    )}
                  </div>
                  {obj.progress != null && (
                    <span className="text-data shrink-0 text-sm font-semibold text-okr">
                      {formatPercent(obj.progress)}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {obj.key_results.map((kr) => (
                    <KRProgressBar key={kr.id} kr={kr} />
                  ))}
                </div>
              </div>
            ))}
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

function SectionHeader({
  title,
  noMargin,
}: {
  title: string;
  noMargin?: boolean;
}) {
  return (
    <h2
      className={cn(
        "text-display text-[15px] font-semibold text-text-primary",
        !noMargin && "mb-4",
      )}
    >
      {title}
    </h2>
  );
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={cn("text-data text-2xl font-semibold", color)}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
    </div>
  );
}
