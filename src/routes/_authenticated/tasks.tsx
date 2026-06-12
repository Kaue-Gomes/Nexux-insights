import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TaskFormDialog } from "@/components/forms/task-form-dialog";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/types/labels";
import type { TaskPriority, TaskStatus } from "@/lib/types/database";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [{ title: "Tarefas — Nexus" }, { name: "description", content: "Gerencie tarefas com prioridade e prazos." }],
  }),
  component: TasksPage,
});

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};
const statusColor: Record<string, string> = {
  backlog: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-accent/10 text-accent",
  done: "bg-success/10 text-success",
};

function TasksPage() {
  const [filter, setFilter] = useState<"all" | "mine" | "overdue" | "done">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useTasks(filter);
  const updateTask = useUpdateTask();
  const tasks = data?.tasks ?? [];

  const toggleDone = (id: string, currentStatus: string) => {
    updateTask.mutate({
      id,
      status: currentStatus === "done" ? "in_progress" : "done",
    });
  };

  return (
    <AppShell title="Tarefas" subtitle="Lista unificada de tarefas com filtros e ações rápidas.">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {(["all", "mine", "overdue", "done"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todas" : f === "mine" ? "Minhas" : f === "overdue" ? "Atrasadas" : "Concluídas"}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-6 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-muted/30">
            <div className="col-span-5">Tarefa</div>
            <div className="col-span-2">Responsável</div>
            <div className="col-span-2">Prioridade</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Prazo</div>
          </div>
          <ul className="divide-y divide-border">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 px-6 py-4 hover:bg-muted/30 transition-all duration-200 items-center"
              >
                <div className="col-span-5 flex items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    checked={t.status === "done"}
                    onCheckedChange={() => toggleDone(t.id, t.status)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(t.projects as { name: string } | null)?.name ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-foreground">
                  {(t.assignee as { full_name: string } | null)?.full_name ?? "—"}
                </div>
                <div className="col-span-2">
                  <Badge className={priorityColor[t.priority]} variant="secondary">
                    {taskPriorityLabels[t.priority as TaskPriority]}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge className={statusColor[t.status]} variant="secondary">
                    {taskStatusLabels[t.status as TaskStatus]}
                  </Badge>
                </div>
                <div className="col-span-1 text-xs text-muted-foreground md:text-right">
                  {t.due_date
                    ? new Date(t.due_date + "T00:00:00").toLocaleDateString("pt-BR")
                    : "—"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}
