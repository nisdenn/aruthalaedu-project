# Changelog & History Log
Semua perubahan (Updates, Bug Fixes, New Features) pada Dasbor AruthalaEdu akan didokumentasikan di sini untuk mempermudah pelacakan.

---

## [2026-07-20] - Integrasi Backend Layanan Sekolah & Sidebar Siswa
### Ditambahkan & Diperbarui (Added & Updated)

#### Poin 1: Modifikasi Sidebar Siswa
- **File:** `src/components/layout/Sidebar.tsx`
- **Komponen/Fungsi:** Array `studentSections`
- **Alasan Teknis:** Memasukkan menu "Layanan Sekolah" ke dalam sidebar siswa sehingga siswa dapat mengakses halaman `/materi`, `/perpus`, `/kesiswaan`, dan `/absen`. Halaman ini disesuaikan dengan Role Based Access Control (RBAC) agar siswa hanya dapat melihat data miliknya sendiri atau data yang diperuntukkan bagi sekolahnya.

#### Poin 2: Pembuatan Skema Database Supabase
- **File:** `supabase/migrations/007_layanan_sekolah.sql` (dan eksekusi via Supabase Client/MCP)
- **Komponen/Fungsi:** Pembuatan tabel baru (`attendance`, `materials`, `library_books`, `library_loans`, `announcements`, `extracurriculars`, `extracurricular_members`).
- **Alasan Teknis:** Menggantikan *mock data* di UI buatan Denis dengan tabel nyata di Supabase. Tabel dikonfigurasi dengan *Row Level Security* (RLS) berdasarkan `sekolah_id` (multi-tenancy) dan `yayasan_id` untuk memastikan isolasi dan keamanan data antar sekolah.

#### Poin 3: Integrasi UI Halaman Absen
- **File:** `src/app/(dashboard)/absen/page.tsx` & `src/app/(dashboard)/data-absen/page.tsx`
- **Komponen/Fungsi:** Konversi ke *client component*, penggunaan `createClient` Supabase, integrasi `useDashboardIdentity`.
- **Alasan Teknis:** `/absen` dimodifikasi agar menampilkan absensi khusus untuk siswa yang login, dan menampilkan form input (modal) absensi khusus untuk Admin/Guru. `/data-absen` disempurnakan dengan *fetch* asli dari tabel `attendance` dengan filter kelas dan bulan/tahun, menggantikan perhitungan *mock*.

#### Poin 4: Integrasi UI Materi, Perpus, dan Kesiswaan
- **File:** `src/app/(dashboard)/materi/page.tsx`, `src/app/(dashboard)/perpus/page.tsx`, `src/app/(dashboard)/kesiswaan/page.tsx`
- **Komponen/Fungsi:** Konversi ke *client component*, logika *fetch* dan form unggah/tambah.
- **Alasan Teknis:** Halaman Materi, Perpus, dan Kesiswaan sekarang terhubung ke database asli. Guru dapat menginput materi/buku/pengumuman lewat form yang disematkan secara kondisional, dan siswa dapat membaca *record* langsung dari Supabase berkat RLS.

#### Poin 5: Perbaikan Definitif UI Native Select (Global)
- **File:** `src/app/globals.css` & `src/app/(dashboard)/schedule/ScheduleModal.tsx`
- **Komponen/Fungsi:** Override mutlak `color-scheme` dan `appearance` pada elemen `<select>` secara global, serta penguatan kelas warna Tailwind.
- **Alasan Teknis:** Memperbaiki insiden kilat hitam (*black flash*) pada dropdown `<select>` di *browser* Windows (Dark Mode). Solusi sebelumnya belum mencukupi karena OS masih merender *native frame* sebelum *hydration* selesai. Solusi terbaru memaksa instruksi `color-scheme: light only !important;` serta `-webkit-appearance: none;` untuk 100% mengambil alih kontrol perenderan dari OS, sehingga menjamin kedipan warna tidak akan pernah terjadi lagi di komponen modal mana pun.

#### Poin 6: Pencegahan Fatal Data Loss pada CBT Engine
- **File:** `src/app/e/[id]/mulai/page.tsx`
- **Komponen/Fungsi:** Fungsi `doSubmit`
- **Alasan Teknis:** Memperbaiki celah potensi hilangnya nilai ujian (Silent Failure) akibat *error* jaringan tak terduga (*Network Exceptions*) atau masalah validasi pembaruan Supabase. Menambahkan blok `try...catch` berlapis serta *error checking* (`{ error: submitErr }`). Segala jenis *error* yang mencegah pengumpulan akan otomatis diarahkan masuk ke fungsi `offline-storage` (`markSessionPendingSync`), memastikan tidak ada satupun pekerjaan siswa yang hilang.

#### Poin 7: Penyesuaian Reponsivitas (*Mobile-First*) Ruang Ujian CBT
- **File:** `src/app/e/[id]/mulai/page.tsx`
- **Komponen/Fungsi:** Tata Letak (*Layout*), Header, Area Soal, dan Tombol Navigasi.
- **Alasan Teknis:** Memperkuat keamanan visual (*Responsive Design*) untuk mencegah elemen tumpang tindih (*overlap*) atau melebih batas (*overflow*) saat dibuka melalui gawai kecil. Mengimplementasikan `break-words`, `overflow-x-auto` pada teks soal, memendekkan label tombol di layar kecil ("Sebelumnya" menjadi "Prev", dll.), dan menerapkan konfigurasi penumpukan baris tabel (*stack grid*) pada ringkasan hasil penyelesaian. Ruang Ujian kini 100% aman dimainkan lintas-platform.

---

