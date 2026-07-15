-- =========================================================================
-- SCRIPT RESET DATABASE (MENGHAPUS SEMUA TABEL LAMA)
-- Jalankan ini HANYA JIKA Anda ingin mereset database dari nol.
-- =========================================================================

-- 1. Hapus semua tabel di skema public
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. Kembalikan hak akses dasar
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 3. Hapus trigger bawaan yang mengganggu (jika ada)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
