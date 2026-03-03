import { cn, formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp } from "lucide-react";

interface MoneyCardProps {
  type: "blue" | "green";
  title: string;
  subtitle: string;
  total: number;
  target?: number | null;
}

export function MoneyCard({
  type,
  title,
  subtitle,
  total,
  target,
}: MoneyCardProps) {
  const progress = target ? Math.min(1, total / target) : null;
  const progressPct = progress != null ? Math.round(progress * 100) : null;
  const Icon = type === "blue" ? Wallet : TrendingUp;

  return (
    <div
      className={cn(
        "card relative overflow-hidden p-5",
        type === "blue" ? "border-l-[3px] border-l-blue-money" : "border-l-[3px] border-l-green-money",
      )}
    >
      {/* Subtle background gradient */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.04]",
          type === "blue" ? "bg-blue-money" : "bg-green-money",
        )}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              type === "blue" ? "bg-blue-money-light" : "bg-green-money-light",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px]",
                type === "blue" ? "text-blue-money" : "text-green-money",
              )}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
            <p className="text-[11px] text-text-tertiary">{subtitle}</p>
          </div>
        </div>

        {/* Value */}
        <div className="mt-4">
          <span
            className={cn(
              "text-data text-2xl font-semibold",
              type === "blue" ? "text-blue-money" : "text-green-money",
            )}
          >
            {formatCurrency(total)}
          </span>
          {target != null && (
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              de {formatCurrency(target)}
            </p>
          )}
        </div>

        {/* Progress */}
        {progressPct != null && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  type === "blue" ? "bg-blue-money" : "bg-green-money",
                )}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-data text-[11px] text-text-tertiary">
              {progressPct}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