## [2026-07-15] - Architectural Decision Records (ADR) dari Sesi Penyelarasan `/grill-me`
### Keputusan Arsitektur & Logika Bisnis Sistem pasca-Publikasi (*Live Release Standard*)
- **ADR-001 (Manajemen Multi-Sekolah / Onboarding Tenant):** Menerapkan model **Centralized Onboarding**. Hanya Super Admin di *Admin Hub* (`/admin-hub`) yang memiliki otorisasi untuk mendaftarkan institusi sekolah baru beserta akun Kepala Sekolah. Pendaftaran mandiri (*self-service*) dinonaktifkan demi menjamin keamanan data, validasi lisensi instansi, dan mencegah pembuatan tenant palsu.
- **ADR-002 (Penindakan Real-time Kecurangan Ujian CBT - Standar ANBK):** Menerapkan protokol **Auto-Lock dengan Buka Kunci Pengawas (*Hybrid Enforcement*)**. Jika siswa melampaui batas toleransi pelanggaran (*tab-switching* / keluar *fullscreen* > 3 kali), layar ujian siswa akan terkunci otomatis secara *real-time*. Siswa tidak dipaksa diskualifikasi permanen saat itu juga, namun hanya bisa melanjutkan setelah Guru/Pengawas menekan tombol "Buka Kunci / Reset Peringatan" pada layar pengawasan di *Monitoring Center*.
- **ADR-003 (Publikasi Nilai & Pembahasan Soal - Controlled Release):** Menerapkan kebijakan **Controlled Release (*Publikasi Terkontrol Guru*)**. Begitu siswa mengumpulkan pengerjaan CBT, layar hanya menampilkan status *Berhasil Dikumpulkan (Menunggu Rilis Pengawas)*. Nilai akhir (termasuk hasil koreksi esai) serta pembahasan butir soal baru terbuka di dasbor Siswa setelah Guru menekan tombol **"Publikasikan Nilai Akhir"** di *Teacher Report*, demi mencegah kebocoran jawaban antarruang/sesi ujian.

---

## [2026-07-15] - Implementasi Penuh Keputusan Arsitektur (ADR) pasca-Grillme
### Ditambahkan & Diperbarui (Added & Updated)
- **Implementasi ADR-001 (Centralized Onboarding):** Menambahkan formulir *Pendaftaran Sekolah Baru (Tenant)* secara fungsional di halaman *Admin Hub* (`/admin-hub`). Seluruh pembuatan sekolah sekarang difokuskan ke menu ini dan dimasukkan ke tabel `sekolah`. Halaman registrasi mandiri (`/register`) diblokir permanen.
- **Implementasi ADR-002 (Auto-Lock Pengawas):** 
  - Melakukan migrasi database untuk menambahkan kolom `is_proctor_locked` pada tabel `exam_sessions`.
  - Memodifikasi skrip *Anti-Cheat* (`anti-cheat.ts`) untuk memanggil callback `onProctorLock` saat pelanggaran melampaui ambang batas, yang mengunci sesi ujian Siswa secara *server-side*.
  - Menambahkan *Real-Time Polling* di Ruang Ujian Siswa (`src/app/e/[id]/mulai/page.tsx`) agar layar ujian terkunci total dan memunculkan *Overlay Merah* hingga pengawas turun tangan.
  - Menambahkan antarmuka **Sesi Terkunci (Menunggu Pengawas)** lengkap dengan tombol **"Buka Kunci Sesi"** di *Monitoring Center* Guru (`/monitoring-center`) agar pengawas dapat mereset ujian siswa yang ditandai.
- **Implementasi ADR-003 (Controlled Release):** 
  - Menetapkan kebijakan default pembuatan ujian (`ujian/buat`) dengan merubah field `show_result_after` menjadi `"manual"`.
  - Halaman Hub Siswa (`/student-hub`) kini menyembunyikan nilai akhir menjadi lencana **"Menunggu Rilis"** jika status visibilitas nilai masih manual.
  - Halaman Ruang Ujian (layar dikumpulkan) dimodifikasi untuk murni menampilkan status pengumpulan tanpa memuat *score*.
  - Menambahkan tombol **"Publikasikan Nilai ke Siswa"** yang bergaya Denis UI di halaman Hasil Ujian (`ujian/[id]/hasil/HasilClient.tsx`), memungkinkan Guru merilis nilai secara terkontrol kapan saja.

---

## [2026-07-15] - Audit Otonom Penempatan Data, Resolusi Nama Sekolah (`sekolahName`), & Keamanan Multi-Lapisan RoleGuard
### Ditambahkan & Diperbarui (Added & Updated)
- **Resolusi Otomatis Nama Sekolah (`useDashboardIdentity.ts` & `useUserRole.ts`):** Mengganti penempatan data mentah UUID `sekolah_id` (seperti `22222222-2...`) dengan **Nama Sekolah** yang dapat dibaca manusia (`SMA Negeri 1 Aruthala`, `SMA Negeri 1 Aruthala (Utama)`, atau dari tabel `sekolah`).
- **Audit & Koreksi Halaman Profil (`src/app/(dashboard)/profile/page.tsx`):** Memperbaiki kartu informasi yang sebelumnya menampilkan `ID Sekolah` mentah menjadi `Nama Sekolah` yang ter-resolve secara dinamis, sehingga tidak ada lagi UUID terpotong yang bocor ke UI.
- **Standarisasi Kode Sesi & Ujian (`incident-report`, `schedule`, `teacher-hub`, `student-hub`, `user-management`):** Mengubah tampilan ID mentah menjadi label kode referensi resmi (`#REF` / `Kode Ujian #A1B2C3D4`), serta menampilkan nama sekolah yang rapi pada tabel manajemen pengguna.
- **Penutupan Celah Otorisasi Multi-Lapisan (`RoleGuard.tsx` & `middleware.ts`):** 
  - Menutup kerentanan *initial loading bypass* di `RoleGuard.tsx` dengan menampilkan status pemuatan keamanan (`Memverifikasi Hak Otorisasi & Akses Pengguna...`) saat *hook* belum selesai memuat identitas pada rute tertutup.
  - Memperkuat daftar pemblokiran rute Siswa (`RESTRICTED_FOR_STUDENTS`) agar mencakup seluruh modul administrasi termasuk `/data-siswa`, `/akademik`, `/laporan`, dan `/settings`.
  - Memperkuat daftar pemblokiran rute Guru (`RESTRICTED_FOR_TEACHERS`) agar tidak dapat mengakses konfigurasi inti atau import data massal khusus Super Admin.

