import Link from "next/link";
import { ArrowLeft, FileDown, ShieldAlert, SquareActivity, Activity } from "lucide-react";

export default function IncidentReportPage() {
  const TIMELINE = [
    { time: "08:10", event: "Masuk ujian", status: "normal" },
    { time: "08:24", event: "Tab switch terdeteksi", status: "warning" },
    { time: "08:27", event: "Fullscreen keluar", status: "critical" },
    { time: "08:30", event: "Kembali fullscreen", status: "normal" },
    { time: "08:55", event: "Submit jawaban", status: "normal" },
  ];

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="page-title">Incident Report</h1><p className="page-subtitle">Timeline pelanggaran, integrity score, dan export laporan PDF.</p></div><Link href="/teacher-hub" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Hub Guru</Link></div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Integrity Score", value: "86/100", icon: ShieldAlert, tone: "amber" },
          { label: "Warning", value: "2", icon: SquareActivity, tone: "red" },
          { label: "Critical", value: "1", icon: Activity, tone: "red" },
          { label: "Export Ready", value: "PDF", icon: FileDown, tone: "green" },
        ].map((item) => { const Icon = item.icon; return (<div key={item.label} className="card card-padding"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone === "amber" ? "bg-amber-50 text-amber-600" : item.tone === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>); })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Timeline kejadian</h2>
          <div className="space-y-3">
            {TIMELINE.map((item) => (
              <div key={`${item.time}-${item.event}`} className="flex items-center gap-4 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4"><div className="w-14 shrink-0 text-xs font-semibold text-gray-500">{item.time}</div><div className={`h-2.5 w-2.5 rounded-full ${item.status === "critical" ? "bg-red-500" : item.status === "warning" ? "bg-amber-500" : "bg-green-500"}`} /><p className="flex-1 text-sm text-gray-700">{item.event}</p><span className="rounded-full bg-[#f7fbff] px-3 py-1 text-xs font-medium text-gray-500">{item.status}</span></div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Incident summary</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Halaman ini disiapkan untuk monitoring log pelanggaran per siswa dan per ujian.</p>
            <p>Backend nanti bisa menambahkan sitasi pelanggaran, attachment, dan export PDF.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Gunakan halaman ini untuk laporan insiden yang bisa dibagikan ke guru dan admin.</div>
        </div>
      </div>
    </div>
  );
}