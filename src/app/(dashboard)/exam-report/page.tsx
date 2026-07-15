"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, FileDown, PieChart, Timer, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { Exam } from "@/types";

interface ExamWithStats extends Exam {
  submittedCount: number;
  totalStudents: number;
  avgScore: number;
}

export default function ExamReportPage() {
  const { user } = useUserRole();
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const supabase = createClient();
        
        let examsQuery = supabase.from("exams").select("*").order("created_at", { ascending: false });
        if (user?.sekolah_id) examsQuery = examsQuery.eq("sekolah_id", user.sekolah_id);
        const { data: eData } = await examsQuery;

        let sessionsQuery = supabase.from("exam_sessions").select("exam_id, score, status");
        if (user?.sekolah_id) sessionsQuery = sessionsQuery.eq("sekolah_id", user.sekolah_id);
        const { data: sData } = await sessionsQuery;

        let siswaQuery = supabase.from("profiles").select("id").eq("role", "SISWA");
        if (user?.sekolah_id) siswaQuery = siswaQuery.eq("sekolah_id", user.sekolah_id);
        const { data: pData } = await siswaQuery;

        const sCount = pData?.length || 0;
        setTotalStudents(sCount);

        const statsMap = new Map<string, { totalScore: number; submitted: number }>();
        (sData || []).forEach(s => {
          if (s.status === "submitted") {
            const current = statsMap.get(s.exam_id) || { totalScore: 0, submitted: 0 };
            statsMap.set(s.exam_id, {
              totalScore: current.totalScore + (s.score || 0),
              submitted: current.submitted + 1,
            });
          }
        });

        const enhanced: ExamWithStats[] = (eData || []).map(e => {
          const st = statsMap.get(e.id) || { totalScore: 0, submitted: 0 };
          const avg = st.submitted > 0 ? Math.round((st.totalScore / st.submitted) * 10) / 10 : 0;
          return {
            ...e,
            submittedCount: st.submitted,
            totalStudents: sCount,
            avgScore: avg,
          };
        });

        setExams(enhanced);
      } catch (err) {
        console.error("Gagal memuat laporan ujian:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [user?.sekolah_id]);

  const activeExams = exams.filter(e => e.status === "published").length;
  const totalSubmittedAll = exams.reduce((acc, curr) => acc + curr.submittedCount, 0);
  const totalScoreAll = exams.reduce((acc, curr) => acc + (curr.avgScore * curr.submittedCount), 0);
  const globalAvg = totalSubmittedAll > 0 ? (totalScoreAll / totalSubmittedAll).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Exam Report</h1>
          <p className="page-subtitle">Laporan hasil ujian, analisis rata-rata nilai, dan status submit siswa real-time.</p>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ujian Aktif", value: loading ? "..." : activeExams.toString() },
          { label: "Rata-rata Global", value: loading ? "..." : globalAvg },
          { label: "Total Sesi Selesai", value: loading ? "..." : totalSubmittedAll.toString() },
          { label: "Export Ready", value: "PDF / CSV" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#2f66e9]" />
              <h2 className="text-base font-semibold text-gray-900">Distribusi Sesi & Nilai Ujian</h2>
            </div>
            <span className="text-xs text-gray-400">Total Murid Terdata: {totalStudents}</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat statistik dari exam_sessions...</div>
          ) : exams.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
              Belum ada paket ujian yang dibuat.
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div key={exam.id} className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 hover:border-[#cbdffc] transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{exam.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {exam.mata_pelajaran || "Umum"} • Durasi {exam.duration_minutes} Menit • Terkumpul {exam.submittedCount} dari {totalStudents > 0 ? totalStudents : 1} siswa
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      exam.status === "published" ? "bg-green-50 text-green-600 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>
                      {exam.status === "published" ? "Aktif" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#f0f5ff] flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2f66e9]">
                        <ClipboardList className="h-3.5 w-3.5" />
                        Rata-rata Nilai: {exam.avgScore}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <Timer className="h-3.5 w-3.5" />
                        Max {exam.max_attempts || 1}x attempt
                      </span>
                    </div>
                    <Link href={`/ujian/${exam.id}/hasil`} className="px-3 py-1 rounded-xl bg-[#f0f5ff] text-[#2f66e9] font-semibold hover:bg-[#e1edff] transition-colors">
                      Lihat Detail Nilai →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Ekspor Laporan</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Seluruh nilai yang disubmit oleh siswa saat ujian selesai otomatis diakumulasi pada tabel laporan ini.</p>
            <p>Guru mapel dan wali kelas dapat langsung mencetak transkrip untuk rapor semester.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Sistem Penilaian Terpadu</span>
            </div>
            <p className="text-gray-600 leading-relaxed">Nilai esai dan pilihan ganda dihitung dengan bobot dari `exam_questions`.</p>
          </div>
        </div>
      </div>
    </div>
  );
}