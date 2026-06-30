import { ApiResponse } from "@/lib/types/api";
import { LocationResult } from "@/lib/types/data";
import { useQuery } from "@tanstack/react-query";

export function useLocationSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["location-search", q],
    queryFn: async () => {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`);
      const json: ApiResponse<LocationResult[]> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Location search failed");
      return json.data;
    },
    enabled: q.length >= 3,
    staleTime: 5 * 60 * 1000,
  });
}