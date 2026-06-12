import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { NexusLogo } from "@/components/brand/nexus-logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";

import { appNavSections, isNavItemActive } from "./nav-config";

export function AppMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { mobileOpen, setMobileOpen } = useSidebar();

  const close = () => setMobileOpen(false);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="w-[min(100vw-3rem,280px)] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border px-4 py-4 text-left">
          <div className="flex items-center gap-2 pr-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-foreground p-1">
              <NexusLogo size="sm" className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold text-sidebar-foreground">
                Nexus
              </SheetTitle>
              <SheetDescription className="text-xs text-sidebar-foreground/60">
                Insights
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
          {appNavSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <span className="block px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.label}
              </span>
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={close}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-sidebar-primary/15 text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-4">
          <div
            className="rounded-2xl p-4 text-sidebar-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Plano Pro
            </div>
            <p className="mt-1 text-xs text-sidebar-primary-foreground/80">
              Desbloqueie relatórios avançados e integrações.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
