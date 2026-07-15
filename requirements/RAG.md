# ARUS RAG Specification

**Status: FUTURE / OPTIONAL AI MODULE.**
Dokumen ini mendefinisikan kebutuhan untuk Retrieval-Augmented Generation (RAG) pada ARUS. RAG bukan bagian inti Fase 1 atau Fase 2, tetapi disiapkan sebagai modul AI masa depan untuk membantu guru, siswa, admin sekolah, dan admin yayasan menemukan informasi dari dokumen yang sudah ada di sistem.

---

## 1. Tujuan

RAG di ARUS bertujuan untuk:

1. Menjawab pertanyaan pengguna berdasarkan dokumen internal sekolah secara akurat.
2. Mengurangi pencarian manual di modul, panduan, kebijakan, dan laporan.
3. Menyediakan asisten pengetahuan yang tetap patuh pada batas data tiap tenant.
4. Mendukung pencarian semantik untuk konten pendidikan dan operasional sekolah.

RAG tidak dimaksudkan untuk menjadi chatbot umum yang menjawab semua hal di luar data ARUS.

---

## 2. Use Case Utama

### 2.1 Guru
- Mencari ringkasan materi dari modul pembelajaran.
- Menanyakan kebijakan sekolah atau SOP yang tersimpan.
- Mengambil referensi dari bank soal, panduan ujian, atau incident report.
- Mencari contoh topik untuk penyusunan ujian atau tugas.

### 2.2 Siswa
- Mencari penjelasan materi dari modul yang sudah dibagikan.
- Menemukan ringkasan topik belajar dan referensi terkait.
- Menanyakan jadwal, instruksi ujian, atau petunjuk yang sudah dipublikasikan.

### 2.3 Admin Sekolah / Yayasan
- Mencari dokumen kebijakan, konfigurasi tenant, dan panduan operasional.
- Menemukan ringkasan laporan atau dokumen administratif.
- Menelusuri isi dokumen tanpa membuka file satu per satu.

---

## 3. Batasan Scope

### Termasuk
- Pencarian semantik atas dokumen ARUS.
- Chat berbasis konteks dari dokumen terindeks.
- Sitasi sumber jawaban dari dokumen internal.
- Filter hasil berdasarkan tenant, role, dan izin akses.
- Ringkasan dokumen dan ekstraksi poin penting.

### Tidak Termasuk
- Mengubah isi dokumen sumber secara otomatis.
- Menjawab pertanyaan yang tidak punya dasar di data internal.
- Mengakses data lintas tenant tanpa izin.
- Menggantikan fungsi core LMS, exam engine, atau anti-cheat.
- Analitik ML berat atau model training khusus pada fase awal.

---

## 4. Sumber Data

RAG hanya boleh mengambil data dari sumber yang jelas dan terkontrol.

### Sumber Utama
- Dokumen modul pembelajaran.
- Dokumen kebijakan sekolah.
- Panduan penggunaan ARUS.
- Bank soal yang memang ditandai boleh dipakai untuk referensi.
- Incident report dan laporan yang memang diizinkan untuk pencarian.
- Dokumen administrasi internal yang sesuai role.

### Sumber Tambahan
- FAQ sekolah.
- Catatan guru yang dipublikasikan.
- Materi umum yang diunggah ke library.

### Sumber yang Tidak Boleh Dipakai
- Data pribadi sensitif yang tidak relevan.
- Jawaban ujian aktif siswa lain.
- Log internal yang bersifat rahasia jika tidak diberi akses.
- Data lintas sekolah/yayasan tanpa kebijakan RLS yang sah.

---

## 5. Arsitektur Konseptual

### 5.1 Alur Ingest
1. Dokumen diunggah atau diperbarui di ARUS.
2. Sistem mengekstrak teks dari file atau konten halaman.
3. Konten dibersihkan, dipecah menjadi chunk, lalu diberi metadata.
4. Chunk disimpan ke penyimpanan vektor.
5. Metadata disimpan agar hasil bisa difilter per tenant, role, jenis dokumen, dan izin akses.

### 5.2 Alur Query
1. Pengguna mengajukan pertanyaan.
2. Sistem mengidentifikasi tenant, role, dan scope akses.
3. Query diubah menjadi embedding.
4. Sistem mencari chunk paling relevan di vector store.
5. Model generatif menyusun jawaban berdasarkan konteks terambil.
6. Jawaban tampil dengan sitasi sumber.

### 5.3 Komponen Kunci
- Document ingestion pipeline.
- Text extraction and normalization.
- Chunking strategy.
- Embedding generation.
- Vector store.
- Retrieval layer.
- Generation layer.
- Access control layer.
- Citation and traceability layer.

---

## 6. Prinsip Desain

### 6.1 Multi-Tenant Safe
Setiap hasil retrieval harus terikat pada `tenant_id`. Tidak boleh ada query yang menggabungkan data antar sekolah tanpa aturan eksplisit.

### 6.2 Role-Aware
Konten yang boleh dilihat guru belum tentu boleh dilihat siswa atau orang tua. RAG harus menghormati role sama seperti modul lain di ARUS.

### 6.3 Grounded Answers
Jawaban harus didasarkan pada dokumen yang ditemukan. Jika konteks tidak cukup, sistem harus mengatakan bahwa informasi tidak ditemukan.

