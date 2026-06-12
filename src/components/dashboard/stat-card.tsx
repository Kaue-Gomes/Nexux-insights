import { TrendingDown, TrendingUp } from "lucide-react";

import { resolveKpiIcon } from "@/components/dashboard/kpi-icons";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "success" | "warning" | "info";

const iconStyles: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const toneOrder: StatTone[] = ["primary", "success", "warning", "info"];

export function StatCard({
  label,
  value,
  delta,
  trend,
  icon,
  tone,
  tintIndex = 0,
}: {
  label: string;
  value: string | number;
  delta: string;
  trend: "up" | "down";
  icon: string;
  tone?: StatTone;
  tintIndex?: number;
}) {
  const Icon = resolveKpiIcon(icon);
  const resolvedTone = tone ?? toneOrder[tintIndex % toneOrder.length];

  return (
    <div
      className={cn(
        "group grid h-[140px] grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] gap-x-3 gap-y-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200",
        "hover:border-foreground/15 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
      )}
      style={{ animationDelay: `${tintIndex * 60}ms` }}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconStyles[resolvedTone],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="self-center text-sm font-medium text-muted-foreground">{label}</p>

      <p className="ml-3 text-3xl font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>

      <div className="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta}
        </span>
        <span className="text-xs text-muted-foreground">vs mês anterior</span>
      </div>
    </div>
  );
}
