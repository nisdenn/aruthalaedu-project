import Link from "next/link";
import { BellRing, CalendarDays, GraduationCap, HeartPulse, UserRound } from "lucide-react";

export default function ParentHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Hub Orang Tua</h1>
            <p className="page-subtitle">Lihat progress anak, nilai, jadwal, dan notifikasi sekolah dalam mode read-only.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">Kembali ke Dashboard</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Progress Anak", value: "78%", desc: "Rata-rata penyelesaian materi minggu ini.", icon: HeartPulse },
          { title: "Nilai Terbaru", value: "85", desc: "Nilai ujian terakhir yang sudah tersedia.", icon: GraduationCap },
          { title: "Jadwal Hari Ini", value: "3 kelas", desc: "Pelajaran dan agenda yang sedang berjalan.", icon: CalendarDays },
          { title: "Notifikasi", value: "2 baru", desc: "Pemberitahuan dari sekolah dan guru.", icon: BellRing },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
              <p className="mt-2 text-xs text-gray-400">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Ringkasan harian</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Attendance status",
              "Tugas yang belum selesai",
              "Waktu belajar di rumah",
              "Catatan guru",
              "Perubahan jadwal",
              "Alert akademik",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Catatan backend</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Halaman ini disiapkan untuk role orang tua sebagai read-only dashboard.</p>
            <p>Nanti backend cukup mengisi child profile, attendance, dan notifikasi sekolah.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Cocok sebagai parent portal ringan tanpa akses edit.</div>
        </div>
      </div>
    </div>
  );
}