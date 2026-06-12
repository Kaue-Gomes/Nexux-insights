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
import { useCreateTeam } from "@/hooks/use-teams";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  performance: z.coerce.number().min(0).max(100),
});

type FormData = z.infer<typeof schema>;

export function TeamFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTeam = useCreateTeam();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", performance: 80 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createTeam.mutateAsync(values);
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...form.register("name")} className="mt-1.5" />
          </div>
          <div>
            <Label>Performance inicial (%)</Label>
            <Input type="number" {...form.register("performance")} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={createTeam.isPending}>
            Criar equipe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
