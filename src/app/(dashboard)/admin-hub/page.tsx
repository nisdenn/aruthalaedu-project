"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Settings2, ShieldCheck, Users, Megaphone, Send, Trash2, BellRing, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Search } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "alert";
  target_type: "GLOBAL" | "SCHOOL" | "ROLE_SISWA" | "ROLE_GURU" | "PRIVATE";
  target_sekolah_id?: string | null;
  target_user_id?: string | null;
  created_at: string;
  sekolah?: { name: string };
  user?: { full_name: string; email?: string; role?: string };
}

interface SekolahItem {
  id: string;
  name: string;
}

interface ProfileItem {
  id: string;
  full_name: string;
  role: string;
  sekolah_id?: string;
}

const LoadingDots = ({ text = "Memuat" }: { text?: string }) => (
  <div className="input-field-lg bg-gray-50 flex items-center h-[42px] px-3 cursor-not-allowed border border-gray-200 rounded-xl w-full">
    <span className="text-gray-500 text-sm">{text}</span>
    <span className="flex space-x-1 ml-1.5 pt-1">
      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  </div>
);

export default function AdminHubPage() {
  const { sekolahAktif, totalSiswa, totalGuru, totalKelas, loading: statsLoading } = useDashboardStats();
  const totalUser = totalSiswa + totalGuru;

  // Broadcast Console States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [sekolahList, setSekolahList] = useState<SekolahItem[]>([]);
  const [profileList, setProfileList] = useState<ProfileItem[]>([]);
  
  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "alert">("info");
  const [targetType, setTargetType] = useState<"GLOBAL" | "SCHOOL" | "ROLE_SISWA" | "ROLE_GURU" | "PRIVATE">("GLOBAL");
  const [targetSekolahId, setTargetSekolahId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendError, setSendError] = useState("");

  // School Registration States
  const [sekolahName, setSekolahName] = useState("");
  const [sekolahSlug, setSekolahSlug] = useState("");
  const [sekolahAddress, setSekolahAddress] = useState("");
  const [registeringSchool, setRegisteringSchool] = useState(false);
  const [schoolSuccess, setSchoolSuccess] = useState("");
  const [schoolError, setSchoolError] = useState("");

  useEffect(() => {
    async function loadBroadcastData() {
      setLoadingAnnouncements(true);
      const supabase = createClient();
      try {
        // 1. Ambil riwayat pengumuman
        const { data: annData } = await supabase
          .from("system_announcements")
          .select("*, sekolah(name), user:profiles!system_announcements_target_user_id_fkey(full_name, role)")
          .order("created_at", { ascending: false })
          .limit(20);

        if (annData) {
          setAnnouncements(annData as unknown as Announcement[]);
        }

        // 2. Ambil daftar sekolah untuk opsi dropdown target
        const { data: sekData } = await supabase.from("sekolah").select("id, name").order("name");
        if (sekData) setSekolahList(sekData);

        // 3. Ambil daftar user untuk opsi PRIVATE target (maksimal 100 terbaru)
        const { data: profData } = await supabase.from("profiles").select("id, full_name, role, sekolah_id").order("full_name").limit(100);
        if (profData) setProfileList(profData);
      } catch (err) {
        console.error("Gagal memuat data console broadcast:", err);
      } finally {
        setLoadingAnnouncements(false);
      }
    }

    loadBroadcastData();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setSendError("Judul dan isi pesan notifikasi wajib diisi.");
      return;
    }

    setSending(true);
    setSendError("");
    setSendSuccess("");

    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        type,
        target_type: targetType,
        created_by: user?.id || null,
      };

      if (targetType === "SCHOOL" || targetType === "ROLE_SISWA" || targetType === "ROLE_GURU") {
        payload.target_sekolah_id = targetSekolahId || null;
      }

      if (targetType === "PRIVATE") {
        if (!targetUserId) {
          setSendError("Pilih pengguna spesifik untuk target notifikasi pribadi.");
          setSending(false);
          return;
        }
        payload.target_user_id = targetUserId;
      }

      const { data: inserted, error: insErr } = await supabase
        .from("system_announcements")
        .insert([payload])
        .select("*, sekolah(name), user:profiles!system_announcements_target_user_id_fkey(full_name, role)")
        .single();

      if (insErr) {
        throw new Error(insErr.message);
      }

      if (inserted) {
        setAnnouncements((prev) => [inserted as unknown as Announcement, ...prev]);
        setTitle("");
        setContent("");
        setSendSuccess("Notifikasi berhasil dikirimkan ke target sasaran secara real-time!");
      }
    } catch (err: unknown) {
      setSendError((err as Error).message || "Gagal mengirim notifikasi.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini? Pesan akan ditarik dari seluruh layar pengguna.")) return;
    const supabase = createClient();
    try {
      const { error: delErr } = await supabase.from("system_announcements").delete().eq("id", id);
      if (!delErr) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus notifikasi:", err);
    }
  };

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sekolahName.trim() || !sekolahSlug.trim()) {
      setSchoolError("Nama dan slug (kode) sekolah wajib diisi.");
      return;
    }

    setRegisteringSchool(true);
    setSchoolError("");
    setSchoolSuccess("");

    const supabase = createClient();
    try {
      const { data, error } = await supabase.from('sekolah').insert({
        name: sekolahName.trim(),
        slug: sekolahSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      }).select().single();

      if (error) throw error;
      
      setSchoolSuccess(`Berhasil mendaftarkan sekolah: ${data.name}`);
      setSekolahName("");
      setSekolahSlug("");
      setSekolahAddress("");
      
      // Update dropdown list
      setSekolahList(prev => [...prev, { id: data.id, name: data.name }].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      console.error("Gagal mendaftarkan sekolah:", err);
      setSchoolError(err.message || "Gagal mendaftarkan sekolah.");
    } finally {
      setRegisteringSchool(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Admin Hub */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-l-4 border-l-[#2f66e9]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2f66e9] mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Akses Terproteksi Khusus Administrator
          </div>
          <h1 className="page-title">Hub Admin & Pusat Siaran</h1>
          <p className="page-subtitle">Manajemen sekolah, user, kelas, dan console pengiriman notifikasi global/pribadi.</p>
        </div>
        <Link href="/settings" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto shadow-[0_12px_24px_rgba(47,102,233,0.25)]">
          <Settings2 className="h-4 w-4" /> Buka Pengaturan Sekolah
        </Link>
      </div>

      {/* 2. Statistik Cepat */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sekolah Aktif", value: statsLoading ? "..." : sekolahAktif.toString() },
          { label: "Total User Terdaftar", value: statsLoading ? "..." : totalUser.toString() },
          { label: "Kelas Terdaftar", value: statsLoading ? "..." : totalKelas.toString() },
          { label: "Siaran Terkirim", value: loadingAnnouncements ? "..." : announcements.length.toString() },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 3. Console Siaran Notifikasi (Broadcast Console) */}
      <div className="card card-padding space-y-6 border border-[#c6dbff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_20px_60px_rgba(47,102,233,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3ebfa]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f66e9] text-white shadow-[0_10px_20px_rgba(47,102,233,0.3)]">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Console Pengirim Notifikasi Real-Time</h2>
              <p className="text-xs text-gray-500">Kirim pesan siaran global, per sekolah, per role, atau pribadi langsung ke portal pengguna.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Supabase Reactive Broadcast
          </span>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-5">
          {sendSuccess && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-sm font-medium text-green-800 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <span>{sendSuccess}</span>
            </div>
          )}

          {sendError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-800 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-3">
            {/* Kategori Target */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">1. Target Sasaran Siaran</label>
              {loadingAnnouncements ? <LoadingDots text="Memuat Target..." /> : (
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="input-field-lg bg-white"
              >
                <option value="GLOBAL">🌐 GLOBAL - Semua Sekolah & Semua User</option>
                <option value="SCHOOL">🏫 1 SEKOLAH SPESIFIK - Siswa & Guru di Sekolah Terpilih</option>
                <option value="ROLE_SISWA">🎓 KHUSUS SISWA - Seluruh Siswa (Atau di 1 Sekolah)</option>
                <option value="ROLE_GURU">👨‍🏫 KHUSUS GURU & PENGAWAS - Seluruh Guru</option>
                <option value="PRIVATE">🔒 PRIBADI (PRIVATE) - Spesifik ke 1 Akun Pengguna</option>
              </select>
              )}
            </div>

            {/* Pemilihan Sekolah (Jika SCHOOL/ROLE_SISWA/ROLE_GURU) */}
            {(targetType === "SCHOOL" || targetType === "ROLE_SISWA" || targetType === "ROLE_GURU") && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Pilih Sekolah (Opsional / Filter Tenant)</label>
                {loadingAnnouncements ? <LoadingDots text="Memuat Sekolah..." /> : (
                <select
                  value={targetSekolahId}
                  onChange={(e) => setTargetSekolahId(e.target.value)}
                  className="input-field-lg bg-white"
                >
                  <option value="">-- Semua Sekolah (Lintas Tenant) --</option>
                  {sekolahList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                )}
              </div>
            )}

            {/* Pemilihan User Pribadi (Jika PRIVATE) */}
            {targetType === "PRIVATE" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Pilih Akun Penerima Pribadi (Siswa / Guru)</label>
                {loadingAnnouncements ? <LoadingDots text="Memuat Akun..." /> : (
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="input-field-lg bg-white"
                  required
                >
                  <option value="">-- Pilih Nama Pengguna --</option>
                  {profileList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.role}] {p.full_name} {p.sekolah_id ? "" : "(Tanpa Sekolah)"}
                    </option>
                  ))}
                </select>
                )}
              </div>
            )}

            {/* Kategori / Nada Pesan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">2. Kategori / Prioritas Notifikasi</label>
              {loadingAnnouncements ? <LoadingDots text="Memuat Kategori..." /> : (
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="input-field-lg bg-white"
              >
                <option value="info">ℹ️ Informasi Umum (Biru)</option>
                <option value="success">✅ Pengumuman Sukses / Prestasi (Hijau)</option>
                <option value="warning">⚠️ Peringatan / Jadwal (Kuning)</option>
                <option value="alert">🚨 Darurat / Aturan Ujian Ketat (Merah)</option>
              </select>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">3. Judul Notifikasi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pemeliharaan Server Malam Ini / Selamat Ujian Akhir Semester"
                className="input-field-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">4. Isi Keterangan / Pengumuman</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Tulis rincian pesan lengkap yang akan dibaca oleh pengguna di halaman portal mereka..."
                className="w-full rounded-2xl border border-[#e3ebfa] bg-white p-4 text-sm text-gray-900 focus:border-[#6c97fa] focus:outline-none focus:ring-4 focus:ring-[#5485f1]/10 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={sending}
              className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-[0_12px_28px_rgba(47,102,233,0.32)] hover:shadow-[0_16px_36px_rgba(47,102,233,0.42)] transition-all"
            >
              <Send className="h-4 w-4" />
              {sending ? "Mengirim ke Supabase..." : "Kirim Siaran Notifikasi Sekarang"}
            </button>
          </div>
        </form>

        {/* Riwayat Pesan Terkirim */}
        <div className="pt-6 border-t border-[#e3ebfa] space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#2f66e9]" /> Riwayat Siaran Notifikasi Aktif ({announcements.length})
          </h3>

          {loadingAnnouncements ? (
            <div className="py-8 text-center text-sm text-gray-400">Memuat riwayat siaran dari database...</div>
          ) : announcements.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 bg-white/60 rounded-2xl border border-dashed border-[#e3ebfa]">
              Belum ada pesan siaran yang dikirim oleh administrator.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((item) => {
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e3ebfa] bg-white p-4.5 shadow-sm hover:border-[#cbdffc] transition-colors">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.type === "success" ? "bg-green-50 text-green-600" :
                        item.type === "alert" ? "bg-red-50 text-red-600" :
                        item.type === "warning" ? "bg-amber-50 text-amber-600" :
                        "bg-[#eef5ff] text-[#2f66e9]"
                      }`}>
                        {item.type === "success" ? <CheckCircle2 className="h-5 w-5" /> :
                         item.type === "alert" ? <ShieldAlert className="h-5 w-5" /> :
                         item.type === "warning" ? <AlertTriangle className="h-5 w-5" /> :
                         <FileText className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.target_type === "GLOBAL" ? "bg-blue-100 text-blue-800" :
                            item.target_type === "PRIVATE" ? "bg-purple-100 text-purple-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {item.target_type === "GLOBAL" ? "🌐 GLOBAL" :
                             item.target_type === "SCHOOL" ? `🏫 ${item.sekolah?.name || "1 SEKOLAH"}` :
                             item.target_type === "ROLE_SISWA" ? "🎓 KHUSUS SISWA" :
                             item.target_type === "ROLE_GURU" ? "👨‍🏫 KHUSUS GURU" :
                             `🔒 PRIBADI: ${item.user?.full_name || "USER"}`}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.content}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          Diterbitkan: {new Date(item.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                        title="Tarik & Hapus Notifikasi"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Fitur & Opsi Admin Lainnya */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Formulir Pendaftaran Sekolah (ADR-001) */}
        <div className="card card-padding col-span-1 xl:col-span-2 border-l-4 border-l-green-500 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Pendaftaran Sekolah Baru (Tenant)</h2>
              <p className="text-xs text-gray-500">Buat entitas sekolah baru ke dalam sistem.</p>
            </div>
          </div>
          
          <form onSubmit={handleRegisterSchool} className="space-y-4">
            {schoolSuccess && <div className="p-3 text-xs font-semibold bg-green-50 text-green-700 rounded-lg border border-green-200">{schoolSuccess}</div>}
            {schoolError && <div className="p-3 text-xs font-semibold bg-red-50 text-red-700 rounded-lg border border-red-200">{schoolError}</div>}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nama Sekolah</label>
                <input type="text" value={sekolahName} onChange={e => setSekolahName(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 transition-all" placeholder="Misal: SMAN 1 Jakarta" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kode (Slug)</label>
                <input type="text" value={sekolahSlug} onChange={e => setSekolahSlug(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 transition-all font-mono" placeholder="sman-1-jkt" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Alamat (Opsional)</label>
              <input type="text" value={sekolahAddress} onChange={e => setSekolahAddress(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 transition-all" placeholder="Alamat lengkap sekolah" />
            </div>
            <button type="submit" disabled={registeringSchool} className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs rounded-xl shadow-sm">
              {registeringSchool ? "Menyimpan..." : "Daftarkan Sekolah"}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4 col-span-1">
          {[
            { title: "User Management", desc: "CRUD guru, siswa, admin, dan role akses.", icon: Users },
            { title: "Security & RLS", desc: "Kontrol keamanan, audit log, dan policy.", icon: ShieldCheck },
            { title: "System Config", desc: "Theme, fitur aktif, dan preferensi sistem.", icon: Settings2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card card-padding flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{item.title}</h2>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Navigasi Cepat CRUD */}
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