---

## [2026-07-15] - Redesain Total Ruang Ujian Siswa (CBT ANBK Standard & Denis UI Style)
### Ditambahkan & Diperbarui (Added & Updated)
- **Overhaul Ruang Ujian Siswa (`src/app/e/[id]/mulai/page.tsx`):** Merombak tampilan pengerjaan soal yang sebelumnya berlatar hitam pekat kaku (`#07090E`) dengan ruang kosong berlebihan menjadi **Computer Based Test (CBT) Profesional Standar ANBK / UTBK Modern** dengan gaya desain bersih Denis (`#f8fbff`, kartu putih `#ffffff`, border `#e3ebfa`, palet biru `#2f66e9`).
  - **Sticky Top CBT Header:** Menampilkan emblem proteksi, judul ujian, mata pelajaran, serta **Countdown Timer Pill** berdetak secara *real-time* (berubah warna menjadi amber/merah disertai animasi berdenyut saat waktu kritis < 5 menit).
  - **Tata Letak 2 Kolom Asimetris (Split Layout):** Kolom utama (`col-span-3`) memuat kartu butir soal berukuran proporsional, teks soal beresolusi tinggi yang jernih, pilihan ganda interaktif berlabel huruf (`A, B, C, D`), benar-salah, atau esai. Kolom kanan (`col-span-1`) memuat **Peta Navigasi Soal (Grid Question Map)** yang interaktif dengan indikator warna jelas (*Biru = Dijawab*, *Amber = Ragu-ragu*, *Abu = Belum*, *Ring = Posisi saat ini*).
  - **Fitur Tandai Ragu-ragu & Modal Konfirmasi Pengumpulan:** Siswa kini dapat menandai soal yang meragukan dengan ikon `Bookmark` serta akan mendapatkan peringatan modal konfirmasi elegan sebelum mengumpulkan ujian apabila masih ada butir soal yang kosong.
- **Overhaul Gerbang Ujian (`src/app/e/[id]/page.tsx`):** Menyelaraskan tampilan gerbang masuk ujian agar seragam dengan desain Denis modern, memuat indikator proteksi (*Fullscreen*, *Anti-Tab*, *Offline Ready*), tata tertib rinci, dan kotak persetujuan integritas akademik.

---

## [2026-07-15] - Pembersihan Emoji & Standarisasi UI Profesional (Restorasi Gaya Denis)
### Diperbarui (Updated & Standardized)
- **Restorasi Gaya & Eliminasi Emoji (`teacher-hub`, `student-hub`, `schedule`, `leaderboard`, `teacher-report`, `student-report`, `notifications`, `Header`):** Menghapus seluruh emotikon/emoji informal dari judul halaman, tab filter, dan isi tabel untuk menjaga keanggunan serta formalitas aplikasi edukasi sekolah.
- **Konsistensi Gaya Denis:** Mengembalikan struktur header card (`card card-padding`), tombol aksi (`btn-primary`, `btn-secondary`), border halus (`#e3ebfa`), serta secara eksklusif menggunakan ikon minimalis dari `lucide-react` (`MonitorPlay`, `ClipboardList`, `Trophy`, `ShieldAlert`, `CheckCircle2`) tanpa dekorasi berlebihan.

---

## [2026-07-15] - Audit & Overhaul Penataan Tabel + Filter Tab di Seluruh Modul Guru & Siswa
### Ditambahkan & Diperbarui (Added & Updated)
- **Overhaul Hub Guru (`teacher-hub/page.tsx`):** Menata ulang data ujian dan pemantauan menjadi tabel responsif (`overflow-x-auto`) berstruktur rapi dengan **Filter Tab Interaktif** (*🌟 Semua Ujian*, *🟢 Aktif / Live*, *📝 Draft*, dan *🚨 Log Pelanggaran*). Tab Log Pelanggaran merender tabel investigasi anti-cheat yang memuat ID Kejadian, Tipe Pelanggaran, Waktu Kejadian, serta tombol aksi cepat ke *Monitoring Center*.
- **Overhaul Hub Siswa (`student-hub/page.tsx`):** Menata ulang riwayat pengerjaan ujian siswa menjadi tabel berpresisi tinggi dengan **Filter Tab Interaktif** (*🌟 Semua Sesi*, *⏳ Sedang Dikerjakan*, *✅ Selesai Dikoreksi*). Setiap baris merender judul ujian, mata pelajaran, nomor percobaan, badge status, jumlah pelanggaran, skor akhir, dan tombol lanjutan.
- **Overhaul Jadwal Akademik (`schedule/page.tsx`):** Menambahkan **Filter Tab** (*🌟 Semua*, *🟢 Live/Publik*, *📝 Draft*) serta kontrol **View Mode Toggle** (*Tabel vs Kartu*). Pada mode tabel, alokasi waktu dan status jadwal tertata presisi di tengah/kanan dengan tautan langsung ke halaman pengerjaan soal.
- **Overhaul Leaderboard Real-Time (`leaderboard/page.tsx`):** Menambahkan fitur **Pencarian Nama Siswa/Kelas**, **Filter Tab** (*🌟 Semua*, *🔥 Top 10*, *👑 Top 3*), dan **View Mode Toggle** (*Tabel Klasemen vs Kartu*). Penempatan lambang piala, rank badge, serta kalkulasi poin (XP) tertata sangat rapi dan mudah di-scan.
- **Overhaul Lapor Guru (`teacher-report/page.tsx`) & Lapor Siswa (`student-report/page.tsx`):** Memperbaiki penataan (*placement*) kolom transkrip nilai, predikat kelulusan (*A, B+, B*), dan rekapitulasi ujian dengan **Filter Tab Mapel** dan kontrol tampilan (*Table vs Grid*) yang estetik dan bersinkronisasi langsung dengan `exam_sessions`.

---

