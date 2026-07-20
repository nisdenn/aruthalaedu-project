"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  SquareStack,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart2,
  Users,
  Settings,
  LogOut,
  UserCircle2,
  School,
  CalendarDays,
  LineChart,
  ShieldAlert,
  MonitorPlay,
  Files,
  FileDown,
  FileText,
  Library,
  CalendarCheck,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSidebar } from "./DashboardShell";
import { useDashboardIdentity } from "./useDashboardIdentity";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// ─── Section Definitions ─────────────────────────────────────────

const commonSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
      { href: "/notifications", label: "Notifikasi", icon: UserCircle2 },
      { href: "/profile", label: "Profil", icon: UserCircle2 },
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
  {
    label: "Layanan Sekolah",
    items: [
      { href: "/materi", label: "File Materi", icon: FileText },
      { href: "/perpus", label: "Perpustakaan", icon: Library },
      { href: "/kesiswaan", label: "Kesiswaan", icon: Users },
      { href: "/absen", label: "Data Absen", icon: CalendarCheck },
    ],
  },
];

const studentSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/overview", label: "Dashboard Siswa", icon: LayoutDashboard },
      { href: "/student-hub", label: "Hub Siswa", icon: Users },
      { href: "/notifications", label: "Notifikasi Saya", icon: UserCircle2 },
      { href: "/profile", label: "Profil Saya", icon: UserCircle2 },
    ],
  },
  {
    label: "Akademik & Ujian",
    items: [
      { href: "/schedule", label: "Jadwal Ujian", icon: CalendarDays },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
    ],
  },
];

