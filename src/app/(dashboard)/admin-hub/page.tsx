import Link from "next/link";
import { Building2, Settings2, ShieldCheck, Users } from "lucide-react";

export default function AdminHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Hub Admin</h1>
          <p className="page-subtitle">Manajemen sekolah, user, kelas, dan konfigurasi tenant.</p>
        </div>
        <Link href="/settings" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto"><Settings2 className="h-4 w-4" /> Buka Pengaturan</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sekolah Aktif", value: "3" },
          { label: "Total User", value: "1.248" },
          { label: "Kelas Terdaftar", value: "42" },
          { label: "Tenant Health", value: "Normal" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "School Management", desc: "Konfigurasi sekolah, tenant, dan branding.", icon: Building2 },
          { title: "User Management", desc: "CRUD guru, siswa, admin, dan role akses.", icon: Users },
          { title: "Security & RLS", desc: "Kontrol keamanan, audit log, dan policy.", icon: ShieldCheck },
          { title: "System Config", desc: "Theme, fitur aktif, dan preferensi sistem.", icon: Settings2 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/user-management", title: "User Management", desc: "CRUD akun guru, siswa, admin, dan orang tua." },
          { href: "/class-management", title: "Class Management", desc: "Kelola kelas, wali kelas, dan pembagian siswa." },
          { href: "/subject-management", title: "Subject Management", desc: "Atur mata pelajaran, kode, dan struktur mapel." },
          { href: "/academic-year", title: "Academic Year", desc: "Semester, tahun ajaran, dan status aktif." },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card card-padding group hover:border-[#d8e6fb] hover:shadow-[0_22px_50px_rgba(57,111,190,0.12)] transition-all">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f66e9]">Admin CRUD</p>
            <h2 className="mt-3 text-base font-semibold text-gray-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{item.desc}</p>
            <p className="mt-4 text-sm font-medium text-[#2f66e9]">Buka halaman →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}