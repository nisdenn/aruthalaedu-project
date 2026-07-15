"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useDashboardIdentity } from "./useDashboardIdentity";

const RESTRICTED_FOR_STUDENTS = [
  "/admin-hub",
  "/teacher-hub",
  "/user-management",
  "/class-management",
  "/subject-management",
  "/academic-year",
  "/school-health",
  "/monitoring-center",
  "/incident-report",
  "/exam-health",
  "/report-export",
  "/reports",
  "/laporan",
  "/teacher-report",
  "/exam-report",
  "/bank-soal",
  "/ujian/buat",
  "/data-siswa",
  "/parent-hub",
  "/settings",
  "/features",
  "/akademik",
];

const RESTRICTED_FOR_TEACHERS = [
  "/admin-hub",
  "/user-management",
  "/class-management",
  "/subject-management",
  "/academic-year",
  "/school-health",
  "/monitoring-center",
  "/settings",
  "/data-siswa/import",
];

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const identity = useDashboardIdentity();

  const isRestrictedForStudent = identity.roleGroup === "student" &&
    RESTRICTED_FOR_STUDENTS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const isRestrictedForTeacher = identity.roleGroup === "teacher" &&
    RESTRICTED_FOR_TEACHERS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (identity.loading) return;
    if (isRestrictedForStudent) {
      router.replace("/overview");
    } else if (isRestrictedForTeacher) {
      router.replace("/teacher-hub");
    }
  }, [identity.loading, isRestrictedForStudent, isRestrictedForTeacher, router]);

  if (identity.loading) {
    const showLoading = RESTRICTED_FOR_STUDENTS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
                        RESTRICTED_FOR_TEACHERS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    
    return (
      <>
        {showLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-[#2f66e9] border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Memverifikasi Hak Otorisasi & Akses Pengguna...</p>
          </div>
        )}
        <div className={showLoading ? "hidden" : "block"}>
          {children}
        </div>
      </>
    );
  }

  if (isRestrictedForStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-5 shadow-[0_12px_30px_rgba(239,68,68,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
          Maaf, halaman <strong>{pathname}</strong> khusus untuk Guru dan Administrator Sekolah. Sebagai <strong>Siswa ({identity.fullName})</strong>, Anda tidak memiliki hak otorisasi untuk mengakses area pengawasan ini.
        </p>
        <button
          onClick={() => router.replace("/overview")}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard Siswa
        </button>
      </div>
    );
  }

  if (isRestrictedForTeacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 shadow-[0_12px_30px_rgba(245,158,11,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Admin Khusus (403 Forbidden)</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
          Maaf, halaman <strong>{pathname}</strong> adalah area konfigurasi tingkat lanjut khusus Super Admin / Kepala Sekolah.
        </p>
        <button
          onClick={() => router.replace("/teacher-hub")}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Hub Guru
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
