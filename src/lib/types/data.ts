// Core post type - aligned with current database schema
export interface Post {
  postID: string;
  userID: string;
  text: string;
  created_at: string;
  category: string;
  like_amount: number;
}

// Extended post with optional user information (for future expansion)
export interface PostWithAuthor extends Post {
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Response wrapper for consistent API responses
export interface DataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Input types for our actions
export interface GetPostByIdInput {
  postID: string;
}
