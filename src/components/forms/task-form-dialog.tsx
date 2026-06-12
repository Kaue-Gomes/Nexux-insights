import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useProjectsSelect } from "@/hooks/use-tasks";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  project_id: z.string().uuid("Selecione um projeto"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["backlog", "in_progress", "review", "done"]),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function TaskFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTask = useCreateTask();
  const { data: projectsData } = useProjectsSelect();
  const projects = projectsData?.projects ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      project_id: "",
      priority: "medium",
      status: "backlog",
      due_date: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createTask.mutateAsync({
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
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input {...form.register("title")} className="mt-1.5" />
          </div>
          <div>
            <Label>Projeto</Label>
            <Select onValueChange={(v) => form.setValue("project_id", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prioridade</Label>
              <Select
                defaultValue="medium"
                onValueChange={(v) => form.setValue("priority", v as FormData["priority"])}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                defaultValue="backlog"
                onValueChange={(v) => form.setValue("status", v as FormData["status"])}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Prazo</Label>
            <Input type="date" {...form.register("due_date")} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            Criar tarefa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
