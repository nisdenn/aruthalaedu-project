"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Megaphone, Calendar, Trophy, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  type: "Pengumuman" | "Kegiatan" | "Prestasi" | "Ekskul";
  published_at: string;
  is_pinned: boolean;
};

type Ekskul = {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  is_active: boolean;
  member_count?: number;
  is_member?: boolean;
};

const TYPE_CONFIG: Record<string, { icon: typeof Megaphone; color: string; bg: string }> = {
  Pengumuman: { icon: Megaphone, color: "text-[#2f66e9]", bg: "bg-[#eef5ff]" },
  Kegiatan: { icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
  Prestasi: { icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
  Ekskul: { icon: Users, color: "text-green-600", bg: "bg-green-50" },
};

export default function KesiswaanPage() {
  const identity = useDashboardIdentity();
  const isStaff = ["admin", "teacher"].includes(identity.roleGroup);
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ekskuls, setEkskuls] = useState<Ekskul[]>([]);
  const [loading, setLoading] = useState(true);

  // Form for new announcement (staff only)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "Pengumuman" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!identity.sekolahId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Fetch announcements
    const { data: annData, error: annError } = await supabase
      .from("announcements")
      .select("id, title, content, type, published_at, is_pinned")
      .eq("sekolah_id", identity.sekolahId)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(20);

    if (annError) {
      console.error("Fetch announcements error:", annError);
    } else {
      setAnnouncements((annData as Announcement[]) || []);
    }

    // Fetch extracurriculars
    const { data: ekskulData, error: ekskulError } = await supabase
      .from("extracurriculars")
      .select("id, name, description, schedule, is_active")
      .eq("sekolah_id", identity.sekolahId)
      .eq("is_active", true)
      .order("name");

    if (ekskulError) {
      console.error("Fetch ekskul error:", ekskulError);
    } else {
      setEkskuls((ekskulData as Ekskul[]) || []);
    }

    setLoading(false);
  }, [identity.sekolahId, supabase]);

  useEffect(() => {
    if (!identity.loading) fetchData();
  }, [fetchData, identity.loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);

    const { error } = await supabase.from("announcements").insert({
      title: form.title,
      content: form.content || null,
      type: form.type,
      sekolah_id: identity.sekolahId,
      yayasan_id: identity.yayasanId,
      created_by: identity.userId,
      target_audience: "all",
    });

    setSaving(false);
    if (error) {
      alert("Gagal membuat pengumuman: " + error.message);
    } else {
      setShowForm(false);
      setForm({ title: "", content: "", type: "Pengumuman" });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-[#2f66e9]" />
        <span className="ml-2 text-sm text-gray-500">Memuat kesiswaan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-padding flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Kesiswaan</h1>
            <p className="page-subtitle">Pengumuman, kegiatan, dan informasi ekstrakurikuler sekolah.</p>
          </div>
        </div>
        {isStaff && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors shadow-lg shadow-[#2f66e9]/20">
            <Plus className="w-4 h-4" /> Buat Pengumuman
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pengumuman & Kegiatan</h2>
          {announcements.length === 0 ? (
            <div className="card card-padding text-center py-12">
              <Megaphone className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Belum ada pengumuman.</p>
            </div>
          ) : (
            announcements.map((ann) => {
              const config = TYPE_CONFIG[ann.type] || TYPE_CONFIG.Pengumuman;
              const Icon = config.icon;
              return (
                <div key={ann.id} className="card card-padding hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{ann.type}</span>
                        {ann.is_pinned && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">📌 Disematkan</span>}
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {new Date(ann.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{ann.title}</h3>
                      {ann.content && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{ann.content}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ekskul Sidebar — 1 col */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Ekstrakurikuler</h2>
          {ekskuls.length === 0 ? (
            <div className="card card-padding text-center py-8">
              <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Belum ada ekskul terdaftar.</p>
            </div>
          ) : (
            ekskuls.map((ek) => (
              <div key={ek.id} className="card card-padding hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-gray-900">{ek.name}</h3>
                {ek.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ek.description}</p>}
                {ek.schedule && (
                  <p className="text-[10px] text-[#2f66e9] font-medium mt-2">🕐 {ek.schedule}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showForm && isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Buat Pengumuman</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Judul</label>
                <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipe</label>
                <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
                  {["Pengumuman", "Kegiatan", "Prestasi", "Ekskul"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Isi Pengumuman</label>
                <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20 resize-none" placeholder="Opsional" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors disabled:opacity-50 shadow-lg shadow-[#2f66e9]/20">
                {saving ? "Menyimpan..." : "Publikasikan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
