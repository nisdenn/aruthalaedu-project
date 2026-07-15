import Link from "next/link";
import { ArrowLeft, Plus, School, Users, Search, Filter, BadgeCheck, MoveRight } from "lucide-react";

const CLASSES = [
  { name: "9A", wali: "Siti Rahma", total: 32, year: "2025/2026" },
  { name: "9B", wali: "Asep Hidayat", total: 30, year: "2025/2026" },
  { name: "8A", wali: "Rina Wulandari", total: 31, year: "2025/2026" },
  { name: "7A", wali: "Dedi Pratama", total: 34, year: "2025/2026" },
];

export default function ClassManagementPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="page-title">Class Management</h1>
            <p className="page-subtitle">Kelola kelas, wali kelas, dan pembagian siswa per tahun ajaran.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Active year 2025/2026</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Bulk import ready</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Homeroom mapping</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Kelas</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Kelas", value: "42" },
          { label: "Kelas Aktif", value: "41" },
          { label: "Wali Kelas", value: "24" },
          { label: "Murid Terdata", value: "1.032" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Class overview</h2>
            <p className="text-sm text-gray-500">Cari kelas, filter status, dan lihat kapasitas sebelum backend terhubung.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-500">
              <Search className="h-4 w-4" /> Cari kelas
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-500">
              <Filter className="h-4 w-4" /> Filter wali / tahun
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CLASSES.map((classItem) => {
            const capacity = Math.min(100, Math.round((classItem.total / 36) * 100));
            return (
              <div key={classItem.name} className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><School className="h-5 w-5" /></div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Kelas {classItem.name}</h3>
                      <p className="text-sm text-gray-500">Wali: {classItem.wali}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 inline-flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" /> Aktif
                  </span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Kapasitas</span>
                    <span>{classItem.total}/36 siswa</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef5ff]">
                    <div className="h-2 rounded-full bg-[#2f66e9]" style={{ width: `${capacity}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Jumlah siswa</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{classItem.total}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Tahun ajaran</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{classItem.year}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] px-4 py-3 text-sm text-[#2f66e9]">
                  <span>Lihat roster dan pindahkan siswa</span>
                  <MoveRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#2f66e9]" />
          <h2 className="text-base font-semibold text-gray-900">Admin actions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Bulk import siswa ke kelas",
            "Pindahkan wali kelas antar rombel",
            "Sinkronkan tahun ajaran aktif",
            "Lock perubahan setelah semester berjalan",
            "Export roster kelas",
            "Mapping kelas ke jadwal ujian",
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