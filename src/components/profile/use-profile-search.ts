import { ApiResponse } from "@/lib/types/api";
import { LocationResult } from "@/lib/types/data";
import { Skill, Tag } from "@/lib/validations/profile";
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

export function useSkillSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["skill-search", q],
    queryFn: async () => {
      const res = await fetch(`/api/skills/search?q=${encodeURIComponent(q)}`);
      const json: ApiResponse<Skill[]> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Skills search failed");
      return json.data;
    },
    // enabled: q.length >= 3,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTagSearch(query: string) {
  return useQuery({
    queryKey: ["tags", "search", query],
    queryFn: async () => {
      const res = await fetch(`/api/tags/search?q=${encodeURIComponent(query)}`);
      const json: ApiResponse<Tag[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 60 * 1000,
  });
}