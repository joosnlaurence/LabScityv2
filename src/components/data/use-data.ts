import { useQuery } from "@tanstack/react-query";
import {
  getUser,
} from "@/lib/actions/data";
import { profileKeys } from "@/lib/query-keys";

/**
 * React Query hook for fetching a user profile by ID.
 *
 * @param userId - The ID of the user to fetch
 * @returns React Query result object with user data
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useGetUser("user-123");
 * ```
 */
export function useGetUser(userId: string) {
  return useQuery({
    queryKey: profileKeys.user(userId),
    queryFn: async () => {
      const result = await getUser(userId);
      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to fetch user");
      }
      return result.data;
    },
  });
}
