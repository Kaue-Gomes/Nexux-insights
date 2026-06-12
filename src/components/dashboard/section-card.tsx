import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Painel padrao do dashboard: padroniza o "chrome" (borda, raio, padding) e o
 * cabecalho (titulo/subtitulo + acao opcional) para dar coesao visual.
 */
export function SectionCard({
  title,
  subtitle,
  action,
  className,
  contentClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}>
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

/** Legenda inline para o cabecalho de graficos (cor + rotulo). */
export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
