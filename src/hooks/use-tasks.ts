import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listProjectsForSelect,
} from "@/lib/api/tasks.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

import { useInvalidateDashboard } from "./use-dashboard";

export function useTasks(filter: "all" | "mine" | "overdue" | "done" = "all") {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks(filter),
    queryFn: () => listTasks({ data: { accessToken: accessToken!, filter } }),
    enabled: !!accessToken,
  });
}

export function useProjectsSelect() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.projectsSelect,
    queryFn: () => listProjectsForSelect({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useCreateTask() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      project_id: string;
      title: string;
      priority?: "low" | "medium" | "high" | "critical";
      status?: "backlog" | "in_progress" | "review" | "done";
      due_date?: string | null;
    }) => createTask({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      invalidateDashboard();
      toast.success("Tarefa criada.");
    },
    onError: () => toast.error("Erro ao criar tarefa."),
  });
}

export function useUpdateTask() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      id: string;
      title?: string;
      priority?: "low" | "medium" | "high" | "critical";
      status?: "backlog" | "in_progress" | "review" | "done";
      due_date?: string | null;
    }) => updateTask({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      invalidateDashboard();
    },
    onError: () => toast.error("Erro ao atualizar tarefa."),
  });
}

export function useDeleteTask() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (id: string) => deleteTask({ data: { accessToken: accessToken!, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      invalidateDashboard();
      toast.success("Tarefa excluída.");
    },
    onError: () => toast.error("Erro ao excluir tarefa."),
  });
}
