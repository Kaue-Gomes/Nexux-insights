import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [{ title: "Relatórios — Nexus" }, { name: "description", content: "Relatórios e análises." }],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data, isLoading } = useReports();

  const handleDownload = (title: string) => {
    toast.info(`Exportação PDF de "${title}" disponível na próxima fase (FastAPI).`);
  };

  if (isLoading || !data) {
    return (
      <AppShell title="Relatórios" subtitle="Carregando análises...">
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell title="Relatórios" subtitle="Análises e exportações geradas pelo motor de relatórios.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Relatório financeiro", desc: "Receita, despesas e margem do trimestre.", file: "financeiro-Q2.pdf" },
          { title: "Desempenho de equipes", desc: "Entregas e eficiência por equipe.", file: "equipes-jun.pdf" },
          { title: "Resumo de projetos", desc: "Status e prazos de todos os projetos.", file: "projetos.xlsx" },
        ].map((r) => (
          <div key={r.title} className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.file}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.desc}</p>
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => handleDownload(r.title)}>
              <Download className="h-4 w-4" /> Baixar
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-1">Evolução de receita</h3>
          <p className="text-sm text-muted-foreground mb-4">Comparativo mensal</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.revenueData}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="receita" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="meta" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-1">Eficiência por equipe</h3>
          <p className="text-sm text-muted-foreground mb-4">Maior é melhor</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.teamPerformance} layout="vertical">
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="equipe" type="category" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="eficiencia" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
