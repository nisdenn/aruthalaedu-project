"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarRange, CheckCircle2, Plus } from "lucide-react";

interface AcademicYearItem {
  year: string;
  status: "Active" | "Archived" | "Planned";
  semester: string;
  active: boolean;
}

export default function AcademicYearPage() {
  const [years, setYears] = useState<AcademicYearItem[]>([
    { year: "2024/2025", status: "Archived", semester: "Genap & Ganjil (Selesai)", active: false },
    { year: "2025/2026", status: "Active", semester: "Semester 2 (Berjalan)", active: true },
    { year: "2026/2027", status: "Planned", semester: "Rencana Mendatang", active: false },
  ]);

  const activeYear = years.find(y => y.active)?.year || "2025/2026";

  function handleAddYear() {
    const input = prompt("Masukkan Tahun Ajaran baru (Contoh: 2027/2028):", "2027/2028");
    if (!input) return;
    setYears(prev => [
      ...prev,
      { year: input, status: "Planned", semester: "2 Semester", active: false }
    ]);
  }

  function handleSetActive(targetYear: string) {
    setYears(prev => prev.map(y => {
      if (y.year === targetYear) return { ...y, status: "Active", active: true };
      return { ...y, status: y.active ? "Archived" : y.status, active: false };
    }));
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Manajemen Tahun Ajaran</h1>
          <p className="page-subtitle">Kelola siklus tahun akademik, pengaktifan semester, dan arsip riwayat kelas sekolah.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/academic" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Akademik
          </Link>
          <button onClick={handleAddYear} className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Tahun Ajaran
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tahun Ajaran Aktif", value: activeYear },
          { label: "Semester Berjalan", value: "Genap (2)" },
          { label: "Akses Input Nilai", value: "Terbuka (Open)" },
          { label: "Total Arsip Siklus", value: `${years.length} Periode` },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-[#2f66e9]" />
          <h2 className="text-base font-semibold text-gray-900">Kronologi & Status Tahun Ajaran</h2>
        </div>
        <div className="space-y-3">
          {years.map((item) => (
            <div key={item.year} className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all ${
              item.active ? "border-[#cfe0ff] bg-[#f7fbff]" : "border-[#e3ebfa] bg-white/70 hover:border-gray-300"
            }`}>
              <div>
                <p className="text-sm font-bold text-gray-900">{item.year}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.semester}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.active ? (
                  <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aktif Sekarang
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActive(item.year)}
                    className="px-3 py-1 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 hover:bg-[#eef5ff] hover:text-[#2f66e9] hover:border-[#2f66e9] font-semibold transition-colors"
                  >
                    Jadikan Aktif
                  </button>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.active ? "bg-[#eef5ff] text-[#2f66e9]" : "bg-gray-100 text-gray-500"
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Penguncian data nilai dan rapor diselaraskan otomatis dengan status Tahun Ajaran Aktif.</span>
        </div>
      </div>
    </div>
  );
}