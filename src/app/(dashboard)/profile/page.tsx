"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BellRing, School, ShieldCheck, UserRound, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

export default function ProfilePage() {
  const { user } = useUserRole();
  const identity = useDashboardIdentity();
  const [fullName, setFullName] = useState("");
  const [nisn, setNisn] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setFullName(data.full_name || "");
          setNisn(data.nisn || "");
        } else {
          setFullName(user.full_name || identity.fullName || "");
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user?.id, user?.full_name, identity.fullName]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        nisn: nisn.trim() || null,
      }).eq("id", user.id);

      if (error) throw error;
      setMsg("Profil Anda berhasil diperbarui di database Supabase!");
    } catch (err: any) {
      alert("Gagal memperbarui profil: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Profil Pengguna</h1>
            <p className="page-subtitle">Informasi identitas akun, role otorisasi, dan keanggotaan tenant sekolah.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nama Lengkap", value: loading ? "..." : fullName || user?.full_name || identity.fullName || "Pengguna" },
          { label: "Role Akses", value: user?.role || identity.roleLabel || "GUEST" },
          { label: "Nama Sekolah", value: identity.sekolahName || "SMA Negeri 1 Aruthala" },
          { label: "Status Akun", value: "Verified Active" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 tracking-tight truncate">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Perbarui Data Pribadi</h2>
          {msg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
              />
            </div>
            {user?.role === "SISWA" && (
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">NISN / Nomor Induk Siswa Nasional</label>
                <input
                  type="text"
                  placeholder="Contoh: 0091234567"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">ID Pengguna (Sistem UUID)</label>
              <input
                type="text"
                disabled
                value={user?.id || ""}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] bg-gray-50 text-xs text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving || loading} className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </button>
            </div>
          </form>
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">Keamanan & Otorisasi</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Akun Anda diamankan dengan autentikasi berbasis JWT yang dikelola langsung oleh Supabase Auth & Security.</p>
            <p>Setiap perubahan pada nama atau identitas akan langsung berdampak pada halaman ujian dan sertifikat pencapaian Anda.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Kredensial Terenkripsi 256-Bit.</span>
          </div>
        </div>
      </div>
    </div>
  );
}