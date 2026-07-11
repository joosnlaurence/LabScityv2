import { DEFAULT_JOBS_PAGE_SIZE } from "@/lib/constants/job";
import { jobKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { Job } from "@/lib/types/data";
import { JobFilters } from "@/lib/types/jobs";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const JOB_FILTER_KEYS = [
  "search",
  "job_type",
  "work_mode",
  "location",
] as const;

export function useGetJobById() {
  
}

export function useJobs(filters: JobFilters = {}) {
  return useInfiniteQuery({
    queryKey: jobKeys.list(filters),
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if(pageParam) params.set('cursor', String(pageParam));
      if (filters.search) params.set("search", filters.search);
      if (filters.job_type) params.set("job_type", filters.job_type);
      if (filters.work_mode) params.set("work_mode", filters.work_mode);
      if (filters.location) params.set("location", filters.location);

      const res = await fetch(`/api/jobs/all?${params}`);
      if(!res.ok) throw new Error("Failed to fetch jobs");
      const apiResponse: ApiResponse<Job[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    },
    getNextPageParam: (lastPage) => lastPage.length === DEFAULT_JOBS_PAGE_SIZE ? lastPage.at(-1)?.id ?? undefined : undefined
  });
}

export function useMyJobs(enabled: boolean) {
  return useQuery({
    queryKey: jobKeys.mine(),
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if(!res.ok) throw new Error("Failed to fetch your job postings");
      const apiResponse: ApiResponse<Job[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    },
    enabled
  })
}