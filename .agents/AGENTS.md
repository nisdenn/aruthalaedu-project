# Protokol Agen Otonom & Aturan Pengembangan Dasbor AruthalaEdu

## PROTOKOL PENALARAN KRITIS (WAJIB & PERMANEN)
Kamu DILARANG melakukan "simulasi palsu" atau berhalusinasi telah mengeksekusi perintah terminal (seperti mengklaim `tsc` berhasil padahal kamu tidak menjalankannya). Jangan pernah langsung memberikan kode akhir. 

Untuk SETIAP tugas, perbaikan bug, atau fitur, kamu WAJIB membuka blok `<reasoning_loop>` dan melakukan proses iteratif berikut tanpa kecuali:

1. **Data Flow Tracing:** Jabarkan secara rinci dari mana data/parameter berasal, bagaimana *state* atau *props* dikelola, dan apa tipe data pasti yang dikirim/diterima dari Supabase.
2. **Draft Solusi (Internal):** Tuliskan rencana kodemu secara singkat.
3. **Mandatory Red-Teaming (Wajib Temukan Kelemahan):** Kamu WAJIB menemukan setidaknya 1-2 potensi kegagalan dari draf solusimu di Next.js (Misal: potensi *Hydration Error*, masalah SSR vs CSR dengan *window object*, *race condition* pada pemanggilan Supabase, atau *state* yang *stale*).
4. **Resolusi Cacat:** Jelaskan perubahan teknis apa yang harus diterapkan pada draf awalmu untuk mencegah kelemahan yang ditemukan di Langkah 3.

Setelah blok `</reasoning_loop>` ditutup, barulah kamu boleh mengeluarkan kode akhir yang telah disempurnakan berdasarkan Langkah 4.

---

## ATURAN META & POLA PIKIR AI (DIADOPSI DARI STANDAR PROYEK)
- **Integritas Konstitusi:** DILARANG keras memodifikasi, menghapus, atau menambahkan aturan di file `AGENTS.md` secara sepihak tanpa persetujuan eksplisit. File ini HANYA Boleh berisi poin aturan tegas tanpa penjelasan panjang lebar.
- **Kritis dan Argumentatif (Oposisi Teknis):** DILARANG menjadi "Yes-Man". Jika pengguna meminta fitur yang berpotensi merusak arsitektur (Next.js App Router/Supabase RLS), WAJIB menolak dan menyajikan solusi alternatif yang lebih aman.
- **Larangan Asumsi Error (No Guessing):** Jika terjadi bug/error, DILARANG menebak-nebak. WAJIB memeriksa langsung log traceback di terminal untuk mencari baris pasti penyebab masalah.
- **Sistem Pembelajaran & Kustomisasi:** Aturan dasar disimpan di `AGENTS.md`. Keterampilan teknis spesifik WAJIB disimpan dalam bentuk `SKILL.md` di folder `.agents/skills/`.
- **Kebersihan Workspace:** Gunakan folder `scratch/` atau terisolasi untuk uji coba (*testing/dump*). Dilarang mengotori *root folder*.
- **Anti-Loop & Kemerdekaan Berpikir:** Jika gagal menyelesaikan error yang sama 2 kali, DILARANG mengulangi metode yang sama. WAJIB mundur selangkah (*step back*), merombak strategi, dan memikirkan solusi berbeda.
- **Mimikri Arsitektur Keturunan:** Sebelum membuat komponen/fitur baru, WAJIB mencari file/fungsi referensi di proyek ini yang strukturnya mirip dan meniru 100% gaya arsitekturnya.
- **Larangan Membungkam Error (No Silent Failures):** Semua error (termasuk blok `catch` pada koneksi Supabase) wajib dicatat dan ditangani (misal: munculkan toast UI), dilarang dibiarkan kosong.
- **Pembatasan Zona Ledakan:** DILARANG KERAS mengeksekusi perintah terminal destruktif (seperti menghapus database/tabel) tanpa persetujuan eksplisit pengguna.

---

## ATURAN PENGEMBANGAN DASBOR ARUTHALAEDU

