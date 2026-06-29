"use client";

import { useState } from "react";
import {
  Home,
  Search,
  User,
  FileText,
  Package,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  Bell,
  ChevronRight,
  Star,
  Link2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Check,
  MapPin,
  Clock,
  Globe,
  Github,
  GraduationCap,
  Edit3,
  MessageCircle,
  Building2,
  BadgeCheck,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  Plus,
  X,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Quote,
  Bookmark,
  Eye,
  BookOpen,
  Database,
  Cpu,
  Code2,
  AppWindow,
  FlaskConical,
  Wrench,
  Archive,
  GitBranch,
  GitFork,
  ChevronLeft,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA INTERFACES
 * This file already defines the `Pub` and `Product` interfaces used by the
 * Publications and Products tabs. The interfaces below describe the profile
 * header / stats so a developer can replace the inline sample data with props.
 * ────────────────────────────────────────────────────────────────────── */
export interface ProfileHeaderData {
  name: string;
  title: string;
  affiliation: string;
  location: string;
  avatarInitials: string;
  bio: string;
  tags: string[];
}
export interface ProfileStats {
  publications: number;
  citations: number;
  hIndex: number;
  followers: number;
}
export interface ProfilePageProps {
  profile?: ProfileHeaderData;
  stats?: ProfileStats;
}

/* ────────────────────────────────────────────
   shared primitives
   ──────────────────────────────────────────── */

const NAVY = "#1F3A5F";
const TEAL = "#2EC4B6";

function Avatar({
  initials,
  color,
  size = 40,
  ring,
}: {
  initials: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: ring ? `2px solid #fff` : `1.5px solid ${color}44`,
        boxShadow: ring ? "0 0 0 1.5px " + color + "55" : undefined,
        fontSize: size * 0.32,
        color,
      }}
    >
      {initials}
    </div>
  );
}

function BlueTag({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors cursor-pointer border border-[#BFDBFE]">
      {label}
    </button>
  );
}

function GreyTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#F1F5F9] text-[#475569]">
      {label}
    </span>
  );
}

function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-[#F1F5F9] text-[#374151] border border-[#E5E7EB]">
      {label}
    </span>
  );
}

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#059669" : pct >= 80 ? "#2563EB" : "#6B7280";
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <Star className="w-2.5 h-2.5" style={{ fill: color }} />
      {pct}%
    </span>
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
  accent,
  bodyClass = "",
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
  bodyClass?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
        <h3 className="text-[14px] font-semibold text-[#111827] flex items-center gap-2">
          {icon && (
            <span style={{ color: accent ? "#0F766E" : NAVY }}>{icon}</span>
          )}
          {title}
        </h3>
        {action}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

/* ────────────────────────────────────────────
   TOP NAVBAR
   ──────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6 gap-4">
      <div className="flex items-center gap-2 w-[200px] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white text-sm font-bold">
          L
        </div>
        <span className="text-[17px] font-bold text-[#111827] tracking-tight">
          LabScity
        </span>
      </div>

      <div className="flex-1 max-w-[520px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            placeholder="Search people, publications, products, groups..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F1F5F9] border border-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {[
          { icon: Home, label: "Home" },
          { icon: Briefcase, label: "Jobs" },
          { icon: Users, label: "Groups" },
          { icon: MessageSquare, label: "Messages", dot: true },
          { icon: Bell, label: "Notifications", count: 3 },
        ].map((item) => (
          <button
            key={item.label}
            className="relative flex flex-col items-center justify-center w-[58px] h-11 rounded-lg transition-colors hover:bg-[#F8FAFC]"
            style={{ color: "#6B7280" }}
          >
            <item.icon className="w-[18px] h-[18px]" style={{ color: "#6B7280" }} />
            <span className="text-[10px] mt-0.5 font-medium text-[#9CA3AF]">
              {item.label}
            </span>
            {item.count && (
              <span className="absolute top-1 right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                {item.count}
              </span>
            )}
            {item.dot && (
              <span className="absolute top-2 right-3.5 w-2 h-2 rounded-full bg-[#2EC4B6] border-2 border-white" />
            )}
          </button>
        ))}

        <div className="w-px h-7 bg-[#E5E7EB] mx-2" />

        <button className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Settings className="w-[18px] h-[18px]" />
        </button>
        <button className="ml-1">
          <Avatar initials="SK" color="#7C3AED" size={34} ring />
        </button>
      </div>
    </nav>
  );
}

/* ────────────────────────────────────────────
   PROFILE HEADER
   ──────────────────────────────────────────── */

