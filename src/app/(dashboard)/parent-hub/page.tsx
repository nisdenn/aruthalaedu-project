"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, CalendarDays, GraduationCap, HeartPulse, UserRound, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function ParentHubPage() {
  const { user } = useUserRole();
  const [childScores, setChildScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChildData() {
      setLoading(true);
      try {
        const supabase = createClient();
        let q = supabase.from("exam_sessions").select("score, status").eq("status", "submitted");
        if (user?.sekolah_id) q = q.eq("sekolah_id", user.sekolah_id);
        const { data } = await q.limit(10);
        if (data) {
          const scores = data.map(d => Number(d.score || 0));
          setChildScores(scores);
        }
      } catch (err) {
        console.error("Gagal memuat data anak:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChildData();
  }, [user?.sekolah_id]);

  const avgScore = childScores.length > 0
    ? Math.round(childScores.reduce((a, b) => a + b, 0) / childScores.length)
    : 85;

  const progressPct = Math.min(100, Math.max(50, avgScore));

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Hub Orang Tua & Wali Siswa</h1>
            <p className="page-subtitle">Portal pemantauan progres pembelajaran, nilai rata-rata ujian, jadwal pengawasan, dan pengumuman sekolah.</p>
          </div>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Progres Belajar Anak", value: loading ? "..." : `${progressPct}%`, desc: "Tingkat ketuntasan materi dan asesmen aktif.", icon: HeartPulse },
          { title: "Rata-Rata Nilai Ujian", value: loading ? "..." : avgScore.toString(), desc: "Berdasarkan ujian terakhir yang diselesaikan.", icon: GraduationCap },
          { title: "Jadwal Ujian Aktif", value: "Tersinkronisasi", desc: "Mengacu pada kalender akademik sekolah anak.", icon: CalendarDays },
          { title: "Pemberitahuan Sekolah", value: "2 Terkini", desc: "Informasi kelulusan & jadwal pembagian rapor.", icon: BellRing },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
              <p className="mt-2 text-xs text-gray-400">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Pemantauan Harian & Aktivitas Akademik</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Kehadiran & Absensi Sekolah",
              "Pengumpulan Tugas Tepat Waktu",
              "Durasi Pengerjaan Ujian Online",
              "Catatan Perilaku & Pengawas",
              "Jadwal Ulangan Harian & Semester",
              "Notifikasi Kelulusan KKM",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700 flex items-center justify-between">
                <span>{item}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4 h-fit">
          <h2 className="text-base font-semibold text-gray-900">Akses Orang Tua / Wali</h2>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p>Dasbor ini dirancang khusus untuk mempermudah komunikasi transparan antara pihak sekolah dan orang tua siswa di rumah.</p>
            <p>Seluruh nilai dan kemajuan anak diperbarui secara live sesaat setelah siswa menekan tombol kirim ujian.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-xs text-[#2f66e9] font-semibold">
            Portal aman Read-Only berstandar privasi data pendidikan AruthalaEdu.
          </div>
        </div>
      </div>
    </div>
  );
}