import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Job } from "@/lib/types/data";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const job_type = searchParams.get('job_type')
    const work_mode = searchParams.get('work_mode')
    const academia_role = searchParams.get('academia_role')
    const location = searchParams.get('location')
    const department = searchParams.get('department')
    const organization = searchParams.get('organization')

    const supabase = await createClient()

    let query = supabase
        .from('jobs')
        .select('*')
        .order(
            'id', { 
                ascending: false 
            }
        )
        .limit(limit)
        
    // frontend client keeps track of the id and sends it with the next request
    // this gets the query less than the cursor
    if (cursor){
        query = query.lt('id', cursor)
    } 
    if (job_type){
        query = query.eq('job_type', job_type)
    } 
    if(work_mode) {
        query = query.eq('work_mode', work_mode)
    }
    
    if (location) {
        query = query.ilike('location', `%${location}%`)
    } 
    if (department) {
        query = query.ilike('department', `%${department}%`)
    }
    if (organization){
        query = query.ilike('organization', `%${organization}%`)
    }
    if (academia_role){
        query = query.eq('academia_role', academia_role)
    }
        


    const { data, error } = await query
    if (error) return NextResponse.json<ApiResponse<null>>(
        { 
            success: false, 
            error: error.message 
        }
    )

    return NextResponse.json<ApiResponse<Job[]>>(
        { 
            success: true, 
            data: data ?? [] 
        }
    )
}