function ProfileHeaderCard() {
  const [following, setFollowing] = useState(false);
  const areas = [
    "Machine Learning",
    "Biomedical Imaging",
    "Computer Vision",
    "Neural Rendering",
  ];
  const skills = ["PyTorch", "Microscopy", "Segmentation", "Scientific Computing"];
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="px-6 py-5">
        <div className="flex items-center gap-5">
          <Avatar initials="SK" color="#7C3AED" size={80} />
          <div className="flex-1 flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-bold text-[#111827] leading-tight">
                  Dr. Sarah Kim
                </h1>
                <BadgeCheck className="w-5 h-5 text-[#2EC4B6]" />
              </div>
              <p className="text-[14px] text-[#374151] font-medium mt-0.5">
                PhD Candidate, MIT
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFollowing(!following)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                style={
                  following
                    ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }
                    : { background: NAVY, color: "#fff", border: "1px solid transparent" }
                }
              >
                {following ? (
                  <><Check className="w-4 h-4" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                <MessageCircle className="w-4 h-4" /> Message
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[13.5px] text-[#374151]">
            <Building2 className="w-4 h-4 text-[#9CA3AF]" />
            Massachusetts Institute of Technology
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
            <GraduationCap className="w-4 h-4 text-[#9CA3AF]" />
            Computer Science and Artificial Intelligence Laboratory (CSAIL)
          </div>
          <div className="flex items-center gap-4 text-[12.5px] text-[#9CA3AF] flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Cambridge, MA, USA
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Local time 9:42 AM (EST)
            </span>
          </div>
        </div>

        <p className="text-[13.5px] text-[#4B5563] leading-relaxed mt-3 max-w-3xl">
          Researching learning-based methods for biomedical image reconstruction
          and analysis. My work focuses on physics-informed neural networks for
          microscopy, with an emphasis on label-efficient segmentation and
          interpretable models for clinical imaging.
        </p>

        <div className="mt-4">
          <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
            Research Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => <BlueTag key={a} label={a} />)}
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
            Skills &amp; Tools
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <SkillTag key={s} label={s} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   PROFILE TABS
   ──────────────────────────────────────────── */

function ProfileTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (t: string) => void;
}) {
  const tabs = [
    { id: "Profile", count: null },
    { id: "Publications", count: 24 },
    { id: "Products", count: 6 },
    { id: "Following", count: 128 },
  ];
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E7EB] px-2"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center gap-1">
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex items-center gap-2 px-4 py-3 text-[13.5px] font-semibold transition-colors"
              style={{ color: on ? NAVY : "#6B7280" }}
            >
              {t.id}
              {t.count !== null && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  style={on ? { background: "#EEF2F7", color: NAVY } : { background: "#F3F4F6", color: "#9CA3AF" }}
                >
                  {t.count}
                </span>
              )}
              {on && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full"
                  style={{ background: NAVY }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   PROFILE TAB — content cards
   ──────────────────────────────────────────── */

function AboutCard() {
  return (
    <SectionCard title="About" icon={<User className="w-4 h-4" />} bodyClass="p-4">
      <p className="text-[13.5px] text-[#4B5563] leading-relaxed">
        I am a final-year PhD candidate at MIT CSAIL working at the intersection of machine learning
        and biomedical imaging. My research develops physics-informed and self-supervised methods
        that make high-resolution microscopy reconstruction faster, cheaper, and more interpretable
        for clinical and laboratory settings.
      </p>
      <p className="text-[13.5px] text-[#4B5563] leading-relaxed mt-3">
        Previously I interned at Google Research and the Broad Institute, and I co-organize the
        annual Workshop on Learning for Scientific Imaging. I am actively seeking collaborators on
        inverse problems and open to advising early-stage research tools.
      </p>
    </SectionCard>
  );
}

function ResearchInterestsCard() {
  const interests = [
    "Physics-Informed Neural Networks", "Label-Efficient Segmentation",
    "Computational Microscopy", "Inverse Problems", "Diffusion Models",
    "Interpretable ML", "Self-Supervised Learning", "Medical Image Reconstruction",
  ];
  return (
    <SectionCard title="Research Interests" icon={<Sparkles className="w-4 h-4" />} accent bodyClass="p-4">
      <div className="flex flex-wrap gap-2">
        {interests.map((i) => <BlueTag key={i} label={i} />)}
      </div>
    </SectionCard>
  );
}

function RecentActivity() {
  const items = [
    { icon: Star, color: "#F59E0B", text: <>Highlighted <span className="font-semibold text-[#111827]">"Physics-informed self-supervised segmentation…"</span></>, time: "2h ago" },
    { icon: Users, color: "#2EC4B6", text: <>Joined <span className="font-semibold text-[#111827]">ML for Science</span></>, time: "1d ago" },
    { icon: UserPlus, color: "#1D4ED8", text: <>Followed <span className="font-semibold text-[#111827]">Dr. David Park</span></>, time: "3d ago" },
    { icon: Package, color: "#7C3AED", text: <>Published <span className="font-semibold text-[#111827]">MicroSeg v2.1</span> with napari support</>, time: "5d ago" },
  ];
  return (
    <SectionCard title="Recent Activity" icon={<TrendingUp className="w-4 h-4" />} accent bodyClass="p-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${it.color}1A` }}>
            <it.icon className="w-4 h-4" style={{ color: it.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[#4B5563] leading-snug">{it.text}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{it.time}</p>
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

function ContactLinksCard() {
  const links = [
    { icon: BadgeCheck, label: "ORCID", value: "0000-0002-1825-0097", color: "#A6CE39" },
    { icon: GraduationCap, label: "Google Scholar", value: "Sarah Kim · MIT", color: "#4285F4" },
    { icon: Github, label: "GitHub", value: "github.com/sarahkim", color: "#111827" },
    { icon: Globe, label: "Personal Website", value: "sarahkim.mit.edu", color: TEAL },
  ];
  return (
    <SectionCard title="Contact &amp; Links" icon={<Link2 className="w-4 h-4" />} bodyClass="p-2">
      {links.map((l) => (
        <button key={l.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${l.color}1A` }}>
            <l.icon className="w-4 h-4" style={{ color: l.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-[#111827]">{l.label}</p>
            <p className="text-[11.5px] text-[#6B7280] truncate">{l.value}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#6B7280] transition-colors" />
        </button>
      ))}
    </SectionCard>
  );
}

function CollaborationPrefsCard() {
  const prefs = ["Open to co-authoring", "Open to research tools", "Available for peer feedback", "Interested in grant teams"];
  return (
    <SectionCard title="Collaboration Preferences" icon={<Users className="w-4 h-4" />} accent bodyClass="p-4">
      <div className="flex flex-col gap-2.5">
        {prefs.map((p) => (
          <div key={p} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#D7F5F1" }}>
              <Check className="w-3 h-3" style={{ color: "#0F766E" }} />
            </div>
            <span className="text-[13px] text-[#374151] font-medium">{p}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ────────────────────────────────────────────
   RIGHT RAIL
   ──────────────────────────────────────────── */

function CollabRow({ name, institution, tags, match, initials, color, open }: {
  name: string; institution: string; tags: string[]; match: number;
  initials: string; color: string; open: boolean;
}) {
  const [followed, setFollowed] = useState(false);
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <Avatar initials={initials} color={color} size={38} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#111827] truncate">{name}</span>
          {open && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D] flex-shrink-0">Open</span>}
        </div>
        <p className="text-[11px] text-[#9CA3AF] truncate">{institution}</p>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {tags.map((t) => <GreyTag key={t} label={t} />)}
          <MatchBadge pct={match} />
        </div>
      </div>
      <button
        onClick={() => setFollowed(!followed)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
        style={followed ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" } : { background: NAVY, color: "#fff", border: "1px solid transparent" }}
      >
        {followed ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
      </button>
    </div>
  );
}

function RecommendedCollaborators() {
  const list = [
    { name: "David Park", institution: "Stanford", tags: ["Holography"], match: 94, initials: "DP", color: "#059669", open: true },
    { name: "Cheng Wu", institution: "UCF", tags: ["Optics", "Vision"], match: 91, initials: "CW", color: "#0891B2", open: false },
    { name: "Priya Sharma", institution: "Caltech", tags: ["Phase Imaging"], match: 88, initials: "PS", color: "#DC2626", open: true },
  ];
  return (
    <SectionCard title="Recommended Collaborators" icon={<Users className="w-4 h-4" />}
      action={<button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></button>}
      bodyClass="divide-y divide-[#F3F4F6]"
    >
      {list.map((c) => <CollabRow key={c.name} {...c} />)}
    </SectionCard>
  );
}

function SimilarResearchers() {
  const list = [
    { name: "Ravi Mehta", institution: "Johns Hopkins", tags: ["MRI", "Diffusion"], initials: "RM", color: "#2563EB" },
    { name: "Lena Tanaka", institution: "ETH Zürich", tags: ["Microscopy", "ML"], initials: "LT", color: "#DB2777" },
    { name: "Omar Farouk", institution: "EPFL", tags: ["Inverse Problems"], initials: "OF", color: "#CA8A04" },
  ];
  return (
    <SectionCard title="Similar Researchers" icon={<Sparkles className="w-4 h-4" />} accent bodyClass="p-2">
      {list.map((r) => (
        <button key={r.name} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left">
          <Avatar initials={r.initials} color={r.color} size={34} />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-[#111827] truncate">{r.name}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {r.tags.map((t) => <GreyTag key={t} label={t} />)}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
        </button>
      ))}
    </SectionCard>
  );
}

function GroupRow({ name, members, area, color }: { name: string; members: string; area: string; color: string }) {
  const [joined, setJoined] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}1A` }}>
        <Users className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111827] truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-[#9CA3AF]">{members} members</span>
          <span className="text-[#D1D5DB]">·</span>
          <GreyTag label={area} />
        </div>
      </div>
      <button
        onClick={() => setJoined(!joined)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
        style={joined ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" } : { background: "#fff", color: NAVY, border: `1px solid ${NAVY}` }}
      >
        {joined ? "Joined" : "Join"}
      </button>
    </div>
  );
}

function PopularGroups() {
  const groups = [
    { name: "ML for Science", members: "28.1k", area: "Machine Learning", color: "#7C3AED" },
    { name: "Computational Imaging Hub", members: "12.4k", area: "Imaging", color: "#1D4ED8" },
    { name: "Medical AI Network", members: "9.3k", area: "Medical AI", color: "#059669" },
  ];
  return (
    <SectionCard title="Popular Groups in This Field" icon={<Users className="w-4 h-4" />}
      action={<button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">Browse <ChevronRight className="w-3 h-3" /></button>}
      bodyClass="divide-y divide-[#F3F4F6]"
    >
      {groups.map((g) => <GroupRow key={g.name} {...g} />)}
    </SectionCard>
  );
}

/* ────────────────────────────────────────────
   EMPTY TAB PLACEHOLDER
   ──────────────────────────────────────────── */

function TabPlaceholder({ tab }: { tab: string }) {
  const meta: Record<string, { icon: React.ElementType; text: string }> = {
    Products: { icon: Package, text: "All 6 research products would appear here." },
    Following: { icon: Users, text: "128 researchers Dr. Kim follows would appear here." },
  };
  const m = meta[tab];
  if (!m) return null;
  const Icon = m.icon;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] py-16 flex flex-col items-center justify-center text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div className="w-12 h-12 rounded-xl bg-[#EEF2F7] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" style={{ color: NAVY }} />
      </div>
      <p className="text-[15px] font-semibold text-[#111827]">{tab}</p>
      <p className="text-[13px] text-[#6B7280] mt-1 max-w-xs">{m.text}</p>
    </div>
  );
}

/* ════════════════════════════════════════════
   PUBLICATIONS TAB
   ════════════════════════════════════════════ */

interface Pub {
  id: number;
  featured?: boolean;
  type: "Article" | "Conference Paper" | "Preprint" | "Book Chapter";
  fullText: boolean;
  thumbnail?: boolean;
  thumbnailColor?: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  tags: string[];
  citations: number;
}

const PUBS: Pub[] = [
  {
    id: 1, featured: true, type: "Article", fullText: true,
    title: "Physics-informed self-supervised segmentation for label-scarce fluorescence microscopy",
    authors: ["S. Kim", "L. Tanaka", "R. Mehta"],
    journal: "NeurIPS", year: 2024,
    doi: "10.48550/arXiv.2412.00234",
    abstract: "We introduce a self-supervised framework that embeds optical point-spread priors into a segmentation network, achieving near-supervised performance with fewer than 10 labeled examples per class. Experiments on three fluorescence microscopy benchmarks demonstrate significant improvements over existing label-efficient methods.",
    tags: ["Machine Learning", "Microscopy", "Segmentation"], citations: 87,
  },
  {
    id: 2, type: "Conference Paper", fullText: true, thumbnail: true, thumbnailColor: "#1D4ED8",
    title: "Uncertainty-aware diffusion priors for accelerated MRI reconstruction",
    authors: ["S. Kim", "R. Mehta", "D. Park"],
    journal: "MICCAI", year: 2025,
    doi: "10.1007/978-3-031-MICCAI25",
    abstract: "We propose a score-based diffusion model incorporating uncertainty estimates that consistently outperforms deterministic baselines on accelerated MRI reconstruction across multiple undersampling factors.",
    tags: ["Diffusion Models", "MRI", "Medical Imaging"], citations: 34,
  },
  {
    id: 3, type: "Article", fullText: false,
    title: "Learning optical physics priors for inverse scattering in computational microscopy",
    authors: ["S. Kim", "C. Wu"],
    journal: "Nature Methods", year: 2024,
    doi: "10.1038/s41592-024-02234-x",
    abstract: "This paper presents a differentiable physics layer that encodes wave optics into deep reconstruction networks, enabling accurate inverse scattering solutions without paired training data.",
    tags: ["Computational Microscopy", "Inverse Problems", "Physics ML"], citations: 112,
  },
  {
    id: 4, type: "Conference Paper", fullText: true, thumbnail: true, thumbnailColor: "#7C3AED",
    title: "Sparse view CT reconstruction via physics-constrained score matching",
    authors: ["S. Kim", "P. Sharma", "O. Farouk"],
    journal: "ICCV", year: 2024,
    doi: "10.1109/ICCV.2024.00214",
    abstract: "We extend score-based generative models with sinogram consistency constraints, enabling robust CT reconstruction from as few as 60 projections with no supervised training signal.",
    tags: ["CT Reconstruction", "Score Matching", "Medical Imaging"], citations: 29,
  },
  {
    id: 5, type: "Preprint", fullText: true,
    title: "Self-supervised denoising for cryo-EM via bootstrap noise2noise",
    authors: ["S. Kim", "L. Tanaka"],
    journal: "arXiv", year: 2024,
    doi: "10.48550/arXiv.2411.05623",
    abstract: "We propose Bootstrap-N2N, a self-supervised denoising method for cryo-electron microscopy that generates paired noisy image pairs from a single noisy observation via data augmentation.",
    tags: ["Cryo-EM", "Denoising", "Self-Supervised"], citations: 18,
  },
  {
    id: 6, type: "Article", fullText: false,
    title: "Benchmark evaluation of learned reconstruction methods for fluorescence microscopy",
    authors: ["S. Kim", "R. Mehta", "D. Park", "+3"],
    journal: "Bioinformatics", year: 2023,
    doi: "10.1093/bioinformatics/btad234",
    abstract: "A comprehensive benchmark of 12 deep learning reconstruction models across 6 fluorescence microscopy datasets, providing standardised metrics and reproducible evaluation code.",
    tags: ["Benchmark", "Microscopy", "Reproducibility"], citations: 51,
  },
  {
    id: 7, type: "Conference Paper", fullText: true,
    title: "Label propagation for 3D organelle segmentation in fluorescence images",
    authors: ["S. Kim", "C. Wu", "P. Sharma"],
    journal: "CVPR", year: 2023,
    doi: "10.1109/CVPR.2023.01234",
    abstract: "A graph-based label propagation approach for accurate 3D segmentation of organelles in volumetric fluorescence images, reducing annotation requirements by 85%.",
    tags: ["Segmentation", "Cell Biology", "Graph Neural Networks"], citations: 63,
  },
  {
    id: 8, type: "Article", fullText: false,
    title: "Implicit neural representations for continuous-resolution microscopy",
    authors: ["S. Kim"],
    journal: "ECCV", year: 2023,
    doi: "10.1007/978-3-031-ECCV23",
    abstract: "We leverage coordinate-based neural networks to represent microscopy images at arbitrary resolution, enabling super-resolution reconstruction without degrading to fixed-scale upsampling artifacts.",
    tags: ["Neural Rendering", "Microscopy", "NeRF"], citations: 44,
  },
];

/* ─── Shared action buttons for pub cards ─── */

function PubActionBar({
  pub,
  saved,
  onView,
  onSave,
  onDelete,
  onEdit,
  compact = false,
}: {
  pub: Pub;
  saved: boolean;
  onView: () => void;
  onSave: () => void;
  onDelete: () => void;
  onEdit: () => void;
  compact?: boolean;
}) {
  const [cited, setCited] = useState(false);
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${compact ? "" : "pt-3 mt-3 border-t border-[#F3F4F6]"}`}>
      <button onClick={onView} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] transition-colors">
        <Eye className="w-3.5 h-3.5" /> View
      </button>
      <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E5E7EB] transition-colors hover:bg-[#F8FAFC]"
        style={saved ? { color: NAVY, borderColor: "#BFDBFE", background: "#EFF6FF" } : { color: "#374151" }}>
        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1D4ED8] text-[#1D4ED8]" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={() => setCited(!cited)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] transition-colors"
      >
        <Quote className="w-3.5 h-3.5" /> {cited ? "Cited!" : "Cite"}
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: TEAL }}>
        <Users className="w-3.5 h-3.5" /> Collaborate
      </button>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Inline Edit State ─── */

function PubInlineEdit({ pub, onSave, onCancel }: { pub: Pub; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-xl border-2 border-[#1D4ED8] bg-[#F8FBFF] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-4 h-4 text-[#1D4ED8]" />
        <span className="text-[13px] font-semibold text-[#1D4ED8]">Editing publication</span>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { label: "Title", defaultValue: pub.title, multiline: true },
          { label: "DOI", defaultValue: pub.doi },
          { label: "Journal / Conference", defaultValue: pub.journal },
          { label: "Year", defaultValue: String(pub.year) },
          { label: "Authors", defaultValue: pub.authors.join(", ") },
          { label: "Tags", defaultValue: pub.tags.join(", ") },
        ].map(({ label, defaultValue, multiline }) => (
          <div key={label}>
            <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">{label}</label>
            {multiline ? (
              <textarea defaultValue={defaultValue} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 resize-none" />
            ) : (
              <input defaultValue={defaultValue} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors" style={{ background: NAVY }}>
          <Check className="w-4 h-4" /> Save Changes
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          Cancel
        </button>
        <span className="ml-auto text-[11.5px] text-[#9CA3AF]">Changes saved optimistically via React Query</span>
      </div>
    </div>
  );
}

/* ─── Featured / Highlighted card (col-span-2) ─── */

function PubFeaturedCard({ pub, saved, onView, onSave, onDelete, onEdit, isEditing }: {
  pub: Pub; saved: boolean; onView: () => void; onSave: () => void;
  onDelete: () => void; onEdit: () => void; isEditing: boolean;
}) {
  if (isEditing) return <div className="col-span-2"><PubInlineEdit pub={pub} onSave={onEdit} onCancel={onEdit} /></div>;
  return (
    <div className="col-span-2 bg-[#F8FBFF] rounded-xl border border-[#BFDBFE] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}>
      <div className="h-[3px] bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA]" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Featured
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
            <FileText className="w-3 h-3" /> {pub.type}
          </span>
          {pub.fullText && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
              <BookOpen className="w-3 h-3" /> Full-text available
            </span>
          )}
          <span className="ml-auto text-[12px] text-[#9CA3AF]">{pub.citations} citations</span>
        </div>
        <h3 onClick={onView} className="text-[17px] font-bold text-[#111827] leading-snug mb-2 cursor-pointer hover:text-[#1D4ED8] transition-colors">
          {pub.title}
        </h3>
        <p className="text-[12.5px] text-[#6B7280] mb-2">
          {pub.authors.join(", ")} · <span className="font-medium text-[#374151]">{pub.journal}</span> · {pub.year}
          <button className="ml-2 inline-flex items-center gap-1 text-[#2563EB] hover:underline">
            <ExternalLink className="w-3 h-3" /> {pub.doi}
          </button>
        </p>
        <p className="text-[13px] text-[#4B5563] leading-relaxed mb-3 line-clamp-2">{pub.abstract}</p>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {pub.tags.map((t) => <BlueTag key={t} label={t} />)}
        </div>
        <PubActionBar pub={pub} saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}

/* ─── Default card (1 col) ─── */

function PubDefaultCard({ pub, saved, onView, onSave, onDelete, onEdit, isEditing }: {
  pub: Pub; saved: boolean; onView: () => void; onSave: () => void;
  onDelete: () => void; onEdit: () => void; isEditing: boolean;
}) {
  if (isEditing) return <PubInlineEdit pub={pub} onSave={onEdit} onCancel={onEdit} />;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#CBD5E1] transition-colors" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
          <FileText className="w-3 h-3" /> {pub.type}
        </span>
        {pub.fullText && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
            <BookOpen className="w-3 h-3" /> Full-text available
          </span>
        )}
        <span className="ml-auto text-[11px] text-[#9CA3AF]">{pub.citations} citations</span>
      </div>
      <h3 onClick={onView} className="text-[14.5px] font-semibold text-[#111827] leading-snug mb-1.5 cursor-pointer hover:text-[#1D4ED8] transition-colors">
        {pub.title}
      </h3>
      <p className="text-[12px] text-[#6B7280] mb-2">
        {pub.authors.join(", ")} · <span className="font-medium text-[#374151]">{pub.journal}</span> · {pub.year}
      </p>
      <p className="text-[12.5px] text-[#4B5563] leading-relaxed mb-2.5 line-clamp-2">{pub.abstract}</p>
      <div className="flex flex-wrap gap-1.5">
        {pub.tags.map((t) => <GreyTag key={t} label={t} />)}
      </div>
      <PubActionBar pub={pub} saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}

/* ─── Thumbnail card (1 col) ─── */

function PubThumbnailCard({ pub, saved, onView, onSave, onDelete, onEdit, isEditing }: {
  pub: Pub; saved: boolean; onView: () => void; onSave: () => void;
  onDelete: () => void; onEdit: () => void; isEditing: boolean;
}) {
  if (isEditing) return <PubInlineEdit pub={pub} onSave={onEdit} onCancel={onEdit} />;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#CBD5E1] transition-colors" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="h-[100px]" style={{ background: `linear-gradient(135deg, ${pub.thumbnailColor ?? "#1D4ED8"}22 0%, ${pub.thumbnailColor ?? "#1D4ED8"}55 100%)` }}>
        <div className="h-full flex items-center justify-center opacity-30">
          <FileText className="w-10 h-10" style={{ color: pub.thumbnailColor ?? "#1D4ED8" }} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
            <FileText className="w-3 h-3" /> {pub.type}
          </span>
          {pub.fullText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
              <BookOpen className="w-3 h-3" /> Full-text available
            </span>
          )}
        </div>
        <h3 onClick={onView} className="text-[14px] font-semibold text-[#111827] leading-snug mb-1.5 cursor-pointer hover:text-[#1D4ED8] transition-colors">
          {pub.title}
        </h3>
        <p className="text-[12px] text-[#6B7280] mb-2">
          {pub.authors.join(", ")} · <span className="font-medium">{pub.journal}</span> · {pub.year}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {pub.tags.map((t) => <GreyTag key={t} label={t} />)}
        </div>
        <PubActionBar pub={pub} saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}

/* ─── Compact card (list row) ─── */

function PubCompactCard({ pub, saved, onView, onSave, onDelete, onEdit, isEditing }: {
  pub: Pub; saved: boolean; onView: () => void; onSave: () => void;
  onDelete: () => void; onEdit: () => void; isEditing: boolean;
}) {
  if (isEditing) return <PubInlineEdit pub={pub} onSave={onEdit} onCancel={onEdit} />;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 hover:border-[#CBD5E1] transition-colors flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EFF6FF]">
        <FileText className="w-4 h-4 text-[#1D4ED8]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 onClick={onView} className="text-[13.5px] font-semibold text-[#111827] leading-snug truncate cursor-pointer hover:text-[#1D4ED8] transition-colors">
          {pub.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11.5px] text-[#6B7280]">{pub.journal} · {pub.year}</span>
          <span className="text-[11px] text-[#9CA3AF]">·</span>
          <span className="text-[11px] text-[#9CA3AF]">{pub.citations} citations</span>
          {pub.tags.slice(0, 2).map((t) => <GreyTag key={t} label={t} />)}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onView} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={onSave} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1D4ED8] text-[#1D4ED8]" : ""}`} />
        </button>
        <button onClick={onEdit} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ─── Publication Detail Modal ─── */

function PubDetailModal({ pub, saved, onSave, onClose, onEdit, onDelete }: {
  pub: Pub; saved: boolean; onSave: () => void; onClose: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const authorColors = ["#1D4ED8", "#7C3AED", "#059669", "#DC2626"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[820px] max-h-[85vh] overflow-y-auto relative"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-[#1F3A5F] via-[#2B527E] to-[#2EC4B6] rounded-t-2xl" />

        <div className="p-7">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
                <FileText className="w-3 h-3" /> {pub.type}
              </span>
              {pub.featured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Featured
                </span>
              )}
              {pub.fullText && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
                  <BookOpen className="w-3 h-3" /> Full-text available
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="relative">
                <button onClick={() => setShowMore(!showMore)} className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMore && (
                  <div className="absolute right-0 top-9 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 py-1 w-36" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {[
                      { icon: Edit3, label: "Edit", action: onEdit },
                      { icon: Star, label: "Highlight", action: () => {} },
                      { icon: Trash2, label: "Delete", action: onDelete, danger: true },
                    ].map(({ icon: Icon, label, action, danger }) => (
                      <button key={label} onClick={() => { action(); setShowMore(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
                        style={{ color: danger ? "#DC2626" : "#374151" }}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-[#111827] leading-snug mb-3">{pub.title}</h2>

          {/* Authors */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {pub.authors.map((a, i) => (
              <div key={a} className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: `${authorColors[i % 4]}22`, color: authorColors[i % 4], border: `1px solid ${authorColors[i % 4]}33` }}>
                  {a.slice(0, 2)}
                </div>
                <span className="text-[13px] font-medium text-[#374151]">{a}</span>
                {i < pub.authors.length - 1 && <span className="text-[#D1D5DB]">·</span>}
              </div>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[13px] text-[#6B7280] flex-wrap mb-4 pb-4 border-b border-[#F3F4F6]">
            <span className="font-semibold text-[#374151]">{pub.journal}</span>
            <span>·</span>
            <span>{pub.year}</span>
            <span>·</span>
            <span className="font-semibold text-[#374151]">{pub.citations} citations</span>
            <button className="flex items-center gap-1 text-[#2563EB] hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> {pub.doi}
            </button>
          </div>

          {/* Abstract */}
          <div className="mb-4">
            <h4 className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Abstract</h4>
            <p className="text-[14px] text-[#4B5563] leading-relaxed">{pub.abstract}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {pub.tags.map((t) => <BlueTag key={t} label={t} />)}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[#F3F4F6]">
            {pub.fullText && (
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
                <Download className="w-4 h-4" /> Download PDF
              </button>
            )}
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
              style={saved ? { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" } : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-[#1D4ED8]" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
              <Quote className="w-4 h-4" /> Cite
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white hover:opacity-90" style={{ background: TEAL }}>
              <Users className="w-4 h-4" /> Collaborate
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
              <MessageCircle className="w-4 h-4" /> Message Authors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */

function PubDeleteModal({ pub, onConfirm, onCancel }: { pub: Pub; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-[440px] p-7 relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]">
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-[#DC2626]" />
        </div>
        <h3 className="text-[17px] font-bold text-[#111827] mb-2">Delete publication from profile?</h3>
        <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-1">
          This will remove <span className="font-semibold text-[#374151]">"{pub.title.slice(0, 60)}…"</span> from your LabScity profile.
        </p>
        <p className="text-[12.5px] text-[#9CA3AF] leading-relaxed mb-6">
          This only removes the publication from your profile. The original record in OpenAlex is not affected. You can re-import it later via DOI or ORCID.
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onConfirm} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DOI Modal ─── */

function PubDOIModal({ onClose }: { onClose: () => void }) {
  const [doiInput, setDoiInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const preview = { title: "Uncertainty-aware diffusion priors for accelerated MRI reconstruction", journal: "MICCAI 2025", authors: "S. Kim, R. Mehta, D. Park", doi: doiInput || "10.1007/example-doi" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[540px] p-7 relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2F7] flex items-center justify-center">
            <Link2 className="w-5 h-5" style={{ color: NAVY }} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#111827]">Add via DOI</h3>
            <p className="text-[12.5px] text-[#6B7280]">Metadata fetched from OpenAlex</p>
          </div>
        </div>

        {state !== "preview" && (
          <div className="flex gap-2 mb-4">
            <input
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              placeholder="e.g. 10.1038/s41592-024-02234-x"
              className="flex-1 px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10"
            />
            <button
              onClick={() => { setState("loading"); setTimeout(() => setState("preview"), 1400); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: NAVY }}
            >
              {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch
            </button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex items-center gap-3 py-5 justify-center text-[#6B7280]">
            <Loader2 className="w-5 h-5 animate-spin text-[#1D4ED8]" />
            <span className="text-[13.5px]">Fetching metadata from OpenAlex…</span>
          </div>
        )}

        {state === "preview" && (
          <div className="rounded-xl border border-[#BFDBFE] bg-[#F8FBFF] p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#15803D]">
                <Check className="w-3 h-3" /> Found
              </span>
              <span className="text-[11.5px] text-[#9CA3AF]">via OpenAlex</span>
            </div>
            <p className="text-[14px] font-semibold text-[#111827] leading-snug mb-1">{preview.title}</p>
            <p className="text-[12.5px] text-[#6B7280]">{preview.authors} · {preview.journal}</p>
            <p className="text-[11.5px] text-[#2563EB] mt-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> {preview.doi}
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 mb-4 text-[13px] text-[#DC2626]">
            DOI not found in OpenAlex. Check the format or try a different identifier.
          </div>
        )}

        <div className="flex items-center gap-2">
          {state === "preview" ? (
            <>
              <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white" style={{ background: NAVY }}>
                <Plus className="w-4 h-4" /> Add to Profile
              </button>
              <button onClick={() => setState("idle")} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">
                Try another
              </button>
            </>
          ) : (
            <button onClick={onClose} className="ml-auto px-4 py-2 rounded-lg text-[13px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ORCID Modal ─── */

function PubORCIDModal({ onClose }: { onClose: () => void }) {
  const [orcidInput, setOrcidInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "review">("idle");
  const reviewPubs = PUBS.slice(0, 4);
  const [selected, setSelected] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const toggleSel = (id: number) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-7">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#A6CE3922" }}>
              <BadgeCheck className="w-5 h-5" style={{ color: "#A6CE39" }} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111827]">Link ORCID iD</h3>
              <p className="text-[12.5px] text-[#6B7280]">Publications fetched from OpenAlex using your ORCID</p>
            </div>
          </div>

          {state === "idle" && (
            <>
              <p className="text-[13px] text-[#6B7280] leading-relaxed my-4">
                Enter your ORCID iD to import publications via OpenAlex. You can review each publication before adding it to your profile.
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  value={orcidInput}
                  onChange={(e) => setOrcidInput(e.target.value)}
                  placeholder="0000-0002-1825-0097"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-[13.5px] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10"
                />
                <button onClick={() => { setState("loading"); setTimeout(() => setState("review"), 1600); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
                  Fetch Publications
                </button>
              </div>
              <button onClick={onClose} className="text-[13px] text-[#6B7280] hover:underline">Cancel</button>
            </>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: NAVY }} />
              <p className="text-[14px] text-[#6B7280]">Fetching publications from OpenAlex…</p>
            </div>
          )}

          {state === "review" && (
            <>
              <div className="flex items-center justify-between my-4">
                <p className="text-[13.5px] font-semibold text-[#111827]">{reviewPubs.length} publications found</p>
                <span className="text-[12px] text-[#6B7280]">{selected.size} selected</span>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {reviewPubs.map((p) => (
                  <label key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E7EB] cursor-pointer hover:border-[#BFDBFE] hover:bg-[#F8FBFF] transition-colors">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSel(p.id)} className="mt-0.5 w-4 h-4 accent-[#1D4ED8]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#111827] leading-snug">{p.title}</p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">{p.authors.join(", ")} · {p.journal} · {p.year}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {p.tags.slice(0, 2).map((t) => <GreyTag key={t} label={t} />)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white" style={{ background: NAVY }}>
                  <Plus className="w-4 h-4" /> Import {selected.size} Publications
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Publications Control Header (sticky) ─── */

function PublicationsControlHeader({
  search, onSearch, viewMode, onViewMode, onAddDOI, onORCID,
}: {
  search: string; onSearch: (v: string) => void;
  viewMode: "grid" | "compact"; onViewMode: (v: "grid" | "compact") => void;
  onAddDOI: () => void; onORCID: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#F3F4F6] px-5 py-3.5" style={{ backdropFilter: "blur(4px)" }}>
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#111827]">Publications</h2>
          <p className="text-[12px] text-[#9CA3AF]">24 publications from Dr. Sarah Kim</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddDOI} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Add via DOI
          </button>
          <button onClick={onORCID} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Re-Sync ORCID
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white" style={{ background: NAVY }}>
            <Plus className="w-3.5 h-3.5" /> Add Publication
          </button>
          <div className="flex items-center rounded-lg border border-[#E5E7EB] overflow-hidden">
            <button onClick={() => onViewMode("grid")} className="p-1.5 transition-colors" style={viewMode === "grid" ? { background: "#EEF2F7", color: NAVY } : { color: "#9CA3AF" }}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => onViewMode("compact")} className="p-1.5 transition-colors" style={viewMode === "compact" ? { background: "#EEF2F7", color: NAVY } : { color: "#9CA3AF" }}>
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search publications..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:bg-white transition-all"
          />
        </div>
        {["Year", "Research Area", "Type"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F8FAFC] transition-colors">
            {f} <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F8FAFC] transition-colors ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" /> Sort: Most Recent <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
      </div>
    </div>
  );
}

/* ─── Publications Tab — main component ─── */

function PublicationsTab() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([1]));
  const [detailPub, setDetailPub] = useState<Pub | null>(null);
  const [deletePub, setDeletePub] = useState<Pub | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDOI, setShowDOI] = useState(false);
  const [showORCID, setShowORCID] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const toggleSave = (id: number) =>
    setSavedIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const confirmDelete = (pub: Pub) => {
    setDeletedIds((s) => new Set(s).add(pub.id));
    setDeletePub(null);
    if (detailPub?.id === pub.id) setDetailPub(null);
  };

  const filteredPubs = PUBS.filter(
    (p) => !deletedIds.has(p.id) && (
      !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const cardProps = (pub: Pub) => ({
    pub,
    saved: savedIds.has(pub.id),
    onView: () => setDetailPub(pub),
    onSave: () => toggleSave(pub.id),
    onDelete: () => setDeletePub(pub),
    onEdit: () => setEditingId(editingId === pub.id ? null : pub.id),
    isEditing: editingId === pub.id,
  });

  return (
    <>
      <div
        className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)", height: "720px", overflowY: "auto" }}
      >
        <PublicationsControlHeader
          search={search} onSearch={setSearch}
          viewMode={viewMode} onViewMode={setViewMode}
          onAddDOI={() => setShowDOI(true)}
          onORCID={() => setShowORCID(true)}
        />

        <div className="p-4">
          {filteredPubs.length === 0 ? (
            /* Empty / filtered state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#EEF2F7] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7" style={{ color: NAVY }} />
              </div>
              {search ? (
                <>
                  <p className="text-[15px] font-semibold text-[#111827]">No publications match these filters.</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">Try clearing filters or importing from DOI / ORCID.</p>
                  <button onClick={() => setSearch("")} className="mt-4 px-4 py-2 rounded-lg border border-[#D1D5DB] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[16px] font-bold text-[#111827]">Add your first publication</p>
                  <p className="text-[13.5px] text-[#6B7280] mt-1 max-w-sm leading-relaxed">
                    Build your research profile by importing publications through DOI or linking your ORCID iD.
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={() => setShowDOI(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
                      <Link2 className="w-4 h-4" /> Add via DOI
                    </button>
                    <button onClick={() => setShowORCID(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">
                      <BadgeCheck className="w-4 h-4" style={{ color: "#A6CE39" }} /> Link ORCID iD
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid view */
            <div className="grid grid-cols-2 gap-4">
              {/* Featured card spans both columns */}
              {filteredPubs[0] && !filteredPubs[0].thumbnail && (
                <PubFeaturedCard key={filteredPubs[0].id} {...cardProps(filteredPubs[0])} />
              )}
              {/* Remaining cards: thumbnail or default */}
              {filteredPubs.slice(filteredPubs[0]?.featured ? 1 : 0).map((pub) =>
                pub.thumbnail ? (
                  <PubThumbnailCard key={pub.id} {...cardProps(pub)} />
                ) : (
                  <PubDefaultCard key={pub.id} {...cardProps(pub)} />
                )
              )}
              {/* Loading indicator */}
              <div className="col-span-2 flex items-center justify-center gap-2 py-5 text-[#9CA3AF]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[13px]">Loading more publications…</span>
              </div>
            </div>
          ) : (
            /* Compact list view */
            <div className="flex flex-col gap-2">
              {filteredPubs.map((pub) => (
                <PubCompactCard key={pub.id} {...cardProps(pub)} />
              ))}
              <div className="flex items-center justify-center gap-2 py-5 text-[#9CA3AF]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[13px]">Loading more publications…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailPub && (
        <PubDetailModal
          pub={detailPub}
          saved={savedIds.has(detailPub.id)}
          onSave={() => toggleSave(detailPub.id)}
          onClose={() => setDetailPub(null)}
          onEdit={() => { setEditingId(detailPub.id); setDetailPub(null); }}
          onDelete={() => { setDeletePub(detailPub); setDetailPub(null); }}
        />
      )}
      {deletePub && (
        <PubDeleteModal pub={deletePub} onConfirm={() => confirmDelete(deletePub)} onCancel={() => setDeletePub(null)} />
      )}
      {showDOI && <PubDOIModal onClose={() => setShowDOI(false)} />}
      {showORCID && <PubORCIDModal onClose={() => setShowORCID(false)} />}
    </>
  );
}

/* ════════════════════════════════════════════
   PRODUCTS TAB
   ════════════════════════════════════════════ */

type ProductType = "Tool" | "Dataset" | "Model" | "Website" | "Platform" | "Prototype";
type ProductStatus = "Active" | "Prototype" | "Archived" | "Open Source";

interface Product {
  id: number;
  featured?: boolean;
  type: ProductType;
  status: ProductStatus;
  carousel?: boolean;
  accent?: string;
  title: string;
  contributors: string[];
  summary: string;
  description: string;
  website?: string;
  github?: string;
  doi?: string;
  tags: string[];
  saves: number;
  updated: string;
  relatedPub?: string;
}

const PRODUCT_TYPE_ICON: Record<ProductType, React.ElementType> = {
  Tool: Wrench,
  Dataset: Database,
  Model: Cpu,
  Website: Globe,
  Platform: AppWindow,
  Prototype: FlaskConical,
};

function statusStyle(status: ProductStatus): React.CSSProperties {
  switch (status) {
    case "Active":
      return { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" };
    case "Open Source":
      return { background: "#EEF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
    case "Prototype":
      return { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" };
    case "Archived":
      return { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" };
  }
}

const PRODUCTS: Product[] = [
  {
    id: 1, featured: true, type: "Platform", status: "Active", carousel: true, accent: "#2EC4B6",
    title: "Collaborative Microscopy Analytics Platform",
    contributors: ["S. Kim", "L. Tanaka", "R. Mehta"],
    summary: "A browser-based platform for collaborative annotation, segmentation, and quantitative analysis of large fluorescence microscopy datasets.",
    description: "The Collaborative Microscopy Analytics Platform lets distributed research teams co-annotate terabyte-scale microscopy volumes in real time. It integrates physics-informed segmentation models, a versioned annotation store, and reproducible analysis pipelines. Built on a WebGL viewer with server-side tiling, it streams only the visible region of interest, enabling smooth navigation of whole-slide images directly in the browser.",
    website: "microanalytics.mit.edu", github: "skim-lab/micro-analytics", doi: "10.5281/zenodo.10842217",
    tags: ["Microscopy", "Web Tool", "Machine Learning", "Open Source"], saves: 214, updated: "Updated 3 days ago",
    relatedPub: "Physics-informed self-supervised segmentation for label-scarce fluorescence microscopy",
  },
  {
    id: 2, type: "Model", status: "Open Source", accent: "#1D4ED8",
    title: "Neural Reconstruction Engine for Computational Optics",
    contributors: ["S. Kim", "C. Wu"],
    summary: "Pretrained differentiable optics models for inverse scattering and computational microscopy reconstruction.",
    description: "A model registry of differentiable wave-optics reconstruction networks, packaged with pretrained checkpoints and a clean inference API. Includes physics layers for inverse scattering, deconvolution, and phase retrieval, with reproducible training recipes for each released checkpoint.",
    github: "skim-lab/neural-optics", doi: "10.48550/arXiv.2412.00911",
    tags: ["Neural Rendering", "Scientific Computing", "Open Source"], saves: 168, updated: "Updated 1 week ago",
  },
  {
    id: 3, type: "Tool", status: "Open Source", carousel: true, accent: "#7C3AED",
    title: "BioImage Segmentation Toolkit",
    contributors: ["S. Kim", "P. Sharma", "O. Farouk"],
    summary: "A Python toolkit for label-efficient 2D/3D segmentation of cells and organelles in microscopy images.",
    description: "BioImage Segmentation Toolkit bundles self-supervised pretraining, active-learning loops, and export to common annotation formats. It ships with a napari plugin and a command-line interface, making it straightforward to integrate into existing image-analysis pipelines.",
    website: "bioseg.readthedocs.io", github: "skim-lab/bioseg",
    tags: ["Segmentation", "Research Software", "Computer Vision"], saves: 132, updated: "Updated 2 weeks ago",
  },
  {
    id: 4, type: "Dataset", status: "Active", accent: "#059669",
    title: "OpenLab Dataset Hub",
    contributors: ["S. Kim", "L. Tanaka"],
    summary: "Curated, versioned benchmark datasets for fluorescence microscopy reconstruction and segmentation.",
    description: "OpenLab Dataset Hub hosts six standardized microscopy benchmarks with consistent metadata, train/val/test splits, and evaluation scripts. Every release is versioned and citable, with DOIs minted through Zenodo for reproducible reporting.",
    website: "openlab-hub.org", doi: "10.5281/zenodo.10984412",
    tags: ["Dataset", "Microscopy", "Reproducibility"], saves: 97, updated: "Updated 5 days ago",
  },
  {
    id: 5, type: "Website", status: "Active", accent: "#0EA5E9",
    title: "HCI Study Recruitment Portal",
    contributors: ["S. Kim", "D. Park"],
    summary: "A lightweight portal for recruiting and scheduling participants for human-subject imaging studies.",
    description: "The HCI Study Recruitment Portal handles participant screening, consent collection, and scheduling for lab studies. It includes a configurable eligibility questionnaire and calendar integration, reducing coordinator overhead for multi-session studies.",
    website: "recruit.skimlab.org",
    tags: ["Web Tool", "Research Software"], saves: 41, updated: "Updated 3 weeks ago",
  },
  {
    id: 6, type: "Prototype", status: "Prototype", accent: "#F59E0B",
    title: "Climate Model Visualization Dashboard",
    contributors: ["S. Kim", "R. Mehta", "+2"],
    summary: "An exploratory dashboard for interactive visualization of high-resolution climate simulation outputs.",
    description: "A research prototype exploring GPU-accelerated rendering of large climate model ensembles. Supports linked spatial-temporal views and on-the-fly aggregation. Currently an early prototype intended to validate the interaction model before a production rebuild.",
    github: "skim-lab/climate-viz",
    tags: ["Scientific Computing", "Web Tool", "Visualization"], saves: 23, updated: "Updated 1 month ago",
  },
];

/* ─── Shared action buttons for product cards ─── */

function ProdActionBar({ saved, onView, onSave, onDelete, onEdit }: {
  saved: boolean; onView: () => void; onSave: () => void; onDelete: () => void; onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-3 mt-3 border-t border-[#F3F4F6]">
      <button onClick={onView} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] transition-colors">
        <ExternalLink className="w-3.5 h-3.5" /> View Project
      </button>
      <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-[#E5E7EB] transition-colors hover:bg-[#F8FAFC]"
        style={saved ? { color: NAVY, borderColor: "#BFDBFE", background: "#EFF6FF" } : { color: "#374151" }}>
        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1D4ED8] text-[#1D4ED8]" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: TEAL }}>
        <Users className="w-3.5 h-3.5" /> Collaborate
      </button>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Type + status badge row ─── */

function ProdBadges({ product, size = "sm" }: { product: Product; size?: "sm" | "md" }) {
  const TypeIcon = PRODUCT_TYPE_ICON[product.type];
  const px = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  const fs = size === "md" ? "text-[11.5px]" : "text-[11px]";
  return (
    <>
      <span className={`inline-flex items-center gap-1 ${px} rounded-full ${fs} font-medium bg-[#EEF6FF] text-[#1D4ED8]`}>
        <TypeIcon className="w-3 h-3" /> {product.type}
      </span>
      <span className={`inline-flex items-center gap-1 ${px} rounded-full ${fs} font-medium`} style={statusStyle(product.status)}>
        {product.status === "Open Source" ? <GitFork className="w-3 h-3" /> : product.status === "Archived" ? <Archive className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />}
        {product.status}
      </span>
    </>
  );
}

/* ─── External link chips (website / github / doi) ─── */

function ProdLinks({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-2.5">
      {product.website && (
        <button className="inline-flex items-center gap-1 text-[11.5px] text-[#2563EB] hover:underline">
          <Globe className="w-3.5 h-3.5" /> {product.website}
        </button>
      )}
      {product.github && (
        <button className="inline-flex items-center gap-1 text-[11.5px] text-[#374151] hover:underline">
          <Github className="w-3.5 h-3.5" /> {product.github}
        </button>
      )}
      {product.doi && (
        <button className="inline-flex items-center gap-1 text-[11.5px] text-[#2563EB] hover:underline">
          <Link2 className="w-3.5 h-3.5" /> {product.doi}
        </button>
      )}
    </div>
  );
}

/* ─── Image carousel preview ─── */

function ProdCarousel({ accent, height = 150 }: { accent: string; height?: number }) {
  const [idx, setIdx] = useState(0);
  const slides = [
    { from: `${accent}33`, to: `${accent}66` },
    { from: "#1F3A5F22", to: "#1F3A5F55" },
    { from: "#2EC4B622", to: "#2EC4B655" },
  ];
  const s = slides[idx];
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${s.from} 0%, ${s.to} 100%)` }}>
        <ImageIcon className="w-8 h-8 opacity-40" style={{ color: accent }} />
      </div>
      <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-sm">
        <ChevronLeft className="w-4 h-4 text-[#374151]" />
      </button>
      <button onClick={() => setIdx((idx + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-sm">
        <ChevronRight className="w-4 h-4 text-[#374151]" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all" style={{ width: i === idx ? 16 : 6, height: 6, background: i === idx ? accent : "rgba(255,255,255,0.7)" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Inline edit state ─── */

function ProdInlineEdit({ product, onSave, onCancel }: { product: Product; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-xl border-2 border-[#1D4ED8] bg-[#F8FBFF] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-4 h-4 text-[#1D4ED8]" />
        <span className="text-[13px] font-semibold text-[#1D4ED8]">Editing product</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Product Title</label>
          <input defaultValue={product.title} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Short Summary</label>
          <textarea defaultValue={product.summary} rows={2} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 resize-none" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Product Type</label>
          <select defaultValue={product.type} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] bg-white">
            {(["Tool", "Dataset", "Model", "Website", "Platform", "Prototype"] as ProductType[]).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Status</label>
          <select defaultValue={product.status} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] bg-white">
            {(["Active", "Prototype", "Archived", "Open Source"] as ProductStatus[]).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Website Link</label>
          <input defaultValue={product.website ?? ""} placeholder="https://" className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">GitHub Link</label>
          <input defaultValue={product.github ?? ""} placeholder="owner/repo" className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">DOI Link</label>
          <input defaultValue={product.doi ?? ""} placeholder="10.xxxx/..." className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Contributors</label>
          <input defaultValue={product.contributors.join(", ")} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Tags / Research Areas</label>
          <input defaultValue={product.tags.join(", ")} className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors" style={{ background: NAVY }}>
          <Check className="w-4 h-4" /> Save Changes
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          Cancel
        </button>
        <span className="ml-auto text-[11.5px] text-[#9CA3AF]">Changes saved optimistically via React Query</span>
      </div>
    </div>
  );
}

type ProdCardProps = {
  product: Product; saved: boolean; onView: () => void; onSave: () => void;
  onDelete: () => void; onEdit: () => void; isEditing: boolean;
};

/* ─── Featured / Highlighted card (col-span-2) ─── */

function ProdFeaturedCard({ product, saved, onView, onSave, onDelete, onEdit, isEditing }: ProdCardProps) {
  if (isEditing) return <div className="col-span-2"><ProdInlineEdit product={product} onSave={onEdit} onCancel={onEdit} /></div>;
  const accent = product.accent ?? "#2EC4B6";
  return (
    <div className="col-span-2 bg-white rounded-xl border border-[#BFDBFE] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}>
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${NAVY}, ${accent})` }} />
      <div className="flex">
        {product.carousel && (
          <div className="w-[280px] flex-shrink-0 border-r border-[#F1F5F9]">
            <ProdCarousel accent={accent} height={232} />
          </div>
        )}
        <div className="p-5 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Featured
            </span>
            <ProdBadges product={product} size="md" />
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-[#9CA3AF]"><Bookmark className="w-3.5 h-3.5" /> {product.saves}</span>
          </div>
          <h3 onClick={onView} className="text-[17px] font-bold text-[#111827] leading-snug mb-1.5 cursor-pointer hover:text-[#1D4ED8] transition-colors">
            {product.title}
          </h3>
          <p className="text-[12.5px] text-[#6B7280] mb-2">{product.contributors.join(", ")} · {product.updated}</p>
          <p className="text-[13px] text-[#4B5563] leading-relaxed mb-2.5 line-clamp-2">{product.summary}</p>
          <ProdLinks product={product} />
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((t) => <BlueTag key={t} label={t} />)}
          </div>
          <ProdActionBar saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
}

/* ─── Default card (1 col) ─── */

function ProdDefaultCard({ product, saved, onView, onSave, onDelete, onEdit, isEditing }: ProdCardProps) {
  if (isEditing) return <ProdInlineEdit product={product} onSave={onEdit} onCancel={onEdit} />;
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#CBD5E1] transition-colors flex flex-col" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <ProdBadges product={product} />
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]"><Bookmark className="w-3 h-3" /> {product.saves}</span>
      </div>
      <h3 onClick={onView} className="text-[14.5px] font-semibold text-[#111827] leading-snug mb-1 cursor-pointer hover:text-[#1D4ED8] transition-colors">
        {product.title}
      </h3>
      <p className="text-[12px] text-[#6B7280] mb-2">{product.contributors.join(", ")} · {product.updated}</p>
      <p className="text-[12.5px] text-[#4B5563] leading-relaxed mb-2.5 line-clamp-2">{product.summary}</p>
      <ProdLinks product={product} />
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {product.tags.map((t) => <GreyTag key={t} label={t} />)}
      </div>
      <ProdActionBar saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}

/* ─── Carousel card (1 col, image preview) ─── */

function ProdCarouselCard({ product, saved, onView, onSave, onDelete, onEdit, isEditing }: ProdCardProps) {
  if (isEditing) return <ProdInlineEdit product={product} onSave={onEdit} onCancel={onEdit} />;
  const accent = product.accent ?? "#1D4ED8";
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#CBD5E1] transition-colors flex flex-col" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <ProdCarousel accent={accent} height={140} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <ProdBadges product={product} />
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]"><Bookmark className="w-3 h-3" /> {product.saves}</span>
        </div>
        <h3 onClick={onView} className="text-[14px] font-semibold text-[#111827] leading-snug mb-1 cursor-pointer hover:text-[#1D4ED8] transition-colors">
          {product.title}
        </h3>
        <p className="text-[12px] text-[#6B7280] mb-2">{product.contributors.join(", ")} · {product.updated}</p>
        <p className="text-[12.5px] text-[#4B5563] leading-relaxed mb-2.5 line-clamp-2">{product.summary}</p>
        <ProdLinks product={product} />
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {product.tags.map((t) => <GreyTag key={t} label={t} />)}
        </div>
        <ProdActionBar saved={saved} onView={onView} onSave={onSave} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}

/* ─── Compact card (list row) ─── */

function ProdCompactCard({ product, saved, onView, onSave, onDelete, onEdit, isEditing }: ProdCardProps) {
  if (isEditing) return <ProdInlineEdit product={product} onSave={onEdit} onCancel={onEdit} />;
  const accent = product.accent ?? "#1D4ED8";
  const TypeIcon = PRODUCT_TYPE_ICON[product.type];
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3 hover:border-[#CBD5E1] transition-colors flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}1a` }}>
        <TypeIcon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 onClick={onView} className="text-[13.5px] font-semibold text-[#111827] leading-snug truncate cursor-pointer hover:text-[#1D4ED8] transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11.5px] text-[#6B7280]">{product.type} · {product.updated}</span>
          <span className="text-[11px] text-[#9CA3AF]">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]"><Bookmark className="w-3 h-3" /> {product.saves}</span>
          {product.tags.slice(0, 2).map((t) => <GreyTag key={t} label={t} />)}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onView} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={onSave} className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1D4ED8] text-[#1D4ED8]" : ""}`} />
        </button>
        <button onClick={onEdit} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ─── Product Detail Modal ─── */

function ProdDetailModal({ product, saved, onSave, onClose, onEdit, onDelete }: {
  product: Product; saved: boolean; onSave: () => void; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const accent = product.accent ?? "#2EC4B6";
  const contribColors = ["#1D4ED8", "#7C3AED", "#059669", "#DC2626"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[840px] max-h-[85vh] overflow-y-auto relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${NAVY}, ${accent})` }} />
        <div className="p-7">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <ProdBadges product={product} size="md" />
              {product.featured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Featured
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="relative">
                <button onClick={() => setShowMore(!showMore)} className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMore && (
                  <div className="absolute right-0 top-9 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 py-1 w-36" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {[
                      { icon: Edit3, label: "Edit", action: onEdit },
                      { icon: Star, label: "Feature", action: () => {} },
                      { icon: Archive, label: "Archive", action: () => {} },
                      { icon: Trash2, label: "Delete", action: onDelete, danger: true },
                    ].map(({ icon: Icon, label, action, danger }) => (
                      <button key={label} onClick={() => { action(); setShowMore(false); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
                        style={{ color: danger ? "#DC2626" : "#374151" }}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-[#111827] leading-snug mb-3">{product.title}</h2>

          {/* Contributors */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {product.contributors.map((c, i) => (
              <div key={c} className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: `${contribColors[i % 4]}22`, color: contribColors[i % 4], border: `1px solid ${contribColors[i % 4]}33` }}>
                  {c.replace(/[^A-Za-z]/g, "").slice(0, 2) || c.slice(0, 2)}
                </div>
                <span className="text-[13px] font-medium text-[#374151]">{c}</span>
                {i < product.contributors.length - 1 && <span className="text-[#D1D5DB]">·</span>}
              </div>
            ))}
            <span className="text-[12px] text-[#9CA3AF] ml-1 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {product.updated}</span>
          </div>

          {/* Carousel / preview */}
          <div className="rounded-xl overflow-hidden border border-[#F1F5F9] mb-4">
            <ProdCarousel accent={accent} height={220} />
          </div>

          {/* Description */}
          <div className="mb-4">
            <h4 className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">About this product</h4>
            <p className="text-[14px] text-[#4B5563] leading-relaxed">{product.description}</p>
          </div>

          {/* Links row */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {product.website && (
              <a className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                <Globe className="w-3.5 h-3.5" /> {product.website}
              </a>
            )}
            {product.github && (
              <a className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                <Github className="w-3.5 h-3.5" /> {product.github}
              </a>
            )}
            {product.doi && (
              <a className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-[#E5E7EB] text-[#2563EB] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                <Link2 className="w-3.5 h-3.5" /> {product.doi}
              </a>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.map((t) => <BlueTag key={t} label={t} />)}
          </div>

          {/* Related publication */}
          {product.relatedPub && (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3.5 mb-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEF6FF] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-0.5">Related publication</p>
                <p className="text-[13px] font-medium text-[#111827] leading-snug hover:text-[#1D4ED8] cursor-pointer">{product.relatedPub}</p>
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-[#F3F4F6]">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
              <ExternalLink className="w-4 h-4" /> View Project
            </button>
            <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
              style={saved ? { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" } : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}>
              <Bookmark className={`w-4 h-4 ${saved ? "fill-[#1D4ED8]" : ""}`} /> {saved ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white hover:opacity-90" style={{ background: TEAL }}>
              <Users className="w-4 h-4" /> Collaborate
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
              <MessageCircle className="w-4 h-4" /> Message Contributors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */

function ProdDeleteModal({ product, onConfirm, onCancel }: { product: Product; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-[440px] p-7 relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-[#DC2626]" />
        </div>
        <h3 className="text-[17px] font-bold text-[#111827] mb-2">Delete product from profile?</h3>
        <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-1">
          This will remove <span className="font-semibold text-[#374151]">"{product.title.slice(0, 60)}{product.title.length > 60 ? "…" : ""}"</span> from your LabScity profile.
        </p>
        <p className="text-[12.5px] text-[#9CA3AF] leading-relaxed mb-6">
          This only unlinks the product from your profile. The product record itself is not deleted, and collaborators keep their own links to it.
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onConfirm} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Product Modal ─── */

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [touched, setTouched] = useState(false);

  const parseUrl = (v: string) => {
    try { return new URL(/^https?:\/\//.test(v) ? v : `https://${v}`); } catch { return null; }
  };
  const titleErr = touched && !title.trim() ? "Product title is required." : touched && title.length > 90 ? "Title must be 90 characters or fewer." : "";
  const summaryErr = touched && !summary.trim() ? "Short summary is required." : "";
  const websiteHost = parseUrl(website);
  const websiteErr = touched && website && (!websiteHost || !websiteHost.hostname.includes(".")) ? "Enter a valid website link." : "";
  const githubHost = parseUrl(github);
  const githubErr = touched && github && (!githubHost || githubHost.hostname.replace(/^www\./, "") !== "github.com") ? "Enter a valid GitHub link (github.com/owner/repo)." : "";

  const inputCls = (err: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-[13.5px] text-[#111827] outline-none transition-colors ${err ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/10" : "border-[#D1D5DB] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10"}`;

  const ErrText = ({ msg }: { msg: string }) => msg ? (
    <p className="flex items-center gap-1 text-[11.5px] text-[#DC2626] mt-1"><AlertCircle className="w-3 h-3" /> {msg}</p>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[640px] max-h-[88vh] overflow-y-auto relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#F3F4F6] px-7 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2F7] flex items-center justify-center">
              <Package className="w-5 h-5" style={{ color: NAVY }} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111827]">Add research product</h3>
              <p className="text-[12.5px] text-[#6B7280]">Showcase software, datasets, models, and tools</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-7 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Product Title <span className="text-[#DC2626]">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. BioImage Segmentation Toolkit" className={inputCls(titleErr)} />
            <ErrText msg={titleErr} />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Short Summary <span className="text-[#DC2626]">*</span></label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="One or two sentences describing what this product does" className={`${inputCls(summaryErr)} resize-none`} />
            <ErrText msg={summaryErr} />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Longer Description</label>
            <textarea rows={3} placeholder="Provide more detail about capabilities, methods, and intended use" className={`${inputCls("")} resize-none`} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Product Type</label>
            <select className={`${inputCls("")} bg-white`}>
              {(["Tool", "Dataset", "Model", "Website", "Platform", "Prototype"] as ProductType[]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Status</label>
            <select className={`${inputCls("")} bg-white`}>
              {(["Active", "Prototype", "Archived", "Open Source"] as ProductStatus[]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Contributors</label>
            <input placeholder="e.g. S. Kim, L. Tanaka" className={inputCls("")} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Website Link</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputCls(websiteErr)} />
            <ErrText msg={websiteErr} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">GitHub Link</label>
            <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/owner/repo" className={inputCls(githubErr)} />
            <ErrText msg={githubErr} />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">DOI Link</label>
            <input placeholder="10.xxxx/..." className={inputCls("")} />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Tags / Research Areas</label>
            <input placeholder="Machine Learning, Microscopy, Open Source" className={inputCls("")} />
          </div>
          <div className="col-span-2">
            <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Images / Preview</label>
            <div className="border-2 border-dashed border-[#D1D5DB] rounded-xl py-7 flex flex-col items-center justify-center text-center hover:border-[#9CA3AF] transition-colors cursor-pointer">
              <ImageIcon className="w-6 h-6 text-[#9CA3AF] mb-2" />
              <p className="text-[12.5px] text-[#6B7280]">Drag & drop images, or <span className="text-[#1D4ED8] font-medium">browse</span></p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-7 py-4 flex items-center gap-2">
          <button onClick={() => setTouched(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white" style={{ background: NAVY }}>
            <Plus className="w-4 h-4" /> Save Product
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">Cancel</button>
          <span className="ml-auto text-[11.5px] text-[#9CA3AF]">Required fields marked with *</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Website Link Modal ─── */

function AddWebsiteLinkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "preview">("idle");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,20,40,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[540px] p-7 relative" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6]"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2F7] flex items-center justify-center">
            <Globe className="w-5 h-5" style={{ color: NAVY }} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#111827]">Add product from website link</h3>
            <p className="text-[12.5px] text-[#6B7280]">We'll generate a preview from the URL</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-research-tool.org" className="flex-1 px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
          <button onClick={() => { setState("loading"); setTimeout(() => setState("preview"), 1300); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
            {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Fetch Preview
          </button>
        </div>

        {state === "loading" && (
          <div className="flex items-center gap-3 py-5 justify-center text-[#6B7280]">
            <Loader2 className="w-5 h-5 animate-spin text-[#1D4ED8]" />
            <span className="text-[13.5px]">Generating preview from website…</span>
          </div>
        )}

        {state === "preview" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-[#BFDBFE] bg-[#F8FBFF] overflow-hidden">
              <div className="h-[90px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2EC4B622 0%, #1F3A5F44 100%)" }}>
                <ImageIcon className="w-7 h-7 opacity-40" style={{ color: NAVY }} />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Title <span className="text-[11px] font-normal text-[#9CA3AF]">(editable)</span></label>
              <input defaultValue="Research Tool — Interactive Platform" className="w-full px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Short Summary <span className="text-[11px] font-normal text-[#9CA3AF]">(editable)</span></label>
              <textarea defaultValue="Auto-extracted summary from the website's meta description. Edit before saving." rows={2} className="w-full px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 resize-none" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-5">
          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13.5px] font-semibold text-white" style={{ background: state === "preview" ? NAVY : "#9CA3AF" }} disabled={state !== "preview"}>
            <Plus className="w-4 h-4" /> Save Product
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13.5px] font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Products Control Header (sticky) ─── */

function ProductsControlHeader({ search, onSearch, viewMode, onViewMode, onAdd, onWebsite }: {
  search: string; onSearch: (v: string) => void;
  viewMode: "grid" | "compact"; onViewMode: (v: "grid" | "compact") => void;
  onAdd: () => void; onWebsite: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#F3F4F6] px-5 py-3.5" style={{ backdropFilter: "blur(4px)" }}>
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#111827]">Products</h2>
          <p className="text-[12px] text-[#9CA3AF]">6 research products from Dr. Sarah Kim</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Github className="w-3.5 h-3.5" /> Import from GitHub
          </button>
          <button onClick={onWebsite} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Globe className="w-3.5 h-3.5" /> Add Website Link
          </button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white" style={{ background: NAVY }}>
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
          <div className="flex items-center rounded-lg border border-[#E5E7EB] overflow-hidden">
            <button onClick={() => onViewMode("grid")} className="p-1.5 transition-colors" style={viewMode === "grid" ? { background: "#EEF2F7", color: NAVY } : { color: "#9CA3AF" }}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => onViewMode("compact")} className="p-1.5 transition-colors" style={viewMode === "compact" ? { background: "#EEF2F7", color: NAVY } : { color: "#9CA3AF" }}>
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search products..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[13px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:bg-white transition-all" />
        </div>
        {["Product Type", "Research Area", "Status"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F8FAFC] transition-colors">
            {f} <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F8FAFC] transition-colors ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" /> Sort: Featured <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
      </div>
    </div>
  );
}

/* ─── Products Tab — main component ─── */

function ProductsTab() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([2]));
  const [detail, setDetail] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);

  const toggleSave = (id: number) =>
    setSavedIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const confirmDelete = (product: Product) => {
    setDeletedIds((s) => new Set(s).add(product.id));
    setToDelete(null);
    if (detail?.id === product.id) setDetail(null);
  };

  const filtered = PRODUCTS.filter(
    (p) => !deletedIds.has(p.id) && (
      !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      p.contributors.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    )
  );

  const cardProps = (product: Product): ProdCardProps => ({
    product,
    saved: savedIds.has(product.id),
    onView: () => setDetail(product),
    onSave: () => toggleSave(product.id),
    onDelete: () => setToDelete(product),
    onEdit: () => setEditingId(editingId === product.id ? null : product.id),
    isEditing: editingId === product.id,
  });

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)", height: "720px", overflowY: "auto" }}>
        <ProductsControlHeader
          search={search} onSearch={setSearch}
          viewMode={viewMode} onViewMode={setViewMode}
          onAdd={() => setShowAdd(true)} onWebsite={() => setShowWebsite(true)}
        />

        <div className="p-4">
          {filtered.length === 0 ? (
            /* Empty / filtered state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#EEF2F7] flex items-center justify-center mb-4">
                <Package className="w-7 h-7" style={{ color: NAVY }} />
              </div>
              {search ? (
                <>
                  <p className="text-[15px] font-semibold text-[#111827]">No products match these filters.</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">Try clearing filters or adding a new research product.</p>
                  <button onClick={() => setSearch("")} className="mt-4 px-4 py-2 rounded-lg border border-[#D1D5DB] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB]">Clear search</button>
                </>
              ) : (
                <>
                  <p className="text-[16px] font-bold text-[#111827]">Add your first research product</p>
                  <p className="text-[13.5px] text-[#6B7280] mt-1 max-w-md leading-relaxed">
                    Showcase software, datasets, models, tools, and research outputs that support your work.
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: NAVY }}>
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                    <button onClick={() => setShowWebsite(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]">
                      <Globe className="w-4 h-4" /> Add Website Link
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid view */
            <div className="grid grid-cols-2 gap-4">
              {featured && <ProdFeaturedCard key={featured.id} {...cardProps(featured)} />}
              {rest.map((product) =>
                product.carousel ? (
                  <ProdCarouselCard key={product.id} {...cardProps(product)} />
                ) : (
                  <ProdDefaultCard key={product.id} {...cardProps(product)} />
                )
              )}
              {/* Loading indicator */}
              <div className="col-span-2 flex items-center justify-center gap-2 py-5 text-[#9CA3AF]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[13px]">Loading more products…</span>
              </div>
            </div>
          ) : (
            /* Compact list view */
            <div className="flex flex-col gap-2">
              {filtered.map((product) => (
                <ProdCompactCard key={product.id} {...cardProps(product)} />
              ))}
              <div className="flex items-center justify-center gap-2 py-5 text-[#9CA3AF]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[13px]">Loading more products…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {detail && (
        <ProdDetailModal
          product={detail}
          saved={savedIds.has(detail.id)}
          onSave={() => toggleSave(detail.id)}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditingId(detail.id); setDetail(null); }}
          onDelete={() => { setToDelete(detail); setDetail(null); }}
        />
      )}
      {toDelete && <ProdDeleteModal product={toDelete} onConfirm={() => confirmDelete(toDelete)} onCancel={() => setToDelete(null)} />}
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      {showWebsite && <AddWebsiteLinkModal onClose={() => setShowWebsite(false)} />}
    </>
  );
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */

export function ProfilePage() {
  const [tab, setTab] = useState("Profile");
  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar />
      <div className="max-w-[1660px] mx-auto px-6 py-5 flex gap-6 items-start">
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <ProfileHeaderCard />
          <ProfileTabs active={tab} onChange={setTab} />

          {tab === "Profile" ? (
            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0 flex flex-col gap-5">
                <AboutCard />
                <ResearchInterestsCard />
                <RecentActivity />
              </div>
              <div className="w-[300px] flex-shrink-0 hidden xl:flex flex-col gap-5">
                <ContactLinksCard />
                <CollaborationPrefsCard />
              </div>
            </div>
          ) : tab === "Publications" ? (
            <PublicationsTab />
          ) : tab === "Products" ? (
            <ProductsTab />
          ) : (
            <TabPlaceholder tab={tab} />
          )}
        </main>

        <aside className="w-[300px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-[72px] flex flex-col gap-4">
            <RecommendedCollaborators />
            <SimilarResearchers />
            <PopularGroups />
            <p className="text-[11px] text-[#9CA3AF] text-center px-4 leading-relaxed">
              LabScity · About · Privacy · Terms · Help
              <br />© 2026 LabScity. For researchers, by researchers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
