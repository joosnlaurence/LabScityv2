import { useQuery } from "@tanstack/react-query";
import { getUser, getUserPosts } from "@/lib/actions/data";
import { profileKeys } from "@/lib/query-keys";
import { User } from "@/lib/types/feed";
import { DataResponse } from "@/lib/types/data";

// FIXME: I would like to have the status of the query be reflected on the frontend, but currently
// the LS* components take in data as parameters. I should figure out the best way to fix.
// OPTION 1: return the the LSProfileHero component from this file
// OPTION 2: see if I can pass the status information out of the function and conditionally render the hero?
export function useUserProfile(user_id: string, options?: { enabled?: boolean }): DataResponse<User> {


  // TANSTACK QUERY format that
  const { isSuccess, data, error } = useQuery({
    queryKey: profileKeys.user(user_id),
    // NOTE: USEFUL INFO FOR future reference
    // You have to use an arrow function with getUser because getUser has a return value.
    // So you aren't assigning queryFn to the function you're assigning it to the return value.
    queryFn: () => getUser(user_id)
  });

  // THIS is one of the possible forms of a useQuery
  if (error) {
    console.log
    return {
      success: false,
      error: error.message
    }
  }
  if (isSuccess) {
    return data
  }

  return {
    success: false,
    error: `Error in useUserProfile`
  }

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
