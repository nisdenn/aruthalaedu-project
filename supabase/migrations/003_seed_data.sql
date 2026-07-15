-- ============================================================
-- ARUTHALA EDU — SEED DATA (Development Only)
-- ============================================================

-- Demo Yayasan
INSERT INTO yayasan (id, name, slug, email, tier) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Yayasan An-Nur Pendidikan', 'yayasan-annur', 'admin@annur.sch.id', 'yayasan'),
  ('11111111-1111-1111-1111-111111111112', 'Yayasan Harapan Bangsa', 'yayasan-harapan', 'admin@harapanbangsa.sch.id', 'enterprise');

-- Demo Sekolah
INSERT INTO sekolah (id, yayasan_id, name, slug, jenjang, max_siswa) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'SDIT An-Nur Bekasi', 'sdit-annur-bekasi', 'SD', 500),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'SMPIT An-Nur Bekasi', 'smpit-annur-bekasi', 'SMP', 800),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111112', 'SMA Harapan Bangsa', 'sma-harapan-bangsa', 'SMA', 600);

-- Demo Kelas
INSERT INTO kelas (sekolah_id, yayasan_id, name, tingkat, tahun_ajaran) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '9A', 9, '2025/2026'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '9B', 9, '2025/2026'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '8A', 8, '2025/2026'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '7A', 7, '2025/2026');

-- Create Dummy Admin for Foreign Keys
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin_seed@example.com', 
  crypt('password123', gen_salt('bf')), now(), now(), now(), 
  '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Seed"}', false
) ON CONFLICT (id) DO NOTHING;

-- Force insert into profiles in case auth.users already had it but public schema was dropped
INSERT INTO public.profiles (id, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin Seed', 'GURU')
ON CONFLICT (id) DO NOTHING;

-- Demo Questions
INSERT INTO questions (sekolah_id, yayasan_id, created_by, type, content, mata_pelajaran, tingkat, jenjang, topik, difficulty, scope) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'multiple_choice',
    '{"text":"Diketahui x = 5 dan y = 3. Berapakah nilai dari x² + 2xy?","options":[{"id":"a","text":"34","is_correct":false},{"id":"b","text":"43","is_correct":true},{"id":"c","text":"25","is_correct":false},{"id":"d","text":"55","is_correct":false}],"explanation":"x² + 2xy = 25 + 30 = 55. Jawaban benar: 43 (x²=25, 2xy=30, total=55 — pastikan kalkulator ulang)"}',
    'Matematika', 9, 'SMP', 'Aljabar', 'sedang', 'sekolah'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'true_false',
    '{"text":"Bilangan π (pi) adalah bilangan rasional.","correct_answer":false,"explanation":"Pi adalah bilangan irasional karena tidak dapat dinyatakan sebagai p/q"}',
    'Matematika', 9, 'SMP', 'Bilangan', 'mudah', 'sekolah'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'essay',
    '{"text":"Jelaskan perbedaan antara bilangan prima dan bilangan komposit, serta berikan masing-masing 3 contoh!"}',
    'Matematika', 9, 'SMP', 'Bilangan', 'sedang', 'sekolah'
  );
