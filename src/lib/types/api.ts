
// both data and error are optional since a success response won't have an error and a failure response doesn't have data
export type ApiResponse<T> =
  | { success: true; data: T}
  | { success: false; error: string};
export interface InfiniteScrollResponse<T> {
  success: boolean;
  data?: T;
  error?: string,
  hasMore?: boolean;
}

export interface ProductImageUploadData {
  bucket: string, // the product_images storage bucket
  path: string, // file path within the bucket
  token: string; // signed upload token from Supabase
  maxBytes: number;
}
