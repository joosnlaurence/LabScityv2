import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Publication } from "@/lib/types/data";
import { InfinitePublications } from "@/lib/types/publication";

const PAGE_SIZE = 10;

function decodeCursor(raw: string | null) {
  try {
    return raw ? 
      JSON.parse(atob(raw)) as { date_published: string | null, publication_id: number } 
      : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/publications?userId=...&cursorDatePublished=...&cursorPubId=...
 * Returns the next 15 publications for a user after the specified cursor
 * query params = userId 
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    const cursor = decodeCursor(searchParams.get('cursor'));

    if (!userId) 
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: "userId required" },
        { status: 400 }
      );

    const supabase = await createClient();

    let query = supabase
        .from("user_publications_full")
        .select("*, publication_tags(tags(name))")
        .eq("user_id", userId)
        .eq("is_featured", false);
    
    if (cursor) {
      query = query.or(
        `date_published.lt.${cursor.date_published},and(date_published.eq.${cursor.date_published},publication_id.lt.${cursor.publication_id})`
      )
    }
    
    const { data, error } = await query
      .order("date_published", { ascending: false, nullsFirst: false })
      .order("publication_id", { ascending: false })
      .limit(PAGE_SIZE + 1)
      .returns<(Publication & { 
        user_id: string;
        publication_tags: { tags: { name: string } }[]
      })[]>();

    if (error) { 
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    const pubs = data.map(
      ({ is_featured, publication_tags, ...pub }) => ({
        ...pub,
        is_featured: is_featured,
        topics: publication_tags.map((pt) => pt.tags.name)
      })
    );

    const hasMore = pubs.length > PAGE_SIZE;
    let page = hasMore ? pubs.slice(0, PAGE_SIZE) : pubs;
    const last = page[page.length - 1];
    const nextCursor = hasMore && last
      ? { date_published: last.date_published, publication_id: last.publication_id }
      : null;

    let featuredPubs = []; 
    if (!cursor) {
      const { data: featuredData, error: featuredError } = await supabase
        .from("user_publications_full")
        .select("*, publication_tags(tags(name))")
        .eq("user_id", userId)
        .eq("is_featured", true)
        .order("date_published", { ascending: false, nullsFirst: false })
        .order("publication_id", { ascending: false })
        .returns<(Publication & { 
          user_id: string;
          publication_tags: { tags: { name: string } }[]
        })[]>();
     
      if(featuredError){
        return NextResponse.json<ApiResponse<Publication[]>>({
          success: false,
          error: featuredError.message
        }, {status: 500});
      }

      featuredPubs = featuredData.map(
        ({ is_featured, publication_tags, ...pub }) => ({
          ...pub,
          is_featured: is_featured,
          topics: publication_tags.map((pt) => pt.tags.name)
        })
      );

      page = featuredPubs.concat(page);
    }
    
    return NextResponse.json<ApiResponse<InfinitePublications>>({ 
      success: true, 
      data: {
        publications: page,
        nextCursor
      }
    });
}