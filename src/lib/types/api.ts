
// both data and error are optional since a success response won't have an error and a failure response doesn't have data
export interface ApiResponse<T> {
    success: boolean;
    data?: T; // this is a generic type that gets filled in when you use it
    error?: string;
}

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