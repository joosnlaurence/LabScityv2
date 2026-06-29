"use server";

import { z } from "zod";
import type { DataResponse, Job } from "@/lib/types/data";
import { type CreateJobValues, createJobSchema } from "@/lib/validations/job";
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
