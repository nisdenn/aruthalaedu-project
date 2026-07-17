-- ============================================================
-- ARUTHALA EDU — INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── YAYASAN ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS yayasan (
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
CREATE TABLE IF NOT EXISTS sekolah (
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
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS kelas (
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
CREATE TABLE IF NOT EXISTS questions (
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
CREATE INDEX IF NOT EXISTS idx_questions_fts ON questions USING gin(to_tsvector('indonesian', content->>'text'));
CREATE INDEX IF NOT EXISTS idx_questions_sekolah_mapel ON questions(sekolah_id, mata_pelajaran, tingkat);

-- ── EXAMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
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

CREATE INDEX IF NOT EXISTS idx_exams_sekolah_status ON exams(sekolah_id, status);

-- ── EXAM QUESTIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id     UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    urutan      INTEGER NOT NULL,
    bobot       NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    UNIQUE(exam_id, question_id)
);

-- ── EXAM SESSIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_sessions (
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

CREATE INDEX IF NOT EXISTS idx_sessions_exam ON exam_sessions(exam_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_siswa ON exam_sessions(siswa_id);
CREATE INDEX IF NOT EXISTS idx_sessions_sekolah ON exam_sessions(sekolah_id);

-- ── EXAM ANSWERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_answers (
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

CREATE INDEX IF NOT EXISTS idx_answers_session ON exam_answers(session_id);

-- ── EXAM VIOLATIONS (Anti-Cheat Log) ────────────────────────
CREATE TABLE IF NOT EXISTS exam_violations (
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

CREATE INDEX IF NOT EXISTS idx_violations_session ON exam_violations(session_id, violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_exam ON exam_violations(exam_id, occurred_at DESC);

-- ── AUDIT LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_audit_yayasan ON audit_logs(yayasan_id, created_at DESC);

-- ── PARTNER API KEYS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_api_keys (
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
