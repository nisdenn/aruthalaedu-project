// ─── ENTITIES ────────────────────────────────────────────────────────────────

export type Role =
  | "SUPER_ADMIN"
  | "YAYASAN_ADMIN"
  | "KEPALA_SEKOLAH"
  | "OPERATOR"
  | "GURU"
  | "SISWA";

export interface PersonalSchedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export type Jenjang = "SD" | "SMP" | "SMA" | "SMK";

export type Kurikulum = "k13" | "merdeka";

export type QuestionType =
  | "multiple_choice"
  | "essay"
  | "true_false"
  | "fill_blank";

export type QuestionScope = "private" | "sekolah" | "yayasan";

export type ExamStatus = "draft" | "published" | "closed";

export type SessionStatus =
  | "not_started"
  | "in_progress"
  | "paused"
  | "submitted"
  | "graded";

export type ViolationType =
  | "fullscreen_exit"
  | "tab_blur"
  | "copy_paste"
  | "keyboard_shortcut"
  | "right_click"
  | "screen_share";

export type ShowResultAfter = "submit" | "deadline" | "manual";

// ─── SUPABASE ENTITIES ───────────────────────────────────────────────────────

export interface Yayasan {
  id: string;
  name: string;
  slug: string;
  email: string;
  logo_url?: string;
  tier: "starter" | "yayasan" | "enterprise";
  is_active: boolean;
  max_sekolah: number;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Sekolah {
  id: string;
  yayasan_id: string;
  name: string;
  slug: string;
  jenjang: Jenjang;
  npsn?: string;
  is_active: boolean;
  max_siswa: number;
  created_at: string;
}

export interface Profile {
  id: string;
  yayasan_id?: string;
  sekolah_id?: string;
  role: Role;
  full_name: string;
  nisn?: string;
  employee_id?: string;
  kelas_id?: string;
  avatar_url?: string;
  is_active: boolean;
  last_seen_at?: string;
  created_at: string;
}

export interface Kelas {
  id: string;
  sekolah_id: string;
  yayasan_id: string;
  name: string;
  tingkat: number;
  tahun_ajaran: string;
  wali_kelas_id?: string;
  is_active: boolean;
}

// ─── QUESTION ────────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuestionContent {
  text: string;
  media_url?: string;
  options?: QuestionOption[];
  correct_answer?: string | boolean;
  explanation?: string;
}

export interface Question {
  id: string;
  yayasan_id?: string;
  sekolah_id?: string;
  created_by: string;
  type: QuestionType;
  content: QuestionContent;
  mata_pelajaran?: string;
  tingkat?: number;
  jenjang?: Jenjang;
  topik?: string;
  kurikulum: Kurikulum;
  difficulty?: "mudah" | "sedang" | "sulit";
  tags?: string[];
  scope: QuestionScope;
  usage_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  creator?: Pick<Profile, "full_name">;
}

// ─── EXAM ────────────────────────────────────────────────────────────────────

export interface AntiCheatConfig {
  fullscreen: boolean;
  tab_blur: boolean;
  clipboard: boolean;
  keyboard_shortcuts: boolean;
  right_click: boolean;
  screen_share: boolean;
  max_fullscreen_exits: number;
  max_tab_blurs: number;
  require_seb: boolean;
}

export const DEFAULT_ANTI_CHEAT: AntiCheatConfig = {
  fullscreen: true,
  tab_blur: true,
  clipboard: true,
  keyboard_shortcuts: true,
  right_click: true,
  screen_share: false,
  max_fullscreen_exits: 3,
  max_tab_blurs: 5,
  require_seb: false,
};

export interface Exam {
  id: string;
  sekolah_id: string;
  yayasan_id: string;
  created_by: string;
  title: string;
  description?: string;
  mata_pelajaran?: string;
  duration_minutes: number;
  start_at?: string;
  end_at?: string;
  max_attempts: number;
  passing_score?: number;
  anti_cheat_config: AntiCheatConfig;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_result_after: ShowResultAfter;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
  // Joined
  question_count?: number;
  session_count?: number;
  submitted_count?: number;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  urutan: number;
  bobot: number;
  question?: Question;
}

// ─── SESSION ─────────────────────────────────────────────────────────────────

export interface QuestionOrderItem {
  question_id: string;
  options_order?: string[];
}

export interface ExamSession {
  id: string;
  exam_id: string;
  siswa_id: string;
  sekolah_id: string;
  yayasan_id: string;
  attempt_number: number;
  question_order: QuestionOrderItem[];
  status: SessionStatus;
  started_at?: string;
  submitted_at?: string;
  time_remaining?: number;
  score?: number;
  max_score?: number;
  violation_count: number;
  is_flagged: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Joined
  siswa?: Pick<Profile, "id" | "full_name" | "nisn">;
}

export interface ExamAnswer {
  id: string;
  session_id: string;
  question_id: string;
  answer?: { selected?: string | boolean; text?: string };
  is_correct?: boolean;
  score?: number;
  answered_at: string;
  synced_from_offline: boolean;
  client_timestamp?: string;
}

export interface ExamViolation {
  id: string;
  session_id: string;
  siswa_id: string;
  exam_id: string;
  sekolah_id: string;
  violation_type: ViolationType;
  count_at_time: number;
  metadata?: Record<string, unknown>;
  occurred_at: string;
  client_timestamp?: string;
}

// ─── OFFLINE STORAGE ─────────────────────────────────────────────────────────

export interface LocalAnswer {
  question_id: string;
  answer: ExamAnswer["answer"];
  timestamp: number;
  synced: boolean;
}

export interface LocalExamState {
  session_id: string;
  exam_id: string;
  token: string;
  started_at: number;
  time_remaining: number;
  answers: Record<string, LocalAnswer>;
  current_question_index: number;
  status: SessionStatus;
}

// ─── API RESPONSES ───────────────────────────────────────────────────────────

export interface ExamStartResponse {
  session_id: string;
  questions: Array<{
    id: string;
    type: QuestionType;
    content: Omit<QuestionContent, "correct_answer"> & {
      options?: Omit<QuestionOption, "is_correct">[];
    };
  }>;
  duration_seconds: number;
  anti_cheat_config: AntiCheatConfig;
  exam_title: string;
  total_questions: number;
}

export interface ExamSubmitResponse {
  session_id: string;
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  time_spent_seconds: number;
  show_answers: boolean;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  total_siswa: number;
  total_guru: number;
  total_ujian: number;
  ujian_aktif: number;
  total_sekolah?: number;
}
