import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { TrendingJobTag } from "@/lib/types/data";
import { DEFAULT_TRENDING_JOB_TAGS_LIMIT } from "@/lib/constants/job";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? String(DEFAULT_TRENDING_JOB_TAGS_LIMIT));

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("job_tag_trends")
        .select("tag_id, job_count, tags(name)")
        .gt("job_count", 0)
        .order("job_count", { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: error.message },
            { status: 500 }
        );
    }

    const trending: TrendingJobTag[] = (data ?? []).map((row: any) => ({
        tag_id: row.tag_id,
        name: row.tags?.name ?? "",
        job_count: row.job_count,
    }));

    return NextResponse.json<ApiResponse<TrendingJobTag[]>>(
        { success: true, data: trending }
    );
}
