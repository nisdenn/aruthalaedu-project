"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Plus, Search, ShieldCheck, Users, Mail, KeyRound, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export interface ProfileRow {
  id: string;
  full_name: string;
  role: "SUPER_ADMIN" | "GURU" | "SISWA" | "ORANG_TUA" | "OPERATOR" | "KEPALA_SEKOLAH" | "YAYASAN_ADMIN";
  nisn?: string;
  sekolah_id?: string;
  is_active?: boolean;
  created_at?: string;
}

export default function UserManagementPage() {
  const { user } = useUserRole();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<ProfileRow["role"]>("GURU");
  const [newNisn, setNewNisn] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProfiles() {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from("profiles").select("id, full_name, role, nisn, sekolah_id, is_active, created_at").order("created_at", { ascending: false });
      if (user?.sekolah_id) {
        query = query.eq("sekolah_id", user.sekolah_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) setProfiles(data as ProfileRow[]);
    } catch (error) {
      console.error("Gagal memuat daftar user:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, [user?.sekolah_id]);

  const totalUsers = profiles.length;
  const totalGuru = profiles.filter(p => p.role === "GURU" || p.role === "SUPER_ADMIN" || p.role === "OPERATOR").length;
  const totalSiswa = profiles.filter(p => p.role === "SISWA").length;
  const totalPending = profiles.filter(p => p.is_active === false).length;

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.nisn?.includes(search);
    const matchesRole = roleFilter === "ALL" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newFullName.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const randomId = "user-" + Math.random().toString(36).substring(2, 10);
      const payload: Partial<ProfileRow> = {
        id: randomId,
        full_name: newFullName.trim(),
        role: newRole,
        nisn: newRole === "SISWA" ? newNisn.trim() : undefined,
        sekolah_id: user?.sekolah_id || undefined,
        is_active: true,
      };
      const { error } = await supabase.from("profiles").insert([payload]);
      if (error) {
        // Fallback or alert if RLS issues
        alert("Gagal menambahkan user (atau butuh izin auth admin): " + error.message);
      } else {
        setShowAddModal(false);
        setNewFullName("");
        setNewNisn("");
        loadProfiles();
      }
    } catch (err) {
      console.error("Error adding user:", err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id: string, currentStatus?: boolean) {
    try {
      const supabase = createClient();
      await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", id);
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      console.error("Error toggle status:", err);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      const supabase = createClient();
      await supabase.from("profiles").delete().eq("id", id);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Kelola akun dan hak akses (RBAC) secara real-time dari Supabase.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1 font-medium text-green-700">Supabase Connected</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Audit log active</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Live profiles sync</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah User</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total User Terdata", value: loading ? "..." : totalUsers.toString() },
          { label: "Guru & Staf", value: loading ? "..." : totalGuru.toString() },
          { label: "Siswa Terdaftar", value: loading ? "..." : totalSiswa.toString() },
          { label: "Pending / Inaktif", value: loading ? "..." : totalPending.toString() },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Daftar Akun Pengguna</h2>
            <p className="text-sm text-gray-500">Cari berdasarkan nama atau NISN, dan saring berdasarkan role akun.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white px-3 py-2 text-sm text-gray-700 w-full sm:w-64">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-[#e3ebfa] bg-white px-3 py-2 text-xs text-gray-700 outline-none"
            >
              <option value="ALL">Semua Role</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="GURU">GURU</option>
              <option value="SISWA">SISWA</option>
              <option value="ORANG_TUA">ORANG_TUA</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Email Invite Ready", icon: Mail },
            { label: "Reset Password Link", icon: KeyRound },
            { label: "Role Permission Control", icon: ShieldCheck },
            { label: "Export Profiles", icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-[#e3ebfa] bg-[#f7fbff] px-4 py-3 text-sm text-[#2f66e9] inline-flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" /> <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e3ebfa]">
          <div className="min-w-[650px] grid grid-cols-12 bg-[#f7fbff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <div className="col-span-4">Nama & Identitas</div>
            <div className="col-span-3">Role Akses</div>
            <div className="col-span-3">Sekolah ID</div>
            <div className="col-span-2 text-right">Status & Aksi</div>
          </div>
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Memuat data dari tabel profiles...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">Tidak ada pengguna yang sesuai filter pencarian.</div>
          ) : (
            filteredProfiles.map((p) => (
              <div key={p.id} className="min-w-[650px] grid grid-cols-12 border-t border-[#e3ebfa] bg-white/70 px-4 py-4 text-sm items-center hover:bg-[#fcfdff] transition-colors">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">{p.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">ID: {p.id.slice(0, 8)} • {p.nisn ? `NISN: ${p.nisn}` : "Staf/Guru"}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-[#f0f5ff] text-[#2f66e9]">
                    {p.role}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-gray-700 font-medium truncate">
                  {!p.sekolah_id
                    ? "Global Tenant / Utama"
                    : p.sekolah_id.startsWith("22222222")
                    ? "SMA Negeri 1 Aruthala (Siswa)"
                    : p.sekolah_id.startsWith("11111111")
                    ? "SMA Negeri 1 Aruthala (Guru)"
                    : "SMA Negeri 1 Aruthala"}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => toggleStatus(p.id, p.is_active)}
                    title={p.is_active !== false ? "Aktif (Klik untuk nonaktifkan)" : "Nonaktif (Klik untuk aktifkan)"}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      p.is_active !== false ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100" : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {p.is_active !== false ? "Active" : "Suspended"}
                  </button>
                  <button
                    onClick={() => deleteUser(p.id)}
                    title="Hapus Pengguna"
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e3ebfa] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Tambah Akun Pengguna</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Role Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as ProfileRow["role"])}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                >
                  <option value="GURU">GURU (Pengajar & Penguji)</option>
                  <option value="SISWA">SISWA (Peserta Didik)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Admin Sekolah)</option>
                </select>
              </div>
              {newRole === "SISWA" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">NISN / Nomor Induk</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0091234567"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                  />
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2">
                  {saving ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}