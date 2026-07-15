import Link from "next/link";
import { CalendarDays, Medal, NotebookPen, TrendingUp, UserRound } from "lucide-react";

const QUICK_ACTIONS = [
  { title: "Mulai Ujian", desc: "Masuk ke ruang ujian aktif dan lanjutkan sesi.", href: "/ujian", icon: NotebookPen, tone: "blue" },
  { title: "Lihat Jadwal", desc: "Cek pelajaran hari ini, tugas, dan agenda.", href: "/academic", icon: CalendarDays, tone: "green" },
  { title: "Leaderboard", desc: "Pantau ranking dan achievement siswa.", href: "/leaderboard", icon: Medal, tone: "amber" },
  { title: "Profil Belajar", desc: "Ringkasan progres, streak, dan statistik.", href: "/overview", icon: TrendingUp, tone: "purple" },
];

export default function StudentHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Hub Siswa</h1>
            <p className="page-subtitle">Satu tempat untuk progress, jadwal, leaderboard, dan aksi cepat siswa.</p>
          </div>
        </div>
        <Link href="/ujian" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
          <NotebookPen className="h-4 w-4" /> Masuk Ujian
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Progress Belajar", value: "72%", detail: "+8% dari minggu lalu" },
          { label: "Tugas Aktif", value: "5", detail: "2 mendekati deadline" },
          { label: "Peringkat Kelas", value: "#4", detail: "Naik 2 peringkat" },
          { label: "Streak Belajar", value: "11 hari", detail: "Mode konsisten aktif" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="card card-padding group hover:border-[#d8e6fb] transition-all">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.tone === "blue" ? "bg-blue-50 text-blue-600" : action.tone === "green" ? "bg-green-50 text-green-600" : action.tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{action.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{action.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}