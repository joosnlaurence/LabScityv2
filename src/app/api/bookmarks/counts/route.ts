import { ApiResponse } from "@/lib/types/api";
import type { BookmarkCounts } from "@/lib/types/bookmarks";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "userId required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const [publications, products, posts, jobs] = await Promise.all([
    supabase
      .from("saved_publications")
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", userId),
    supabase
      .from("saved_products")
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", userId),
    supabase
      .from("saved_posts")
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", userId),
    supabase
      .from("saved_jobs")
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", userId),
  ]);

  const firstError = [publications, products, posts, jobs].find((r) => r.error)?.error;
  if (firstError) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: firstError.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<BookmarkCounts>>({
    success: true,
    data: {
      publications: publications.count ?? 0,
      products: products.count ?? 0,
      posts: posts.count ?? 0,
      jobs: jobs.count ?? 0,
    },
  });
}