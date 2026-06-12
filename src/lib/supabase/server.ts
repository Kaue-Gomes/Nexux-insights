import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerSupabaseKey, getServerSupabaseUrl } from "./env.server";

export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  const url = getServerSupabaseUrl();
  const key = getServerSupabaseKey();

  return createClient(url, key, {
    global: {
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createServerSupabaseClient(): SupabaseClient {
  const url = getServerSupabaseUrl();
  const key = getServerSupabaseKey();

  return createClient(url, key, {
    global: { headers: { apikey: key } },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
