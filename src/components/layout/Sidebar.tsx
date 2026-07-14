"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart2,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSidebar } from "./DashboardShell";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Ujian",
    items: [
      { href: "/ujian", label: "Ujian", icon: ClipboardList },
      { href: "/bank-soal", label: "Bank Soal", icon: BookOpen },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { href: "/data-siswa", label: "Data Siswa", icon: Users },
      { href: "/academic", label: "Akademik", icon: GraduationCap },
      { href: "/reports", label: "Laporan", icon: BarChart2 },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen } = useSidebar();

  const handleLogout = async () => {
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
        {navGroups.map((group) => (
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
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">Admin</p>
            <p className="text-[10px] text-gray-400 truncate">Sekolah</p>
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
