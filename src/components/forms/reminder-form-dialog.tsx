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
import { useCreateReminder } from "@/hooks/use-reminders";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  reminder_date: z.string().min(1, "Data obrigatória"),
  reminder_time: z.string().default("09:00"),
  type: z.enum(["meeting", "deadline", "review", "other"]),
});

type FormData = z.infer<typeof schema>;

export function ReminderFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createReminder = useCreateReminder();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", reminder_date: "", reminder_time: "09:00", type: "other" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createReminder.mutateAsync(values);
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lembrete</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input {...form.register("title")} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data</Label>
              <Input type="date" {...form.register("reminder_date")} className="mt-1.5" />
            </div>
            <div>
              <Label>Horário</Label>
              <Input type="time" {...form.register("reminder_time")} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select defaultValue="other" onValueChange={(v) => form.setValue("type", v as FormData["type"])}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="deadline">Prazo</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createReminder.isPending}>
            Criar lembrete
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
