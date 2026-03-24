import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scorecardApi } from "@/api/client";
import type { IndicatorValueCreate } from "@/types/scorecard";

export function useScorecardTree(companyId: string | null, year: number) {
  return useQuery({
    queryKey: ["scorecard-tree", companyId, year],
    queryFn: () => scorecardApi.getTree(companyId!, year).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useAddIndicatorValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ indicatorId, data }: { indicatorId: string; data: IndicatorValueCreate }) =>
      scorecardApi.addValue(indicatorId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scorecard-tree"] });
    },
  });
}
