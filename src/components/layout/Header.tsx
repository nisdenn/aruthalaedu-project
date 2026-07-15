"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, Search, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Megaphone, ShieldAlert, FileText, ArrowRight, User, Settings, LogOut } from "lucide-react";
import { useSidebar } from "./DashboardShell";
import { useDashboardIdentity } from "./useDashboardIdentity";
import { createClient } from "@/lib/supabase/client";

interface HeaderNotifItem {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "alert" | "broadcast";
  time: string;
  created_at: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/student-hub": "Student Hub",
  "/teacher-hub": "Teacher Hub",
  "/admin-hub": "Admin Hub",
  "/parent-hub": "Parent Hub",
  "/akademik": "Daftar Siswa",
  "/data-siswa": "Daftar Siswa",
  "/ujian": "Jadwal Ujian",
  "/bank-soal": "Bank Soal",
  "/student-report": "Student Report",
  "/teacher-report": "Teacher Report",
  "/exam-report": "Exam Report",
  "/report-export": "Report Export",
  "/user-management": "User Management",
  "/class-management": "Class Management",
  "/subject-management": "Subject Management",
  "/academic-year": "Academic Year",
  "/school-health": "School Health",
  "/monitoring-center": "Monitoring Center",
  "/incident-report": "Incident Report",
  "/exam-health": "Exam Health",
  "/exam-gate": "Exam Gate",
  "/leaderboard": "Leaderboard",
  "/library-hub": "Library Hub",
  "/schedule": "Schedule",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/reports": "Laporan",
  "/settings": "Pengaturan",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return title;
    }
  }
  const segment = pathname.split("/").filter(Boolean).pop();
  return segment ? segment.replace(/-/g, " ") : "Dashboard";
}

