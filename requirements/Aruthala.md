# What's Aruthala?

Aruthala Bangsa Indonesia adalah perusahaan teknologi yang berfokus membangun ekosistem digital tepercaya untuk sektor pendidikan dan kesehatan di Indonesia, dengan keamanan data dan integritas sistem sebagai fondasi utama setiap produknya.

Melalui Aruthala Edu (ARUS), perusahaan menghadirkan Learning Management System yang dirancang khusus untuk kebutuhan sekolah, dengan sistem ujian digital yang tetap dapat berjalan meski koneksi internet tidak stabil (offline-ready system) serta perlindungan berlapis terhadap kecurangan ujian.

Melengkapi sisi pendidikan formal, ItWorked hadir sebagai Training Management System yang membantu calon angkatan kerja mengasah keterampilan praktis sekaligus membangun kredibilitas profesional yang dapat langsung ditampilkan dalam CV.

Aruthala Medica memperluas komitmen perusahaan ke sektor kesehatan melalui solusi keamanan siber berbasis blockchain yang dirancang untuk melindungi data dan infrastruktur digital rumah sakit.

Ketiga produk ini mencerminkan visi Aruthala Bangsa Indonesia: menjadi mitra teknologi yang dapat diandalkan bagi institusi-institusi yang menjunjung tinggi keamanan, integritas, dan kepercayaan.

---

# Summary (ARUS)

## Fitur

### Phase 1: Core LMS & Client-Side Security

Fokus: validasi sistem ujian anti-down, kebal internet putus, dan proteksi kecurangan level browser.

#### 1. Anti-Down Exam Engine (Client-Side Centric)
- JSON Bulk Download: menarik seluruh paket soal (teks dan opsi) dalam satu file JSON besar di awal klik "Mulai Ujian".
- Offline-Ready State: menggunakan state management seperti Zustand/Pinia dan localStorage/IndexedDB untuk menyimpan jawaban siswa secara lokal.
- Auto-Sync Connection Listener: event listener online/offline. Jika internet putus, muncul banner peringatan. Begitu internet nyala lagi, sistem otomatis menyinkronkan isi localStorage ke Supabase.
- Batch/Final Submit: mekanisme pengiriman jawaban ke database yang dicicil per 3 menit atau dikirim sekaligus di akhir submit.

#### 2. Browser-Level Anti-Cheat
- Page Visibility & Blur API: mendeteksi jika siswa pindah tab, meminimalkan browser, atau membuka aplikasi lain. Sistem menghitung jumlah pelanggaran dan bisa otomatis force-submit.
- Fullscreen Enforcer: memaksa halaman ujian masuk mode layar penuh. Jika siswa keluar dari mode ini, sistem mengunci halaman dan memberi peringatan.
- Input & Shortcut Blocker: memblokir fungsi klik kanan, salin-tempel, dan tombol Inspect Element.

#### 3. Backend Foundation & Core LMS
- Supabase Multi-Tenant Auth: login menggunakan Google Sign-In akun sekolah. Data antar sekolah diisolasi total menggunakan Row Level Security (RLS) di PostgreSQL.
- Library & Asset Storage: manajemen file modul, tugas, dan foto menggunakan Supabase Storage yang di-cache lewat Cloudflare.
- Database Audit Log: tabel internal audit_logs di Supabase untuk merekam perubahan data krusial.

### Phase 2: Scale-Up, Gamification & Enterprise Layer

Fokus: optimasi performa masal, integrasi pihak ketiga, dan fitur enterprise untuk tingkat yayasan.

#### 1. High-Performance Gamification (Leaderboard)
- Weekly Sorted Sets (Upstash Redis): menyimpan dan menghitung ranking siswa secara real-time di dalam RAM (Redis ZSET).
- Weekly Reset via Vercel Cron Jobs: berjalan setiap Minggu malam jam 23:59 untuk menarik data nilai mingguan, memindahkan juara ke Hall of Fame, dan me-reset papan peringkat Redis.

