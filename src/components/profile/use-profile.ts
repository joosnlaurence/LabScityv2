import { useQuery } from "@tanstack/react-query";
import { getUser, getUserPosts } from "@/lib/actions/data";
import { profileKeys } from "@/lib/query-keys";
import { getUserFollowers, getUserFollowing, getUserFriends } from "@/lib/actions/profile";

// NOTE: Profile hooks now return the full React Query result objects
// so server prefetch and client usage share the same data shape.
export function useUserProfile(user_id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.user(user_id),
    queryFn: async () => {
      const result = await getUser(user_id);
      if (!result?.success || !result.data) {
        throw new Error(result?.error ?? "Failed to fetch user profile");
      }
      return result.data;
    },
    ...options,
  });
}

export function useUserPosts(user_id: string) {
  return useQuery({
    queryKey: profileKeys.posts(user_id),
    queryFn: async () => {
      const result = await getUserPosts({ user_id });
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user posts");
      }
      return result.data;
    },
  });
}

export function useUserFollowers(user_id: string) {
  return useQuery({
    queryKey: profileKeys.followers(user_id),
    queryFn: async () => {
      const result = await getUserFollowers(user_id);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user followers");
      }
      return result.data;
    },
  });
}

export function useUserFollowing(user_id: string) {
  return useQuery({
    queryKey: profileKeys.following(user_id),
    queryFn: async () => {
      const result = await getUserFollowing(user_id);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user following");
      }
      return result.data;
    },
  });
}

export function useUserFriends(user_id: string) {
  return useQuery({
    queryKey: profileKeys.friends(user_id),
    queryFn: async () => {
      const result = await getUserFriends(user_id);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user friends");
      }
      return result.data;
    },
  });
}
