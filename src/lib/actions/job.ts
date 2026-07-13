"use server";

import { z } from "zod";
import type { DataResponse, Job, JobSkill, JobTag } from "@/lib/types/data";
import { type CreateJobValues, UpdateJobValues, createJobSchema, updateJobSchema } from "@/lib/validations/job";
import { createClient } from "@/supabase/server";

export async function listJobs(): Promise<DataResponse<Job[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data ?? []) as Job[],
    };
  } catch {
    return { success: false, error: "Failed to fetch jobs" };
  }
}

export async function getJobById(
  jobId: number,
): Promise<DataResponse<Job | null>> {
  try {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      return { success: false, error: "Invalid job id" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data as Job | null) ?? null,
    };
  } catch {
    return { success: false, error: "Failed to fetch job" };
  }
}

export async function createJob(
  input: CreateJobValues,
): Promise<DataResponse<Job>> {
  try {
    const parsed = createJobSchema.parse(input);
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        title: parsed.title,
        description: parsed.description,
        poster_id: authData.user.id,
        summary: parsed.summary ?? null,
        location: parsed.location ?? null,
        department: parsed.department ?? null,
        organization: parsed.organization ?? null,
        work_mode: parsed.work_mode ?? null,
        job_type: parsed.job_type ?? null,
        academia_role: parsed.academia_role ?? null,
        application_link: parsed.application_link ?? null,
      })
      .select()
      .single();

    if (jobError) {
      return {
        success: false,
        error: jobError.message,
      };
    }

    return {
      success: true,
      data: job as Job,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to create job" };
  }
}

export async function updateJob(
    id: number,
    input: UpdateJobValues
): Promise<DataResponse<Job>> {
    try {
        const parsed = updateJobSchema.parse(input);
        const supabase = await createClient();

        const { data: authData } = await supabase.auth.getUser()

        if(!authData.user){
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        if(!Number.isInteger(id) || id <=0 ){
            return {
                success: false,
                error: 'Invalid job id',
            }
        }

        const { data: existingJob, error: ownershipError} = await supabase
            .from("jobs")
            .select("id")
            .eq("id", id)
            .eq("poster_id", authData.user.id)
            .maybeSingle()

            if(ownershipError){
                return {
                    success: false,
                    error: ownershipError.message
                }
            }

            if(!existingJob){
                return {
                    success: false,
                    error: "Job not found or unauthorized"
                }
            }

            const updateJobData = Object.fromEntries(
                Object.entries({
                    title: parsed.title,
                    description: parsed.description,
                    summary: parsed.summary,
                    location: parsed.location, 
                    department: parsed.department,
                    organization: parsed.organization,
                    work_mode: parsed.work_mode,
                    job_type: parsed.job_type,
                    academia_role: parsed.academia_role,
                    application_link: parsed.application_link,
                }).filter(([, value]) => value !== undefined)
            )

            const { data: job, error: updateError } = await supabase
                .from("jobs")
                .update(updateJobData)
                .eq("id", id)
                .select()
                .single();

            

            if(updateError){
                return {
                    success: false,
                    error: updateError.message
                }
            }

            return {
                success: true,
                data: job,
            }

    } catch (error) {
        if( error instanceof z.ZodError){
            return {
                success: false,
                error: error.issues[0]?.message ?? "Validation failed"
            };
        }
        return {
            success: false,
            error: "Failed to update the job"
        }
    }
}

export async function deleteJob(
    id: number
): Promise<DataResponse<{id: number}>> {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if(!authData.user){
            return {
                success: false,
                error: "Authentication required"
            };
        }

        if(!Number.isInteger(id) || id <= 0){
            return {
                success: false,
                error: "Invalid job id"
            }
        }

        const { data: existingJob, error: ownerShipError } = await supabase
            .from("jobs")
            .select("id")
            .eq("poster_id", authData.user.id)
            .eq("id", id)
            .maybeSingle();

        if (ownerShipError){
            return {
                success: false,
                error: ownerShipError.message,
            }
        }

        if(!existingJob){
            return {
                success: false,
                error: "Job not found or unauthorized"
            };
        }

        const { error: deleteError } = await supabase
            .from("jobs")
            .delete()
            .eq("id", id);

        if(deleteError){
            return {
                success: false,
                error: deleteError.message,
            }
        }

        return {
            success: true,
            data: { 
                id: id,
            }
        }

    } catch (error){
        return {
            success: false,
            error: "Failed to delete job"
        }
    }
}

