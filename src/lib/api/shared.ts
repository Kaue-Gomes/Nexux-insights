import type { AuthenticatedContext } from "@/lib/security/jwt.server";
import { requireAuthenticatedUser } from "@/lib/security/jwt.server";
import { accessTokenSchema, sanitizeText } from "@/lib/security/validation";
import type { AccessTokenInput } from "@/lib/security/validation";
import { createAuthenticatedClient } from "@/lib/supabase/server";

export { accessTokenSchema };
export type { AccessTokenInput };

export function getAuthedClient(accessToken: string) {
  return createAuthenticatedClient(accessToken);
}

/** Central JWT gate — use in every server function handler */
export async function requireAuth(accessToken: string): Promise<AuthenticatedContext> {
  return requireAuthenticatedUser(accessToken);
}

export function apiError(message = "Operação não concluída. Tente novamente.") {
  throw new Error(message);
}

export async function logActivity(
  client: ReturnType<typeof createAuthenticatedClient>,
  userId: string,
  action: string,
  target: string,
) {
  await client.from("activities").insert({
    user_id: userId,
    action: sanitizeText(action, 120),
    target: sanitizeText(target, 200),
  });
}

export type NotificationPayload = {
  type: "task_created" | "task_completed" | "project_created" | "project_started";
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
};

type AuthenticatedClient = ReturnType<typeof createAuthenticatedClient>;

/**
 * Cria notificacoes para um conjunto de usuarios via RPC parametrizado
 * (SECURITY DEFINER — sem injecao de SQL). Sanitiza titulo/mensagem.
 */
async function createNotifications(
  client: AuthenticatedClient,
  userIds: string[],
  payload: NotificationPayload,
) {
  if (!userIds.length) return;

  await client.rpc("create_notifications", {
    p_user_ids: userIds,
    p_type: payload.type,
    p_title: sanitizeText(payload.title, 200),
    p_message: sanitizeText(payload.message, 500),
    p_entity_type: payload.entityType ?? null,
    p_entity_id: payload.entityId ?? null,
  });
}

/** Notify team members via SECURITY DEFINER RPC (parameterized — no SQL injection) */
export async function notifyProjectTeam(
  client: AuthenticatedClient,
  projectId: string,
  payload: NotificationPayload,
) {
  const { data: memberIds, error: idsError } = await client.rpc("get_project_team_member_ids", {
    p_project_id: projectId,
  });
  if (idsError || !memberIds?.length) return;

  await createNotifications(client, memberIds, payload);
}

/** Notify a specific user (e.g. assignee) */
export async function notifyUser(
  client: AuthenticatedClient,
  userId: string,
  payload: NotificationPayload,
) {
  await createNotifications(client, [userId], payload);
}
