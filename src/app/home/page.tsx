import {
	QueryClient,
	dehydrate,
	HydrationBoundary,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/home-feed";
import { getFeed } from "@/lib/actions/post";
import { feedKeys } from "@/lib/query-keys";
import { feedFilterSchema } from "@/lib/validations/post";

export const metadata: Metadata = {
	title: "Home | LabScity",
	description: "Discover research updates from the LabScity community.",
};

const defaultFeedFilter = feedFilterSchema.parse({});

export default async function HomePage() {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: feedKeys.list(defaultFeedFilter),
		queryFn: async () => {
			const result = await getFeed(defaultFeedFilter);
			if (!result.success || !result.data) {
				throw new Error(result.error ?? "Failed to fetch feed");
			}
			return result.data;
		},
	});

	const dehydratedState = dehydrate(queryClient);

	return (
		<HydrationBoundary state={dehydratedState}>
			<HomeFeed />
		</HydrationBoundary>
	);
}
