"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserSession {
  id: string;
  nisn?: string;
  full_name: string;
  role: string;
  sekolah_id?: string;
}

export function useUserRole() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        // 1. Cek Local Bypass untuk Siswa (Simulasi)
        const localSiswa = localStorage.getItem("aruthala_siswa_session");
        if (localSiswa) {
          const parsed = JSON.parse(localSiswa);
          setUser(parsed);
          setLoading(false);
          return;
        }

        // 2. Jika tidak ada bypass, cek Real Supabase Auth (Untuk Guru/Admin)
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Ambil profil dari database
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, role, nisn, sekolah_id")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              full_name: profile.full_name,
              role: profile.role,
              nisn: profile.nisn,
              sekolah_id: profile.sekolah_id
            });
          } else {
            // Fallback jika profil belum terbuat
            setUser({
              id: session.user.id,
              full_name: session.user.email || "Pengguna",
              role: "GURU"
            });
          }
        }
      } catch (error) {
        console.error("Gagal mendapatkan role pengguna:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  return {
    user,
    loading,
    isSiswa: user?.role === "SISWA",
    isGuru: user?.role === "GURU" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
  };
}
