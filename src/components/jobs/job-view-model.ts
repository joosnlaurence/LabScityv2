import type { Job as DbJob } from "@/lib/types/data";

export interface JobViewModel {
  id: string;
  numericId: number;
  posterId: string;
  title: string;
  org: string;
  dept: string;
  location: string;
  type: string;
  posted: string;
  remote: "On-site" | "Hybrid" | "Remote";
  description: string;
  summary: string | null;
  applyUrl: string | null;
}

function formatTimeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function toRemoteLabel(
  workMode: DbJob["work_mode"],
): "On-site" | "Hybrid" | "Remote" {
  if (workMode === "remote") return "Remote";
  if (workMode === "hybrid") return "Hybrid";
  return "On-site";
}

export function toJobViewModel(job: DbJob): JobViewModel {
  return {
    id: String(job.id),
    numericId: job.id,
    posterId: job.poster_id,
    title: job.title,
    org: job.organization?.trim() || "Organization not specified",
    dept: job.department?.trim() || "Department not specified",
    location: job.location?.trim() || "Location not specified",
    type: job.academia_role ?? job.job_type ?? "General",
    posted: formatTimeAgo(job.created_at),
    remote: toRemoteLabel(job.work_mode),
    description: job.description,
    summary: job.summary,
    applyUrl: job.application_link,
  };
}
