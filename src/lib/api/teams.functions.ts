import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { accessTokenSchema, requireAuth, logActivity } from "./shared";

export const listTeams = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { data: teams, error } = await client
      .from("teams")
      .select("*")
      .order("name");

    if (error) throw new Error("Não foi possível carregar equipes.");

    const enriched = await Promise.all(
      (teams ?? []).map(async (team) => {
        const [{ count: memberCount }, { count: projectCount }, leadRes] = await Promise.all([
          client
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", team.id),
          client
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("team_id", team.id),
          client
            .from("team_members")
            .select("profiles(full_name)")
            .eq("team_id", team.id)
            .eq("is_lead", true)
            .limit(1)
            .maybeSingle(),
        ]);

        return {
          ...team,
          member_count: memberCount ?? 0,
          project_count: projectCount ?? 0,
          lead_name: (leadRes.data?.profiles as { full_name: string } | null)?.full_name ?? null,
        };
      }),
    );

    return { teams: enriched };
  });

export const createTeam = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      name: z.string().min(1).max(120),
      performance: z.number().min(0).max(100).default(80),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: team, error } = await client
      .from("teams")
      .insert({
        name: data.name,
        owner_id: userId,
        performance: data.performance,
      })
      .select()
      .single();

    if (error) throw new Error("Não foi possível criar a equipe.");

    await client.from("team_members").insert({
      team_id: team.id,
      user_id: userId,
      is_lead: true,
    });

    await logActivity(client, userId, "criou a equipe", data.name);
    return { team };
  });

export const updateTeam = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      id: z.string().uuid(),
      name: z.string().min(1).max(120).optional(),
      performance: z.number().min(0).max(100).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { id, accessToken: _, ...updates } = data;
    const { data: team, error } = await client
      .from("teams")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error("Não foi possível atualizar a equipe.");
    return { team };
  });

export const deleteTeam = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { error } = await client.from("teams").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir a equipe.");
    return { ok: true };
  });

export const listTeamsForSelect = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { data: teams, error } = await client.from("teams").select("id, name").order("name");
    if (error) throw new Error("Não foi possível carregar equipes.");
    return { teams: teams ?? [] };
  });