## [2026-07-15] - UI Overhaul Pusat Notifikasi, Integrasi Siaran Real-time di Header, & Fitur "Remember Me"
### Ditambahkan & Diperbarui (Added & Updated)
- **Overhaul Tampilan Portal Notifikasi (`notifications/page.tsx`):** Menata ulang halaman `/notifications` menjadi antarmuka bergaya *Compact Card Feed* berteknologi *glassmorphism* modern. Menghilangkan tabel/teks yang terlalu padat dan menggantinya dengan **Interactive Filter Tabs** (*Semua Notifikasi*, *📢 Siaran Admin*, *🎓 Akademik & Ujian*, *🚨 Peringatan Keamanan*), statistik ringkas di atas, dan kartu-kartu notifikasi yang bersih, elegan, dan ringan dibaca.
- **Integrasi Siaran Global di Lonceng Header (`Header.tsx`):** Mengganti daftar notifikasi statis pada *dropdown* lonceng atas kanan dengan pemanggilan dinamis ke tabel `system_announcements`, `exams`, dan `exam_violations`. Lonceng kini memunculkan indikator merah berdenyut (*pulse badge*) secara akurat begitu Admin mengirim siaran baru, dan merender *popup glassmorphism* yang langsung menampilkan pesan siaran resmi di urutan teratas.
- **Fitur "Remember me" (Ingat Saya) di Halaman Login (`login/page.tsx`):** Menambahkan kotak centang interaktif **"Ingat saya"**. Ketika dipilih, sistem menyimpan preferensi dan alamat email pengguna di *localStorage (`aruthala_saved_email` & `aruthala_remember_me`)* sehingga email otomatis terisi saat kunjungan berikutnya.

### Optimasi Kinerja & Pembersihan (Performance & Cleanup)
- **Query Optimization (`Header.tsx` & `notifications/page.tsx`):** Membatasi *select* hanya pada kolom-kolom esensial (`id, title, content, created_at, type, target_type`) serta membatasi *limit* data maksimum per *fetch* (*limit 5-12*), mencegah *overfetching* dan membuat dasbor beroperasi sangat ringan serta cepat (*blazing fast*).

---

## [2026-07-15] - Console Pengirim Notifikasi Real-Time & Pengetatan Khusus Admin Hub
### Ditambahkan (Added)
- **Tabel `system_announcements` di Supabase:** Membuat tabel baru bersinkronisasi RLS untuk menampung siaran pengumuman dengan kolom `target_type` (`GLOBAL`, `SCHOOL`, `ROLE_SISWA`, `ROLE_GURU`, `PRIVATE`), `target_sekolah_id`, dan `target_user_id`.
- **Console Siaran Notifikasi (Broadcast Console) di `/admin-hub`:** Menambahkan formulir interaktif di Hub Admin di mana Administrator dapat memilih target sasaran (Semua Sekolah, 1 Sekolah tertentu, Khusus Siswa/Guru, atau Akun Pribadi tertentu), menentukan prioritas pesan (`info/success/warning/alert`), dan menerbitkannya secara *real-time*. Serta dilengkapi riwayat siaran aktif dengan fitur *Delete* untuk menarik pesan salah kirim.
- **Integrasi Siaran ke Portal Notifikasi (`/notifications`):** Halaman notifikasi kini menyertakan pesan siaran dari Admin di baris teratas dengan penanda eksklusif `📢 [Siaran Admin]`, yang disaring akurat berdasarkan sekolah (`sekolah_id`), role, ataupun ID pribadi pengguna yang sedang login.

### Diperbaiki & Diubah (Fixed & Changed)
- **Proteksi Ganda Khusus Admin Hub (`middleware.ts` & `RoleGuard.tsx`):** Menambahkan `/settings` dan `/monitoring-center` ke dalam daftar `RESTRICTED_FOR_TEACHERS`, serta memperkuat pembatasan rute sehingga Guru biasa (`GURU`) maupun Siswa (`SISWA`) **sama sekali tidak dapat membuka** Hub Admin, Manajemen Pengguna, atau Pengaturan Sekolah, baik lewat URL langsung maupun navigasi *client*.

---

## [2026-07-15] - Penataan Ulang Keamanan Rute (RBAC), Isolasi Penuh Notifikasi, & Proteksi Bypass Sesi
### Ditambahkan (Added)
- **Middleware Security Guard (`middleware.ts`):** Implementasi proteksi rute di level *Next.js Edge Middleware*. Sistem secara otomatis memblokir dan mengalihkan (*redirect* ke `/overview`) jika akun Siswa mencoba mengakses URL rute Admin (`/admin-hub`, `/user-management`, `/monitoring-center`, `/reports`, `/features`, `/settings`, dll.).
- **Client-Side RoleGuard (`RoleGuard.tsx` & `DashboardShell.tsx`):** Menambahkan lapisan proteksi komponen klien untuk mencegah kebocoran saat navigasi SPA/React Router. Jika Siswa membuka rute terlarang via URL langsung, sistem merender halaman 403 Forbidden (*Akses Ditolak*) yang elegan sesuai standar UI Denis.
- **Dinamisasi Tipe Sesi (`useUserRole.ts` & `useDashboardIdentity.ts`):** Mengubah `UserSession.role` menjadi `string` fleksibel sehingga mencakup otorisasi `SUPER_ADMIN`, `KEPALA_SEKOLAH`, `GURU`, dan `SISWA` tanpa konflik pemetaan peran di *Header* maupun *Sidebar*.

