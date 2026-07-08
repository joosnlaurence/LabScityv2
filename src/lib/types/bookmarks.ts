import { Job, Product, Publication } from "./data";
import { FeedPostItem } from "./feed";

export type BookmarkCategory = "posts" | "publications" | "products" | "jobs";

export type SavedPublication = { publication_id: string; created_at: string; publications: Publication };
export type SavedProduct = { product_id: string; created_at: string; products: Product };
export type SavedPost = { post_id: string; created_at: string; posts: FeedPostItem };
export type SavedJob = { jobs_id: string; created_at: string; jobs: Job };

export type SavedItemsData = {
  publications: SavedPublication[];
  products: SavedProduct[];
  posts: FeedPostItem[];
  jobs: SavedJob[];
};

export type BookmarkCounts = {
  publications: number;
  products: number;
  posts: number;
  jobs: number;
};

export type PostAuthor = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type SavedPostRow = {
  post_id: string;
  created_at: string;
  posts: {
    post_id: string;
    user_id: string;
    text: string | null;
    scientific_field: string | null;
    category: string | null;
    created_at: string;
    media_url: string | null;
    media_width: number | null;
    media_height: number | null;
    like_amount: number | null;
    isLiked: boolean | null;
    author: PostAuthor | null;
    comments: [];
  };
};