-- 1. Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aruthala-materials', 'aruthala-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access for Materials" ON storage.objects
FOR SELECT USING (bucket_id = 'aruthala-materials');

CREATE POLICY "Staff Insert Access for Materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'aruthala-materials' AND 
  (auth.role() = 'authenticated')
);

CREATE POLICY "Staff Delete Access for Materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'aruthala-materials' AND 
  (auth.role() = 'authenticated')
);

-- 2. Insert dummy data for materials
INSERT INTO materials (id, title, description, mata_pelajaran, file_url, file_type, file_size_bytes, is_published, sekolah_id, yayasan_id)
VALUES 
(gen_random_uuid(), 'Modul Matematika Wajib Bab 1', 'Materi eksponen dan logaritma untuk kelas X', 'Matematika Wajib', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF', 1048576, true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Presentasi Sejarah Kemerdekaan', 'Slide presentasi sejarah kemerdekaan Indonesia', 'Sejarah Indonesia', 'https://example.com/dummy.pptx', 'PPTX', 5242880, true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Panduan Praktikum Biologi', 'Panduan pengamatan sel tumbuhan', 'Biologi', 'https://example.com/dummy.docx', 'DOCX', 204800, true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

-- 3. Insert dummy data for library_books
INSERT INTO library_books (id, title, author, category, cover_color, total_stock, available_stock, sekolah_id, yayasan_id)
VALUES 
(gen_random_uuid(), 'Buku Siswa Bahasa Indonesia Kelas X', 'Kemendikbudristek', 'Buku Paket', '#2f66e9', 50, 48, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Fiksi', '#e95f2f', 5, 2, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Ensiklopedia Luar Angkasa', 'Gramedia', 'Referensi', '#10b981', 10, 10, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Pemrograman Web Modern dengan Next.js', 'Vercel', 'Teknologi', '#8b5cf6', 3, 1, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

-- 4. Insert dummy data for announcements
INSERT INTO announcements (id, title, content, type, is_pinned, sekolah_id, yayasan_id, target_audience)
VALUES
(gen_random_uuid(), 'Jadwal Libur Semester Ganjil 2026', 'Libur semester ganjil akan dimulai dari tanggal 20 Desember hingga 3 Januari. Harap seluruh siswa menyesuaikan.', 'Pengumuman', true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'all'),
(gen_random_uuid(), 'Pertandingan Persahabatan Futsal antar SMA', 'Tim futsal SMA 1 Aruthala akan bertanding melawan SMA 2 akhir pekan ini. Ayo dukung!', 'Kegiatan', false, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'all'),
(gen_random_uuid(), 'Juara 1 Lomba Koding Nasional 2026', 'Selamat kepada Andi dari Kelas 12 IPA 1 yang telah meraih Juara 1 lomba koding tingkat nasional!', 'Prestasi', false, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'all');

-- 5. Insert dummy data for extracurriculars
INSERT INTO extracurriculars (id, name, description, schedule, is_active, sekolah_id, yayasan_id)
VALUES
(gen_random_uuid(), 'Pramuka', 'Kegiatan wajib kepramukaan', 'Setiap Jumat, 15:00 - 17:00', true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Klub Robotika', 'Merakit dan memprogram robot lego/arduino', 'Setiap Selasa, 14:00 - 16:00', true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), 'Paduan Suara', 'Berlatih vokal dan aransemen lagu', 'Setiap Kamis, 14:30 - 16:00', true, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');
