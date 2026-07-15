import Link from "next/link";
import { BarChart3, ClipboardList, FlagTriangleRight, MonitorPlay, Users2 } from "lucide-react";

const CARDS = [
  { title: "Live Monitoring", desc: "Lihat status siswa, waktu tersisa, dan pelanggaran real-time.", icon: MonitorPlay, href: "/ujian" },
  { title: "Manajemen Ujian", desc: "Buat ujian, atur soal, dan publikasikan paket ujian.", icon: ClipboardList, href: "/ujian/buat" },
  { title: "Bank Soal", desc: "Simpan dan atur soal untuk reuse per kelas atau mapel.", icon: Users2, href: "/bank-soal" },
  { title: "Laporan Kelas", desc: "Ringkasan performa, nilai, dan log pelanggaran kelas.", icon: BarChart3, href: "/reports" },
];

export default function TeacherHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Hub Guru</h1>
          <p className="page-subtitle">Pusat kontrol ujian, monitoring pelanggaran, dan laporan kelas.</p>
        </div>
        <Link href="/ujian/buat" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
          <ClipboardList className="h-4 w-4" /> Buat Ujian
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ujian Aktif", value: "7", detail: "Sedang dipantau real-time" },
          { label: "Siswa Online", value: "238", detail: "Tersebar di 9 kelas" },
          { label: "Pelanggaran Hari Ini", value: "14", detail: "3 perlu tindak lanjut" },
          { label: "Laporan Siap", value: "6", detail: "Menunggu export" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="card card-padding group hover:border-[#d8e6fb] transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{card.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <FlagTriangleRight className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-gray-900">Area monitoring yang nanti nyambung backend</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Live student status",
            "Violation timeline",
            "Remaining time",
            "Offline/online state",
            "Exam health score",
            "Incident report export",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}