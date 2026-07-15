"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, NotebookText, School, CheckCircle2, Clock, ArrowRight, Table, LayoutGrid, Play, Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { Exam, PersonalSchedule } from "@/types";
import CalendarView from "./CalendarView";
import ScheduleModal from "./ScheduleModal";

function getExamStatus(exam: Exam) {
  if (exam.status !== "published") return { label: "Draft", style: "bg-gray-50 text-gray-600 border-gray-200", icon: <Clock className="w-3 h-3" /> };
  
  const now = new Date();
  if (exam.start_at && now < new Date(exam.start_at)) {
    return { label: "Akan Datang", style: "bg-blue-50 text-blue-600 border-blue-200", icon: <Clock className="w-3 h-3" /> };
  }
  if (exam.end_at && now > new Date(exam.end_at)) {
    return { label: "Selesai", style: "bg-red-50 text-red-600 border-red-200", icon: <CheckCircle2 className="w-3 h-3" /> };
  }
  return { label: "Live", style: "bg-green-50 text-green-600 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> };
}

export default function SchedulePage() {
  const { user } = useUserRole();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "calendar">("calendar");
  const [personalSchedules, setPersonalSchedules] = useState<PersonalSchedule[]>([]);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  useEffect(() => {
    async function loadExams() {
      setLoading(true);
      try {
        const supabase = createClient();
        let q = supabase
          .from("exams")
          .select("id, title, mata_pelajaran, duration_minutes, status, created_at, start_at, end_at")
          .order("created_at", { ascending: false });
        if (user?.sekolah_id) q = q.eq("sekolah_id", user.sekolah_id);
        
        let pQ = supabase.from("personal_schedules").select("*").order("start_time", { ascending: true });
        
        const [examRes, psRes] = await Promise.all([q, pQ]);
        if (examRes.data) setExams(examRes.data as Exam[]);
        if (psRes.data) setPersonalSchedules(psRes.data as PersonalSchedule[]);
      } catch (err) {
        console.error("Gagal memuat jadwal:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
    const interval = setInterval(loadExams, 30000);
    return () => clearInterval(interval);
  }, [user?.sekolah_id]);

  const filteredExams = useMemo(() => {
    if (activeTab === "published") return exams.filter((e) => e.status === "published");
    if (activeTab === "draft") return exams.filter((e) => e.status === "draft");
    return exams;
  }, [exams, activeTab]);

  const nextExam = exams.find((e) => e.status === "published") || exams[0];

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Jadwal & Agenda Akademik</h1>
          <p className="page-subtitle">Daftar pelaksanaan asesmen daring, batas waktu pengerjaan, dan durasi tiap mata pelajaran.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Hari Ini", value: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }), detail: "Kalender aktif", icon: CalendarDays },
          { title: "Ujian Terdekat", value: loading ? "..." : nextExam ? nextExam.title : "Belum Ada", detail: nextExam?.mata_pelajaran || "Umum", icon: NotebookText },
          { title: "Durasi Rata-rata", value: loading ? "..." : nextExam ? `${nextExam.duration_minutes} Menit` : "-", detail: "Alokasi waktu standar", icon: Clock3 },
          { title: "Mode Pelaksanaan", value: "Daring (Online)", detail: "Sistem Anti-Cheat aktif", icon: School },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{item.title}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 tracking-tight truncate">{item.value}</p>
              <p className="mt-1 text-xs text-gray-400 font-medium">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Table Section */}
      <div className="card card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Daftar Jadwal Ujian</h2>
              <p className="text-xs text-gray-500">Jadwal asesmen interaktif yang terdaftar di database sekolah</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Tampilan Tabel"
              >
                <Table className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "calendar" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Tampilan Kalender"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Memuat jadwal ujian dan agenda...</div>
        ) : viewMode === "calendar" ? (
          <CalendarView 
            exams={filteredExams} 
            personalSchedules={personalSchedules} 
            onAddSchedule={(date) => setModalDate(date)} 
          />
        ) : filteredExams.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
            Saat ini belum ada jadwal yang sesuai dengan filter Anda.
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Ujian & Agenda</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Alokasi Waktu</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status Jadwal</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExams.map((e) => (
                  <tr key={e.id} className="hover:bg-[#f8fbff] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">Kode Ujian: #{e.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {e.mata_pelajaran || "Umum"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-semibold text-gray-800">{e.duration_minutes} Menit</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getExamStatus(e).style}`}>
                        {getExamStatus(e).icon}
                        {getExamStatus(e).label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-gray-500">
                      {new Date(e.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/ujian/${e.id}`}
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                      >
                        Buka Ujian <Play className="h-3 w-3 fill-current" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((e) => (
              <div key={e.id} className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-5 flex flex-col justify-between space-y-4 hover:border-[#cbdffc] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-md bg-[#eef5ff] px-2.5 py-1 text-xs font-semibold text-[#2f66e9]">
                      {e.mata_pelajaran || "Umum"}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 mt-2">{e.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getExamStatus(e).style}`}>
                    {getExamStatus(e).label}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1.5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-400">Durasi Pengerjaan:</span>
                    <span className="font-semibold text-gray-800">{e.duration_minutes} Menit</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-400">Tanggal Dibuat:</span>
                    <span className="font-medium text-gray-700">{new Date(e.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/ujian/${e.id}`} className="btn-primary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    Lihat Soal & Pembahasan <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {modalDate && (
        <ScheduleModal 
          selectedDate={modalDate} 
          onClose={() => setModalDate(null)} 
          onSuccess={() => {
            setModalDate(null);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}