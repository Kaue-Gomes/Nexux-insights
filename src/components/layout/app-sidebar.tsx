import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { NexusLogo } from "@/components/brand/nexus-logo";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { appNavSections, isNavItemActive } from "./nav-config";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggle } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "gap-2 px-6",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-foreground p-1">
            <NexusLogo size="sm" className="h-full w-full" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold leading-tight">Nexus</div>
              <div className="text-xs text-sidebar-foreground/60">Insights</div>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
          {appNavSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {!collapsed && (
                <span className="block px-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/40">
                  {section.label}
                </span>
              )}
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item.to);
                const Icon = item.icon;

                const link = (
                  <Link
                    to={item.to}
                    className={cn(
                      "relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-sidebar-primary/15 text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
                    )}
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

                return <div key={item.to}>{link}</div>;
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div
              className="rounded-2xl p-4 text-sidebar-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Plano Pro
              </div>
              <div className="text-xs text-sidebar-primary-foreground/80 mt-1">
                Desbloqueie relatórios avançados e integrações.
              </div>
              <button className="mt-3 w-full rounded-xl bg-sidebar-foreground/15 text-sidebar-primary-foreground text-xs font-medium py-2 hover:bg-sidebar-foreground/25 transition-all duration-200">
                Fazer upgrade
              </button>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
