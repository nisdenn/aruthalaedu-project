import Link from "next/link";
import { ArrowLeft, Flame, Medal, Star, Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="page-title">Leaderboard</h1><p className="page-subtitle">UI untuk ranking harian, mingguan, bulanan, dan semester.</p></div>
        <Link href="/student-hub" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Hub Siswa</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Weekly Rank", value: "#4", detail: "Naik 2 posisi", icon: Medal, tone: "blue" },
          { label: "XP Terkumpul", value: "1.102", detail: "+64 XP minggu ini", icon: Star, tone: "amber" },
          { label: "Streak Aktif", value: "11 hari", detail: "Belajar konsisten", icon: Flame, tone: "red" },
          { label: "Hall of Fame", value: "24", detail: "Pemenang semester", icon: Trophy, tone: "green" },
        ].map((item) => { const Icon = item.icon; return (<div key={item.label} className="card card-padding"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone === "blue" ? "bg-blue-50 text-blue-600" : item.tone === "amber" ? "bg-amber-50 text-amber-600" : item.tone === "red" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p><p className="mt-2 text-xs text-gray-400">{item.detail}</p></div>); })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Top siswa minggu ini</h2>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Alya Putri", className: "9A", xp: 1280, badge: "Perfect Score", trend: "+120 XP" },
              { rank: 2, name: "Rafi Akbar", className: "8B", xp: 1190, badge: "Fast Finisher", trend: "+88 XP" },
              { rank: 3, name: "Nabila Rahma", className: "7A", xp: 1135, badge: "Learning Streak", trend: "+76 XP" },
              { rank: 4, name: "Dimas Pratama", className: "9B", xp: 1102, badge: "Top Student", trend: "+64 XP" },
            ].map((student) => (
              <div key={student.rank} className="flex items-center gap-4 rounded-2xl border border-[#e3ebfa] bg-white/70 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-sm font-bold text-[#2f66e9]">{student.rank}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-900">{student.name}</p><p className="text-xs text-gray-500">{student.className} · {student.badge}</p></div><div className="text-right"><p className="text-sm font-semibold text-gray-900">{student.xp} XP</p><p className="text-xs text-gray-400">{student.trend}</p></div></div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Pemetaan fitur</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Leaderboard akan nyambung ke XP, badge, dan hall of fame dari backend nanti.</p>
            <p>UI ini sudah siap untuk daily, weekly, monthly, dan semester view.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Gunakan halaman ini untuk komponen ranking dan leaderboard sekolah.</div>
        </div>
      </div>
    </div>
  );
}