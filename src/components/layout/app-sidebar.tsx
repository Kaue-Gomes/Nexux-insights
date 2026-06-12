import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NexusLogo } from "@/components/brand/nexus-logo";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projetos", icon: FolderKanban },
  { to: "/tasks", label: "Tarefas", icon: CheckSquare },
  { to: "/teams", label: "Equipes", icon: Users },
  { to: "/reminders", label: "Lembretes", icon: Bell },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggle } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col bg-[#0F172A] text-slate-100 border-r border-slate-800 transition-all duration-200 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 border-b border-slate-800",
            collapsed ? "justify-center px-2" : "gap-2 px-6",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-1">
            <NexusLogo size="sm" className="h-full w-full" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold leading-tight">Nexus</div>
              <div className="text-xs text-slate-400">Insights</div>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200",
              collapsed && "mt-0",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            const Icon = item.icon;

            const link = (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-blue-500/15 text-blue-300"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {!collapsed && (
          <div className="px-3 py-6 border-t border-slate-800">
            <div className="rounded-xl bg-slate-800/50 p-4">
              <div className="text-sm font-semibold">Plano Pro</div>
              <div className="text-xs text-slate-400 mt-1">
                Desbloqueie relatórios avançados e integrações.
              </div>
              <button className="mt-3 w-full rounded-xl bg-blue-500/20 text-blue-300 text-xs font-medium py-2 hover:bg-blue-500/30 transition-all duration-200">
                Fazer upgrade
              </button>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
