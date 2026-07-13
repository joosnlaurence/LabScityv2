import type { Metadata } from "next";
import { JobsPage } from "@/components/jobs/jobs-page";
import { createClient } from "@/supabase/server";

export const metadata: Metadata = {
  title: "Jobs | LabScity",
  description: "Discover research, academic, and industry opportunities.",
};

export default async function JobsRoutePage() {
  return (
    <JobsPage />
  );
}
