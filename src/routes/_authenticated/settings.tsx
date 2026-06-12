import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Configurações — Nexus" }, { name: "description", content: "Preferências da conta." }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  const handleSave = () => {
    updateProfile.mutate(fullName);
  };

  return (
    <AppShell title="Configurações" subtitle="Gerencie sua conta, preferências e notificações.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Perfil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={user?.email ?? ""} disabled className="mt-1.5" />
            </div>
          </div>
          <Button className="mt-2" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
          {[
            { label: "E-mails de resumo diário", defaultChecked: true },
            { label: "Alertas de prazos", defaultChecked: true },
            { label: "Menções e comentários", defaultChecked: true },
            { label: "Newsletter do produto", defaultChecked: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <span className="text-sm">{n.label}</span>
              <Switch defaultChecked={n.defaultChecked} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
