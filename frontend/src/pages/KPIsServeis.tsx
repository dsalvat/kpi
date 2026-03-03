import { useState } from "react";
import { useKPIs } from "@/hooks/useKPIs";
import { useAppStore } from "@/store";
import { KPICard } from "@/components/kpis/KPICard";
import { KPIValueForm } from "@/components/kpis/KPIValueForm";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { KPIDefinition } from "@/types/kpi";

export default function KPIsServeis() {
  const year = useAppStore((s) => s.selectedYear);
  const { data: kpis, isLoading } = useKPIs("serveis");
  const [selectedKPI, setSelectedKPI] = useState<KPIDefinition | null>(null);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"KPIs Serveis "}
          <span className="text-data text-lg font-medium text-text-tertiary">{year}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Indicadors operatius dels serveis IT. Fes clic per afegir valors manualment.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : kpis && kpis.length > 0 ? (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.id}
              kpi={kpi}
              onClick={() => setSelectedKPI(kpi)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sense KPIs de serveis"
          description="No hi ha KPIs de serveis definits."
        />
      )}

      {selectedKPI && (
        <KPIValueForm
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}
