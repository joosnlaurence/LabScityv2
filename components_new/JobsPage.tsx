"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  AlertCircle,
  ExternalLink,
  Share2,
  Building2,
  Clock,
  DollarSign,
  SlidersHorizontal,
  Wifi,
  TrendingUp,
  ToggleLeft,
  Home,
  Users,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA INTERFACES
 * This file already defines the `Badge` type. The `Job` interface below
 * matches the inline JOBS sample data — type real data with it and pass via
 * props to replace the inline arrays (JOBS, SAVED_JOBS, POSTED_JOBS).
 * ────────────────────────────────────────────────────────────────────── */
export interface Job {
  id: string;
  title: string;
  org: string;
  dept: string;
  location: string;
  type: string;
  posted: string;
  salary: string;
  remote: string;
  description: string;
  tags: string[];
  badge?: "new" | "featured" | "closing";
  saved: boolean;
}
export interface JobsPageProps {
  jobs?: Job[];
  savedJobs?: Job[];
  postedJobs?: Job[];
  trending?: string[];
}

/* ─── data ─── */
const JOBS = [
  {
    id: "1",
    title: "Postdoctoral Researcher — Computational Microscopy",
    org: "University of Central Florida",
    dept: "CREOL",
    location: "Orlando, FL",
    type: "Postdoc",
    posted: "3 days ago",
    salary: "$58K–$68K / yr",
    remote: "On-site",
    description:
      "Seeking a postdoc to develop AI-driven aberration correction for high-content cell microscopy. Collaborate with experimentalists and contribute to publications.",
    tags: ["Computer Vision", "Microscopy", "Machine Learning"],
    badge: "new" as const,
    saved: false,
  },
  {
    id: "2",
    title: "Faculty Position — AI for Biomedical Imaging",
    org: "Stanford University",
    dept: "Radiology",
    location: "Stanford, CA",
    type: "Faculty",
    posted: "1 day ago",
    salary: "Competitive",
    remote: "Hybrid",
    description:
      "Tenure-track position at Assistant or Associate Professor level. Focus on ML for medical image reconstruction, segmentation, and clinical support tools.",
    tags: ["Medical Imaging", "Deep Learning", "Neural Networks"],
    badge: "featured" as const,
    saved: true,
  },
  {
    id: "3",
    title: "PhD Studentship — Holographic Display Systems",
    org: "MIT Media Lab",
    dept: "Camera Culture Group",
    location: "Cambridge, MA",
    type: "PhD",
    posted: "18 days ago",
    salary: "Full funding + stipend",
    remote: "On-site",
    description:
      "Fully-funded PhD in next-generation holographic display research. Targets real-time CGH via neural approaches and custom photonics hardware.",
    tags: ["Holography", "Neural Rendering", "Display"],
    badge: "closing" as const,
    saved: false,
  },
  {
    id: "4",
    title: "Research Engineer — Photonic Simulation",
    org: "Intel Labs",
    dept: "Photonics Technology",
    location: "Santa Clara, CA",
    type: "Full-time",
    posted: "2 days ago",
    salary: "$130K–$160K / yr",
    remote: "Hybrid",
    description:
      "Design and validate photonic simulation tools for next-gen integrated circuits. Strong background in electromagnetics and FDTD simulation required.",
    tags: ["Photonics", "Simulation", "Electromagnetics"],
    badge: "new" as const,
    saved: false,
  },
];

const SAVED_JOBS = [
  { title: "AI for Biomedical Imaging", org: "Stanford University" },
  { title: "Phase Imaging Intern", org: "Leica Microsystems" },
];

const POSTED_JOBS = [
  { title: "Optics Postdoc — UCF", status: "Active", apps: 12 },
];

const TRENDING = ["Deep Learning", "Holography", "Phase Imaging", "Computational Imaging", "Physics-Informed NN"];

type Badge = "new" | "featured" | "closing" | undefined;

