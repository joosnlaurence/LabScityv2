import { z } from "zod";
import { WORK_MODE_VALUES, JOB_TYPE_VALUES, ACADEMIA_ROLE_VALUES  } from "../constants/job";
import { JOB_TYPES, WORK_MODES } from "../types/jobs";

// id, title, description, summary, location, 
// department, organization, work_mode, job_type, academia_role, application_link, 
export const createJobSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Title is required" })
        .max(120, {
            message: "Title must not exceed 120 characters"}),
    description: z
        .string()
        .min(1, {
            message: "A description is required "}),
    summary: z
        .string()
        .optional(),
    location: z
        .string()
        .optional(),
    department: z
        .string()
        .optional(),
    organization: z
        .string()
        .optional(),
    work_mode: z
        .enum(WORK_MODE_VALUES)
        .optional(),
    job_type: z
        .enum(JOB_TYPE_VALUES)
        .optional(),
    academia_role: z
        .enum(ACADEMIA_ROLE_VALUES)
        .optional(),
    application_link: z
        .string()
        .optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobFiltersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  job_type: z.enum(JOB_TYPES).optional(),
  work_mode: z.enum(WORK_MODES).optional(),
  location: z.string().trim().min(1).optional(),
});

export type CreateJobValues = z.infer<typeof createJobSchema>;
export type UpdateJobValues = z.infer<typeof updateJobSchema>;
