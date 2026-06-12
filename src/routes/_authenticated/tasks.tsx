import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Plus, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TaskFormDialog } from "@/components/forms/task-form-dialog";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/types/labels";
import type { TaskPriority, TaskStatus } from "@/lib/types/database";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tarefas — Nexus" },
      { name: "description", content: "Gerencie tarefas com prioridade e prazos." },
    ],
  }),
  component: TasksPage,
});

const priorityTone: Record<string, StatusTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "destructive",
};
const statusTone: Record<string, StatusTone> = {
  backlog: "neutral",
  in_progress: "primary",
  review: "accent",
  done: "success",
};

function TasksPage() {
  const [filter, setFilter] = useState<"all" | "mine" | "overdue" | "done">("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useTasks(filter);
  const updateTask = useUpdateTask();
  const tasks = useMemo(() => data?.tasks ?? [], [data]);

  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const filteredTasks = useMemo(() => {
    if (!debouncedSearch) return tasks;
    return tasks.filter((t) => {
      const projectName = (t.projects as { name: string } | null)?.name ?? "";
      return (
        t.title.toLowerCase().includes(debouncedSearch) ||
        projectName.toLowerCase().includes(debouncedSearch)
      );
    });
  }, [tasks, debouncedSearch]);

  const toggleDone = (id: string, currentStatus: string) => {
    updateTask.mutate({
      id,
      status: currentStatus === "done" ? "in_progress" : "done",
    });
  };

  return (
    <AppShell title="Tarefas" subtitle="Lista unificada de tarefas com filtros e ações rápidas.">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "mine", "overdue", "done"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "Todas"
                : f === "mine"
                  ? "Minhas"
                  : f === "overdue"
                    ? "Atrasadas"
                    : "Concluídas"}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por tarefa ou projeto..."
              className="pl-9"
              aria-label="Buscar tarefas"
            />
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        </div>
      </div>

      {!isLoading && (
        <p className="mb-3 text-xs text-muted-foreground">
          {filteredTasks.length}{" "}
          {filteredTasks.length === 1 ? "tarefa encontrada" : "tarefas encontradas"}
          {debouncedSearch && ` para "${debouncedSearch}"`}
        </p>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={debouncedSearch ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa por aqui"}
          description={
            debouncedSearch
              ? "Tente ajustar os termos da busca ou limpar o filtro."
              : "Crie uma nova tarefa para começar a organizar o trabalho da equipe."
          }
          actionLabel={debouncedSearch ? undefined : "Nova tarefa"}
          onAction={debouncedSearch ? undefined : () => setDialogOpen(true)}
        />
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
            {filteredTasks.map((t) => (
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
                  <StatusBadge
                    tone={priorityTone[t.priority] ?? "neutral"}
                    label={taskPriorityLabels[t.priority as TaskPriority]}
                  />
                </div>
                <div className="col-span-2">
                  <StatusBadge
                    tone={statusTone[t.status] ?? "neutral"}
                    label={taskStatusLabels[t.status as TaskStatus]}
                  />
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
