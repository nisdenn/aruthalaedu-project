"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BookOpen, GraduationCap, TrendingUp, UserRound, CheckCircle2, Table, LayoutGrid, Award, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface SubjectScore {
  name: string;
  score: number;
  status: string;
  count: number;
}

export default function StudentReportPage() {
  const { user } = useUserRole();
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgGlobal, setAvgGlobal] = useState<number>(0);
  const [totalDone, setTotalDone] = useState<number>(0);
  const [totalAssigned, setTotalAssigned] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "excel" | "eval">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    async function loadStudentReport() {
      setLoading(true);
      try {
        const supabase = createClient();
        
        let sessionsQuery = supabase.from("exam_sessions").select("score, status, exams(title, mata_pelajaran)");
        if (user?.role === "SISWA") {
          sessionsQuery = sessionsQuery.eq("siswa_id", user.id);
        } else if (user?.sekolah_id) {
          sessionsQuery = sessionsQuery.eq("sekolah_id", user.sekolah_id);
        }
        const { data: sData } = await sessionsQuery;

        const submitted = (sData || []).filter(s => s.status === "submitted");
        setTotalDone(submitted.length);
        setTotalAssigned(sData?.length || 0);

        let sum = 0;
        const subMap = new Map<string, { total: number; count: number }>();

        submitted.forEach(s => {
          const sc = s.score || 0;
          sum += sc;
          const mapel = (s.exams as unknown as { mata_pelajaran?: string; title?: string })?.mata_pelajaran || 
                        (s.exams as unknown as { mata_pelajaran?: string; title?: string })?.title || "Umum";
          const curr = subMap.get(mapel) || { total: 0, count: 0 };
          subMap.set(mapel, { total: curr.total + sc, count: curr.count + 1 });
        });

        const avg = submitted.length > 0 ? Math.round((sum / submitted.length) * 10) / 10 : 0;
        setAvgGlobal(avg);

        const list: SubjectScore[] = Array.from(subMap.entries()).map(([name, val]) => {
          const subAvg = Math.round(val.total / val.count);
          let status = "C";
          if (subAvg >= 88) status = "A";
          else if (subAvg >= 80) status = "B+";
          else if (subAvg >= 70) status = "B";
          return {
            name,
            score: subAvg,
            status,
            count: val.count,
          };
        });

        setSubjectScores(list);
      } catch (err) {
        console.error("Gagal memuat laporan siswa:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentReport();
  }, [user?.id, user?.role, user?.sekolah_id]);

  const progressPct = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 100;

  const filteredSubjects = useMemo(() => {
    if (activeTab === "excel") return subjectScores.filter((s) => s.status === "A" || s.status === "B+");
    if (activeTab === "eval") return subjectScores.filter((s) => s.status === "B" || s.status === "C");
    return subjectScores;
  }, [subjectScores, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Student Report & Rekapitulasi Nilai</h1>
            <p className="page-subtitle">Rapor akumulasi per mata pelajaran, predikat kelulusan, dan grafik kemajuan belajar.</p>
          </div>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nilai Rata-rata Global", value: loading ? "..." : avgGlobal.toString(), detail: "Dari seluruh mata pelajaran" },
          { label: "Progress Penyelesaian", value: loading ? "..." : `${progressPct}%`, detail: `${totalDone} dari ${totalAssigned || 1} ujian selesai` },
          { label: "Total Mata Pelajaran", value: loading ? "..." : `${subjectScores.length} Mapel`, detail: "Terdaftar dalam transkrip" },
          { label: "Status Akademik", value: avgGlobal >= 75 || totalDone === 0 ? "Memuaskan" : "Perlu Bimbingan", detail: "Berdasarkan KKM (75)" },
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
              <BadgeCheck className="h-5 w-5 text-green-600" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">Rekap Nilai Per Mata Pelajaran</h2>
                <p className="text-xs text-gray-500">Rata-rata capaian dan predikat kelulusan siswa</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
                {[
                  { id: "all", label: "Semua Mapel", count: subjectScores.length },
                  { id: "excel", label: "Predikat A / B+", count: subjectScores.filter((s) => s.status === "A" || s.status === "B+").length },
                  { id: "eval", label: "Perlu Evaluasi", count: subjectScores.filter((s) => s.status === "B" || s.status === "C").length },
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

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Menghitung rekapitulasi nilai dari database...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
              Tidak ada mata pelajaran pada kategori ini.
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Sesi Ujian</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Predikat</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Rata-rata Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.name} className="hover:bg-[#f8fbff] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Rapor transkrip resmi</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-semibold text-gray-700">{subject.count} Ujian Selesai</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          subject.status === "A" ? "bg-green-50 text-green-700 border border-green-200" :
                          subject.status === "B+" ? "bg-blue-50 text-[#2f66e9] border border-blue-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {subject.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-base font-bold text-[#2f66e9]">{subject.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredSubjects.map((subject) => (
                <div key={subject.name} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between hover:border-[#cbdffc] transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Predikat: <span className="font-bold text-[#2f66e9]">{subject.status}</span> ({subject.count} ujian)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#2f66e9]">{subject.score}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Skor</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <TrendingUp className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Analisis Kemajuan Belajar</h2>
              <p className="text-xs text-gray-500">Evaluasi performa otomatis</p>
            </div>
          </div>
          <div className="space-y-3 text-xs leading-6 text-gray-600">
            <p>Seluruh butir soal yang dijawab saat asesmen daring dianalisis secara akurat pasca-koreksi.</p>
            <p>Predikat <strong className="text-green-700 font-semibold">A</strong> diberikan untuk skor ≥ 88, <strong className="text-[#2f66e9] font-semibold">B+</strong> untuk ≥ 80, dan <strong className="text-amber-700 font-semibold">B/C</strong> untuk di bawahnya.</p>
          </div>
          <div className="rounded-xl border border-[#d8e6fb] bg-[#f7fbff] p-3 text-xs text-[#2f66e9] flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Siap diunduh sebagai transkrip resmi sekolah.</span>
          </div>
        </div>
      </div>
    </div>
  );
}