import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailsPage } from "@/components/jobs/job-details-page";
import { toJobViewModel } from "@/components/jobs/job-view-model";
import { getJobById, listJobs } from "@/lib/actions/job";

interface JobDetailsRouteProps {
  params: Promise<{ job_id: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailsRouteProps): Promise<Metadata> {
  const { job_id } = await params;
  const numericJobId = Number(job_id);
  const result = await getJobById(numericJobId);
  const job =
    result.success && result.data ? toJobViewModel(result.data) : null;

  return {
    title: `${job?.title ?? "Job"} | LabScity`,
    description: job?.description ?? "Research job details on LabScity.",
  };
}

export default async function JobDetailsRoutePage({
  params,
}: JobDetailsRouteProps) {
  const { job_id } = await params;
  const numericJobId = Number(job_id);

  if (!Number.isInteger(numericJobId) || numericJobId <= 0) {
    notFound();
  }

  const [jobResult, jobsResult] = await Promise.all([
    getJobById(numericJobId),
    listJobs(),
  ]);

  if (!jobResult.success || !jobResult.data) {
    notFound();
  }

  const job = toJobViewModel(jobResult.data);
  const similarJobs =
    jobsResult.success && jobsResult.data
      ? jobsResult.data
          .filter((item) => item.id !== numericJobId)
          .slice(0, 3)
          .map(toJobViewModel)
      : [];

  return <JobDetailsPage job={job} similarJobs={similarJobs} />;
}
