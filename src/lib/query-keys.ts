import type { FeedFilterValues } from "@/lib/validations/post";

/**
 * Query key factory for the feed.
 * Use the same keys for server prefetch and client useQuery so hydration matches.
 */
export const feedKeys = {
	all: ["feed"] as const,
	list: (filter: FeedFilterValues) => [...feedKeys.all, "list", filter] as const,
};
