# ARUS 🌊

**LMS Sekolah oleh Aruthala Bangsa — Ujian Anti-Curang yang Tetap Jalan Walau Internet Sekolah Tidak Stabil**

> Status: Konsep / Dalam pengembangan frontend. Belum ada kode backend yang berjalan.
> Dokumen acuan resmi: [`requirements/ARUS_Spesifikasi_Final_v2.md`](./requirements/ARUS_Spesifikasi_Final_v2.md)

---

## Kenapa ARUS?

Tiga masalah utama LMS sekolah di Indonesia:

1. **Ujian sering gagal karena internet sekolah putus-putus** — ARUS menarik seluruh paket soal sekaligus di awal, menyimpan jawaban siswa secara lokal di browser via IndexedDB, jadi ujian tetap jalan walau Wi-Fi mati.
2. **Kecurangan ujian online sulit dipantau** — ARUS mendeteksi siswa pindah tab, keluar fullscreen, atau mencoba copy-paste/inspect element, dan mencatatnya sebagai pelanggaran real-time ke dashboard guru.
3. **Isolasi data antar sekolah** — ditegakkan lewat Row Level Security (RLS) di Supabase, bukan cuma filter di level aplikasi.

## Peran Pengguna

| Peran | Akses Utama |
|---|---|
| Siswa | Mengerjakan ujian, jadwal pelajaran, leaderboard, progress belajar |
| Guru | Membuat ujian, memantau pelanggaran real-time, dashboard kelas |
| Orang Tua | Memantau progress & nilai anak (read-only) |
| Admin Sekolah | Manajemen akun guru & siswa, konfigurasi ujian satu sekolah |
| Admin Yayasan | Manajemen multi-sekolah, laporan agregat |

## Tech Stack

**Layer inti (tidak boleh diganti tanpa diskusi tim):**

