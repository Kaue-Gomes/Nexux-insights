import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { accessTokenSchema, requireAuth } from "./shared";

export const listNotifications = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      limit: z.number().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: notifications, error } = await client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error("Não foi possível carregar notificações.");

    const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

    return { notifications: notifications ?? [], unreadCount };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { error } = await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw new Error("Não foi possível marcar como lida.");
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { error } = await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) throw new Error("Não foi possível marcar todas como lidas.");
    return { ok: true };
  });
