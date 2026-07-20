# Changelog & History Log
Semua perubahan (Updates, Bug Fixes, New Features) pada Dasbor AruthalaEdu akan didokumentasikan di sini untuk mempermudah pelacakan.

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

## [2026-07-14] - Fase 1: Siklus Ujian Selesai
### Ditambahkan (Added)
- **Auto-Grading System:** Tombol "Hitung Nilai Otomatis" di halaman Hasil Ujian. Sistem secara otomatis mencocokkan `exam_answers` dengan kunci jawaban di tabel `questions` (Pilihan Ganda & True/False) dan menyimpan `score` ke `exam_sessions`.
- **Riwayat Ujian Siswa:** Penambahan *tab* baru "Riwayat Ujian" di Dasbor Siswa (`overview/page.tsx`) untuk menampilkan ujian yang sudah selesai (*submitted*) beserta nilai akhirnya.
- **Rules Agents.md:** Menambahkan aturan ke-7 tentang pencatatan History Log pada setiap pembaruan.

### Diubah (Changed)
- **Monitor Ujian Real-Time:** Penyesuaian `MonitorClient.tsx` untuk mengambil angka metrik *progress* (berapa soal terjawab) langsung berdasarkan jumlah rekaman dari tabel `exam_answers`. Total pertanyaan sekarang dinamis merujuk pada *count* dari tabel `exam_questions`.

### Diperbaiki (Fixed)
- **React Hydration & Rules of Hooks Crash:** Memperbaiki bug fatal di `/ujian/[id]/mulai/page.tsx` di mana pemanggilan Hook `useCallback` (`setAnswer`) tidak sengaja diletakkan setelah kode `if (!examData) return`, yang memicu *render crash* beruntun ketika ujian dimuat.
- **Unique Constraint Bug (`exam_sessions`):** Memperbaiki celah logika di mana tombol "Mulai Ujian" selalu mencoba melakukan *INSERT* sesi baru dengan `attempt_number: 1` secara buta. Sistem kini memeriksa eksistensi *session* dan melanjutkan ujian yang belum selesai (*resume*) atau menambah `attempt_number` baru. Serta menyesuaikan *fetching* `siswa_id` dari *Local Storage Bypass* (bukan Supabase Auth Guru/Admin).

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
 
 # #   [ 2 0 2 6 - 0 7 - 1 5 ]   -   F a s e   6 :   G i t   M e r g e   &   I n t e g r a s i   U I  
 # # #   D i t a m b a h k a n   ( A d d e d )  
 -   * * P e m b a u r a n   G U I   B a r u : * *   M e n g g a b u n g k a n   p e m b a r u a n   d e s a i n   d a n   t a t a   l e t a k   b e s a r - b e s a r a n   y a n g   d i k e r j a k a n   o l e h   D e n i s   d a r i   r e p o s i t o r i   \ m a i n \ .   I n i   t e r m a s u k   p e r o m b a k a n   g a y a   k o m p o n e n   d i   \ S i d e b a r . t s x \ ,   \ H e a d e r . t s x \ ,   s e r t a   \ M o n i t o r C l i e n t . t s x \ .  
 # # #   D i p e r b a i k i   ( F i x e d )  
 -   * * M e r g e   C o n f l i c t s   R e s o l u t i o n : * *   M e n y e l e s a i k a n   p u l u h a n   k o n f l i k   G i t   ( * m e r g e   c o n f l i c t s * )   p a d a   b a n y a k   k o m p o n e n   u t a m a   y a n g   d i s e b a b k a n   o l e h   p e m b a r u a n   s i m u l t a n ,   m e n g u t a m a k a n   f o n d a s i   k o d e   b i s n i s   ( S u p a b a s e   r e a l - t i m e ,   v a l i d a s i   A u t h ,   d a n   p r o t e k s i   r u t e )   t a n p a   m e n g h i l a n g k a n   p e m b a r u a n   g r a f i s   d a r i   D e n i s .  
  -   * * P e m u l i h a n   N a v i g a s i   A m a n : * *   M e n g e m b a l i k a n   s i s t e m   p e r l i n d u n g a n   ( * b y p a s s   c l e a n u p * )   p a d a   s e s i   l o g o u t   d i   k o m p o n e n   \ S i d e b a r . t s x \ .  
  
---

## [2026-07-20] - Penyesuaian UI Dasbor Siswa, Perbaikan Bug Modal Jadwal, dan Penambahan Menu Baru
### Ditambahkan (Added)
- **Menu Layanan Sekolah (`Sidebar.tsx`):** Menambahkan submenu baru pada sidebar khusus siswa, yang mencakup: *File Materi*, *Perpustakaan*, *Kesiswaan*, dan *Data Absen*.
- **Halaman Baru (`materi`, `perpus`, `kesiswaan`, `absen`):** Membangun UI halaman *placeholder* sederhana dengan mengadaptasi tema desain modern Aruthala. Halaman `/absen` telah dilengkapi dengan struktur tabel absensi bulanan lengkap dengan filter dropdown, kolom status dinamis (Hadir/Sakit/Libur), dan baris warna selang-seling (Zebra-striping).

### Diperbaiki & Diubah (Fixed & Changed)
- **Pembaruan Teks KPI (`student-hub/page.tsx`):** Mengubah *wording* label dari "Sedang Dikerjakan" menjadi "Ujian hari ini" pada kartu metrik (KPI Stats Grid) dan navigasi *Tabs* filter agar lebih relevan dengan jadwal harian siswa.
- **Resolusi Bug Input Waktu (`schedule/ScheduleModal.tsx`):** Memperbaiki isu lag dan bug ketidakmunculan angka pada browser tertentu (*cross-browser issue*) ketika menggunakan *native HTML input* `type="time"`. Elemen input waktu kini sepenuhnya dirombak menjadi dua elemen `select` kustom (Jam: 00-23, Menit: 00, 15, 30, 45) yang responsif dan sangat ringan.