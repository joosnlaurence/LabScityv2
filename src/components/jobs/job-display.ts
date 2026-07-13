export const JOB_TYPE_OPTIONS = [
  { value: "postdoc", label: "Postdoc" },
  { value: "faculty", label: "Faculty" },
  { value: "phd", label: "PhD" },
  { value: "grad_student", label: "Grad Student" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
] as const;

export const WORK_MODE_OPTIONS = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export function formatJobTypeLabel(value: string | null | undefined) {
  return (
    JOB_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    "General"
  );
}

export function formatWorkModeLabel(value: string | null | undefined) {
  return (
    WORK_MODE_OPTIONS.find((option) => option.value === value)?.label ??
    "On-site"
  );
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getJobPreviewHtml(
  summary: string | null | undefined,
  description: string | null | undefined,
) {
  const trimmedSummary = summary?.trim();

  if (trimmedSummary) {
    return `<p>${escapeHtml(trimmedSummary)}</p>`;
  }

  return description?.trim() || "<p></p>";
}