function Tag({ label, blue }: { label: string; blue?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${blue ? "bg-[#EEF6FF] text-[#1D4ED8] border border-[#BFDBFE]" : "bg-[#F1F5F9] text-[#475569]"}`}>
      {label}
    </span>
  );
}

function Dot() { return <span className="text-[#D1D5DB]">·</span>; }

function JobCard({ job }: { job: typeof JOBS[0] }) {
  const [saved, setSaved] = useState(job.saved);
  const isFeatured = job.badge === "featured";
  return (
    <div
      className={`w-full rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isFeatured ? "border-[#BFDBFE] bg-[#F8FBFF]" : job.badge === "closing" ? "border-[#FDE68A]" : "border-[#E5E7EB]"}`}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "16px 18px" }}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={`text-[15.5px] font-semibold cursor-pointer hover:underline leading-snug ${isFeatured ? "text-[#1E40AF]" : "text-[#111827]"}`}>{job.title}</h3>
          {job.badge === "featured" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"><Star className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />Featured</span>}
          {job.badge === "closing" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"><AlertCircle className="w-2.5 h-2.5" />Closing soon</span>}
          {job.badge === "new" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">New</span>}
        </div>
        <button onClick={() => setSaved(!saved)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] flex-shrink-0">
          <Bookmark style={{ width: 17, height: 17 }} className={saved ? "fill-[#1F3A5F] text-[#1F3A5F]" : "text-[#9CA3AF]"} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-[13px] text-[#374151] mb-0.5">
        <Building2 className="w-3.5 h-3.5 text-[#9CA3AF]" /><span className="font-medium">{job.org}</span><Dot /><MapPin className="w-3 h-3 text-[#9CA3AF]" /><span>{job.location}</span>
      </div>
      {job.dept && <p className="text-[11px] text-[#9CA3AF] mb-2">{job.dept}</p>}
      <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] mb-2.5 flex-wrap">
        <Briefcase className="w-3 h-3 text-[#9CA3AF]" /><span>{job.type}</span><Dot /><Clock className="w-3 h-3 text-[#9CA3AF]" /><span>Posted {job.posted}</span><Dot /><DollarSign className="w-3 h-3 text-[#9CA3AF]" /><span>{job.salary}</span><Dot />
        <span className={`font-medium ${job.remote === "Remote" ? "text-[#059669]" : job.remote === "Hybrid" ? "text-[#2563EB]" : "text-[#374151]"}`}>{job.remote}</span>
      </div>
      <p className="text-[13px] text-[#4B5563] leading-relaxed mb-3" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.tags.map(t => <Tag key={t} label={t} blue={isFeatured} />)}
      </div>
      <div className={`border-t mb-3 ${isFeatured ? "border-[#DBEAFE]" : "border-[#F3F4F6]"}`} />
      <div className="flex items-center gap-2">
        <button className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFeatured ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF]" : "bg-[#1F3A5F] text-white hover:bg-[#162D4A]"}`}>View Details <ChevronRight className="w-3.5 h-3.5" /></button>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors"><ExternalLink className="w-3.5 h-3.5" />Apply</button>
        <button onClick={() => setSaved(!saved)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${saved ? "border-[#1F3A5F] bg-[#EEF6FF] text-[#1F3A5F]" : "border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]"}`}>
          <Bookmark style={{ width: 14, height: 14 }} className={saved ? "fill-[#1F3A5F]" : ""} />{saved ? "Saved" : "Save"}
        </button>
        <button className="ml-auto p-1.5 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F9FAFB]"><Share2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ─── main export ─── */

export function JobsPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All types");
  const [remote, setRemote] = useState(false);
  const [similar, setSimilar] = useState(false);

  const filtered = JOBS.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.org.toLowerCase().includes(search.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2 w-[200px] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white text-sm font-bold">L</div>
          <span className="text-[17px] font-bold text-[#111827] tracking-tight">LabScity</span>
        </div>
        <div className="flex-1 max-w-[520px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input placeholder="Search people, publications, products, groups..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F1F5F9] border border-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {[
            { icon: Home, label: "Home" },
            { icon: Briefcase, label: "Jobs", active: true },
            { icon: Users, label: "Groups" },
            { icon: MessageSquare, label: "Messages", dot: true },
            { icon: Bell, label: "Notifications", count: 3 },
          ].map((item) => (
            <button key={item.label} className="relative flex flex-col items-center justify-center w-[58px] h-11 rounded-lg transition-colors" style={{ color: item.active ? "#1F3A5F" : "#6B7280" }}>
              <item.icon className="w-[18px] h-[18px]" style={{ color: item.active ? "#1F3A5F" : "#6B7280" }} />
              <span className="text-[10px] mt-0.5 font-medium" style={{ color: item.active ? "#1F3A5F" : "#9CA3AF" }}>{item.label}</span>
              {item.active && <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-7 h-[2.5px] rounded-full" style={{ background: "#1F3A5F" }} />}
              {item.count && <span className="absolute top-1 right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">{item.count}</span>}
              {item.dot && <span className="absolute top-2 right-3.5 w-2 h-2 rounded-full bg-[#2EC4B6] border-2 border-white" />}
            </button>
          ))}
          <div className="w-px h-7 bg-[#E5E7EB] mx-2" />
          <button className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <button className="ml-1 w-[34px] h-[34px] rounded-full bg-[#1F3A5F] flex items-center justify-center text-white text-[12px] font-bold ring-2 ring-[#E5E7EB]">YA</button>
        </div>
      </nav>

      <div className="max-w-[1320px] mx-auto px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-[#111827]">Jobs</h1>
          <p className="text-[14px] text-[#6B7280] mt-0.5">Discover research, academic, and industry opportunities</p>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-6 flex flex-wrap items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, skills, or organizations..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
          </div>
          {/* Location */}
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />Location <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>
          {/* Job type */}
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Briefcase className="w-3.5 h-3.5 text-[#9CA3AF]" />{jobType} <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>
          {/* Remote toggle */}
          <button
            onClick={() => setRemote(!remote)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${remote ? "border-[#1F3A5F] bg-[#EEF6FF] text-[#1F3A5F]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
          >
            <Wifi className="w-3.5 h-3.5" />Remote only
          </button>
          {/* Similar to profile */}
          <button
            onClick={() => setSimilar(!similar)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${similar ? "border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}
          >
            <ToggleLeft className="w-3.5 h-3.5" />Similar to my profile
          </button>
          <button className="ml-auto flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:bg-[#F9FAFB]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" />More filters
          </button>
        </div>

        {/* Main layout */}
        <div className="flex gap-6">
          {/* Job list */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] text-[#6B7280]">{filtered.length} results</p>
              <button className="flex items-center gap-1.5 text-[13px] text-[#374151] hover:text-[#111827]">
                Sort: Relevance <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {filtered.map(j => <JobCard key={j.id} job={j} />)}
            <button className="w-full py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-white hover:text-[#374151] transition-colors bg-white">
              Load more jobs →
            </button>
          </div>

          {/* Sidebar */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-4">
            {/* Saved jobs */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13.5px] font-semibold text-[#111827] mb-3 flex items-center gap-2"><Bookmark className="w-4 h-4 text-[#1F3A5F]" />Saved Jobs</h4>
              <div className="flex flex-col gap-2">
                {SAVED_JOBS.map(j => (
                  <div key={j.title} className="flex items-start justify-between gap-2 py-1.5 border-b border-[#F3F4F6] last:border-0">
                    <div>
                      <p className="text-[12.5px] font-medium text-[#111827] cursor-pointer hover:text-[#1D4ED8]">{j.title}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{j.org}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Your postings */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13.5px] font-semibold text-[#111827] mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#1F3A5F]" />Your Postings</h4>
              {POSTED_JOBS.map(j => (
                <div key={j.title} className="flex items-center justify-between">
                  <div>
                    <p className="text-[12.5px] font-medium text-[#111827]">{j.title}</p>
                    <p className="text-[11px] text-[#059669] font-medium">{j.status} · {j.apps} applicants</p>
                  </div>
                  <button className="text-[11px] text-[#1D4ED8] hover:underline">Manage</button>
                </div>
              ))}
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#D1D5DB] text-[12px] text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#374151] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Post a new job
              </button>
            </div>

            {/* Trending fields */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13.5px] font-semibold text-[#111827] mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#1F3A5F]" />Trending Fields</h4>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING.map(t => (
                  <button key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors cursor-pointer">{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
