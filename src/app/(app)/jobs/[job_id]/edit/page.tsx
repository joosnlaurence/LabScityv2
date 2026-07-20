import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  JobComposerPage,
  type JobDraft,
} from "@/components/jobs/job-composer-page";
import {
  addJobSkill,
  addJobTag,
  createJob,
  getEditableJobById,
  removeJobSkill,
  removeJobTag,
  updateJob,
} from "@/lib/actions/job";

interface EditJobRouteProps {
  params: Promise<{ job_id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Job | LabScity",
  description: "Update a research opportunity on LabScity.",
};

export default async function EditJobRoutePage({
  params,
}: EditJobRouteProps) {
  const { job_id } = await params;
  const numericJobId = Number(job_id);

  if (!Number.isInteger(numericJobId) || numericJobId <= 0) {
    notFound();
  }

  const result = await getEditableJobById(numericJobId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { job, researchAreas, skills } = result.data;
  const initialDraft: JobDraft = {
    title: job.title ?? "",
    organization: job.organization ?? "",
    department: job.department ?? "",
    location: job.location ?? "",
    type: (job.academia_role ?? job.job_type ?? "postdoc") as JobDraft["type"],
    remote: job.work_mode ?? "on-site",
    contactEmail: job.contact_email ?? "",
    applyUrl: job.application_link ?? "",
    summary: job.summary ?? "",
    description: job.description ?? "",
  };

  return (
    <JobComposerPage
      mode="edit"
      jobId={numericJobId}
      initialDraft={initialDraft}
      initialResearchAreas={researchAreas}
      initialSkills={skills}
      createJobAction={createJob}
      updateJobAction={updateJob}
      addJobTagAction={addJobTag}
      removeJobTagAction={removeJobTag}
      addJobSkillAction={addJobSkill}
      removeJobSkillAction={removeJobSkill}
    />
  );
}
