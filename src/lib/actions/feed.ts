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

/**
 * Delete a post from the database. The user must be authenticated and must be the owner of the post.
 *
 * @param postId - The ID of the post to delete
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with success status or error message
 *
 * @example
 * ```typescript
 * const result = await deletePost("123");
 * if (result.success) {
 *   console.log("Post deleted successfully");
 * }
 * ```
 */
export async function deletePost(postId: string, supabaseClient?: any) {
	try {
		// Validate post ID
		idSchema.parse(postId);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Delete post from database (only if user owns it)
		const { error } = await supabase
			.from("Posts")
			.delete()
			.eq("post_id", postId)
			.eq("user_id", authData.user.id);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true, data: { id: postId } };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to delete post" };
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

		return { success: true, data: { id: data.comment_id, ...parsed } };
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

/**
 * Delete a comment from the database. The user must be authenticated and must be the owner of the comment.
 *
 * @param commentId - The ID of the comment to delete
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with success status or error message
 *
 * @example
 * ```typescript
 * const result = await deleteComment("456");
 * if (result.success) {
 *   console.log("Comment deleted successfully");
 * }
 * ```
 */
export async function deleteComment(commentId: string, supabaseClient?: any) {
	try {
		// Validate comment ID
		idSchema.parse(commentId);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Delete comment from database (only if user owns it)
		const { error } = await supabase
			.from("Comment")
			.delete()
			.eq("comment_id", commentId)
			.eq("user_id", authData.user.id);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true, data: { id: commentId } };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message ?? "Validation failed",
			};
		}
		return { success: false, error: "Failed to delete comment" };
	}
}

/**
 * Create a report for a post or comment. The user must be authenticated to submit a report.
 * The reported user is determined based on whether a comment is being reported or the post itself.
 *
 * @param postId - The ID of the post being reported
 * @param commentId - The ID of the comment being reported (null if reporting the post)
 * @param values - Object containing the report type and reason
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with success status or error message
 *
 * @example
 * ```typescript
 * const result = await createReport("123", null, { type: "Spam/Scam", reason: "This is spam" });
 * if (result.success) {
 *   console.log("Report submitted successfully");
 * }
 * ```
 */
export async function createReport(
	postId: string,
	commentId: string | null,
	values: CreateReportValues,
	supabaseClient?: any,
) {
	try {
		idSchema.parse(postId);
		if (commentId != null) idSchema.parse(commentId);
		const parsed = createReportSchema.parse(values);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		let reportedUserId: string;

		if (commentId != null) {
			// Report is for a comment - get the comment creator's user_id
			const { data: commentData, error: commentError } = await supabase
				.from("Comment")
				.select("user_id")
				.eq("comment_id", commentId)
				.single();

			if (commentError || !commentData) {
				return { success: false, error: "Comment not found" };
			}

			reportedUserId = commentData.user_id;
		} else {
			// Report is for a post - get the post creator's user_id
			const { data: postData, error: postError } = await supabase
				.from("Posts")
				.select("user_id")
				.eq("post_id", postId)
				.single();

			if (postError || !postData) {
				return { success: false, error: "Post not found" };
			}

			reportedUserId = postData.user_id;
		}

		// Insert report into database
		const { error } = await supabase
			.from("FeedReport")
			.insert({
				reporter_id: authData.user.id,
				reported_id: reportedUserId,
				post_id: postId,
				comment_id: commentId,
				type: parsed.type,
				additional_context: parsed.reason,
			});

		if (error) {
			return { success: false, error: error.message };
		}

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


/**
 * Toggle like status for a comment. If the user has already liked the comment, it will be unliked. If not liked, it will be liked.
 * The user must be authenticated to like/unlike a comment.
 *
 * @param commentId - The ID of the comment to like/unlike
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with isLiked status (true if liked, false if unliked) or error message
 *
 * @example
 * ```typescript
 * const result = await likeComment("456");
 * if (result.success) {
 *   console.log(result.data.isLiked); // true if comment was liked, false if unliked
 * }
 * ```
 */
export async function likeComment(commentId: string, supabaseClient?: any) {
	try {
		idSchema.parse(commentId);

		// Get authenticated user
		const supabase = supabaseClient ?? (await createClient());
		const { data: authData } = await supabase.auth.getUser();
		
		if (!authData.user) {
			return { success: false, error: "Authentication required" };
		}

		// Check if like already exists
		const { data: existingLike } = await supabase
			.from("Comment_likes")
			.select()
			.eq("comment_id", commentId)
			.eq("user_id", authData.user.id)
			.maybeSingle();

		if (existingLike) {
			// Unlike: Remove like and decrement like_count
			const { error: deleteError } = await supabase
				.from("Comment_likes")
				.delete()
				.eq("comment_id", commentId)
				.eq("user_id", authData.user.id);

			if (deleteError) {
				return { success: false, error: deleteError.message };
			}

			// Decrement like_count on the comment
			const { error: updateError } = await supabase.rpc("decrement_comment_like_count", {
				comment_id_param: commentId,
			});

			if (updateError) {
				return { success: false, error: updateError.message };
			}

			return { success: true, data: { isLiked: false } };
		} else {
			// Like: Insert like and increment like_count
			const { error: insertError } = await supabase
				.from("Comment_likes")
				.insert({
					comment_id: commentId,
					user_id: authData.user.id,
				});

			if (insertError) {
				return { success: false, error: insertError.message };
			}

			// Increment like_count on the comment
			const { error: updateError } = await supabase.rpc("increment_comment_like_count", {
				comment_id_param: commentId,
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