const teacherSections: NavSection[] = [
  {
    label: "Fitur Guru",
    items: [
      { href: "/teacher-hub", label: "Hub Guru", icon: GraduationCap },
      { href: "/ujian", label: "Ujian", icon: ClipboardList },
      { href: "/ujian/buat", label: "Buat Ujian", icon: SquareStack },
      { href: "/bank-soal", label: "Bank Soal", icon: BookOpen },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { href: "/exam-health", label: "Exam Health", icon: LineChart },
      { href: "/incident-report", label: "Incident Report", icon: ShieldAlert },
      { href: "/monitoring-center", label: "Monitoring Center", icon: MonitorPlay },
    ],
  },
  {
    label: "Laporan",
    items: [
      { href: "/reports", label: "Laporan", icon: BarChart2 },
      { href: "/teacher-report", label: "Teacher Report", icon: Users },
      { href: "/exam-report", label: "Exam Report", icon: Files },
      { href: "/report-export", label: "Export", icon: FileDown },
    ],
  },
  {
    label: "Produktivitas",
    items: [
      { href: "/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
      { href: "/library-hub", label: "Library Hub", icon: BookOpen },
    ],
  },
];

const adminSections: NavSection[] = [
  {
    label: "Admin",
    items: [
      { href: "/admin-hub", label: "Hub Admin", icon: School },
      { href: "/user-management", label: "User Management", icon: Users },
      { href: "/class-management", label: "Class Management", icon: School },
      { href: "/subject-management", label: "Mata Pelajaran", icon: BookOpen },
      { href: "/academic-year", label: "Academic Year", icon: CalendarDays },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/school-health", label: "School Health", icon: LineChart },
      { href: "/monitoring-center", label: "Monitoring Center", icon: MonitorPlay },
      { href: "/exam-gate", label: "Exam Gate", icon: ShieldAlert },
      { href: "/schedule", label: "Schedule", icon: CalendarDays },
    ],
  },
];

// ─── Section Resolver (RBAC) ─────────────────────────────────────

function getSections(roleGroup: "admin" | "teacher" | "student" | "unknown", rawRole?: string): NavSection[] {
  if (rawRole === "OWNER" || rawRole === "SUPER_ADMIN") {
    return [
      ...commonSections,
      ...adminSections,
      {
        label: "Fitur Guru",
        items: [
          { href: "/teacher-hub", label: "Hub Guru", icon: GraduationCap },
          { href: "/ujian", label: "Manajemen Ujian", icon: ClipboardList },
          { href: "/ujian/buat", label: "Buat Ujian", icon: SquareStack },
          { href: "/bank-soal", label: "Bank Soal", icon: BookOpen },
          { href: "/library-hub", label: "Library Hub", icon: BookOpen },
          { href: "/incident-report", label: "Incident Report", icon: ShieldAlert },
          { href: "/exam-health", label: "Exam Health", icon: LineChart },
        ],
      },
      {
        label: "Fitur Siswa",
        items: [
          { href: "/student-hub", label: "Hub Siswa", icon: Users },
          { href: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
        ],
      },
      {
        label: "Laporan",
        items: [
          { href: "/reports", label: "Laporan", icon: BarChart2 },
          { href: "/student-report", label: "Student Report", icon: Users },
          { href: "/teacher-report", label: "Teacher Report", icon: GraduationCap },
          { href: "/exam-report", label: "Exam Report", icon: Files },
          { href: "/report-export", label: "Export", icon: FileDown },
        ],
      },
    ];
  }

  if (roleGroup === "admin") return [...commonSections, ...adminSections];
  if (roleGroup === "teacher") return [...commonSections, ...teacherSections];
  if (roleGroup === "student") return studentSections;
  return [...commonSections];
}

// ─── Helpers ─────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? "A"}${parts[1][0] ?? "U"}`.toUpperCase();
}

// ─── Collapsible Section Component ───────────────────────────────

function CollapsibleSection({
  group,
  isOpen,
  onToggle,
  pathname,
  onNavClick,
}: {
  group: NavSection;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onNavClick: () => void;
}) {
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div>
      {/* Section Header — clickable toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 group/hdr cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest group-hover/hdr:text-gray-600 transition-colors">
          {group.label}
        </span>
        <ChevronDown
          className="w-3 h-3 text-gray-300 group-hover/hdr:text-gray-500 transition-all duration-300"
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </button>

      {/* Collapsible items — smooth CSS grid animation */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden min-h-0">
          {group.items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-[#eef5ff] text-[#2f66e9] shadow-[0_8px_20px_rgba(47,102,233,0.08)]"
                    : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    active ? "text-[#2f66e9]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Sidebar Component ──────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const identity = useDashboardIdentity();

  // Track collapsed state per section label. Default: all open.
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const handleLogout = async () => {
    // Bersihkan bypass lokal jika ada
    localStorage.removeItem("aruthala_siswa_session");
    document.cookie = "siswa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const sections = getSections(identity.roleGroup, identity.rawRole);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 shrink-0 bg-white/95 lg:bg-white/75 backdrop-blur-xl border-r border-white/80 flex flex-col overflow-hidden transition-all duration-300 shadow-[10px_0_30px_rgba(57,111,190,0.06)] ${
          sidebarOpen ? "translate-x-0 w-64 lg:w-60" : "-translate-x-full w-64 lg:translate-x-0 lg:w-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/80 flex items-center gap-3 bg-white/40">
          <div className="w-8 h-8 bg-[#2f66e9] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(47,102,233,0.24)]">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 tracking-tight">ARUTHALA</p>
            <p className="text-[10px] text-gray-400">Examination Platform</p>
          </div>
        </div>

        {/* Collapsible Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-2">
          {sections.map((group) => {
            // Auto-expand section that contains the active route
            const hasActiveChild = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );
            const isOpen = hasActiveChild || !collapsedSections.has(group.label);

            return (
              <CollapsibleSection
                key={group.label}
                group={group}
                isOpen={isOpen}
                onToggle={() => toggleSection(group.label)}
                pathname={pathname}
                onNavClick={handleNavClick}
              />
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/80 bg-white/35">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-white/80">
            <div className="w-8 h-8 bg-[#2f66e9] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_8px_16px_rgba(47,102,233,0.22)]">
              {getInitials(identity.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{identity.loading ? "Memuat..." : identity.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate">{identity.loading ? "Role" : identity.roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 shrink-0 p-1 rounded-lg hover:bg-white transition-colors"
              aria-label="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
