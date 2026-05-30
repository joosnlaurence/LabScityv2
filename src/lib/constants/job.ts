
export const WORK_MODE_LABELS = {
  "on-site": "on-site",
  "remote": "remote",
  "hybrid": "hybrid",
} as const;

export const JOB_TYPE_LABELS = {
  "Full-time": "Full-time",
  "Part-time": "Part-time",
  "Internship": "Internship",
  'Contract': "Contract",
} as const;

export const ACADEMIA_ROLE_LABELS = {
  "Postdoc": "Postdoc",
  "Faculty": "Faculty",
  "PhD": "PhD",
  "Grad Student": "Grad Student",
} as const;

export type WorkMode = keyof typeof WORK_MODE_LABELS;
export type JobType = keyof typeof JOB_TYPE_LABELS;
export type AcademiaRole = keyof typeof ACADEMIA_ROLE_LABELS;

export const WORK_MODE_VALUES = Object.keys(WORK_MODE_LABELS) as WorkMode[];
export const JOB_TYPE_VALUES = Object.keys(JOB_TYPE_LABELS) as JobType[];
export const ACADEMIA_ROLE_VALUES = Object.keys(ACADEMIA_ROLE_LABELS) as AcademiaRole[];
