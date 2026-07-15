import Link from "next/link";
import { ArrowLeft, Download, FileDown, FileSpreadsheet, FileText } from "lucide-react";

export default function ReportExportPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Report Export</h1>
          <p className="page-subtitle">Preview ekspor laporan PDF / Excel sebelum backend diproses.</p>
        </div>
        <Link href="/reports" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Laporan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "PDF Export", desc: "Ringkasan resmi untuk admin/guru.", icon: FileText },
          { label: "Excel Export", desc: "Tabel data yang siap dianalisis.", icon: FileSpreadsheet },
          { label: "Quick Download", desc: "Akses cepat untuk file yang sering dipakai.", icon: Download },
          { label: "Batch Export", desc: "Export banyak laporan sekaligus.", icon: FileDown },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{item.label}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Preview export panel</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Student report PDF",
              "Teacher report PDF",
              "Exam report PDF",
              "Class export Excel",
              "Attendance export",
              "Incident timeline export",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Catatan backend</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Nanti backend bisa memproses export via jsPDF / exceljs atau server function.</p>
            <p>UI ini sudah siap untuk tombol download dan progress state.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            Gunakan halaman ini sebagai entry point ekspor laporan.
          </div>
        </div>
      </div>
    </div>
  );
}