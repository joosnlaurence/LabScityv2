import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Product } from "@/lib/types/data";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/constants/product";
import { InfiniteProducts } from "@/lib/types/products";

const PAGE_SIZE = 10;

const PRODUCT_SELECT =
  "*, product_tags(tag_id, name, tags(id, name)), product_images(image_path, width, height)";

type ProductRow = Product & {
  created_at: string;
  user_id: string;
  product_tags: {
    tag_id: number | null;
    name: string | null;
    tags: { id: number; name: string } | null;
  }[];
  product_images: { image_path: string; width: number; height: number }[];
};

function decodeCursor(raw: string | null) {
  try {
    return raw ?
      JSON.parse(atob(raw)) as { sort_date: string | null, product_id: number }
      : null;
  } catch {
    return null;
  }
}

function mapProductRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  { is_featured, product_tags, product_images, ...prod }: ProductRow,
) {
  return {
    ...prod,
    is_featured,
    tags: product_tags.map((pt) => ({
      id: pt.tag_id, 
      name: pt.name ?? pt.tags?.name ?? "",
    })),
    images: product_images?.map((pi) => ({
      image_path: pi.image_path,   // add this
      url: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(pi.image_path).data.publicUrl,
      width: pi.width,
      height: pi.height
    })) ?? []
  };
}


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
    .select(PRODUCT_SELECT)
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
      `sort_date.${op}.${cursor.sort_date},and(sort_date.eq.${cursor.sort_date},product_id.${op}.${cursor.product_id})`
    );
  }

  const { data, error } = await query
    .order("sort_date", { ascending: !descending, nullsFirst: false })
    .order("product_id", { ascending: !descending })
    .limit(PAGE_SIZE + 1)
    .returns<ProductRow[]>();

  if (error) return NextResponse.json<ApiResponse<Product[]>>(
    {
      success: false,
      error: error.message
    }, { status: 500 }
  );

  const products = data.map((row) => mapProductRow(supabase, row));

  const hasMore = products.length > PAGE_SIZE;
  let page = hasMore ? products.slice(0, PAGE_SIZE) : products;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last
    ? { sort_date: last.sort_date, product_id: last.product_id }
    : null;

  let featuredProducts = []; 
  if (!cursor && !hasFilters) {
    const { data: featuredData, error: featuredError } = await supabase
      .from("user_products_full")
      .select(PRODUCT_SELECT)
      .eq("user_id", userId)
      .eq("is_featured", true)
      .order("sort_date", { ascending: !descending, nullsFirst: false })
      .order("product_id", { ascending: !descending })
      .returns<ProductRow[]>();
    
    if(featuredError){
      return NextResponse.json<ApiResponse<Product[]>>({
        success: false,
        error: featuredError.message
      }, {status: 500});
    }

    featuredProducts = featuredData.map((row) => mapProductRow(supabase, row));

    page = featuredProducts.concat(page);
  }

  let savedIds = new Set<number>();
  if(page.length > 0) {
    const { data: savedRows, error: savedError } = await supabase
      .from("saved_products")
      .select("product_id")
      .eq("profile_user_id", userId)
      .in("product_id", page.map(product => product.product_id));
    
    if (savedError) {
      return NextResponse.json<ApiResponse<Product[]>>(
        { success: false, error: savedError.message },
        { status: 500 },
      );
    }

    savedIds = new Set((savedRows ?? []).map((r) => r.product_id));
  }

  page = page.map(product => ({
    ...product,
    isSaved: savedIds.has(product.product_id)
  }));

  return NextResponse.json<ApiResponse<InfiniteProducts>>({ 
    success: true, 
    data: {
      products: page,
      nextCursor
    }
  });
}