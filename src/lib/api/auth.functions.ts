import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { sanitizeText } from "@/lib/security/validation";

import { accessTokenSchema, requireAuth } from "./shared";

export const bootstrapUserData = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client } = await requireAuth(data.accessToken);
    const { error } = await client.rpc("bootstrap_user_data");
    if (error) throw new Error("Não foi possível inicializar seus dados.");
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "POST" })
  .inputValidator(accessTokenSchema)
  .handler(async ({ data }) => {
    const { client, userId, user } = await requireAuth(data.accessToken);

    const { data: profile, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error("Perfil não encontrado.");
    return { profile, email: user.email ?? "" };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator(
    accessTokenSchema.extend({
      full_name: z.string().min(1).max(120),
    }),
  )
  .handler(async ({ data }) => {
    const { client, userId } = await requireAuth(data.accessToken);

    const { data: profile, error } = await client
      .from("profiles")
      .update({
        full_name: sanitizeText(data.full_name, 120),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error("Não foi possível atualizar o perfil.");
    return { profile };
  });
