import Link from "next/link";
import { ArrowLeft, BarChart3, Building2, Gauge, TrendingUp } from "lucide-react";

export default function SchoolHealthPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="page-title">School Health Analytics</h1><p className="page-subtitle">Analitik stabilitas internet, success rate ujian, sync time, dan benchmark sekolah.</p></div><Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Hub Admin</Link></div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Internet Stability", value: "96.8%", icon: Building2 },
          { title: "Exam Success Rate", value: "98.2%", icon: Gauge },
          { title: "Average Sync Time", value: "3.4s", icon: TrendingUp },
          { title: "School Benchmark", value: "A", icon: BarChart3 },
        ].map((item) => { const Icon = item.icon; return (<div key={item.title} className="card card-padding"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm text-gray-500 font-medium">{item.title}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>); })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Overview analytics</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Trend internet", "Success rate per kelas", "Average violation", "Device statistics", "School trend", "Benchmark report",
            ].map((item) => (<div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">{item}</div>))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Focus backend berikutnya</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Halaman ini cocok sebagai dashboard manajemen untuk yayasan atau admin sekolah.</p>
            <p>Backend nanti bisa menambahkan filter tenant, rentang tanggal, dan export report.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Cocok untuk laporan agregat dan benchmarking multi sekolah.</div>
        </div>
      </div>
    </div>
  );
}