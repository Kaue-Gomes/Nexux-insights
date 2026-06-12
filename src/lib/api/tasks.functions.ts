import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { TaskPriority, TaskStatus } from "@/lib/types/database";

import {
  accessTokenSchema,
  requireAuth,
  logActivity,
  notifyProjectTeam,
  notifyUser,
} from "./shared";

const taskStatusSchema = z.enum(["backlog", "in_progress", "review", "done"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const listTasks = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      filter: z.enum(["all", "mine", "overdue", "done"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    let query = client
      .from("tasks")
      .select("*, projects(name), assignee:profiles!tasks_assignee_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    const today = new Date().toISOString().slice(0, 10);

    if (data.filter === "mine") {
      query = query.eq("assignee_id", userId);
    } else if (data.filter === "done") {
      query = query.eq("status", "done");
    } else if (data.filter === "overdue") {
      query = query.neq("status", "done").lt("due_date", today);
    }

    const { data: tasks, error } = await query;
    if (error) throw new Error("Não foi possível carregar tarefas.");
    return { tasks: tasks ?? [] };
  });

export const createTask = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      project_id: z.string().uuid(),
      title: z.string().min(1).max(300),
      priority: taskPrioritySchema.default("medium"),
      status: taskStatusSchema.default("backlog"),
      due_date: z.string().nullable().optional(),
      assignee_id: z.string().uuid().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);
    const assigneeId = data.assignee_id ?? userId;

    const { data: task, error } = await client
      .from("tasks")
      .insert({
        project_id: data.project_id,
        title: data.title,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
        due_date: data.due_date ?? null,
        assignee_id: assigneeId,
      })
      .select("*, projects(name), assignee:profiles!tasks_assignee_id_fkey(full_name)")
      .single();

    if (error) throw new Error("Não foi possível criar a tarefa.");
    await logActivity(client, userId, "criou a tarefa", data.title);

    await notifyProjectTeam(client, data.project_id, {
      type: "task_created",
      title: "Nova demanda iniciada",
      message: `Nova tarefa: "${data.title}"`,
      entityType: "task",
      entityId: task.id,
    });

    await notifyUser(client, assigneeId, userId, {
      type: "task_created",
      title: "Demanda atribuída a você",
      message: `Você foi designado para: "${data.title}"`,
      entityType: "task",
      entityId: task.id,
    });

    return { task };
  });

export const updateTask = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      id: z.string().uuid(),
      title: z.string().min(1).max(300).optional(),
      priority: taskPrioritySchema.optional(),
      status: taskStatusSchema.optional(),
      due_date: z.string().nullable().optional(),
      assignee_id: z.string().uuid().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { id, accessToken: _, ...updates } = data;
    const { data: task, error } = await client
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, projects(name), assignee:profiles!tasks_assignee_id_fkey(full_name)")
      .single();

    if (error) throw new Error("Não foi possível atualizar a tarefa.");

    if (updates.status === "done") {
      await logActivity(client, userId, "concluiu a tarefa", task.title);
      await notifyProjectTeam(client, task.project_id, {
        type: "task_completed",
        title: "Demanda concluída",
        message: `Tarefa finalizada: "${task.title}"`,
        entityType: "task",
        entityId: task.id,
      });
    }

    return { task };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { error } = await client.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir a tarefa.");
    return { ok: true };
  });

export const listProjectsForSelect = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { data: projects, error } = await client
      .from("projects")
      .select("id, name")
      .order("name");
    if (error) throw new Error("Não foi possível carregar projetos.");
    return { projects: projects ?? [] };
  });
