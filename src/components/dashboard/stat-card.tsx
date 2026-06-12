import { TrendingDown, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";

import { cn } from "@/lib/utils";

export type StatTone = "primary" | "success" | "warning" | "info";

const toneStyles: Record<StatTone, { card: string; icon: string }> = {
  primary: { card: "bg-primary/5 border-primary/10", icon: "bg-primary/10 text-primary" },
  success: { card: "bg-success/5 border-success/10", icon: "bg-success/10 text-success" },
  warning: { card: "bg-warning/5 border-warning/10", icon: "bg-warning/10 text-warning" },
  info: { card: "bg-info/5 border-info/10", icon: "bg-info/10 text-info" },
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
  icon: keyof typeof Icons;
  tone?: StatTone;
  tintIndex?: number;
}) {
  const Icon = (Icons[icon] ?? Icons.Activity) as React.ComponentType<{ className?: string }>;
  const resolvedTone = tone ?? toneOrder[tintIndex % toneOrder.length];
  const styles = toneStyles[resolvedTone];

  return (
    <div
      className={cn(
        "h-[130px] rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
        styles.card,
      )}
      style={{ animationDelay: `${tintIndex * 60}ms` }}
    >
      <div className="flex items-start justify-between h-full">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-[42px] font-bold leading-none tracking-tight text-foreground">
            {value}
          </p>
          <div
            className={cn(
              "mt-3 flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-success" : "text-destructive",
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{delta}</span>
            <span className="text-muted-foreground font-normal">vs mês anterior</span>
          </div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
