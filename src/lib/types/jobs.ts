import z from "zod";
import { jobFiltersSchema } from "../validations/job";

export const ACADEMIC_ROLES = ["postdoc", "faculty", "phd", "grad_student"] as const;
export const EMPLOYMENT_TYPES = ["full-time", "part-time", "internship", "contract"] as const;
export const JOB_TYPES = [...ACADEMIC_ROLES, ...EMPLOYMENT_TYPES] as const;
export const WORK_MODES = ["on-site", "hybrid", "remote"] as const;

export type JobType = (typeof JOB_TYPES)[number];
export type WorkMode = (typeof WORK_MODES)[number];
export type JobFilters = z.infer<typeof jobFiltersSchema>;

export function isAcademicRole(value: string): value is JobType {
  return (ACADEMIC_ROLES as readonly string[]).includes(value);
}