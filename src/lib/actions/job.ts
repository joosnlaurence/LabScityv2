"use server";

import { z } from "zod";
import type {
  DataResponse,
  Job,
  JobResearchFit,
  JobSkill,
  JobTag,
} from "@/lib/types/data";
import {
  type CreateJobValues,
  createJobSchema,
  type UpdateJobValues,
  updateJobSchema,
} from "@/lib/validations/job";
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
    const { data: authData } = await supabase.auth.getUser();
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
      data: data
        ? ({
            ...(data as Job),
            isSaved: authData.user
              ? await isJobSaved(supabase, jobId, authData.user.id)
              : false,
            ...(await getJobResearchFit(supabase, jobId)),
          } as Job)
        : null,
    };
  } catch {
    return { success: false, error: "Failed to fetch job" };
  }
}

async function getJobResearchFit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: number,
): Promise<JobResearchFit> {
  const emptyFit: JobResearchFit = {
    required_research_areas: [],
    recommended_research_areas: [],
    required_skills: [],
    recommended_skills: [],
  };

  const [
    { data: tagRows, error: tagRowsError },
    { data: skillRows, error: skillRowsError },
  ] = await Promise.all([
    supabase
      .from("jobs_tags")
      .select("tag_id, is_required")
      .eq("job_id", jobId),
    supabase
      .from("jobs_skills")
      .select("skill_id, is_required")
      .eq("job_id", jobId),
  ]);

  if (tagRowsError || skillRowsError) {
    return emptyFit;
  }

  const tagIds = [...new Set((tagRows ?? []).map((row) => row.tag_id))];
  const skillIds = [...new Set((skillRows ?? []).map((row) => row.skill_id))];

  const [{ data: tags }, { data: skills }] = await Promise.all([
    tagIds.length > 0
      ? supabase.from("tags").select("id, name").in("id", tagIds)
      : Promise.resolve({ data: [] }),
    skillIds.length > 0
      ? supabase.from("skills").select("id, name").in("id", skillIds)
      : Promise.resolve({ data: [] }),
  ]);

  const tagNames = new Map(
    (tags ?? []).map((tag) => [Number(tag.id), tag.name]),
  );
  const skillNames = new Map(
    (skills ?? []).map((skill) => [Number(skill.id), skill.name]),
  );

  return {
    required_research_areas: (tagRows ?? [])
      .filter((row) => row.is_required)
      .map((row) => tagNames.get(Number(row.tag_id)))
      .filter((name): name is string => Boolean(name)),
    recommended_research_areas: (tagRows ?? [])
      .filter((row) => !row.is_required)
      .map((row) => tagNames.get(Number(row.tag_id)))
      .filter((name): name is string => Boolean(name)),
    required_skills: (skillRows ?? [])
      .filter((row) => row.is_required)
      .map((row) => skillNames.get(Number(row.skill_id)))
      .filter((name): name is string => Boolean(name)),
    recommended_skills: (skillRows ?? [])
      .filter((row) => !row.is_required)
      .map((row) => skillNames.get(Number(row.skill_id)))
      .filter((name): name is string => Boolean(name)),
  };
}

async function isJobSaved(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: number,
  userId: string,
) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("profile_user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
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
        contact_email: parsed.contact_email ?? null,
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
  input: UpdateJobValues,
): Promise<DataResponse<Job>> {
  try {
    const parsed = updateJobSchema.parse(input);
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    const { data: existingJob, error: ownershipError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .eq("poster_id", authData.user.id)
      .maybeSingle();

    if (ownershipError) {
      return {
        success: false,
        error: ownershipError.message,
      };
    }

    if (!existingJob) {
      return {
        success: false,
        error: "Job not found or unauthorized",
      };
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
        contact_email: parsed.contact_email,
      }).filter(([, value]) => value !== undefined),
    );

    const { data: job, error: updateError } = await supabase
      .from("jobs")
      .update(updateJobData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return {
      success: false,
      error: "Failed to update the job",
    };
  }
}