export default function Header() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const identity = useDashboardIdentity();
  const pageTitle = getPageTitle(pathname);
  
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifs, setNotifs] = useState<HeaderNotifItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchTopNotifications() {
      if (identity.loading) return;
      setLoadingNotifs(true);
      const supabase = createClient();
      const list: HeaderNotifItem[] = [];

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || "";
        const isSiswa = identity.roleGroup === "student";
        const sekolahId = identity.sekolahId || user?.user_metadata?.sekolah_id || null;

        // 1. Ambil pesan siaran dari Admin Hub (system_announcements)
        const { data: annData } = await supabase
          .from("system_announcements")
          .select("id, title, content, type, target_type, target_sekolah_id, target_user_id, created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        if (annData && Array.isArray(annData)) {
          annData.forEach((a) => {
            const isGlobal = a.target_type === "GLOBAL";
            const isSchool = a.target_type === "SCHOOL" && (!sekolahId || a.target_sekolah_id === sekolahId);
            const isRoleSiswa = a.target_type === "ROLE_SISWA" && isSiswa && (!a.target_sekolah_id || a.target_sekolah_id === sekolahId);
            const isRoleGuru = a.target_type === "ROLE_GURU" && !isSiswa && (!a.target_sekolah_id || a.target_sekolah_id === sekolahId);
            const isPrivate = a.target_type === "PRIVATE" && a.target_user_id === userId;

            if (isGlobal || isSchool || isRoleSiswa || isRoleGuru || isPrivate) {
              list.push({
                id: `ann-${a.id}`,
                title: a.title,
                description: a.content,
                type: "broadcast",
                time: new Date(a.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                created_at: a.created_at,
              });
            }
          });
        }

        // 2. Notifikasi tambahan sesuai Role
        if (isSiswa) {
          let eQuery = supabase.from("exams").select("id, title, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(3);
          if (sekolahId) eQuery = eQuery.eq("sekolah_id", sekolahId);
          const { data: eData } = await eQuery;

          (eData || []).forEach((e) => {
            list.push({
              id: `exam-${e.id}`,
              title: `Ujian Aktif: ${e.title}`,
              description: "Paket ujian baru telah dibuka oleh sekolah Anda.",
              type: "success",
              time: new Date(e.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              created_at: e.created_at,
            });
          });
        } else {
          let vQuery = supabase.from("exam_violations").select("id, violation_type, created_at").order("created_at", { ascending: false }).limit(3);
          if (sekolahId) vQuery = vQuery.eq("sekolah_id", sekolahId);
          const { data: vData } = await vQuery;

          (vData || []).forEach((v) => {
            list.push({
              id: `viol-${v.id}`,
              title: `Pelanggaran (${v.violation_type})`,
              description: "Pengawas mencatat aktivitas curang oleh siswa saat ujian.",
              type: "alert",
              time: new Date(v.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              created_at: v.created_at,
            });
          });
        }

        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (active) {
          setNotifs(list.slice(0, 5));
        }
      } catch (err) {
        console.error("Gagal memuat notifikasi header:", err);
      } finally {
        if (active) setLoadingNotifs(false);
      }
    }

    fetchTopNotifications();
    const interval = setInterval(fetchTopNotifications, 30000); // refresh otomatis tiap 30s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [identity.loading, identity.roleGroup, identity.sekolahId]);

  const badgeCount = notifs.length;

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/80 flex items-center gap-4 px-4 sticky top-0 z-10 shadow-[0_10px_30px_rgba(57,111,190,0.05)]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1.5 rounded-xl hover:bg-white transition-colors text-gray-500"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="text-gray-400 tracking-wide">ARUTHALA</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="font-medium text-gray-700 capitalize">{pageTitle}</span>
      </div>

      <div className="flex-1 max-w-sm ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu / modul..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#edf3ff]/75 border border-[#e3ebfa] rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#5485f1]/10 focus:border-[#6c97fa] transition-all placeholder:text-[#9aabc2]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            className="relative p-2 rounded-xl hover:bg-white transition-colors text-gray-500"
            aria-haspopup="menu"
            aria-expanded={notificationOpen}
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {badgeCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2.5 w-84 sm:w-96 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_24px_60px_rgba(57,111,190,0.18)] backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#e3ebfa]">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2f66e9]">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Notifikasi & Siaran</p>
                    <p className="text-[11px] text-gray-500">Pembaruan real-time dari sistem</p>
                  </div>
                </div>
                {badgeCount > 0 && (
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2f66e9] uppercase tracking-wide">
                    {badgeCount} Baru
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                {loadingNotifs ? (
                  <div className="py-6 text-center text-xs text-gray-400">Memuat notifikasi terbaru...</div>
                ) : notifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs font-medium text-gray-500">Belum ada notifikasi baru.</p>
                  </div>
                ) : (
                  notifs.map((item) => {
                    return (
                      <Link
                        key={item.id}
                        href="/notifications"
                        onClick={() => setNotificationOpen(false)}
                        className={`flex items-start gap-3 rounded-2xl p-3 transition-all ${
                          item.type === "broadcast"
                            ? "bg-[linear-gradient(135deg,#f8fbff_0%,#eff6ff_100%)] border border-[#d3e5ff] hover:border-[#adcaff]"
                            : "hover:bg-[#f6f9ff] border border-transparent"
                        }`}
                      >
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          item.type === "broadcast" ? "bg-[#2f66e9] text-white shadow-[0_4px_12px_rgba(47,102,233,0.3)]" :
                          item.type === "alert" ? "bg-red-50 text-red-600" :
                          item.type === "success" ? "bg-green-50 text-green-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {item.type === "broadcast" ? <Megaphone className="h-4 w-4" /> :
                           item.type === "alert" ? <ShieldAlert className="h-4 w-4" /> :
                           item.type === "success" ? <CheckCircle2 className="h-4 w-4" /> :
                           <AlertCircle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                            <span className="text-[10px] font-medium text-gray-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-4 text-gray-600 line-clamp-2">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-[#e3ebfa] flex justify-between items-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="w-full btn-secondary py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 text-[#2f66e9] bg-[#eef5ff] hover:bg-[#d8e8ff] transition-colors"
                >
                  Lihat Seluruh Pusat Notifikasi <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-2xl transition-colors ${profileOpen ? "bg-white shadow-sm ring-1 ring-gray-100" : "hover:bg-white"}`}
          >
            <div className="w-7 h-7 bg-[#2f66e9] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-[0_8px_16px_rgba(47,102,233,0.22)]">
              {(identity.fullName.trim().charAt(0) || "A").toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-700 hidden sm:block">{identity.loading ? "Memuat role" : identity.roleLabel}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-[#e3ebfa] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-100 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate">{identity.fullName || "Pengguna"}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{identity.email || "Memuat..."}</p>
              </div>
              
              <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2f66e9] transition-colors">
                <User className="w-4 h-4" />
                <span className="font-medium">Profil & Akun</span>
              </Link>
              
              <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2f66e9] transition-colors">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Pengaturan Sistem</span>
              </Link>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              <Link href="/login" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="font-semibold">Keluar Aplikasi</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
