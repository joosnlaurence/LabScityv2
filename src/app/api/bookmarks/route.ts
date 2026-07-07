import { NextResponse } from "next/server"
import { createClient } from "@/supabase/server"
import type { ApiResponse } from "@/lib/types/api";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json<ApiResponse<null>>(
            { 
                success: false, 
                error: "userId required" 
            },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    const [publications, products, posts, jobs] = await Promise.all([
        supabase
            .from("saved_publications")
            .select("publication_id, created_at, publications(*)")
            .eq("profile_user_id", userId)
            .order("created_at", {
                ascending: false
            }),
        supabase
            .from("saved_products")
            .select("product_id, created_at, products(*)")
            .eq("profile_user_id", userId)
            .order("created_at", {
                ascending: false
            }),
        supabase
            .from("saved_posts")
            .select("post_id, created_at, posts(*)")
            .eq("profile_user_id", userId)
            .order("created_at", {
                ascending: false
            }),
        supabase
            .from("saved_jobs")
            .select("jobs_id, created_at, jobs(*)")
            .eq("profile_user_id", userId)
            .order("created_at", {
                ascending: false
            }),
    ]);

    return NextResponse.json({
        success: true,
        data: {
            publications: publications.data ?? [],
            products: products.data ?? [],
            posts: posts.data ?? [],
            jobs: jobs.data ?? []
        }
    })
}