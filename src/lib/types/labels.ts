import type { ProjectStatus, ReminderType, TaskPriority, TaskStatus } from "./database";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planejamento",
  in_progress: "Em andamento",
  completed: "Concluído",
  overdue: "Atrasado",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  in_progress: "Em andamento",
  review: "Revisão",
  done: "Concluída",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const reminderTypeLabels: Record<ReminderType, string> = {
  meeting: "Reunião",
  deadline: "Prazo",
  review: "Revisão",
  other: "Outro",
};

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ontem";
  return `há ${diffDays} dias`;
}

export function formatReminderDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Hoje";
  if (date.getTime() === tomorrow.getTime()) return "Amanhã";
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}
