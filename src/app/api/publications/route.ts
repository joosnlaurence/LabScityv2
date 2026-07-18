import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Publication } from "@/lib/types/data";
import { InfinitePublications } from "@/lib/types/publication";

const PAGE_SIZE = 10;

type PubRow = Publication & { user_id: string };

function decodeCursor(raw: string | null) {
  try {
    return raw
      ? JSON.parse(atob(raw)) as { date_published: string | null, publication_id: number }
      : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const search = searchParams.get('search');
  const year = searchParams.get('year');
  const tagId = searchParams.get('tagId');
  const type = searchParams.get('type');
  const sort = searchParams.get('sort');

  const cursor = decodeCursor(searchParams.get('cursor'));

  if (!userId)
    return NextResponse.json<ApiResponse<Publication[]>>(
      { success: false, error: "userId required" },
      { status: 400 },
    );

  const supabase = await createClient();

  const hasFilters = !!(search || year || tagId || type);
  const descending = sort !== 'oldest';

  let tagPubIds: number[] | null = null;
  if (tagId) {
    const { data: tagRows, error: tagErr } = await supabase
      .from("effective_publication_tags")
      .select("publication_id")
      .eq("user_id", userId)
      .eq("tag_id", Number(tagId));

    if (tagErr) {
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: tagErr.message }, { status: 500 });
    }
    tagPubIds = (tagRows ?? []).map((r) => r.publication_id);
  }

  let query = supabase
    .from("user_publications_full")
    .select("*")
    .eq("user_id", userId);

  if (!hasFilters) query = query.eq("is_featured", false);
  if (search) query = query.ilike("title", `%${search}%`);
  if (type) query = query.eq("type", type);
  if (tagPubIds) query = query.in("publication_id", tagPubIds);
  if (year && !Number.isNaN(Number(year))) {
    query = query
      .gte('date_published', `${year}-01-01`)
      .lt('date_published', `${Number(year) + 1}-01-01`);
  }

  if (cursor) {
    const op = descending ? 'lt' : 'gt';
    query = query.or(
      `date_published.${op}.${cursor.date_published},and(date_published.eq.${cursor.date_published},publication_id.${op}.${cursor.publication_id})`
    );
  }

  const { data, error } = await query
    .order("date_published", { ascending: !descending, nullsFirst: false })
    .order("publication_id", { ascending: !descending })
    .limit(PAGE_SIZE + 1)
    .returns<PubRow[]>();

  if (error)
    return NextResponse.json<ApiResponse<Publication[]>>(
      { success: false, error: error.message }, { status: 500 });

  const hasMore = data.length > PAGE_SIZE;
  let page: PubRow[] = hasMore ? data.slice(0, PAGE_SIZE) : data;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last
    ? { date_published: last.date_published, publication_id: last.publication_id }
    : null;

  if (!cursor && !hasFilters) {
    const { data: featuredData, error: featuredError } = await supabase
      .from("user_publications_full")
      .select("*")
      .eq("user_id", userId)
      .eq("is_featured", true)
      .order("date_published", { ascending: !descending, nullsFirst: false })
      .order("publication_id", { ascending: !descending })
      .returns<PubRow[]>();

    if (featuredError)
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: featuredError.message }, { status: 500 });

    page = (featuredData ?? []).concat(page);
  }

  const tagsByPub = new Map<number, { id: number | null; name: string }[]>();
  if (page.length > 0) {
    const { data: tagRows, error: tagsErr } = await supabase
      .from("effective_publication_tags")
      .select("publication_id, tag_id, name")
      .eq("user_id", userId)
      .in("publication_id", page.map((p) => p.publication_id));

    if (tagsErr)
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: tagsErr.message }, { status: 500 });

    for (const r of tagRows ?? []) {
      const arr = tagsByPub.get(r.publication_id) ?? [];
      arr.push({ id: r.tag_id, name: r.name });
      tagsByPub.set(r.publication_id, arr);
    }
  }

  let savedIds = new Set<number>();
  if (page.length > 0) {
    const { data: savedRows, error: savedError } = await supabase
      .from("saved_publications")
      .select("publication_id")
      .eq("profile_user_id", userId)
      .in("publication_id", page.map((pub) => pub.publication_id));

    if (savedError)
      return NextResponse.json<ApiResponse<Publication[]>>(
        { success: false, error: savedError.message }, { status: 500 });

    savedIds = new Set((savedRows ?? []).map((r) => r.publication_id));
  }

  const publications = page.map((pub) => ({
    ...pub,
    tags: tagsByPub.get(pub.publication_id) ?? [],
    isSaved: savedIds.has(pub.publication_id),
  }));

  return NextResponse.json<ApiResponse<InfinitePublications>>({
    success: true,
    data: { publications, nextCursor },
  });
}