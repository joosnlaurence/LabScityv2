import type { Metadata } from "next";
import { toJobViewModel } from "@/components/jobs/job-view-model";
import { JobsPage } from "@/components/jobs/jobs-page";
import { listJobs } from "@/lib/actions/job";
import { createClient } from "@/supabase/server";

export const metadata: Metadata = {
  title: "Jobs | LabScity",
  description: "Discover research, academic, and industry opportunities.",
};

export default async function JobsRoutePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await listJobs();

  return (
    <JobsPage
      jobs={
        result.success && result.data ? result.data.map(toJobViewModel) : []
      }
      currentUserId={user?.id ?? null}
      loadError={
        result.success ? null : (result.error ?? "Failed to load jobs")
      }
    />
  );
}
