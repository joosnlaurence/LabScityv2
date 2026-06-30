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
  Plus,
  FolderPlus,
  PenSquare,
  Image as ImageIcon,
  Tag as TagIcon,
  Bookmark,
  Quote,
  ChevronRight,
  Star,
  Link2,
  BookOpen,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Check,
  Eye,
  Layers,
  X,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATA INTERFACES
 * The component below renders with inline sample data. To wire real data
 * later, type your data with these interfaces and replace the inline arrays
 * (pubs, products, people, groups, trends, quick) with props.
 * ────────────────────────────────────────────────────────────────────── */
export interface FeedPublication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  abstract: string;
  tags: string[];
  stars: number;
  cites: number;
}
export interface FeedProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  tags: string[];
}
export interface FeedPerson {
  id: string;
  name: string;
  affiliation: string;
  field: string;
  avatarInitials: string;
}
export interface FeedGroup {
  id: string;
  name: string;
  members: number;
  topic: string;
}
export interface HomeFeedProps {
  publications?: FeedPublication[];
  products?: FeedProduct[];
  suggestedPeople?: FeedPerson[];
  groups?: FeedGroup[];
  trends?: string[];
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

function TealBadge({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: "#0F766E", background: "#D7F5F1", border: "1px solid #99E6DE" }}
    >
      {icon}
      {label}
    </span>
  );
}

