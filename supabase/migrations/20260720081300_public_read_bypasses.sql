-- ============================================================
-- ARUTHALA EDU — PUBLIC READ BYPASSES FOR SISWA LOCAL BYPASS
-- Migration: 009_public_read_bypasses.sql
-- ============================================================

-- Karena fitur Local Bypass Siswa tidak memiliki JWT Supabase Auth yang valid,
-- maka policy berdasarkan get_my_sekolah_id() akan gagal.
-- Untuk mengatasi ini, kita tambahkan public read (bisa diakses dengan Anon Key)
-- dengan syarat frontend harus memfilter secara spesifik sekolah_id yang dibutuhkan.

CREATE POLICY "Allow public read for materials" ON materials
    FOR SELECT USING (true);

CREATE POLICY "Allow public read for library_books" ON library_books
    FOR SELECT USING (true);

CREATE POLICY "Allow public read for announcements" ON announcements
    FOR SELECT USING (true);

CREATE POLICY "Allow public read for extracurriculars" ON extracurriculars
    FOR SELECT USING (true);
