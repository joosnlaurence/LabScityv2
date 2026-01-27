import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/home-feed";
import type { FeedPostItem } from "@/lib/types/feed";

export const metadata: Metadata = {
	title: "Home | LabScity",
	description: "Discover research updates from the LabScity community.",
};

export default async function HomePage() {
	// TODO: Replace with server action + TanStack Query hydration.
	const initialPosts: FeedPostItem[] = [
		{
			id: "p1",
			userName: "Name",
			scientificField: "Research Interests / Subject of Post",
			content: "Lorem ipsum...",
			timeAgo: "5 HR AGO",
			mediaLabel: "Picture/\nAttachment\nPreview",
		},
		{
			id: "p2",
			userName: "Name",
			scientificField: "Research Interests",
			content: "Comment 1",
			timeAgo: "2 HR AGO",
		},
	];

	return <HomeFeed initialPosts={initialPosts} />;
}
