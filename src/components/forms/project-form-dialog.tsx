import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject } from "@/hooks/use-projects";
import { useTeamsSelect } from "@/hooks/use-teams";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  team_id: z.string().uuid("Selecione uma equipe"),
  status: z.enum(["planning", "in_progress", "completed", "overdue"]),
  progress: z.coerce.number().min(0).max(100),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProjectFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createProject = useCreateProject();
  const { data: teamsData } = useTeamsSelect();
  const teams = teamsData?.teams ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", team_id: "", status: "planning", progress: 0, due_date: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createProject.mutateAsync({
      ...values,
      due_date: values.due_date || null,
    });
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...form.register("name")} className="mt-1.5" />
          </div>
          <div>
            <Label>Equipe</Label>
            <Select onValueChange={(v) => form.setValue("team_id", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select defaultValue="planning" onValueChange={(v) => form.setValue("status", v as FormData["status"])}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planejamento</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Progresso (%)</Label>
              <Input type="number" {...form.register("progress")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Data de entrega</Label>
            <Input type="date" {...form.register("due_date")} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={createProject.isPending}>
            Criar projeto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
