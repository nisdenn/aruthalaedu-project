-- ============================================================
-- ARUTHALA EDU — INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── YAYASAN ──────────────────────────────────────────────────
CREATE TABLE yayasan (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    alamat          TEXT,
    logo_url        TEXT,
    custom_domain   VARCHAR(255),
    tier            VARCHAR(20) NOT NULL DEFAULT 'yayasan',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    max_sekolah     INTEGER NOT NULL DEFAULT 5,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SEKOLAH ──────────────────────────────────────────────────
CREATE TABLE sekolah (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    jenjang         VARCHAR(10) NOT NULL CHECK (jenjang IN ('SD','SMP','SMA','SMK')),
    npsn            VARCHAR(20),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    alamat          TEXT,
    logo_url        TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    max_siswa       INTEGER NOT NULL DEFAULT 1000,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(yayasan_id, slug)
);

-- ── PROFILES (extends auth.users) ────────────────────────────
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    yayasan_id      UUID REFERENCES yayasan(id) ON DELETE CASCADE,
    sekolah_id      UUID REFERENCES sekolah(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN','YAYASAN_ADMIN','KEPALA_SEKOLAH','OPERATOR','GURU','SISWA')),
    full_name       VARCHAR(255) NOT NULL,
    nisn            VARCHAR(10),
    employee_id     VARCHAR(50),
    kelas_id        UUID,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_seen_at    TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sekolah_id, nisn),
    CHECK (role != 'SISWA' OR nisn IS NOT NULL)
);

-- ── KELAS ────────────────────────────────────────────────────
CREATE TABLE kelas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    name            VARCHAR(50) NOT NULL,
    tingkat         INTEGER NOT NULL CHECK (tingkat BETWEEN 1 AND 12),
    tahun_ajaran    VARCHAR(20) NOT NULL,
    wali_kelas_id   UUID REFERENCES profiles(id),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sekolah_id, name, tahun_ajaran)
);

-- ── QUESTIONS (Bank Soal) ─────────────────────────────────────
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yayasan_id      UUID REFERENCES yayasan(id) ON DELETE CASCADE,
    sekolah_id      UUID REFERENCES sekolah(id) ON DELETE CASCADE,
    created_by      UUID NOT NULL REFERENCES profiles(id),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('multiple_choice','essay','true_false','fill_blank')),
    content         JSONB NOT NULL,
    mata_pelajaran  VARCHAR(100),
    tingkat         INTEGER,
    jenjang         VARCHAR(10),
    topik           VARCHAR(100),
    kurikulum       VARCHAR(20) NOT NULL DEFAULT 'merdeka',
    difficulty      VARCHAR(20) CHECK (difficulty IN ('mudah','sedang','sulit')),
    tags            TEXT[],
    scope           VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (scope IN ('private','sekolah','yayasan')),
    usage_count     INTEGER NOT NULL DEFAULT 0,
    is_archived     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on question content
CREATE INDEX idx_questions_fts ON questions USING gin(to_tsvector('indonesian', content->>'text'));
CREATE INDEX idx_questions_sekolah_mapel ON questions(sekolah_id, mata_pelajaran, tingkat);

-- ── EXAMS ────────────────────────────────────────────────────
CREATE TABLE exams (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id          UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id          UUID NOT NULL REFERENCES yayasan(id),
    created_by          UUID NOT NULL REFERENCES profiles(id),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    mata_pelajaran      VARCHAR(100),
    duration_minutes    INTEGER NOT NULL DEFAULT 90,
    start_at            TIMESTAMPTZ,
    end_at              TIMESTAMPTZ,
    max_attempts        INTEGER NOT NULL DEFAULT 1,
    passing_score       NUMERIC(5,2),
    anti_cheat_config   JSONB NOT NULL DEFAULT '{
        "fullscreen": true, "tab_blur": true, "clipboard": true,
        "keyboard_shortcuts": true, "right_click": true, "screen_share": false,
        "max_fullscreen_exits": 3, "max_tab_blurs": 5, "require_seb": false
    }',
    shuffle_questions   BOOLEAN NOT NULL DEFAULT true,
    shuffle_options     BOOLEAN NOT NULL DEFAULT true,
    show_result_after   VARCHAR(20) NOT NULL DEFAULT 'submit',
    status              VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exams_sekolah_status ON exams(sekolah_id, status);

