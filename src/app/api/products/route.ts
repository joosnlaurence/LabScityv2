import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse, Product } from "@/lib/types/api";

// this api is used to get your own products to put them on your profile
export async function GET() {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return NextResponse.json<ApiResponse<Product[]>>(
            { success: false, error: "Authentication required" },
            { status: 401 }
        );
    }

    const { data: userProductData, error: userProductLinkError } = await supabase
        .from("user_products")
        .select("product_id")
        .eq("user_id", authData.user.id);

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