"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, BookOpenCheck, CalendarDays, Users, BookOpen } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function AcademicPage() {
  const { totalKelas, totalSiswa, totalMapel, loading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] shadow-[0_10px_24px_rgba(47,102,233,0.10)]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Pusat Akademik & Manajemen Kurikulum</h1>
            <p className="page-subtitle">Ringkasan kelas aktif, jadwal pengajaran, kalender akademik, dan mata pelajaran sekolah.</p>
          </div>
        </div>

        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start md:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { 
            title: "Jadwal & Kelas Aktif", 
            desc: "Pengelolaan jadwal mengajar dan pembagian rombongan belajar per kelas.", 
            value: loading ? "..." : `${totalKelas} Kelas Terdaftar`,
            icon: BookOpenCheck,
            href: "/class-management"
          },
          { 
            title: "Tahun & Kalender Akademik", 
            desc: "Pengelolaan semester, agenda ujian online, dan hari aktif sekolah.", 
            value: "Tahun Ajaran 2025/2026",
            icon: CalendarDays,
            href: "/academic-year"
          },
          { 
            title: "Bank Soal & Kurikulum", 
            desc: "Pusat repositori butir soal dan mata pelajaran berstandar merdeka belajar.", 
            value: loading ? "..." : `${totalMapel} Mata Pelajaran`,
            icon: BookOpen,
            href: "/subject-management"
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="card card-padding space-y-3 hover:border-[#2f66e9] transition-all block group">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] group-hover:bg-[#2f66e9] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-[#2f66e9] transition-colors">{item.title}</h2>
                  <p className="text-xs font-bold text-[#2f66e9]">{item.value}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-gray-600">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}