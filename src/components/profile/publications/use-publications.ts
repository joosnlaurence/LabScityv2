import { addPublicationByDoi, bulkInsertPublications, deletePublication, setFeaturedPublication } from "@/lib/actions/publication";
import { publicationKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { Publication } from "@/lib/types/data";
import { InfinitePublications, ParsedOpenAlexWork } from "@/lib/types/publication";
import { notifications } from "@mantine/notifications";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePublications(userId: string) {
  return useInfiniteQuery({
    queryKey: publicationKeys.list(userId),
    initialPageParam: null as { date_published: string | null, publication_id: number } | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ userId });
      if(pageParam) {
        const cursor = { date_published: pageParam.date_published, publication_id: pageParam.publication_id }
        params.set("cursor", btoa(JSON.stringify(cursor)));  
      }
      const res = await fetch(`/api/publications?${params}`);
      if(!res.ok) throw new Error("Failed to fetch publications");
      const apiResponse: ApiResponse<InfinitePublications> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error)
      return apiResponse.data;
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined
  })
}

export function useAddPubByDoi ({
  userId,
  onSuccess,
}: {
  userId: string,
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doi: string) => {
      const res = await addPublicationByDoi(doi);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onError: (error, _doi, context) => {
      notifications.show({
        color: "red",
        title: "Error adding publication",
        message: error.message
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.list(userId) })
    },

    onSuccess: () => {
      onSuccess?.();
      notifications.show({color: 'green', message: 'Publication Added!'});
    }
  })
}

export function useBulkInsertPublications({
  userId, 
  onSuccess,
}: {
  userId: string,
  onSuccess: () => void
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publications: ParsedOpenAlexWork[]) => {
      const res = await bulkInsertPublications(publications);
      if(!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      onSuccess?.();
      notifications.show({
          color: 'green', 
          message: `${data!.inserted} pubs inserted, ${data!.skipped} skipped`
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error pinning publication",
        message: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.list(userId) });
    }
  })
}

export function useDeletePublication(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicationId: number) => {
      const res = await deletePublication(publicationId); 
      if(!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.list(userId) });
      notifications.show({color: 'green', message: 'Publication successfully deleted!'})
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: 'Couldn\'t delete publication',
        message: err.message
      });
    }
  })
}

export function useSetFeaturedPublication(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      { publicationId, isFeatured }
      :
      { publicationId: number, isFeatured: boolean }) => {
      const res = await setFeaturedPublication(publicationId, isFeatured);
      if(!res.success) throw new Error(res.error);
      return res.success;
    },
    onSuccess: (_data, {publicationId, isFeatured}) => {
      notifications.show({color: 'green', message: `Publication ${isFeatured ? 'pinned' : 'unpinned'}!`});
    },
    onError: (error, _vars, context) => {
      notifications.show({
        color: "red",
        title: "Error pinning publication",
        message: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.list(userId) });
    }
  });
}