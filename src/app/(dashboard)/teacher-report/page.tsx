"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardList, FileText, Users, CheckCircle2, Clock, Table, LayoutGrid, MonitorPlay, ArrowRight } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";
import type { Exam } from "@/types";

export default function TeacherReportPage() {
  const { totalKelas, ujianAktif, pelanggaranHariIni, laporanSiap, loading: statsLoading } = useDashboardStats();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    async function loadExams() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("exams")
          .select("id, title, mata_pelajaran, duration_minutes, status, created_at")
          .order("created_at", { ascending: false });
        if (data) setExams(data as Exam[]);
      } catch (err) {
        console.error("Gagal memuat ujian untuk laporan guru:", err);
      } finally {
        setLoadingExams(false);
      }
    }
    loadExams();
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
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Teacher Report</h1>
            <p className="page-subtitle">Kinerja guru, pengawasan ujian real-time, dan rekapitulasi kelas dalam satu layar.</p>
          </div>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Kelas Terdata", value: statsLoading ? "..." : totalKelas.toString(), detail: "Terdaftar dalam database" },
          { label: "Ujian Aktif Dipantau", value: statsLoading ? "..." : ujianAktif.toString(), detail: "Sesi live monitoring" },
          { label: "Pelanggaran Hari Ini", value: statsLoading ? "..." : pelanggaranHariIni.toString(), detail: "Peringatan anti-cheat" },
          { label: "Laporan Nilai Siap", value: statsLoading ? "..." : laporanSiap.toString(), detail: "Siap direkap ke rapor" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#2f66e9]" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">Aktivitas Pembuatan Soal & Pengawasan</h2>
                <p className="text-xs text-gray-500">Daftar paket ujian yang dikelola dan dipantau guru</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
                {[
                  { id: "all", label: "Semua", count: exams.length },
                  { id: "published", label: "Aktif (Live)", count: exams.filter((e) => e.status === "published").length },
                  { id: "draft", label: "Draft", count: exams.filter((e) => e.status === "draft").length },
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

              <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  title="Tampilan Tabel"
                >
                  <Table className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  title="Tampilan Kartu"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loadingExams ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat daftar aktivitas pengawasan guru...</div>
          ) : filteredExams.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
              Belum ada paket ujian pada kategori ini.
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Paket Ujian</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Durasi</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Pengawasan & Rekap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-[#f8fbff] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{exam.title}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">Dibuat: {new Date(exam.created_at).toLocaleDateString("id-ID")}</p>
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
                          {exam.status === "published" ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link href={`/ujian/${exam.id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                            Soal
                          </Link>
                          {exam.status === "published" && (
                            <Link href={`/ujian/${exam.id}/monitor`} className="px-3 py-1.5 rounded-lg bg-[#2f66e9] text-white text-xs font-semibold hover:bg-[#1d52cd] transition-colors flex items-center gap-1 shadow-sm">
                              <MonitorPlay className="w-3 h-3" /> Monitor
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col justify-between space-y-3 hover:border-[#cbdffc] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-md bg-[#eef5ff] px-2.5 py-1 text-xs font-semibold text-[#2f66e9]">
                        {exam.mata_pelajaran || "Umum"}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-2">{exam.title}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      exam.status === "published" ? "bg-green-50 text-green-600 border-green-200" : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}>
                      {exam.status === "published" ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{exam.duration_minutes} Menit</span>
                    <Link href={`/ujian/${exam.id}/monitor`} className="text-xs font-semibold text-[#2f66e9] hover:underline inline-flex items-center gap-1">
                      Buka Monitor <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Panduan Pengawasan</h2>
              <p className="text-xs text-gray-500">Standar evaluasi & rekapitulasi</p>
            </div>
          </div>
          <div className="space-y-3 text-xs leading-6 text-gray-600">
            <p>1. Gunakan tombol <strong className="text-gray-900 font-semibold">Monitor</strong> pada paket ujian berstatus Live untuk membuka ruang pengawasan anti-cheat.</p>
            <p>2. Ekspor nilai akhir seluruh kelas atau per siswa dapat dilakukan langsung dari menu <strong className="text-gray-900 font-semibold">Laporan & Ekspor</strong>.</p>
          </div>
          <Link href="/reports" className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            Lihat Pusat Laporan Lengkap →
          </Link>
        </div>
      </div>
    </div>
  );
}