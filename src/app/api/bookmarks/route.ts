import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { FeedPostItem } from "@/lib/types/feed";
import type {
  SavedItemsData, SavedJob,
  SavedProduct,
  SavedPublication,
} from "@/lib/types/bookmarks";
import { formatFeedPost } from "@/lib/utils/feed";
import { Job, Product, Publication } from "@/lib/types/data";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/constants/product";

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

  const [pubRows, productRows, postRows, jobRows] = await Promise.all([
    supabase
      .from("saved_publications")
      .select("publication_id, created_at, publications(*, publication_tags(tag_id, name, tags(id, name)))")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<{ 
        publication_id: number; 
        created_at: string; 
        publications: Publication & { publication_tags: { tag_id: number, name: string, tags: { id: number, name: string } }[] }
      }[]>(),
    supabase
      .from("saved_products")
      .select("product_id, created_at, products(*, product_tags(tag_id, name, tags(id, name)), product_images(image_path, width, height))")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<{ 
        product_id: number; 
        created_at: string; 
        products: Product & 
          { product_tags: { tag_id: number | null; name: string | null; tags: { id: number; name: string } | null }[] } & 
          { product_images: { image_path: string; width: number; height: number }[] }
      }[]>(),
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
      .select("job_id, created_at, jobs(*)")
      .eq("profile_user_id", userId)
      .order("created_at", { ascending: false })
      .returns<{
        job_id: number;
        created_at: string;
        // jobs: Job
        jobs: Job & 
          { jobs_tags: { tags: { name: string } } } &
          { jobs_skills: { skills: { name: string } } }
      }[]>(),
  ]);

  const err = [pubRows, productRows, postRows, jobRows].find((r) => r.error)?.error;
  if (err) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: err.message },
      { status: 500 },
    );
  }

  const formattedPosts: FeedPostItem[] = (postRows.data ?? []).map((row) =>
    formatFeedPost(supabase, row.posts, [], authData.user?.id ?? null),
  );

  const publications: SavedPublication[] = (pubRows.data ?? []).map((row) => {
    const { publication_tags, ...pub } = row.publications;
    return {
      ...row,
      publications: {
        ...pub,
        tags: (publication_tags ?? []).map((pt) => ({
          id: pt.tag_id,
          name: pt.name ?? pt.tags?.name ?? "",
        })),
        isSaved: true,
      },
    };
  })

  const products: SavedProduct[] = (productRows.data ?? []).map((row) => {
    const { product_tags, product_images, ...product } = row.products;
    return {
      ...row,
      products: {
        ...product,
        tags: (product_tags ?? []).map((pt) => ({
          id: pt.tag_id,
          name: pt.name ?? pt.tags?.name ?? "",
        })),
        isSaved: true,
        images: product_images?.map((pi) => ({
          image_path: pi.image_path,
          url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(pi.image_path).data.publicUrl,
          width: pi.width,
          height: pi.height
        })) ?? []
      },
    };
  })

  // TODO: Add topics to jobs once those are wired up properly
  const jobs: SavedJob[] = (jobRows.data ?? []).map((row) => {
    // const { job_tags, ...job } = row.jobs;
    const { ...job } = row.jobs;
    return {
      ...row,
      jobs: {
        ...job,
        // topics: (job_tags ?? []).map((pt: any) => pt.topics.name),
        isSaved: true,
      },
    };
  })

  return NextResponse.json<ApiResponse<SavedItemsData>>({
    success: true,
    data: {
      publications: publications,
      products: products,
      posts: formattedPosts,
      jobs: jobs,
    },
  });
}