import { useEffect } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

/**
 * Guard de autenticação no cliente.
 *
 * A sessão do Supabase é persistida no localStorage do navegador, indisponível
 * no servidor. Por isso o gating NÃO pode ocorrer no `beforeLoad` (que roda no
 * SSR a cada reload e enxergaria sempre "sem sessão", expulsando o usuário para
 * o login). Enquanto a sessão é restaurada exibimos um loader; sem sessão,
 * redirecionamos para o login preservando o destino original.
 */
function AuthenticatedLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !session) {
      navigate({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
  }, [loading, session, location.href, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Outlet />;
}