| Layer | Tools |
|---|---|
| Frontend framework | Next.js 15+ (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS Variables |
| Offline storage | IndexedDB (`idb`) + Service Worker (`next-pwa`) |
| Backend / DB | Supabase (PostgreSQL + RLS multi-tenant + Auth Google Sign-In) |
| File storage | Supabase Storage + Cloudflare CDN |
| Realtime | Supabase Realtime |
| Cache / Leaderboard | Upstash Redis (ZSET, pay-per-request) |
| Hosting | Vercel (Edge Functions) |
| Cron job | Vercel Cron Jobs |
| Report export | jsPDF / exceljs (diproses di sisi client) |
| Alerting | Discord / Telegram Webhook |
| Monitoring | Better Stack / Uptime Kuma |
| Exam lock (Fase 2) | Safe Exam Browser (SEB) + middleware User-Agent Gatekeeper |

**Layer frontend implementation** (tidak bertentangan dengan stack inti): shadcn/ui, Radix UI, Lucide Icons, Framer Motion, TanStack Query, Zustand, Recharts, FullCalendar, Vitest, Playwright, ESLint, Prettier, GitHub Actions, Figma.

> **Tidak ada** NestJS, Prisma, Mux, Socket.IO terpisah, atau backend server custom. Dokumen spesifikasi v2 secara eksplisit menggantikan draft-draft lama yang dibangun di atas stack tersebut.

## Struktur Project

```
aruthalaedu/
├── requirements/                 # Dokumen spesifikasi & mockup resmi
├── src/
│   ├── app/
│   │   ├── (auth)/login          # Login guru/admin (Google Sign-In)
│   │   ├── (auth)/siswa          # Login siswa
│   │   ├── (dashboard)/
│   │   │   ├── overview
│   │   │   ├── bank-soal/{buat,[id]}
│   │   │   ├── ujian/{buat,[id]/{monitor,hasil}}
│   │   │   ├── siswa/import
│   │   │   └── settings
│   │   └── ujian/[token]/mulai   # Exam room siswa
│   ├── components/
│   │   ├── layout/                # Sidebar, dll
│   │   └── ui/                    # GlassCard, StatCard, dll
│   ├── hooks/
│   ├── lib/
│   │   ├── exam/anti-cheat.ts
│   │   ├── exam/offline-storage.ts
│   │   ├── exam/sync-manager.ts
│   │   ├── export/excel-export.ts
│   │   ├── import/
│   │   ├── supabase/{client,server}.ts
│   │   └── utils.ts
│   ├── stores/examStore.ts        # Zustand exam state
│   ├── types/index.ts
│   └── middleware.ts
└── supabase/
    ├── functions/
    │   ├── exam-start/
    │   ├── exam-submit/
    │   ├── partner-api/
    │   └── student-login/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_rls_policies.sql
        └── 003_seed_data.sql
```

## Fitur — Fase 1 (Target: Juli 2026)

**Anti-Down Exam Engine**
- JSON Bulk Download — 1x hit database per siswa saat "Mulai Ujian"
- Offline-Ready State — IndexedDB sebagai persistensi utama, Zustand sebagai in-memory state, `localStorage` hanya untuk preferensi UI ringan
- Service Worker (`next-pwa`) — background sync + caching aset statis
- Auto-Sync Connection Listener — banner peringatan saat offline, auto-sync saat online kembali
- Batch/Final Submit — tiap 3 menit + saat klik Submit

**Browser-Level Anti-Cheat**
- Page Visibility & Blur API — deteksi pindah tab/minimize, violation counter, force-submit di threshold tertentu
- Fullscreen Enforcer — wajib fullscreen, keluar → halaman terkunci
- Input & Shortcut Blocker — blokir klik kanan, copy-paste, Inspect Element (F12)

**Backend Foundation**
- Supabase Multi-Tenant Auth (Google Sign-In) + RLS isolasi per `tenant_id`
- Vercel Edge Functions untuk validasi token ujian & rate limiting (server-side only)
- Supabase Storage + Cloudflare CDN untuk modul/tugas/foto
- `audit_logs` untuk mencatat perubahan data krusial

## Fitur — Fase 2 (Target: Agustus 2026 ke atas)

- Leaderboard mingguan real-time via Upstash Redis ZSET + reset otomatis via Vercel Cron
- OS-Level Lock Mode: rute `/exam-gate` + middleware User-Agent check untuk Safe Exam Browser
- Sinkronisasi Google Classroom API
- Multi-tenant custom domain per yayasan (satu aplikasi ARUS, tanpa white-label branding/tema custom)
- Export laporan (Excel/PDF) diproses client-side
- Alert otomatis Discord/Telegram untuk anomali

## Prinsip Arsitektur

- Supabase = backend utama (DB + Auth + Storage + Realtime). Vercel Edge Functions menangani logic yang tidak boleh ada di client. Tidak ada backend server custom.
- Isolasi multi-tenant lewat kolom `tenant_id` + RLS PostgreSQL.
- RBAC ditegakkan di dua lapis: RLS policy (baca tabel `users`/`profiles`) + middleware Next.js (cek session & role sebelum render).
- Business logic krusial (scoring, validasi token, deteksi pelanggaran) wajib di `lib/` atau `services/`, bukan langsung di komponen React.
- Offline-first: state krusial disimpan lokal dulu (IndexedDB), sync ke Supabase belakangan.
- Realtime lewat Supabase Realtime channel, bukan Socket.IO.

## Desain

Acuan visual resmi: mockup `requirements/Landing Page - Home Page.jpeg` — tema biru muda/cyan dengan gaya glassmorphism (kartu putih semi-transparan `backdrop-filter: blur` di atas background gradient biru). Detail lengkap ada di `StyleGuide.md`. Skema warna gelap (teal-700/slate-900) dari draft lama **sudah tidak berlaku**.

## Testing & Monitoring

**Wajib:** Vitest (unit test scoring, validasi token, deteksi pelanggaran), Playwright (E2E: login → mulai ujian → jawab → submit → nilai tersimpan), ESLint + Prettier (gate wajib sebelum merge `main`), Load test 50–100 siswa submit bersamaan (k6/Artillery) sebelum onboarding sekolah pilot.

**Monitoring:** Better Stack/Uptime Kuma untuk ketersediaan Supabase/Vercel/endpoint krusial; Discord/Telegram Webhook untuk error 5xx & kegagalan cron job.

**Opsional:** Sentry (error tracking frontend), PostHog (product analytics, setelah >1 sekolah aktif).

## Tim

| Peran | Tanggung Jawab |
|---|---|
| CEO | Roadmap negosiasi & onboarding sekolah paralel dengan development |
| CTO (Dennis) | Arsitektur sistem, exam engine, anti-cheat, offline sync, keputusan teknis akhir |
| Backend Engineer (Ko David) | API endpoint, integrasi Supabase, testing beban, dokumentasi teknis |

## Catatan Penting

Supabase akan **deprecate legacy `anon`/`service_role` key di akhir 2026**. Setup project ini wajib pakai sistem **`publishable`/`secret` key** yang baru sejak awal, biar tidak perlu migrasi di tengah jalan.

## Seed User Lokal

File [`seed_users.js`](./seed_users.js) sekarang membaca kredensial dari environment, bukan hardcoded di source. Tambahkan variabel berikut di `.env.local` untuk kebutuhan seeding lokal:

Template kosongnya tersedia di [`.env.example`](./.env.example).

```env
SEED_OWNER_EMAIL=
SEED_OWNER_PASSWORD=
SEED_SUPERADMIN_EMAIL=
SEED_SUPERADMIN_PASSWORD=
SEED_GURU_EMAIL=
SEED_GURU_PASSWORD=
```

Jangan simpan password nyata di dalam repository. Jika perlu akun contoh, pakai nilai lokal yang hanya ada di mesin pengembang.

## Roadmap Ringkas

Detail 15 tahap lengkap (Fase 1 & Fase 2, siapa ngerjain apa) ada di `Tasks.md`.

- **Fase 1** — 8 tahap, target Juli 2026: Auth, RBAC, Exam Engine, Anti-Cheat, Offline Sync
- **Fase 2** — 7 tahap, target Agustus 2026 ke atas: SEB Lock Mode, Redis Leaderboard, Google Classroom Sync, Multi-Tenant Custom Domain

## Dokumen Terkait

- [`PRD.md`](./PRD.md) — product requirements lengkap
- [`Tasks.md`](./Tasks.md) — breakdown task per tahap & per orang
- [`StyleGuide.md`](./StyleGuide.md) — panduan visual & komponen
- [`requirements/ARUS_Spesifikasi_Final_v2.md`](./requirements/ARUS_Spesifikasi_Final_v2.md) — dokumen acuan resmi

---

© 2026 Aruthala Bangsa. Platform dirancang sesuai UU PDP No. 27 Tahun 2022.
