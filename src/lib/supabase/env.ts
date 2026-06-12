export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error("VITE_SUPABASE_URL não configurada. Verifique o arquivo .env");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Chave Supabase não configurada. Defina VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY no .env",
    );
  }
  return key;
}
