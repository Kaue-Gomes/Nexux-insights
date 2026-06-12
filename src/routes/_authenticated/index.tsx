import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartLegend, SectionCard } from "@/components/dashboard/section-card";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/providers/auth-provider";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "@/lib/chart";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexus" },
      {
        name: "description",
        content: "Painel central de indicadores, projetos, tarefas e equipes.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const { data, isLoading } = useDashboard();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Usuário";

  if (isLoading || !data) {
    return (
      <AppShell title="Visão geral" subtitle="Carregando seu painel...">
        <DashboardSkeleton />
      </AppShell>
    );
  }

  const topDeliveries = Math.max(...data.teamPerformance.map((t) => t.entregas));
  const totalTasks = data.taskStatusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <AppShell
      title="Visão geral"
      subtitle={`Bom dia, ${firstName}. Aqui está o resumo do seu negócio.`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.kpis.map((k, i) => (
          <StatCard key={k.label} {...k} tintIndex={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <SectionCard
          className="xl:col-span-8"
          title="Receita vs. Meta"
          subtitle="Últimos 7 meses"
          action={
            <ChartLegend
              items={[
                { label: "Receita", color: "var(--color-primary)" },
                { label: "Meta", color: "var(--color-accent)" },
              ]}
            />
          }
        >
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} vertical={false} />
                <XAxis dataKey="mes" {...chartAxisProps} />
                <YAxis {...chartAxisProps} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                  formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="meta"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          className="xl:col-span-4"
          title="Status de tarefas"
          subtitle="Distribuição atual"
        >
          <div className="relative h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data.taskStatusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {totalTasks}
              </span>
              <span className="text-xs text-muted-foreground">tarefas</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {data.taskStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <SectionCard
          className="xl:col-span-8"
          title="Desempenho por equipe"
          subtitle="Entregas no mês"
          action={
            <ChartLegend
              items={[
                { label: "Entregas", color: "var(--color-primary)" },
                { label: "Eficiência", color: "var(--color-accent)" },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.teamPerformance} barGap={6}>
                <CartesianGrid {...chartGridProps} vertical={false} />
                <XAxis dataKey="equipe" {...chartAxisProps} />
                <YAxis {...chartAxisProps} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                  cursor={chartBarCursor}
                />
                <Bar dataKey="entregas" radius={[8, 8, 0, 0]} maxBarSize={36}>
                  {data.teamPerformance.map((entry, index) => (
                    <Cell
                      key={index}
                      fill="var(--color-primary)"
                      fillOpacity={entry.entregas === topDeliveries ? 1 : 0.35}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="eficiencia"
                  fill="var(--color-accent)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard className="xl:col-span-4" title="Próximos lembretes" subtitle="Sua agenda">
          <ul className="space-y-3">
            {data.reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shrink-0">
                  <span className="text-[10px] font-medium uppercase">{r.date.slice(0, 3)}</span>
                  <span className="text-xs font-bold">{r.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {r.type}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard className="mt-6" title="Atividade recente">
        <ul className="divide-y divide-border">
          {data.activities.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {a.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <span className="font-medium text-foreground">{a.user}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium text-foreground">{a.target}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}
