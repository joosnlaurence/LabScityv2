"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  createComment,
  createReport,
  deletePost,
  likeComment,
  likePost,
  updatePost,
} from "@/lib/actions/feed";
import { postKeys } from "@/lib/query-keys";
import type {
  CreateCommentValues,
  CreateReportValues,
  UpdatePostValues,
} from "@/lib/validations/post";

interface DetailComment {
  id: string | number;
  isLiked?: boolean;
}
interface DetailPost {
  id: string | number;
  isLiked?: boolean;
  likeCount?: number;
  comments?: DetailComment[];
}
type DetailEnvelope = { success: boolean; data: DetailPost | null } | undefined;

export interface PostMutationOptions {
  extraInvalidateKeys?: QueryKey[];
}

export interface DeletePostOptions extends PostMutationOptions {
  onDeleted?: () => void;
}

const notifyError = (title: string) => (error: unknown) =>
  notifications.show({
    title,
    message: error instanceof Error ? error.message : "Something went wrong",
    color: "red",
  });

function invalidatePost(
  queryClient: QueryClient,
  detailKey: QueryKey,
  extraKeys: QueryKey[],
) {
  queryClient.invalidateQueries({ queryKey: detailKey });
  for (const key of extraKeys) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}

const detailKeyFor = (postId: string): QueryKey => postKeys.detail(postId);


export function useLikePost(postId: string, options: PostMutationOptions = {}) {
  const queryClient = useQueryClient();
  const detailKey = detailKeyFor(postId);
  const extraKeys = options.extraInvalidateKeys ?? [];

  return useMutation({
    mutationFn: async () => {
      const result = await likePost(postId);
      if (!result.success) throw new Error(result.error ?? "Failed to update like");
      return result;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const snapshot = queryClient.getQueryData<DetailEnvelope>(detailKey);
      queryClient.setQueryData<DetailEnvelope>(detailKey, (env) => {
        if (!env?.data) return env;
        const p = env.data;
        return {
          ...env,
          data: {
            ...p,
            isLiked: !p.isLiked,
            likeCount: (p.likeCount ?? 0) + (p.isLiked ? -1 : 1),
          },
        };
      });
      return { snapshot };
    },
    onError: (error, _vars, context) => {
      if (context?.snapshot) queryClient.setQueryData(detailKey, context.snapshot);
      notifyError("Could not update like")(error);
    },
    onSettled: () => invalidatePost(queryClient, detailKey, extraKeys),
  });
}

export function useLikeComment(postId: string, options: PostMutationOptions = {}) {
  const queryClient = useQueryClient();
  const detailKey = detailKeyFor(postId);
  const extraKeys = options.extraInvalidateKeys ?? [];

  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await likeComment(commentId);
      if (!result.success) throw new Error(result.error ?? "Failed to update like");
      return result;
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const snapshot = queryClient.getQueryData<DetailEnvelope>(detailKey);
      queryClient.setQueryData<DetailEnvelope>(detailKey, (env) => {
        if (!env?.data?.comments) return env;
        return {
          ...env,
          data: {
            ...env.data,
            comments: env.data.comments.map((c) =>
              String(c.id) === commentId ? { ...c, isLiked: !c.isLiked } : c,
            ),
          },
        };
      });
      return { snapshot };
    },
    onError: (error, _commentId, context) => {
      if (context?.snapshot) queryClient.setQueryData(detailKey, context.snapshot);
      notifyError("Could not update like")(error);
    },
    onSettled: () => invalidatePost(queryClient, detailKey, extraKeys),
  });
}

export function useAddComment(postId: string, options: PostMutationOptions = {}) {
  const queryClient = useQueryClient();
  const detailKey = detailKeyFor(postId);
  const extraKeys = options.extraInvalidateKeys ?? [];

  return useMutation({
    mutationFn: async (values: CreateCommentValues) => {
      const result = await createComment(postId, values);
      if (!result.success) throw new Error(result.error ?? "Failed to create comment");
      return result;
    },
    onError: notifyError("Could not add comment"),
    onSettled: () => invalidatePost(queryClient, detailKey, extraKeys),
  });
}

export function useDeletePost(postId: string, options: DeletePostOptions = {}) {
  const queryClient = useQueryClient();
  const extraKeys = options.extraInvalidateKeys ?? [];

  return useMutation({
    mutationFn: async () => {
      const result = await deletePost(postId);
      if (!result.success) throw new Error(result.error ?? "Failed to delete post");
      return result;
    },
    onSuccess: () => options.onDeleted?.(),
    onError: notifyError("Could not delete post"),
    onSettled: () => {
      for (const key of extraKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function useUpdatePost(postId: string, options: PostMutationOptions = {}) {
  const queryClient = useQueryClient();
  const detailKey = detailKeyFor(postId);
  const extraKeys = options.extraInvalidateKeys ?? [];

  return useMutation({
    mutationFn: async (values: UpdatePostValues) => {
      const result = await updatePost(postId, values);
      if (!result.success) throw new Error(result.error ?? "Failed to update post");
      return result;
    },
    onSuccess: () =>
      notifications.show({
        title: "Post updated",
        message: "Your post has been saved.",
        color: "green",
      }),
    onError: notifyError("Could not update post"),
    onSettled: () => invalidatePost(queryClient, detailKey, extraKeys),
  });
}

export function useCreateReport(postId: string) {
  return useMutation({
    mutationFn: async (params: {
      commentId: string | null;
      values: CreateReportValues;
    }) => {
      const result = await createReport(postId, params.commentId, params.values);
      if (!result.success) throw new Error(result.error ?? "Failed to submit report");
      return result;
    },
    onError: notifyError("Could not submit report"),
  });
}

export function usePostActions(postId: string, options: DeletePostOptions = {}) {
  const likePostMutation = useLikePost(postId, options);
  const likeCommentMutation = useLikeComment(postId, options);
  const addCommentMutation = useAddComment(postId, options);
  const deletePostMutation = useDeletePost(postId, options);
  const updatePostMutation = useUpdatePost(postId, options);
  const reportMutation = useCreateReport(postId);

  return {
    toggleLike: () => likePostMutation.mutate(),
    toggleCommentLike: (commentId: string) => likeCommentMutation.mutate(commentId),
    addComment: (values: CreateCommentValues) => addCommentMutation.mutate(values),
    remove: () => deletePostMutation.mutate(),
    edit: (values: UpdatePostValues) => updatePostMutation.mutate(values),
    report: (commentId: string | null, values: CreateReportValues) =>
      reportMutation.mutate({ commentId, values }),

    likePostMutation,
    likeCommentMutation,
    addCommentMutation,
    deletePostMutation,
    updatePostMutation,
    reportMutation,
  };
}

export type PostActionsResult = ReturnType<typeof usePostActions>;