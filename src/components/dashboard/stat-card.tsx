import { TrendingUp, TrendingDown } from "lucide-react";
import * as Icons from "lucide-react";

import { cn } from "@/lib/utils";

const tints = [
  "bg-blue-500/5 border-blue-500/10",
  "bg-green-500/5 border-green-500/10",
  "bg-yellow-500/5 border-yellow-500/10",
  "bg-red-500/5 border-red-500/10",
];

const iconTints = [
  "bg-blue-500/10 text-blue-500",
  "bg-green-500/10 text-green-500",
  "bg-yellow-500/10 text-yellow-500",
  "bg-red-500/10 text-red-500",
];

export function StatCard({
  label,
  value,
  delta,
  trend,
  icon,
  tintIndex = 0,
}: {
  label: string;
  value: string | number;
  delta: string;
  trend: "up" | "down";
  icon: keyof typeof Icons;
  tintIndex?: number;
}) {
  const Icon = (Icons[icon] ?? Icons.Activity) as React.ComponentType<{ className?: string }>;
  const tint = tints[tintIndex % tints.length];
  const iconTint = iconTints[tintIndex % iconTints.length];

  return (
    <div
      className={cn(
        "h-[130px] rounded-2xl border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200",
        tint,
      )}
    >
      <div className="flex items-start justify-between h-full">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-[42px] font-bold leading-none tracking-tight text-foreground">{value}</p>
          <div
            className={cn(
              "mt-3 flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-green-500" : "text-red-500",
            )}
          >
            {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{delta}</span>
            <span className="text-muted-foreground font-normal">vs mês anterior</span>
          </div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconTint)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
