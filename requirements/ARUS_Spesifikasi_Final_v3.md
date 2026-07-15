# ARUS — Spesifikasi Produk Final (v3)

**Status: KONSEP / FRONTEND FIRST.** Dokumen ini menjadi acuan resmi produk ARUS dan diselaraskan dengan daftar fitur di [Aruthala.md](Aruthala.md) serta [FEATURES.md](FEATURES.md). Fokus produk tetap pada LMS sekolah yang offline-ready, multi-tenant, dan kuat di sisi anti-cheat.

ARUS adalah brand LMS sekolah dari Aruthala Bangsa, dibangun untuk membantu sekolah menjalankan ujian digital yang tetap stabil saat internet tidak konsisten, sambil menjaga integritas ujian melalui proteksi browser-level dan sinkronisasi data yang aman.

---

## 1. Value Proposition

1. Ujian tidak boleh gagal hanya karena Wi-Fi sekolah putus-nyambung. ARUS mengambil paket soal sekaligus di awal, lalu menyimpan jawaban siswa secara lokal dan menyinkronkannya saat koneksi kembali normal.
2. Kecurangan ujian harus bisa dideteksi sejak browser. ARUS memantau perpindahan tab, fullscreen exit, shortcut berbahaya, dan aktivitas mencurigakan lain untuk dicatat sebagai pelanggaran.
3. Sekolah membutuhkan sistem yang bisa dipakai banyak peran tanpa bercampur data. ARUS menegakkan isolasi per sekolah dan per role lewat Supabase RLS.

---

## 2. Peran Pengguna

| Peran | Akses Utama |
|---|---|
| Siswa | Login, ujian, jadwal, progress belajar, leaderboard, profil prestasi |
| Guru | Manajemen ujian, bank soal, monitoring pelanggaran, laporan kelas |
| Orang Tua | Melihat progress, nilai, jadwal, dan notifikasi anak (read-only) |
| Admin Sekolah | Manajemen siswa/guru, kelas, mata pelajaran, tahun akademik, konfigurasi sekolah |
| Admin Yayasan | Multi-school oversight, konfigurasi tenant, laporan agregat |

Isolasi akses antar peran ditegakkan lewat **Row Level Security (RLS) di Supabase** dan pengecekan role di middleware Next.js.

---

## 3. Tech Stack Final

### Layer Inti

