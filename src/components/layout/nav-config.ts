import {
  BarChart3,
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };
export type NavSection = { label: string; items: NavItem[] };

export const appNavSections: NavSection[] = [
  {
    label: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/projects", label: "Projetos", icon: FolderKanban },
      { to: "/tasks", label: "Tarefas", icon: CheckSquare },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/teams", label: "Equipes", icon: Users },
      { to: "/reminders", label: "Lembretes", icon: Bell },
      { to: "/reports", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "Geral",
    items: [{ to: "/settings", label: "Configurações", icon: Settings }],
  },
];

export function isNavItemActive(pathname: string, to: string): boolean {
  return pathname === to || (to !== "/" && pathname.startsWith(to));
}
