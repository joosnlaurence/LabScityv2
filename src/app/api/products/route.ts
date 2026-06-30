import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Product } from "@/lib/types/data";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/constants/product";
import { InfiniteProducts } from "@/lib/types/products";

const PAGE_SIZE = 10;

function decodeCursor(raw: string | null) {
  try {
    return raw ?
      JSON.parse(atob(raw)) as { created_at: string, product_id: number }
      : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/products?userId=...&cursorCreatedAt=...&cursorProductId=...
 * Returns the next 10 publications for a user after the specified cursor
 * query params = userId 
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const search = searchParams.get('search');
  const tagId = searchParams.get('tagId');
  const type = searchParams.get('type');
  const sort = searchParams.get('sort');

  const cursor = decodeCursor(searchParams.get('cursor'));

  if (!userId) return NextResponse.json<ApiResponse<Product[]>>(
    {
      success: false, error: "userId required"
    }, { status: 400 }
  );

  const supabase = await createClient();

  const hasFilters = !!(search || tagId || type);
  const descending = sort !== 'oldest';

  let tagProductIds: number[] | null = null;
  if (tagId) {
    const { data: tagRows, error: tagErr } = await supabase
      .from("product_tags")
      .select("product_id")
      .eq("tag_id", Number(tagId));

    if (tagErr) {
      return NextResponse.json<ApiResponse<Product[]>>({
        success: false,
        error: tagErr.message
      }, { status: 500 });
    }
    tagProductIds = (tagRows ?? []).map((r) => r.product_id);
  }

  let query = supabase
    .from("user_products_full")
    .select("*, product_tags(tags(name)), product_images(image_path, width, height)")
    .eq("user_id", userId);

  if (!hasFilters) {
    query = query.eq("is_featured", false);
  }

  if (search) query = query.ilike("title", `%${search}%`);
  if (type) query = query.eq("product_type", type);
  if (tagProductIds) query = query.in("product_id", tagProductIds);

  if (cursor) {
    const op = descending ? 'lt' : 'gt';
    query = query.or(
      `created_at.${op}.${cursor.created_at},and(created_at.eq.${cursor.created_at},product_id.${op}.${cursor.product_id})`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: !descending, nullsFirst: false })
    .order("product_id", { ascending: !descending })
    .limit(PAGE_SIZE + 1)
    .returns<(Product & {
      created_at: string;
      user_id: string;
      product_tags: { tags: { name: string } }[];
      product_images: { image_path: string; width: number; height: number }[]
    })[]>();

  if (error) return NextResponse.json<ApiResponse<Product[]>>(
    {
      success: false,
      error: error.message
    }, { status: 500 }
  );

  const products = data.map(
    ({ is_featured, product_tags, product_images, ...prod }) => ({
      ...prod,
      is_featured,
      topics: product_tags.map((pt) => pt.tags.name),
      images: product_images?.map((pi) => ({
        url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(pi.image_path).data.publicUrl,
        width: pi.width,
        height: pi.height
      })) ?? []
    })
  );

  const hasMore = products.length > PAGE_SIZE;
  let page = hasMore ? products.slice(0, PAGE_SIZE) : products;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last
    ? { created_at: last.created_at, product_id: last.product_id }
    : null;

  let featuredProducts = []; 
  if (!cursor && !hasFilters) {
    const { data: featuredData, error: featuredError } = await supabase
      .from("user_products_full")
      .select("*, product_tags(tags(name)), product_images(image_path, width, height)")
      .eq("user_id", userId)
      .eq("is_featured", true)
      .order("created_at", { ascending: !descending })
      .order("product_id", { ascending: !descending })
      .returns<(Product & { 
        created_at: string;
        user_id: string;
        product_tags: { tags: { name: string } }[];
        product_images: { image_path: string; width: number; height: number }[];
      })[]>();
    
    if(featuredError){
      return NextResponse.json<ApiResponse<Product[]>>({
        success: false,
        error: featuredError.message
      }, {status: 500});
    }

    featuredProducts = featuredData.map(
      ({ is_featured, product_tags, product_images, ...prod }) => ({
        ...prod,
        is_featured: is_featured,
        topics: product_tags.map((pt) => pt.tags.name),
        images: product_images?.map((pi) => ({
          url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(pi.image_path).data.publicUrl,
          width: pi.width,
          height: pi.height
        })) ?? []
      })
    );

    page = featuredProducts.concat(page);
  }

  return NextResponse.json<ApiResponse<InfiniteProducts>>({ 
    success: true, 
    data: {
      products: page,
      nextCursor
    }
  });
}