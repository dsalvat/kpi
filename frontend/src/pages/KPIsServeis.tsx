import { useMemo, useState } from "react";
import { useKPIs } from "@/hooks/useKPIs";
import { useAppStore } from "@/store";
import { KPICard } from "@/components/kpis/KPICard";
import { KPIDetailPanel } from "@/components/kpis/KPIDetailPanel";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { KPIDefinition, KPIStatus } from "@/types/kpi";
import {
  Shield,
  AlertTriangle,
  Headphones,
  Star,
  Zap,
  Monitor,
} from "lucide-react";

const CATEGORY_META: Record<
  string,
  { label: string; icon: typeof Shield; order: number }
> = {
  disponibilitat: { label: "Disponibilitat", icon: Shield, order: 1 },
  incidents: { label: "Incidents", icon: AlertTriangle, order: 2 },
  helpdesk: { label: "Helpdesk", icon: Headphones, order: 3 },
  qualitat: { label: "Qualitat", icon: Star, order: 4 },
  "eficiència": { label: "Eficiencia", icon: Zap, order: 5 },
};

function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] ?? {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      icon: Monitor,
      order: 99,
    }
  );
}

export default function KPIsServeis() {
  const year = useAppStore((s) => s.selectedYear);
  const { data: kpis, isLoading } = useKPIs({ group: "serveis" });
  const [selectedKPI, setSelectedKPI] = useState<KPIDefinition | null>(null);

  // Group KPIs by category
  const grouped = useMemo(() => {
    if (!kpis) return [];
    const map = new Map<string, KPIDefinition[]>();
    for (const kpi of kpis) {
      const cat = kpi.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(kpi);
    }
    return Array.from(map.entries())
      .map(([cat, items]) => ({
        category: cat,
        meta: getCategoryMeta(cat),
        kpis: items,
      }))
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [kpis]);

  // Global summary
  const summary = useMemo(() => {
    if (!kpis || kpis.length === 0) return null;
    const counts = { ok: 0, warning: 0, ko: 0, no_data: 0 };
    for (const kpi of kpis) {
      const s = (kpi.current_status ?? "no_data") as KPIStatus;
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [kpis]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"KPIs Serveis "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Indicadors operatius dels serveis IT. Fes clic per veure el detall i
          afegir valors.
        </p>
      </div>

      {/* Summary strip */}
      {summary && !isLoading && (
        <div
          className="animate-fade-in-up flex flex-wrap items-center gap-3"
          style={{ animationDelay: "0.03s" }}
        >
          <span className="text-[12px] font-medium uppercase tracking-wider text-text-tertiary">
            Resum
          </span>
          <div className="flex items-center gap-2">
            <SummaryPill status="ok" count={summary.ok} />
            <SummaryPill status="warning" count={summary.warning} />
            <SummaryPill status="ko" count={summary.ko} />
            <SummaryPill status="no_data" count={summary.no_data} />
          </div>
          <span className="text-data ml-auto text-[13px] font-medium text-text-tertiary">
            {kpis?.length ?? 0} KPIs
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="mb-3 h-5 w-32 animate-shimmer rounded" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!kpis || kpis.length === 0) && (
        <EmptyState
          title="Sense KPIs de serveis"
          description="No hi ha KPIs de serveis definits per a aquest any."
        />
      )}

      {/* Grouped KPI sections */}
      {!isLoading &&
        grouped.map((group, groupIdx) => {
          const Icon = group.meta.icon;
          return (
            <section
              key={group.category}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.05 + groupIdx * 0.06}s` }}
            >
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/8">
                  <Icon
                    className="h-4 w-4 text-secondary"
                    strokeWidth={1.8}
                  />
                </div>
                <h2 className="text-display text-[15px] font-semibold text-text-primary">
                  {group.meta.label}
                </h2>
                <span className="text-data text-[11px] font-medium text-text-tertiary">
                  {group.kpis.length}
                </span>
              </div>
              <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.kpis.map((kpi) => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    active={selectedKPI?.id === kpi.id}
                    onClick={() =>
                      setSelectedKPI(
                        selectedKPI?.id === kpi.id ? null : kpi,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}

      {/* Detail panel */}
      {selectedKPI && (
        <KPIDetailPanel
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}

function SummaryPill({
  status,
  count,
}: {
  status: KPIStatus;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <StatusBadge status={status} />
      <span className="text-data text-[13px] font-semibold text-text-primary">
        {count}
      </span>
    </div>
  );
}
