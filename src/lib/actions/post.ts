"use server";

import { z } from "zod";
import type { GetFeedResult } from "@/lib/types/feed";
import {
	createCommentSchema,
	createPostSchema,
	createReportSchema,
	feedFilterSchema,
	type CreateCommentValues,
	type CreatePostValues,
	type CreateReportValues,
	type FeedFilterValues,
} from "@/lib/validations/post";
import { createClient } from "@/supabase/server";

const idSchema = z.string().min(1, "ID is required");

export async function createPost(input: CreatePostValues) {
	try {
		// Re-validate on server
		const parsed = createPostSchema.parse(input);

		// Get authenticated user
		const supabase = await createClient();
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Insert post into database
		const { data, error } = await supabase
			.from("Posts")
			.insert({
				user_id: authData.user.id,
				category: parsed.scientificField,
				text: parsed.content,
			})
			.select()
			.single();

		if (error) {
			return { success: false, error: error.message };
		}

		return {
			success: true,
			data: { id: data.post_id, ...parsed },
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

		// Stub return; TODO: replace with DB query and map rows to FeedPostItem[]
		const data: GetFeedResult = {
			posts: [],
			nextCursor: null,
		};
		return { success: true, data };
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

export async function createComment(postId: string, values: CreateCommentValues) {
	try {
		idSchema.parse(postId);
		createCommentSchema.parse(values);

		// TODO: Get authenticated user
		// TODO: Insert comment into database

		return { success: true, data: { id: "stub-comment" } };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to create comment" };
	}
}

export async function createReport(
	postId: string,
	commentId: string | null,
	values: CreateReportValues,
) {
	try {
		idSchema.parse(postId);
		if (commentId != null) idSchema.parse(commentId);
		createReportSchema.parse(values);

		// TODO: Get authenticated user
		// TODO: Insert report into database (postId, commentId, type, reason)

		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to submit report" };
	}
}

export async function likePost(postId: string) {
	try {
		idSchema.parse(postId);

		// TODO: Get authenticated user
		// TODO: Toggle like in database

		return { success: true, data: { isLiked: true } };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to update like" };
	}
}

export async function likeComment(postId: string, commentId: string) {
	try {
		idSchema.parse(postId);
		idSchema.parse(commentId);

		// TODO: Get authenticated user
		// TODO: Toggle comment like in database

		return { success: true, data: { isLiked: true } };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to update like" };
	}
}
