import type { AuthError } from "@supabase/supabase-js";

export function mapAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();
  const code = error.code ?? "";

  if (
    error.status === 429 ||
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  ) {
    return "Limite de envio de e-mails atingido no Supabase. Aguarde ~1 hora ou desative a confirmação por e-mail em Authentication → Providers → Email no painel Supabase.";
  }

  if (code === "email_address_invalid" || message.includes("invalid")) {
    return "E-mail não aceito pelo Supabase. Use um endereço real (evite aliases suspeitos ou domínios de teste).";
  }

  if (code === "user_already_exists" || message.includes("already registered")) {
    return "Este e-mail já está cadastrado. Use a opção Entrar.";
  }

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "E-mail ou senha inválidos.";
  }

  if (code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e spam.";
  }

  if (code === "weak_password" || message.includes("password")) {
    return "Senha fraca. Use pelo menos 6 caracteres.";
  }

  return error.message || "Não foi possível concluir a autenticação.";
}

export type SignUpResult =
  | { status: "session"; message?: string }
  | { status: "confirmation_required"; message: string };
