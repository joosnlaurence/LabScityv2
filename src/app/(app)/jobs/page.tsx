import type { Metadata } from "next";
import { JobsPage } from "@/components/jobs/jobs-page";

export const metadata: Metadata = {
  title: "Jobs | LabScity",
  description: "Discover research, academic, and industry opportunities.",
};

export default function JobsRoutePage() {
  return <JobsPage />;
}
