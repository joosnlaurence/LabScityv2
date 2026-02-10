import { User } from '@/lib/types/feed'

/** Core post type aligned with database schema */
export interface Post {
  post_id: number;
  user_id: string;
  text?: string;
  created_at: string;
  category?: string;
  like_amount: number;
}

/** Extended post with optional author information */
export interface PostWithAuthor extends Post {
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

/** Generic wrapper for consistent API responses */
export interface DataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Input for fetching a single post by ID */
export interface GetPostByIdInput {
  post_id: number;
}

/** Response containing posts with pagination and filters */
export interface FeedResponse {
  posts: Post[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset?: number;
  };
  filters?: {
    category?: string;
    userId?: string;
  };
}

/** Input parameters for retrieving feed posts */
export interface GetFeedInput {
  limit?: number;
  offset?: number;
  category?: string;
  userId?: string;
  sortBy?: "created_at" | "like_amount";
  sortOrder?: "asc" | "desc";
}

/** Input for searching posts with filters and pagination */
export interface SearchFeedInput {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    category?: string;
    userId?: string;
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
}

/** Input for fetching user-specific posts with pagination */
export interface GetUserPostsInput {
  user_id: string;
  limit?: number;
  cursor?: string; // ISO datetime string for cursor position
  category?: string;
  sortBy?: "created_at" | "like_amount";
  sortOrder?: "asc" | "desc";
}

/** Response for user posts with cursor-based pagination */
export interface UserPostsResponse {
  posts: Post[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

/** Response for search results with optional pagination */
export interface SearchResponse {
  // TODO: Decide whether to return Posts or to return a kind of Post preview type (post_id, author, or some other identifying characteristic to show to a user?)
  posts?: Post[];
  // TODO: Same thing with Users, but User's are usually much less public facing data so it might be fine-ish to return User types.
  users?: User[];
  // TODO: Make an article interface.
  articles?: any;
  // TODO: Make a Group interface
  groups?: any;

  // FIXME: This is almost certainly not the right way to do this. I'll find out later
  sortOrder?: "user" | "post" | "article" | "group";

  pagination?: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}
