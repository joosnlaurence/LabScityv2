"use client";

import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Bookmark,
  Share2,
  ExternalLink,
  Clock,
  DollarSign,
  Building2,
  Flag,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  Star,
  Search,
  Home,
  Users,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA INTERFACES
 * The component renders inline sample data. Type real data with these
 * interfaces and replace the inline values / SIMILAR array with props.
 * ────────────────────────────────────────────────────────────────────── */
export interface JobDetail {
  id: string;
  title: string;
  org: string;
  dept: string;
  location: string;
  type: string;
  remote: string;
  salary: string;
  posted: string;
  deadline: string;
  description: string;
  tags: string[];
}
export interface SimilarJob {
  id: string;
  title: string;
  org: string;
  location: string;
  type: string;
}
export interface JobDetailsPageProps {
  job?: JobDetail;
  similarJobs?: SimilarJob[];
  onApply?: (jobId: string) => void;
}

function Tag({ label }: { label: string }) {
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#F1F5F9] text-[#475569]">{label}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[15px] font-semibold text-[#111827] mb-3 pb-2 border-b border-[#F3F4F6]">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-[#374151] leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-[#1F3A5F] flex-shrink-0 mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function QuickFactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F9FAFB] last:border-0">
      <div className="text-[#9CA3AF] mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] text-[#111827] font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const SIMILAR = [
  { title: "Postdoc — Computational Imaging", org: "MIT", type: "Postdoc" },
  { title: "Research Scientist — Optics AI", org: "Google DeepMind", type: "Full-time" },
  { title: "PhD Position — Phase Retrieval", org: "ETH Zürich", type: "PhD" },
];

