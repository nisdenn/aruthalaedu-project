import Link from "next/link";
import { ArrowLeft, CalendarRange, CheckCircle2, Plus } from "lucide-react";

const YEARS = [
  { year: "2024/2025", status: "Archived", semester: "2 semester", active: false },
  { year: "2025/2026", status: "Active", semester: "2 semester", active: true },
  { year: "2026/2027", status: "Planned", semester: "2 semester", active: false },
];

export default function AcademicYearPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Academic Year</h1>
          <p className="page-subtitle">Kelola tahun ajaran, semester, dan status aktif sekolah.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Tahun Ajaran</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tahun Aktif", value: "2025/2026" },
          { label: "Semester", value: "2" },
          { label: "Entry Data", value: "Open" },
          { label: "Archived", value: "2" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-[#2f66e9]" />
          <h2 className="text-base font-semibold text-gray-900">Timeline tahun ajaran</h2>
        </div>
        <div className="space-y-3">
          {YEARS.map((item) => (
            <div key={item.year} className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 ${item.active ? "border-[#cfe0ff] bg-[#f7fbff]" : "border-[#e3ebfa] bg-white/70"}`}>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.year}</p>
                <p className="text-xs text-gray-500">{item.semester}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.active && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.active ? "bg-[#eef5ff] text-[#2f66e9]" : "bg-gray-50 text-gray-500"}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
          Backend nanti bisa mengunci data aktif berdasarkan tahun ajaran yang dipilih.
        </div>
      </div>
    </div>
  );
}