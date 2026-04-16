import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse, Product } from "@/lib/types/api";

// this api is used to get any user's products using their user id 
export async function GET(
    request: Request,
    { params } : { params: Promise<{ userId: string }>}
) {
    const { userId } = await params;
    const supabase = await createClient();

    const { data: userProductData, error: userProductLinkError } = await supabase
        .from("user_products")
        .select("product_id")
        .eq("user_id", userId);

    if (userProductLinkError) {
        return NextResponse.json(
            { 
                success: false, 
                error: userProductLinkError.message 
            }, { status: 500 }
        );
    }

    // extracting product_id from each row in useProductData to get a plain array of ids
    const userProductIds = (userProductData ?? []).map((row) => row.product_id);

    // .in filters results based on if a column's value matches any item in the userProductIds array
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("product_id", userProductIds);

    if (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error.message 
            }, { status: 500 }
        );
    }

    return NextResponse.json<{success: boolean; data: Product[]}>(
        { 
            success: true, 
            data: data ?? [] 
        }
    );
}