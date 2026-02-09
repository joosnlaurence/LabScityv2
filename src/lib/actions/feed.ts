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

/**
 * Insert a new comment into the database for a specific post. The user must be authenticated to create a comment.
 *
 * @param postId - The ID of the post to comment on
 * @param values - Object containing the comment content
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with the created comment data or error message
 *
 * @example
 * ```typescript
 * const result = await createComment("123", { content: "Great post!", userName: "John" });
 * if (result.success) {
 *   console.log(result.data.id); // ID of the created comment
 * }
 * ```
 */
export async function createComment(postId: string, values: CreateCommentValues, supabaseClient?: any) {
	try {
		idSchema.parse(postId);
		const parsed = createCommentSchema.parse(values);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Insert comment into database
		const { data, error } = await supabase
			.from("Comment")
			.insert({
				post_id: postId,
				user_id: authData.user.id,
				text: parsed.content,
			})
			.select()
			.single();

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true, data: { id: data.post_id, ...parsed } };
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

/**
 * Toggle like status for a post. If the user has already liked the post, it will be unliked. If not liked, it will be liked.
 * The user must be authenticated to like/unlike a post.
 *
 * @param postId - The ID of the post to like/unlike
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with isLiked status (true if liked, false if unliked) or error message
 *
 * @example
 * ```typescript
 * const result = await likePost("123");
 * if (result.success) {
 *   console.log(result.data.isLiked); // true if post was liked, false if unliked
 * }
 * ```
 */
export async function likePost(postId: string, supabaseClient?: any) {
	try {
		idSchema.parse(postId);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Check if like already exists
		const { data: existingLike } = await supabase
			.from("Likes")
			.select()
			.eq("post_id", postId)
			.eq("user_id", authData.user.id)
			.maybeSingle();

		if (existingLike) {
			// Unlike: Remove like and decrement like_amount
			const { error: deleteError } = await supabase
				.from("Likes")
				.delete()
				.eq("post_id", postId)
				.eq("user_id", authData.user.id);

			if (deleteError) {
				return { success: false, error: deleteError.message };
			}

			// Decrement like_amount on the post
			const { error: updateError } = await supabase.rpc("decrement_like_amount", {
				post_id_param: postId,
			});

			if (updateError) {
				return { success: false, error: updateError.message };
			}

			return { success: true, data: { isLiked: false } };
		} else {
			// Like: Insert like and increment like_amount
			const { error: insertError } = await supabase
				.from("Likes")
				.insert({
					post_id: postId,
					user_id: authData.user.id,
				});

			if (insertError) {
				return { success: false, error: insertError.message };
			}

			// Increment like_amount on the post
			const { error: updateError } = await supabase.rpc("increment_like_amount", {
				post_id_param: postId,
			});

			if (updateError) {
				return { success: false, error: updateError.message };
			}

			return { success: true, data: { isLiked: true } };
		}
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
