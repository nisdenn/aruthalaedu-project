"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, BellRing, HeartPulse, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ViolationItem {
  id: string;
  violation_type: string;
  created_at: string;
  siswa_id?: string;
  exam_id?: string;
}

export default function MonitoringCenterPage() {
  const { user } = useUserRole();
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [activeSessionsCount, setActiveSessionsCount] = useState<number>(0);
  const [lockedSessions, setLockedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonitorData() {
      setLoading(true);
      try {
        const supabase = createClient();
        
        let vQuery = supabase.from("exam_violations").select("*").order("created_at", { ascending: false }).limit(10);
        if (user?.sekolah_id) vQuery = vQuery.eq("sekolah_id", user.sekolah_id);
        const { data: vData } = await vQuery;
        if (vData) setViolations(vData as ViolationItem[]);

        let sQuery = supabase.from("exam_sessions").select("id").eq("status", "in_progress");
        if (user?.sekolah_id) sQuery = sQuery.eq("sekolah_id", user.sekolah_id);
        const { data: sData } = await sQuery;
        setActiveSessionsCount(sData?.length || 0);

        let lockQuery = supabase.from('exam_sessions').select('id, siswa_id, exam_id, violation_count, created_at, profiles(full_name)').eq('is_proctor_locked', true).eq('status', 'in_progress');
        if (user?.sekolah_id) lockQuery = lockQuery.eq('sekolah_id', user.sekolah_id);
        const { data: lockData } = await lockQuery;
        if (lockData) setLockedSessions(lockData);
      } catch (err) {
        console.error("Gagal memuat monitoring center:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMonitorData();
    const interval = setInterval(loadMonitorData, 15000); // refresh tiap 15s
    return () => clearInterval(interval);
  }, [user?.sekolah_id]);

  const openIncidents = violations.length;

  const unlockSession = async (sessionId: string) => {
    const supabase = createClient();
    await supabase.from('exam_sessions').update({ is_proctor_locked: false }).eq('id', sessionId);
    setLockedSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Monitoring Center</h1>
            <p className="page-subtitle">Satu layar pemantauan status kesehatan sistem, sesi ujian aktif, dan deteksi pelanggaran real-time.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Sesi Ujian Live", value: loading ? "..." : activeSessionsCount.toString(), detail: "Sedang mengerjakan online" },
          { title: "Total Insiden / Pelanggaran", value: loading ? "..." : openIncidents.toString(), detail: "Tercatat di sistem pengawas" },
          { title: "Konektivitas Database", value: "99.9%", detail: "Supabase Real-time Ready" },
          { title: "Status Pengamanan", value: openIncidents > 5 ? "Waspada" : "Aman", detail: "Anti-Cheat Active" },
        ].map((metric) => (
          <div key={metric.title} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{metric.title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{metric.value}</p>
            <p className="mt-1 text-xs text-gray-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-base font-semibold text-gray-900">Live Incident & Pelanggaran Ujian</h2>
            </div>
            <span className="text-xs text-gray-400">Auto-refresh tiap 15 detik</span>
          </div>

          {!loading && lockedSessions.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Lock className="w-4 h-4 text-red-500" /> Sesi Terkunci (Menunggu Pengawas)
              </h3>
              {lockedSessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-red-900">{session.profiles?.full_name || "Siswa Tidak Diketahui"}</p>
                    <p className="text-xs text-red-700/80 mt-1">Pelanggaran: {session.violation_count} kali</p>
                  </div>
                  <button 
                    onClick={() => unlockSession(session.id)}
                    className="btn-primary py-2 px-4 text-xs shrink-0 self-start sm:self-auto rounded-xl"
                  >
                    Buka Kunci Sesi
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat log dari tabel exam_violations...</div>
          ) : violations.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa] flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span>Tidak ada insiden atau pelanggaran ujian yang terdeteksi. Sistem berjalan kondusif.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <div key={v.id} className="rounded-2xl border border-red-100 bg-red-50/40 p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Pelanggaran Terdeteksi: {v.violation_type}</p>
                      <p className="text-xs text-red-700/80 mt-0.5">
                        ID Siswa: {v.siswa_id || "Anonim"} • Waktu: {new Date(v.created_at).toLocaleTimeString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                    LOGGED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Protokol Keamanan Ujian</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>1. Sistem secara otomatis mencatat perpindahan tab, keluar dari jendela ujian fullscreen, maupun percobaan klik kanan/copy-paste.</p>
            <p>2. Jika pelanggaran melebihi batas toleransi yang diatur pengawas, sesi ujian siswa dapat dikunci otomatis.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] flex items-center gap-2 font-semibold">
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Terhubung ke live monitor websocket/polling Supabase.</span>
          </div>
        </div>
      </div>
    </div>
  );
}