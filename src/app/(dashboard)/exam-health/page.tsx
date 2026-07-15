import Link from "next/link";
import { ArrowLeft, BatteryCharging, Globe, LaptopMinimal, RefreshCcw, ShieldCheck } from "lucide-react";

export default function ExamHealthPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="page-title">Exam Health</h1><p className="page-subtitle">Pemantauan kesehatan ujian: internet, sync, browser, battery, dan device.</p></div><Link href="/teacher-hub" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Hub Guru</Link></div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Internet Quality", value: "Good", tone: "green" },
          { title: "Sync Status", value: "Pending 3", tone: "amber" },
          { title: "Browser Status", value: "Secure", tone: "green" },
          { title: "Device Status", value: "Healthy", tone: "green" },
        ].map((health) => (<div key={health.title} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{health.title}</p><p className={`mt-2 text-3xl font-bold tracking-tight ${health.tone === "green" ? "text-green-600" : "text-amber-600"}`}>{health.value}</p></div>))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Internet Stability", icon: Globe },
              { label: "Sync Queue", icon: RefreshCcw },
              { label: "Battery Warning", icon: BatteryCharging },
              { label: "Browser Status", icon: ShieldCheck },
              { label: "Device Status", icon: LaptopMinimal },
              { label: "Offline Duration", icon: Globe },
            ].map((item) => { const Icon = item.icon; return (<div key={item.label} className="flex items-center gap-3 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div><p className="text-sm font-medium text-gray-700">{item.label}</p></div>); })}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Exam health notes</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>UI ini bisa dipasangi badge status dan indikator warna dari backend health check.</p>
            <p>Backend nanti bisa mengisi data per ujian, per kelas, atau per sekolah.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Ideal untuk dipantau guru selama sesi ujian aktif.</div>
        </div>
      </div>
    </div>
  );
}