import { loadEnv } from "vite";

let cachedEnv: Record<string, string> | null = null;

function getEnv(): Record<string, string> {
  if (!cachedEnv) {
    cachedEnv = loadEnv(
      process.env.NODE_ENV ?? "development",
      process.cwd(),
      "",
    );
  }
  return cachedEnv;
}

export function getServerSupabaseUrl(): string {
  const url =
    getEnv().VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    import.meta.env.VITE_SUPABASE_URL;

  if (!url) {
    throw new Error("VITE_SUPABASE_URL não configurada. Verifique o arquivo .env");
  }
  return url;
}

export function getServerSupabaseKey(): string {
  const key =
    getEnv().VITE_SUPABASE_ANON_KEY ??
    getEnv().VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Chave Supabase não configurada. Defina VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY no .env",
    );
  }
  return key;
}
