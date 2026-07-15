"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, School, Users, Search, Filter, BadgeCheck, MoveRight, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { Kelas } from "@/types";

interface ClassWithCount extends Kelas {
  studentCount?: number;
  waliName?: string;
}

export default function ClassManagementPage() {
  const { user } = useUserRole();
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTingkat, setNewTingkat] = useState<number>(9);
  const [newYear, setNewYear] = useState("2025/2026");
  const [newWali, setNewWali] = useState("");
  const [saving, setSaving] = useState(false);
  const [totalStudentsAll, setTotalStudentsAll] = useState(0);

  async function loadClasses() {
    setLoading(true);
    try {
      const supabase = createClient();
      let kelasQuery = supabase.from("kelas").select("*").order("name", { ascending: true });
      if (user?.sekolah_id) {
        kelasQuery = kelasQuery.eq("sekolah_id", user.sekolah_id);
      }
      const { data: kelasData, error } = await kelasQuery;
      if (error) throw error;

      // Ambil profile untuk menghitung siswa per kelas & cari nama wali
      let profilesQuery = supabase.from("profiles").select("id, full_name, role, kelas_id");
      if (user?.sekolah_id) {
        profilesQuery = profilesQuery.eq("sekolah_id", user.sekolah_id);
      }
      const { data: profilesData } = await profilesQuery;

      const siswaList = profilesData?.filter(p => p.role === "SISWA") || [];
      setTotalStudentsAll(siswaList.length);

      const waliMap = new Map(profilesData?.filter(p => p.role === "GURU" || p.role === "SUPER_ADMIN").map(p => [p.id, p.full_name]) || []);

      const enhanced: ClassWithCount[] = (kelasData || []).map(k => {
        const count = siswaList.filter(s => s.kelas_id === k.id).length;
        const wali = k.wali_kelas_id ? waliMap.get(k.wali_kelas_id) || "Wali Terdaftar" : "Belum Ditentukan";
        return {
          ...k,
          studentCount: count,
          waliName: wali,
        };
      });

      setClasses(enhanced);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, [user?.sekolah_id]);

  const activeClassesCount = classes.filter(c => c.is_active !== false).length;
  const waliKelasCount = new Set(classes.map(c => c.wali_kelas_id).filter(Boolean)).size;

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.tahun_ajaran.includes(search) ||
    c.waliName?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const randomId = "cls-" + Math.random().toString(36).substring(2, 10);
      const payload: Partial<Kelas> = {
        id: randomId,
        sekolah_id: user?.sekolah_id || "default-tenant",
        yayasan_id: "default-yayasan",
        name: newName.trim(),
        tingkat: Number(newTingkat),
        tahun_ajaran: newYear.trim(),
        is_active: true,
      };
      const { error } = await supabase.from("kelas").insert([payload]);
      if (error) {
        alert("Gagal membuat kelas: " + error.message);
      } else {
        setShowAddModal(false);
        setNewName("");
        loadClasses();
      }
    } catch (err) {
      console.error("Error adding class:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteClass(id: string) {
    if (!confirm("Yakin ingin menghapus kelas ini?")) return;
    try {
      const supabase = createClient();
      await supabase.from("kelas").delete().eq("id", id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error delete class:", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="page-title">Class Management</h1>
            <p className="page-subtitle">Kelola kelas, wali kelas, dan pembagian siswa per tahun ajaran real-time.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1 text-green-700 font-medium">Supabase Connected</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Active year 2025/2026</span>
            <span className="rounded-full border border-[#e3ebfa] bg-white/70 px-3 py-1">Homeroom mapping</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Kelas</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Kelas", value: loading ? "..." : classes.length.toString() },
          { label: "Kelas Aktif", value: loading ? "..." : activeClassesCount.toString() },
          { label: "Wali Kelas Ditugaskan", value: loading ? "..." : waliKelasCount.toString() },
          { label: "Total Murid Terdata", value: loading ? "..." : totalStudentsAll.toString() },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Daftar Kelas Sekolah</h2>
            <p className="text-sm text-gray-500">Pantau kapasitas dan alokasi wali kelas yang tersambung langsung ke database.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#e3ebfa] bg-white px-3 py-2 text-sm text-gray-700 w-full sm:w-64">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama kelas atau tahun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Memuat daftar kelas dari Supabase...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">Belum ada kelas yang terdaftar atau sesuai pencarian. Klik &quot;Tambah Kelas&quot; di atas.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredClasses.map((classItem) => {
              const capacity = Math.min(100, Math.round(((classItem.studentCount || 0) / 36) * 100));
              return (
                <div key={classItem.id} className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 space-y-4 flex flex-col justify-between hover:border-[#cbdffc] transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><School className="h-5 w-5" /></div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">Kelas {classItem.name}</h3>
                          <p className="text-sm text-gray-500 truncate max-w-[150px]">Wali: {classItem.waliName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 inline-flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" /> Aktif
                        </span>
                        <button onClick={() => deleteClass(classItem.id)} title="Hapus Kelas" className="p-1 rounded-lg text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Kapasitas Rombel</span>
                        <span>{classItem.studentCount || 0}/36 siswa</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef5ff]">
                        <div className="h-2 rounded-full bg-[#2f66e9]" style={{ width: `${capacity}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Jumlah Siswa</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{classItem.studentCount || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Tahun Ajaran</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{classItem.tahun_ajaran}</p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/user-management?class=${classItem.id}`} className="mt-2 flex items-center justify-between rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] px-4 py-3 text-sm text-[#2f66e9] hover:bg-[#eaf3ff] transition-colors">
                    <span>Lihat siswa kelas ini</span>
                    <MoveRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e3ebfa] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Tambah Kelas Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nama / Rombel Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 9A atau XII IPA 1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tingkat</label>
                  <select
                    value={newTingkat}
                    onChange={(e) => setNewTingkat(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                  >
                    {[7, 8, 9, 10, 11, 12].map(t => (
                      <option key={t} value={t}>Kelas {t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2">
                  {saving ? "Menyimpan..." : "Buat Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}