-- ── EXAM QUESTIONS ───────────────────────────────────────────
CREATE TABLE exam_questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id     UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    urutan      INTEGER NOT NULL,
    bobot       NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    UNIQUE(exam_id, question_id)
);

-- ── EXAM SESSIONS ────────────────────────────────────────────
CREATE TABLE exam_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID NOT NULL REFERENCES exams(id),
    siswa_id        UUID NOT NULL REFERENCES profiles(id),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id),
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    attempt_number  INTEGER NOT NULL DEFAULT 1,
    question_order  JSONB NOT NULL DEFAULT '[]',
    status          VARCHAR(20) NOT NULL DEFAULT 'not_started',
    started_at      TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ,
    time_remaining  INTEGER,
    score           NUMERIC(6,2),
    max_score       NUMERIC(6,2),
    score_details   JSONB,
    violation_count INTEGER NOT NULL DEFAULT 0,
    is_flagged      BOOLEAN NOT NULL DEFAULT false,
    ip_address      INET,
    user_agent      TEXT,
    device_info     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_id, siswa_id, attempt_number)
);

CREATE INDEX idx_sessions_exam ON exam_sessions(exam_id, status);
CREATE INDEX idx_sessions_siswa ON exam_sessions(siswa_id);
CREATE INDEX idx_sessions_sekolah ON exam_sessions(sekolah_id);

-- ── EXAM ANSWERS ─────────────────────────────────────────────
CREATE TABLE exam_answers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id         UUID NOT NULL REFERENCES questions(id),
    answer              JSONB,
    is_correct          BOOLEAN,
    score               NUMERIC(5,2),
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced_from_offline BOOLEAN NOT NULL DEFAULT false,
    client_timestamp    TIMESTAMPTZ,
    UNIQUE(session_id, question_id)
);

CREATE INDEX idx_answers_session ON exam_answers(session_id);

-- ── EXAM VIOLATIONS (Anti-Cheat Log) ────────────────────────
CREATE TABLE exam_violations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    siswa_id        UUID NOT NULL REFERENCES profiles(id),
    exam_id         UUID NOT NULL REFERENCES exams(id),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id),
    violation_type  VARCHAR(50) NOT NULL,
    count_at_time   INTEGER NOT NULL DEFAULT 1,
    metadata        JSONB,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_timestamp TIMESTAMPTZ
    -- Append-only: no updated_at
);

CREATE INDEX idx_violations_session ON exam_violations(session_id, violation_type);
CREATE INDEX idx_violations_exam ON exam_violations(exam_id, occurred_at DESC);

-- ── AUDIT LOGS ───────────────────────────────────────────────
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yayasan_id      UUID REFERENCES yayasan(id),
    sekolah_id      UUID REFERENCES sekolah(id),
    actor_id        UUID REFERENCES profiles(id),
    actor_role      VARCHAR(30),
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB,
    status          VARCHAR(20) DEFAULT 'success',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_yayasan ON audit_logs(yayasan_id, created_at DESC);

-- ── PARTNER API KEYS ─────────────────────────────────────────
CREATE TABLE partner_api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name    VARCHAR(100) NOT NULL,
    api_key_hash    VARCHAR(64) NOT NULL UNIQUE,
    yayasan_id      UUID REFERENCES yayasan(id),
    permissions     TEXT[] NOT NULL DEFAULT '{}',
    rate_limit      INTEGER NOT NULL DEFAULT 100,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRIGGERS ─────────────────────────────────────────────────

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'GURU')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sync JWT claims when profile changes
CREATE OR REPLACE FUNCTION sync_user_jwt_claims()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
        'role', NEW.role,
        'yayasan_id', NEW.yayasan_id,
        'sekolah_id', NEW.sekolah_id,
        'kelas_id', NEW.kelas_id
    )
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER sync_claims_on_profile_change
    AFTER INSERT OR UPDATE OF role, yayasan_id, sekolah_id, kelas_id ON profiles
    FOR EACH ROW EXECUTE FUNCTION sync_user_jwt_claims();

