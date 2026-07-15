"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, AlertTriangle, CheckCircle, XCircle, BarChart2, FileDown, FileSpreadsheet, ShieldAlert, Trophy } from "lucide-react";
import Link from "next/link";
import { createSafeClient } from "@/lib/supabase/client";

const PASSING = 70;

function formatTime(s: number | null) {
  if (s === null) return "-";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function HasilClient({ examId }: { examId: string }) {
  const [sort, setSort] = useState<"score"|"name"|"time">("score");
  const [results, setResults] = useState<any[]>([]);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createSafeClient();
      if (!supabase) return;

      const { data: examData } = await supabase.from('exams').select('title, duration_minutes').eq('id', examId).single();
      if (examData) setExamInfo(examData);

      // Fetch sessions and profiles
      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          status,
          time_remaining,
          violation_count,
          is_flagged,
          score,
          profiles(full_name, nisn)
        `)
        .eq('exam_id', examId);

      if (sessionData) {
        const formatted = sessionData.map((s: any) => ({
          id: s.id,
          nama: s.profiles?.full_name || "Siswa Tidak Diketahui",
          nisn: s.profiles?.nisn || "-",
          score: s.score !== null && s.score !== undefined ? s.score : null,
          max: 100, // standard out of 100
          time: s.time_remaining !== null && examData ? (examData.duration_minutes * 60) - s.time_remaining : null,
          violations: s.violation_count || 0,
          flagged: s.is_flagged || false,
          status: s.status,
        }));
        setResults(formatted);
      }
      setLoading(false);
    }
    fetchData();
  }, [examId]);

  const sorted = [...results].sort((a, b) => {
    if (sort === "score") return (b.score ?? -1) - (a.score ?? -1);
    if (sort === "name") return a.nama.localeCompare(b.nama);
    if (sort === "time") return (a.time ?? 9999) - (b.time ?? 9999);
    return 0;
  });

  const submitted = results.filter(r => r.status === "submitted");
  const scores = submitted.filter(r => r.score !== null).map(r => r.score as number);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const lulus = scores.filter(s => s >= PASSING).length;
  const flaggedCount = results.filter(r => r.flagged).length;

  const handleExport = async () => {
    if (results.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const exportData = sorted.map((r, i) => ({
        No: i + 1,
        Nama: r.nama,
        NISN: r.nisn,
        Nilai: r.score !== null ? r.score : "Belum dinilai",
        Status: r.status === "submitted" ? "Selesai" : r.status === "in_progress" ? "Mengerjakan" : "Belum Mulai",
        "Sisa Waktu": formatTime(r.time),
        "Pelanggaran (Anti-Cheat)": r.violations,
        "Dicurigai": r.flagged ? "Ya" : "Tidak"
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");
      
      const fileName = `Hasil_Ujian_${examInfo?.title || 'Data'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error(error);
      alert("Gagal mengekspor data ke Excel.");
    }
  };

  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async () => {
    setCalculating(true);
    const supabase = createSafeClient();
    if (!supabase) return;

    // 1. Dapatkan daftar pertanyaan untuk ujian ini
    const { data: eq } = await supabase.from('exam_questions').select('question_id').eq('exam_id', examId);
    if (!eq || eq.length === 0) { setCalculating(false); return; }
    
    const qIds = eq.map((x: any) => x.question_id);
    const { data: qs } = await supabase.from('questions').select('id, type, content').in('id', qIds);
    if (!qs) { setCalculating(false); return; }

    // Peta jawaban benar
    const correctMap: Record<string, string | boolean> = {};
    qs.forEach((q: any) => {
      if (q.type === 'multiple_choice' && q.content?.options) {
        const correctOpt = q.content.options.find((o: any) => o.is_correct);
        if (correctOpt) correctMap[q.id] = correctOpt.id;
      } else if (q.type === 'true_false' && q.content?.correct_answer !== undefined) {
        correctMap[q.id] = q.content.correct_answer;
      }
    });

    const totalQuestions = qs.length;

    // 2. Dapatkan sesi submitted yang score-nya masih null
    const sessionsToGrade = results.filter(r => r.status === "submitted" && r.score === null);
    if (sessionsToGrade.length === 0) {
      alert("Tidak ada sesi ujian baru yang perlu dinilai.");
      setCalculating(false);
      return;
    }

    const sessionIds = sessionsToGrade.map(s => s.id);

    // 3. Ambil jawaban siswa
    const { data: answersData } = await supabase
      .from('exam_answers')
      .select('session_id, question_id, answer_value')
      .in('session_id', sessionIds);

    const answers = answersData || [];

    // 4. Hitung nilai per sesi
    for (const sessionId of sessionIds) {
      const sessionAnswers = answers.filter((a: any) => a.session_id === sessionId);
      let correctCount = 0;

      sessionAnswers.forEach((ans: any) => {
        const correctAns = correctMap[ans.question_id];
        // Pastikan tipe data sama saat membandingkan
        if (correctAns !== undefined && String(ans.answer_value) === String(correctAns)) {
          correctCount++;
        }
      });

      const finalScore = Math.round((correctCount / totalQuestions) * 100);

      // Simpan ke database
      await supabase.from('exam_sessions').update({ score: finalScore }).eq('id', sessionId);
      
      // Update state lokal agar langsung terlihat
      setResults(prev => prev.map(r => r.id === sessionId ? { ...r, score: finalScore } : r));
    }

    setCalculating(false);
    alert(`Berhasil menilai ${sessionsToGrade.length} ujian secara otomatis.`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ujian" style={{ color: "var(--t2)", border: "1px solid var(--border)", padding: 8, borderRadius: 8, display: "flex" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700 }}>Hasil Ujian</h1>
            <p style={{ fontSize: 13, color: "var(--t2)" }}>{examInfo?.title || "Memuat..."} · KKM {PASSING} · Exam ID {examId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCalculate} disabled={calculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background:"var(--accent)",color:"#fff", opacity: calculating ? 0.7 : 1 }}>
            {calculating ? "Menilai..." : "Hitung Nilai Otomatis"}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)" }}>
            <Download size={15} /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)" }}>
            <FileDown size={15} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Rata-rata Nilai", val:loading ? "-" : avg.toFixed(1), color:"var(--accent)", bg:"var(--accent-dim)", icon:BarChart2 },
          { label:"Lulus KKM", val:loading ? "-" : `${lulus}/${submitted.length}`, color:"var(--green)", bg:"var(--green-dim)", icon:CheckCircle },
          { label:"Belum Submit", val:loading ? "-" : `${results.length - submitted.length}`, color:"var(--amber)", bg:"var(--amber-dim)", icon:XCircle },
          { label:"Siswa Dicurigai", val:loading ? "-" : `${flaggedCount}`, color:"var(--red)", bg:"rgba(239,68,68,0.1)", icon:ShieldAlert },
        ].map(({ label,val,color,bg,icon:Icon }) => (
          <div key={label} className="p-4 rounded-xl" style={{ background:"var(--surface)",border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      {/* Distribution Bar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="p-5 rounded-xl lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 600 }}>Distribusi Nilai</h3>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>Bisa dipakai backend untuk analitik hasil ujian</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ border: "1px solid var(--border)", color: "var(--t2)" }}>Exam ID {examId}</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {['<50', '50-59', '60-69', '70-79', '80-89', '90-100'].map((range, i) => {
              const ranges = [[0, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 101]];
              const [lo, hi] = ranges[i];
              const count = scores.filter(s => s >= lo && s < hi).length;
              const pct = scores.length ? (count / scores.length) * 100 : 0;
              const isPass = lo >= PASSING;
              return (
                <div key={range} className="flex flex-col items-center gap-1 flex-1">
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{count}</span>
                  <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 4, height: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", background: isPass ? "var(--green)" : "var(--red)", borderRadius: 4, height: `${Math.max(pct, 3)}%`, transition: "height 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--t3)" }}>{range}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Aksi cepat</h3>
          <div className="space-y-3">
            {[
              { label: "Export Excel", tone: "var(--accent)" },
              { label: "Export PDF", tone: "var(--green)" },
              { label: "Kirim pengumuman", tone: "var(--amber)" },
              { label: "Lock hasil", tone: "var(--red)" },
            ].map((action) => (
              <button key={action.label} className="w-full rounded-2xl px-4 py-3 text-left text-sm" style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: action.tone }}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Detail Nilai</span>
          <div className="flex gap-2 flex-wrap">
            {['score', 'name', 'time'].map(s => (
              <button key={s} onClick={() => setSort(s as typeof sort)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: sort === s ? "var(--accent-dim)" : "transparent", border: `1px solid ${sort === s ? "var(--border-a)" : "var(--border)"}`, color: sort === s ? "#A5ACFF" : "var(--t2)" }}>
                {s === "score" ? "Nilai" : s === "name" ? "Nama" : "Waktu"}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {['No', 'Nama Siswa', 'NISN', 'Nilai', 'Status', 'Waktu', 'Pelanggaran', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: "var(--t3)" }}>Memuat hasil ujian...</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: "var(--t3)" }}>Belum ada hasil ujian.</td></tr>
            ) : sorted.map((r, i) => {
              const isLulus = r.score !== null && r.score >= PASSING;
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: r.flagged ? "rgba(245,158,11,0.04)" : "transparent" }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--t3)" }}>{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {r.flagged && <AlertTriangle size={13} style={{ color: "var(--amber)", flexShrink: 0 }} />}
                      <span style={{ fontWeight: 500 }}>{r.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)", fontFamily: "monospace" }}>{r.nisn}</td>
                  <td className="px-5 py-3.5">
                    {r.score !== null ? (
                      <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15, color: isLulus ? "var(--green)" : "var(--red)" }}>
                        {r.score}
                      </span>
                    ) : <span style={{ color: "var(--t3)" }}>-</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {r.status === "not_started" ? (
                      <span style={{ fontSize:12,color:"var(--t3)" }}>Belum mulai</span>
                    ) : r.status === "in_progress" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:"var(--accent-dim)", color:"var(--accent)" }}>
                        Mengerjakan
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: isLulus ? "var(--green-dim)" : "var(--red-dim,rgba(239,68,68,0.1))", color: isLulus ? "#6EE7B7" : "#FCA5A5" }}>
                        {isLulus ? "Lulus" : "Tidak Lulus"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)" }}>{formatTime(r.time)}</td>
                  <td className="px-5 py-3.5">
                    {r.violations > 0 ? (
                      <span style={{ fontSize: 12, color: r.flagged ? "var(--amber)" : "var(--t2)" }}>{r.violations}×</span>
                    ) : <span style={{ color: "var(--t3)", fontSize: 12 }}>-</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button style={{ fontSize: 12, color: "var(--accent)" }}>Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
