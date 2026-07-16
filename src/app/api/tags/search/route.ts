import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { ApiResponse } from "@/lib/types/api";
import { Tag } from "@/lib/validations/profile";
import { TAGS_SEARCH_SIZE } from "@/lib/constants/profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const parsed = parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 50) : TAGS_SEARCH_SIZE;

  if (q.length < 2) {
    return NextResponse.json<ApiResponse<Tag[]>>({ success: true, data: [] });
  }

  const supabase = await createClient();

  const { data: titleRows } = await supabase
    .from("tags")
    .select("id, name")
    .ilike("name", `%${q}%`)
    .limit(limit);

  const title = (titleRows ?? []).sort((a, b) => {
    const rank = (n: string) => {
      const s = n.toLowerCase(), t = q.toLowerCase();
      if (s === t) return 0;
      if (s.startsWith(t)) return 1;
      return 2;
    };
    return rank(a.name) - rank(b.name) || a.name.length - b.name.length;
  });

  const seen = new Set(title.map((t) => t.id));

  let openalex: Tag[] = [];
  try {
    const url =
      `https://api.openalex.org/topics?search=${encodeURIComponent(q)}` +
      `&per_page=${limit}&select=id,display_name`;
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (res.ok) {
      const { results } = (await res.json()) as {
        results: { id: string; display_name: string }[];
      };
      const ids = results.map((t) => t.id.split("/").pop()!);

      if (ids.length) {
        const { data: oaRows } = await supabase
          .from("tags")
          .select("id, name, openalex_id")
          .in("openalex_id", ids);

        const rank = new Map(ids.map((id, i) => [id, i]));
        openalex = (oaRows ?? [])
          .filter((r) => !seen.has(r.id)) // drop anything Tier 1 already surfaced
          .sort((a, b) => rank.get(a.openalex_id)! - rank.get(b.openalex_id)!)
          .map(({ id, name }) => ({ id, name }));
      }
    }
  } catch {
  }

  const data = [...title, ...openalex].slice(0, limit);
  return NextResponse.json<ApiResponse<Tag[]>>({ success: true, data });
}