"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types";

export type DashboardRoleGroup = "admin" | "teacher" | "student" | "unknown";

export interface DashboardIdentity {
  loading: boolean;
  roleGroup: DashboardRoleGroup;
  roleLabel: string;
  fullName: string;
  email: string;
}

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "YAYASAN_ADMIN", "KEPALA_SEKOLAH", "OPERATOR"];
const TEACHER_ROLES: Role[] = ["GURU"];
const STUDENT_ROLES: Role[] = ["SISWA"];

function resolveRoleGroup(role?: string | null): DashboardRoleGroup {
  if (!role) return "unknown";
  if (ADMIN_ROLES.includes(role as Role)) return "admin";
  if (TEACHER_ROLES.includes(role as Role)) return "teacher";
  if (STUDENT_ROLES.includes(role as Role)) return "student";
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

export function useDashboardIdentity() {
  const [identity, setIdentity] = useState<DashboardIdentity>({
    loading: true,
    roleGroup: "unknown",
    roleLabel: "Memuat...",
    fullName: "Memuat pengguna",
    email: "",
  });

  useEffect(() => {
    let active = true;

    const client = createClient();
    client.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;

        const user = data.user;
        const metadata = user?.user_metadata ?? {};
        const role = metadata.role as string | undefined ?? user?.app_metadata?.role;
        const roleGroup = resolveRoleGroup(role);
        const roleLabel = resolveRoleLabel(roleGroup, role);

        setIdentity({
          loading: false,
          roleGroup,
          roleLabel,
          fullName: resolveFullName(roleLabel, metadata.full_name as string | undefined, user?.email),
          email: user?.email ?? "",
        });
      })
      .catch(() => {
        if (!active) return;
        setIdentity({
          loading: false,
          roleGroup: "unknown",
          roleLabel: "Pengguna",
          fullName: "Pengguna",
          email: "",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return identity;
}