### 6.4 Citation First
Setiap jawaban yang penting harus menyertakan sumber, minimal judul dokumen, bagian, atau referensi chunk.

### 6.5 No Hallucination Policy
Jika data tidak tersedia, model tidak boleh mengarang. Sistem harus memprioritaskan kejujuran atas kelengkapan.

---

## 7. Chunking & Indexing

### Aturan Chunking
- Chunk dibuat cukup kecil untuk retrieval yang presisi, tetapi cukup besar agar konteks tetap utuh.
- Dokumen panjang harus dipecah berdasarkan heading, paragraf, atau section alami.
- Tabel, daftar, dan poin penting harus dipertahankan strukturnya semampunya.

### Metadata Minimum
Setiap chunk minimal memiliki:
- `tenant_id`
- `document_id`
- `document_title`
- `document_type`
- `access_role`
- `source_path`
- `version`
- `chunk_index`
- `created_at`
- `updated_at`

### Versi Dokumen
Jika dokumen berubah, index lama tidak boleh langsung ditimpa tanpa versi baru. Sistem harus tahu chunk mana yang aktif dan mana yang sudah usang.

---

## 8. Retrieval Policy

### Prioritas Retrieval
1. Tenant yang sama.
2. Role yang sesuai.
3. Dokumen terbaru atau versi aktif.
4. Relevansi semantik.
5. Kecocokan metadata tambahan seperti mapel, kelas, atau tipe dokumen.

### Filter yang Disarankan
- Tenant.
- Role.
- Jenis dokumen.
- Tahun akademik.
- Mata pelajaran.
- Status publikasi.

### Fallback
Jika retrieval rendah kualitasnya, sistem boleh:
- Meminta klarifikasi.
- Menampilkan jawaban singkat dengan disclaimer.
- Mengarahkan pengguna ke dokumen sumber.

---

## 9. Prompting & Response Style

### Prinsip Prompt
- Model harus berperan sebagai asisten internal ARUS.
- Model tidak boleh keluar dari konteks dokumen yang diberikan.
- Model harus menyebut bila jawaban bersifat ringkasan atau interpretasi.

### Format Jawaban
- Jawaban singkat dan langsung.
- Bila perlu, poin-poin ringkas.
- Sitasi sumber ditampilkan di bawah jawaban.
- Bila konteks kurang, jelaskan bahwa data tidak ditemukan.

### Gaya Bahasa
- Bahasa Indonesia formal ringan.
- Mudah dipahami siswa, guru, dan admin.
- Hindari bahasa teknis berlebihan kecuali diminta.

---

## 10. Safety & Privacy

### Kontrol Akses
- RAG harus memakai role check dan tenant isolation.
- Dokumen sensitif harus ditandai agar tidak ikut terindeks untuk role tertentu.

### Privasi
- Data pribadi tidak boleh dibuka ke pengguna yang tidak berhak.
- Jawaban dari RAG tidak boleh menampilkan informasi sensitif secara lengkap kecuali role mengizinkan.

### Audit
- Pertanyaan dan hasil retrieval penting dapat dicatat untuk audit dan evaluasi kualitas.
- Log harus aman dan mengikuti kebijakan sekolah.

---

## 11. Evaluasi Kualitas

### Metrik Utama
- Retrieval precision.
- Citation accuracy.
- Answer groundedness.
- Response latency.
- Access control correctness.

### Cara Uji
- Pertanyaan ujicoba dari guru, siswa, dan admin.
- Dataset pertanyaan internal sekolah.
- Uji jawaban untuk dokumen yang berubah versi.
- Uji role restriction agar tidak ada bocor data.

### Kriteria Lulus
- Jawaban relevan dan tidak mengarang.
- Sitasi sesuai sumber.
- Tidak ada kebocoran lintas tenant.
- Latensi masih layak dipakai interaktif.

---

## 12. Integrasi Produk

RAG di ARUS paling cocok dipasang pada:
- Library / modul belajar.
- Help center.
- Dashboard admin dan guru.
- Pencarian dokumen kebijakan.
- Ringkasan laporan.

RAG tidak perlu mengganggu flow ujian inti. Modul ini harus berdiri terpisah dari exam engine dan anti-cheat.

---

## 13. Tahap Implementasi

### Tahap 1
- Pencarian semantik untuk dokumen publik internal.
- Sitasi sumber sederhana.
- Filter tenant dan role dasar.

### Tahap 2
- Ringkasan dokumen.
- Query historis berbasis audit atau laporan.
- Peningkatan chunking dan ranking.

### Tahap 3
- Multi-step reasoning.
- Pencarian lintas koleksi dengan izin granular.
- Feedback loop untuk evaluasi kualitas jawaban.

---

## 14. Non-Goals

- AI pengoreksian nilai otomatis untuk semua kasus.
- Generasi konten ujian tanpa kontrol manusia.
- Chatbot publik tanpa pembatasan tenant.
- Pembuatan keputusan akademik otomatis.

---

## 15. Ringkasan Keputusan Produk

RAG di ARUS adalah modul pendukung, bukan inti platform. Prioritas utamanya adalah keamanan akses, jawaban yang grounded, dan integrasi mulus dengan dokumen sekolah yang sudah ada. Jika di masa depan diaktifkan, RAG harus tetap tunduk pada RLS, role-based access, dan identitas visual ARUS yang sama.
