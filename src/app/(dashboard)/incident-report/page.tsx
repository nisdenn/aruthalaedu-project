"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, ShieldAlert, SquareActivity, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ViolationRecord {
  id: string;
  violation_type: string;
  created_at: string;
  siswa_id?: string;
  exam_id?: string;
}

export default function IncidentReportPage() {
  const { user } = useUserRole();
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadViolations() {
      setLoading(true);
      try {
        const supabase = createClient();
        let vQuery = supabase.from("exam_violations").select("*").order("created_at", { ascending: false });
        if (user?.sekolah_id) vQuery = vQuery.eq("sekolah_id", user.sekolah_id);
        const { data } = await vQuery;
        if (data) setViolations(data as ViolationRecord[]);
      } catch (err) {
        console.error("Gagal memuat incident report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadViolations();
  }, [user?.sekolah_id]);

  const totalIncidents = violations.length;
  const criticalCount = violations.filter(v => v.violation_type?.toLowerCase().includes("fullscreen") || v.violation_type?.toLowerCase().includes("keluar")).length;
  const warningCount = totalIncidents - criticalCount;
  const integrityScore = totalIncidents === 0 ? 100 : Math.max(50, 100 - (criticalCount * 5 + warningCount * 2));

  function exportCSV() {
    if (violations.length === 0) {
      alert("Belum ada data insiden untuk diekspor.");
      return;
    }
    const headers = "ID Insiden,Waktu Kejadian,ID Siswa,ID Ujian,Tipe Pelanggaran\n";
    const rows = violations.map(v => 
      `"${v.id}","${new Date(v.created_at).toLocaleString("id-ID")}","${v.siswa_id || "Anonim"}","${v.exam_id || "-"}","${v.violation_type}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Insiden_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Incident Report & Audit Log</h1>
          <p className="page-subtitle">Timeline pelanggaran ujian siswa, kalkulasi integrity score, dan ekspor transkrip investigasi.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/monitoring-center" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Monitoring
          </Link>
          <button onClick={exportCSV} className="btn-primary inline-flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Ekspor CSV/Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Integrity Score Sekolah", value: `${integrityScore}/100`, icon: ShieldAlert, tone: integrityScore >= 85 ? "green" : "amber" },
          { label: "Peringatan Ringan (Warning)", value: loading ? "..." : warningCount.toString(), icon: SquareActivity, tone: "amber" },
          { label: "Pelanggaran Kritis (Critical)", value: loading ? "..." : criticalCount.toString(), icon: Activity, tone: "red" },
          { label: "Dukungan Investigasi", value: "Audit Siap", icon: FileDown, tone: "green" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card card-padding">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                item.tone === "amber" ? "bg-amber-50 text-amber-600" : item.tone === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Kronologi / Timeline Pelanggaran Real-time</h2>
            <span className="text-xs text-gray-400">Tercatat permanen oleh pengawas</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat kronologi insiden dari tabel exam_violations...</div>
          ) : violations.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa] flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span>Tidak ada catatan insiden kecurangan yang terjadi di lingkungan sekolah.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((item) => {
                const isCritical = item.violation_type?.toLowerCase().includes("fullscreen") || item.violation_type?.toLowerCase().includes("keluar");
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 hover:border-[#cbdffc] transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isCritical ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.violation_type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Sesi Siswa: #{item.siswa_id?.slice(0, 8).toUpperCase() || "ANONIM"} • Ref Ujian: #{item.exam_id?.slice(0, 8).toUpperCase() || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isCritical ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {isCritical ? "CRITICAL" : "WARNING"}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">{new Date(item.created_at).toLocaleTimeString("id-ID")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <h2 className="text-base font-semibold text-gray-900">Tentang Integrity Score</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Integrity score merupakan indikator kejujuran kolektif siswa saat menempuh asesmen digital di AruthalaEdu.</p>
            <p>Skor 100 menunjukkan tidak adanya insiden perpindahan tab atau kecurangan selama ujian berlangsung.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Transkrip Investigasi Sah</span>
            </div>
            <p className="text-gray-600 leading-relaxed">Ekspor CSV di atas dapat dilampirkan dalam rapat evaluasi komite etik sekolah.</p>
          </div>
        </div>
      </div>
    </div>
  );
}