import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ProjectStatus } from "@/lib/types/database";

import { accessTokenSchema, requireAuth, logActivity, notifyProjectTeam } from "./shared";

const projectStatusSchema = z.enum(["planning", "in_progress", "completed", "overdue"]);

export const listProjects = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { data: projects, error } = await client
      .from("projects")
      .select("*, teams(name)")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Não foi possível carregar projetos.");

    const enriched = await Promise.all(
      (projects ?? []).map(async (p) => {
        const { count } = await client
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", p.team_id);
        return { ...p, member_count: count ?? 0 };
      }),
    );

    return { projects: enriched };
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      team_id: z.string().uuid(),
      name: z.string().min(1).max(200),
      status: projectStatusSchema.default("planning"),
      progress: z.number().min(0).max(100).default(0),
      due_date: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: project, error } = await client
      .from("projects")
      .insert({
        team_id: data.team_id,
        name: data.name,
        status: data.status as ProjectStatus,
        progress: data.progress,
        due_date: data.due_date ?? null,
      })
      .select("*, teams(name)")
      .single();

    if (error) throw new Error("Não foi possível criar o projeto.");
    await logActivity(client, userId, "criou o projeto", data.name);

    const isStarted = data.status === "in_progress";
    await notifyProjectTeam(client, project.id, {
      type: isStarted ? "project_started" : "project_created",
      title: isStarted ? "Nova demanda iniciada" : "Novo projeto criado",
      message: isStarted ? `Projeto iniciado: "${data.name}"` : `Novo projeto: "${data.name}"`,
      entityType: "project",
      entityId: project.id,
    });

    return { project };
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      id: z.string().uuid(),
      name: z.string().min(1).max(200).optional(),
      status: projectStatusSchema.optional(),
      progress: z.number().min(0).max(100).optional(),
      due_date: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { id, accessToken: _, ...updates } = data;
    const { data: project, error } = await client
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, teams(name)")
      .single();

    if (error) throw new Error("Não foi possível atualizar o projeto.");
    await logActivity(client, userId, "atualizou o projeto", project.name);

    if (updates.status === "in_progress") {
      await notifyProjectTeam(client, project.id, {
        type: "project_started",
        title: "Demanda iniciada",
        message: `O projeto "${project.name}" entrou em andamento`,
        entityType: "project",
        entityId: project.id,
      });
    }

    return { project };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { error } = await client.from("projects").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir o projeto.");
    return { ok: true };
  });
