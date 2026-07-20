"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, ArrowLeft, ArrowRight, Bookmark, Check, ShieldAlert, WifiOff, FileText, Send, Lock } from "lucide-react";
import { ExamAntiCheat } from "@/lib/exam/anti-cheat";
import { saveAnswer, getLocalAnswers } from "@/lib/exam/offline-storage";
import { SyncManager } from "@/lib/exam/sync-manager";
import { formatSeconds } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type AnswerVal = string | boolean | null;

export default function ExamRoomPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#2f66e9] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Membiapkan Ruang Ujian Daring...</p>
      </div>
    }>
      <ExamRoomClient params={params} />
    </Suspense>
  );
}

function ExamRoomClient({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const nextSearchParams = useSearchParams();
  const sessionId = nextSearchParams.get("session");
  
  const [examData, setExamData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerVal>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [idx, setIdx] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [violations, setViolations] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isProctorLocked, setIsProctorLocked] = useState(false);
  const [syncOk, setSyncOk] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const acRef = useRef<ExamAntiCheat | null>(null);
  const syncRef = useRef<SyncManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetchExamData(id);
    });
  }, [params]);

  async function fetchExamData(examId: string) {
    if (!sessionId) return;
    try {
      const supabase = createClient();
    
    // Fetch exam details
    const { data: exam, error: examError } = await supabase.from("exams").select("*").eq("id", examId).single();
    if (examError || !exam) throw new Error("Fetch failed");

    // Fetch exam_questions
    const { data: eq, error: eqError } = await supabase.from("exam_questions").select("question_id, urutan").eq("exam_id", examId).order("urutan", { ascending: true });
    if (eqError || !eq || eq.length === 0) throw new Error("Fetch failed");
    const qIds = eq.map(x => x.question_id);
    
    // Fetch questions
    const { data: qs, error: qsError } = await supabase.from("questions").select("*").in("id", qIds);
    if (qsError || !qs) throw new Error("Fetch failed");

    // Sort questions by exam_questions.urutan
    const sortedQs = [];
    for (const qid of qIds) {
      const q = qs.find(x => x.id === qid);
      if (q) sortedQs.push(q);
    }

      const data = {
        session_id: sessionId,
        exam_title: exam.title,
        mata_pelajaran: exam.mata_pelajaran || "Umum",
        total_questions: sortedQs.length,
        duration_seconds: exam.duration_minutes * 60,
        anti_cheat_config: exam.anti_cheat_config || { fullscreen: false, tab_blur: false },
        questions: sortedQs
      };

      await import("@/lib/exam/offline-storage").then(m => m.saveExamDataLocal(sessionId, data));

      setExamData(data);
      setTimeLeft(data.duration_seconds);
      initExam(data);
    } catch (e) {
      // Offline fallback
      const m = await import("@/lib/exam/offline-storage");
      const localData = await m.loadExamDataLocal(sessionId);
      if (localData) {
        setExamData(localData);
        setTimeLeft(localData.duration_seconds);
        initExam(localData);
      } else {
        alert("Koneksi terputus dan soal belum diunduh. Silakan refresh saat online.");
      }
    }
  }

  function initExam(data: any) {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setIsOffline(!navigator.onLine);

    // Muat jawaban lokal jika ada (Offline Resilience)
    const localAnswers = getLocalAnswers(data.session_id);
    const restoredAnswers: Record<string, AnswerVal> = {};
    for (const [qid, item] of Object.entries(localAnswers)) {
      restoredAnswers[qid] = item.answer as AnswerVal;
    }
    if (Object.keys(restoredAnswers).length > 0) {
      setAnswers(restoredAnswers);
    }

    const ac = new ExamAntiCheat({
      sessionId: data.session_id,
      config: data.anti_cheat_config,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      token: typeof window !== "undefined" ? (sessionStorage.getItem("siswa_token") ?? "") : "",
    });
    ac.onViolation = (e) => setViolations(v => ({ ...v, [e.type]: e.count }));
    ac.onLock = (r) => { setIsLocked(true); setLockReason(r); };
    ac.onProctorLock = async (r) => {
      setIsProctorLocked(true);
      setIsLocked(true);
      setLockReason(r);
      if (sessionId) {
        const supabase = createClient();
        await supabase.from('exam_sessions').update({ is_proctor_locked: true, is_flagged: true }).eq('id', sessionId);
      }
    };
    ac.onForceSubmit = () => doSubmit();
    ac.init();
    acRef.current = ac;

    const sync = new SyncManager({
      sessionId: data.session_id,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      token: typeof window !== "undefined" ? (sessionStorage.getItem("siswa_token") ?? "") : "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      onSyncSuccess: () => setSyncOk(true),
      onSyncError: () => setSyncOk(false),
    });
    sync.start();
    syncRef.current = sync;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); doSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (acRef.current) acRef.current.destroy();
      if (syncRef.current) syncRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isProctorLocked || !sessionId) return;
    const poll = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('exam_sessions').select('is_proctor_locked').eq('id', sessionId).single();
      if (data && !data.is_proctor_locked) {
        setIsProctorLocked(false);
        setIsLocked(false);
        setLockReason('');
        clearInterval(poll);
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [isProctorLocked, sessionId]);

  const doSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    acRef.current?.destroy();
    await syncRef.current?.flushAll();
    
    // Kalkulasi skor
    let correctCount = 0;
    if (examData && examData.questions) {
      examData.questions.forEach((q: any) => {
        const studentAns = answers[q.id];
        if (q.type === "multiple_choice" && q.content?.options) {
           const correctOpt = q.content.options.find((o: any) => o.is_correct);
           if (correctOpt && studentAns === correctOpt.id) {
             correctCount++;
           }
        } else if (q.type === "true_false" && q.content?.correct_answer !== undefined) {
           if (studentAns === q.content.correct_answer) {
             correctCount++;
           }
        }
      });
    }
    const finalScore = examData?.total_questions ? Math.round((correctCount / examData.total_questions) * 100) : 0;

    if (sessionId) {
      if (!navigator.onLine) {
        const m = await import("@/lib/exam/offline-storage");
        await m.markSessionPendingSync(sessionId, finalScore, timeLeft);
        setSyncOk(false);
      } else {
        const supabase = createClient();
        await supabase.from("exam_sessions").update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          time_remaining: timeLeft,
          score: finalScore
        }).eq("id", sessionId);
      }
    }

    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    setSubmitted(true);
  }, [sessionId, timeLeft, examData, answers]);

  const setAnswer = useCallback((qid: string, val: AnswerVal) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    if (examData) {
      saveAnswer(examData.session_id, qid, val as unknown as Record<string, unknown>);
    }
  }, [examData]);

  const toggleFlag = (qid: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  };

  const unlockFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsLocked(false);
      setLockReason("");
    } catch {
      setLockReason("Mohon izinkan mode layar penuh agar ujian dapat dilanjutkan.");
    }
  };

  if (!examData) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#2f66e9] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Memuat Butir Soal & Konfigurasi Ujian...</p>
        <p className="text-xs text-gray-400">Jika terjebak di halaman ini saat offline, pastikan Anda telah menekan Mulai saat online.</p>
      </div>
    );
  }

  const q = examData.questions[idx];
  const answeredCount = Object.keys(answers).length;
  const totalViolations = Object.values(violations).reduce((a, b) => a + b, 0);
  const isUrgent = timeLeft < 300; // < 5 menit
  const isWarning = timeLeft < 900 && !isUrgent; // < 15 menit

  // ── SUBMITTED SCREEN (Gaya Denis Profesional) ─────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] flex items-center justify-center p-4 sm:p-6 font-sans text-gray-900">
        <div className="max-w-md w-full card card-padding bg-white border border-[#e3ebfa] shadow-[0_20px_50px_rgba(47,102,233,0.08)] rounded-3xl text-center space-y-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
              Sesi Ujian Selesai
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Jawaban Berhasil Dikumpulkan</h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              Seluruh butir soal telah direkam oleh pangkalan data sekolah. Hasil dan analisis transkrip akan diverifikasi oleh guru pengampu.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e3ebfa] bg-[#f8fbff] p-5 grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Butir Dijawab</span>
              <span className="mt-1 text-lg font-extrabold text-gray-900">{answeredCount} / {examData.total_questions}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Pengawasan</span>
              <span className={`mt-1 text-lg font-extrabold ${totalViolations > 0 ? "text-amber-600" : "text-green-600"}`}>
                {totalViolations > 0 ? `${totalViolations} Peringatan` : "100% Bersih"}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Waktu Digunakan</span>
              <span className="mt-1 text-lg font-bold text-gray-800">{formatSeconds(examData.duration_seconds - timeLeft)}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Sinkronisasi</span>
              <span className={`mt-1 text-sm font-bold flex items-center gap-1 ${syncOk ? "text-green-600" : "text-amber-600"}`}>
                {syncOk ? "Tersimpan" : "Tersimpan Lokal (Menunggu Sinyal)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.replace("/overview")}
            className="btn-primary w-full py-3.5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2"
          >
            Kembali ke Portal Siswa →
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN CBT EXAM ROOM (Gaya Denis Profesional) ──────────────────
  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col font-sans text-gray-900 select-none">
      {/* LOCK OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4 modal-overlay">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-6 shadow-2xl border border-gray-200 modal-content">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              {isProctorLocked ? <ShieldAlert className="w-8 h-8 animate-pulse" /> : <Lock className="w-8 h-8" />}
            </div>
            <div>
              <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                {isProctorLocked ? "Sesi Ujian Terkunci oleh Pengawas" : "Keamanan Anti-Cheat"}
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                {isProctorLocked ? "Menunggu Verifikasi Pengawas" : "Sesi Ujian Terkunci Sementara"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {lockReason || "Sistem mendeteksi Anda keluar dari mode layar penuh atau berpindah tab. Mohon kembali ke mode layar penuh untuk melanjutkan."}
              </p>
            </div>
            {!isProctorLocked && (
              <button
                type="button"
                onClick={unlockFullscreen}
                className="btn-primary w-full py-3.5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2"
              >
                Kembali ke Layar Penuh & Lanjutkan
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 modal-overlay">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-2xl border border-gray-200 modal-content">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#eef5ff] text-[#2f66e9] flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Konfirmasi Pengumpulan Ujian</h3>
                <p className="text-xs text-gray-500">Pastikan seluruh butir soal telah diperiksa</p>
              </div>
            </div>

            <div className="space-y-3 bg-[#f8fbff] rounded-2xl p-4 border border-[#e3ebfa] text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500">Soal Sudah Dijawab:</span>
                <span className="font-bold text-green-600 text-sm">{answeredCount} dari {examData.total_questions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500">Soal Ditandai (Ragu-ragu):</span>
                <span className="font-bold text-amber-600 text-sm">{flaggedQuestions.size} soal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500">Sisa Waktu Ujian:</span>
                <span className="font-bold text-gray-900 text-sm">{formatSeconds(timeLeft)}</span>
              </div>
            </div>

            {answeredCount < examData.total_questions && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>Ada <strong>{examData.total_questions - answeredCount} soal</strong> yang belum Anda jawab. Apakah Anda yakin ingin mengakhiri ujian sekarang?</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Batal & Periksa Lagi
              </button>
              <button
                type="button"
                onClick={doSubmit}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                Ya, Kumpulkan Sekarang →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. STICKY TOP HEADER (Profesional CBT Bar) */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#e3ebfa] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2f66e9] font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-900 truncate">{examData.exam_title}</h1>
              <span className="hidden sm:inline-flex items-center rounded-lg bg-[#eef5ff] px-2.5 py-0.5 text-[11px] font-bold text-[#2f66e9]">
                {examData.mata_pelajaran}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
              <span>Sesi #{sessionId?.slice(0, 8) || "Aktif"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className={isOffline ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                {isOffline ? "Offline Mode" : "Terhubung"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Countdown Pill */}
          <div className={`px-4 py-2 rounded-xl border font-mono text-sm sm:text-base font-extrabold flex items-center gap-2 transition-colors ${
            isUrgent
              ? "bg-red-50 border-red-200 text-red-600 animate-pulse shadow-sm"
              : isWarning
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-[#f8fbff] border-[#e3ebfa] text-[#2f66e9]"
          }`}>
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formatSeconds(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="btn-primary bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm"
          >
            <span>Selesai</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Split 3:1 Layout) */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 grid gap-6 lg:grid-cols-4 items-start">
        {/* LEFT COLUMN: Area Soal & Opsi Jawaban (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card card-padding bg-white border border-[#e3ebfa] shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Question Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2f66e9] font-bold text-sm">
                  {idx + 1}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Soal Nomor {idx + 1} dari {examData.total_questions}</h2>
                  <p className="text-xs text-gray-400">Pilih satu jawaban yang paling tepat</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFlag(q.id)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    flaggedQuestions.has(q.id)
                      ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions.has(q.id) ? "fill-white" : ""}`} />
                  <span>{flaggedQuestions.has(q.id) ? "Ditandai Ragu-ragu" : "Tandai Ragu-ragu"}</span>
                </button>
              </div>
            </div>

            {/* Question Text HTML */}
            <div
              className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed py-2 select-text"
              dangerouslySetInnerHTML={{ __html: q.content.text }}
            />

            {/* Multiple Choice Options */}
            {q.type === "multiple_choice" && (
              <div className="space-y-3 pt-2">
                {(q.content.options ?? []).map((opt: any, optIdx: number) => {
                  const isSelected = answers[q.id] === opt.id;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...

                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setAnswer(q.id, opt.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer font-sans ${
                        isSelected
                          ? "bg-[#f0f6ff] border-2 border-[#2f66e9] text-[#2f66e9] shadow-[0_4px_16px_rgba(47,102,233,0.12)]"
                          : "bg-white border-gray-200 hover:border-[#2f66e9]/50 hover:bg-[#f8fbff] text-gray-700"
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-colors ${
                        isSelected ? "bg-[#2f66e9] text-white shadow-sm" : "bg-gray-100 text-gray-600"
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base font-medium flex-1 leading-relaxed">
                        {opt.text}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#2f66e9] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True/False Options */}
            {q.type === "true_false" && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {([true, false] as boolean[]).map((val) => {
                  const isSelected = answers[q.id] === val;
                  return (
                    <button
                      type="button"
                      key={String(val)}
                      onClick={() => setAnswer(q.id, val)}
                      className={`p-6 rounded-2xl border text-center font-bold text-base transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? val
                            ? "bg-green-50 border-2 border-green-600 text-green-700 shadow-sm"
                            : "bg-red-50 border-2 border-red-600 text-red-700 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span>{val ? "Pernyataan Benar" : "Pernyataan Salah"}</span>
                      {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Essay Option */}
            {q.type === "essay" && (
              <div className="pt-2">
                <textarea
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  rows={7}
                  placeholder="Ketik uraian jawaban Anda di sini dengan lengkap dan jelas..."
                  className="w-full bg-[#f8fbff] border border-[#e3ebfa] rounded-2xl p-4 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2f66e9] focus:bg-white transition-all select-text leading-relaxed placeholder:text-gray-400"
                />
                <p className="mt-2 text-xs text-gray-400 text-right">Jawaban esai tersimpan otomatis setiap Anda mengetik.</p>
              </div>
            )}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="card card-padding bg-white border border-[#e3ebfa] shadow-sm rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className={`btn-secondary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 ${
                idx === 0 ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : "bg-[#eef5ff] text-[#2f66e9] hover:bg-[#d8e8ff]"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-semibold text-gray-500 hidden sm:inline-block">
              Nomor <strong className="text-gray-900">{idx + 1}</strong> / {examData.total_questions}
            </span>

            {idx < examData.total_questions - 1 ? (
              <button
                type="button"
                onClick={() => setIdx((i) => i + 1)}
                className="btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="btn-primary bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <span>Periksa & Kumpulkan</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Peta Navigasi Soal (Grid Navigator) */}
        <div className="lg:col-span-1">
          <div className="card card-padding bg-white border border-[#e3ebfa] shadow-sm rounded-3xl p-5 space-y-5 sticky top-24">
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2f66e9]" /> Peta Navigasi Soal
                </h3>
                <span className="text-xs font-extrabold text-[#2f66e9] bg-[#eef5ff] px-2 py-0.5 rounded-md">
                  {Math.round((answeredCount / examData.total_questions) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Klik nomor untuk melompat langsung</p>
            </div>

            {/* Grid Question Map */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {examData.questions.map((sq: any, i: number) => {
                const isAnswered = answers[sq.id] !== undefined && answers[sq.id] !== null && answers[sq.id] !== "";
                const isFlagged = flaggedQuestions.has(sq.id);
                const isCur = idx === i;

                return (
                  <button
                    key={sq.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center border ${
                      isCur
                        ? "ring-2 ring-[#2f66e9] ring-offset-2 border-[#2f66e9] font-extrabold z-10"
                        : ""
                    } ${
                      isFlagged
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                        : isAnswered
                        ? "bg-[#2f66e9] text-white border-[#2f66e9] shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span>{i + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend / Keterangan Warna */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#2f66e9] shrink-0" />
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0" />
                <span>Ragu-ragu ({flaggedQuestions.size})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-300 shrink-0" />
                <span>Belum Dijawab ({examData.total_questions - answeredCount})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <span>Kumpulkan Jawaban</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. FOOTER STATUS BAR */}
      <footer className="h-11 bg-white border-t border-[#e3ebfa] px-4 sm:px-8 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Fullscreen Guard Aktif
          </span>
          <span className="hidden sm:flex items-center gap-1.5 font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Anti-Tab Switch
          </span>
          <span className="hidden md:flex items-center gap-1.5 font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Auto-Save Supabase
          </span>
        </div>
        <div className="font-semibold text-gray-600">
          AruthalaEdu Secure CBT System v2.0
        </div>
      </footer>
    </div>
  );
}
