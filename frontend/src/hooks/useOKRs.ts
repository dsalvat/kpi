import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { okrApi } from "@/api/client";
import { useAppStore } from "@/store";

export function useOKRs() {
  const year = useAppStore((s) => s.selectedYear);

  return useQuery({
    queryKey: ["okrs", year],
    queryFn: () => okrApi.list(year).then((r) => r.data),
  });
}

export function useUpdateQuarterly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { actual?: number; notes?: string };
    }) => okrApi.updateQuarterly(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okrs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
