import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { swApi } from "@/lib/api-client";
import type { Record, CreateRecordInput } from "@classified/shared";

export type RecordsPage = {
  records: Record[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useRecords(params: { search: string; page: number }) {
  return useQuery({
    queryKey: ["records", params],
    queryFn: () => swApi.listRecords(params) as unknown as Promise<RecordsPage>,
  });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordInput) => swApi.createRecord(data) as unknown as Promise<Record>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
}
