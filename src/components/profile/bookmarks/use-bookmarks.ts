import { bookmarkKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/lib/types/api";
import { BookmarkCounts, SavedItemsData } from "@/lib/types/bookmarks";
import { useQuery } from "@tanstack/react-query";

export function useBookmarks(userId: string) {
  return useQuery({
    queryKey: bookmarkKeys.list(userId),
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks?userId=${userId}`);
      if(!res.ok) throw new Error("Could not fetch user's bookmarks");
      const apiResponse: ApiResponse<SavedItemsData> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    }
  })
}

export function useBookmarkCounts(userId: string) {
  return useQuery({
    queryKey: bookmarkKeys.counts(userId),
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks/counts?userId=${userId}`);
      if(!res.ok) throw new Error("Could not fetch user's bookmark counts");
      const apiResponse: ApiResponse<BookmarkCounts> = await res.json();
      if(!apiResponse.success) throw new Error(apiResponse.error);
      return apiResponse.data;
    }
  })
}