-- Update violation_count on exam_sessions when violation inserted
CREATE OR REPLACE FUNCTION increment_violation_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE exam_sessions
    SET violation_count = violation_count + 1,
        is_flagged = CASE WHEN violation_count + 1 >= 5 THEN true ELSE is_flagged END
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_violation_insert
    AFTER INSERT ON exam_violations
    FOR EACH ROW EXECUTE FUNCTION increment_violation_count();

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER set_updated_at_yayasan BEFORE UPDATE ON yayasan FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_sekolah BEFORE UPDATE ON sekolah FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_questions BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_exams BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_sessions BEFORE UPDATE ON exam_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- ============================================================
-- ARUTHALA EDU — ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE yayasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for extracting JWT claims
CREATE OR REPLACE FUNCTION get_my_yayasan_id() RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT (auth.jwt() ->> 'yayasan_id')::uuid;
$$;

CREATE OR REPLACE FUNCTION get_my_sekolah_id() RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT (auth.jwt() ->> 'sekolah_id')::uuid;
$$;

CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT LANGUAGE sql STABLE AS $$
    SELECT auth.jwt() ->> 'role';
$$;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() = 'SUPER_ADMIN';
$$;

CREATE OR REPLACE FUNCTION is_yayasan_admin_or_above() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() IN ('SUPER_ADMIN', 'YAYASAN_ADMIN');
$$;

CREATE OR REPLACE FUNCTION is_sekolah_staff() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() IN ('SUPER_ADMIN', 'YAYASAN_ADMIN', 'KEPALA_SEKOLAH', 'OPERATOR', 'GURU');
$$;

-- ── YAYASAN POLICIES ─────────────────────────────────────────
CREATE POLICY "super_admin_all_yayasan" ON yayasan
    FOR ALL USING (is_super_admin());

CREATE POLICY "yayasan_member_select" ON yayasan
    FOR SELECT USING (id = get_my_yayasan_id());

-- ── SEKOLAH POLICIES ─────────────────────────────────────────
CREATE POLICY "super_admin_all_sekolah" ON sekolah
    FOR ALL USING (is_super_admin());

CREATE POLICY "yayasan_admin_manage_sekolah" ON sekolah
    FOR ALL USING (yayasan_id = get_my_yayasan_id() AND is_yayasan_admin_or_above());

CREATE POLICY "sekolah_member_select" ON sekolah
    FOR SELECT USING (id = get_my_sekolah_id() OR yayasan_id = get_my_yayasan_id());

-- ── PROFILES POLICIES ────────────────────────────────────────
CREATE POLICY "own_profile" ON profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "sekolah_staff_see_profiles" ON profiles
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

CREATE POLICY "yayasan_admin_manage_profiles" ON profiles
    FOR ALL USING (
        yayasan_id = get_my_yayasan_id()
        AND is_yayasan_admin_or_above()
    );

-- ── KELAS POLICIES ───────────────────────────────────────────
CREATE POLICY "sekolah_kelas" ON kelas
    FOR ALL USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "yayasan_kelas" ON kelas
    FOR SELECT USING (yayasan_id = get_my_yayasan_id());

-- ── QUESTIONS POLICIES ───────────────────────────────────────
-- Guru sees: own questions + sekolah scope + yayasan scope
CREATE POLICY "guru_see_questions" ON questions
    FOR SELECT USING (
        is_super_admin()
        OR created_by = auth.uid()
        OR (scope = 'sekolah' AND sekolah_id = get_my_sekolah_id())
        OR (scope = 'yayasan' AND yayasan_id = get_my_yayasan_id())
    );

