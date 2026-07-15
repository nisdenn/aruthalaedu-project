import Link from "next/link";
import { ArrowLeft, BellRing, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

const NOTIFICATIONS = [
  { title: "3 ujian belum dipublikasikan", desc: "Draft ujian menunggu jadwal rilis.", time: "5 menit lalu", icon: ShieldAlert, tone: "amber" },
  { title: "Import siswa selesai", desc: "Data siswa terbaru masuk ke kelas 9A dan 9B.", time: "20 menit lalu", icon: CheckCircle2, tone: "green" },
  { title: "Laporan kelas siap export", desc: "Teacher report untuk minggu ini bisa diproses.", time: "1 jam lalu", icon: BellRing, tone: "blue" },
  { title: "Sync ujian tertunda", desc: "2 jawaban menunggu sinkronisasi saat online kembali.", time: "2 jam lalu", icon: Clock3, tone: "amber" },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Notifikasi</h1>
          <p className="page-subtitle">Aktivitas terbaru sekolah, ujian, dan sinkronisasi sistem.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Unread", value: "4" },
          { label: "Today", value: "8" },
          { label: "System", value: "2" },
          { label: "Academic", value: "6" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card card-padding space-y-3">
        {NOTIFICATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone === "green" ? "bg-green-50 text-green-600" : item.tone === "blue" ? "bg-[#eef5ff] text-[#2f66e9]" : "bg-amber-50 text-amber-600"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}