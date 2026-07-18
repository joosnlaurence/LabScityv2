import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Skill } from "@/lib/validations/profile";
import { createClient } from "@/supabase/server";

const SKILLS_SEARCH_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  const parsed = parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 1), 50)
    : SKILLS_SEARCH_SIZE;

  const supabase = await createClient();

  if (q.length < 1) {
    const { data, error } = await supabase
      .from("skills")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json<ApiResponse<Skill[]>>(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Skill[]>>({
      success: true,
      data: data ?? [],
    });
  }

  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .ilike("name", `%${q}%`)
    .limit(limit * 3);

  if (error) {
    return NextResponse.json<ApiResponse<Skill[]>>(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  const t = q.toLowerCase();
  const rank = (name: string) => {
    const s = name.toLowerCase();
    if (s === t) return 0;
    if (s.startsWith(t)) return 1;
    return 2;
  };

  const ranked = (data ?? [])
    .sort(
      (a, b) => rank(a.name) - rank(b.name) || a.name.length - b.name.length,
    )
    .slice(0, limit);

  return NextResponse.json<ApiResponse<Skill[]>>({
    success: true,
    data: ranked,
  });
}