/* Feed header — "who shared / why" strip above feed items */
function FeedHeader({
  avatar,
  text,
  sub,
  badge,
}: {
  avatar?: { initials: string; color: string };
  text: React.ReactNode;
  sub?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-1 mb-2.5">
      {avatar ? (
        <Avatar initials={avatar.initials} color={avatar.color} size={28} />
      ) : (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#D7F5F1" }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#0F766E" }} />
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap text-[12.5px] text-[#6B7280]">
        <span>{text}</span>
        {sub && <span className="text-[#9CA3AF]">· {sub}</span>}
      </div>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
  accent,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
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
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   TOP NAVBAR
   ──────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 w-[200px] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#1F3A5F] flex items-center justify-center text-white text-sm font-bold">
          L
        </div>
        <span className="text-[17px] font-bold text-[#111827] tracking-tight">
          LabScity
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-[520px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            placeholder="Search people, publications, products, groups..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F1F5F9] border border-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/10 transition-all"
          />
        </div>
      </div>

      {/* Nav icons */}
      <div className="flex items-center gap-1 ml-auto">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: Briefcase, label: "Jobs" },
          { icon: Users, label: "Groups" },
          { icon: MessageSquare, label: "Messages", dot: true },
          { icon: Bell, label: "Notifications", count: 3 },
        ].map((item) => (
          <button
            key={item.label}
            className="relative flex flex-col items-center justify-center w-[58px] h-11 rounded-lg transition-colors group"
            style={{ color: item.active ? NAVY : "#6B7280" }}
          >
            <item.icon
              className="w-[18px] h-[18px]"
              style={{ color: item.active ? NAVY : "#6B7280" }}
            />
            <span
              className="text-[10px] mt-0.5 font-medium"
              style={{ color: item.active ? NAVY : "#9CA3AF" }}
            >
              {item.label}
            </span>
            {item.active && (
              <span
                className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-7 h-[2.5px] rounded-full"
                style={{ background: NAVY }}
              />
            )}
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
          <Avatar initials="YA" color="#1F3A5F" size={34} ring />
        </button>
      </div>
    </nav>
  );
}

/* ────────────────────────────────────────────
   LEFT SIDEBAR
   ──────────────────────────────────────────── */

function LeftSidebar() {
  const quick = [
    { icon: FileText, label: "Add Publication" },
    { icon: Package, label: "Add Product" },
    { icon: FolderPlus, label: "Create Group" },
    { icon: PenSquare, label: "New Post" },
  ];

  return (
    <aside className="w-[212px] flex-shrink-0 hidden lg:block overflow-y-auto py-5">
      <div className="flex flex-col gap-4">
        {/* Profile mini-card */}
        <div
          className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col items-center text-center"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <Avatar initials="YA" color="#1F3A5F" size={56} />
          <p className="text-[14px] font-semibold text-[#111827] mt-2.5">
            Dr. Yara Adeyemi
          </p>
          <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
            Postdoc · Computational Imaging
          </p>
          <p className="text-[11.5px] text-[#9CA3AF]">Imperial College London</p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F3F4F6] w-full justify-center">
            <div>
              <p className="text-[14px] font-bold text-[#111827]">128</p>
              <p className="text-[10px] text-[#9CA3AF]">Following</p>
            </div>
            <div className="w-px h-7 bg-[#F3F4F6]" />
            <div>
              <p className="text-[14px] font-bold text-[#111827]">12</p>
              <p className="text-[10px] text-[#9CA3AF]">Papers</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          className="bg-white rounded-xl border border-[#E5E7EB] p-3"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-1 mb-2">
            Quick Actions
          </p>
          <div className="flex flex-col gap-1">
            {quick.map((q) => (
              <button
                key={q.label}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors group"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "#EEF2F7" }}
                >
                  <q.icon className="w-3.5 h-3.5" style={{ color: NAVY }} />
                </span>
                {q.label}
                <Plus className="w-3.5 h-3.5 text-[#CBD5E1] ml-auto group-hover:text-[#6B7280] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────
   CENTER FEED — create post
   ──────────────────────────────────────────── */

function CreatePost() {
  const [filters, setFilters] = useState<string[]>(["Publications", "Products"]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const removeFilter = (f: string) => setFilters((prev) => prev.filter((x) => x !== f));
  const addFilter = (f: string) => setFilters((prev) => prev.includes(f) ? prev : [...prev, f]);
  const addCustom = () => {
    const v = customInput.trim();
    if (v) { addFilter(v); setCustomInput(""); }
  };

  const suggestedTags = [
    "Optics", "Computer Vision", "Neural Networks", "Microscopy",
    "Machine Learning", "Biomedical Imaging", "Physics-Informed NN",
    "Holography", "Cryo-EM", "Climate Modeling", "Robotics", "Diffusion Models",
  ];

  const chipIcon = (label: string) => {
    if (label === "Publications") return <FileText className="w-3 h-3" />;
    if (label === "Products") return <Package className="w-3 h-3" />;
    return <TagIcon className="w-3 h-3" />;
  };

  return (
    <>
      <div
        className="bg-white rounded-xl border border-[#E5E7EB] p-4"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <Avatar initials="YA" color="#1F3A5F" size={36} />
            <span className="text-[13.5px] font-medium text-[#374151]">
              What's on your mind, Yara?
            </span>
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold transition-colors flex-shrink-0"
            style={{ background: NAVY }}
          >
            <PenSquare className="w-4 h-4" />
            New Post
          </button>
        </div>

        {/* Filter chips row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11.5px] font-semibold text-[#9CA3AF] mr-0.5 tracking-wide">
            SHOW:
          </span>
          {filters.map((f) => (
            <div
              key={f}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer select-none transition-all"
              style={{
                background: hovered === f ? "#FEE2E2" : "#EEF2F7",
                color: hovered === f ? "#DC2626" : NAVY,
                border: `1.5px solid ${hovered === f ? "#FCA5A5" : NAVY + "30"}`,
              }}
              onMouseEnter={() => setHovered(f)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => removeFilter(f)}
            >
              {hovered === f ? (
                <X className="w-3 h-3" />
              ) : (
                chipIcon(f)
              )}
              <span style={{ textDecoration: hovered === f ? "line-through" : "none" }}>
                {f}
              </span>
            </div>
          ))}

          {/* Add Tags button */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-dashed transition-colors hover:bg-[#F0FDFB]"
            style={{ borderColor: TEAL, color: TEAL }}
          >
            <Plus className="w-3 h-3" /> Add Tags
          </button>
        </div>
      </div>

      {/* Add Tags modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(17,24,39,0.5)", backdropFilter: "blur(3px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[480px] mx-4 overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#F3F4F6]">
              <div>
                <h2 className="text-[16px] font-semibold text-[#111827]">
                  Filter feed by tags
                </h2>
                <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                  Only show content matching these topics
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors ml-4 flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            {/* Active filters */}
            <div className="px-6 pt-4">
              <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Active filters
              </p>
              <div className="flex flex-wrap gap-2 min-h-[30px]">
                {filters.length === 0 ? (
                  <span className="text-[12.5px] text-[#9CA3AF] italic">
                    None — all content is shown
                  </span>
                ) : (
                  filters.map((f) => (
                    <span
                      key={f}
                      onClick={() => removeFilter(f)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium cursor-pointer hover:opacity-75 transition-opacity"
                      style={{
                        background: "#EEF2F7",
                        color: NAVY,
                        border: `1.5px solid ${NAVY}30`,
                      }}
                    >
                      {f} <X className="w-2.5 h-2.5" />
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Suggested tags */}
            <div className="px-6 pt-4">
              <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Suggested for you
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((t) => {
                  const active = filters.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => (active ? removeFilter(t) : addFilter(t))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium transition-all"
                      style={
                        active
                          ? {
                              background: TEAL + "1A",
                              color: TEAL,
                              border: `1.5px solid ${TEAL}`,
                            }
                          : {
                              background: "#F3F4F6",
                              color: "#374151",
                              border: "1.5px solid transparent",
                            }
                      }
                    >
                      {active && <Check className="w-2.5 h-2.5" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom tag input */}
            <div className="px-6 pt-4 pb-2">
              <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Custom tag
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
                  placeholder="e.g. Quantum Computing, Drug Discovery…"
                  className="flex-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-[13px] text-[#374151] placeholder-[#9CA3AF] outline-none transition-colors"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                />
                <button
                  onClick={addCustom}
                  disabled={!customInput.trim()}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity disabled:opacity-35"
                  style={{ background: TEAL }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 mt-4 bg-[#F8FAFC] border-t border-[#F3F4F6]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#EBEDF0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: NAVY }}
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── 1. Featured publication feed item ── */

function FeaturedPublicationItem() {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <FeedHeader
        avatar={{ initials: "SK", color: "#7C3AED" }}
        text={
          <>
            <span className="font-semibold text-[#374151]">Sarah Kim</span>{" "}
            highlighted a new publication
          </>
        }
        sub="2h ago"
        badge={<TealBadge icon={<Star className="w-3 h-3" />} label="Featured" />}
      />
      <div
        className="bg-[#F8FBFF] rounded-xl border border-[#BFDBFE] p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA]" />
        <div className="flex items-center gap-2 mb-3 mt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> Featured
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
            <FileText className="w-3 h-3" /> Article
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF6FF] text-[#1D4ED8]">
            <BookOpen className="w-3 h-3" /> Full-text available
          </span>
        </div>
        <h2 className="text-[18px] font-semibold text-[#111827] leading-snug mb-2 cursor-pointer hover:text-[#1D4ED8] transition-colors">
          Computational aberration-free imaging using a single-layer neural
          network for high-content cell microscopy
        </h2>
        <p className="text-[13.5px] text-[#4B5563] leading-relaxed mb-3 line-clamp-2">
          A breakthrough approach that eliminates optical aberrations in
          microscopy imaging without expensive hardware corrections, leveraging a
          lightweight neural architecture trained on paired image datasets.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1.5">
            <Avatar initials="CW" color="#4F46E5" size={24} ring />
            <Avatar initials="JK" color="#0891B2" size={24} ring />
            <Avatar initials="JC" color="#059669" size={24} ring />
          </div>
          <div className="text-[13px] text-[#374151] flex flex-wrap items-center gap-0.5">
            <span className="font-medium">Cheng Wu</span>
            <span className="text-[#9CA3AF] mx-0.5">·</span>
            <span className="font-medium">Jonathan Ko</span>
            <span className="text-[#6B7280] mx-1">+3 more</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#6B7280] mb-2">
          <div className="w-2 h-2 rounded-full bg-[#93C5FD]" />
          <span>Applied Optics · March 2026</span>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <Link2 className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
          <span className="text-[13px] text-[#2563EB] hover:underline cursor-pointer">
            doi.org/10.1364/AO.27.000326
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <BlueTag label="Optics" />
          <BlueTag label="Computer Vision" />
          <BlueTag label="Neural Networks" />
          <BlueTag label="Microscopy" />
        </div>
        <div className="border-t border-[#BFDBFE] mb-4" />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:bg-[#1E40AF] transition-colors shadow-sm"
            style={{ background: "#1D4ED8" }}
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              saved
                ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#BFDBFE] text-[#374151] hover:bg-[#EFF6FF]"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1D4ED8]" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-[#BFDBFE] text-[#374151] hover:bg-[#EFF6FF] transition-colors">
            <Quote className="w-3.5 h-3.5" /> Cite
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 ml-auto"
            style={{ background: TEAL }}
          >
            <Users className="w-3.5 h-3.5" /> Collaborate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Recommended product from collaborator ── */

function RecommendedProductItem() {
  const [saved, setSaved] = useState(false);
  const images = ["#1F3A5F", "#0891B2", "#2EC4B6"];
  const [active, setActive] = useState(0);
  return (
    <div>
      <FeedHeader
        text={
          <>
            Recommended from a{" "}
            <span className="font-semibold text-[#374151]">
              high-match collaborator
            </span>
          </>
        }
        sub="David Park · 92% match"
        badge={
          <TealBadge
            icon={<Sparkles className="w-3 h-3" />}
            label="High Match"
          />
        }
      />
      <div
        className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Carousel */}
        <div className="relative h-44 bg-[#F1F5F9] overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center transition-colors"
            style={{
              background: `linear-gradient(135deg, ${images[active]}, ${images[active]}cc)`,
            }}
          >
            <Layers className="w-12 h-12 text-white/40" />
            <span className="absolute bottom-3 left-4 text-white text-[12px] font-medium bg-black/25 px-2.5 py-1 rounded-md backdrop-blur-sm">
              HoloSim Toolkit — Preview {active + 1}
            </span>
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === active ? "#fff" : "rgba(255,255,255,0.45)",
                  width: i === active ? 18 : 8,
                }}
              />
            ))}
          </div>
          <span className="absolute top-3 left-4">
            <TealBadge label="Recommended" />
          </span>
        </div>
        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Avatar initials="DP" color="#059669" size={26} />
            <span className="text-[12.5px] text-[#6B7280]">
              by{" "}
              <span className="font-semibold text-[#374151]">David Park</span> ·
              Stanford University
            </span>
          </div>
          <h3 className="text-[17px] font-semibold text-[#111827] mb-1.5 cursor-pointer hover:text-[#1D4ED8] transition-colors">
            HoloSim Toolkit — real-time holographic display simulation
          </h3>
          <p className="text-[13.5px] text-[#4B5563] leading-relaxed mb-3 line-clamp-2">
            An open-source GPU-accelerated framework for prototyping
            computer-generated holography pipelines, with neural rendering
            support and a Python API for rapid experimentation.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <GreyTag label="Holography" />
            <GreyTag label="Neural Rendering" />
            <GreyTag label="GPU" />
            <GreyTag label="Open Source" />
          </div>
          <div className="border-t border-[#F3F4F6] mb-3.5" />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ background: NAVY }}
            >
              <Eye className="w-3.5 h-3.5" /> View Project
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              <Users className="w-3.5 h-3.5" /> Collaborate
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ml-auto ${
                saved
                  ? "border-[#1F3A5F] bg-[#EEF2F7] text-[#1F3A5F]"
                  : "border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#1F3A5F]" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 3. Collaboration request post ── */

function CollaborationRequestPost() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <FeedHeader
        avatar={{ initials: "MR", color: "#DC2626" }}
        text={
          <>
            <span className="font-semibold text-[#374151]">Dr. Maria Rossi</span>{" "}
            posted a collaboration request
          </>
        }
        sub="5h ago"
      />
      <div
        className="bg-white rounded-xl border border-[#E5E7EB] p-5 transition-all duration-200 hover:shadow-md"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-start gap-3 mb-3">
          <Avatar initials="MR" color="#DC2626" size={44} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-[#111827]">
                Dr. Maria Rossi
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D]">
                Open to collaborate
              </span>
            </div>
            <p className="text-[12px] text-[#9CA3AF]">
              Associate Professor · Politecnico di Milano
            </p>
          </div>
          <span className="ml-auto">
            <TealBadge
              icon={<Sparkles className="w-3 h-3" />}
              label="Matches your ML + imaging interests"
            />
          </span>
        </div>

        <p className="text-[14px] text-[#374151] leading-relaxed mb-3.5">
          Looking for collaborators with experience in{" "}
          <span className="font-semibold">physics-informed neural networks</span>{" "}
          for an upcoming project on inverse problems in biomedical imaging. We
          have funding for 2 visiting researchers and access to a high-resolution
          microscopy facility. Co-authorship guaranteed — reach out if interested!
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <BlueTag label="Machine Learning" />
          <BlueTag label="Biomedical Imaging" />
          <BlueTag label="Physics-Informed NN" />
          <BlueTag label="Inverse Problems" />
        </div>

        <div className="border-t border-[#F3F4F6] mb-3" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
            style={{ color: liked ? "#DC2626" : "#6B7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-[#DC2626]" : ""}`} />
            {liked ? "37" : "36"}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
            <MessageCircle className="w-4 h-4" /> 12
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-[#1F3A5F] text-[#1F3A5F]" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white ml-auto transition-opacity hover:opacity-90"
            style={{ background: TEAL }}
          >
            <Users className="w-3.5 h-3.5" /> Collaborate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 4. Compact publications cluster ── */

function CompactPublicationsCluster() {
  const pubs = [
    {
      title:
        "Self-supervised denoising for live-cell fluorescence microscopy",
      authors: "L. Tanaka, R. Singh",
      venue: "Nature Methods · 2026",
      tags: ["Microscopy", "Self-Supervised"],
    },
    {
      title: "Diffusion models for accelerated MRI reconstruction",
      authors: "A. Petrov, M. Chen, +2",
      venue: "MICCAI · 2026",
      tags: ["Medical Imaging", "Diffusion"],
    },
    {
      title: "Benchmarking physics-informed networks on PDE inverse problems",
      authors: "K. Nowak, J. Riley",
      venue: "ICLR · 2026",
      tags: ["Physics-Informed NN", "Benchmark"],
    },
  ];
  return (
    <SectionCard
      title="New publications in your research areas"
      icon={<FileText className="w-4 h-4" />}
      action={
        <button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">
          View more <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="divide-y divide-[#F3F4F6]">
        {pubs.map((p) => (
          <PubRow key={p.title} {...p} />
        ))}
      </div>
    </SectionCard>
  );
}

function PubRow({
  title,
  authors,
  venue,
  tags,
}: {
  title: string;
  authors: string;
  venue: string;
  tags: string[];
}) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 mt-0.5">
        <FileText className="w-4 h-4 text-[#1D4ED8]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[#111827] leading-snug group-hover:text-[#1D4ED8] transition-colors cursor-pointer">
          {title}
        </p>
        <p className="text-[11.5px] text-[#6B7280] mt-0.5">
          {authors} · <span className="text-[#9CA3AF]">{venue}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {tags.map((t) => (
            <GreyTag key={t} label={t} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setSaved(!saved)}
          className="p-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <Bookmark
            style={{ width: 15, height: 15 }}
            className={saved ? "fill-[#1F3A5F] text-[#1F3A5F]" : "text-[#9CA3AF]"}
          />
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#E5E7EB] text-[#374151] hover:bg-white transition-colors">
          <Quote className="w-3 h-3" /> Cite
        </button>
      </div>
    </div>
  );
}

/* ── 5. Product discovery cluster ── */

function ProductDiscoveryCluster() {
  const products = [
    {
      title: "CryoTrace — automated cryo-EM particle picking",
      contributor: "Helix Bio Lab",
      tags: ["Cryo-EM", "Automation"],
      color: "#0891B2",
    },
    {
      title: "ClimaGrid — high-resolution climate downscaling models",
      contributor: "EarthScale Collective",
      tags: ["Climate Modeling", "ML"],
      color: "#059669",
    },
    {
      title: "RoboGrasp SDK — dexterous manipulation primitives",
      contributor: "Mecha Robotics Group",
      tags: ["Robotics", "Manipulation"],
      color: "#7C3AED",
    },
  ];
  return (
    <SectionCard
      title="Research tools gaining traction"
      icon={<TrendingUp className="w-4 h-4" />}
      accent
      action={
        <button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">
          Explore <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="divide-y divide-[#F3F4F6]">
        {products.map((p) => (
          <ProductRow key={p.title} {...p} />
        ))}
      </div>
    </SectionCard>
  );
}

function ProductRow({
  title,
  contributor,
  tags,
  color,
}: {
  title: string;
  contributor: string;
  tags: string[];
  color: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1A` }}
      >
        <Package className="w-4.5 h-4.5" style={{ width: 18, height: 18, color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[#111827] leading-snug group-hover:text-[#1D4ED8] transition-colors cursor-pointer truncate">
          {title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[11.5px] text-[#9CA3AF]">{contributor}</span>
          <span className="text-[#D1D5DB]">·</span>
          {tags.map((t) => (
            <GreyTag key={t} label={t} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => setSaved(!saved)}
          className="p-1.5 rounded-lg hover:bg-white transition-colors"
        >
          <Bookmark
            style={{ width: 15, height: 15 }}
            className={saved ? "fill-[#1F3A5F] text-[#1F3A5F]" : "text-[#9CA3AF]"}
          />
        </button>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ background: NAVY }}
        >
          View
        </button>
      </div>
    </div>
  );
}

/* ── 6. People / collaborator spotlight ── */

function PeopleSpotlight() {
  const people = [
    {
      name: "Sarah Kim",
      role: "PhD Candidate",
      institution: "MIT",
      tags: ["Deep Learning", "Medical Imaging"],
      match: 96,
      initials: "SK",
      color: "#7C3AED",
      open: true,
    },
    {
      name: "Tomasz Wójcik",
      role: "Research Scientist",
      institution: "ETH Zürich",
      tags: ["Photonics", "Simulation"],
      match: 89,
      initials: "TW",
      color: "#D97706",
      open: true,
    },
    {
      name: "Ann Lee",
      role: "Postdoctoral Fellow",
      institution: "Johns Hopkins",
      tags: ["Microscopy", "Genomics"],
      match: 84,
      initials: "AL",
      color: "#BE185D",
      open: false,
    },
  ];
  return (
    <SectionCard
      title="Collaborators you may want to meet"
      icon={<Users className="w-4 h-4" />}
      action={
        <button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">
          See all <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="grid grid-cols-3 divide-x divide-[#F3F4F6]">
        {people.map((p) => (
          <SpotlightCard key={p.name} {...p} />
        ))}
      </div>
    </SectionCard>
  );
}

function SpotlightCard({
  name,
  role,
  institution,
  tags,
  match,
  initials,
  color,
  open,
}: {
  name: string;
  role: string;
  institution: string;
  tags: string[];
  match: number;
  initials: string;
  color: string;
  open: boolean;
}) {
  const [followed, setFollowed] = useState(false);
  return (
    <div className="flex flex-col items-center text-center px-3 py-4">
      <Avatar initials={initials} color={color} size={52} />
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[13.5px] font-semibold text-[#111827]">{name}</span>
      </div>
      <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-snug">
        {role} · {institution}
      </p>
      <div className="mt-1.5">
        <MatchBadge pct={match} />
      </div>
      <div className="flex flex-wrap gap-1 justify-center mt-2 mb-3 min-h-[20px]">
        {tags.map((t) => (
          <GreyTag key={t} label={t} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 w-full mt-auto">
        <button
          onClick={() => setFollowed(!followed)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={
            followed
              ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }
              : { background: NAVY, color: "#fff", border: "1px solid transparent" }
          }
        >
          {followed ? (
            <>
              <Check className="w-3 h-3" /> Following
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" /> Follow
            </>
          )}
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
      {open && (
        <span className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D]">
          Open to collaborate
        </span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   RIGHT RAIL
   ──────────────────────────────────────────── */

function RecommendedCollaborators() {
  const list = [
    {
      name: "Sarah Kim",
      institution: "MIT",
      tags: ["Deep Learning", "Imaging"],
      match: 96,
      initials: "SK",
      color: "#7C3AED",
      open: true,
    },
    {
      name: "Cheng Wu",
      institution: "UCF",
      tags: ["Optics", "Vision"],
      match: 91,
      initials: "CW",
      color: "#0891B2",
      open: false,
    },
    {
      name: "David Park",
      institution: "Stanford",
      tags: ["Holography"],
      match: 88,
      initials: "DP",
      color: "#059669",
      open: true,
    },
    {
      name: "Priya Sharma",
      institution: "Caltech",
      tags: ["Phase Imaging", "GAN"],
      match: 85,
      initials: "PS",
      color: "#DC2626",
      open: false,
    },
  ];
  return (
    <SectionCard
      title="Recommended Collaborators"
      icon={<Users className="w-4 h-4" />}
      action={
        <button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">
          See all <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="divide-y divide-[#F3F4F6]">
        {list.map((c) => (
          <CollabRow key={c.name} {...c} />
        ))}
      </div>
    </SectionCard>
  );
}

function CollabRow({
  name,
  institution,
  tags,
  match,
  initials,
  color,
  open,
}: {
  name: string;
  institution: string;
  tags: string[];
  match: number;
  initials: string;
  color: string;
  open: boolean;
}) {
  const [followed, setFollowed] = useState(false);
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <Avatar initials={initials} color={color} size={38} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#111827] truncate">
            {name}
          </span>
          {open && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D] flex-shrink-0">
              Open
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#9CA3AF] truncate">{institution}</p>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {tags.map((t) => (
            <GreyTag key={t} label={t} />
          ))}
          <MatchBadge pct={match} />
        </div>
      </div>
      <button
        onClick={() => setFollowed(!followed)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
        style={
          followed
            ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }
            : { background: NAVY, color: "#fff", border: "1px solid transparent" }
        }
      >
        {followed ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
      </button>
    </div>
  );
}

function TrendingResearch() {
  const trends = [
    { tag: "Quantum Computing", count: "2.4k" },
    { tag: "Biomedical Imaging", count: "1.9k" },
    { tag: "Climate Modeling", count: "1.5k" },
    { tag: "Human-Computer Interaction", count: "1.1k" },
    { tag: "Machine Learning", count: "8.7k" },
  ];
  return (
    <SectionCard
      title="Trending Research"
      icon={<TrendingUp className="w-4 h-4" />}
      accent
    >
      <div className="p-2">
        {trends.map((t, i) => (
          <button
            key={t.tag}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-left group"
          >
            <span className="text-[13px] font-bold text-[#CBD5E1] w-4">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#111827] group-hover:text-[#1D4ED8] transition-colors truncate">
                #{t.tag.replace(/\s/g, "")}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">{t.count} posts</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#6B7280] transition-colors" />
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function PopularGroups() {
  const groups = [
    {
      name: "Computational Imaging Hub",
      members: "12.4k",
      area: "Imaging",
      color: "#1D4ED8",
    },
    {
      name: "ML for Science",
      members: "28.1k",
      area: "Machine Learning",
      color: "#7C3AED",
    },
    {
      name: "Climate AI Network",
      members: "6.8k",
      area: "Climate",
      color: "#059669",
    },
  ];
  return (
    <SectionCard
      title="Popular Groups"
      icon={<Users className="w-4 h-4" />}
      action={
        <button className="text-[12px] font-medium text-[#1D4ED8] hover:underline flex items-center gap-0.5">
          Browse <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="divide-y divide-[#F3F4F6]">
        {groups.map((g) => (
          <GroupRow key={g.name} {...g} />
        ))}
      </div>
    </SectionCard>
  );
}

function GroupRow({
  name,
  members,
  area,
  color,
}: {
  name: string;
  members: string;
  area: string;
  color: string;
}) {
  const [joined, setJoined] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1A` }}
      >
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
        style={
          joined
            ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }
            : { background: "#fff", color: NAVY, border: `1px solid ${NAVY}` }
        }
      >
        {joined ? "Joined" : "Join"}
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────── */

export function HomeFeed() {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#F8FAFC]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 h-full flex gap-6">
          <LeftSidebar />

          {/* Center feed */}
          <main className="flex-1 min-w-0 flex flex-col overflow-hidden py-5">
            {/* Pinned composer — feed scrolls under this */}
            <div
              className="flex-shrink-0 relative z-10 pb-4 bg-[#F8FAFC]"
              style={{ boxShadow: "0 6px 16px -4px rgba(0,0,0,0.07)" }}
            >
              <CreatePost />
            </div>
            {/* Independently scrolling feed */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 pt-5 pr-0.5">
              <FeaturedPublicationItem />
              <RecommendedProductItem />
              <CollaborationRequestPost />
              <CompactPublicationsCluster />
              <ProductDiscoveryCluster />
              <PeopleSpotlight />
              <div className="h-4" />
            </div>
          </main>

          {/* Right rail */}
          <aside className="w-[320px] flex-shrink-0 hidden lg:block overflow-y-auto py-5">
            <div className="flex flex-col gap-4">
              <RecommendedCollaborators />
              <TrendingResearch />
              <PopularGroups />
              <p className="text-[11px] text-[#9CA3AF] text-center px-4 leading-relaxed">
                LabScity · About · Privacy · Terms · Help
                <br />© 2026 LabScity. For researchers, by researchers.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
