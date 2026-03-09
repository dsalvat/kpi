import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useKPIs } from "@/hooks/useKPIs";
import { useAppStore } from "@/store";
import { KPICard } from "@/components/kpis/KPICard";
import { KPIDetailPanel } from "@/components/kpis/KPIDetailPanel";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { KPIDefinition } from "@/types/kpi";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Wallet,
  BarChart3,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const STATUS_CONFIG: Record<
  Project["status"],
  { label: string; dotClass: string; bgClass: string }
> = {
  active: {
    label: "Actiu",
    dotClass: "bg-blue-400",
    bgClass: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  },
  completed: {
    label: "Completat",
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  at_risk: {
    label: "En risc",
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  },
  blocked: {
    label: "Bloquejat",
    dotClass: "bg-red-400",
    bgClass: "bg-red-500/10 text-red-400 ring-red-500/20",
  },
};

const KPI_CATEGORY_META: Record<
  string,
  { label: string; icon: typeof Package; order: number }
> = {
  lliurament: { label: "Lliurament", icon: Package, order: 1 },
  pressupost: { label: "Pressupost", icon: Wallet, order: 2 },
  qualitat: { label: "Qualitat", icon: TrendingUp, order: 3 },
  "eficiència": { label: "Eficiencia", icon: BarChart3, order: 4 },
  cartera: { label: "Cartera", icon: FolderKanban, order: 5 },
  valor: { label: "Valor", icon: ArrowUpRight, order: 6 },
};

export default function KPIsProjectes() {
  const year = useAppStore((s) => s.selectedYear);
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: kpis, isLoading: loadingKPIs } = useKPIs({
    group: "projectes",
  });
  const [selectedKPI, setSelectedKPI] = useState<KPIDefinition | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Portfolio summary
  const summary = useMemo(() => {
    if (!projects) return null;
    const counts = { active: 0, completed: 0, at_risk: 0, blocked: 0 };
    let totalPct = 0;
    let pctCount = 0;
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1;
      if (p.completion_pct != null) {
        totalPct += p.completion_pct;
        pctCount++;
      }
    }
    return {
      ...counts,
      total: projects.length,
      avgCompletion: pctCount > 0 ? Math.round(totalPct / pctCount) : null,
    };
  }, [projects]);

  // Group KPIs by category
  const groupedKPIs = useMemo(() => {
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
        meta: KPI_CATEGORY_META[cat] ?? {
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: BarChart3,
          order: 99,
        },
        kpis: items,
      }))
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [kpis]);

  const isLoading = loadingProjects || loadingKPIs;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"KPIs Projectes "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Seguiment de la cartera de projectes IT i indicadors de lliurament
        </p>
      </div>

      {/* Portfolio summary */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        summary && (
          <div
            className="animate-fade-in-up grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            style={{ animationDelay: "0.03s" }}
          >
            <SummaryCard
              label="Total"
              value={summary.total}
              icon={FolderKanban}
              color="text-secondary"
              bgColor="bg-secondary/8"
            />
            <SummaryCard
              label="Actius"
              value={summary.active}
              icon={Clock}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <SummaryCard
              label="Completats"
              value={summary.completed}
              icon={CheckCircle2}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <SummaryCard
              label="En risc"
              value={summary.at_risk}
              icon={AlertTriangle}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
            />
            {summary.avgCompletion != null && (
              <div className="card flex flex-col items-center justify-center p-4 text-center">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                  Completament mitja
                </p>
                <p className="text-data mt-1 text-2xl font-semibold text-text-primary">
                  {summary.avgCompletion}%
                </p>
              </div>
            )}
          </div>
        )
      )}

      {/* Project table */}
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "0.08s" }}
      >
        <SectionHeader
          title="Cartera de projectes"
          icon={FolderKanban}
          count={projects?.length}
        />

        {isLoading ? (
          <SkeletonCard />
        ) : projects && projects.length > 0 ? (
          <div className="card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-overlay-subtle">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Projecte
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Estat
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Completament
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary md:table-cell">
                    Pressupost
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary md:table-cell">
                    Cost real
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary lg:table-cell">
                    Desviacio
                  </th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    expanded={expandedProject === project.id}
                    onToggle={() =>
                      setExpandedProject(
                        expandedProject === project.id ? null : project.id,
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Sense projectes"
            description="No hi ha projectes definits."
          />
        )}
      </section>

      {/* Project delivery KPIs */}
      {!isLoading &&
        groupedKPIs.map((group, groupIdx) => {
          const Icon = group.meta.icon;
          return (
            <section
              key={group.category}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.14 + groupIdx * 0.05}s` }}
            >
              <SectionHeader
                title={`KPIs ${group.meta.label}`}
                icon={Icon}
                count={group.kpis.length}
              />
              <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* KPI Detail panel */}
      {selectedKPI && (
        <KPIDetailPanel
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}

/* ── Summary card ── */
function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          bgColor,
        )}
      >
        <Icon className={cn("h-4.5 w-4.5", color)} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-data text-xl font-semibold text-text-primary">
          {value}
        </p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({
  title,
  icon: Icon,
  count,
}: {
  title: string;
  icon: typeof FolderKanban;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/8">
        <Icon className="h-4 w-4 text-secondary" strokeWidth={1.8} />
      </div>
      <h2 className="text-display text-[15px] font-semibold text-text-primary">
        {title}
      </h2>
      {count != null && (
        <span className="text-data text-[11px] font-medium text-text-tertiary">
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Project row with expandable detail ── */
function ProjectRow({
  project,
  expanded,
  onToggle,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = STATUS_CONFIG[project.status];
  const pct = project.completion_pct ?? 0;
  const budget = project.budget_eur;
  const actual = project.actual_cost_eur;
  const deviation =
    budget && actual ? Math.round(((actual - budget) / budget) * 100) : null;

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-border-subtle transition-colors hover:bg-overlay-subtle",
          expanded && "bg-overlay-subtle",
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-data text-[11px] font-semibold uppercase tracking-wider text-secondary">
              {project.code}
            </span>
            <span className="font-medium text-text-primary">
              {project.name}
            </span>
          </div>
          {project.sponsor && (
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              {project.sponsor}
            </p>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
              config.bgClass,
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)}
            />
            {config.label}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-overlay-active sm:block">
              <div
                className={cn(
                  "h-full rounded-full",
                  pct >= 100
                    ? "bg-emerald-500"
                    : pct >= 50
                      ? "bg-blue-500"
                      : "bg-amber-500",
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-data text-sm font-semibold text-text-primary">
              {pct}%
            </span>
          </div>
        </td>
        <td className="hidden px-4 py-3 text-right md:table-cell">
          {budget != null ? (
            <span className="text-data text-text-secondary">
              {formatCurrency(budget)}
            </span>
          ) : (
            <span className="text-text-tertiary">—</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-right md:table-cell">
          {actual != null ? (
            <span className="text-data text-text-secondary">
              {formatCurrency(actual)}
            </span>
          ) : (
            <span className="text-text-tertiary">—</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-right lg:table-cell">
          {deviation != null ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-data text-sm font-medium",
                deviation > 5
                  ? "text-red-500"
                  : deviation > 0
                    ? "text-amber-500"
                    : "text-emerald-600",
              )}
            >
              {deviation > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {deviation > 0 ? "+" : ""}
              {deviation}%
            </span>
          ) : (
            <span className="text-text-tertiary">—</span>
          )}
        </td>
        <td className="px-2 py-3">
          <ChevronRight
            className={cn(
              "h-4 w-4 text-text-tertiary transition-transform",
              expanded && "rotate-90",
            )}
            strokeWidth={2}
          />
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-overlay-subtle px-4 py-4">
            <ProjectDetail project={project} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Expanded project detail ── */
function ProjectDetail({ project }: { project: Project }) {
  const budget = project.budget_eur;
  const actual = project.actual_cost_eur;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DetailItem label="Data inici" value={formatDate(project.start_date)} />
      <DetailItem
        label="Data fi planificada"
        value={formatDate(project.planned_end_date)}
      />
      <DetailItem
        label="Data fi real"
        value={formatDate(project.actual_end_date)}
      />
      <DetailItem
        label="Satisfaccio patrocinador"
        value={
          project.sponsor_satisfaction != null
            ? `${formatNumber(project.sponsor_satisfaction, 1)}/10`
            : "—"
        }
      />
      {budget != null && actual != null && (
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            Execucio pressupostaria
          </p>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-overlay-active">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  actual / budget > 1
                    ? "bg-red-400"
                    : actual / budget > 0.9
                      ? "bg-amber-400"
                      : "bg-emerald-400",
                )}
                style={{
                  width: `${Math.min((actual / budget) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="text-data text-[12px] font-medium text-text-secondary">
              {formatCurrency(actual)} / {formatCurrency(budget)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className="mt-0.5 text-data text-[13px] font-medium text-text-primary">
        {value}
      </p>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("ca-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