### Diperbaiki & Diubah (Fixed & Changed)
- **Kebocoran Notifikasi Siswa (`notifications/page.tsx` & `Header.tsx`):** Memisahkan secara total aliran notifikasi berdasarkan role. Siswa kini **tidak lagi melihat** *Draft Ujian* milik guru ataupun log *Pelanggaran Terdeteksi* pengawas. Siswa hanya melihat notifikasi **Ujian Baru Tersedia**, **Jadwal Ujian**, dan **Hasil Skor Ujian Rilis**.
- **Isolasi Menu Sidebar Siswa (`Sidebar.tsx`):** Menghapus rute `/features` (*Roadmap*) dan `/settings` dari sidebar saat masuk sebagai Siswa. Siswa kini hanya mendapatkan menu yang relevan: *Dashboard Siswa*, *Hub Siswa*, *Notifikasi Saya*, *Profil Saya*, *Jadwal Ujian*, dan *Leaderboard*.
- **Pembersihan Sesi Lintas Akun (`login/page.tsx` & `siswa/page.tsx`):** Menambahkan pembersihan otomatis sesi (*localStorage.removeItem("aruthala_siswa_session")* & penghapusan *cookie*) sebelum login guru, serta pemanggilan `supabase.auth.signOut()` sebelum login siswa, menjamin tidak ada tumpang tindih otorisasi (*cross-contamination*) ketika berpindah akun di browser yang sama.

---

## [2026-07-15] - Sinkronisasi Menyeluruh UI Baru Denis ke Database Supabase (100% Dynamic Overhaul)
### Ditambahkan (Added)
- **Dynamic Hubs (`teacher-hub`, `student-hub`, `admin-hub`):** Menghapus seluruh angka dummy dan menggantinya dengan panggilan real-time ke Supabase via `useDashboardStats()`, `useUserRole()`, dan query langsung untuk jadwal hari ini serta statistik keaktifan penguji dan siswa.
- **Manajemen Master Data (`user-management`, `class-management`, `subject-management`):**
  - Mengubah `user-management/page.tsx` menjadi *Client Component* ber-RLS untuk melihat profil guru/siswa dan memverifikasi akses tenant.
  - Menambahkan penghitungan real-time jumlah siswa per kelas pada `class-management/page.tsx`.
  - Memetakan jumlah butir soal dan paket ujian per mata pelajaran pada `subject-management/page.tsx`.
- **Pusat Laporan & Ekspor Data (`reports`, `leaderboard`, `exam-report`, `teacher-report`, `student-report`, `report-export`):**
  - Mengintegrasikan agregasi ranking siswa berdasarkan `score` di `exam_sessions` pada `leaderboard/page.tsx`.
  - Memperbarui rekapitulasi performa butir soal, status pengumpulan, dan rata-rata skor pada `exam-report/page.tsx`.
  - Mengaktifkan pengunduhan transkrip nilai resmi CSV dan Excel (.csv kompatibel UTF-8) untuk data siswa, rekap ujian, dan log pelanggaran pada `report-export/page.tsx`.
- **Pusat Monitoring & Keamanan (`monitoring-center`, `exam-health`, `incident-report`):**
  - Menghubungkan pemantauan ke tabel `exam_violations` dan `exam_sessions` (`status = 'in_progress'`) yang me-refresh secara otomatis (auto-refresh/polling) tiap 15 detik.
  - Menghitung *Integrity Score* sekolah berdasarkan insiden *tab switch* / *fullscreen exit* yang tercatat pada `incident-report/page.tsx` serta mengaktifkan ekspor kronologi insiden.
- **Konfigurasi & Profil Akun (`settings`, `profile`, `notifications`, `schedule`, `academic-year`):**
  - Memungkinkan Admin menyimpan perubahan nama sekolah, kode tenant, telepon, dan alamat langsung ke tabel `sekolah` (`settings/page.tsx`).
  - Memungkinkan Guru & Siswa memperbarui data nama dan NISN di tabel `profiles` (`profile/page.tsx`).
  - Menghubungkan umpan peristiwa (`notifications/page.tsx`) ke aktivitas penerbitan paket ujian terbaru dan deteksi pelanggaran.

### Diperbaiki (Fixed)
- **TypeScript & Type Casting Error:** Memperbaiki *crash type inference* pada properti `exam` dari `exam_sessions` di `student-hub/page.tsx`, `student-report/page.tsx`, dan `notifications/page.tsx` dengan penyesuaian casting objek.
- **Perbaikan Properti `useDashboardStats`:** Menyelaraskan panggilan properti `totalMapel` di `academic/page.tsx` menggantikan referensi yang salah (`totalSoal`).

## [2026-07-18] - Fase 7: Error Logging, Offline Resilience, & Form Tenant Fix
### Ditambahkan (Added)
- **Sistem Error Logging (GlobalErrorBoundary):** Membuat komponen `GlobalErrorBoundary.tsx` yang membungkus seluruh aplikasi di `layout.tsx`. Error React kini ditangkap dengan UI fallback ("Oops, Sesuatu Salah!") dan dikirim ke tabel `error_logs` di Supabase secara otomatis.
- **Tabel `error_logs` di Supabase:** Menjalankan migrasi SQL `006_error_logs.sql` untuk membuat tabel error_logs dengan RLS (insert publik, read admin only).
- **Offline Resilience CBT:** Menambahkan pemanggilan `getLocalAnswers()` di fungsi `initExam` pada `src/app/e/[id]/mulai/page.tsx` agar jawaban lokal (IndexedDB/localStorage) dimuat saat halaman ujian dibuka.

### Diperbaiki (Fixed)
- **Bug Pendaftaran Sekolah (Tenant):** Menambahkan dropdown `Jenjang` (SD/SMP/SMA/SMK) dan injeksi `yayasan_id` default (UUID valid) di form `admin-hub/page.tsx`, menyelesaikan error `NOT NULL constraint violation`.
- **Bug UUID Pembuatan Kelas:** Menghapus injeksi ID teks biasa (`cls-xxxx`) dan menggunakan UUID valid untuk `sekolah_id`/`yayasan_id` fallback di `class-management/page.tsx`.

---

## [2026-07-20] - Revisi Section Guru & Admin (Sprint)
### Diperbaiki (Fixed)

#### Poin 1: Auto-Hitung Waktu Selesai Ujian
- **File:** `src/app/(dashboard)/ujian/buat/page.tsx`
- **Komponen/Fungsi:** State hooks (`startAt`, `durationStr`), `useEffect` baru
- **Alasan Teknis:** Sebelumnya, guru harus mengisi "Waktu Selesai" secara manual. Ini rawan human error (misalnya salah hitung jam). Sekarang, `useEffect` memantau perubahan `startAt` dan `durationStr`. Jika keduanya valid, `endAt` dihitung otomatis (`startAt + duration * 60000 ms`) dan diformat ke `datetime-local` string menggunakan local time (bukan UTC, untuk menghindari bug timezone). Input "Waktu Selesai" kini `readOnly` dengan background abu-abu sebagai indikator visual bahwa nilainya otomatis.

