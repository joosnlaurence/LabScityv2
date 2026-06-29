import { ApiResponse } from "@/lib/types/api";
import { ProductFacets } from "@/lib/types/products";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) { 
    return NextResponse.json<ApiResponse<ProductFacets>>(
      { success: false, error: "userId required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_product_facets', { p_user_id: userId });
  
  if(error) {
    return NextResponse.json<ApiResponse<ProductFacets>>({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json<ApiResponse<ProductFacets>>({
    success: true,
    data: data as ProductFacets
  });
}