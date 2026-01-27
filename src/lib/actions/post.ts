"use server";

import { z } from "zod";
import {
	createPostSchema,
	feedFilterSchema,
	type CreatePostValues,
	type FeedFilterValues,
} from "@/lib/validations/post";

export async function createPost(input: CreatePostValues) {
	try {
		// Re-validate on server
		const parsed = createPostSchema.parse(input);

		// TODO: Get authenticated user

		// TODO: Insert post into database
		
		// Stub return
		return {
			success: true,
			data: { id: "stub", ...parsed },
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to create post" };
	}
}

export async function getFeed(input: FeedFilterValues) {
	try {
		// Re-validate on server
		const parsed = feedFilterSchema.parse(input);

		// TODO: Get authenticated user (optional, for non-public personalized feed)

		// TODO: Query posts with cursor-based pagination

		// Stub return
		return {
			success: true,
			data: {
				posts: [],
				nextCursor: null,
			},
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to fetch feed" };
	}
}
