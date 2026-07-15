"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Shield } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const STEPS = ["Info Dasar", "Pilih Soal", "Anti-Cheat", "Review & Publish"];

export default function BuatUjianPage() {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bankSoal, setBankSoal] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  // Fetch bank soal
  useEffect(() => {
    async function fetchSoal() {
      const supabase = createClient();
      const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (data) setBankSoal(data);
    }
    fetchSoal();
  }, []);

  // Form state
  const [title, setTitle] = useState("");
  const [mapel, setMapel] = useState("");
  const [duration, setDuration] = useState(90);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [showResult, setShowResult] = useState("manual");
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleOpts, setShuffleOpts] = useState(true);
  const [selectedQ, setSelectedQ] = useState<string[]>([]);
  const [ac, setAc] = useState({
    fullscreen: true, tab_blur: true, clipboard: true,
    keyboard_shortcuts: true, right_click: true,
    max_fullscreen_exits: 3, max_tab_blurs: 5, require_seb: false,
  });

  const inp = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--t1)", outline: "none",
    padding: "10px 12px", fontSize: 14, width: "100%",
  };

  const toggleQ = (id: string) => {
    setSelectedQ(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);
  };

  const handlePublish = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : 'b17a282a-6a38-4381-9dff-e8ff3865dfd8'; // Fallback to Owner UUID if not logged in
    
    // Dapatkan sekolah_id guru
    let sekolahId = '22222222-2222-2222-2222-222222222222'; // fallback default
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('sekolah_id').eq('id', user.id).single();
      if (profile?.sekolah_id) {
        sekolahId = profile.sekolah_id;
      }
    }

    // Format tanggal ke ISO String agar zona waktu akurat
    const formattedStart = startAt ? new Date(startAt).toISOString() : null;
    const formattedEnd = endAt ? new Date(endAt).toISOString() : null;

    // 1. Insert Exam
    const { data: examData, error: examError } = await supabase.from('exams').insert({
      title: title,
      description: "",
      mata_pelajaran: mapel,
      sekolah_id: sekolahId,
      duration_minutes: duration,
      start_at: formattedStart,
      end_at: formattedEnd,
      max_attempts: maxAttempts,
      passing_score: passingScore,
      anti_cheat_config: ac,
      shuffle_questions: shuffleQ,
      shuffle_options: shuffleOpts,
      show_result_after: showResult,
      status: 'published',
      created_by: userId
    }).select().single();

    if (examError || !examData) {
      console.error(examError);
      alert("Gagal menyimpan ujian.");
      setSaving(false); return;
    }

    // 2. Insert Exam Questions
    if (selectedQ.length > 0) {
      const eqPayload = selectedQ.map((qId, index) => ({
        exam_id: examData.id,
        question_id: qId,
        urutan: index + 1,
        bobot: 1
      }));
      await supabase.from('exam_questions').insert(eqPayload);
    }

    setSaving(false);
    router.push("/ujian");
  };

  return (
    <div className="p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/ujian" className="p-2 rounded-xl border border-white/80 bg-white/70 text-gray-500 no-underline shadow-[0_6px_16px_rgba(57,111,190,0.06)]">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-slate-900">Buat Ujian Baru</h1>
          <p style={{ color: "var(--t2)", fontSize: 13 }}>Langkah {step + 1} dari {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center" style={{ flex: "none" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: i < step ? "var(--green)" : i === step ? "var(--accent)" : "var(--surface-2, #11151F)",
                  border: `2px solid ${i <= step ? (i < step ? "var(--green)" : "var(--accent)") : "var(--border)"}`,
                  color: i <= step ? "#fff" : "var(--t3)",
                }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === step ? "var(--t1)" : "var(--t3)", marginTop: 6, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 mx-2 mb-4" style={{ background: i < step ? "var(--green)" : "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4">

        {/* STEP 0: Info Dasar */}
        {step === 0 && (
          <>
            <div className="p-5 rounded-[1.25rem] card">
              <h2 className="text-base font-semibold mb-4 tracking-[-0.02em] text-slate-800">Informasi Ujian</h2>
              <div className="space-y-4">
                <div>
                  <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Judul Ujian *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="cth: UTS Matematika Kelas 9A" style={inp} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Mata Pelajaran</label>
                    <input value={mapel} onChange={e => setMapel(e.target.value)} placeholder="cth: Matematika" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Durasi (menit) *</label>
                    <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={10} max={480} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Waktu Mulai</label>
                    <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Waktu Selesai</label>
                    <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Maks. Percobaan</label>
                    <select value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} style={{ ...inp, cursor: "pointer" }}>
                      {[1, 2, 3].map(n => <option key={n} value={n}>{n}x</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Nilai KKM (%)</label>
                    <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} min={0} max={100} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Tampilkan Hasil</label>
                  <select value={showResult} onChange={e => setShowResult(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                    <option value="submit">Langsung setelah submit</option>
                    <option value="deadline">Setelah batas waktu</option>
                    <option value="manual">Manual (guru rilis)</option>
                  </select>
                </div>
                <div className="flex gap-6">
                  {[{ label: "Acak urutan soal", val: shuffleQ, set: setShuffleQ }, { label: "Acak opsi jawaban", val: shuffleOpts, set: setShuffleOpts }].map(({ label, val, set }) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => set(!val)}
                        className="w-10 h-5 rounded-full relative transition-all"
                        style={{ background: val ? "var(--accent)" : "rgba(255,255,255,0.1)" }}>
                        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                          style={{ left: val ? "calc(100% - 18px)" : 2 }} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--t2)" }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 1: Pilih Soal */}
        {step === 1 && (
          <div className="p-5 rounded-[1.25rem] card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold tracking-[-0.02em] text-slate-800">Pilih Soal</h2>
              <span style={{ fontSize: 13, color: "var(--accent)" }}>{selectedQ.length} dipilih</span>
            </div>
            <div className="space-y-2">
              {bankSoal.map(q => (
                <div key={q.id} onClick={() => toggleQ(q.id)}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                  style={{ background: selectedQ.includes(q.id) ? "var(--accent-dim)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedQ.includes(q.id) ? "var(--border-a)" : "var(--border)"}` }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: selectedQ.includes(q.id) ? "var(--accent)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${selectedQ.includes(q.id) ? "var(--accent)" : "var(--border)"}` }}>
                    {selectedQ.includes(q.id) && <Check size={11} color="white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, color: "var(--t1)", marginBottom: 3 }}>{q.content?.text || "(tanpa teks)"}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{q.mata_pelajaran} · Kelas {q.tingkat} · {q.type}</div>
                  </div>
                </div>
              ))}
              {bankSoal.length === 0 && (
                <div className="text-center py-6 text-sm" style={{ color: "var(--t3)" }}>Belum ada soal di Bank Soal.</div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Anti-Cheat */}
        {step === 2 && (
          <div className="p-5 rounded-[1.25rem] card">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={18} style={{ color: "var(--accent)" }} />
              <h2 className="text-base font-semibold tracking-[-0.02em] text-slate-800">Konfigurasi Anti-Cheat</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "fullscreen", label: "Fullscreen Enforcer", desc: "Kunci halaman jika siswa keluar dari layar penuh" },
                { key: "tab_blur", label: "Tab Blur Detector", desc: "Deteksi jika siswa pindah tab atau minimize window" },
                { key: "clipboard", label: "Clipboard Blocker", desc: "Blokir copy, paste, dan cut selama ujian" },
                { key: "keyboard_shortcuts", label: "Keyboard Shortcut Blocker", desc: "Blokir F12, Ctrl+C, Ctrl+Shift+I, dll" },
                { key: "right_click", label: "Right-Click Disable", desc: "Nonaktifkan menu klik kanan" },
                { key: "require_seb", label: "Wajib Safe Exam Browser", desc: "Siswa hanya bisa akses ujian via SEB" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--t2)" }}>{desc}</div>
                  </div>
                  <div onClick={() => setAc(a => ({ ...a, [key]: !(a as Record<string, unknown>)[key] }))}
                    className="w-10 h-5 rounded-full relative transition-all cursor-pointer"
                    style={{ background: (ac as Record<string, unknown>)[key] ? "var(--accent)" : "rgba(255,255,255,0.1)" }}>
                    <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ left: (ac as Record<string, unknown>)[key] ? "calc(100% - 18px)" : 2 }} />
                  </div>
                </div>
              ))}
              {ac.fullscreen && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Maks. keluar fullscreen sebelum force-submit</label>
                    <input type="number" value={ac.max_fullscreen_exits} onChange={e => setAc(a => ({ ...a, max_fullscreen_exits: Number(e.target.value) }))} min={1} max={10} style={{ ...inp, width: "auto" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Maks. pindah tab sebelum force-submit</label>
                    <input type="number" value={ac.max_tab_blurs} onChange={e => setAc(a => ({ ...a, max_tab_blurs: Number(e.target.value) }))} min={1} max={20} style={{ ...inp, width: "auto" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-5 rounded-[1.25rem] card">
              <h2 className="text-base font-semibold tracking-[-0.02em] text-slate-800 mb-4">Ringkasan Ujian</h2>
              {[
                ["Judul", title || "(belum diisi)"],
                ["Mata Pelajaran", mapel || "-"],
                ["Durasi", `${duration} menit`],
                ["Mulai", startAt || "Tidak dibatasi"],
                ["Jumlah Soal", `${selectedQ.length} soal`],
                ["Nilai KKM", `${passingScore}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--t2)" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3"
              style={{ background: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <Shield size={18} style={{ color: "var(--green)", flexShrink: 0 }} />
              <div style={{ fontSize: 13 }}>
                {[ac.fullscreen && "Fullscreen", ac.tab_blur && "Tab Monitor", ac.clipboard && "Clipboard Block"].filter(Boolean).join(" · ")} diaktifkan
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--t2)", opacity: step === 0 ? 0.4 : 1 }}>
          <ArrowLeft size={15} /> Sebelumnya
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Berikutnya <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={handlePublish} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--green)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Mempublikasikan..." : "Publikasikan Ujian"}
          </button>
        )}
      </div>
    </div>
  );
}
