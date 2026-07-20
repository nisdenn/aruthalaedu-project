"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BarChart3, ClipboardList, FlagTriangleRight, MonitorPlay, Users2, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, PlusCircle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";
import type { Exam } from "@/types";

interface ViolationRow {
  id: string;
  violation_type: string;
  created_at: string;
  exam_session_id: string;
}

const CARDS = [
  { title: "Live Monitoring", desc: "Pantau aktivitas siswa, waktu tersisa, dan pengawasan anti-cheat.", icon: MonitorPlay, href: "/ujian" },
  { title: "Manajemen Ujian", desc: "Buat paket soal baru, atur durasi, dan publikasikan jadwal ujian.", icon: ClipboardList, href: "/ujian/buat" },
  { title: "Bank Soal", desc: "Kelola repositori soal interaktif untuk digunakan kembali per kelas.", icon: Users2, href: "/bank-soal" },
  { title: "Laporan & Rekap", desc: "Analisis performa, nilai akhir, dan ekspor log kelas ke format resmi.", icon: BarChart3, href: "/reports" },
];

export default function TeacherHubPage() {
  const { totalSiswa, ujianAktif, pelanggaranHariIni, laporanSiap, loading: statsLoading } = useDashboardStats();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [violations, setViolations] = useState<ViolationRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "violations">("all");

  useEffect(() => {
    let active = true;

    async function loadTeacherDashboardData() {
      try {
        const supabase = createClient();
        
        const { data: examData } = await supabase
          .from("exams")
          .select("id, title, mata_pelajaran, duration_minutes, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
          
        const { data: violData } = await supabase
          .from("exam_violations")
          .select("id, violation_type, created_at, exam_session_id")
          .order("created_at", { ascending: false })
          .limit(6);

        if (active) {
          if (examData) setExams(examData as Exam[]);
          if (violData) setViolations(violData as ViolationRow[]);
        }
      } catch (error) {
        console.error("Gagal memuat data Hub Guru:", error);
      } finally {
        if (active) setLoadingData(false);
      }
    }

    loadTeacherDashboardData();
    const interval = setInterval(loadTeacherDashboardData, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filteredExams = useMemo(() => {
    if (activeTab === "published") return exams.filter((e) => e.status === "published");
    if (activeTab === "draft") return exams.filter((e) => e.status === "draft");
    return exams;
  }, [exams, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Hub Guru</h1>
          <p className="page-subtitle">Pusat kontrol ujian, monitoring pelanggaran, dan laporan kelas real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/bank-soal" className="btn-secondary inline-flex items-center gap-2">
            <Users2 className="h-4 w-4" /> Bank Soal
          </Link>
          <Link href="/ujian/buat" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Buat Ujian
          </Link>
        </div>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ujian Aktif (Published)", value: statsLoading ? "..." : ujianAktif.toString(), detail: "Sedang dipantau real-time" },
          { label: "Total Siswa Terdata", value: statsLoading ? "..." : totalSiswa.toString(), detail: "Dalam pangkalan data sekolah" },
          { label: "Pelanggaran Hari Ini", value: statsLoading ? "..." : pelanggaranHariIni.toString(), detail: "Tercatat oleh sistem anti-cheat" },
          { label: "Sesi Ujian Selesai", value: statsLoading ? "..." : laporanSiap.toString(), detail: "Siap direkap ke laporan" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="card card-padding group hover:border-[#d8e6fb] transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{card.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Filter Tabs & Data Table Section */}
      <div className="card card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FlagTriangleRight className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Pusat Ujian & Pengawasan</h2>
              <p className="text-xs text-gray-500">Daftar paket ujian aktif, draf soal, dan log pelanggaran</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
            {[
              { id: "all", label: "Semua Ujian", count: exams.length },
              { id: "published", label: "Aktif (Live)", count: exams.filter(e => e.status === "published").length },
              { id: "draft", label: "Draft", count: exams.filter(e => e.status === "draft").length },
              { id: "violations", label: "Log Pelanggaran", count: violations.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#2f66e9] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loadingData ? (
          <div className="py-12 text-center text-sm text-gray-400">Memuat data ujian dan log pengawasan...</div>
        ) : activeTab === "violations" ? (
          violations.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
              Belum ada catatan pelanggaran hari ini.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Kejadian</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Pelanggaran</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Sesi Ujian</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Kejadian</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {violations.map((v) => (
                    <tr key={v.id} className="hover:bg-[#f8fbff] transition-colors">
                      <td className="px-5 py-4 text-xs font-mono font-medium text-gray-700">#{v.id.slice(0, 8)}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                          <AlertTriangle className="h-3 w-3" /> {v.violation_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-gray-500">{v.exam_session_id ? `#${v.exam_session_id.slice(0, 8)}` : "-"}</td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-500">
                        {new Date(v.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href="/monitoring-center" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2f66e9] bg-[#eef5ff] hover:bg-[#d8e8ff] inline-flex items-center gap-1">
                          Investigasi <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredExams.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
            Tidak ada ujian pada kategori ini. Silakan buat ujian baru.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Ujian</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Durasi</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-[#f8fbff] transition-colors">
                    <td className="px-5 py-4 max-w-[250px]">
                      <p className="text-sm font-semibold text-gray-900 truncate">{exam.title}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">Kode Ujian: #{exam.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {exam.mata_pelajaran || "Umum"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-semibold text-gray-800">{exam.duration_minutes} Menit</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        exam.status === "published"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>
                        {exam.status === "published" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {exam.status === "published" ? "Aktif" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-gray-500">
                      {new Date(exam.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/ujian/${exam.id}`}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Detail
                        </Link>
                        {exam.status === "published" && (
                          <Link
                            href={`/ujian/${exam.id}/monitor`}
                            className="px-3 py-1.5 rounded-lg bg-[#2f66e9] text-white text-xs font-semibold hover:bg-[#1d52cd] transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <MonitorPlay className="w-3 h-3" /> Live
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}