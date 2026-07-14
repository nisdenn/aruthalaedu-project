import Link from "next/link";
import { BarChart3, ArrowLeft, FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] shadow-[0_10px_24px_rgba(47,102,233,0.10)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Laporan</h1>
            <p className="page-subtitle">Ringkasan nilai, ujian, dan aktivitas sekolah dalam satu tempat.</p>
          </div>
        </div>

        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start md:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Laporan Nilai", desc: "Ekspor ringkasan nilai per ujian dan per kelas.", value: "Siap diekspor" },
          { title: "Laporan Kehadiran", desc: "Rekap peserta yang hadir, terlambat, atau absen.", value: "Mingguan" },
          { title: "Laporan Aktivitas", desc: "Audit log aksi penting dari guru dan admin.", value: "Real-time" },
        ].map((item) => (
          <div key={item.title} className="card card-padding space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
                <p className="text-xs text-gray-500">{item.value}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}