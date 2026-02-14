import { useQuery } from "@tanstack/react-query";
import { getUser, getUserPosts } from "@/lib/actions/data";
import { profileKeys } from "@/lib/query-keys";
import { Post, User } from "@/lib/types/feed";
import { UserPostsResponse } from "@/lib/types/data";

interface UserProfileQueryResponse {
  status: "success" | "pending" | "error",
  userProfile?: User,
  error?: Error,
};

interface UserPostsQueryResponse {
  status: "success" | "pending" | "error",
  userPosts?: UserPostsResponse,
  error?: Error
}

export function useUserProfile(user_id: string, options?: { enabled?: boolean }): UserProfileQueryResponse {

  // TANSTACK QUERY format that
  const { status, data, error } = useQuery({
    queryKey: profileKeys.user(user_id),
    // NOTE: USEFUL INFO FOR future reference
    // You have to use an arrow function with getUser because getUser has a return value.
    // So you aren't assigning queryFn to the function you're assigning it to the return value.
    queryFn: () => getUser(user_id)
  });

  return {
    status: status,
    error: error || undefined,
    userProfile: data?.data
  }
}



export function useUserPosts(user_id: string): UserPostsQueryResponse {
  const { status, data, error } = useQuery({
    queryKey: profileKeys.posts(user_id),
    queryFn: async () => getUserPosts({ user_id: user_id })
  });

  return {
    status: status,
    userPosts: data?.data,
    error: error || undefined,
  }


}