| Layer | Tools |
|---|---|
| Frontend framework | Next.js 15+ (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS Variables, glassmorphism UI |
| State client | Zustand |
| Data fetching | TanStack Query |
| Offline storage | IndexedDB (`idb`) + Service Worker (`next-pwa`) |
| Backend / DB | Supabase (PostgreSQL + RLS + Auth Google Sign-In) |
| File storage | Supabase Storage + CDN cache |
| Realtime | Supabase Realtime |
| Cache / leaderboard | Upstash Redis (ZSET) |
| Hosting | Vercel |
| Cron | Vercel Cron Jobs |
| Export report | jsPDF / exceljs (client-side) |
| Alerting | Discord / Telegram Webhook |
| Monitoring | Better Stack / Uptime Kuma |
| Exam lock | Safe Exam Browser (SEB) + User-Agent Gatekeeper |

### Layer Frontend Implementation

| Kategori | Tools |
|---|---|
| Komponen UI | shadcn/ui, Radix UI, Lucide Icons |
| Animasi | Framer Motion |
| Charts | Recharts |
| Kalender / Jadwal | FullCalendar |
| Testing | Vitest, Playwright |
| Code quality | ESLint, Prettier |
| CI/CD | GitHub Actions |
| Design tool | Figma |

Tidak ada NestJS, Prisma, Socket.IO, atau backend custom terpisah dalam arah produk resmi ini.

---

## 4. Fitur Fase 1 — Core LMS & Client-Side Security

### Anti-Down Exam Engine

- JSON bulk download untuk mengambil seluruh paket soal sekali di awal ujian.
- Jawaban disimpan ke IndexedDB setiap perubahan, sementara Zustand menyimpan state sesi yang aktif.
- Service worker dipakai untuk caching aset statis dan membantu pengalaman offline.
- Listener `online`/`offline` menampilkan banner status koneksi dan memicu sync saat koneksi kembali.
- Batch submit per interval dan final submit saat ujian selesai.

### Browser-Level Anti-Cheat

- Page Visibility dan Blur API untuk mendeteksi pindah tab, minimize, atau focus loss.
- Fullscreen enforcer agar ujian berjalan dalam mode layar penuh.
- Input dan shortcut blocker untuk klik kanan, copy-paste, dan inspect element.

### Backend Foundation

- Supabase Multi-Tenant Auth untuk login akun sekolah.
- RLS untuk memastikan query selalu ter-filter by `tenant_id` dan role.
- Supabase Storage untuk file dan aset pembelajaran.
- Audit log untuk perubahan data krusial.

---

## 5. Fitur Fase 2 — Scale-Up, Gamifikasi & Enterprise

### Gamifikasi

- Leaderboard mingguan berbasis Upstash Redis ZSET.
- Hall of Fame dan reset mingguan via Vercel Cron Jobs.

### Lock Mode

- Route khusus `/exam-gate` untuk mode SEB.
- Middleware gatekeeper untuk menolak browser yang tidak sesuai.

### Enterprise

- Sinkronisasi Google Classroom.
- Multi-tenant custom domain untuk tenant sekolah/yayasan, termasuk logo dan kustomisasi warna tema.
- Export Excel/PDF di sisi client.
- Alert otomatis ke Discord/Telegram saat ada anomali.

---

## 6. Modul Produk

Daftar modul di bawah ini mengikuti inventory fitur resmi:

- Core Platform: authentication, user management, role management, multi tenant, security.
- Dashboard: student, teacher, parent, admin.
- Academic Module: subject, classroom, schedule, assignment, learning material, library, upload/download module.
- Exam Module: create/update/delete exam, question bank, exam session, offline engine.
- Anti Cheat: visibility, blur, fullscreen, shortcut blocker, copy/paste block, devtools detection, violation counter.
- Teacher Monitoring: live status, live progress, live violation, online/offline status, auto refresh.
- Smart Incident Report: timeline, integrity score, PDF export.
- Exam Health Dashboard: internet/device/sync health.
- School Health Analytics: stability, success rate, sync time, benchmark.
- Gamification: leaderboard, achievements, hall of fame, XP, missions, rewards, student profile showcase.
- Analytics: student, teacher, subject, exam, progress, learning trend, reports.
- Monitoring: Better Stack, uptime, Discord/Telegram alert.
- Integration: Google Classroom, Google Login, Microsoft Login, SEB, Telegram, Discord.
- Admin System: tenant config, school config, feature toggle, theme config, role config.

---

## 7. Desain & Frontend

ARUS memakai arah visual biru muda / cyan dengan glassmorphism ringan, kartu putih semi-transparan, dan layout dashboard yang rapi serta informatif.

- Sidebar memakai grup navigasi, state aktif biru, dan bentuk yang tenang.
- Header bersifat sticky dan translucent.
- Login dan dashboard mengikuti radius lembut, shadow halus, serta komposisi kartu yang airy.
- ARUS tetap mempertahankan identitas visual yang konsisten, tetapi tenant tetap dapat memakai domain, logo, dan warna tema mereka sendiri sesuai kebutuhan enterprise.

Detail token visual, spacing, dan komponen dapat dilanjutkan di dokumen frontend UI/UX terpisah.

---

## 8. Testing & Monitoring

### Wajib

- Vitest untuk scoring, token ujian, dan logic anti-cheat.
- Playwright untuk alur end-to-end login sampai submit.
- ESLint dan Prettier sebagai quality gate.
- Load test sebelum pilot sekolah.

### Monitoring

- Better Stack / Uptime Kuma untuk ketersediaan layanan.
- Discord / Telegram webhook untuk error dan anomali.

### Opsional

- Sentry untuk error tracking frontend.
- PostHog untuk analytics produk.

---

## 9. Pembagian Peran Tim

| Peran | Tanggung Jawab |
|---|---|
| CEO | Onboarding sekolah dan negosiasi |
| CTO | Arsitektur, exam engine, anti-cheat, offline sync |
| Backend Engineer | Integrasi Supabase, endpoint, testing beban, dokumentasi teknis |

---

## 10. Roadmap

### Fase 1

| Tahap | CTO | Backend Engineer |
|---|---|---|
| 1 | Setup Next.js + Supabase, skema DB inti, RLS dasar | Auth Google Sign-In, seed data dummy |
| 2 | JSON bulk download ujian, UI render soal | Submit jawaban, validasi token |
| 3 | Visibility/Blur API + violation counter | Audit log + log realtime |
| 4 | Fullscreen enforcer + lock screen | Dashboard guru pelanggaran real-time |
| 5 | Zustand + IndexedDB offline state | Online/offline listener + banner |
| 6 | Auto-sync saat online kembali | Batch submit + final submit endpoint |
| 7 | Shortcut blocker dan anti-cheat hardening | Load test 50–100 siswa |
| 8 | E2E testing dan bug fixing | Stabilization pass |

### Fase 2

| Tahap | CTO | Backend Engineer |
|---|---|---|
| 9 | SEB gate route + validation | Middleware gatekeeper |
| 10 | Report generator client-side | Endpoint agregasi nilai |
| 11 | Redis leaderboard | Cron reset + Hall of Fame |
| 12 | Monitoring setup | Discord/Telegram alert |
| 13 | Google Classroom sync | Mapping data internal |
| 14 | Custom domain multi-tenant | Tenant config table |
| 15 | Security review + load test skala besar | Hardening & dokumentasi |

---

## 11. Catatan Penting

Supabase legacy `anon`/`service_role` key akan diganti ke sistem `publishable`/`secret` key. Implementasi baru harus mengikuti arahan ini sejak awal.

---

## 12. Backlog Masa Depan

- AI grading dan learning assistant.
- Mobile companion app.
- Push notification.
- Search engine terpisah.
- Video streaming pembelajaran.

