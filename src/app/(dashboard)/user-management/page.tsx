import Link from "next/link";
import { ArrowLeft, Filter, Plus, Search, ShieldCheck, Users, Mail, KeyRound, MoreHorizontal } from "lucide-react";

const USERS = [
  { name: "Dennis Lapianso", role: "SUPER_ADMIN", school: "Yayasan An-Nur", status: "Active" },
  { name: "Siti Rahma", role: "GURU", school: "SMPIT An-Nur", status: "Active" },
  { name: "Aldi Pratama", role: "SISWA", school: "SMPIT An-Nur", status: "Pending" },
  { name: "Maya Putri", role: "ORANG_TUA", school: "SMPIT An-Nur", status: "Active" },
];

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">CRUD akun guru, siswa, admin, dan orang tua.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">RBAC ready</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Audit log ready</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Invite flow placeholder</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah User</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total User", value: "1.248" },
          { label: "Guru", value: "84" },
          { label: "Siswa", value: "1.032" },
          { label: "Pending", value: "16" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">User table</h2>
            <p className="text-sm text-gray-500">Backend nanti bisa sambungkan ke filter role, tenant, dan status akun.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-500"><Search className="h-4 w-4" /> Cari user</div>
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-500"><Filter className="h-4 w-4" /> Filter role</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Email invite", icon: Mail },
            { label: "Reset password", icon: KeyRound },
            { label: "Suspend account", icon: ShieldCheck },
            { label: "More actions", icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-[#e3ebfa] bg-[#f7fbff] px-4 py-3 text-sm text-[#2f66e9] inline-flex items-center gap-2">
                <Icon className="h-4 w-4" /> {item.label}
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e3ebfa]">
          <div className="grid grid-cols-12 bg-[#f7fbff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <div className="col-span-4">Nama</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Sekolah</div>
            <div className="col-span-2">Status</div>
          </div>
          {USERS.map((user) => (
            <div key={user.name} className="grid grid-cols-12 border-t border-[#e3ebfa] bg-white/70 px-4 py-4 text-sm">
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Users className="h-4 w-4" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Edit profile, reset password, dan status login</p>
                </div>
              </div>
              <div className="col-span-3 text-gray-600">{user.role}</div>
              <div className="col-span-3 text-gray-600">{user.school}</div>
              <div className="col-span-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.status === "Active" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            "Siswa bisa di-assign ke kelas",
            "Guru bisa dipetakan ke mapel",
            "Orang tua dibuat read-only",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
          <ShieldCheck className="mb-2 h-4 w-4" />
          UI ini siap untuk backend role-based access control dan audit log.
        </div>
      </div>
    </div>
  );
}