import Link from "next/link";
import { ArrowRight, BarChart3, ArrowLeft, ClipboardList, FileDown, FileText, GraduationCap, Users } from "lucide-react";

const REPORT_ROUTES = [
  { href: "/student-report", title: "Student Report", desc: "Ringkasan nilai, progress, dan catatan siswa.", icon: Users },
  { href: "/teacher-report", title: "Teacher Report", desc: "Kinerja guru, pengawasan, dan aktivitas kelas.", icon: GraduationCap },
  { href: "/exam-report", title: "Exam Report", desc: "Laporan hasil ujian, distribusi nilai, dan status submit.", icon: ClipboardList },
  { href: "/report-export", title: "Report Export", desc: "Preview ekspor PDF / Excel untuk guru dan admin.", icon: FileDown },
];

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
            <p className="page-subtitle">Pusat laporan nilai, kehadiran, aktivitas, dan ekspor untuk backend nanti.</p>
          </div>
        </div>

        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start md:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Reports", value: "4", detail: "Modul detail siap ditautkan" },
          { label: "Export", value: "PDF/Excel", detail: "Siap untuk preview" },
          { label: "Scope", value: "Guru/Admin", detail: "Role-aware" },
          { label: "Status", value: "Frontend first", detail: "Backend nanti tinggal tempel" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_ROUTES.map((route) => {
          const Icon = route.icon;
          return (
            <Link key={route.href} href={route.href} className="card card-padding group hover:border-[#d8e6fb] hover:shadow-[0_22px_50px_rgba(57,111,190,0.12)] transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{route.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{route.desc}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#2f66e9]">
                Buka laporan <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-gray-900">Apa yang bisa backend sambungkan</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Student report per kelas",
            "Teacher report per mapel",
            "Exam report per sesi ujian",
            "PDF / Excel export",
            "Filter tenant dan role",
            "Tanggal / periode laporan",
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