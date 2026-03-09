import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useValueSummary, useROI } from "@/hooks/useValue";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatCurrency } from "@/lib/utils";
import { chartColors, getChartThemeColors } from "@/styles/tokens";
import type { ValueItem } from "@/types/value";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  PiggyBank,
  Calculator,
} from "lucide-react";

export default function ValorNegoci() {
  const year = useAppStore((s) => s.selectedYear);
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const { data: summary, isLoading: loadingSummary } = useValueSummary();
  const { data: roi, isLoading: loadingROI } = useROI();
  const themeColors = useMemo(() => getChartThemeColors(), [resolvedTheme]);

  const isLoading = loadingSummary || loadingROI;

  // Donut data
  const donutData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Blue Money", value: summary.blue_money_total, fill: chartColors.blueMoney },
      { name: "Green Money", value: summary.green_money_total, fill: chartColors.greenMoney },
    ];
  }, [summary]);

  // Bar chart: all initiatives sorted by value
  const barData = useMemo(() => {
    if (!summary) return [];
    const all = [
      ...summary.blue_items.map((item) => ({
        name: item.code,
        initiative: item.initiative,
        value: item.computed_value ?? 0,
        type: "blue" as const,
      })),
      ...summary.green_items.map((item) => ({
        name: item.code,
        initiative: item.initiative,
        value: item.computed_value ?? 0,
        type: "green" as const,
      })),
    ];
    return all.sort((a, b) => b.value - a.value);
  }, [summary]);

  const totalValue = roi?.total_value ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          {"Valor al Negoci "}
          <span className="text-data text-lg font-medium text-text-tertiary">
            {year}
          </span>
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Blue Money, Green Money i ROI del Departament IT
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !summary && (
        <EmptyState
          title="Sense dades de valor"
          description="No hi ha iniciatives de Blue/Green Money per a aquest any."
        />
      )}

      {!isLoading && summary && (
        <>
          {/* Top summary: 3 big numbers + donut */}
          <div
            className="animate-fade-in-up grid gap-4 lg:grid-cols-[1fr_1fr_1fr_200px]"
            style={{ animationDelay: "0.03s" }}
          >
            <BigNumberCard
              label="Blue Money"
              sublabel="Eficiencia IT"
              value={summary.blue_money_total}
              icon={Wallet}
              color="text-blue-money"
              bgColor="bg-blue-money-light"
              items={summary.blue_items.length}
            />
            <BigNumberCard
              label="Green Money"
              sublabel="Valor al Negoci"
              value={summary.green_money_total}
              icon={TrendingUp}
              color="text-green-money"
              bgColor="bg-green-money-light"
              items={summary.green_items.length}
            />
            <BigNumberCard
              label="Valor Total IT"
              sublabel="Blue + Green"
              value={totalValue}
              icon={ArrowUpRight}
              color="text-secondary"
              bgColor="bg-secondary/8"
            />

            {/* Donut */}
            <div className="card flex flex-col items-center justify-center p-3">
              <div className="relative h-[130px] w-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary">
                    Total
                  </span>
                  <span className="text-data text-[13px] font-bold text-text-primary">
                    {formatCompact(totalValue)}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-money" />
                  Blue
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-money" />
                  Green
                </span>
              </div>
            </div>
          </div>

          {/* ROI card */}
          {roi && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.06s" }}
            >
              <ROICard roi={roi} />
            </div>
          )}

          {/* Comparative bar chart */}
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.09s" }}
          >
            <SectionHeader
              title="Comparativa per iniciativa"
              icon={Calculator}
            />
            <div className="card p-5">
              <ResponsiveContainer width="100%" height={barData.length * 42 + 40}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={themeColors.grid}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: themeColors.tickFill }}
                    tickLine={false}
                    axisLine={{ stroke: themeColors.axis }}
                    tickFormatter={(v) => formatCompact(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={55}
                    tick={{ fontSize: 11, fill: themeColors.tickFill }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.type === "blue"
                            ? chartColors.blueMoney
                            : chartColors.greenMoney
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Blue Money initiatives table */}
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.12s" }}
          >
            <SectionHeader
              title={`Blue Money — ${summary.blue_items.length} iniciatives`}
              icon={Wallet}
            />
            <InitiativeTable items={summary.blue_items} type="blue" />
          </section>

          {/* Green Money initiatives table */}
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <SectionHeader
              title={`Green Money — ${summary.green_items.length} iniciatives`}
              icon={TrendingUp}
            />
            <InitiativeTable items={summary.green_items} type="green" />
          </section>
        </>
      )}
    </div>
  );
}

/* ── Big number card ── */
function BigNumberCard({
  label,
  sublabel,
  value,
  icon: Icon,
  color,
  bgColor,
  items,
}: {
  label: string;
  sublabel: string;
  value: number;
  icon: typeof Wallet;
  color: string;
  bgColor: string;
  items?: number;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            bgColor,
          )}
        >
          <Icon className={cn("h-5 w-5", color)} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-text-primary">
            {label}
          </p>
          <p className="text-[11px] text-text-tertiary">{sublabel}</p>
        </div>
      </div>
      <p className="text-data mt-4 text-2xl font-bold text-text-primary">
        {formatCurrency(value)}
      </p>
      {items != null && (
        <p className="mt-1 text-[11px] text-text-tertiary">
          {items} iniciatives
        </p>
      )}
    </div>
  );
}

