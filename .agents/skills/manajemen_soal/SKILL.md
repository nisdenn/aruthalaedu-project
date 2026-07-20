---
name: Manajemen Soal & Ujian (AruthalaEdu)
description: Panduan dan aturan wajib untuk AI saat mengembangkan fitur terkait manajemen soal, ujian, dan engine ujian offline di AruthalaEdu.
---

# Skill: Manajemen Soal & Ujian (AruthalaEdu)

## 1. Arsitektur Exam Engine (Anti-Down)
- **JSON Bulk Download:** Saat siswa memulai ujian, sistem WAJIB mengunduh seluruh paket soal dalam satu kali pemanggilan database (*1x hit DB*). Dilarang melakukan *fetch* per-nomor soal untuk mengurangi beban server.
- **Offline-Ready (IndexedDB):** Penyimpanan jawaban ujian dan *state* soal saat siswa mengerjakan WAJIB menggunakan IndexedDB (bisa via modul wrapper yang sudah ada di `lib/exam/offline-storage.ts`).
- **Zustand State:** Gunakan Zustand (`stores/examStore.ts`) sebagai *in-memory state* selama ujian berlangsung. Jangan hanya mengandalkan *state* komponen React biasa untuk soal.

## 2. Struktur Data Soal
- Saat merancang tabel Supabase atau antarmuka TypeScript untuk "Soal", pastikan strukturnya mendukung tipe soal *multiple choice* maupun format masa depan.
- Pertimbangkan penyimpanan aset gambar pada soal (harus terhubung dengan *Supabase Storage* + CDN Cloudflare sesuai standar arsitektur).

## 3. Sinkronisasi (Auto-Sync)
- Jawaban yang tersimpan di IndexedDB secara lokal akan disinkronisasikan ke backend secara berkala (tiap 3 menit) menggunakan mekanisme di *Background Sync* / Service Worker. AI wajib memperhatikan *Auto-Sync Connection Listener* agar *banner* mode offline/online berfungsi.

## 4. Keamanan & Anti-Cheat 
- Logika penskoran akhir, validasi token ujian, dan verifikasi kecurangan (tab berpindah, dsb.) WAJIB dilakukan atau diverifikasi melalui **Vercel Edge Functions** di sisi server, BUKAN hanya di sisi *client/browser*.

## 5. UI/UX Ujian
- Wajib menggunakan komponen dari Shadcn/UI (seperti GlassCard) sesuai dengan acuan tema (biru muda/cyan, *glassmorphism*). Dilarang menggunakan skema tema gelap bawaan tanpa konfirmasi.
