import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, Mail, School, UserRound } from "lucide-react";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Detail Siswa</h1>
            <p className="page-subtitle">Profil lengkap siswa dan data akademik yang siap backend.</p>
          </div>
        </div>
        <Link href="/data-siswa" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nama", value: "Budi Santoso" },
          { label: "NISN", value: "1234567890" },
          { label: "Kelas", value: "9A" },
          { label: "ID", value: id },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Academic snapshot</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Nilai terbaru",
              "Absensi bulan ini",
              "Progress belajar",
              "Catatan wali kelas",
              "Tugas selesai",
              "Pelanggaran",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Contact & class info</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[#2f66e9]" /> parent@example.com</p>
            <p className="inline-flex items-center gap-2"><School className="h-4 w-4 text-[#2f66e9]" /> SMPIT An-Nur</p>
            <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#2f66e9]" /> Tahun ajaran 2025/2026</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            Halaman ini siap untuk riwayat nilai, absensi, dan profil siswa.
          </div>
        </div>
      </div>
    </div>
  );
}
