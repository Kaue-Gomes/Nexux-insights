import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const pages = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projetos", icon: FolderKanban },
  { to: "/tasks", label: "Tarefas", icon: CheckSquare },
  { to: "/teams", label: "Equipes", icon: Users },
  { to: "/reminders", label: "Lembretes", icon: Bell },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, projetos, tarefas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {pages.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem
                key={p.to}
                onSelect={() => {
                  navigate({ to: p.to });
                  setOpen(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {p.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          <CommandItem
            onSelect={() => {
              navigate({ to: "/projects" });
              setOpen(false);
            }}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Novo projeto
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate({ to: "/tasks" });
              setOpen(false);
            }}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Nova tarefa
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