#### 2. OS-Level Lock Mode (SEB Integration)
- Dedicated Exam Gate (/exam-gate): rute khusus yang steril, terpisah dari halaman harian.
- User-Agent Gatekeeper: middleware yang mendeteksi browser. Jika siswa mencoba membuka link ujian lewat browser biasa, akses otomatis ditolak dan dipaksa menggunakan Safe Exam Browser (SEB) atau Exambrowser.

#### 3. Enterprise Feature & White-Labeling
- Google Classroom (GCR) API Sync: fitur sekali klik untuk menarik nilai tugas dari Google Classroom ke dalam ekosistem LMS.
- Multi-Tenant Custom Domain: yayasan bisa pakai domain sendiri, lengkap dengan logo dan kustomisasi warna tema mereka sendiri.
- Client-Side Report Generator: ekspor nilai menjadi file Excel atau PDF yang diproses langsung di laptop user dengan jsPDF / exceljs.
- Discord/Telegram Alerting Webhook: notifikasi otomatis jika ada anomali seperti serangan DDoS atau kegagalan sinkronisasi cron job.

---

## Technical

### Tech Stack Final (Konsolidasi dari Semua Obrolan)

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 15+ (App Router), Zustand, Tailwind |
| Offline storage | IndexedDB (pakai wrapper idb) + Service Worker (next-pwa) |
| Backend/DB | Supabase (Postgres + RLS multi-tenant + Auth Google Sign-In) |
| Cache/Leaderboard | Upstash Redis (ZSET, pay-per-request) |
| Hosting | Vercel (Edge Functions) / Hostinger / Cloudflare Workers sebagai alternatif |
| File storage | Supabase Storage / Cloudflare CDN |
| Cron | Vercel Cron Jobs |
| Report export | jsPDF / exceljs (client-side) |
| Alerting | Discord/Telegram Webhook |
| Monitoring | Better Stack / Uptime Kuma |
| Exam lock | SEB + User-Agent Gatekeeper middleware |

Catatan penting dari riset: Supabase akan deprecate legacy anon/service_role key di akhir 2026, jadi setup awal perlu memakai sistem publishable/secret key yang baru.

### Pembagian Peran

- CEO: menjalankan roadmap negosiasi secara paralel.
- CTO: arsitektur, fitur paling kompleks/krusial seperti exam engine, anti-cheat, dan offline sync.
- Backend Dev: API/endpoint, integrasi database, testing, dan dukungan ke CTO.

### FASE 1

| Sprint | CTO | Backend Dev | CEO (paralel) |
| --- | --- | --- | --- |
| 1 | Setup Next.js + Supabase project, skema DB inti, RLS dasar | Auth Google Sign-In, seed data dummy 1 sekolah | Finalisasi materi pitch, mulai pendekatan sekolah |
| 2 | JSON bulk download ujian, UI render soal | Endpoint submit jawaban, validasi token ujian | Lanjut approach sekolah, siapkan NDA/pilot agreement |
| 3 | Anti-cheat: Visibility/Blur API + violation counter | Audit log table + log realtime ke Supabase | Demo internal pertama |
| 4 | Fullscreen Enforcer + lock screen | Dashboard guru (lihat pelanggaran real-time) | Outreach sekolah |
| 5 | Offline state: Zustand + skema IndexedDB | Event listener online/offline + banner UI | Susun kontrak pilot |
| 6 | Auto-sync saat online kembali (background sync) | Batch submit per 3 menit + final submit endpoint | Persiapan onboarding pilot |
| 7 | Input/Shortcut blocker (klik kanan, F12, Ctrl+C/V) | Load test simulasi 50-100 siswa submit bersamaan | Training guru/TU |
| 8 | End-to-end testing dengan data nyata | Bug fixing menyeluruh | Onboarding resmi sekolah pilot |

### FASE 2

