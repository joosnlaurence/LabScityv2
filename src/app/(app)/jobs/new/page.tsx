import type { Metadata } from "next";
import { JobComposerPage } from "@/components/jobs/job-composer-page";
import { addJobSkill, addJobTag, createJob } from "@/lib/actions/job";

export const metadata: Metadata = {
  title: "Post a Job | LabScity",
  description: "Share a research opportunity with the LabScity community.",
};

export default function NewJobRoutePage() {
  return (
    <JobComposerPage
      createJobAction={createJob}
      addJobTagAction={addJobTag}
      addJobSkillAction={addJobSkill}
    />
  );
}
