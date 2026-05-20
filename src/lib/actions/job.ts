"use server";

import { z } from "zod";
import { createClient } from "@/supabase/server";
import {
    createJobSchema,
    type CreateJobValues,
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
            return { success: false, error: "Authenication required"}
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