export async function deleteJob(
  id: number,
): Promise<DataResponse<{ id: number }>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    const { data: existingJob, error: ownerShipError } = await supabase
      .from("jobs")
      .select("id")
      .eq("poster_id", authData.user.id)
      .eq("id", id)
      .maybeSingle();

    if (ownerShipError) {
      return {
        success: false,
        error: ownerShipError.message,
      };
    }

    if (!existingJob) {
      return {
        success: false,
        error: "Job not found or unauthorized",
      };
    }

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
      data: {
        id: id,
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to delete job",
    };
  }
}

async function verifyJobOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  job_id: number,
  user_id: string,
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
      error: error.message,
    };
  }
  if (!data) {
    return {
      exists: false,
      error: "Job not found or unauthorized",
    };
  }
  return {
    exists: true,
  };
}

export async function addJobTag(
  job_id: number,
  tag_id: number,
  is_required: boolean,
): Promise<DataResponse<JobTag>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(job_id) || job_id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    if (!Number.isInteger(tag_id) || tag_id <= 0) {
      return {
        success: false,
        error: "Invalid tag id",
      };
    }

    const ownership = await verifyJobOwnership(
      supabase,
      job_id,
      authData.user.id,
    );

    if (!ownership.exists) {
      return {
        success: false,
        error: ownership.error,
      };
    }

    const { error } = await supabase
      .from("jobs_tags")
      .insert({ job_id, tag_id, is_required });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: { job_id, tag_id, is_required },
    };
  } catch {
    return {
      success: false,
      error: "Failed to add job tag",
    };
  }
}

export async function removeJobTag(
  job_id: number,
  tag_id: number,
): Promise<DataResponse<JobTag>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(job_id) || job_id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    if (!Number.isInteger(tag_id) || tag_id <= 0) {
      return {
        success: false,
        error: "Invalid tag id",
      };
    }

    const ownership = await verifyJobOwnership(
      supabase,
      job_id,
      authData.user.id,
    );

    if (!ownership.exists) {
      return {
        success: false,
        error: ownership.error,
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
        error: error.message,
      };
    }

    return {
      success: true,
      data: { job_id, tag_id, is_required: false },
    };
  } catch {
    return {
      success: false,
      error: "Failed to remove job tag",
    };
  }
}

export async function addJobSkill(
  job_id: number,
  skill_id: number,
  is_required: boolean,
): Promise<DataResponse<JobSkill>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(job_id) || job_id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    if (!Number.isInteger(skill_id) || skill_id <= 0) {
      return {
        success: false,
        error: "Invalid skill id",
      };
    }

    const ownership = await verifyJobOwnership(
      supabase,
      job_id,
      authData.user.id,
    );

    if (!ownership.exists) {
      return {
        success: false,
        error: ownership.error,
      };
    }

    const { error } = await supabase
      .from("jobs_skills")
      .insert({ job_id, skill_id, is_required });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: { job_id, skill_id, is_required },
    };
  } catch {
    return {
      success: false,
      error: "Failed to add job skill",
    };
  }
}

export async function removeJobSkill(
  job_id: number,
  skill_id: number,
): Promise<DataResponse<JobSkill>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    if (!Number.isInteger(job_id) || job_id <= 0) {
      return {
        success: false,
        error: "Invalid job id",
      };
    }

    if (!Number.isInteger(skill_id) || skill_id <= 0) {
      return {
        success: false,
        error: "Invalid skill id",
      };
    }

    const ownership = await verifyJobOwnership(
      supabase,
      job_id,
      authData.user.id,
    );

    if (!ownership.exists) {
      return {
        success: false,
        error: ownership.error,
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
        error: error.message,
      };
    }

    return {
      success: true,
      data: { job_id, skill_id, is_required: false },
    };
  } catch {
    return {
      success: false,
      error: "Failed to remove job skill",
    };
  }
}
