import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDashboardSummary, getReportsSummary } from "@/lib/api/dashboard.functions";
import { queryKeys } from "@/lib/query-keys";

import { useAuth } from "@/providers/auth-provider";

export function useDashboard() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => getDashboardSummary({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useReports() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: () => getReportsSummary({ data: { accessToken: accessToken! } }),
    enabled: !!accessToken,
  });
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports });
  };
}
