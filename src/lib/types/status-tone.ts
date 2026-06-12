import type { ProjectStatus, TaskPriority, TaskStatus } from "./database";

/**
 * Tom semantico de cor para badges/indicadores de status. Fonte unica de verdade
 * compartilhada entre componentes de UI (status-badge) e as paginas de dominio.
 */
export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "accent";

export const taskStatusTones: Record<TaskStatus, StatusTone> = {
  backlog: "neutral",
  in_progress: "primary",
  review: "accent",
  done: "success",
};

export const taskPriorityTones: Record<TaskPriority, StatusTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "destructive",
};

export const projectStatusTones: Record<ProjectStatus, StatusTone> = {
  planning: "neutral",
  in_progress: "primary",
  completed: "success",
  overdue: "destructive",
};