/* ── ROI card ── */
function ROICard({ roi }: { roi: { blue_total: number; green_total: number; total_value: number; total_investment: number | null; roi: number | null } }) {
  const hasInvestment = roi.total_investment != null && roi.total_investment > 0;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-light">
          <PiggyBank className="h-4 w-4 text-warning" strokeWidth={1.8} />
        </div>
        <h2 className="text-display text-[15px] font-semibold text-text-primary">
          ROI del Departament IT
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <ROIStat
          label="Blue Money"
          value={formatCurrency(roi.blue_total)}
          color="text-blue-money"
        />
        <ROIStat
          label="Green Money"
          value={formatCurrency(roi.green_total)}
          color="text-green-money"
        />
        <ROIStat
          label="Valor Total"
          value={formatCurrency(roi.total_value)}
          color="text-secondary"
        />
        <ROIStat
          label="ROI"
          value={
            hasInvestment && roi.roi != null
              ? `${(roi.roi * 100).toFixed(1)}%`
              : "Pendent inversio"
          }
          color={hasInvestment ? "text-warning" : "text-text-tertiary"}
          sublabel={
            hasInvestment
              ? `Inversio: ${formatCurrency(roi.total_investment!)}`
              : "Definir inversio total IT per calcular"
          }
        />
      </div>
    </div>
  );
}

function ROIStat({
  label,
  value,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className={cn("text-data mt-1 text-lg font-bold", color)}>{value}</p>
      {sublabel && (
        <p className="mt-0.5 text-[10px] text-text-tertiary">{sublabel}</p>
      )}
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/8">
        <Icon className="h-4 w-4 text-secondary" strokeWidth={1.8} />
      </div>
      <h2 className="text-display text-[15px] font-semibold text-text-primary">
        {title}
      </h2>
    </div>
  );
}

/* ── Initiative detail table ── */
function InitiativeTable({
  items,
  type,
}: {
  items: ValueItem[];
  type: "blue" | "green";
}) {
  const maxValue = Math.max(...items.map((i) => i.computed_value ?? 0), 1);
  const accentColor =
    type === "blue" ? "bg-blue-money" : "bg-green-money";

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-overlay-subtle">
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Codi
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Iniciativa
            </th>
            {type === "blue" ? (
              <>
                <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary md:table-cell">
                  Hores estalviades
                </th>
                <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary lg:table-cell">
                  Estalvi operacional
                </th>
                <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary lg:table-cell">
                  Estalvi directe
                </th>
              </>
            ) : (
              <>
                <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary md:table-cell">
                  Ingressos habilitats
                </th>
                <th className="hidden px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary lg:table-cell">
                  Atribucio IT
                </th>
              </>
            )}
            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              Valor total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const val = item.computed_value ?? 0;
            const pct = (val / maxValue) * 100;

            return (
              <tr
                key={item.id}
                className="border-b border-border-subtle last:border-b-0 transition-colors hover:bg-overlay-subtle"
              >
                <td className="px-4 py-3">
                  <span className="text-data text-[11px] font-semibold uppercase tracking-wider text-secondary">
                    {item.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {item.initiative}
                </td>
                {type === "blue" ? (
                  <>
                    <td className="hidden px-4 py-3 text-right md:table-cell">
                      {item.hours_saved_annual && Number(item.hours_saved_annual) > 0 ? (
                        <span className="text-data text-text-secondary">
                          <Clock className="mr-1 inline h-3 w-3 text-text-tertiary" />
                          {Number(item.hours_saved_annual).toLocaleString("ca-ES")}h
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-data text-text-secondary lg:table-cell">
                      {item.operational_savings_eur &&
                      Number(item.operational_savings_eur) > 0
                        ? formatCurrency(Number(item.operational_savings_eur))
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-data text-text-secondary lg:table-cell">
                      {item.direct_savings_eur &&
                      Number(item.direct_savings_eur) > 0
                        ? formatCurrency(Number(item.direct_savings_eur))
                        : "—"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="hidden px-4 py-3 text-right text-data text-text-secondary md:table-cell">
                      {item.revenues_enabled_eur &&
                      Number(item.revenues_enabled_eur) > 0
                        ? formatCurrency(Number(item.revenues_enabled_eur))
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-data text-text-secondary lg:table-cell">
                      {item.it_attribution_pct != null
                        ? `${(Number(item.it_attribution_pct) * 100).toFixed(0)}%`
                        : "—"}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-overlay-active sm:block">
                      <div
                        className={cn("h-full rounded-full", accentColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-data font-semibold text-text-primary">
                      {formatCurrency(val)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-overlay-subtle">
            <td
              colSpan={type === "blue" ? 5 : 4}
              className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-text-tertiary"
            >
              Total
            </td>
            <td className="px-4 py-3 text-right">
              <span
                className={cn(
                  "text-data text-base font-bold",
                  type === "blue" ? "text-blue-money" : "text-green-money",
                )}
              >
                {formatCurrency(
                  items.reduce((sum, i) => sum + (i.computed_value ?? 0), 0),
                )}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── Bar chart tooltip ── */
function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; initiative: string; value: number; type: string };
  }>;
}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-text-primary">
        {d.name} — {d.initiative}
      </p>
      <p
        className={cn(
          "text-data mt-0.5 font-semibold",
          d.type === "blue" ? "text-blue-money" : "text-green-money",
        )}
      >
        {formatCurrency(d.value)}
      </p>
      <p className="mt-0.5 text-text-tertiary">
        {d.type === "blue" ? "Blue Money" : "Green Money"}
      </p>
    </div>
  );
}

/* ── Compact currency format ── */
function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M€`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k€`;
  return `${value}€`;
}
