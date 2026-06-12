import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api/projects.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

import { useInvalidateDashboard } from "./use-dashboard";

export function useProjects() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => listProjects({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useCreateProject() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      team_id: string;
      name: string;
      status?: "planning" | "in_progress" | "completed" | "overdue";
      progress?: number;
      due_date?: string | null;
    }) => createProject({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      invalidateDashboard();
      toast.success("Projeto criado com sucesso.");
    },
    onError: () => toast.error("Erro ao criar projeto."),
  });
}

export function useUpdateProject() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      id: string;
      name?: string;
      status?: "planning" | "in_progress" | "completed" | "overdue";
      progress?: number;
      due_date?: string | null;
    }) => updateProject({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      invalidateDashboard();
      toast.success("Projeto atualizado.");
    },
    onError: () => toast.error("Erro ao atualizar projeto."),
  });
}

export function useDeleteProject() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (id: string) => deleteProject({ data: { accessToken: accessToken!, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      invalidateDashboard();
      toast.success("Projeto excluído.");
    },
    onError: () => toast.error("Erro ao excluir projeto."),
  });
}
