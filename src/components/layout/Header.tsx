"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { useSidebar } from "./DashboardShell";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Dashboard",
  "/ujian": "Ujian",
  "/bank-soal": "Bank Soal",
  "/data-siswa": "Data Siswa",
  "/academic": "Akademik",
  "/reports": "Laporan",
  "/settings": "Pengaturan",
};

const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "3 ujian belum dipublikasikan",
    description: "Periksa draft ujian yang masih menunggu penjadwalan.",
    icon: AlertCircle,
    tone: "amber",
  },
  {
    id: "notif-2",
    title: "Sinkronisasi data siswa selesai",
    description: "Import siswa terbaru sudah masuk ke database sekolah.",
    icon: CheckCircle2,
    tone: "green",
  },
];

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
  const pageTitle = getPageTitle(pathname);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            placeholder="Cari..."
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
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_24px_60px_rgba(57,111,190,0.16)] backdrop-blur-xl">
              <div className="flex items-center justify-between px-1 pb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
                  <p className="text-xs text-gray-500">Aktivitas terbaru sekolah</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">2 baru</span>
              </div>

              <div className="space-y-2">
                {NOTIFICATIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href="/overview"
                      className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-[#f6f9ff] transition-colors"
                      onClick={() => setNotificationOpen(false)}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs leading-5 text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-2xl hover:bg-white transition-colors">
          <div className="w-7 h-7 bg-[#2f66e9] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-[0_8px_16px_rgba(47,102,233,0.22)]">
            AU
          </div>
          <span className="text-xs font-medium text-gray-700">Admin</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
