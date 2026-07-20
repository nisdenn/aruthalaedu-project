"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ClipboardCheck, Download, Filter, UserCheck, XCircle } from "lucide-react";

type AttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa" | "Libur";

interface AttendanceRow {
  no: number;
  date: Date;
  status: AttendanceStatus;
  datang: string;
  pulang: string;
}

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  Hadir: "bg-green-50 text-green-700 border-green-200",
  Izin: "bg-blue-50 text-blue-700 border-blue-200",
  Sakit: "bg-amber-50 text-amber-700 border-amber-200",
  Alpa: "bg-red-50 text-red-700 border-red-200",
  Libur: "bg-gray-50 text-gray-500 border-gray-200",
};

const MONTH_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getAttendanceRows(month: number, year: number): AttendanceRow[] {
  const totalDays = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const status: AttendanceStatus = isWeekend
      ? "Libur"
      : index % 13 === 0
        ? "Sakit"
        : index % 11 === 0
          ? "Izin"
          : index % 17 === 0
            ? "Alpa"
            : "Hadir";

    return {
      no: index + 1,
      date,
      status,
      datang: status === "Hadir" ? (index % 5 === 0 ? "07:18" : "07:05") : "-",
      pulang: status === "Hadir" ? "14:30" : "-",
    };
  });
}

export default function DataAbsenPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const rows = useMemo(() => getAttendanceRows(month, year), [month, year]);
  const schoolDays = rows.filter((row) => row.status !== "Libur").length;
  const hadir = rows.filter((row) => row.status === "Hadir").length;
  const izin = rows.filter((row) => row.status === "Izin").length;
  const sakit = rows.filter((row) => row.status === "Sakit").length;
  const alpa = rows.filter((row) => row.status === "Alpa").length;
  const attendanceRate = schoolDays > 0 ? Math.round((hadir / schoolDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Data Absen</h1>
            <p className="page-subtitle">Rekap kehadiran siswa per bulan, termasuk status datang dan pulang.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Persentase Hadir", value: `${attendanceRate}%`, detail: `${hadir} dari ${schoolDays} hari efektif`, icon: UserCheck },
          { label: "Hadir", value: hadir.toString(), detail: "Datang dan pulang tercatat", icon: CheckCircle2 },
          { label: "Izin / Sakit", value: (izin + sakit).toString(), detail: `${izin} izin, ${sakit} sakit`, icon: Clock3 },
          { label: "Alpa", value: alpa.toString(), detail: "Tanpa keterangan", icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card card-padding">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{item.value}</p>
                  <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#2f66e9]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Absensi Siswa</h2>
              <p className="text-xs text-gray-500">Tampilan bulanan mengikuti contoh tabel absen yang diberikan.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-[#edf3ff]/75 px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="bg-transparent text-sm font-semibold text-gray-700 outline-none"
                aria-label="Pilih bulan"
              >
                {MONTH_OPTIONS.map((label, index) => (
                  <option key={label} value={index}>{label}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value) || now.getFullYear())}
              className="w-28 rounded-2xl border border-[#e3ebfa] bg-[#edf3ff]/75 px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#6c97fa] focus:bg-white focus:ring-4 focus:ring-[#5485f1]/10"
              aria-label="Tahun absen"
            />
            <button type="button" className="btn-secondary py-2">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">No</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Datang</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Pulang</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const isWeekend = row.status === "Libur";
                return (
                  <tr key={row.no} className={`transition-colors hover:bg-[#f8fbff] ${isWeekend ? "bg-gray-50/50" : "bg-white/20"}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-500">{row.no}</td>
                    <td className={`px-5 py-3 text-sm font-semibold ${isWeekend ? "text-rose-500" : "text-gray-800"}`}>
                      {row.date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.datang}</td>
                    <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.pulang}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {row.status === "Hadir" ? "Tercatat otomatis" : row.status === "Libur" ? "Akhir pekan" : "Menunggu lampiran admin"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
