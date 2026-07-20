"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, AlertTriangle, Clock, Users, CheckCircle, XCircle, ShieldAlert, WifiOff, Activity, TimerReset, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatSeconds } from "@/lib/utils";
import { createSafeClient } from "@/lib/supabase/client";

interface MonitorSession {
  id: string;
  siswa: string;
  nisn: string;
  status: string;
  progress: number;
  total: number;
  time_remaining: number;
  violations: number;
  is_flagged: boolean;
  is_proctor_locked: boolean;
  score?: number;
}

interface ViolationEvent {
  id: string;
  sessionId: string;
  type: string;
  occurredAt: string;
}

const STATUS_CARD: Record<string, { border: string; bg: string; dot: string }> = {
  not_started: { border: "var(--border)", bg: "transparent", dot: "var(--t3)" },
  in_progress: { border: "rgba(88,101,242,0.3)", bg: "var(--accent-dim)", dot: "var(--accent)" },
  submitted: { border: "rgba(16,185,129,0.25)", bg: "var(--green-dim)", dot: "var(--green)" },
};

const VIOLATION_LABELS: Record<string, string> = {
  fullscreen_exit: "Fullscreen keluar",
  tab_blur: "Pindah tab",
  copy_paste: "Copy/paste",
  keyboard_shortcut: "Shortcut keyboard",
  right_click: "Klik kanan",
  screen_share: "Screen share",
};

