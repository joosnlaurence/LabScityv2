import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Job } from "@/lib/types/data";

export async function GET() {
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
        p_user_id: user.id
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