import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications.functions";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

export function useNotifications() {
  const { accessToken, userId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => listNotifications({ data: { accessToken: accessToken!, limit: 30 } }),
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { title?: string; message?: string };
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
          if (row.title) {
            toast.info(row.title, { description: row.message });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead({ data: { accessToken: accessToken!, id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead({ data: { accessToken: accessToken! } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markRead,
    markAllRead,
  };
}
