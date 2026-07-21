
export const WORK_MODE_LABELS = {
  "on-site": "on-site",
  "remote": "remote",
  "hybrid": "hybrid",
} as const;

export const JOB_TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "internship": "Internship",
  'contract': "Contract",
} as const;

export const ACADEMIA_ROLE_LABELS = {
  "postdoc": "Postdoc",
  "faculty": "Faculty",
  "phd": "PhD",
  "grad_student": "Grad Student",
} as const;

export type WorkMode = keyof typeof WORK_MODE_LABELS;
export type JobType = keyof typeof JOB_TYPE_LABELS;
export type AcademiaRole = keyof typeof ACADEMIA_ROLE_LABELS;

export const WORK_MODE_VALUES = Object.keys(WORK_MODE_LABELS) as WorkMode[];
export const JOB_TYPE_VALUES = Object.keys(JOB_TYPE_LABELS) as JobType[];
export const ACADEMIA_ROLE_VALUES = Object.keys(ACADEMIA_ROLE_LABELS) as AcademiaRole[];


export const DEFAULT_JOBS_PAGE_SIZE = 10;

export const DEFAULT_TRENDING_JOB_TAGS_LIMIT = 6;