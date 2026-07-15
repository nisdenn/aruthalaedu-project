"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, School, Save, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function SettingsPage() {
  const { user } = useUserRole();
  const [schoolName, setSchoolName] = useState("AruthalaEdu School");
  const [schoolCode, setSchoolCode] = useState("TENANT-01");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadSchoolSettings() {
      if (!user?.sekolah_id) {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase.from("sekolah").select("*").eq("id", user.sekolah_id).single();
        if (data) {
          setSchoolName(data.name || "AruthalaEdu School");
          setSchoolCode(data.code || "TENANT-01");
          setAddress(data.address || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan sekolah:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchoolSettings();
  }, [user?.sekolah_id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.sekolah_id) {
      alert("Izin ditolak atau ID Sekolah tidak ditemukan.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sekolah").update({
        name: schoolName,
        code: schoolCode,
        address: address,
        phone: phone,
      }).eq("id", user.sekolah_id);

      if (error) throw error;
      setMsg("Pengaturan sekolah berhasil disimpan ke Supabase!");
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Pengaturan Sistem Sekolah</h1>
          <p className="page-subtitle">Konfigurasi profil instansi, multi-tenancy, dan preferensi operasional platform.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Nama Sekolah", value: loading ? "..." : schoolName },
          { label: "Kode Tenant", value: loading ? "..." : schoolCode },
          { label: "Environment", value: "Production Cloud" },
          { label: "Mode Keamanan", value: "RBAC Enforced" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 tracking-tight truncate">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card card-padding space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <School className="w-5 h-5 text-[#2f66e9]" /> Profil & Tenant Sekolah
            </h2>
          </div>
          {msg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Kode / ID Tenant</label>
                <input
                  type="text"
                  required
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">No. Telepon / Kontak</label>
                <input
                  type="text"
                  placeholder="021-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                placeholder="Jl. Pendidikan No. 1..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving || !user?.sekolah_id} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan ke Database"}
              </button>
            </div>
          </form>
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <h2 className="text-base font-semibold text-gray-900">Preferensi Keamanan & Multi-Tenancy</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-6">
            <p>1. Setiap sekolah yang menggunakan AruthalaEdu dipisahkan oleh `sekolah_id` secara ketat pada level Row Level Security (RLS) Supabase.</p>
            <p>2. Perubahan pada nama atau kode sekolah akan langsung diperbarui pada header dan surat kop transkrip rapor seluruh siswa.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#eef5ff] p-4 text-xs text-[#2f66e9] flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Hak Akses Admin Sekolah Aktif (`{user?.role}`).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
