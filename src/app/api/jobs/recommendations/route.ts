import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Job } from "@/lib/types/data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || null;
    const location = searchParams.get("location")?.trim() || null;
    const job_type = searchParams.get("job_type") || null;
    const work_mode = searchParams.get("work_mode") || null;

    const supabase = await createClient();
    const {data: { user }} = await supabase.auth.getUser();

    if(!user){
        return NextResponse.json<ApiResponse<null>>(
            { 
                success: false, 
                error: "Unauthorized"
            },
            { status: 401 }
        );
    }

    const { data, error } = await supabase.rpc('get_recommended_jobs', {
        p_user_id: user.id,
        p_search: search,
        p_location: location,
        p_job_type: job_type,
        p_work_mode: work_mode,
    });

    if(error){
        return NextResponse.json<ApiResponse<null>>(
            { 
                success: false, 
                error: error.message 
            }
        )
    }

    return NextResponse.json<ApiResponse<Job[]>>(
        { 
            success: true,
            data: data ?? []
        }
    )
}