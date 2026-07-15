import Link from "next/link";
import { Activity, ArrowLeft, BellRing, HeartPulse, RotateCcw } from "lucide-react";

export default function MonitoringCenterPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Monitoring Center</h1>
          <p className="page-subtitle">Satu layar untuk health dashboard, sync status, dan alert produk.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Internet Stability", value: "99.2%" },
          { title: "Average Sync Time", value: "3.4s" },
          { title: "Health Score", value: "A-" },
          { title: "Open Incidents", value: "1" },
        ].map((metric) => (
          <div key={metric.title} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{metric.title}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{metric.value}</p></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#2f66e9]" /><h2 className="text-base font-semibold text-gray-900">Signal panel</h2></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Uptime API", "Sync Queue", "Battery Warning", "Browser Status", "Device Status", "Offline Duration",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-red-500" /><h2 className="text-base font-semibold text-gray-900">Alert channel</h2></div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Di fase berikutnya, halaman ini bisa ditautkan ke alert Discord dan Telegram.</p>
            <p>Layout ini sengaja dibuat siap untuk badge status, banner incident, dan timeline event.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]"><RotateCcw className="mb-2 h-4 w-4" /> Gunakan route ini sebagai basis health dashboard internal.</div>
        </div>
      </div>
    </div>
  );
}