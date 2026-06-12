import type { User } from "@supabase/supabase-js";

import { createAuthenticatedClient } from "@/lib/supabase/server";

import { jwtTokenSchema } from "./validation";

export type AuthenticatedContext = {
  client: ReturnType<typeof createAuthenticatedClient>;
  user: User;
  userId: string;
  accessToken: string;
};

/**
 * Validates Supabase JWT on every server function call.
 * Uses auth.getUser() — verifies signature with Supabase Auth (not just decode).
 */
export async function requireAuthenticatedUser(accessToken: string): Promise<AuthenticatedContext> {
  const tokenResult = jwtTokenSchema.safeParse(accessToken);
  if (!tokenResult.success) {
    throw new Error("Token de autenticação inválido.");
  }

  const client = createAuthenticatedClient(accessToken);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new Error("Sessão expirada ou inválida. Faça login novamente.");
  }

  return { client, user, userId: user.id, accessToken };
}
