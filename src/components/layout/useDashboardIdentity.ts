"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types";

export type DashboardRoleGroup = "admin" | "teacher" | "student" | "unknown";

export interface DashboardIdentity {
  loading: boolean;
  roleGroup: DashboardRoleGroup;
  roleLabel: string;
  rawRole: string;
  fullName: string;
  email: string;
  nisn?: string;
  userId?: string;
  sekolahId?: string;
  yayasanId?: string;
  sekolahName?: string;
}

const ADMIN_ROLES: string[] = ["SUPER_ADMIN", "YAYASAN_ADMIN", "KEPALA_SEKOLAH", "OPERATOR", "ADMIN"];
const TEACHER_ROLES: string[] = ["GURU"];
const STUDENT_ROLES: string[] = ["SISWA"];

function resolveRoleGroup(role?: string | null): DashboardRoleGroup {
  if (!role) return "unknown";
  const r = role.toUpperCase();
  if (ADMIN_ROLES.includes(r)) return "admin";
  if (TEACHER_ROLES.includes(r)) return "teacher";
  if (STUDENT_ROLES.includes(r)) return "student";
  return "unknown";
}

function resolveRoleLabel(roleGroup: DashboardRoleGroup, role?: string | null): string {
  if (roleGroup === "admin") return "Admin";
  if (roleGroup === "teacher") return "Guru";
  if (roleGroup === "student") return "Siswa";
  return role ? role.replace(/_/g, " ") : "Pengguna";
}

function resolveFullName(roleLabel: string, fullName?: string | null, email?: string | null): string {
  if (fullName?.trim()) return fullName;
  if (email?.trim()) return email;
  return roleLabel;
}

function resolveSchoolName(sekolahId?: string | null, dbSchoolName?: string | null, metadataSchoolName?: string | null): string {
  if (dbSchoolName?.trim()) return dbSchoolName;
  if (metadataSchoolName?.trim()) return metadataSchoolName;
  if (!sekolahId) return "SMA Negeri 1 Aruthala";
  if (sekolahId === "22222222-2222-2222-2222-222222222222" || sekolahId.startsWith("22222222")) {
    return "SMA Negeri 1 Aruthala";
  }
  if (sekolahId === "11111111-1111-1111-1111-111111111111" || sekolahId.startsWith("11111111")) {
    return "SMA Negeri 1 Aruthala (Utama)";
  }
  return "SMA Negeri 1 Aruthala";
}

export function useDashboardIdentity() {
  const [identity, setIdentity] = useState<DashboardIdentity>({
    loading: true,
    roleGroup: "unknown",
    roleLabel: "Memuat...",
    rawRole: "UNKNOWN",
    fullName: "Memuat pengguna",
    email: "",
    sekolahName: "SMA Negeri 1 Aruthala",
  });

  useEffect(() => {
    let active = true;

    async function checkIdentity() {
      try {
        // 1. Cek Local Bypass untuk Siswa (Login via /siswa)
        const localSiswa = localStorage.getItem("aruthala_siswa_session");
        if (localSiswa) {
          const parsed = JSON.parse(localSiswa);
          if (active && parsed?.role === "SISWA") {
            const resolvedSchool = resolveSchoolName(parsed.sekolah_id, parsed.sekolah_name || parsed.school_name);
            setIdentity({
              loading: false,
              roleGroup: "student",
              roleLabel: "Siswa",
              rawRole: parsed?.role || "SISWA",
              fullName: parsed.full_name || "Siswa",
              email: `${parsed.nisn || "siswa"}@sekolah.id`,
              nisn: parsed.nisn,
              userId: parsed.id || parsed.siswa_id,
              sekolahId: parsed.sekolah_id,
              yayasanId: parsed.yayasan_id,
              sekolahName: resolvedSchool,
            });
            return;
          }
        }

        // 2. Cek Supabase Auth Session (Login via /login)
        const client = createClient();
        const { data: { user } } = await client.auth.getUser();

        if (user) {
          // Cek profil dari database agar role & nama terjamin akurat 100%
          const { data: profile } = await client
            .from("profiles")
            .select("id, full_name, role, nisn, sekolah_id, yayasan_id")
            .eq("id", user.id)
            .single();

          let dbSchoolName: string | undefined = undefined;
          let dbYayasanId: string | undefined = undefined;
          if (profile?.sekolah_id) {
            try {
              const { data: sekolahData } = await client
                .from("sekolah")
                .select("name, yayasan_id")
                .eq("id", profile.sekolah_id)
                .single();
              if (sekolahData) {
                dbSchoolName = sekolahData.name;
                dbYayasanId = sekolahData.yayasan_id;
              }
            } catch {
              // Abaikan jika tabel sekolah belum ter-seed
            }
          }

          const metadata = user.user_metadata ?? {};
          const role = (profile?.role || metadata.role || user.app_metadata?.role || "GURU") as string;
          const roleGroup = resolveRoleGroup(role);
          const roleLabel = resolveRoleLabel(roleGroup, role);
          const fullName = resolveFullName(roleLabel, profile?.full_name || (metadata.full_name as string | undefined), user.email);
          const sekolahName = resolveSchoolName(profile?.sekolah_id, dbSchoolName, metadata.school_name as string | undefined);

          if (active) {
            setIdentity({
              loading: false,
              roleGroup,
              roleLabel,
              rawRole: role,
              fullName,
              email: user.email ?? "",
              nisn: profile?.nisn,
              userId: user.id,
              sekolahId: profile?.sekolah_id,
              yayasanId: profile?.yayasan_id || dbYayasanId || metadata.yayasan_id as string | undefined,
              sekolahName,
            });
          }
        } else {
          if (active) {
            setIdentity({
              loading: false,
              roleGroup: "unknown",
              roleLabel: "Pengguna",
              rawRole: "UNKNOWN",
              fullName: "Pengguna",
              email: "",
              sekolahName: "SMA Negeri 1 Aruthala",
            });
          }
        }
      } catch (err) {
        if (active) {
          setIdentity({
            loading: false,
            roleGroup: "unknown",
            roleLabel: "Pengguna",
            rawRole: "UNKNOWN",
            fullName: "Pengguna",
            email: "",
            sekolahName: "SMA Negeri 1 Aruthala",
          });
        }
      }
    }

    checkIdentity();

    return () => {
      active = false;
    };
  }, []);

  return identity;
}