#### Poin 2: Bug Angka Mentok di "0" (01, 02, dst.)
- **File:** `src/app/(dashboard)/ujian/buat/page.tsx`
- **Komponen/Fungsi:** State `duration` → `durationStr` (string), `passingScore` → `passingScoreStr` (string)
- **Alasan Teknis:** React `<input type="number" value={numberState}>` akan memaksa `0` sebagai default saat user menghapus isi input, sehingga mengetik "1" menjadi "01". Solusinya: state disimpan sebagai string agar input bisa kosong. Konversi ke `Number()` hanya dilakukan saat publish (`const duration = Number(durationStr) || 0`), menjaga integritas data yang dikirim ke Supabase.

#### Poin 3: Teks Menembus Frame (Overflow Fix)
- **File:** `src/app/(dashboard)/teacher-hub/page.tsx`
- **Komponen/Fungsi:** Kolom `<td>` judul ujian di tabel daftar ujian
- **Perubahan:** Menambahkan `max-w-[250px]` dan class `truncate` pada `<p>` judul ujian dan kode ujian, sehingga teks panjang akan terpotong dengan ellipsis.

- **File:** `src/app/(dashboard)/ujian/page.tsx`
- **Komponen/Fungsi:** `<h3>` judul ujian di kartu daftar ujian
- **Perubahan:** Menambahkan class `truncate` pada `<h3>` judul ujian agar tidak menembus batas kartu.

- **File:** `src/app/(dashboard)/ujian/[id]/monitor/MonitorClient.tsx`
- **Komponen/Fungsi:** Header exam name (`<p>`), nama siswa di panel flagged (`<span>`), nama siswa di tabel peserta (`<td>`)
- **Perubahan:** Menambahkan inline style `overflow: hidden`, `textOverflow: ellipsis`, `whiteSpace: nowrap`, dan `maxWidth` pada tiga elemen teks yang rentan overflow: (1) header subtitle exam info (maxWidth 400px), (2) nama siswa di panel "Kondisi Koneksi" (maxWidth 140px), (3) kolom nama siswa di tabel peserta (maxWidth 180px).
- **Alasan Teknis:** Nama ujian atau nama siswa yang sangat panjang tanpa spasi (seperti URL atau nama dengan banyak gelar) akan melampaui batas container dan merusak layout tabel/kartu. Solusi `truncate` + `ellipsis` memotong teks secara visual tanpa menghilangkan data asli.

#### Poin 4: Real-time Monitoring Kecurangan (Proctor Lock)
- **File:** `src/app/(dashboard)/ujian/[id]/monitor/MonitorClient.tsx`
- **Komponen/Fungsi:** Interface `MonitorSession`, fungsi `fetchData`, realtime channel handler untuk `exam_sessions`, dan render tabel peserta ujian.
- **Perubahan Detail:**
  1. Menambahkan field `is_proctor_locked: boolean` ke interface `MonitorSession`.
  2. Menambahkan `is_proctor_locked` ke query `select()` saat fetch initial data dari `exam_sessions`.
  3. Memasukkan `is_proctor_locked: s.is_proctor_locked || false` saat mapping data sesi ke `formattedSessions` (dengan fallback `false` untuk row lama yang mungkin `null`).
  4. Menambahkan `is_proctor_locked` ke handler realtime `exam_sessions` UPDATE agar status kunci proctor terupdate secara live tanpa refresh halaman.
  5. Mengubah tampilan kolom "Status" di tabel peserta: jika `is_proctor_locked === true`, status menjadi **"Terkunci (Kecurangan)"** dengan badge merah (`#EF4444`), border merah transparan, dan dot merah — menggantikan status "Mengerjakan" yang sebelumnya tetap tampil meski siswa sudah di-lock.
- **Alasan Teknis:** Sebelumnya, guru/pengawas yang membuka Live Monitor tidak bisa membedakan siswa yang masih aktif mengerjakan dengan siswa yang sudah dikunci oleh sistem Anti-Cheat. Keduanya sama-sama menampilkan "Mengerjakan". Sekarang, indikator visual merah langsung memberitahu pengawas bahwa siswa tersebut perlu intervensi (buka kunci) dari Monitoring Center.
### Diubah (Changed)
- **Monitor Ujian Real-Time:** Penyesuaian `MonitorClient.tsx` untuk mengambil angka metrik *progress* (berapa soal terjawab) langsung berdasarkan jumlah rekaman dari tabel `exam_answers`. Total pertanyaan sekarang dinamis merujuk pada *count* dari tabel `exam_questions`.

#### Poin 5: Penyederhanaan Sidebar Admin
- **File:** `src/components/layout/Sidebar.tsx`
- **Komponen/Fungsi:** Array `adminSections` dan `commonSections`
- **Perubahan Detail:**
  - **`adminSections`:** Dipangkas dari 3 section (14 item) menjadi 2 section (8 item):
    - Section "Manajemen": Hub Admin, User Management, Class Management, Mata Pelajaran.
    - Section "Monitoring & Laporan": Monitoring Center, Laporan, Export Data, Schedule.
  - **`commonSections`:** Menghapus "Fitur & Roadmap" dari navigasi umum karena jarang diakses di workflow harian dan menambah kepadatan sidebar.
  - **Item yang dipindahkan/dihapus dari sidebar:** School Health, Exam Gate, Student Report, Teacher Report, Exam Report, Academic Year. Halaman-halaman ini tetap bisa diakses via URL langsung atau melalui shortcut di dalam Hub Admin.
