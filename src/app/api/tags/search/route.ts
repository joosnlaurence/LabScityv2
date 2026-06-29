import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { InfiniteScrollResponse } from "@/lib/types/api";
import type { TagSearchResult  } from "@/lib/types/data";
import { TAGS_PAGE_SIZE } from "@/lib/constants/product";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") ?? String(TAGS_PAGE_SIZE)); // how many rows to return per page
    const offset = parseInt(searchParams.get("offset") ?? "0"); // how many rows to skip

    // Commented out, because empty search queries should really be something the client
    // handles
    // if(!q) {
    //     return NextResponse.json<InfiniteScrollResponse<TagSearchResult[]>>(
    //         { 
    //             success: false,
    //             error: 'Please include a query'
    //         }, {
    //             status: 400
    //         }
    //     )
    // };

    const supabase = await createClient();

    // ilike for case insensitive partial match
    const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .eq("level", 3)
        .ilike("name", `%${q ?? ""}%`)
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1); // offset = rows to skip, start point
                                            // limit = how many rows to return per page (default is 10)

    if (error) {
        return NextResponse.json<InfiniteScrollResponse<TagSearchResult[]>>(
            {
                success: false, 
                error: error.message,
            }, {
                status: 500
            }
        );
    }

    return NextResponse.json<InfiniteScrollResponse<TagSearchResult[]>>(
        {
            success: true,
            data: data ?? [],
            hasMore: (data ?? []).length === limit
        }
    )
}