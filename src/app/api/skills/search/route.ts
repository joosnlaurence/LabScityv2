import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { InfiniteScrollResponse } from "@/lib/types/api";

const SKILLS_PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? String(SKILLS_PAGE_SIZE));
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .ilike("name", `%${q ?? ""}%`)
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json<InfiniteScrollResponse<{ id: number; name: string }[]>>(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json<InfiniteScrollResponse<{ id: number; name: string }[]>>({
    success: true,
    data: data ?? [],
    hasMore: (data ?? []).length === limit,
  });
}