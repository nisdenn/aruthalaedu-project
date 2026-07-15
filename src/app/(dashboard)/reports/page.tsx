"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ArrowLeft, ClipboardList, FileDown, FileText, GraduationCap, Users, CheckCircle2 } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const REPORT_ROUTES = [
  { href: "/student-report", title: "Student Report", desc: "Ringkasan nilai, progress, dan catatan riwayat siswa.", icon: Users },
  { href: "/teacher-report", title: "Teacher Report", desc: "Kinerja guru, pengawasan, dan aktivitas pembuatan soal.", icon: GraduationCap },
  { href: "/exam-report", title: "Exam Report", desc: "Laporan hasil ujian, distribusi nilai, dan status submit.", icon: ClipboardList },
  { href: "/report-export", title: "Report Export", desc: "Unduh dan ekspor laporan PDF / Excel siap cetak.", icon: FileDown },
];

export default function ReportsPage() {
  const { laporanSiap, pelanggaranHariIni, totalUjian, totalSiswa, loading: statsLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] shadow-[0_10px_24px_rgba(47,102,233,0.10)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Pusat Laporan Akademik</h1>
            <p className="page-subtitle">Analisis nilai, kehadiran ujian, log pelanggaran, dan ekspor data secara real-time dari Supabase.</p>
          </div>
        </div>

        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start md:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sesi Ujian Selesai", value: statsLoading ? "..." : laporanSiap.toString(), detail: "Data nilai siap diekspor" },
          { label: "Paket Ujian Terdaftar", value: statsLoading ? "..." : totalUjian.toString(), detail: "Dalam pangkalan data sekolah" },
          { label: "Log Pelanggaran", value: statsLoading ? "..." : pelanggaranHariIni.toString(), detail: "Tercatat di sistem pengawas" },
          { label: "Total Murid Dinilai", value: statsLoading ? "..." : totalSiswa.toString(), detail: "Terkoneksi ke modul rapor" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_ROUTES.map((route) => {
          const Icon = route.icon;
          return (
            <Link key={route.href} href={route.href} className="card card-padding group hover:border-[#d8e6fb] hover:shadow-[0_22px_50px_rgba(57,111,190,0.12)] transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{route.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{route.desc}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#2f66e9]">
                Buka laporan <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h2 className="text-base font-semibold text-gray-900">Integrasi Penuh Supabase Reporting Engine</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Rekapitulasi otomatis per kelas & rombel",
            "Pelacakan aktivitas pengawas & guru mapel",
            "Statistik butir soal & indeks kesukaran",
            "Unduh massal format PDF & Microsoft Excel",
            "Penyaringan berdasarkan periode waktu",
            "Akses berjenjang (RBAC) Guru & Admin",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-[#f7fbff] px-4 py-3 text-sm text-[#2f66e9] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}