export default function MonitorClient({ examId }: { examId: string }) {
  const [sessions, setSessions] = useState<MonitorSession[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [recentViolations, setRecentViolations] = useState<ViolationEvent[]>([]);
  const [realtimeAvailable, setRealtimeAvailable] = useState(false);
  const [examName, setExamName] = useState("Memuat...");
  const [examStartAt, setExamStartAt] = useState<string | null>(null);
  const [examEndAt, setExamEndAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const submitted = useMemo(() => sessions.filter((s) => s.status === "submitted").length, [sessions]);
  const inProgress = useMemo(() => sessions.filter((s) => s.status === "in_progress").length, [sessions]);
  const notStarted = useMemo(() => sessions.filter((s) => s.status === "not_started").length, [sessions]);
  const flagged = useMemo(() => sessions.filter((s) => s.is_flagged).length, [sessions]);

  // Initial Fetch
  useEffect(() => {
    async function fetchData() {
      const supabase = createSafeClient();
      if (!supabase) return;

      const { data: examData } = await supabase.from('exams').select('title, start_at, end_at').eq('id', examId).single();
      if (examData) {
        setExamName(examData.title);
        setExamStartAt(examData.start_at);
        setExamEndAt(examData.end_at);
      }

      const { count: totalQ } = await supabase.from('exam_questions').select('*', { count: 'exact', head: true }).eq('exam_id', examId);
      const total = totalQ || 0;

      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          status,
          time_remaining,
          violation_count,
          is_flagged,
          is_proctor_locked,
          profiles(full_name, nisn)
        `)
        .eq('exam_id', examId);
      
      if (sessionData) {
        // Fetch all answers for these sessions to calculate progress
        const sessionIds = sessionData.map(s => s.id);
        let answersData: any[] = [];
        if (sessionIds.length > 0) {
          const { data } = await supabase
            .from('exam_answers')
            .select('session_id')
            .in('session_id', sessionIds);
          answersData = data || [];
        }
          
        const answerCounts = (answersData || []).reduce((acc: any, curr: any) => {
          acc[curr.session_id] = (acc[curr.session_id] || 0) + 1;
          return acc;
        }, {});

        const formattedSessions: MonitorSession[] = sessionData.map((s: any) => ({
          id: s.id,
          siswa: s.profiles?.full_name || "Siswa Tidak Diketahui",
          nisn: s.profiles?.nisn || "-",
          status: s.status,
          progress: answerCounts[s.id] || 0,
          total: total,
          time_remaining: s.time_remaining || 0,
          violations: s.violation_count || 0,
          is_flagged: s.is_flagged || false,
          is_proctor_locked: s.is_proctor_locked || false,
        }));
        
        setSessions(formattedSessions);
      }
      setLoading(false);
    }
    fetchData();
  }, [examId]);

  // Timer for time_remaining and elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((_) => {
        if (!examStartAt) return 0;
        const startMs = new Date(examStartAt).getTime();
        const diff = Math.floor((Date.now() - startMs) / 1000);
        return diff > 0 ? diff : 0;
      });
      
      setSessions((prev) => prev.map((session) =>
        session.status === "in_progress"
          ? { ...session, time_remaining: Math.max(0, session.time_remaining - 1) }
          : session
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, [examStartAt]);

  // Realtime Subscriptions
  useEffect(() => {
    const supabase = createSafeClient();
    if (!supabase) return;

    // Listen to exam_violations
    const violationChannel = supabase
      .channel(`exam-violations-${examId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "exam_violations" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (!row || (row.exam_id && row.exam_id !== examId)) return;

          const sessionId = row.session_id ?? `session-${Date.now()}`;
          const violationType = row.violation_type ?? "pelanggaran";
          const eventId = row.id ?? `${sessionId}-${Date.now()}`;

          setRecentViolations((prev) => [
            {
              id: eventId,
              sessionId,
              type: violationType,
              occurredAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            },
            ...prev,
          ].slice(0, 5));

          setSessions((current) => {
            const existing = current.find((session) => session.id === sessionId);
            if (existing) {
              return current.map((session) =>
                session.id === sessionId
                  ? {
                    ...session,
                    violations: session.violations + 1,
                    is_flagged: true,
                  }
                  : session
              );
            }

            return [
              {
                id: sessionId,
                siswa: `Siswa ${sessionId.slice(-4)}`,
                nisn: "-",
                status: "in_progress",
                progress: 0,
                total: 20,
                time_remaining: 0,
                violations: 1,
                is_flagged: true,
                is_proctor_locked: false,
              },
              ...current,
            ];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeAvailable(true);
        }
      });

    // Listen to exam_sessions (for status updates like submitted)
    const sessionChannel = supabase
      .channel(`exam-sessions-${examId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "exam_sessions", filter: `exam_id=eq.${examId}` },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (!row) return;

          setSessions((current) => {
            return current.map((session) =>
              session.id === row.id
                ? {
                    ...session,
                    status: row.status,
                    time_remaining: row.time_remaining !== null ? row.time_remaining : session.time_remaining,
                    violations: row.violation_count !== null ? row.violation_count : session.violations,
                    is_flagged: row.is_flagged !== null ? row.is_flagged : session.is_flagged,
                    is_proctor_locked: row.is_proctor_locked !== null ? row.is_proctor_locked : session.is_proctor_locked,
                  }
                : session
            );
          });
        }
      )
      .subscribe();

    // Listen to exam_answers (for progress updates)
    const answersChannel = supabase
      .channel(`exam-answers-${examId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "exam_answers" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (!row || !row.session_id) return;
          setSessions((current) => {
            return current.map((session) =>
              session.id === row.session_id
                ? { ...session, progress: session.progress + 1 }
                : session
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(violationChannel);
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [examId]);

  const isEnded = examEndAt ? new Date(examEndAt).getTime() < Date.now() : false;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ujian" style={{ color: "var(--t2)", border: "1px solid var(--border)", padding: "8px", borderRadius: 8, display: "flex" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700 }}>Live Monitor</h1>
            <p style={{ fontSize: 13, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{examName} · {sessions.length} siswa · Exam ID {examId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEnded ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              <XCircle size={16} /> BERAKHIR
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: "var(--green-dim)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.25)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "blink 2s infinite" }} />
              LIVE · {formatSeconds(elapsed)} berlalu
            </span>
          )}
          <span style={{ fontSize: 12, color: realtimeAvailable ? "#6EE7B7" : "var(--t2)", padding: "0 10px" }}>
            {realtimeAvailable ? "Realtime aktif" : "Realtime tidak tersedia"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Mengerjakan", val: inProgress, icon: Clock, color: "var(--accent)", bg: "var(--accent-dim)" },
          { label: "Selesai", val: submitted, icon: CheckCircle, color: "var(--green)", bg: "var(--green-dim)" },
          { label: "Belum Mulai", val: notStarted, icon: XCircle, color: "var(--t3)", bg: "rgba(255,255,255,0.04)" },
          { label: "Pelanggaran", val: flagged, icon: AlertTriangle, color: "var(--amber)", bg: "var(--amber-dim)" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 28, fontWeight: 800, color }}>{loading ? "-" : val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl p-4 lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Status Ringkas</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>Semua sesi, status, dan risk score di satu panel</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--border-a)" }}>
              <PlayCircle size={13} /> Monitoring aktif
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { title: "Realtime stream", value: realtimeAvailable ? "Connected" : "Connecting", icon: Activity },
              { title: "Waktu berjalan", value: formatSeconds(elapsed), icon: TimerReset },
              { title: "Risk flagged", value: String(flagged), icon: ShieldAlert },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: 12, color: "var(--t2)" }}>{item.title}</span>
                    <Icon size={14} color={realtimeAvailable ? "var(--green)" : "var(--t3)"} />
                  </div>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800 }}>{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Kondisi Koneksi</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>Siswa yang perlu perhatian</div>
            </div>
            <WifiOff size={14} color="var(--amber)" />
          </div>
          <div className="space-y-3">
            {sessions.filter((session) => session.is_flagged || session.violations > 0).slice(0, 4).map((session) => (
              <div key={session.id} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{session.siswa}</span>
                  <span style={{ fontSize: 11, color: session.is_flagged ? "var(--amber)" : "var(--t2)" }}>
                    {session.violations} pelanggaran
                  </span>
                </div>
                <div className="text-xs" style={{ color: "var(--t2)" }}>
                  {session.status.replace(/_/g, " ")} · sisa {formatSeconds(session.time_remaining)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Peserta Ujian</span>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Users size={16} /> {sessions.length} siswa
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {['No','Nama Siswa','NISN','Status','Pengerjaan','Sisa Waktu','Pelanggaran','Aksi'].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: "var(--t3)" }}>Memuat data peserta...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: "var(--t3)" }}>Belum ada siswa yang mulai ujian.</td></tr>
            ) : sessions.map((r, i) => {
              const isFlagged = r.is_flagged;
              const card = STATUS_CARD[r.status] ?? STATUS_CARD.not_started;
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: isFlagged ? "rgba(245,158,11,0.04)" : card.bg }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--t3)" }}>{i + 1}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.siswa}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)", fontFamily: "monospace" }}>{r.nisn}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs" style={{ border: `1px solid ${r.is_proctor_locked ? "rgba(239,68,68,0.3)" : card.border}`, color: r.is_proctor_locked ? "#EF4444" : isFlagged ? "var(--amber)" : "var(--t2)", background: r.is_proctor_locked ? "rgba(239,68,68,0.08)" : "transparent" }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.is_proctor_locked ? "#EF4444" : card.dot }} />
                      {r.is_proctor_locked ? "Terkunci (Kecurangan)" : r.status === "in_progress" ? "Mengerjakan" : r.status === "submitted" ? "Selesai" : "Belum Mulai"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)" }}>{r.progress}/{r.total}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)", fontVariantNumeric: "tabular-nums" }}>
                    {r.status === "submitted" ? "00:00" : formatSeconds(r.time_remaining)}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: r.violations > 0 ? "var(--amber)" : "var(--t2)", fontWeight: r.violations > 0 ? 600 : 400 }}>
                    {r.violations}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/ujian/${examId}/hasil?session=${r.id}`} style={{ fontSize: 12, color: "var(--accent)" }}>Detail</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl p-4 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>Pelanggaran Terbaru</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>Streaming dari Supabase Realtime</div>
          </div>
        </div>

        {recentViolations.length === 0 ? (
          <div style={{ color: "var(--t2)", fontSize: 13 }}>Menunggu pelanggaran baru...</div>
        ) : (
          <div className="space-y-3">
            {recentViolations.map((item) => (
              <div key={item.id} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{VIOLATION_LABELS[item.type] ?? item.type.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{item.occurredAt}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)" }}>
                  Sesi <span style={{ fontFamily: "monospace" }}>{item.sessionId.slice(-6)}</span> tercatat melakukan pelanggaran.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
