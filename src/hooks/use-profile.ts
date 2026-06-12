import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateProfile } from "@/lib/api/auth.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

export function useUpdateProfile() {
  const { accessToken, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (full_name: string) =>
      updateProfile({ data: { accessToken: accessToken!, full_name } }),
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Perfil atualizado.");
    },
    onError: () => toast.error("Erro ao atualizar perfil."),
  });
}
