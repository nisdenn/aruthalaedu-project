"use client";

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

const commonSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
      { href: "/features", label: "Fitur & Roadmap", icon: ClipboardList },
      { href: "/notifications", label: "Notifikasi", icon: UserCircle2 },
      { href: "/profile", label: "Profil", icon: UserCircle2 },
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

const studentSections: NavSection[] = [
  {
    label: "Overview Siswa",
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
    label: "Guru",
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
      { href: "/subject-management", label: "Subject Management", icon: BookOpen },
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

function getSections(roleGroup: "admin" | "teacher" | "student" | "unknown"): NavSection[] {
  if (roleGroup === "admin") return [...commonSections, ...adminSections];
  if (roleGroup === "teacher") return [...commonSections, ...teacherSections];
  if (roleGroup === "student") return studentSections;
  return [...commonSections];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? "A"}${parts[1][0] ?? "U"}`.toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen } = useSidebar();
  const identity = useDashboardIdentity();

  const handleLogout = async () => {
    // Bersihkan bypass lokal jika ada
    localStorage.removeItem("aruthala_siswa_session");
    document.cookie = "siswa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`${
        sidebarOpen ? "w-60" : "w-0"
      } shrink-0 bg-white/75 backdrop-blur-xl border-r border-white/80 flex flex-col overflow-hidden transition-all duration-200 shadow-[10px_0_30px_rgba(57,111,190,0.06)]`}
    >
      <div className="p-4 border-b border-white/80 flex items-center gap-3 bg-white/40">
        <div className="w-8 h-8 bg-[#2f66e9] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(47,102,233,0.24)]">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 tracking-tight">ARUTHALA</p>
          <p className="text-[10px] text-gray-400">Examination Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {getSections(identity.roleGroup).map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        ))}
      </nav>

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
  );
}
