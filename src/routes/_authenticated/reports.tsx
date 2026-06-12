import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { ChartLegend, SectionCard } from "@/components/dashboard/section-card";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import {
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "@/lib/chart";
import { useReports } from "@/hooks/use-dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios — Nexus" },
      { name: "description", content: "Relatórios e análises." },
    ],
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
    <AppShell
      title="Relatórios"
      subtitle="Análises e exportações geradas pelo motor de relatórios."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "Relatório financeiro",
            desc: "Receita, despesas e margem do trimestre.",
            file: "financeiro-Q2.pdf",
          },
          {
            title: "Desempenho de equipes",
            desc: "Entregas e eficiência por equipe.",
            file: "equipes-jun.pdf",
          },
          {
            title: "Resumo de projetos",
            desc: "Status e prazos de todos os projetos.",
            file: "projetos.xlsx",
          },
        ].map((r) => (
          <div
            key={r.title}
            className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
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
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              onClick={() => handleDownload(r.title)}
            >
              <Download className="h-4 w-4" /> Baixar
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Evolução de receita"
          subtitle="Comparativo mensal"
          action={
            <ChartLegend
              items={[
                { label: "Receita", color: "var(--color-primary)" },
                { label: "Meta", color: "var(--color-accent)" },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.revenueData}>
                <CartesianGrid {...chartGridProps} vertical={false} />
                <XAxis dataKey="mes" {...chartAxisProps} />
                <YAxis {...chartAxisProps} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="meta"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Eficiência por equipe" subtitle="Maior é melhor">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.teamPerformance} layout="vertical">
                <CartesianGrid {...chartGridProps} horizontal={false} />
                <XAxis type="number" {...chartAxisProps} />
                <YAxis dataKey="equipe" type="category" {...chartAxisProps} width={80} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                  cursor={chartBarCursor}
                />
                <Bar
                  dataKey="eficiencia"
                  fill="var(--color-accent)"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