async function verifyJobOwnership(
    supabase: Awaited<ReturnType<typeof createClient>>,
    job_id: number,
    user_id: string
): Promise<{ exists: boolean; error?: string }> {
    const { data, error } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", job_id)
        .eq("poster_id", user_id)
        .maybeSingle();

    if (error) {
        return { 
            exists: false, 
            error: error.message 
        };
    }
    if (!data) {
        return { 
            exists: false, 
            error: "Job not found or unauthorized" 
        };
    }
    return { 
        exists: true 
    };
}

export async function addJobTag(
    job_id: number,
    tag_id: number,
    is_required: boolean
): Promise<DataResponse<JobTag>> {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return { 
                success: false, 
                error: "Authentication required" 
            };
        }

        if (!Number.isInteger(job_id) || job_id <= 0) {
            return { 
                success: false, 
                error: "Invalid job id" 
            };
        }

        if (!Number.isInteger(tag_id) || tag_id <= 0) {
            return { 
                success: false, 
                error: "Invalid tag id" 
            };
        }

        const ownership = await verifyJobOwnership(supabase, job_id, authData.user.id);

        if (!ownership.exists) {
            return { 
                success: false, 
                error: ownership.error 
            };
        }

        const { error } = await supabase
            .from("jobs_tags")
            .insert({ job_id, tag_id, is_required });

        if (error) {
            return { 
                success: false, 
                error: error.message 
            };
        }

        return { 
            success: true, 
            data: { job_id, tag_id, is_required } 
        };
    } catch {
        return { 
            success: false, 
            error: "Failed to add job tag" 
        };
    }
}

export async function removeJobTag(
    job_id: number,
    tag_id: number
): Promise<DataResponse<JobTag>> {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return { 
                success: false, 
                error: "Authentication required" 
            };
        }

        if (!Number.isInteger(job_id) || job_id <= 0) {
            return { 
                success: false, 
                error: "Invalid job id" 
            };
        }

        if (!Number.isInteger(tag_id) || tag_id <= 0) {
            return { 
                success: false, 
                error: "Invalid tag id" 
            };
        }

        const ownership = await verifyJobOwnership(supabase, job_id, authData.user.id);

        if (!ownership.exists) {
            return { 
                success: false, 
                error: ownership.error 
            };
        }

        const { error } = await supabase
            .from("jobs_tags")
            .delete()
            .eq("job_id", job_id)
            .eq("tag_id", tag_id);

        if (error) {
            return { 
                success: false, 
                error: error.message 
            };
        }

        return { 
            success: true, 
            data: { job_id, tag_id, is_required: false } 
        };
    } catch {
        return { 
            success: false, 
            error: "Failed to remove job tag" 
        };
    }
}

export async function addJobSkill(
    job_id: number,
    skill_id: number,
    is_required: boolean
): Promise<DataResponse<JobSkill>> {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return { 
                success: false, 
                error: "Authentication required" 
            };
        }

        if (!Number.isInteger(job_id) || job_id <= 0) {
            return { 
                success: false, 
                error: "Invalid job id" 
            };
        }

        if (!Number.isInteger(skill_id) || skill_id <= 0) {
            return { 
                success: false, 
                error: "Invalid skill id" 
            };
        }

        const ownership = await verifyJobOwnership(supabase, job_id, authData.user.id);

        if (!ownership.exists) {
            return { 
                success: false, 
                error: ownership.error 
            };
        }

        const { error } = await supabase
            .from("jobs_skills")
            .insert({ job_id, skill_id, is_required });

        if (error) {
            return { 
                success: false, 
                error: error.message 
            };
        }

        return { 
            success: true, 
            data: { job_id, skill_id, is_required } 
        };
    } catch {
        return { 
            success: false, 
            error: "Failed to add job skill" 
        };
    }
}

export async function removeJobSkill(
    job_id: number,
    skill_id: number
): Promise<DataResponse<JobSkill>> {
    try {
        const supabase = await createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
            return { 
                success: false, 
                error: "Authentication required" 
            };
        }

        if (!Number.isInteger(job_id) || job_id <= 0) {
            return { 
                success: false, 
                error: "Invalid job id" 
            };
        }

        if (!Number.isInteger(skill_id) || skill_id <= 0) {
            return { 
                success: false, 
                error: "Invalid skill id" 
            };
        }

        const ownership = await verifyJobOwnership(supabase, job_id, authData.user.id);

        if (!ownership.exists) {
            return { 
                success: false, 
                error: ownership.error 
            };
        }

        const { error } = await supabase
            .from("jobs_skills")
            .delete()
            .eq("job_id", job_id)
            .eq("skill_id", skill_id);

        if (error) {
            return { 
                success: false, 
                error: error.message 
            };
        }

        return { 
            success: true, 
            data: { job_id, skill_id, is_required: false } 
        };
    } catch {
        return { 
            success: false, 
            error: "Failed to remove job skill" 
        };
    }
}
