import type { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AppMobileNav } from "./app-mobile-nav";
import { CommandMenu } from "@/components/command-menu/command-menu";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <AppMobileNav />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
      <CommandMenu />
    </div>
  );
}
