"use server";

import { success, z } from "zod";
import type {
  Post,
  GetPostByIdInput,
  DataResponse,
  GetUserPostsInput,
  UserPostsResponse,
} from "@/lib/types/data";
import {
  getPostByIdInputSchema,
  getUserPostsInputSchema,
  postSchema,
} from "@/lib/validations/data";
import { createClient } from "@/supabase/server";


// Async function that runs on the server, takes a post interface object as a parameter and returns a Promise<DataResponse<Post>>
// The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value. - mdn 2026
// DataResponse is the interface created to unify all our responses.
// Post is the interface created to represent a Post from our database.
// getPostById's parameters are an input that adheres to the GetPostByIdInput interface and an optional supabaseClient. The optional client argument is an example of dependency injection, and is likely only used in testing.
export async function getPostById(input: GetPostByIdInput, supabaseClient?: any):
  Promise<DataResponse<Post>> {

  try {

    const supabase = supabaseClient || await createClient();

    const validatedInput = getPostByIdInputSchema.parse(input);

    let query = supabase.from('Posts').select(`
    post_id,
    user_id,
    created_at,
    category,
    text,
    like_amount
   `);

    query = query.eq('post_id', validatedInput.post_id);

    const { data: data, error: dbError } = await query;


    if (dbError) {
      console.error("Database error fetching post: ", dbError);
      return {
        success: false,
        error: "Failed to retrieve post",
      }
    }

    if (!data) return { success: false, error: "Nothing returned from database" };

    // NOTE: You can get a mismatch error if the returned object from supabase does not match the zod schema you have for this interaction AND/OR you have mismatched data from the parsed zod object and the defined interface
    // The fields of the Post interface that represented the optional fields of the Post table in the Postgres db had to also be set as optional. During testing I did not have that and was returning an object without one of the fields (- 1 hour)

    const validatedPost: Post = postSchema.parse(data[0]);

    return {
      success: true,
      data: validatedPost,
    }
  } catch (error) {

    console.error("Error in getPostById:", error);

    return {
      success: false,
      error: "An unexpected error occurred while retrieving post",
    };
  }
}


// NOTE: I want to be able to search all posts by certain filters (e.g. kind of science, by date created )
export async function searchPosts(query: string) { }

// NOTE: will comments be associated with posts objects in the database or held somewhere else?
// They might need to be held somewhere else so accessing them without the post can be done (i.e. moderation)
// export async function getComments() {}


export async function getUserPosts(
  input: GetUserPostsInput, supabaseClient?: any
): Promise<DataResponse<UserPostsResponse>> {
  try {
    // Step 1: Input validation using cursor-based schema
    const validatedInput = getUserPostsInputSchema.parse(input);

    // Step 2: Create Supabase client
    const supabase = supabaseClient || await createClient();

    // Step 3: Build query with explicit column selection
    let query = supabase.from("Posts").select(`
        post_id,
        user_id,
        created_at,
        category,
        text,
        like_amount
      `);

    // Step 4: Apply filters
    query = query.eq("user_id", validatedInput.userID);

    if (validatedInput.category) {
      query = query.eq("category", validatedInput.category);
    }

    // Step 5: Apply sorting based on cursor position

    // NOTE: This ternary is confusingly placed here when it's result will not be used till afterwards on line 84. AI is stupid.
    const sortOrder = validatedInput.sortOrder === "asc" ? "asc" : "desc";
    query = query.order(validatedInput.sortBy, {
      ascending: sortOrder === "asc",
    });

    // Step 6: Apply cursor-based pagination
    if (validatedInput.cursor) {
      // For descending order (newest first), cursor points to last seen timestamp
      // For ascending order (oldest first), cursor points to last seen timestamp
      const operator = sortOrder === "desc" ? "lt" : "gt";
      // NOTE: The function signatures are completely useless, .filter(sortBy is the column to use, operator is either less than or greater than, cursor is the thing being evaluated against)
      query = query.filter(
        validatedInput.sortBy,
        operator,
        validatedInput.cursor,
      );
    }

    // Step 7: Apply limit (cursor pagination doesn't need offset)
    query = query.limit(validatedInput.limit + 1); // +1 to determine if hasMore

    // Step 8: Execute query
    const { data: posts, error: dbError } = await query;

    // Step 9: Handle database errors
    if (dbError) {
      console.error("Database error fetching user posts:", dbError);
      return {
        success: false,
        error: "Failed to retrieve user posts",
      };
    }

    // Step 10: Process cursor pagination results
    // NOTE: In typescript ternary expressions can be defined over a non boolean value and will be evaluated based on whether the variable is null or not.
    // In this case posts either has returned data from the db, or it is null.
    // If it has returned it will be parsed and assigned to validatedPosts.
    const validatedPosts = posts ? postSchema.array().parse(posts) : [];

    // Determine if there are more posts
    const hasMore = validatedPosts.length > validatedInput.limit;

    // Remove the extra item used for hasMore detection
    const returnedPosts = hasMore
      ? validatedPosts.slice(0, validatedInput.limit)
      : validatedPosts;

    // Calculate next cursor from last returned post
    const nextCursor =
      returnedPosts.length > 0
        ? String(
          returnedPosts[returnedPosts.length - 1][
          validatedInput.sortBy as keyof (typeof returnedPosts)[0]
          ],
        )
        : undefined;

    // For backward navigation, you might want prev cursor from first item
    const prevCursor =
      returnedPosts.length > 0
        ? String(
          returnedPosts[0][
          validatedInput.sortBy as keyof (typeof returnedPosts)[0]
          ],
        )
        : undefined;

    return {
      success: true,
      data: {
        posts: returnedPosts,
        pagination: {
          limit: validatedInput.limit,
          hasMore,
          nextCursor: nextCursor,
          prevCursor: validatedInput.cursor ? prevCursor : undefined,
        },
      },
    };
  } catch (error) {
    // Step 11: Comprehensive error handling
    console.error("Error in getUserPosts:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid input: ${error.issues[0]?.message || "Validation failed"}`,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while retrieving user posts",
    };
  }
}

// NOTE: Do last as will call other funcs
// TODO: Dr. Sharonwski wants to have non followed user's posts to enter the feed. This is going to be difficult to test without content on the platform.
// TODO: Dependency Injection possibility here because we have two kinds of feeds
export async function getFeedPosts() {
  // TODO: Will need to retrieve posts by some metrics
  // TODO: Will need to sort posts (chronological probably - with a filter on followed users posts? - then other posts?)
}