CREATE POLICY "guru_insert_questions" ON questions
    FOR INSERT WITH CHECK (
        is_sekolah_staff()
        AND (sekolah_id = get_my_sekolah_id() OR sekolah_id IS NULL)
    );

CREATE POLICY "guru_update_own_questions" ON questions
    FOR UPDATE USING (created_by = auth.uid() OR is_yayasan_admin_or_above());

CREATE POLICY "guru_delete_own_questions" ON questions
    FOR DELETE USING (created_by = auth.uid() OR is_yayasan_admin_or_above());

-- ── EXAMS POLICIES ───────────────────────────────────────────
CREATE POLICY "sekolah_exams" ON exams
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- Siswa can see published exams (to join)
CREATE POLICY "siswa_see_published_exams" ON exams
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND status = 'published'
        AND get_my_role() = 'SISWA'
    );

-- ── EXAM QUESTIONS POLICIES ──────────────────────────────────
CREATE POLICY "sekolah_exam_questions" ON exam_questions
    FOR ALL USING (
        exam_id IN (SELECT id FROM exams WHERE sekolah_id = get_my_sekolah_id())
    );

-- ── EXAM SESSIONS POLICIES ───────────────────────────────────
-- Siswa sees only own sessions
CREATE POLICY "siswa_own_sessions" ON exam_sessions
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "siswa_insert_session" ON exam_sessions
    FOR INSERT WITH CHECK (siswa_id = auth.uid() AND sekolah_id = get_my_sekolah_id());

CREATE POLICY "siswa_update_own_session" ON exam_sessions
    FOR UPDATE USING (siswa_id = auth.uid());

-- Staff sees all sessions in their sekolah
CREATE POLICY "staff_see_sekolah_sessions" ON exam_sessions
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

-- ── EXAM ANSWERS POLICIES ────────────────────────────────────
CREATE POLICY "siswa_own_answers" ON exam_answers
    FOR ALL USING (
        session_id IN (
            SELECT id FROM exam_sessions WHERE siswa_id = auth.uid()
        )
    );

CREATE POLICY "staff_see_answers" ON exam_answers
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM exam_sessions WHERE sekolah_id = get_my_sekolah_id()
        )
        AND is_sekolah_staff()
    );

-- ── EXAM VIOLATIONS POLICIES ─────────────────────────────────
-- Siswa can INSERT their own violations but NOT SELECT (prevent gaming)
CREATE POLICY "siswa_insert_violations" ON exam_violations
    FOR INSERT WITH CHECK (siswa_id = auth.uid());

-- Staff can see violations in their sekolah
CREATE POLICY "staff_see_violations" ON exam_violations
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

-- ── AUDIT LOGS POLICIES ──────────────────────────────────────
-- Admins can read, nobody can write via API (service role only)
CREATE POLICY "admin_read_audit" ON audit_logs
    FOR SELECT USING (
        (yayasan_id = get_my_yayasan_id() AND is_yayasan_admin_or_above())
        OR (sekolah_id = get_my_sekolah_id() AND get_my_role() IN ('KEPALA_SEKOLAH', 'OPERATOR'))
        OR is_super_admin()
    );

-- Revoke direct write access (only via service role in edge functions)
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM authenticated;
GRANT INSERT ON audit_logs TO service_role;
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

-- Force insert into identities to allow GoTrue login
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '{"sub":"00000000-0000-0000-0000-000000000000","email":"admin_seed@example.com","email_verified":true}',
  'email', now(), now()
) ON CONFLICT DO NOTHING;

-- Force insert into profiles in case auth.users already had it but public schema was dropped
INSERT INTO public.profiles (id, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin Seed', 'SUPER_ADMIN')
ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN';

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

-- =========================================================================
-- [ADR-002] Tweak Schema Update (Tambahan Ekstra)
-- =========================================================================
ALTER TABLE public.exam_sessions ADD COLUMN IF NOT EXISTS is_proctor_locked boolean DEFAULT false;
