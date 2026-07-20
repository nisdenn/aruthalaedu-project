"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, WifiOff, Monitor, Clock, AlertTriangle, CheckCircle2, ArrowRight, BookOpen, GraduationCap, Lock, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function ExamLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [exam, setExam] = useState<any>(null);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetchExam(id);
    });
    const up = () => setOnline(true);
    const dn = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", dn); };
  }, [params]);

  async function fetchExam(examId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("exams").select("*").eq("id", examId).single();
    if (data) setExam(data);
  }

  const { user: userSession } = useUserRole();

  const handleStart = async () => {
    if (!agreed || !id || !exam) return;
    
    // Validasi Waktu Pelaksanaan
    const now = new Date();
    if (exam.start_at && now < new Date(exam.start_at)) {
      setSessionError(`Ujian belum dimulai. Ujian akan dibuka pada: ${new Date(exam.start_at).toLocaleString("id-ID")}`);
      return;
    }
    if (exam.end_at && now > new Date(exam.end_at)) {
      setSessionError(`Ujian sudah ditutup sejak: ${new Date(exam.end_at).toLocaleString("id-ID")}`);
      return;
    }

    setLoading(true);
    setSessionError("");
    
    const supabase = createClient();
    
    let userId = userSession?.id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user ? user.id : "b17a282a-6a38-4381-9dff-e8ff3865dfd8"; // Fallback
    }
    
    const { data: existingSessions, error: fetchErr } = await supabase
      .from("exam_sessions")
      .select("id, status, attempt_number")
      .eq("exam_id", exam.id)
      .eq("siswa_id", userId)
      .order("attempt_number", { ascending: false })
      .limit(1);

    if (fetchErr) {
      setSessionError("Gagal memeriksa sesi: " + fetchErr.message);
      setLoading(false);
      return;
    }

    if (existingSessions && existingSessions.length > 0) {
      const lastSession = existingSessions[0];
      if (lastSession.status === "in_progress") {
        router.push(`/e/${id}/mulai?session=${lastSession.id}`);
        return;
      }
      
      if (lastSession.status === "submitted") {
        if (lastSession.attempt_number >= exam.max_attempts) {
          setSessionError("Anda sudah mencapai batas maksimal percobaan ujian ini.");
          setLoading(false);
          return;
        }
        
        const attemptNum = lastSession.attempt_number + 1;
        const { data: newSession, error: newErr } = await supabase.from("exam_sessions").insert({
          exam_id: exam.id,
          siswa_id: userId,
          status: "in_progress",
          attempt_number: attemptNum,
          started_at: new Date().toISOString(),
          question_order: [],
          violation_count: 0,
          is_flagged: false,
        }).select().single();
        
        if (newErr) {
          setSessionError("Gagal memulai sesi ujian: " + newErr.message);
          setLoading(false);
          return;
        }
        router.push(`/e/${id}/mulai?session=${newSession.id}`);
        return;
      }
    }

    const { data: session, error } = await supabase.from("exam_sessions").insert({
      exam_id: exam.id,
      siswa_id: userId,
      status: "in_progress",
      attempt_number: 1,
      started_at: new Date().toISOString(),
      question_order: [],
      violation_count: 0,
      is_flagged: false,
    }).select().single();
    
    if (error) {
      console.error(error);
      setSessionError("Gagal memulai sesi ujian: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/e/${id}/mulai?session=${session.id}`);
  };

  const rules = exam ? [
    { icon: Monitor, text: "Ujian berjalan secara eksklusif dalam mode layar penuh (Fullscreen). Keluar dari mode tersebut akan memicu penghitungan pelanggaran otomatis oleh sistem." },
    { icon: Lock, text: "Perpindahan tab browser, aktivitas copy-paste, dan penggunaan pintasan keyboard (shortcut) dinonaktifkan demi integritas akademik." },
    { icon: Clock, text: `Durasi pengerjaan adalah ${exam.duration_minutes} menit. Penghitung waktu mundur akan berjalan saat Anda menekan tombol Mulai Ujian.` },
    { icon: WifiOff, text: "Sistem dilengkapi proteksi sinkronisasi offline. Jika koneksi terputus sesaat, jawaban Anda tetap tersimpan di dalam memori lokal." },
  ] : [];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] flex items-center justify-center p-4 sm:p-6 font-sans text-gray-900">
      <div className="max-w-xl w-full card card-padding bg-white border border-[#e3ebfa] shadow-[0_24px_60px_rgba(47,102,233,0.08)] rounded-3xl p-6 sm:p-10 space-y-8">
        {!exam ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-[#2f66e9] border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-600">Memuat Gerbang Ujian Sekolah...</p>
          </div>
        ) : (
          <>
            {/* Header Gate */}
            <div className="text-center space-y-3 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-[#eef5ff] text-[#2f66e9] flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#2f66e9] uppercase tracking-wider mb-2">
                  Gerbang Asesmen Resmi
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {exam.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-gray-600 pt-2">
                <span className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <Clock className="w-4 h-4 text-[#2f66e9]" /> {exam.duration_minutes} Menit
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <BookOpen className="w-4 h-4 text-[#2f66e9]" /> {exam.mata_pelajaran || "Umum"}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  <GraduationCap className="w-4 h-4 text-[#2f66e9]" /> Maksimal {exam.max_attempts} Percobaan
                </span>
              </div>
            </div>

            {/* Offline warning */}
            {!online && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Koneksi Internet Tidak Terdeteksi</p>
                  <p className="mt-0.5 text-amber-700">Anda tetap dapat memulai ujian. Sistem akan menyimpan jawaban ke dalam penyimpanan lokal dan menyinkronkannya saat jaringan kembali normal.</p>
                </div>
              </div>
            )}

            {/* Security Status Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Fullscreen Guard Aktif", active: true },
                { label: "Anti-Tab Switch Aktif", active: true },
                { label: "Clipboard Blokir", active: true },
                { label: "Proteksi Offline Siap", active: true },
              ].map(({ label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* Rules Card */}
            <div className="rounded-2xl border border-[#e3ebfa] bg-[#f8fbff] p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2f66e9]" /> Tata Tertib & Standar Pengawasan
              </h2>
              <div className="space-y-3.5">
                {rules.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#e3ebfa] text-[#2f66e9] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="flex-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-gray-200 hover:border-[#2f66e9]/40 bg-white cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded-md text-[#2f66e9] border-gray-300 focus:ring-[#2f66e9]"
              />
              <span className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                Saya telah membaca, memahami, dan menyetujui seluruh tata tertib ujian daring ini serta berkomitmen mengerjakan secara jujur tanpa bantuan dari pihak mana pun.
              </span>
            </label>

            {/* CTA Start Button */}
            {exam && exam.start_at && new Date() < new Date(exam.start_at) ? (
              <div className="w-full py-4 rounded-2xl bg-gray-100 border border-gray-200 text-gray-600 text-center font-bold text-sm">
                Ujian Dibuka pada: {new Date(exam.start_at).toLocaleString("id-ID")}
              </div>
            ) : exam && exam.end_at && new Date() > new Date(exam.end_at) ? (
              <div className="w-full py-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-center font-bold text-sm">
                Sesi Ujian Sudah Ditutup
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={!agreed || loading || !exam}
                className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                  agreed
                    ? "btn-primary bg-[#2f66e9] hover:bg-[#1d52cd] text-white shadow-[0_8px_20px_rgba(47,102,233,0.25)] cursor-pointer"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <span>{loading ? "Mempersiapkan Soal & Ruang Ujian..." : `Mulai Ujian Sekarang (${exam ? exam.duration_minutes : "-"} Menit)`}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {sessionError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm text-center font-semibold leading-relaxed">
                {sessionError}
              </div>
            )}

            <p className="text-center text-[11px] text-gray-400 pt-2 border-t border-gray-100">
              Integritas data dilindungi sistem keamanan AruthalaEdu & Undang-Undang Perlindungan Data Pribadi
            </p>
          </>
        )}
      </div>
    </div>
  );
}
