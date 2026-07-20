"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Medal, NotebookPen, TrendingUp, UserRound, CheckCircle2, Clock, AlertCircle, ArrowRight, Play } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { createClient } from "@/lib/supabase/client";
import type { ExamSession } from "@/types";

const QUICK_ACTIONS = [
  { title: "Mulai Ujian", desc: "Masuk ke daftar ujian aktif dan lanjutkan pengerjaan.", href: "/overview", icon: NotebookPen, tone: "blue" },
  { title: "Jadwal Ujian", desc: "Cek jadwal pelajaran, agenda ujian, dan batas waktu.", href: "/schedule", icon: CalendarDays, tone: "green" },
  { title: "Leaderboard", desc: "Pantau ranking dan pencapaian nilai tertinggi sekolah.", href: "/leaderboard", icon: Medal, tone: "amber" },
  { title: "Riwayat & Nilai", desc: "Lihat transkrip dan hasil ujian yang telah selesai.", href: "/student-report", icon: TrendingUp, tone: "purple" },
];

export default function StudentHubPage() {
  const { user, loading: roleLoading } = useUserRole();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "submitted">("all");

  useEffect(() => {
    async function loadStudentData() {
      if (roleLoading || !user?.id) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("exam_sessions")
          .select("*, exam:exams(title, mata_pelajaran, duration_minutes, show_result_after)")
          .eq("siswa_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setSessions(data as unknown as ExamSession[]);
      } catch (error) {
        console.error("Gagal memuat data ujian siswa:", error);
      } finally {
        setLoadingSessions(false);
      }
    }
    loadStudentData();
    const interval = setInterval(loadStudentData, 30000);
    return () => clearInterval(interval);
  }, [roleLoading, user?.id]);

  const submittedSessions = useMemo(() => sessions.filter(s => s.status === "submitted"), [sessions]);
  const inProgressSessions = useMemo(() => sessions.filter(s => s.status === "in_progress"), [sessions]);
  const totalScore = useMemo(() => submittedSessions.reduce((acc, curr) => acc + (curr.score || 0), 0), [submittedSessions]);
  const avgScore = useMemo(() => submittedSessions.length > 0 ? (totalScore / submittedSessions.length).toFixed(1) : "0", [submittedSessions, totalScore]);
  const totalViolations = useMemo(() => sessions.reduce((acc, curr) => acc + (curr.violation_count || 0), 0), [sessions]);

  const filteredSessions = useMemo(() => {
    if (activeTab === "in_progress") return inProgressSessions;
    if (activeTab === "submitted") return submittedSessions;
    return sessions;
  }, [sessions, activeTab, inProgressSessions, submittedSessions]);

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Hub Siswa</h1>
            <p className="page-subtitle">Satu tempat untuk memantau nilai, progres ujian, dan rekam jejak pengerjaan Anda.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
          <NotebookPen className="h-4 w-4" /> Daftar Ujian Aktif
        </Link>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ujian Selesai", value: loadingSessions ? "..." : submittedSessions.length.toString(), detail: "Telah disubmit & dikoreksi" },
          { label: "Ujian hari ini", value: loadingSessions ? "..." : inProgressSessions.length.toString(), detail: "Sesi ujian aktif" },
          { label: "Rata-rata Nilai", value: loadingSessions ? "..." : avgScore, detail: "Dari seluruh ujian selesai" },
          { label: "Pelanggaran Tercatat", value: loadingSessions ? "..." : totalViolations.toString(), detail: "Peringatan anti-cheat" },
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
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="card card-padding group hover:border-[#d8e6fb] transition-all">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                action.tone === "blue" ? "bg-blue-50 text-blue-600" :
                action.tone === "green" ? "bg-green-50 text-green-600" :
                action.tone === "amber" ? "bg-amber-50 text-amber-600" :
                "bg-purple-50 text-purple-600"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{action.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{action.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Sessions Table with Clean Filter Tabs */}
      <div className="card card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Riwayat Sesi Ujian Saya</h2>
              <p className="text-xs text-gray-500">Daftar percobaan pengerjaan dan nilai akhir</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
            {[
              { id: "all", label: "Semua Sesi", count: sessions.length },
              { id: "in_progress", label: "Ujian hari ini", count: inProgressSessions.length },
              { id: "submitted", label: "Selesai", count: submittedSessions.length },
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

        {loadingSessions ? (
          <div className="py-12 text-center text-sm text-gray-400">Memuat riwayat sesi ujian...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
            Belum ada riwayat pengerjaan pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran & Judul</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Percobaan</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pelanggaran</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Nilai Akhir</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((session) => {
                  const examObj = (session as unknown as { exam?: { title?: string; mata_pelajaran?: string; duration_minutes?: number; show_result_after?: string } }).exam;
                  const title = examObj?.title || `Ujian #${session.exam_id.slice(0, 8).toUpperCase()}`;
                  const mapel = examObj?.mata_pelajaran || "Umum";
                  const showResultAfter = examObj?.show_result_after || "submit";
                  const isFinished = session.status === "submitted";

                  return (
                    <tr key={session.id} className="hover:bg-[#f8fbff] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        <span className="inline-block mt-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {mapel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-700">Ke-{session.attempt_number || 1}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isFinished ? "bg-green-50 text-green-600 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>
                          {isFinished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isFinished ? "Selesai" : "Ujian hari ini"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {session.violation_count > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            <AlertCircle className="w-3 h-3" /> {session.violation_count} kali
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">Bersih (0)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {isFinished && session.score !== undefined ? (
                          showResultAfter === 'manual' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase">
                              Menunggu Rilis
                            </span>
                          ) : (
                            <span className="text-base font-bold text-[#2f66e9]">
                              {session.score}
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isFinished ? (
                          <Link
                            href={`/ujian/${session.exam_id}/hasil`}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2f66e9] bg-[#eef5ff] hover:bg-[#d8e8ff] transition-colors inline-flex items-center gap-1"
                          >
                            Hasil <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/ujian/${session.exam_id}`}
                            className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                          >
                            Lanjutkan <Play className="h-3 w-3 fill-current" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}