import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Publication } from "@/lib/types/data";

// GET /api/publications?userId={userId}
// returns all publications that belong to the specified user 
// query params = userId
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json<ApiResponse<Publication[]>>(
        { 
            success: false, error: "userId required" 
        }, { status: 400 }
    );

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_publications")
        .select("publications(*)")
        .eq("user_id", userId)
        .returns<{ publications: Publication }[]>();

    if (error) return NextResponse.json<ApiResponse<Publication[]>>(
        { 
            success: false, 
            error: error.message 
        }, { status: 500 }
    );

    return NextResponse.json<ApiResponse<Publication[]>>(
        { 
            success: true, 
            data: data.map((row) => row.publications) 
        }
    );
}