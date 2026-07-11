import type { Metadata } from "next";
import { JobsPage } from "@/components/jobs/jobs-page";
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

  return (
    <JobsPage currentUserId={user?.id ?? null} />
  );
}
