import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, Layers3, LineChart, MonitorPlay, Search, ShieldAlert, Sparkles, Users } from "lucide-react";

const ROUTES = [
  { href: "/student-hub", title: "Hub Siswa", desc: "Progress, jadwal, leaderboard, dan quick action siswa.", icon: Users },
  { href: "/teacher-hub", title: "Hub Guru", desc: "Kelola ujian, monitor pelanggaran, dan laporan real-time.", icon: GraduationCap },
  { href: "/parent-hub", title: "Hub Orang Tua", desc: "Progress anak, nilai, jadwal, dan notifikasi read-only.", icon: Users },
  { href: "/admin-hub", title: "Hub Admin", desc: "Manajemen sekolah, user, mata pelajaran, dan tenant.", icon: LayoutDashboard },
  { href: "/exam-gate", title: "Exam Gate", desc: "Rute khusus untuk mode ujian / lock mode aman.", icon: ShieldAlert },
  { href: "/monitoring-center", title: "Monitoring Center", desc: "Satu layar untuk health, sync, dan alert insiden produk.", icon: LineChart },
  { href: "/library-hub", title: "Library / RAG", desc: "Pencarian dokumen, materi, dan knowledge base sekolah.", icon: Search },
  { href: "/leaderboard", title: "Leaderboard", desc: "Ranking langsung berdasarkan skor resmi ujian Supabase.", icon: CalendarDays },
  { href: "/incident-report", title: "Incident Report", desc: "Timeline pelanggaran, integrity score, dan export CSV.", icon: MonitorPlay },
  { href: "/exam-health", title: "Exam Health", desc: "Kualitas internet, sync status, browser, dan device health.", icon: LineChart },
  { href: "/school-health", title: "School Health", desc: "Stability, success rate, sync time, dan benchmark sekolah.", icon: Layers3 },
  { href: "/schedule", title: "Schedule", desc: "Jadwal pelajaran, agenda ujian, dan kalender akademik.", icon: CalendarDays },
];

const FEATURE_GROUPS = [
  {
    title: "Core Platform",
    desc: "Arah UI untuk auth, role, tenant, dan security ber-RLS.",
    items: ["Authentication", "Role Management", "Multi Tenant RLS", "Audit Log", "Notification Center"],
  },
  {
    title: "Exam Module",
    desc: "Semua layar untuk alur ujian dan monitoring realtime.",
    items: ["Create Exam", "Question Bank", "Exam Session", "Live Auto-Refresh", "Auto Grading Result"],
  },
  {
    title: "Academic Module",
    desc: "Kelas, jadwal, materi, dan library sekolah.",
    items: ["Subject Management", "Classroom Realtime", "Schedule", "Academic Year", "Library"],
  },
  {
    title: "Analytics & Reports",
    desc: "UI laporan untuk guru, admin sekolah, dan pengawas.",
    items: ["Student Analytics", "Exam Analytics", "Report Export CSV", "Incident Report", "School Health"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> 100% Supabase Integrated
          </div>
          <div>
            <h1 className="page-title">Fitur & Modul AruthalaEdu</h1>
            <p className="page-subtitle">Pusat navigasi seluruh modul sistem yang kini telah terintegrasi penuh secara reaktif dengan database Supabase, proteksi Multi-Tenant, dan ekspor data asli.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[440px]">
          {[
            { label: "Modul", value: "12+" },
            { label: "Role", value: "3 Aktif" },
            { label: "Route UI", value: "25+" },
            { label: "Status", value: "Live Database" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#cfe0ff] bg-[#f7fbff] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{stat.label}</p>
              <p className="mt-1 text-lg font-bold text-[#2f66e9]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {FEATURE_GROUPS.map((group) => (
          <div key={group.title} className="card card-padding space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-500">{group.desc}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm font-semibold text-gray-800 flex items-center justify-between">
                  <span>{item}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ROUTES.map((route) => {
          const Icon = route.icon;
          return (
            <Link key={route.href} href={route.href} className="card card-padding group flex items-start gap-4 hover:border-[#2f66e9] hover:shadow-[0_22px_50px_rgba(47,102,233,0.12)] transition-all">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9] group-hover:bg-[#2f66e9] group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2f66e9] transition-colors">{route.title}</h3>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#2f66e9]" />
                </div>
                <p className="text-sm leading-6 text-gray-500">{route.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Daftar Modul Tersinkronisasi</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Student Hub: progress sejati & ranking live",
              "Teacher Hub: monitoring ujian & pelanggaran otomatis",
              "Parent Hub: progres anak, nilai rekap, & notifikasi",
              "Admin Hub: manajemen user, kelas, mapel, dan RLS",
              "Library Hub & RAG: dokumen dan placeholder semantik",
              "Leaderboard: ranking dari tabel exam_sessions",
              "Incident Report: timeline dan ekspor pelanggaran .csv",
              "Exam Health: stabilitas sesi ujian ber-sekolah_id",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm leading-6 font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Status Backend</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Seluruh antarmuka di atas telah di-bind langsung dengan Supabase Client dan diproteksi RLS.</p>
            <p>Perlakuan isolasi data antar sekolah dijamin melalui pemeriksaan useUserRole() pada setiap request.</p>
          </div>
          <Link href="/overview" className="btn-primary inline-flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold">
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>
    </div>
  );
}