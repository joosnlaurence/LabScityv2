import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { TagSearchResult  } from "@/lib/types/data";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if(!q) {
        return NextResponse.json<ApiResponse<TagSearchResult[]>>(
            { 
                success: false,
                error: 'Please include a query'
            }, {
                status: 400
            }
        )
    };

    const supabase = await createClient();

    // ilike for case insensitive partial match
    const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .eq("level", 3)
        .ilike("name", `%${q}%`)
        .limit(10);

    if (error) {
        return NextResponse.json<ApiResponse<TagSearchResult[]>>(
            {
                success: false, 
                error: error.message,
            }, {
                status: 500
            }
        );
    }

    return NextResponse.json<ApiResponse<TagSearchResult[]>>(
        {
            success: true,
            data: data ?? []
        }
    )
}