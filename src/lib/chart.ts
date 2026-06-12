import type { CSSProperties } from "react";

/**
 * Estilo compartilhado para tooltips do Recharts, usando tokens semânticos do
 * tema (respeita claro/escuro) com elevação consistente.
 */
export const chartTooltipStyle: CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  boxShadow: "var(--shadow-elegant)",
  fontSize: 12,
  color: "var(--color-foreground)",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "var(--color-foreground)",
  fontWeight: 600,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "var(--color-foreground)",
};
