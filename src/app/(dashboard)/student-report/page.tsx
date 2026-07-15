import Link from "next/link";
import { ArrowLeft, BadgeCheck, BookOpen, GraduationCap, TrendingUp, UserRound } from "lucide-react";

const SUBJECTS = [
  { name: "Matematika", score: 88, status: "A" },
  { name: "IPA", score: 82, status: "B+" },
  { name: "Bahasa Indonesia", score: 90, status: "A" },
  { name: "Bahasa Inggris", score: 84, status: "B+" },
];

export default function StudentReportPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Student Report</h1>
            <p className="page-subtitle">Ringkasan nilai, progress, dan catatan siswa untuk backend nanti.</p>
          </div>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nilai Rata-rata", value: "86.0" },
          { label: "Progress Materi", value: "78%" },
          { label: "Tugas Selesai", value: "14/16" },
          { label: "Rank Kelas", value: "#4" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Mata pelajaran</h2>
          </div>
          <div className="space-y-3">
            {SUBJECTS.map((subject) => (
              <div key={subject.name} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500">Status nilai {subject.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{subject.score}</p>
                  <p className="text-xs text-gray-400">Skor ujian</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Catatan backend</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Backend bisa mengisi data progress, catatan guru, dan target belajar per siswa.</p>
            <p>UI ini cocok untuk dashboard siswa dan parent portal yang read-only.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            <GraduationCap className="mb-2 h-4 w-4" />
            Siap untuk integrasi grafik progress dan statistik belajar.
          </div>
        </div>
      </div>
    </div>
  );
}