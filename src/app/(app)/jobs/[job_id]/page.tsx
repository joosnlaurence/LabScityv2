import type { Metadata } from "next";
import { JobDetailsPage } from "@/components/jobs/job-details-page";
import { SAMPLE_JOBS } from "@/components/jobs/jobs-data";

interface JobDetailsRouteProps {
  params: Promise<{ job_id: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailsRouteProps): Promise<Metadata> {
  const { job_id } = await params;
  const job = SAMPLE_JOBS.find((item) => item.id === job_id);

  return {
    title: `${job?.title ?? "Job"} | LabScity`,
    description: job?.description ?? "Research job details on LabScity.",
  };
}

export default async function JobDetailsRoutePage({
  params,
}: JobDetailsRouteProps) {
  const { job_id } = await params;
  return <JobDetailsPage jobId={job_id} />;
}
