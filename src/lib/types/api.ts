
// both data and error are optional since a success response won't have an error and a failure response doesn't have data
export interface ApiResponse<T> {
    success: boolean;
    data?: T; // this is a generic type that gets filled in when you use it
    error?: string;
}

export interface Product {
    product_id: number;
    title: string;
    short_summary: string;
    website_link: string | null
    publication_id: number | null;
}

