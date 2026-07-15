"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "./useUserRole";

export interface DashboardStats {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  totalUjian: number;
  ujianAktif: number;
  pelanggaranHariIni: number;
  laporanSiap: number;
  sekolahAktif: number;
  totalMapel: number;
  loading: boolean;
}

export function useDashboardStats() {
  const { user, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalSiswa: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalUjian: 0,
    ujianAktif: 0,
    pelanggaranHariIni: 0,
    laporanSiap: 0,
    sekolahAktif: 1,
    totalMapel: 0,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (roleLoading) return;
    try {
      const supabase = createClient();
      const sekolahId = user?.sekolah_id;

      // 1. Total Siswa
      let siswaQuery = supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "SISWA");
      if (sekolahId) siswaQuery = siswaQuery.eq("sekolah_id", sekolahId);
      const { count: siswaCount } = await siswaQuery;

      // 2. Total Guru & Admin
      let guruQuery = supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "SISWA");
      if (sekolahId) guruQuery = guruQuery.eq("sekolah_id", sekolahId);
      const { count: guruCount } = await guruQuery;

      // 3. Total Kelas
      let kelasQuery = supabase.from("kelas").select("id", { count: "exact", head: true });
      if (sekolahId) kelasQuery = kelasQuery.eq("sekolah_id", sekolahId);
      const { count: kelasCount } = await kelasQuery;

      // 4. Total Ujian & Ujian Aktif
      let ujianQuery = supabase.from("exams").select("id, status");
      if (sekolahId) ujianQuery = ujianQuery.eq("sekolah_id", sekolahId);
      const { data: examsData } = await ujianQuery;
      const totalUjianCount = examsData?.length || 0;
      const ujianAktifCount = examsData?.filter(e => e.status === "published").length || 0;

      // 5. Pelanggaran Hari Ini
      const todayStr = new Date().toISOString().split("T")[0];
      let violationsQuery = supabase
        .from("exam_violations")
        .select("id", { count: "exact", head: true })
        .gte("occurred_at", `${todayStr}T00:00:00.000Z`);
      if (sekolahId) violationsQuery = violationsQuery.eq("sekolah_id", sekolahId);
      const { count: violationsCount } = await violationsQuery;

      // 6. Laporan Siap (Sesi Ujian yang sudah disubmit)
      let sessionsQuery = supabase
        .from("exam_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted");
      if (sekolahId) sessionsQuery = sessionsQuery.eq("sekolah_id", sekolahId);
      const { count: sessionsCount } = await sessionsQuery;

      // 7. Sekolah Aktif
      const { count: sekolahCount } = await supabase
        .from("sekolah")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      // 8. Total Mapel (Distinct mata_pelajaran dari questions)
      let questionsQuery = supabase.from("questions").select("mata_pelajaran");
      if (sekolahId) questionsQuery = questionsQuery.eq("sekolah_id", sekolahId);
      const { data: questionsData } = await questionsQuery;
      const mapelSet = new Set(questionsData?.map(q => q.mata_pelajaran).filter(Boolean));

      setStats({
        totalSiswa: siswaCount || 0,
        totalGuru: guruCount || 0,
        totalKelas: kelasCount || 0,
        totalUjian: totalUjianCount,
        ujianAktif: ujianAktifCount,
        pelanggaranHariIni: violationsCount || 0,
        laporanSiap: sessionsCount || 0,
        sekolahAktif: sekolahCount || 1,
        totalMapel: mapelSet.size || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Gagal memuat statistik dasbor:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [roleLoading, user?.sekolah_id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refreshStats: fetchStats };
}
