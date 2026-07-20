import { setSavedJob } from "@/lib/actions/bookmarks";
import { deleteJob } from "@/lib/actions/job";
import { DEFAULT_JOBS_PAGE_SIZE } from "@/lib/constants/job";
import { bookmarkKeys, jobKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { Job, TrendingJobTag } from "@/lib/types/data";
import { JobFilters } from "@/lib/types/jobs";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { SavedItemsData } from "@/lib/types/bookmarks";

export const JOB_FILTER_KEYS = [
  "search",
  "job_type",
  "work_mode",
  "location",
] as const;

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

export function useTrendingJobTags() {
  return useQuery({
    queryKey: jobKeys.trending(),
    queryFn: async () => {
      const res = await fetch("/api/jobs/trending");
      if(!res.ok) throw new Error("Failed to fetch trending job fields");
      const apiResponse: ApiResponse<TrendingJobTag[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data ?? [];
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const res = await deleteJob(jobId);
      if(!res.success) throw new Error(res.error ?? "Failed to delete job");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
      notifications.show({ color: "green", message: "Job deleted." });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error deleting job",
        message: error.message,
      });
    },
  });
}

export function useSetSavedJob(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: number, isSaved: boolean}) => {
      const res = await setSavedJob(jobId, isSaved);
      if(!res.success) throw new Error(res.error);
      return res.success;
    },
    onMutate: async ({ jobId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: jobKeys.all });
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.all });
      const snapshot = [
        ...queryClient.getQueriesData({ queryKey: jobKeys.all }),
        ...queryClient.getQueriesData({ queryKey: bookmarkKeys.all })
      ];

      queryClient.setQueriesData({ queryKey: jobKeys.lists() }, (old) => {
        const data = old as { pages?: Job[][]; pageParams?: any } | undefined;
        if(!data?.pages) return old;
        return {
          ...data,
          pages: data.pages.map((page) => 
            page.map((job) => 
              String(job.id) === String(jobId) ? { ...job, isSaved} : job,
            ),
          ),
        }
      });

      queryClient.setQueriesData({ queryKey: bookmarkKeys.all }, (old) => {
        const data = old as SavedItemsData | undefined;
        if(!Array.isArray(data?.jobs)) return old;
        return {
          ...data,
          jobs: data.jobs.map(row => 
            String(row.job_id) === String(jobId) 
            ? { ...row, jobs: { ...row.jobs, isSaved } }
            : row,
          ),
        }
      });

      return { snapshot };
    },
    onSuccess: (_data, { jobId, isSaved}) => {
      if(!isSaved) {
        queryClient.setQueriesData({ queryKey: bookmarkKeys.list(userId) }, (old) => {
          const data = old as SavedItemsData | undefined;
          if(!Array.isArray(data?.jobs)) return old;
          return { ...data, jobs: data.jobs.filter(job => job.job_id !== jobId) }
        });
      }
      notifications.show({color: 'green', message: `Job ${isSaved ? 'saved' : 'unsaved'}!`});
    },
    onError: (error, _vars, context) => {
      if(context?.snapshot) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data);
        }
      }
      notifications.show({ color: "red", title: "Error saving job", message: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    }
  })
}
