import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { CreateRecordInput, UpdateRecordInput } from "@classified/shared";

export function useRecords(params?: { page?: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ["records", params],
    queryFn: () => api.records.list(params),
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ["records", id],
    queryFn: () => api.records.get(id),
    enabled: !!id,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordInput) => api.records.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecordInput }) =>
      api.records.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.records.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}