- **Alasan Teknis:** User melaporkan bahwa sidebar terlalu ramai saat login sebagai Admin, dengan 19+ menu yang membuat navigasi menjadi melelahkan. Penyederhanaan ini mengikuti prinsip "80/20 rule" — hanya menu yang paling sering diakses yang tampil di sidebar, sementara fitur sekunder tetap bisa dijangkau via halaman hub.

#### Poin 6: Merge Pembaruan Denis + Collapsible Sidebar
- **File:** `src/components/layout/Sidebar.tsx`
- **Komponen/Fungsi:** Seluruh file di-rewrite — menambahkan komponen `CollapsibleSection`, state `collapsedSections`, dan merge dengan perubahan Denis.
- **Perubahan Detail:**
  1. **Git Merge `origin/main`:** Mengambil dan menggabungkan semua pembaruan Denis (5 halaman baru: absen, data-absen, kesiswaan, materi, perpus; update: DashboardShell, Header, useDashboardIdentity, offline-storage, sync-manager, ScheduleModal, student-hub, e/[id]/mulai).
  2. **Resolusi Konflik `Sidebar.tsx`:** Menulis ulang file gabungan yang mempertahankan menu baru Denis (File Materi, Perpustakaan, Kesiswaan, Data Absen) di section "Layanan Sekolah" pada `commonSections`, sekaligus mempertahankan logika OWNER/SUPER_ADMIN dari Denis dan layout sidebar yang bersih dari kita.
  3. **Resolusi Konflik `CHANGELOG.md`:** Menggabungkan log kedua sisi tanpa saling menimpa, membersihkan corrupted UTF-16 bytes sisa merge sebelumnya.
  4. **Fitur Collapsible Sidebar:** Menambahkan komponen `CollapsibleSection` baru dengan:
     - State `collapsedSections: Set<string>` untuk melacak section yang dilipat.
     - Animasi buka-tutup super mulus menggunakan CSS Grid trick (`grid-template-rows: 0fr → 1fr`) dengan `transition-[grid-template-rows] duration-300 ease-in-out`.
     - Ikon `ChevronDown` yang berputar 90° saat section ditutup.
     - Auto-expand otomatis untuk section yang mengandung halaman aktif saat ini.
     - Tombol header section yang responsif dengan hover effect.
- **Alasan Teknis:** Sidebar dengan 6+ section (Overview, Layanan Sekolah, Admin, Operasional, Fitur Guru, Fitur Siswa) pada role OWNER sangat panjang dan memerlukan scrolling berlebihan. Fitur collapsible memungkinkan user melipat section yang tidak relevan tanpa menghilangkan akses.

---

## [2026-07-14] - Fase 2: Manajemen Data Master
### Ditambahkan (Added)
- **Fitur Hapus (Delete) Soal:** Penambahan *button* tong sampah pada halaman `/bank-soal/page.tsx` beserta konfirmasinya untuk menghapus soal secara permanen dari *database* (`questions`).
- **Template Import Siswa:** Pembuatan file `template_import_siswa.csv` di direktori `public/templates` dan link "Unduh Template CSV" pada halaman Import Siswa agar guru memiliki format baku (nisn, nama_lengkap, kelas, tanggal_lahir) untuk pengisian massal.

### Diubah (Changed)
- **UI Bank Soal:** Penyesuaian tajuk tabel (*table headers*) di halaman Bank Soal agar sejalan dengan kolom isian data (5 kolom).
- **Import Data Siswa (CSV):** Menginkorporasikan validasi sesi *Guru/Admin* dengan menarik `sekolah_id` (menggunakan `useUserRole()`) lalu menyuntikkannya ke dalam susunan data *payload* *CSV*, sehingga *database* tidak memproduksi profil *orphan* (yatim piatu tanpa entitas sekolah).
- **Pembersihan Data Ujian (Data Cleanup):** Melakukan eksekusi *database* secara langsung untuk menghapus 3 ujian uji coba (*dummy*), dan mendistribusikan genap 10 soal ke 2 ujian yang tersisa agar konsisten.

### Diperbaiki (Fixed)
- **Data Kebocoran Daftar Siswa:** Memperbaiki *query fetch* pada `/data-siswa/page.tsx` di mana tabel secara serampangan menarik *seluruh* data siswa lintas sekolah. Kini daftar difilter spesifik (`.eq('sekolah_id', user.sekolah_id)`) berkat penggunaan `useUserRole`.
- **Foreign Key Constraint Hapus Soal:** Menambahkan *error handling* bersahabat (*friendly message*) pada tombol Delete Bank Soal untuk mencegat *PostgreSQL Foreign Key Violation* (kode 23503) agar UI tidak sekadar mengeluarkan pesan gagal teknis saat soal masih dipakai dalam struktur ujian yang sedang berjalan.
- **Hapus Ujian:** Menambahkan tombol Hapus (*Delete*) dengan ikon tempat sampah di halaman Utama Ujian (`/ujian/page.tsx`). Tombol ini secara pintar akan terlebih dahulu menghapus semua sesi (*exam_sessions*) yang menempel pada ujian tersebut sebelum menghapus data ujiannya (*cascade delete manual*), menghindari *Foreign Key Constraint Error*.

---

## [2026-07-14] - Fase 3: Pembuatan & Manajemen Ujian Tingkat Lanjut
### Ditambahkan (Added)
- **Panel Pengaturan Pemilihan Soal:** Merombak total halaman Pengaturan Ujian (`/ujian/[id]/page.tsx`). Halaman ini sekarang mengambil seluruh data dari Bank Soal (`questions`) dan menampilkannya sebagai daftar interaktif yang dapat dicentang (*checkbox*) oleh Guru.
- **Logika Penyimpanan Soal Ujian:** Sistem kini mampu menyimpan soal yang dicentang secara massal dengan menghapus daftar lama di `exam_questions` dan menyisipkan baris pemetaan soal baru secara atomik.

