import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { bootstrapUserData } from "@/lib/api/auth.functions";
import { mapAuthError, type SignUpResult } from "@/lib/auth-errors";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (accessToken: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .single();
      if (!error && data) setProfile(data as Profile);
    },
    [supabase],
  );

  const bootstrap = useCallback(async (accessToken: string) => {
    try {
      await bootstrapUserData({ data: { accessToken } });
    } catch {
      // bootstrap may already exist
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.access_token) {
        await bootstrap(s.access_token);
        await loadProfile(s.access_token);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.access_token) {
        await bootstrap(s.access_token);
        await loadProfile(s.access_token);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, bootstrap, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(mapAuthError(error));
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw new Error(mapAuthError(error));

      if (data.session) {
        return { status: "session" };
      }

      return {
        status: "confirmation_required",
        message:
          "Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada. Caso contrário, faça login.",
      };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(mapAuthError(error));
    setProfile(null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (session?.access_token) await loadProfile(session.access_token);
  }, [session, loadProfile]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      accessToken: session?.access_token ?? null,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
