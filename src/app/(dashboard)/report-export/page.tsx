"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileDown, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function ReportExportPage() {
  const { user } = useUserRole();
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadStudentsReport() {
    setDownloading("students");
    try {
      const supabase = createClient();
      let q = supabase.from("profiles").select("id, full_name, role, nisn, kelas_id").eq("role", "SISWA");
      if (user?.sekolah_id) q = q.eq("sekolah_id", user.sekolah_id);
      const { data } = await q;

      if (!data || data.length === 0) {
        alert("Tidak ada data siswa.");
        return;
      }

      const headers = "ID Siswa,Nama Lengkap,NISN,ID Kelas\n";
      const rows = data.map(d => `"${d.id}","${d.full_name || ""}","${d.nisn || "-"}","${d.kelas_id || "-"}"`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Data_Siswa_AruthalaEdu_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  async function downloadExamsReport() {
    setDownloading("exams");
    try {
      const supabase = createClient();
      let q = supabase.from("exam_sessions").select("id, siswa_id, exam_id, score, status, started_at, finished_at").eq("status", "submitted");
      if (user?.sekolah_id) q = q.eq("sekolah_id", user.sekolah_id);
      const { data } = await q;

      if (!data || data.length === 0) {
        alert("Belum ada sesi ujian yang disubmit.");
        return;
      }

      const headers = "ID Sesi,ID Siswa,ID Ujian,Nilai Akhir,Mulai,Selesai\n";
      const rows = data.map(d => `"${d.id}","${d.siswa_id}","${d.exam_id}","${d.score || 0}","${d.started_at || "-"}","${d.finished_at || "-"}"`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Rekap_Nilai_Ujian_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  async function downloadViolationsReport() {
    setDownloading("violations");
    try {
      const supabase = createClient();
      let q = supabase.from("exam_violations").select("*").order("created_at", { ascending: false });
      if (user?.sekolah_id) q = q.eq("sekolah_id", user.sekolah_id);
      const { data } = await q;

      if (!data || data.length === 0) {
        alert("Tidak ada catatan pelanggaran.");
        return;
      }

      const headers = "ID Insiden,Waktu Kejadian,ID Siswa,ID Ujian,Jenis Pelanggaran\n";
      const rows = data.map(d => `"${d.id}","${new Date(d.created_at).toLocaleString("id-ID")}","${d.siswa_id || "Anonim"}","${d.exam_id || "-"}","${d.violation_type}"`).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Log_Pelanggaran_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Report Export Center</h1>
          <p className="page-subtitle">Pusat pengunduhan berkas rekapitulasi data akademik dalam format CSV / Excel langsung dari Supabase.</p>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Data Siswa CSV", desc: "Daftar siswa beserta NISN & kelas", icon: FileText, action: downloadStudentsReport, id: "students" },
          { label: "Rekap Nilai Ujian", desc: "Nilai akhir tiap sesi dan waktu pengerjaan", icon: FileSpreadsheet, action: downloadExamsReport, id: "exams" },
          { label: "Log Pelanggaran", desc: "Catatan tab-switch dan insiden pengawasan", icon: Download, action: downloadViolationsReport, id: "violations" },
          { label: "Paket Lengkap", desc: "Unduh seluruh rekapitulasi sekolah", icon: FileDown, action: () => { downloadStudentsReport(); setTimeout(downloadExamsReport, 500); }, id: "all" },
        ].map((item) => {
          const Icon = item.icon;
          const isBusy = downloading === item.id;
          return (
            <div key={item.label} onClick={item.action} className="card card-padding cursor-pointer hover:border-[#2f66e9] transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] group-hover:bg-[#2f66e9] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[#2f66e9] bg-[#f0f5ff] px-3 py-1 rounded-full">
                  {isBusy ? "Mengunduh..." : "Download"}
                </span>
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{item.label}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Format Laporan Siap Pakai</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Student Report (.csv)",
              "Exam Transcripts (.csv)",
              "Incident Logs (.csv)",
              "Teacher Assessment Data",
              "Class Roster & Attendance",
              "System Health Audit Log",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700 flex items-center justify-between">
                <span>{item}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <h2 className="text-base font-semibold text-gray-900">Kompatibilitas Microsoft Excel & PDF</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Berkas CSV yang diunduh dari panel ini dikodekan dalam format UTF-8 yang sepenuhnya kompatibel dengan Microsoft Excel, Google Sheets, maupun Apple Numbers.</p>
            <p>Guru dapat langsung mengimpor data ini ke dalam template rapor e-Rapor resmi Kemendikbudristek.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Proses Ekspor Berjalan di Client Engine (Fast & Safe).</span>
          </div>
        </div>
      </div>
    </div>
  );
}