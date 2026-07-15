import Link from "next/link";
import { ArrowLeft, ClipboardList, FileDown, PieChart, Timer } from "lucide-react";

const EXAMS = [
  { title: "UTS Matematika Kelas 9A", done: "28/32", avg: 84, status: "Aktif" },
  { title: "Ulangan Harian IPA Bab 4", done: "30/30", avg: 89, status: "Selesai" },
  { title: "UTS Bahasa Indonesia Kelas 7", done: "0/35", avg: 0, status: "Draft" },
];

export default function ExamReportPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Exam Report</h1>
          <p className="page-subtitle">Laporan hasil ujian, distribusi nilai, dan status submit siswa.</p>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ujian Aktif", value: "7" },
          { label: "Average Score", value: "84.2" },
          { label: "Completed", value: "92%" },
          { label: "Export Ready", value: "Yes" },
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
            <PieChart className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Exam summary</h2>
          </div>
          <div className="space-y-3">
            {EXAMS.map((exam) => (
              <div key={exam.title} className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{exam.title}</p>
                    <p className="text-xs text-gray-500">Submit {exam.done}</p>
                  </div>
                  <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-medium text-[#2f66e9]">{exam.status}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                  <ClipboardList className="h-4 w-4" />
                  <span>Rata-rata nilai {exam.avg}</span>
                  <Timer className="h-4 w-4" />
                  <span>Timer / attempt siap backend</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Catatan backend</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Backend dapat mengisi data distribusi nilai, completion rate, dan export file.</p>
            <p>Halaman ini cocok untuk dashboard guru dan admin sekolah.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            Laporan ujian siap dipakai sebagai dasar PDF/Excel export.
          </div>
        </div>
      </div>
    </div>
  );
}