import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Product } from "@/lib/types/data";

// GET /api/publications?userId={userId}
// returns all publications that belong to the specified user 
// query params = userId
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json<ApiResponse<Product[]>>(
        { 
            success: false, error: "userId required" 
        }, { status: 400 }
    );

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_products_full")
        .select(`
          is_featured,
          product_id,
          title,
          short_summary,
          contributors,
          product_type,
          links,
          created_at,
          user_id,
          product_tags (
            tags (
              name
            )
          )
        `, { count: 'exact' })
        .eq("user_id", userId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .returns<(Product & {
          created_at: string;
          user_id: string;
          product_tags: { tags: { name: string } | null }[];
        })[]>();

    if (error) return NextResponse.json<ApiResponse<Product[]>>(
        { 
            success: false, 
            error: error.message 
        }, { status: 500 }
    );
    
    return NextResponse.json<ApiResponse<Product[]>>(
        { 
            success: true, 
            data: (data ?? [])
              .filter((row) => row !== null)
              .map(({ product_tags, ...product }) => ({
                ...product,
                tags: (product_tags ?? [])
                  .map((pt) => pt.tags?.name)
                  .filter((name): name is string => Boolean(name)),
              }))
        }
    );
}