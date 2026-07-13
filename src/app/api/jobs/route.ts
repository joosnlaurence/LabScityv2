import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Job } from "@/lib/types/data";

export async function GET(request: Request){
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    // allows users to privately view their job postings
    if(!authData.user){
        return NextResponse.json<ApiResponse<Job[]>>(
            { 
                success: false, 
                error: "Authentication required"
            }, {
                status: 401
            }
        );
    }

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("poster_id", authData.user.id)
        .returns<Job[]>();

    if(error) return NextResponse.json<ApiResponse<Job[]>>(
        {
            success: false,
            error: error.message,
        }, { status: 500 }
    );

    return NextResponse.json<ApiResponse<Job[]>>(
        {
            success: true,
            data: data ?? []
        }
    )      
}