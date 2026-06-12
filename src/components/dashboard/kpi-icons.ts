import {
  Activity,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Registro explicito dos icones usados nos KPIs. Importar apenas os icones
 * necessarios (em vez de `import * as Icons`) permite tree-shaking e evita
 * empacotar toda a biblioteca lucide-react no bundle.
 */
const kpiIcons = {
  FolderKanban,
  CheckCircle2,
  Users,
  AlertCircle,
  Activity,
} satisfies Record<string, LucideIcon>;

export type KpiIconName = keyof typeof kpiIcons;

/** Resolve o nome do icone (vindo da API) para o componente, com fallback seguro. */
export function resolveKpiIcon(name: string): LucideIcon {
  return kpiIcons[name as KpiIconName] ?? Activity;
}
