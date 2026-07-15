"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Users, BookOpen, TrendingUp, ArrowRight, Clock, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "badge-default" },
  published: { label: "Aktif", className: "badge-success" },
  closed: { label: "Selesai", className: "badge-default" },
};

function AdminOverview() {
  const [stats, setStats] = useState({
    ujian: 0,
    siswa: 0,
    soal: 0,
    rataNilai: 0,
  });
  const [recentUjian, setRecentUjian] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [
        { count: countUjian },
        { count: countSiswa },
        { count: countSoal },
        { data: exams }
      ] = await Promise.all([
        supabase.from('exams').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'SISWA'),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*').order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        ujian: countUjian || 0,
        siswa: countSiswa || 0,
        soal: countSoal || 0,
        rataNilai: 0
      });

      setRecentUjian(exams || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const STATS_CARDS = [
    { label: "Total Ujian", value: stats.ujian.toString(), change: "Total ujian terdaftar", icon: ClipboardList, color: "blue" as const },
    { label: "Total Siswa", value: stats.siswa.toString(), change: "Total siswa aktif", icon: Users, color: "green" as const },
    { label: "Bank Soal", value: stats.soal.toString(), change: "Total soal di bank", icon: BookOpen, color: "amber" as const },
    { label: "Rata-rata Nilai", value: stats.rataNilai.toString(), change: "Data belum cukup", icon: TrendingUp, color: "purple" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Selamat datang 👋</h1>
        <p className="page-subtitle">Berikut ringkasan aktivitas ujian sekolah Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS_CARDS.map((s) => (
          <div key={s.label} className="card card-padding">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                  {loading ? "..." : s.value}
                </p>
                <p className="text-xs text-gray-400 mt-2">{s.change}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color === "blue"
                    ? "bg-[#eef5ff] text-[#2f66e9]"
                    : s.color === "green"
                      ? "bg-green-50 text-green-600"
                      : s.color === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-purple-50 text-purple-600"
                  }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/ujian/buat", label: "Buat Ujian Baru", icon: ClipboardList, desc: "Siapkan soal dan jadwalkan ujian", color: "bg-blue-50 text-blue-600" },
          { href: "/bank-soal/buat", label: "Tambah Soal", icon: BookOpen, desc: "Tambahkan soal ke bank soal", color: "bg-green-50 text-green-600" },
          { href: "/data-siswa/import", label: "Import Siswa", icon: Users, desc: "Upload data siswa dari CSV/Excel", color: "bg-amber-50 text-amber-600" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card card-padding flex items-center gap-4 group hover:border-[#d8e6fb] hover:shadow-[0_22px_50px_rgba(57,111,190,0.12)] transition-all"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${a.color}`}>
              <a.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{a.label}</div>
              <div className="text-xs text-gray-500">{a.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden overflow-x-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/80 min-w-[500px]">
          <h2 className="text-base font-semibold text-gray-900">Ujian Terbaru</h2>
          <Link href="/ujian" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat semua →
          </Link>
        </div>
        <div>
          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">Memuat data ujian...</div>
          ) : recentUjian.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">Belum ada data ujian.</div>
          ) : (
            recentUjian.map((u) => {
              const st = STATUS_STYLE[u.status || "draft"] || STATUS_STYLE["draft"];
              return (
                <Link
                  key={u.id}
                  href={`/ujian/${u.id}`}
                  className="flex items-center gap-4 px-6 py-4 border-b border-white/60 last:border-0 hover:bg-white/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">{u.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(u.start_at || u.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={st.className}>{st.label}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SiswaOverview() {
  const { user } = useUserRole();
  const [exams, setExams] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tersedia"|"riwayat">("tersedia");

  useEffect(() => {
    async function fetchSiswaData() {
      if (!user?.sekolah_id || !user?.id) {
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      const p1 = supabase
        .from("exams")
        .select("*")
        .eq("sekolah_id", user.sekolah_id)
        .eq("status", "published")
        .order("start_at", { ascending: true });

      const p2 = supabase
        .from("exam_sessions")
        .select(`
          id,
          score,
          submitted_at,
          exams(title)
        `)
        .eq("siswa_id", user.id)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });
        
      const [resExams, resHistory] = await Promise.all([p1, p2]);

      setExams(resExams.data || []);
      setHistory(resHistory.data || []);
      setLoading(false);
    }
    
    fetchSiswaData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Halo, {user?.full_name?.split(" ")[0] || "Siswa"} 👋</h1>
        <p className="page-subtitle">Siap untuk ujian hari ini? Pastikan koneksi internet Anda stabil.</p>
      </div>
      
      <div className="card overflow-hidden">
        <div className="flex items-center gap-6 px-6 py-4 border-b border-white/80 bg-white/40">
          <button onClick={() => setActiveTab("tersedia")}
            className={`flex items-center gap-2 font-bold transition-colors ${activeTab === 'tersedia' ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <ClipboardList className="w-5 h-5" />
            Ujian Tersedia
          </button>
          <button onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 font-bold transition-colors ${activeTab === 'riwayat' ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <CheckCircle className="w-5 h-5" />
            Riwayat Ujian
          </button>
        </div>
        
        <div className="divide-y divide-white/60 bg-white/20">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-500">Mencari data...</p>
            </div>
          ) : activeTab === "tersedia" ? (
            exams.length === 0 ? (
              <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Tidak Ada Ujian Saat Ini</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Anda tidak memiliki jadwal ujian yang aktif saat ini. Ujian akan muncul di sini saat guru Anda memulainya.
                </p>
              </div>
            ) : (
              exams.map((u) => (
                <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-white/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{u.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                        <Clock className="w-3.5 h-3.5" /> {u.duration_minutes} Menit
                      </span>
                      <span className="flex items-center gap-1.5">
                        Mulai: {new Date(u.start_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {u.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{u.description}</p>}
                  </div>
                  <div className="shrink-0 mt-2 sm:mt-0">
                    <Link 
                      href={`/e/${u.id}`}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Mulai Kerjakan
                    </Link>
                  </div>
                </div>
              ))
            )
          ) : (
            history.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-500">
                Belum ada riwayat ujian yang diselesaikan.
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-white/60 transition-colors">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{h.exams?.title || "Ujian"}</h3>
                    <div className="text-sm text-gray-500">
                      Disubmit: {new Date(h.submitted_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Skor Akhir</div>
                    <div className="text-2xl font-black text-blue-700">{h.score !== null ? h.score : "-"}</div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { isSiswa, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isSiswa ? <SiswaOverview /> : <AdminOverview />;
}
