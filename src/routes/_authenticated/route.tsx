import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getSupabaseClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: () => <Outlet />,
});
