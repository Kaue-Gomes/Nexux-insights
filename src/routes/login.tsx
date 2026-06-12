import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NexusLogo } from "@/components/brand/nexus-logo";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Entrar — Nexus" }, { name: "description", content: "Acesse seu dashboard." }],
  }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Nome obrigatório"),
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { signIn, signUp, loading, session } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: redirect ?? "/", replace: true });
    }
  }, [loading, session, redirect, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      navigate({ to: redirect ?? "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar.");
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    try {
      const result = await signUp(values.email, values.password, values.fullName);
      if (result.status === "session") {
        toast.success("Conta criada! Redirecionando...");
        navigate({ to: redirect ?? "/" });
        return;
      }
      toast.success(result.message);
      setMode("login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar.");
    }
  });

  if (loading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:flex flex-col justify-between p-10 text-slate-100"
        style={{ background: "linear-gradient(180deg, #0F172A, #111827)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1">
            <NexusLogo size="sm" className="h-full w-full" />
          </div>
          <span className="font-semibold">Nexus Insights</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Centralize indicadores,
            <br /> projetos e equipes em
            <br /> uma única plataforma.
          </h2>
          <p className="mt-4 text-slate-400 max-w-md">
            KPIs em tempo real, relatórios inteligentes e gestão de tarefas em uma interface moderna
            e responsiva.
          </p>
        </div>
        <p className="text-xs text-slate-500">© 2026 Nexus. Todos os direitos reservados.</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Entre com sua conta para continuar."
              : "Preencha os dados para começar."}
          </p>

          {mode === "login" ? (
            <form className="mt-8 space-y-4" onSubmit={onLogin}>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="mt-1.5 h-12 rounded-xl"
                  {...loginForm.register("email")}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 h-12 rounded-xl"
                  {...loginForm.register("password")}
                />
              </div>
              <Button className="w-full h-12 rounded-xl" type="submit">
                Entrar
              </Button>
            </form>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={onRegister}>
              <div>
                <Label>Nome completo</Label>
                <Input
                  placeholder="Seu nome"
                  className="mt-1.5 h-12 rounded-xl"
                  {...registerForm.register("fullName")}
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  className="mt-1.5 h-12 rounded-xl"
                  {...registerForm.register("email")}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 h-12 rounded-xl"
                  {...registerForm.register("password")}
                />
              </div>
              <Button className="w-full h-12 rounded-xl" type="submit">
                Criar conta
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-6 text-center">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setMode("register")}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setMode("login")}
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
