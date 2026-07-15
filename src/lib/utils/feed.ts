// lib/feed/format-feed-post.ts
import type { FeedPostItem } from "@/lib/types/feed";
import { QueryClient } from "@tanstack/react-query";
import { bookmarkKeys, feedKeys, postKeys, profileKeys } from "../query-keys";

const POST_MEDIA_BUCKET = "post_images";
const AVATAR_BUCKET = "profile_pictures";

type StorageCapable = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

export function getTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

function publicUrl(
  supabase: StorageCapable,
  bucket: string,
  path: string | null | undefined,
): string | null {
  return path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
}

export function formatFeedPost(
  supabase: StorageCapable,
  post: any,
  comments: any[],
  currentUserId: string | null,
): FeedPostItem {
  return {
    id: post.post_id,
    userId: post.user_id,
    userName: `${post.users?.first_name} ${post.users?.last_name}`.trim(),
    avatarUrl: publicUrl(supabase, AVATAR_BUCKET, post.users?.profile_pic_path),
    scientificField: post.scientific_field,
    content: post.text,
    mediaUrl: publicUrl(supabase, POST_MEDIA_BUCKET, post.media_path),
    mediaWidth: post.media_width ?? undefined,
    mediaHeight: post.media_height ?? undefined,
    timeAgo: getTimeAgo(post.created_at),
    comments: (comments ?? []).map((comment) => ({
      id: comment.comment_id,
      userId: comment.user_id,
      userName: `${comment.users?.first_name} ${comment.users?.last_name}`.trim(),
      avatarUrl: publicUrl(supabase, AVATAR_BUCKET, comment.users?.profile_pic_path),
      content: comment.text,
      createdAt: comment.created_at,
      timeAgo: getTimeAgo(comment.created_at),
      isLiked: currentUserId
        ? (comment.comment_likes?.some((like: any) => like.user_id === currentUserId) ?? false)
        : false,
      parentCommentId: comment.parent_comment_id != null ? String(comment.parent_comment_id) : null,
    })),
    isLiked: currentUserId
      ? (post.likes?.some((like: any) => like.user_id === currentUserId) ?? false)
      : false,
    likeCount: post.like_amount ?? 0,
    isSaved: currentUserId 
      ? (post.saved_posts?.some((save: any) => save.profile_user_id === currentUserId) ?? false)
      : false
  };
}

function mapInfinitePosts(
  old: any,
  update: (post: FeedPostItem) => FeedPostItem,
) {
  const data = old as { pages?: { posts: FeedPostItem[] }[] } | undefined;
  if (!data?.pages) return old;
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, posts: page.posts.map(update) })),
  };
}

export function syncSavedState(queryClient: QueryClient, postId: string, isSaved: boolean): void {
  const update = (post: FeedPostItem): FeedPostItem =>
    String(post.id) === String(postId) ? { ...post, isSaved } : post;

  queryClient.setQueriesData({ queryKey: feedKeys.all }, (old) => mapInfinitePosts(old, update));

  queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
    const data = old as { data?: FeedPostItem | null } | undefined;
    if (!data?.data || String(data.data.id) !== String(postId)) return old;
    return { ...data, data: update(data.data) };
  });

  queryClient.setQueriesData({ queryKey: bookmarkKeys.all }, (old) => {
    const data = old as { posts?: FeedPostItem[] } | undefined;
    if (!Array.isArray(data?.posts)) return old;
    return { ...data, posts: data.posts.map(update) };
  });

  queryClient.setQueriesData(
    { queryKey: [...profileKeys.all, "posts"] },
    (old: any) => mapInfinitePosts(old, (post: any) =>
      String(post.post_id) === String(postId) ? { ...post, isSaved } : post,
    ),
  );
}

export function snapshotPostCaches(queryClient: QueryClient) {
  return [
    ...queryClient.getQueriesData({ queryKey: feedKeys.all }),
    ...queryClient.getQueriesData({ queryKey: postKeys.all }),
    ...queryClient.getQueriesData({ queryKey: bookmarkKeys.all }),
  ];
}

export function restorePostCaches(
  queryClient: QueryClient,
  snapshot: [readonly unknown[], unknown][],
): void {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}
