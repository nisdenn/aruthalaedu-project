-- =========================================================================
-- ARUTHALA EDU — SCHEMA UPDATE PATCH
-- Gunakan script ini jika tabel-tabel utama (sekolah, questions) sudah ada.
-- =========================================================================

-- 1. Tambahkan kolom is_proctor_locked jika belum ada
ALTER TABLE public.exam_sessions 
ADD COLUMN IF NOT EXISTS is_proctor_locked boolean DEFAULT false;

-- 2. Buat tabel system_announcements jika belum ada
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    target_type TEXT,
    target_sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Opsional) RLS untuk system_announcements
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_announcements' AND policyname = 'Semua pengguna bisa melihat pengumuman'
    ) THEN
        CREATE POLICY "Semua pengguna bisa melihat pengumuman"
        ON public.system_announcements FOR SELECT
        USING (true);
    END IF;
END $$;
