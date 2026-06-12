import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
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
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
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

  return (
    <AppShell
      title="Visão geral"
      subtitle={`Bom dia, ${firstName}. Aqui está o resumo do seu negócio.`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.kpis.map((k, i) => (
          <StatCard key={k.label} {...k} icon={k.icon as never} tintIndex={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-8 rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Receita vs. Meta</h3>
              <p className="text-sm text-muted-foreground">Últimos 7 meses</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Receita
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Meta
              </span>
            </div>
          </div>
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
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
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
        </div>

        <div className="xl:col-span-4 rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
          <h3 className="text-lg font-semibold text-foreground">Status de tarefas</h3>
          <p className="text-sm text-muted-foreground">Distribuição atual</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.taskStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
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
          </div>
          <div className="space-y-2 mt-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-8 rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Desempenho por equipe</h3>
            <p className="text-sm text-muted-foreground">Entregas no mês</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.teamPerformance}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="equipe"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  itemStyle={chartTooltipItemStyle}
                  labelStyle={chartTooltipLabelStyle}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="entregas" fill="var(--color-primary)" radius={[6, 6, 0, 0]}>
                  {data.teamPerformance.map((entry, index) => (
                    <Cell
                      key={index}
                      fill="var(--color-primary)"
                      fillOpacity={entry.entregas === topDeliveries ? 1 : 0.35}
                    />
                  ))}
                </Bar>
                <Bar dataKey="eficiencia" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl bg-card border border-border p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
          <h3 className="text-lg font-semibold text-foreground">Próximos lembretes</h3>
          <p className="text-sm text-muted-foreground mb-4">Sua agenda</p>
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
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm mt-6 hover:-translate-y-0.5 transition-all duration-200">
        <h3 className="text-lg font-semibold text-foreground mb-4">Atividade recente</h3>
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
      </div>
    </AppShell>
  );
}
