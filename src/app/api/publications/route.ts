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
        .select(`
          user_id,
          is_featured,
          publications (
            publication_id,
            title,
            doi,
            journal,
            date_published,
            authors,
            preview_path,
            is_oa,
            pdf_url,
            type,
            publication_tags (
              tags (
                name
              )
            )
          )
        `, { count: 'exact' })
        .eq("user_id", userId)
        .order("is_featured", { ascending: false })
        .returns<{
          user_id: string;
          is_featured: boolean;
          publications: (Publication & {
            publication_tags: { tags: { name: string } | null }[];
          }) | null;
        }[]>();

    if (error) return NextResponse.json<ApiResponse<Publication[]>>(
        { 
            success: false, 
            error: error.message 
        }, { status: 500 }
    );
    
    return NextResponse.json<ApiResponse<Publication[]>>(
        { 
            success: true, 
            data: (data ?? [])
              .filter((row) => row.publications !== null)
              .map(({ is_featured, publications }) => ({
                ...publications!,
                is_featured,
                topics: (publications?.publication_tags ?? [])
                  .map((pt) => pt.tags?.name)
                  .filter((name): name is string => Boolean(name)),
              }))
        }
    );
}