### Diperbaiki (Fixed)
- **Tirai Hak Akses (RBAC) URL Siswa:** Menambahkan skrip inspeksi `useUserRole` ke halaman Utama Ujian (`/ujian/page.tsx`) dan halaman Bank Soal (`/bank-soal/page.tsx`). Jika seorang pengguna ber-role `SISWA` nekat mengakses URL ini, sistem akan memblokir komponen UI dari *rendering* dan melempar (*redirect*) siswa tersebut kembali ke Beranda (`/overview`). Celah URL eksploitasi telah ditutup!

---

## [2026-07-14] - Fase 4: Penyempurnaan Keamanan & Ekspor Laporan
### Ditambahkan (Added)
- **Fitur Ekspor Nilai Excel:** Mengimplementasikan pembuatan laporan Excel `.xlsx` secara instan menggunakan pustaka `xlsx`. Guru kini dapat mengunduh seluruh tabel nilai siswa (lengkap beserta total pelanggaran *anti-cheat* dan status pengerjaan) melalui tombol "Export Excel" di halaman Hasil Ujian (`/ujian/[id]/hasil/page.tsx`).

---

## [2026-07-15] - Fase 5: Sinkronisasi Data Nyata & Validasi Waktu Ujian
### Ditambahkan (Added)
- **Data Soal Real (SNBT/UNBK):** Menghancurkan seluruh data dummy di *Bank Soal* dan menginjeksi 15 soal asli dengan bobot tinggi dari berbagai mata pelajaran (Matematika, Biologi, Fisika, Sejarah, Bahasa Inggris). Setiap soal kini dilengkapi opsi jawaban penuh (A, B, C, D) yang fungsional dan penjelasan logis (pembahasan).
- **Pemblokir Waktu Ujian (Time Restrictor):** Menambahkan algoritma validasi `start_at` dan `end_at` pada halaman pendaratan siswa (`src/app/e/[id]/page.tsx`). Tombol "Mulai Ujian" kini akan berubah secara dinamis menjadi indikator waktu jika jadwal ujian belum tiba, atau menjadi peringatan jika batas waktu sudah kedaluwarsa.

### Diperbaiki (Fixed)
- **Zona Waktu (Timezone) Buat Ujian:** Memperbaiki pengiriman format data tanggal dari halaman Buat Ujian (`src/app/(dashboard)/ujian/buat/page.tsx`). Sistem kini mengonversi parameter waktu lokal ke dalam ISOString (UTC) agar sinkron secara absolut dengan pangkalan data Supabase, mencegah konflik perbedaan jam komputer.
- **Bug Visibilitas Input Tanggal:** Memperbaiki masalah ketidakmampuan mengisi tanggal dan waktu saat membuat ujian akibat bentrok pewarnaan mode gelap (`colorScheme: "dark"`) pada *background* putih terang. Input kalender kini sepenuhnya terlihat jelas.
- **Navigasi Ujian Siswa:** Menambahkan tombol **Kembali ke Dashboard** pada halaman sukses submit ujian. Siswa tidak lagi terjebak di layar akhir setelah mengumpulkan jawaban.
- **Kalkulasi Skor Otomatis:** Memodifikasi `doSubmit()` pada halaman ujian siswa. Sistem kini secara otomatis menghitung kecocokan jawaban siswa dengan kunci jawaban (*is_correct*) saat disubmit dan menyimpannya ke tabel `exam_sessions`. Nilai kini akan langsung muncul di *dashboard* siswa.
- **Pemetaan Kolom Live Monitor:** Memperbaiki kesalahan pemetaan kolom pada `MonitorClient.tsx` di mana kolom "Pelanggaran" sebelumnya salah menampilkan data "Sisa Waktu Ujian".
- **Real-Time Progress & Live Timer:** Menambahkan *listener* `Supabase Realtime` untuk tabel `exam_answers` di layar Live Monitor Guru. Angka progres siswa (contoh: 2/15) kini akan bertambah secara otomatis tanpa memuat ulang layar. *Live timer* juga dikalibrasi agar menghitung selisih waktu dari jadwal `start_at` ujian.
- **Keamanan Hak Akses:** Menutup celah akses menu (seperti `/akademik`, `/data-siswa`, `/data-siswa/import`) yang sebelumnya masih bisa diintip oleh siswa melalui URL *direct routing*. Sistem kini mendeteksi status `isSiswa` dan segera melempar mereka ke `/overview`.

## [2026-07-15] - Fase 6: Git Merge dan Integrasi UI
### Ditambahkan (Added)
- **Pembaharuan GUI Baru:** Menggabungkan pembaruan desain dari Denis.
### Diperbaiki (Fixed)
- **Merge Conflicts Resolution:** Menyelesaikan konflik Git pada komponen utama.
- **Pemulihan Navigasi Aman:** Mengembalikan sistem perlindungan pada sesi logout di Sidebar.tsx.

---

## [2026-07-20] - Penyesuaian UI Dasbor Siswa, Perbaikan Bug Modal Jadwal, dan Penambahan Menu Baru (Denis)
### Ditambahkan (Added)
- **Menu Layanan Sekolah:** Menambahkan submenu baru pada sidebar: File Materi, Perpustakaan, Kesiswaan, dan Data Absen.
- **Halaman Baru (materi, perpus, kesiswaan, absen):** Membangun UI halaman placeholder sederhana dengan tema Aruthala. Halaman /absen memiliki tabel absensi bulanan dengan filter dropdown dan kolom status dinamis.

### Diperbaiki dan Diubah (Fixed and Changed)
- **Pembaruan Teks KPI (student-hub/page.tsx):** Mengubah wording label dari "Sedang Dikerjakan" menjadi "Ujian hari ini".
- **Resolusi Bug Input Waktu (schedule/ScheduleModal.tsx):** Input waktu dirombak menjadi dua elemen select kustom (Jam: 00-23, Menit: 00, 15, 30, 45).
- **Perbaikan UI Sidebar (Sidebar.tsx):** Memodifikasi `collapsedSections` menjadi `expandedSections` sehingga kategori menu (seperti Layanan Sekolah, Akademik) tertutup secara default saat web pertama kali dibuka, kecuali untuk kategori yang sedang aktif. Ini membuat UI pada desktop maupun mobile lebih bersih dan tidak kepenuhan.

