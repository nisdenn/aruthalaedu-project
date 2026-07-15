import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/siswa", "/register", "/e"];

// Rute yang HARAM dibuka oleh Siswa (Guru / Admin Only)
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

// Rute yang HARAM dibuka oleh Guru biasa (Super Admin Only)
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || (p !== "/" && path.startsWith(p)));
  
  // Cek cookie siswa_token (Login via /siswa)
  const isSiswaCookie = request.cookies.has("siswa_token");
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || "";
  const isSiswaAuth = userRole === "SISWA";
  const isSiswa = isSiswaCookie || isSiswaAuth;
  const isGuru = userRole === "GURU";

  // 1. Jika belum login sama sekali dan mencoba buka halaman dasbor tertutup -> lempar ke login
  if (!user && !isSiswa && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Jika sudah login dan mencoba buka halaman login/register/siswa -> lempar ke overview
  if ((user || isSiswa) && (path === "/login" || path === "/siswa" || path === "/register")) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // 3. KEAMANAN RUTE SISWA: Blokir akses Siswa ke seluruh rute Admin/Guru
  if (isSiswa && RESTRICTED_FOR_STUDENTS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // 4. KEAMANAN RUTE GURU: Blokir akses Guru biasa ke menu khusus Super Admin
  if (isGuru && !isSiswa && RESTRICTED_FOR_TEACHERS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/teacher-hub", request.url));
  }

  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
