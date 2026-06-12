import { createServerFn } from "@tanstack/react-start";

import type { DashboardSummary } from "@/lib/types/database";
import {
  formatRelativeTime,
  formatReminderDate,
  formatTime,
  projectStatusLabels,
  reminderTypeLabels,
  taskStatusLabels,
} from "@/lib/types/labels";

import { accessTokenSchema, requireAuth } from "./shared";

export const getDashboardSummary = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }): Promise<DashboardSummary> => {
    const { client, userId } = await requireAuth(data.accessToken);

    const [projectsRes, tasksRes, teamsRes, revenueRes, activitiesRes, remindersRes] =
      await Promise.all([
        client.from("projects").select("id, status"),
        client.from("tasks").select("id, status, due_date"),
        client.from("teams").select("id, name, performance"),
        client.from("revenue_snapshots").select("*").eq("user_id", userId).order("sort_order"),
        client
          .from("activities")
          .select("id, action, target, created_at, profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(6),
        client.from("reminders").select("*").eq("user_id", userId).order("reminder_date").limit(5),
      ]);

    const projects = projectsRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    const teams = teamsRes.data ?? [];

    const activeProjects = projects.filter((p) => p.status === "in_progress").length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const today = new Date().toISOString().slice(0, 10);
    const overdueTasks = tasks.filter(
      (t) => t.status !== "done" && t.due_date && t.due_date < today,
    ).length;

    const statusCounts = {
      done: tasks.filter((t) => t.status === "done").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      overdue: overdueTasks,
      backlog: tasks.filter((t) => t.status === "backlog").length,
    };

    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const { count } = await client
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id);
        const { count: taskCount } = await client
          .from("tasks")
          .select("*, projects!inner(team_id)", { count: "exact", head: true })
          .eq("projects.team_id", team.id)
          .eq("status", "done");
        return {
          equipe: team.name,
          entregas: taskCount ?? 0,
          eficiencia: team.performance,
        };
      }),
    );

    return {
      kpis: [
        {
          label: "Projetos Ativos",
          value: activeProjects,
          delta: "+12%",
          trend: "up",
          icon: "FolderKanban",
        },
        {
          label: "Tarefas Concluídas",
          value: doneTasks,
          delta: "+24%",
          trend: "up",
          icon: "CheckCircle2",
        },
        { label: "Equipes", value: teams.length, delta: "+1", trend: "up", icon: "Users" },
        {
          label: "Pendências",
          value: overdueTasks,
          delta: "-5%",
          trend: "down",
          icon: "AlertCircle",
        },
      ],
      revenueData: (revenueRes.data ?? []).map((r) => ({
        mes: r.month_label,
        receita: Number(r.revenue),
        meta: Number(r.target),
      })),
      taskStatusData: [
        { name: "Concluídas", value: statusCounts.done, color: "var(--color-success)" },
        { name: "Em andamento", value: statusCounts.in_progress, color: "var(--color-primary)" },
        { name: "Atrasadas", value: statusCounts.overdue, color: "var(--color-destructive)" },
        { name: "Backlog", value: statusCounts.backlog, color: "var(--color-muted-foreground)" },
      ],
      teamPerformance,
      activities: (activitiesRes.data ?? []).map((a) => ({
        id: a.id,
        user: (a.profiles as { full_name: string } | null)?.full_name ?? "Usuário",
        action: a.action,
        target: a.target,
        time: formatRelativeTime(a.created_at),
      })),
      reminders: (remindersRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        date: formatReminderDate(r.reminder_date),
        time: formatTime(r.reminder_time),
        type: reminderTypeLabels[r.type as keyof typeof reminderTypeLabels] ?? r.type,
      })),
    };
  });

export const getReportsSummary = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const [revenueRes, teamsRes, projectsRes] = await Promise.all([
      client.from("revenue_snapshots").select("*").eq("user_id", userId).order("sort_order"),
      client.from("teams").select("id, name, performance"),
      client.from("projects").select("id, name, status, progress, due_date"),
    ]);

    const teamPerformance = await Promise.all(
      (teamsRes.data ?? []).map(async (team) => {
        const { count: taskCount } = await client
          .from("tasks")
          .select("*, projects!inner(team_id)", { count: "exact", head: true })
          .eq("projects.team_id", team.id)
          .eq("status", "done");
        return {
          equipe: team.name,
          entregas: taskCount ?? 0,
          eficiencia: team.performance,
        };
      }),
    );

    return {
      revenueData: (revenueRes.data ?? []).map((r) => ({
        mes: r.month_label,
        receita: Number(r.revenue),
        meta: Number(r.target),
      })),
      teamPerformance,
      projects: (projectsRes.data ?? []).map((p) => ({
        name: p.name,
        status: projectStatusLabels[p.status as keyof typeof projectStatusLabels],
        progress: p.progress,
        dueDate: p.due_date,
      })),
      taskSummary: {
        total: (projectsRes.data ?? []).length,
      },
    };
  });
