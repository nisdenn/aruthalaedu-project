import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardList, FileText, Users } from "lucide-react";

const TEACHER_METRICS = [
  { label: "Kelas Aktif", value: "9" },
  { label: "Ujian Dipantau", value: "7" },
  { label: "Pelanggaran", value: "14" },
  { label: "Laporan Siap", value: "6" },
];

export default function TeacherReportPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Teacher Report</h1>
            <p className="page-subtitle">Kinerja guru, pengawasan ujian, dan aktivitas kelas dalam satu layar.</p>
          </div>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TEACHER_METRICS.map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Aktivitas kelas</h2>
          </div>
          <div className="space-y-3">
            {[
              "Membuat ujian baru dan jadwal publikasi",
              "Monitoring pelanggaran siswa secara real-time",
              "Merekap hasil ujian per kelas",
              "Menyiapkan laporan eksport untuk admin",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-gray-900">Catatan backend</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Backend bisa menambahkan filter mapel, kelas, dan periode laporan.</p>
            <p>Halaman ini cocok untuk summary operasional guru dan monitoring performa.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            <FileText className="mb-2 h-4 w-4" />
            Siap dipakai untuk export laporan kelas.
          </div>
        </div>
      </div>
    </div>
  );
}