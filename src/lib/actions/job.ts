"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
    createJobSchema,
    updateJobSchema,
    type CreateJobValues,
    type UpdateJobValues,
} from "@/lib/validations/job";

import type { DataResponse, Job } from "@/lib/types/data";

export async function createJob(
    input: CreateJobValues
): Promise<DataResponse<Job>> {
    try {
        const parsed = createJobSchema.parse(input);
        const supabase = await createClient();

        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user){
            return { success: false, error: "Authentication required"}
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
            .single()

            if(jobError){
                return {
                    success: false,
                    error: jobError.message
                }
            }

            return {
                success: true,
                data: job,
            }
     
    } catch (error) {
        if(error instanceof z.ZodError){
            return {
                success: false,
                error: error.issues[0]?.message ?? "Validation failed",
            }
        }
        return {success: false, error: "Failed to create job"};
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