import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TeamFormDialog } from "@/components/forms/team-form-dialog";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTeams } from "@/hooks/use-teams";

export const Route = createFileRoute("/_authenticated/teams")({
  head: () => ({
    meta: [{ title: "Equipes — Nexus" }, { name: "description", content: "Equipes, líderes e desempenho." }],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useTeams();
  const teams = data?.teams ?? [];

  return (
    <AppShell title="Equipes" subtitle="Acompanhe seu time, performance e alocação de projetos.">
      <div className="flex justify-end mb-6">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Nova equipe
        </Button>
      </div>
      {isLoading ? (
        <CardGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Liderada por {t.lead_name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                <div className="rounded-xl bg-muted/40 py-3">
                  <p className="text-xl font-semibold text-foreground">{t.member_count}</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </div>
                <div className="rounded-xl bg-muted/40 py-3">
                  <p className="text-xl font-semibold text-foreground">{t.project_count}</p>
                  <p className="text-xs text-muted-foreground">Projetos</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium text-foreground">{t.performance}%</span>
                </div>
                <Progress value={t.performance} />
              </div>
            </div>
          ))}
        </div>
      )}
      <TeamFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}
