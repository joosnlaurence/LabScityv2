import { useQuery } from "@tanstack/react-query";
import { getUser, getUserPosts } from "@/lib/actions/data";
import { profileKeys } from "@/lib/query-keys";

export function useUserProfile(user_id: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey: profileKeys.user(user_id),
    queryFn: async () => {
      const result = await getUser(user_id);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user profile");
      }
      return result.data;
    },
    enabled,
  });
}

export function useUserPosts(user_id: string) {
  return useQuery({
    queryKey: profileKeys.posts(user_id),
    queryFn: async () => {
      const result = await getUserPosts({ user_id: user_id });
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user posts");
      }
      return result.data;
    },
  });
}