export function DetailsPage() {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

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

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Back link */}
        <button className="flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#1D4ED8] mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        <div className="flex gap-7 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header block */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h1 className="text-[22px] font-bold text-[#111827] leading-snug">
                      Postdoctoral Researcher — Computational Microscopy
                    </h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">New</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[14px] text-[#374151] mb-1 flex-wrap">
                    <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="font-semibold">University of Central Florida</span>
                    <span className="text-[#D1D5DB]">·</span>
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>Orlando, FL</span>
                  </div>
                  <p className="text-[12.5px] text-[#9CA3AF]">CREOL, The College of Optics and Photonics</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1F3A5F] to-[#0891B2] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">UCF</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[#6B7280] mb-4">
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-[#9CA3AF]" />Postdoc</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />Posted 3 days ago</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-[#9CA3AF]" />$58,000–$68,000 / yr</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="text-[#374151] font-medium">On-site</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="flex items-center gap-1.5 text-[#DC2626] font-medium"><CalendarDays className="w-3.5 h-3.5" />Deadline: May 1, 2026</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {["Computer Vision", "Machine Learning", "Microscopy", "Neural Networks", "Optics"].map(t => <Tag key={t} label={t} />)}
              </div>

              {/* Action strip */}
              <div className="flex items-center gap-2.5 pt-4 border-t border-[#F3F4F6]">
                <button
                  onClick={() => setApplied(!applied)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${applied ? "bg-[#059669] text-white" : "bg-[#1F3A5F] text-white hover:bg-[#162D4A]"}`}
                >
                  {applied ? <><CheckCircle2 className="w-4 h-4" />Applied!</> : <><ExternalLink className="w-4 h-4" />Apply Now</>}
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${saved ? "border-[#1F3A5F] bg-[#EEF6FF] text-[#1F3A5F]" : "border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]"}`}
                >
                  <Bookmark style={{ width: 15, height: 15 }} className={saved ? "fill-[#1F3A5F]" : ""} />
                  {saved ? "Saved" : "Save Job"}
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                  <Share2 className="w-3.5 h-3.5" />Share
                </button>
                <button className="ml-auto flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#DC2626] transition-colors">
                  <Flag className="w-3.5 h-3.5" />Report
                </button>
              </div>
            </div>

            {/* Body sections */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <Section title="About the Role">
                <p className="text-[13.5px] text-[#374151] leading-relaxed">
                  We are seeking a highly motivated postdoctoral researcher to join the Computational Imaging Laboratory at CREOL. The successful candidate will work on NIH-funded research developing novel deep learning algorithms for correcting optical aberrations in high-content cell microscopy systems. You will collaborate closely with biologists and optical engineers, contribute to peer-reviewed publications, and assist with grant reporting.
                </p>
              </Section>

              <Section title="Responsibilities">
                <BulletList items={[
                  "Design and implement deep neural networks for aberration estimation and correction",
                  "Collaborate with experimental partners to acquire and label training datasets",
                  "Publish findings in high-impact optics and imaging journals",
                  "Present research at international conferences (SPIE, OSA, MICCAI)",
                  "Mentor graduate students and assist with lab operations",
                  "Contribute to grant reporting and proposal preparation",
                ]} />
              </Section>

              <Section title="Required Qualifications">
                <BulletList items={[
                  "PhD in Optics, Physics, Electrical Engineering, Computer Science, or related field",
                  "Strong background in computational imaging or machine learning",
                  "Proficiency in Python and deep learning frameworks (PyTorch / TensorFlow)",
                  "Demonstrated publication record in relevant areas",
                  "Excellent written and verbal communication skills",
                ]} />
              </Section>

              <Section title="Preferred Qualifications">
                <BulletList items={[
                  "Experience with microscopy systems (confocal, widefield, or light-sheet)",
                  "Familiarity with wavefront sensing and phase retrieval",
                  "Prior experience with scientific grant writing",
                ]} />
              </Section>

              <Section title="Research Areas & Skills">
                <div className="flex flex-wrap gap-1.5">
                  {["Computer Vision", "Machine Learning", "Microscopy", "Neural Networks", "Optics", "Phase Retrieval", "Python", "PyTorch", "MATLAB"].map(t => <Tag key={t} label={t} />)}
                </div>
              </Section>

              <Section title="Compensation & Benefits">
                <p className="text-[13.5px] text-[#374151] leading-relaxed">
                  Salary range: <strong>$58,000 – $68,000/yr</strong> commensurate with experience. Full benefits package including health, dental, and vision. Professional development funds for conference attendance. Position is for 2 years with possibility of renewal.
                </p>
              </Section>

              <Section title="How to Apply">
                <p className="text-[13.5px] text-[#374151] leading-relaxed mb-3">
                  Submit your application via the UCF HR portal. Include: (1) cover letter, (2) CV, (3) research statement (max 2 pages), and (4) contact information for three references. Applications are reviewed on a rolling basis. Position open until filled; priority deadline: <strong>May 1, 2026</strong>.
                </p>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F3A5F] text-white text-sm font-semibold hover:bg-[#162D4A] transition-colors">
                  <ExternalLink className="w-4 h-4" />Apply via UCF HR Portal
                </button>
              </Section>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-4 sticky top-24">
            {/* Quick facts */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Quick Facts</h4>
              <QuickFactRow icon={<Building2 className="w-4 h-4" />} label="Organization" value="University of Central Florida" />
              <QuickFactRow icon={<Briefcase className="w-4 h-4" />} label="Employment Type" value="Postdoc (2 years)" />
              <QuickFactRow icon={<MapPin className="w-4 h-4" />} label="Location" value="Orlando, FL (On-site)" />
              <QuickFactRow icon={<CalendarDays className="w-4 h-4" />} label="Deadline" value="May 1, 2026" />
              <QuickFactRow icon={<DollarSign className="w-4 h-4" />} label="Salary" value="$58,000 – $68,000 / yr" />
              <QuickFactRow icon={<Clock className="w-4 h-4" />} label="Posted" value="3 days ago" />
            </div>

            {/* Apply CTA */}
            <div className="bg-white rounded-xl border border-[#BFDBFE] p-4 bg-[#F8FBFF]" style={{ boxShadow: "0 1px 8px rgba(37,99,235,0.07)" }}>
              <p className="text-[12px] text-[#6B7280] mb-3">Ready to apply?</p>
              <button
                onClick={() => setApplied(!applied)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold mb-2 transition-all ${applied ? "bg-[#059669] text-white" : "bg-[#1F3A5F] text-white hover:bg-[#162D4A]"}`}
              >
                {applied ? <><CheckCircle2 className="w-4 h-4" />Applied!</> : <>Apply Now <ExternalLink className="w-3.5 h-3.5" /></>}
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors ${saved ? "border-[#1F3A5F] bg-[#EEF6FF] text-[#1F3A5F]" : "border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]"}`}
              >
                <Bookmark style={{ width: 14, height: 14 }} className={saved ? "fill-[#1F3A5F]" : ""} />
                {saved ? "Saved" : "Save Job"}
              </button>
            </div>

            {/* Similar jobs */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Similar Jobs</h4>
              <div className="flex flex-col gap-2">
                {SIMILAR.map(j => (
                  <div key={j.title} className="flex items-start justify-between gap-2 py-2 border-b border-[#F3F4F6] last:border-0 cursor-pointer group">
                    <div>
                      <p className="text-[12.5px] font-medium text-[#111827] group-hover:text-[#1D4ED8] transition-colors leading-snug">{j.title}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{j.org} · <span className="text-[#6B7280]">{j.type}</span></p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-center text-[12px] text-[#1D4ED8] hover:underline">
                See all similar jobs →
              </button>
            </div>

            {/* Posted by */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Posted by</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F3A5F] to-[#0891B2] flex items-center justify-center text-white text-sm font-bold">CW</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Prof. Cheng Wu</p>
                  <p className="text-[11px] text-[#9CA3AF]">CREOL, UCF</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />)}
                    <span className="text-[10px] text-[#9CA3AF] ml-1">4 postings</span>
                  </div>
                </div>
              </div>
              <button className="mt-3 w-full py-1.5 rounded-lg border border-[#E5E7EB] text-[12px] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
