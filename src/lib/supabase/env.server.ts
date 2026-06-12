/**
 * Resolve as variáveis de ambiente do Supabase no servidor.
 *
 * Não usamos `loadEnv` do Vite aqui: além de ser uma API exclusiva de build-time
 * (que leria arquivos `.env` do disco em runtime — inexistentes em produção, ex.: Vercel),
 * importá-la arrasta o pacote inteiro do Vite para o bundle do servidor.
 *
 * Em produção as variáveis vêm de `process.env` (injetadas pelo provedor/secret manager);
 * em SSR/build o Vite substitui estaticamente `import.meta.env.VITE_*`.
 */
export function getServerSupabaseUrl(): string {
  const url = process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;

  if (!url) {
    throw new Error("VITE_SUPABASE_URL não configurada. Verifique as variáveis de ambiente.");
  }
  return url;
}

export function getServerSupabaseKey(): string {
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Chave Supabase não configurada. Defina VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente.",
    );
  }
  return key;
}
