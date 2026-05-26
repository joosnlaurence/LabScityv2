import { addPublicationByDoi } from "@/lib/actions/publication";
import { publicationKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { Publication } from "@/lib/types/data";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePublications(userId: string) {
  return useQuery({
    queryKey: publicationKeys.list(userId),
    queryFn: async () => {
      const res = await fetch(`/api/publications?userId=${userId}`);
      if(!res.ok) throw new Error("Failed to fetch publications");
      const apiResponse: ApiResponse<Publication[]> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error)

      return apiResponse.data
    }
  });
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
    onMutate: async (doi) => {
      await queryClient.cancelQueries({ queryKey: publicationKeys.list(userId) });
      const snapshot = queryClient.getQueryData<Publication[]>(publicationKeys.list(userId));

      const optimisticPub: Publication = {
        publication_id: -Date.now(),
        title: 'Loading...',
        doi: doi,
        journal: null,
        date_published: null,
        authors: null,
        preview_path: null,
        is_oa: false,
        pdf_url: null,
        type: 'other',
        is_featured: false,
        topics: []
      };

      queryClient.setQueryData<Publication[]>(
        publicationKeys.list(userId),
        (old) => [optimisticPub, ...(old ?? [])]
      );

      return { snapshot };
    },
    onError: (error, _doi, context) => {
      if(context?.snapshot) 
        queryClient.setQueryData(publicationKeys.list(userId), context.snapshot);
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
      notifications.show({color: 'green', message: 'Publication Added!'});
    }
  })
}