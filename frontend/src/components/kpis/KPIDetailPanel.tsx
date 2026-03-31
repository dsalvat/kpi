import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { X, TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { useKPIValues } from "@/hooks/useKPIs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatNumber } from "@/lib/utils";
import { chartColors, getChartThemeColors } from "@/styles/tokens";
import { useAppStore } from "@/store";
import type { KPIDefinition, KPIStatus } from "@/types/kpi";

const MONTHS = [
  "Gen", "Feb", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Oct", "Nov", "Des",
];

const MONTHS_FULL = [
  "Gener", "Febrer", "Marc", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre",
];

interface KPIDetailPanelProps {
  kpi: KPIDefinition;
  onClose: () => void;
}

export function KPIDetailPanel({ kpi, onClose }: KPIDetailPanelProps) {
  const { data: values, isLoading } = useKPIValues(kpi.code);
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const themeColors = useMemo(() => getChartThemeColors(), [resolvedTheme]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isWeekly = kpi.frequency === "weekly";

  // Build chart data: 12 months or 53 weeks
  const chartData = isWeekly
    ? Array.from({ length: 53 }, (_, i) => {
        const week = i + 1;
        const entry = values?.find((v) => v.week === week);
        return {
          period: `S${week}`,
          periodNum: week,
          value: entry ? Number(entry.value) : null,
          target: Number(kpi.target),
          notes: entry?.notes ?? null,
        };
      })
    : MONTHS.map((label, i) => {
        const month = i + 1;
        const entry = values?.find((v) => v.month === month);
        return {
          period: label,
          periodNum: month,
          value: entry ? Number(entry.value) : null,
          target: Number(kpi.target),
          notes: entry?.notes ?? null,
        };
      });

  const valuesWithData = chartData.filter((d) => d.value !== null);

  // Trend calculation
  const trend = (() => {
    if (valuesWithData.length < 2) return null;
    const lastItem = valuesWithData[valuesWithData.length - 1];
    const prevItem = valuesWithData[valuesWithData.length - 2];
    if (!lastItem || !prevItem) return null;
    const last = lastItem.value!;
    const prev = prevItem.value!;
    const diff = last - prev;
    const isGood =
      kpi.direction === "higher_better" ? diff >= 0 : diff <= 0;
    return { diff, isGood, last, prev };
  })();

  const status = (kpi.current_status ?? "no_data") as KPIStatus;

  const drawer = (
    <div className="fixed inset-0 z-modal flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-backdrop animate-fade-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-lg animate-slide-in-right overflow-y-auto bg-bg border-l border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border-subtle bg-bg/95 backdrop-blur-sm px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-data text-[13px] font-semibold uppercase tracking-wider text-secondary">
                {kpi.code}
              </span>
              {kpi.is_annual_objective && (
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} aria-label="Objectiu anual" />
              )}
              <StatusBadge status={status} />
            </div>
            <h3 className="mt-1 text-display text-lg font-semibold text-text-primary">
              {kpi.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-text-tertiary">
              <span>
                {"Target: "}
                <span className="text-data font-medium text-text-secondary">
                  {formatNumber(kpi.target)} {kpi.unit}
                </span>
              </span>
              <span>
                {"Font: "}
                <span className="font-medium text-text-secondary">
                  {kpi.source === "manual" ? "Entrada manual" : kpi.source}
                </span>
              </span>
              <span>
                {"Direccio: "}
                <span className="font-medium text-text-secondary">
                  {kpi.direction === "higher_better"
                    ? "Mes es millor"
                    : "Menys es millor"}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-overlay-hover hover:text-text-secondary"
            aria-label="Tancar detall"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Chart */}
        <div className="px-6 pt-5 pb-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-[13px] font-medium text-text-secondary">
              {isWeekly ? "Evolucio setmanal" : "Evolucio mensual"}
            </h4>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-[12px] font-medium",
                  trend.isGood ? "text-emerald-400" : "text-red-400",
                )}
              >
                {trend.diff > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                ) : trend.diff < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {trend.diff > 0 ? "+" : ""}
                {formatNumber(trend.diff)} vs. {isWeekly ? "setmana" : "mes"} anterior
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="h-[220px] animate-shimmer rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={themeColors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: themeColors.tickFill }}
                  tickLine={false}
                  axisLine={{ stroke: themeColors.axis }}
                  interval={isWeekly ? 3 : 0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: themeColors.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <Tooltip content={<ChartTooltip unit={kpi.unit} />} />
                <ReferenceLine
                  y={Number(kpi.target)}
                  stroke={chartColors.warning}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target ${formatNumber(kpi.target)}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: chartColors.warning,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.secondary}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: themeColors.surface,
                    stroke: chartColors.secondary,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: chartColors.secondary,
                    stroke: themeColors.surface,
                    strokeWidth: 2,
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Read-only values table */}
        <div className="px-6 pb-6 pt-2">
          <h4 className="mb-3 text-[13px] font-medium text-text-secondary">
            {isWeekly ? "Valors setmanals" : "Valors mensuals"}
          </h4>
          <div className={cn("overflow-hidden rounded-lg border border-border-subtle", isWeekly && "max-h-[400px] overflow-y-auto")}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-subtle bg-overlay-subtle">
                  <th className="px-3 py-2 text-left font-medium text-text-tertiary">
                    {isWeekly ? "Setmana" : "Mes"}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-text-tertiary">
                    Valor
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-text-tertiary">
                    Estat
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d) => {
                  const hasValue = d.value !== null;
                  let rowStatus: KPIStatus = "no_data";
                  if (hasValue) {
                    const progress =
                      kpi.direction === "lower_better"
                        ? Math.min(1, Number(kpi.target) / d.value!)
                        : Math.min(1, d.value! / Number(kpi.target));
                    if (progress >= 0.95) rowStatus = "ok";
                    else if (progress >= 0.8) rowStatus = "warning";
                    else rowStatus = "ko";
                  }
                  return (
                    <tr
                      key={d.periodNum}
                      className="border-b border-border-subtle last:border-b-0 transition-colors hover:bg-overlay-subtle"
                    >
                      <td className="px-3 py-1.5 text-text-secondary">
                        {isWeekly ? `Setmana ${d.periodNum}` : MONTHS_FULL[d.periodNum - 1]}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {hasValue ? (
                          <span className="text-data font-medium text-text-primary">
                            {formatNumber(d.value!)}
                          </span>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <StatusDot status={rowStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}

/* ── Chart tooltip ── */
function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number | null; dataKey: string }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload) return null;
  const value = payload.find((p) => p.dataKey === "value")?.value;
  const target = payload.find((p) => p.dataKey === "target")?.value;

  return (
    <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-text-primary">{label}</p>
      {value != null && (
        <p className="text-data mt-0.5 text-secondary">
          {formatNumber(value)} {unit}
        </p>
      )}
      {target != null && (
        <p className="mt-0.5 text-text-tertiary">
          Target: {formatNumber(target)} {unit}
        </p>
      )}
    </div>
  );
}

/* ── Mini status dot for table ── */
function StatusDot({ status }: { status: KPIStatus }) {
  const colors: Record<KPIStatus, string> = {
    ok: "bg-emerald-500",
    warning: "bg-amber-500",
    ko: "bg-red-500",
    no_data: "bg-slate-400",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", colors[status])}
      role="status"
      aria-label={status}
    />
  );
}