| Sprint | CTO | Backend Dev |
| --- | --- | --- |
| 9 | SEB: route /exam-gate + config key validation (server-side, bukan cuma UA string) | Middleware gatekeeper + fallback messaging |
| 10 | Client-side report generator (jsPDF/exceljs) | Endpoint agregasi data nilai per kelas |
| 11 | Upstash Redis ZSET leaderboard | Vercel Cron weekly reset + Hall of Fame |
| 12 | Better Stack/Uptime Kuma setup | Discord/Telegram webhook anomali |
| 13 | Google Classroom API sync dasar | Mapping data GCR ke skema internal |
| 14 | Multi-tenant custom domain + theming | Tenant config table |
| 15 | Security review + load test skala lebih besar | Hardening & dokumentasi teknis |

---

## UI/UX

### FASE 1 — UI/UX (Fundamental & Advanced)

| Sprint | Task UI/UX |
| --- | --- |
| 1 | Desain tampilan web utama (landing page, value prop, navigasi dasar) |
| 2 | Desain login siswa (wireframe + hi-fi mockup) |
| 3 | Desain login guru |
| 4 | Desain login orang tua murid |
| 5 | Desain UI render soal & opsi jawaban ujian |
| 6 | Desain banner anti-cheat (visibility/blur) + lock screen fullscreen-exit |
| 7 | Desain dashboard guru (log pelanggaran) + banner online/offline + indikator sync |
| 8 | Polish UI keseluruhan + aksesibilitas dasar + usability test dengan siswa/guru pilot |

| Sprint | Task UI/UX |
| --- | --- |
| 9 | Wireframe low-fidelity: flow ujian (login → mulai ujian → soal → submit) |
| 10 | Desain UI render soal & opsi jawaban (mobile-first, responsive) |
| 11 | Desain banner peringatan anti-cheat (visibility/blur warning) |
| 12 | Desain lock screen fullscreen-exit + dashboard guru (log pelanggaran) |
| 13 | Desain banner status online/offline |
| 14 | Desain indikator sync (syncing / synced / pending / failed) |
| 15 | Polish UI keseluruhan + cek aksesibilitas dasar (kontras, ukuran tap target) |
| 16 | Usability test langsung dengan siswa/guru pilot, revisi cepat |

### FASE 2 UI/UX

| Sprint | Task UI/UX |
| --- | --- |
| 17 | Desain UI exam gate (SEB) + pesan error kalau bukan SEB |
| 18 | Desain tampilan export report (preview sebelum download) |
| 19 | Desain leaderboard + Hall of Fame |
| 20 | Desain dashboard monitoring (admin-facing) |
| 21 | Desain UI sinkronisasi GCR (status import nilai) |
| 22 | Desain sistem theming/white-label (logo & warna custom per yayasan) |
| 23 | Final UI audit + konsistensi desain sebelum demo ke RekanSekolah |

---

## Tech Stack (Recommend)

ARUS Tech Stack (Recommended):

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide Icons.
- UI & Animation: Framer Motion, GSAP, Lottie, Motion One, CSS Glassmorphism, CSS Variables.
- State Management: TanStack Query, Zustand.
- Backend: NestJS, REST API (atau GraphQL jika diperlukan).
- Database & ORM: PostgreSQL, Prisma ORM.
- Authentication: Better Auth (atau Auth.js), OAuth Google & Microsoft, JWT, Refresh Token, Magic Link.
- Storage: Cloudflare R2 (atau AWS S3).
- Video Streaming: Mux (atau Bunny Stream / Cloudflare Stream).
- Realtime: Socket.IO, Supabase Realtime.
- Charts & Analytics: Recharts, Tremor.
- Calendar: FullCalendar.
- Search: Meilisearch (atau Algolia).
- Notifications: Firebase Cloud Messaging, OneSignal, Resend.
- Monitoring & Analytics: Sentry, PostHog, Vercel Analytics.
- DevOps & Deployment: Docker, GitHub Actions, Vercel, Railway atau Google Cloud Run, Cloudflare CDN.
- Design System: Figma, Storybook, Design Tokens, Inter/Geist Variable Font.
- Mobile: React Native, Expo.
- AI (Opsional): OpenAI API, LangChain, Pinecone, Vercel AI SDK.
- Testing: Vitest, Playwright, Cypress, ESLint, Prettier.
- Architecture: Multi-tenant SaaS, Clean Architecture, Repository Pattern, RBAC, API-first Design.