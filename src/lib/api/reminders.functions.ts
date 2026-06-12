import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ReminderType } from "@/lib/types/database";

import { accessTokenSchema, requireAuth } from "./shared";

const reminderTypeSchema = z.enum(["meeting", "deadline", "review", "other"]);

export const listReminders = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: reminders, error } = await client
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .order("reminder_date");

    if (error) throw new Error("Não foi possível carregar lembretes.");
    return { reminders: reminders ?? [] };
  });

export const createReminder = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      title: z.string().min(1).max(200),
      reminder_date: z.string(),
      reminder_time: z.string().default("09:00"),
      type: reminderTypeSchema.default("other"),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: reminder, error } = await client
      .from("reminders")
      .insert({
        user_id: userId,
        title: data.title,
        reminder_date: data.reminder_date,
        reminder_time: data.reminder_time,
        type: data.type as ReminderType,
      })
      .select()
      .single();

    if (error) throw new Error("Não foi possível criar o lembrete.");
    return { reminder };
  });

export const updateReminder = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      reminder_date: z.string().optional(),
      reminder_time: z.string().optional(),
      type: reminderTypeSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { id, accessToken: _, ...updates } = data;
    const { data: reminder, error } = await client
      .from("reminders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error("Não foi possível atualizar o lembrete.");
    return { reminder };
  });

export const deleteReminder = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { error } = await client.from("reminders").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir o lembrete.");
    return { ok: true };
  });
