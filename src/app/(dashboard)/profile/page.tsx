import Link from "next/link";
import { ArrowLeft, BadgeCheck, BellRing, School, ShieldCheck, UserRound } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Profil</h1>
            <p className="page-subtitle">Data akun, role, sekolah, dan preferensi pengguna.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nama", value: "Admin Sekolah" },
          { label: "Role", value: "SUPER_ADMIN" },
          { label: "Sekolah", value: "SMPIT An-Nur" },
          { label: "Status", value: "Verified" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Account details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Email login",
              "Password management",
              "Avatar profile",
              "Two-factor auth",
              "Tenant membership",
              "Last login",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Security status</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Backend nanti bisa pakai halaman ini untuk edit profil dan reset password.</p>
            <p>UI juga siap untuk role-specific settings seperti notifikasi dan preferensi sekolah.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            <ShieldCheck className="mb-2 h-4 w-4" />
            Bisa dikembangkan menjadi profile center.
          </div>
          <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 text-sm text-gray-700 inline-flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#2f66e9]" /> Notifikasi dan preferensi akun siap dihubungkan.
          </div>
          <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 text-sm text-gray-700 inline-flex items-center gap-2">
            <School className="h-4 w-4 text-[#2f66e9]" /> Sekolah terikat ke tenant aktif.
          </div>
        </div>
      </div>
    </div>
  );
}