import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  listTeamsForSelect,
} from "@/lib/api/teams.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

import { useInvalidateDashboard } from "./use-dashboard";

export function useTeams() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => listTeams({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useTeamsSelect() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.teamsSelect,
    queryFn: () => listTeamsForSelect({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useCreateTeam() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: { name: string; performance?: number }) =>
      createTeam({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamsSelect });
      invalidateDashboard();
      toast.success("Equipe criada.");
    },
    onError: () => toast.error("Erro ao criar equipe."),
  });
}

export function useUpdateTeam() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: { id: string; name?: string; performance?: number }) =>
      updateTeam({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      invalidateDashboard();
      toast.success("Equipe atualizada.");
    },
    onError: () => toast.error("Erro ao atualizar equipe."),
  });
}

export function useDeleteTeam() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (id: string) => deleteTeam({ data: { accessToken: accessToken!, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      invalidateDashboard();
      toast.success("Equipe excluída.");
    },
    onError: () => toast.error("Erro ao excluir equipe."),
  });
}
