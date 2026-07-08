import { setSavedPost } from "@/lib/actions/feed";
import { bookmarkKeys, feedKeys, postKeys, profileKeys } from "@/lib/query-keys";
import { FeedPostItem } from "@/lib/types/feed";
import { restorePostCaches, snapshotPostCaches, syncSavedState as syncSavedPostState } from "@/lib/utils/feed";
import { feedFilterSchema } from "@/lib/validations/post";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const defaultFeedFilter = feedFilterSchema.parse({});

export function useSetSavedPost(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      { postId, save }
      :
      { postId: string, save: boolean }) => {
      const res = await setSavedPost(postId, save);
      if(!res.success) throw new Error(res.error);
      return res.success;
    },
    onMutate: async ({postId, save}) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.all });
      await queryClient.cancelQueries({ queryKey: postKeys.all });
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.all });

      const snapshot = snapshotPostCaches(queryClient);
      syncSavedPostState(queryClient, postId, save);
      return { snapshot };
    },
    onSuccess: (_data, {postId, save}) => {
      if (!save) {
        queryClient.setQueriesData({ queryKey: bookmarkKeys.list(userId) }, (old) => {
          const data = old as { posts?: unknown } | undefined;
          if (!Array.isArray(data?.posts)) return old;
          return { ...data, posts: (data.posts as FeedPostItem[]).filter((p) => p.id !== postId) };
        });
      }
      notifications.show({color: 'green', message: `Post ${save ? 'saved' : 'unsaved'}!`});
    },
    onError: (error, _vars, context) => {
      if(context?.snapshot) restorePostCaches(queryClient, context.snapshot);
      notifications.show({
        color: "red",
        title: "Error saving post",
        message: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.list(defaultFeedFilter)})
      queryClient.invalidateQueries({ queryKey: postKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.counts(userId) });
    }
  });
}