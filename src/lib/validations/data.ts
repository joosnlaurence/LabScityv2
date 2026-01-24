import { z } from "zod";

// Schema for validating post ID input
export const getPostByIdSchema = z.object({
  postID: z
    .string()
    .min(1, "Post ID is required")
    .uuid("Invalid post ID format"),
});

// Schema for validating post data from database
export const postSchema = z.object({
  postID: z.string().uuid(),
  userID: z.string().uuid(),
  text: z
    .string()
    .min(1, "Post text is required")
    .max(5000, "Post text too long"),
  created_at: z.string(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category too long"),
  like_amount: z.number().min(0, "Like amount cannot be negative"),
});

// Export inferred types for convenience
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type PostData = z.infer<typeof postSchema>;
