import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/api/client";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.list().then((r) => r.data),
  });
}
