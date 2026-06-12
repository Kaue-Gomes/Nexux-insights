import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "@/lib/api/reminders.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

import { useInvalidateDashboard } from "./use-dashboard";

export function useReminders() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.reminders,
    queryFn: () => listReminders({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useCreateReminder() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      title: string;
      reminder_date: string;
      reminder_time?: string;
      type?: "meeting" | "deadline" | "review" | "other";
    }) => createReminder({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
      invalidateDashboard();
      toast.success("Lembrete criado.");
    },
    onError: () => toast.error("Erro ao criar lembrete."),
  });
}

export function useUpdateReminder() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (input: {
      id: string;
      title?: string;
      reminder_date?: string;
      reminder_time?: string;
      type?: "meeting" | "deadline" | "review" | "other";
    }) => updateReminder({ data: { accessToken: accessToken!, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
      invalidateDashboard();
      toast.success("Lembrete atualizado.");
    },
    onError: () => toast.error("Erro ao atualizar lembrete."),
  });
}

export function useDeleteReminder() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateDashboard = useInvalidateDashboard();

  return useMutation({
    mutationFn: (id: string) => deleteReminder({ data: { accessToken: accessToken!, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders });
      invalidateDashboard();
      toast.success("Lembrete excluído.");
    },
    onError: () => toast.error("Erro ao excluir lembrete."),
  });
}
