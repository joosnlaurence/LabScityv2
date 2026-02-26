"use client";

import { Paper, Text, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { getTrendingScientificFields } from "@/lib/actions/feed";
import classes from "./trending-widget.module.css";

interface TrendingWidgetProps {
	hashtags?: string[];
}

export function TrendingWidget({ hashtags: initialHashtags }: TrendingWidgetProps) {
	const [hashtags, setHashtags] = useState<string[]>(initialHashtags || []);
	const [isLoading, setIsLoading] = useState(!initialHashtags);

	useEffect(() => {
		if (initialHashtags) return; // Use provided hashtags if available

		const fetchTrendingFields = async () => {
			try {
				const result = await getTrendingScientificFields();
				if (result.success && result.data) {
					setHashtags(result.data.hashtags);
				} else {
					// Fallback if fetch fails
					setHashtags(Array(5).fill("#FeedMeMorePosts"));
				}
			} catch {
				// Fallback if fetch fails
				setHashtags(Array(5).fill("#FeedMeMorePosts"));
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrendingFields();
	}, [initialHashtags]);

	return (
		<Paper
			bg="gray.0"
			p="md"
			radius="lg"
			className={classes.card}
		>
			<Stack gap="md">
				<Text
					c="navy.7"
					fw={600}
					className={classes.trendingTitle}
				>
					Trending
				</Text>
				<Stack gap="xs">
					{isLoading ? (
						<Text c="navy.7" size="sm">Loading...</Text>
					) : (
						hashtags.map((hashtag, index) => (
							<Text
								key={index}
								c="navy.7"
								fw={600}
								className={classes.hashtag}
							>
								{hashtag}
							</Text>
						))
					)}
				</Stack>
			</Stack>
		</Paper>
	);
}
