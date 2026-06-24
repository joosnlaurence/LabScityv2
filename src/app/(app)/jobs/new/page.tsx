import type { Metadata } from "next";
import { JobComposerPage } from "@/components/jobs/job-composer-page";

export const metadata: Metadata = {
  title: "Post a Job | LabScity",
  description: "Share a research opportunity with the LabScity community.",
};

export default function NewJobRoutePage() {
  return <JobComposerPage />;
}
