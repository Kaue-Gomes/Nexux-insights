import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "accent";

const toneStyles: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  accent: "bg-accent/10 text-accent",
};

const dotStyles: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  accent: "bg-accent",
};

export function StatusBadge({
  label,
  tone = "neutral",
  showDot = true,
  className,
}: {
  label: string;
  tone?: StatusTone;
  showDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[tone])} />}
      {label}
    </span>
  );
}
