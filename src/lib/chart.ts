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

/**
 * Props padrao para eixos do Recharts: tipografia discreta, sem linhas de eixo
 * nem ticks, usando o token de texto secundario. Reaproveitado entre graficos.
 */
export const chartAxisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

/** Grade cartesiana leve (apenas referencia visual, sem poluir o grafico). */
export const chartGridProps = {
  stroke: "var(--color-border)",
  strokeDasharray: "3 3",
  strokeOpacity: 0.6,
} as const;

/** Realce do cursor (hover) em graficos de barra. */
export const chartBarCursor = { fill: "var(--color-muted)", opacity: 0.4 } as const;
