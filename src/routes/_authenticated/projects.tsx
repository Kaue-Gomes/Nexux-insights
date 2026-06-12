import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ProjectFormDialog } from "@/components/forms/project-form-dialog";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/use-projects";
import { projectStatusLabels } from "@/lib/types/labels";
import type { ProjectStatus } from "@/lib/types/database";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projetos — Nexus" },
      { name: "description", content: "Acompanhe seus projetos e progresso." },
    ],
  }),
  component: ProjectsPage,
});

const statusVariant: Record<string, string> = {
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  planning: "bg-muted text-muted-foreground",
};

function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useProjects();
  const projects = data?.projects ?? [];
  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <AppShell title="Projetos" subtitle="Gerencie e acompanhe todos os projetos da sua organização.">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>
            Todos ({projects.length})
          </Button>
          <Button variant={filter === "in_progress" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("in_progress")}>
            Em andamento
          </Button>
          <Button variant={filter === "completed" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("completed")}>
            Concluídos
          </Button>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo projeto
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {(p.teams as { name: string } | null)?.name ?? "—"}
                  </p>
                  <h3 className="font-semibold text-foreground mt-1">{p.name}</h3>
                </div>
                <Badge className={statusVariant[p.status]} variant="secondary">
                  {projectStatusLabels[p.status as ProjectStatus]}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span className="font-medium text-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {p.member_count ?? 0} membros
                </span>
                <span>
                  Entrega:{" "}
                  {p.due_date ? new Date(p.due_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}
