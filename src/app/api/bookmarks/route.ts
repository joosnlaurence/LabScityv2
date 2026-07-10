import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { FeedPostItem } from "@/lib/types/feed";
import type {
  SavedItemsData, SavedJob, SavedProduct, SavedPublication,
} from "@/lib/types/bookmarks";
import { formatFeedPost } from "@/lib/utils/feed";
import { Publication } from "@/lib/types/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "userId required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const [publications, products, posts, jobs] = await Promise.all([
    supabase
      .from("saved_publications")
      .select("publication_id, created_at, publications(*, publication_tags(tags(name)))")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<{ 
        publication_id: number; 
        created_at: string; 
        publications: Publication & { publication_tags: { tags: { name: string } }[] }
      }[]>(),
    supabase
      .from("saved_products")
      .select("product_id, created_at, products(*)")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<SavedProduct[]>(),
    supabase
      .from("saved_posts")
      .select(
        `
        post_id,
        created_at,
        posts!inner (
          post_id, created_at, category, text, like_amount, scientific_field,
          user_id, media_path, media_width, media_height,
          users:user_id(user_id, first_name, last_name, profile_pic_path),
          likes(user_id),
          saved_posts(profile_user_id)
        )
      `,
      )
      .eq("profile_user_id", userId)
      .eq("posts.taken_down", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_jobs")
      .select("jobs_id, created_at, jobs(*)")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<SavedJob[]>(),
  ]);

  const err = [publications, products, posts, jobs].find((r) => r.error)?.error;
  if (err) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: err.message },
      { status: 500 },
    );
  }

  const formattedPosts: FeedPostItem[] = (posts.data ?? []).map((row) =>
    formatFeedPost(supabase, row.posts, [], authData.user?.id ?? null),
  );

  return NextResponse.json<ApiResponse<SavedItemsData>>({
    success: true,
    data: {
      publications: (publications.data ?? []).map((row) => {
        const { publication_tags, ...pub } = row.publications;
        return {
          ...row,
          publications: {
            ...pub,
            topics: (publication_tags ?? []).map((pt: any) => pt.tags.name),
            isSaved: true,
          },
        };
      }),
      products: products.data ?? [],
      posts: formattedPosts,
      jobs: jobs.data ?? [],
    },
  });
}