1. **Uji Lokal Dahulu:** Pastikan kode tidak merusak lingkungan lokal sebelum fitur dianggap selesai.
2. **Validasi Kritis & Supabase:** Setiap formulir atau tombol yang berinteraksi dengan Supabase harus memiliki penanganan error yang kuat (jangan asumsikan *fetch* selalu berhasil).
3. **Desain Utuh:** Fitur harus dibangun secara utuh sesuai dengan logika bisnis aplikasi, tanpa kompromi UI/UX.
4. **Verifikasi Rute App Router (Next.js):** Komponen navigasi (`Link`, `router.push`) harus 100% sama dengan struktur direktori `src/app`. Dilarang menebak path.
5. **Aturan Integrasi Ganda:** Jika input form ke Supabase diubah, MAKA halaman yang menampilkan tabel dari data tersebut HARUS disinkronisasikan logikanya seketika.
6. **Injeksi Import React:** Selalu letakkan modul impor di baris teratas secara absolut, di luar blok komponen klien/server.
7. **Pencatatan History Log (Wajib):** Setiap selesai melakukan modifikasi kode atau fitur baru, kamu WAJIB mencatat rincian pembaruan (apa yang diubah, file apa yang terdampak, dan tujuan perubahannya) ke dalam file `CHANGELOG.md` di *root* proyek. Ini krusial agar mempermudah pelacakan perkembangan dan _rollback_ jika terdapat bug/error di kemudian hari.

## ATURAN NEXT.JS APP ROUTER (WAJIB DIIKUTI)
- **DILARANG MENGHILANGKAN `children` SECARA KONDISIONAL DI DALAM LAYOUT:** Jangan pernah menggunakan logika seperti `if (loading) return <Spinner />;` di dalam file `layout.tsx` atau komponen pembungkusnya (seperti `AuthGuard` / `RoleGuard`). Hal ini akan menyebabkan Next.js gagal menyertakan file CSS (*CSS chunking bug*) saat SSR, sehingga halaman menjadi tidak memiliki styling (HTML mentah).
- **SOLUSI LOADING STATE DI LAYOUT:** Jika perlu menahan tampilan saat memuat status otentikasi di sisi klien, tetap render `children` di dalam DOM namun sembunyikan secara visual (contoh: `<div className={loading ? "hidden" : "block"}>{children}</div>`), ATAU cukup gunakan `middleware.ts` untuk proteksi rute, dan biarkan `children` selalu dirender secara absolut.
  

## ATURAN KEAMANAN DATA & TOKEN (WAJIB DIIKUTI)
- **DILARANG MENGGUNAKAN MOCK DATA UNTUK AUTENTIKASI API REST:** Jika kamu harus melakukan fetch ke REST API Supabase secara manual (contoh: via fetch), pastikan token yang digunakan adalah token asli. Jika klien menggunakan mock token (seperti untuk akses siswa tanpa autentikasi penuh), kamu **WAJIB** menggunakan anonKey (Kunci Anonim) sebagai fallback pada header Authorization: Bearer anonKey agar request tidak ditolak dengan status 401 Unauthorized oleh PostgREST.
- **JADWAL & STATUS BERBASIS WAKTU:** Status LIVE atau aktif pada penjadwalan ujian DILARANG hanya berpatokan pada status = 'published'. Selalu komputasi waktu riil (Date.now()) dibandingkan dengan start_at dan end_at untuk menentukan apakah kegiatan masih bisa diakses atau sudah BERAKHIR/SELESAI.

## ATURAN GIT REPOSITORY (PUSAT & TESTING)
- **Repositori Pusat:** `https://github.com/nisdenn/aruthalaedu-project` adalah repositori pusat (produksi) milik orang lain. JANGAN `git push` ke repositori ini apabila hanya untuk testing atau eksperimen baru.
- **Repositori Testing:** `https://github.com/dbzyahya23/aruthalaedu` adalah repositori khusus untuk testing/eksperimen. Selalu gunakan *remote* repositori ini (misal di-*set* sebagai `testing`) saat sedang melakukan pengujian kode yang belum divalidasi penuh.
