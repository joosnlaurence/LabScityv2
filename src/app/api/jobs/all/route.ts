import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/lib/types/api";
import type { Job } from "@/lib/types/data";
import { DEFAULT_JOBS_PAGE_SIZE } from "@/lib/constants/job";
import { isAcademicRole, JOB_TYPES } from "@/lib/types/jobs";

export async function GET(request: Request){
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') ?? String(DEFAULT_JOBS_PAGE_SIZE), 10)
    const search = searchParams.get("search")?.trim() || null;
    const job_type = searchParams.get('job_type')
    const work_mode = searchParams.get('work_mode')
    const academia_role = searchParams.get('academia_role')
    const location = searchParams.get('location')
    const department = searchParams.get('department')
    const organization = searchParams.get('organization')

    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
    // frontend client keeps track of the id and sends it with the next request
    // this gets the query less than the cursor
    if (cursor && Number.isInteger(Number(cursor))){
        query = query.lt('id', cursor)
    } 
    if (search) {
      const safeSearch = search.replace(/[,()]/g, " ").replace(/[%_\\]/g, (c) => `\\${c}`).trim();
      if (safeSearch) {
        query = query.or(
          `title.ilike.%${safeSearch}%,organization.ilike.%${safeSearch}%,department.ilike.%${safeSearch}%`,
        );
      }
    } 
    if (job_type && (JOB_TYPES as readonly string[]).includes(job_type)) {
      query = isAcademicRole(job_type)
        ? query.eq("academia_role", job_type)
        : query.eq("job_type", job_type);
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

    const { data: jobs, error } = await query.returns<Job[]>();

    if (error) return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message },
        { status: 500 }
    )

    let savedIds = new Set<number>();
    if(userId && (jobs?.length ?? 0) > 0) {
      const { data: savedRows, error: savedError } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("profile_user_id", userId)
        .in("job_id", jobs.map(job => job.id ?? -1));
      
      if (savedError) {
        return NextResponse.json<ApiResponse<Job[]>>(
          { success: false, error: savedError.message },
          { status: 500 },
        );
      }
  
      savedIds = new Set((savedRows ?? []).map((r) => r.job_id));
    }
  
    const savedJobs = jobs.map(job => ({
      ...job,
      isSaved: savedIds.has(job.id)
    }));

    return NextResponse.json<ApiResponse<Job[]>>(
        { success: true, data: savedJobs ?? [] }
    )
}
