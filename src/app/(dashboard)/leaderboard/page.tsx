"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Medal, Star, Trophy, Award, UserCheck, Table, LayoutGrid, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface LeaderboardEntry {
  siswa_id: string;
  name: string;
  className?: string;
  totalScore: number;
  sessionCount: number;
  avgScore: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { user } = useUserRole();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myTotalScore, setMyTotalScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "top3" | "top10">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const supabase = createClient();
        
        let sessionsQuery = supabase
          .from("exam_sessions")
          .select("siswa_id, score, status")
          .eq("status", "submitted");
        if (user?.sekolah_id) sessionsQuery = sessionsQuery.eq("sekolah_id", user.sekolah_id);
        const { data: sData } = await sessionsQuery;

        let profilesQuery = supabase
          .from("profiles")
          .select("id, full_name, kelas_id")
          .eq("role", "SISWA");
        if (user?.sekolah_id) profilesQuery = profilesQuery.eq("sekolah_id", user.sekolah_id);
        const { data: pData } = await profilesQuery;

        const { data: kData } = await supabase.from("kelas").select("id, name");
        const kelasMap = new Map(kData?.map(k => [k.id, k.name]) || []);

        const scoreMap = new Map<string, { total: number; count: number }>();
        (sData || []).forEach(s => {
          if (!s.siswa_id) return;
          const current = scoreMap.get(s.siswa_id) || { total: 0, count: 0 };
          scoreMap.set(s.siswa_id, {
            total: current.total + (s.score || 0),
            count: current.count + 1,
          });
        });

        const rawList: Omit<LeaderboardEntry, "rank">[] = (pData || []).map(p => {
          const stats = scoreMap.get(p.id) || { total: 0, count: 0 };
          return {
            siswa_id: p.id,
            name: p.full_name || "Siswa",
            className: p.kelas_id ? kelasMap.get(p.kelas_id) || "Umum" : "Umum",
            totalScore: Math.round(stats.total),
            sessionCount: stats.count,
            avgScore: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
          };
        });

        rawList.sort((a, b) => b.totalScore - a.totalScore || b.avgScore - a.avgScore);

        const ranked: LeaderboardEntry[] = rawList.map((item, idx) => ({
          ...item,
          rank: idx + 1,
        }));

        setEntries(ranked);

        if (user?.id) {
          const foundMe = ranked.find(r => r.siswa_id === user.id);
          if (foundMe) {
            setMyRank(foundMe.rank);
            setMyTotalScore(foundMe.totalScore);
          }
        }
      } catch (err) {
        console.error("Gagal memuat leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [user?.sekolah_id, user?.id]);

  const filteredEntries = useMemo(() => {
    let list = entries;
    if (activeTab === "top3") list = list.filter((e) => e.rank <= 3);
    else if (activeTab === "top10") list = list.filter((e) => e.rank <= 10);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || (e.className && e.className.toLowerCase().includes(q)));
    }
    return list;
  }, [entries, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Leaderboard Sekolah</h1>
          <p className="page-subtitle">Peringkat prestasi siswa secara real-time berdasarkan akumulasi nilai ujian.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      {/* Mini KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Peringkat Saya", value: myRank ? `#${myRank}` : entries.length > 0 ? `#1` : "-", detail: "Berdasarkan total skor ujian", icon: Medal, tone: "blue" },
          { label: "Poin / XP Terkumpul", value: myTotalScore ? `${myTotalScore} XP` : entries.length > 0 ? `${entries[0]?.totalScore} XP` : "0 XP", detail: "Akumulasi nilai seluruh ujian", icon: Star, tone: "amber" },
          { label: "Konsistensi Ujian", value: "Aktif 100%", detail: "Sistem penilaian jujur anti-cheat", icon: Flame, tone: "red" },
          { label: "Total Siswa Dinilai", value: loading ? "..." : `${entries.length} Siswa`, detail: "Masuk dalam klasemen sekolah", icon: Trophy, tone: "green" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card card-padding">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                item.tone === "blue" ? "bg-blue-50 text-blue-600" :
                item.tone === "amber" ? "bg-amber-50 text-amber-600" :
                item.tone === "red" ? "bg-red-50 text-red-600" :
                "bg-green-50 text-green-600"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
              <p className="mt-2 text-xs text-gray-400">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">Klasemen Top Siswa</h2>
                <p className="text-xs text-gray-500">Urutan siswa berprestasi dengan nilai tertinggi</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
                {[
                  { id: "all", label: "Semua Siswa", count: entries.length },
                  { id: "top10", label: "Top 10", count: Math.min(entries.length, 10) },
                  { id: "top3", label: "Top 3", count: Math.min(entries.length, 3) },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? "bg-[#2f66e9] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  title="Tabel Peringkat"
                >
                  <Table className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-[#2f66e9] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  title="Kartu Peringkat"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fbff] border border-[#e3ebfa] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66e9] transition-all"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Menghitung klasemen dari tabel exam_sessions...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-[#f9fbff] rounded-2xl border border-dashed border-[#e3ebfa]">
              Siswa tidak ditemukan pada filter ini.
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-16">Rank</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa & Kelas</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Ujian Selesai</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Rata-rata</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((student) => {
                    const isTop1 = student.rank === 1;
                    const isTop2 = student.rank === 2;
                    const isTop3 = student.rank === 3;
                    const isMe = student.siswa_id === user?.id;

                    return (
                      <tr key={student.siswa_id} className={`transition-colors ${isMe ? "bg-[#f0f6ff] font-medium" : "hover:bg-[#f8fbff]"}`}>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            isTop1 ? "bg-amber-100 text-amber-700" :
                            isTop2 ? "bg-gray-200 text-gray-800" :
                            isTop3 ? "bg-orange-100 text-orange-700" :
                            "bg-[#eef5ff] text-[#2f66e9]"
                          }`}>
                            {isTop1 ? <Trophy className="w-4 h-4" /> : student.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                            {isMe && (
                              <span className="rounded-full bg-[#2f66e9] text-white px-2 py-0.5 text-[10px] font-semibold">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 block mt-0.5">Kelas {student.className}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-semibold text-gray-700">{student.sessionCount} Sesi</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-semibold text-gray-800">{student.avgScore}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-block rounded-lg bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#2f66e9]">
                            {student.totalScore} XP
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredEntries.map((student) => {
                const isTop1 = student.rank === 1;
                const isMe = student.siswa_id === user?.id;
                return (
                  <div key={student.siswa_id} className={`rounded-xl border p-4 flex items-center justify-between gap-3 transition-all ${
                    isMe ? "border-[#2f66e9] bg-[#f0f6ff]" :
                    isTop1 ? "border-amber-200 bg-amber-50/30" :
                    "border-gray-100 bg-white hover:border-[#cbdffc]"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        student.rank === 1 ? "bg-amber-100 text-amber-700" :
                        student.rank === 2 ? "bg-gray-200 text-gray-800" :
                        student.rank === 3 ? "bg-orange-100 text-orange-700" :
                        "bg-[#eef5ff] text-[#2f66e9]"
                      }`}>
                        {student.rank === 1 ? <Trophy className="w-5 h-5" /> : student.rank}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                          {isMe && <span className="text-[9px] font-semibold bg-[#2f66e9] text-white px-1.5 py-0.5 rounded-full">Anda</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Kelas {student.className} • Rata-rata {student.avgScore}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#2f66e9] block">{student.totalScore} XP</span>
                      <span className="text-[10px] text-gray-400">{student.sessionCount} ujian</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Sistem Poin AruthalaEdu</h2>
              <p className="text-[11px] text-gray-500">Aturan pemeringkatan klasemen</p>
            </div>
          </div>
          <div className="space-y-3 text-xs leading-6 text-gray-600">
            <p>1. Setiap ujian yang diselesaikan akan menambahkan nilai akhir Anda langsung ke akumulasi poin (XP).</p>
            <p>2. Semakin tinggi nilai ujian dan semakin banyak sesi yang Anda ikuti secara jujur tanpa pelanggaran, peringkat Anda akan otomatis naik.</p>
            <p>3. Top 3 siswa di akhir semester akan mendapatkan piagam penghargaan digital & Hall of Fame resmi dari sekolah.</p>
          </div>
          <div className="rounded-xl border border-[#d8e6fb] bg-[#f7fbff] p-3 text-xs text-[#2f66e9] flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Terhubung langsung ke pangkalan data ujian real-time.</span>
          </div>
        </div>
      </div>
    </div>
  );
}