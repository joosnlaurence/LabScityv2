"use client";

import { useState } from "react";
import {
  Briefcase,
  MapPin,
  Tag as TagIcon,
  DollarSign,
  CalendarDays,
  Mail,
  ExternalLink,
  Eye,
  Save,
  Send,
  CheckCircle2,
  Lightbulb,
  Plus,
  X,
  ChevronDown,
  Star,
  Building2,
  Clock,
  Search,
  Home,
  Users,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA INTERFACES
 * The composer manages its own local form state. Use this interface to type
 * the submitted payload (e.g. an onPublish/onSaveDraft callback prop).
 * ────────────────────────────────────────────────────────────────────── */
export interface JobDraft {
  title: string;
  organization: string;
  department: string;
  location: string;
  type: string;
  remote: string;
  salary: string;
  deadline: string;
  contactEmail: string;
  applyUrl: string;
  description: string;
  tags: string[];
}
export interface JobComposerPageProps {
  initialDraft?: Partial<JobDraft>;
  onPublish?: (draft: JobDraft) => void;
  onSaveDraft?: (draft: JobDraft) => void;
}

/* ─── shared ─── */
function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
      {children}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
    </label>
  );
}
function Input({ placeholder, value, onChange, multiline, rows = 3 }: { placeholder?: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) {
  const cls = "w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all resize-none";
  if (multiline) return <textarea rows={rows} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={cls} />;
  return <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={cls} />;
}
function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all appearance-none bg-white pr-8">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <h3 className="text-[15px] font-semibold text-[#111827] flex items-center gap-2.5 mb-4 pb-3 border-b border-[#F3F4F6]">
        <span className="text-[#1F3A5F]">{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}
function Field({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 last:mb-0">{children}</div>;
}
function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

/* ─── tag input ─── */
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-[#E5E7EB] focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10 min-h-[44px] bg-white transition-all">
      {tags.map(t => (
        <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EEF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="text-[#93C5FD] hover:text-[#1D4ED8] transition-colors"><X className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
        placeholder={tags.length === 0 ? "Add tags and press Enter..." : ""}
        className="flex-1 min-w-[120px] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none bg-transparent px-1"
      />
    </div>
  );
}

/* ─── mini preview card ─── */
function MiniPreviewCard({ title, org, type, location, remote, tags }: { title: string; org: string; type: string; location: string; remote: string; tags: string[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-3.5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-[13px] font-semibold text-[#111827] leading-snug line-clamp-2">{title || <span className="text-[#9CA3AF]">Job title will appear here</span>}</h4>
      </div>
      <div className="flex items-center gap-1.5 text-[11.5px] text-[#374151] mb-1.5 flex-wrap">
        {org ? <><Building2 className="w-3 h-3 text-[#9CA3AF]" /><span className="font-medium">{org}</span></> : <span className="text-[#D1D5DB]">Organization</span>}
        {location && <><span className="text-[#D1D5DB]">·</span><MapPin className="w-3 h-3 text-[#9CA3AF]" /><span>{location}</span></>}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mb-2.5 flex-wrap">
        {type && <><Briefcase className="w-3 h-3 text-[#9CA3AF]" /><span>{type}</span></>}
        {remote && <><span className="text-[#D1D5DB]">·</span><span className={`font-medium ${remote === "Remote" ? "text-[#059669]" : remote === "Hybrid" ? "text-[#2563EB]" : "text-[#374151]"}`}>{remote}</span></>}
        <><span className="text-[#D1D5DB]">·</span><Clock className="w-3 h-3 text-[#9CA3AF]" /><span>Just now</span></>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tags.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#475569]">{t}</span>)}
        </div>
      )}
      <div className="flex items-center gap-1.5 pt-2 border-t border-[#F3F4F6]">
        <button className="px-3 py-1 rounded-md bg-[#1F3A5F] text-white text-[11px] font-medium">View Details</button>
        <button className="px-2.5 py-1 rounded-md border border-[#D1D5DB] text-[11px] text-[#374151]">Apply</button>
      </div>
    </div>
  );
}

const TIPS = [
  { text: "Use a clear, specific job title", done: true },
  { text: "Include required skills as tags", done: false },
  { text: "Add an application deadline", done: false },
  { text: "Specify remote / on-site status", done: false },
  { text: "Write 2–3 sentences of description", done: false },
];

/* ─── main export ─── */
export function ComposerPage() {
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [dept, setDept] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("On-site");
  const [jobType, setJobType] = useState("Postdoc");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [tags, setTags] = useState<string[]>(["Optics", "Computer Vision"]);
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => { setPublished(true); };

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
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[13px] text-[#374151] hover:bg-[#F9FAFB] transition-colors flex-shrink-0">
          <Save className="w-3.5 h-3.5" />Save draft
        </button>
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

      {/* Published toast */}
      {published && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white rounded-xl border border-[#A7F3D0] shadow-xl animate-[fadeIn_.3s_ease]" style={{ boxShadow: "0 8px 24px rgba(5,150,105,0.12)" }}>
          <CheckCircle2 className="w-5 h-5 text-[#059669]" />
          <div>
            <p className="text-[13.5px] font-semibold text-[#111827]">Job posted successfully!</p>
            <p className="text-[12px] text-[#6B7280]">Redirecting to job details page…</p>
          </div>
          <button onClick={() => setPublished(false)} className="ml-2 text-[#9CA3AF] hover:text-[#374151]"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[26px] font-bold text-[#111827]">Post a Job</h1>
          <p className="text-[14px] text-[#6B7280] mt-0.5">Share opportunities with researchers, students, and collaborators</p>
        </div>

        <div className="flex gap-7 items-start">
          {/* Form column */}
          <div className="flex-1 min-w-0">
            {/* A: Basic info */}
            <SectionCard title="Basic Information" icon={<Briefcase className="w-4.5 h-4.5" style={{width:18,height:18}} />}>
              <Field><FormLabel required>Job Title</FormLabel><Input placeholder="e.g. Postdoctoral Researcher — Computational Microscopy" value={title} onChange={setTitle} /></Field>
              <TwoCol>
                <Field><FormLabel required>Organization / Lab</FormLabel><Input placeholder="e.g. UCF, Caltech, Google" value={org} onChange={setOrg} /></Field>
                <Field><FormLabel>Department</FormLabel><Input placeholder="e.g. CREOL, Radiology" value={dept} onChange={setDept} /></Field>
              </TwoCol>
              <TwoCol>
                <Field><FormLabel>Location</FormLabel><Input placeholder="City, State or Remote" value={location} onChange={setLocation} /></Field>
                <Field><FormLabel>Work Mode</FormLabel><Select options={["On-site", "Hybrid", "Remote"]} value={remote} onChange={setRemote} /></Field>
              </TwoCol>
              <Field><FormLabel required>Job Type</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {["Postdoc", "Faculty", "PhD", "Full-time", "Part-time", "Internship", "Contract"].map(t => (
                    <button key={t} onClick={() => setJobType(t)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${jobType === t ? "bg-[#1F3A5F] text-white border-[#1F3A5F]" : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
            </SectionCard>

            {/* B: Description */}
            <SectionCard title="Description" icon={<TagIcon className="w-4.5 h-4.5" style={{width:18,height:18}} />}>
              <Field><FormLabel required>Short Summary</FormLabel><Input multiline rows={2} placeholder="2–3 sentence overview of the role..." value={summary} onChange={setSummary} /></Field>
              <Field><FormLabel required>Full Description</FormLabel><Input multiline rows={4} placeholder="Describe the research context, team, and goals..." value={description} onChange={setDescription} /></Field>
              <Field><FormLabel>Responsibilities</FormLabel><Input multiline rows={3} placeholder="List key responsibilities, one per line..." value={responsibilities} onChange={setResponsibilities} /></Field>
              <Field><FormLabel>Qualifications</FormLabel><Input multiline rows={3} placeholder="Required and preferred qualifications..." value={qualifications} onChange={setQualifications} /></Field>
            </SectionCard>

            {/* C: Research fit */}
            <SectionCard title="Research Fit" icon={<Star className="w-4.5 h-4.5 text-[#1F3A5F]" style={{width:18,height:18}} />}>
              <Field><FormLabel>Skills & Research Tags</FormLabel><TagInput tags={tags} onChange={setTags} /><p className="text-[11px] text-[#9CA3AF] mt-1.5">Press Enter or comma to add a tag. These help surface your listing to the right researchers.</p></Field>
              <Field><FormLabel>Preferred Background</FormLabel><Input multiline rows={2} placeholder="e.g. Background in optics + ML, familiarity with PyTorch..." value="" onChange={() => {}} /></Field>
            </SectionCard>

            {/* D: Logistics */}
            <SectionCard title="Logistics" icon={<CalendarDays className="w-4.5 h-4.5" style={{width:18,height:18}} />}>
              <TwoCol>
                <Field><FormLabel>Salary / Stipend / Funding</FormLabel><Input placeholder="e.g. $58K–$68K / yr" value={salary} onChange={setSalary} /></Field>
                <Field><FormLabel>Application Deadline</FormLabel><Input placeholder="e.g. May 1, 2026" value={deadline} onChange={setDeadline} /></Field>
              </TwoCol>
              <TwoCol>
                <Field><FormLabel>Start Date</FormLabel><Input placeholder="e.g. Fall 2026 or ASAP" value={startDate} onChange={setStartDate} /></Field>
                <Field><FormLabel>Contact Email</FormLabel><Input placeholder="hr@university.edu" value={contactEmail} onChange={setContactEmail} /></Field>
              </TwoCol>
              <Field><FormLabel>External Application Link</FormLabel><Input placeholder="https://apply.university.edu/..." value={applyLink} onChange={setApplyLink} /></Field>
            </SectionCard>

            {/* E: Visibility */}
            <SectionCard title="Visibility & Publishing" icon={<Eye className="w-4.5 h-4.5" style={{width:18,height:18}} />}>
              <Field>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer" onClick={() => setPublishNow(!publishNow)}>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#111827]">Publish immediately</p>
                    <p className="text-[11.5px] text-[#9CA3AF]">Your listing goes live right after submitting</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors ${publishNow ? "bg-[#1F3A5F]" : "bg-[#D1D5DB]"} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${publishNow ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              </Field>
              <Field>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer" onClick={() => setFeatured(!featured)}>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#111827] flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />Featured listing
                    </p>
                    <p className="text-[11.5px] text-[#9CA3AF]">Boost visibility — shown at the top of results</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors ${featured ? "bg-[#F59E0B]" : "bg-[#D1D5DB]"} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${featured ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              </Field>
              <Field>
                <FormLabel>Listing Expiration Date</FormLabel>
                <Input placeholder="e.g. June 1, 2026 (leave blank = 90 days)" value="" onChange={() => {}} />
              </Field>
            </SectionCard>
          </div>

          {/* Sticky sidebar */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-4 sticky top-24">
            {/* Live preview */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13px] font-semibold text-[#111827] flex items-center gap-2 mb-3 pb-2.5 border-b border-[#F3F4F6]">
                <Eye className="w-4 h-4 text-[#1F3A5F]" />Live Preview
              </h4>
              <MiniPreviewCard title={title} org={org} type={jobType} location={location} remote={remote} tags={tags} />
              <p className="text-[10.5px] text-[#9CA3AF] mt-2 text-center">Updates as you type</p>
            </div>

            {/* Tips */}
            <div className="bg-[#FFFBEB] rounded-xl border border-[#FDE68A] p-4">
              <h4 className="text-[13px] font-semibold text-[#92400E] flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#F59E0B]" />Posting Tips
              </h4>
              <div className="flex flex-col gap-2">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${tip.done ? "text-[#059669]" : "text-[#D1D5DB]"}`} />
                    <p className={`text-[12px] leading-relaxed ${tip.done ? "text-[#065F46] line-through opacity-60" : "text-[#92400E]"}`}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Publish actions */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13px] font-semibold text-[#111827] mb-3 pb-2.5 border-b border-[#F3F4F6]">Publish Actions</h4>
              <div className="flex flex-col gap-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#D1D5DB] text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                  <Save className="w-4 h-4 text-[#9CA3AF]" />Save as Draft
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#D1D5DB] text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                  <Eye className="w-4 h-4 text-[#9CA3AF]" />Preview Full Listing
                </button>
                <button
                  onClick={handlePublish}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1F3A5F] text-white text-sm font-semibold hover:bg-[#162D4A] transition-colors"
                >
                  <Send className="w-4 h-4" />Publish Job
                </button>
              </div>
              <p className="text-[10.5px] text-[#9CA3AF] mt-3 text-center">Your listing will be reviewed within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
