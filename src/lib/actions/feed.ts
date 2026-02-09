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

/**
 * Insert a new post into the database with the given content and scientific field. The user must be authenticated to create a post.
 *
 * @param input - Object containing the content, scientific field, and category for the new post
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with the created post data or error message
 *
 * @example
 * ```typescript
 * const result = await createPost({ content: "This is a new post about science!", scientificField: "Biology", category: "formal" });
 * if (result.success) {
 *   console.log(result.data.id); // ID of the created post
 * }
 * */

export async function createPost(input: CreatePostValues, supabaseClient?: any) {
	try {
		// Re-validate on server
		const parsed = createPostSchema.parse(input);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Insert post into database
		const { data, error } = await supabase
			.from("Posts")
			.insert({
				user_id: authData.user.id,
				scientific_field: parsed.scientificField,
				category: parsed.category,
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

// NOTE: Do last as will call other funcs
// TODO: Dr. Sharonwski wants to have non followed user's posts to enter the feed. This is going to be difficult to test without content on the platform.
// TODO: Dependency Injection possibility here because we have two kinds of feeds
export async function getFeed(input: FeedFilterValues) {
	try {
		// Re-validate on server
		const parsed = feedFilterSchema.parse(input);

		// TODO: Get authenticated user
		// TODO: Will need to retrieve posts by some metrics
  	    // TODO: Will need to sort posts (chronological probably - with a filter on followed users posts? - then other posts?)
		// TODO: Query posts with cursor-based pagination

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
