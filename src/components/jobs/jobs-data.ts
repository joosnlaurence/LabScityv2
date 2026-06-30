export interface Job {
  id: string;
  title: string;
  org: string;
  dept: string;
  location: string;
  type: string;
  posted: string;
  salary: string;
  remote: "On-site" | "Hybrid" | "Remote";
  deadline: string;
  description: string;
  tags: string[];
  badge?: "new" | "featured" | "closing";
  saved: boolean;
}

export const SAMPLE_JOBS: Job[] = [
  {
    id: "computational-microscopy-postdoc",
    title: "Postdoctoral Researcher - Computational Microscopy",
    org: "University of Central Florida",
    dept: "CREOL, The College of Optics and Photonics",
    location: "Orlando, FL",
    type: "postdoc",
    posted: "3 days ago",
    salary: "$58K-$68K / yr",
    remote: "On-site",
    deadline: "May 1, 2026",
    description:
      "Seeking a postdoc to develop AI-driven aberration correction for high-content cell microscopy. Collaborate with experimentalists and contribute to publications.",
    tags: ["Computer Vision", "Microscopy", "Machine Learning"],
    badge: "new",
    saved: false,
  },
  {
    id: "ai-biomedical-imaging-faculty",
    title: "Faculty Position - AI for Biomedical Imaging",
    org: "Stanford University",
    dept: "Radiology",
    location: "Stanford, CA",
    type: "faculty",
    posted: "1 day ago",
    salary: "Competitive",
    remote: "Hybrid",
    deadline: "June 15, 2026",
    description:
      "Tenure-track position at Assistant or Associate Professor level. Focus on ML for medical image reconstruction, segmentation, and clinical support tools.",
    tags: ["Medical Imaging", "Deep Learning", "Neural Networks"],
    badge: "featured",
    saved: true,
  },
  {
    id: "holographic-display-phd",
    title: "PhD Studentship - Holographic Display Systems",
    org: "MIT Media Lab",
    dept: "Camera Culture Group",
    location: "Cambridge, MA",
    type: "phd",
    posted: "18 days ago",
    salary: "Full funding + stipend",
    remote: "On-site",
    deadline: "April 12, 2026",
    description:
      "Fully funded PhD in next-generation holographic display research. Targets real-time CGH via neural approaches and custom photonics hardware.",
    tags: ["Holography", "Neural Rendering", "Display"],
    badge: "closing",
    saved: false,
  },
  {
    id: "photonic-simulation-engineer",
    title: "Research Engineer - Photonic Simulation",
    org: "Intel Labs",
    dept: "Photonics Technology",
    location: "Santa Clara, CA",
    type: "full-time",
    posted: "2 days ago",
    salary: "$130K-$160K / yr",
    remote: "Hybrid",
    deadline: "Open until filled",
    description:
      "Design and validate photonic simulation tools for next-gen integrated circuits. Strong background in electromagnetics and FDTD simulation required.",
    tags: ["Photonics", "Simulation", "Electromagnetics"],
    badge: "new",
    saved: false,
  },
];
