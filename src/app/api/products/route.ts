import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Product } from "@/lib/types/data";

// GET /api/products?userId={userId}
// returns all products that belong to the specified user 
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
        .from("user_products")
        .select("created_at, products(*, product_tags(tags(name)), product_images(image_path, width, height))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .returns<
        { created_at: string;
          products: Product & { 
            product_tags: { tags: { name: string } }[],
            product_images: { image_path: string; width: number; height: number }[]
          } 
        }[]>();

    if (error) return NextResponse.json<ApiResponse<Product[]>>(
        { 
            success: false, 
            error: error.message 
        }, { status: 500 }
    );

    return NextResponse.json<ApiResponse<Product[]>>(
        { 
            success: true, 
            data: data.map((row) => {
              const { product_tags, product_images, ...product } = row.products;
              return {
                ...product,
                topics: product_tags?.map((pt) => pt.tags.name) ?? [],
                images: product_images?.map((pi) => ({
                  path: pi.image_path,
                  width: pi.width,
                  height: pi.height
                })) ?? []
              }  
            })
        }
    );
}