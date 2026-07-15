import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Tag } from "lucide-react";

const SUBJECTS = [
  { name: "Matematika", code: "MTK", scope: "SMP", classes: 9 },
  { name: "Bahasa Indonesia", code: "BIN", scope: "SMP", classes: 9 },
  { name: "IPA", code: "IPA", scope: "SMP", classes: 9 },
  { name: "Bahasa Inggris", code: "BIG", scope: "SMP", classes: 9 },
];

export default function SubjectManagementPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-subtitle">Atur mata pelajaran, kode mapel, dan cakupan kelas/jenjang.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Mapel</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Mapel", value: "24" },
          { label: "SMP", value: "12" },
          { label: "SMA", value: "8" },
          { label: "SD", value: "4" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {SUBJECTS.map((subject) => (
          <div key={subject.code} className="card card-padding space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{subject.name}</h2>
                  <p className="text-sm text-gray-500">Kode mapel: {subject.code}</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">{subject.scope}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Kelas aktif</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{subject.classes}</p>
              </div>
              <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Tag</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{subject.code}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
              <Tag className="mb-2 h-4 w-4" />
              Backend bisa menambahkan kurikulum, urutan prioritas, dan pemetaan ke kelas.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}