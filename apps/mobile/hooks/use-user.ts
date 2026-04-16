import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => api.user.me(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.user.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
  });
}
