import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ReminderFormDialog } from "@/components/forms/reminder-form-dialog";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useReminders, useDeleteReminder } from "@/hooks/use-reminders";
import { formatReminderDate, formatTime, reminderTypeLabels } from "@/lib/types/labels";
import type { ReminderType } from "@/lib/types/database";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Lembretes — Nexus" },
      { name: "description", content: "Compromissos e notificações." },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useReminders();
  const deleteReminder = useDeleteReminder();
  const reminders = data?.reminders ?? [];

  return (
    <AppShell title="Lembretes" subtitle="Tudo o que você precisa lembrar nos próximos dias.">
      <div className="flex justify-end mb-6">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo lembrete
        </Button>
      </div>
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhum lembrete agendado"
          description="Crie lembretes para não perder compromissos e prazos importantes."
          actionLabel="Novo lembrete"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-sm divide-y divide-border">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-all duration-200"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatReminderDate(r.reminder_date)} · {formatTime(r.reminder_time)}
                </p>
              </div>
              <Badge variant="secondary">{reminderTypeLabels[r.type as ReminderType]}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteReminder.mutate(r.id)}
              >
                Excluir
              </Button>
            </div>
          ))}
        </div>
      )}
      <ReminderFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}
