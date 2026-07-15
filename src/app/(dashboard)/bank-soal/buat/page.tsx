"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

type QuestionType = "multiple_choice" | "essay" | "true_false" | "fill_blank";

interface Option { id: string; text: string; is_correct: boolean; }

export default function BuatSoalPage() {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [text, setText] = useState("");
  
  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);
  const [options, setOptions] = useState<Option[]>([
    { id: "a", text: "", is_correct: false },
    { id: "b", text: "", is_correct: false },
    { id: "c", text: "", is_correct: false },
    { id: "d", text: "", is_correct: false },
  ]);
  const [explanation, setExplanation] = useState("");
  const [mapel, setMapel] = useState("");
  const [tingkat, setTingkat] = useState("9");
  const [topik, setTopik] = useState("");
  const [difficulty, setDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [scope, setScope] = useState<"private" | "sekolah" | "yayasan">("sekolah");
  const [kurikulum, setKurikulum] = useState("merdeka");
  const [saving, setSaving] = useState(false);

  const TYPE_OPTIONS = [
    { value: "multiple_choice", label: "Pilihan Ganda" },
    { value: "essay", label: "Esai" },
    { value: "true_false", label: "Benar / Salah" },
    { value: "fill_blank", label: "Isian Singkat" },
  ];

  const setCorrect = (id: string) => {
    setOptions(options.map(o => ({ ...o, is_correct: o.id === id })));
  };
  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };
  const addOption = () => {
    const ids = ["a", "b", "c", "d", "e", "f"];
    setOptions([...options, { id: ids[options.length] ?? String(options.length), text: "", is_correct: false }]);
  };
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    
    // Get current user id
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : 'b17a282a-6a38-4381-9dff-e8ff3865dfd8'; // Fallback to Owner UUID if not logged in

    const { error } = await supabase.from('questions').insert({
      type: type,
      content: { text, options, explanation },
      mata_pelajaran: mapel || 'Umum',
      tingkat: parseInt(tingkat) || 9,
      jenjang: 'SMP',
      topik: topik || 'Umum',
      kurikulum: kurikulum,
      difficulty: difficulty,
      tags: [],
      scope: scope,
      created_by: userId
    });

    setSaving(false);
    if (error) {
      console.error(error);
      alert("Gagal menyimpan soal: " + error.message);
    } else {
      router.push("/bank-soal");
    }
  };

  const inputStyle = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--t1)", outline: "none", width: "100%",
    padding: "10px 12px", fontSize: 14,
  };

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/bank-soal" className="p-2 rounded-lg transition-all"
          style={{ color: "var(--t2)", border: "1px solid var(--border)" }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "var(--t1)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--t2)"; }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700 }}>Buat Soal Baru</h1>
          <p style={{ color: "var(--t2)", fontSize: 13 }}>Isi detail soal dan simpan ke bank soal</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Tipe Soal */}
        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 12 }}>
            TIPE SOAL
          </label>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(t => (
              <button key={t.value} onClick={() => setType(t.value as QuestionType)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: type === t.value ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${type === t.value ? "var(--border-a)" : "var(--border)"}`,
                  color: type === t.value ? "#A5ACFF" : "var(--t2)",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pertanyaan */}
        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 10 }}>
            TEKS PERTANYAAN *
          </label>
          <textarea value={text} onChange={e => setText(e.target.value)}
            rows={4} placeholder="Tulis pertanyaan di sini..."
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </div>

        {/* Opsi Jawaban (MC) */}
        {type === "multiple_choice" && (
          <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 12 }}>
              OPSI JAWABAN <span style={{ color: "var(--t3)", fontWeight: 400 }}>(klik lingkaran untuk tandai jawaban benar)</span>
            </label>
            <div className="space-y-3">
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <button onClick={() => setCorrect(opt.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: opt.is_correct ? "var(--green)" : "rgba(255,255,255,0.05)",
                      border: `2px solid ${opt.is_correct ? "var(--green)" : "var(--border)"}`,
                    }}>
                    {opt.is_correct && <CheckCircle size={13} color="white" />}
                  </button>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--t3)", width: 20, fontSize: 14 }}>
                    {opt.id.toUpperCase()}.
                  </span>
                  <input value={opt.text} onChange={e => updateOption(opt.id, e.target.value)}
                    placeholder={`Opsi ${opt.id.toUpperCase()}`}
                    style={{ ...inputStyle, width: "auto", flex: 1 }} />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(opt.id)} className="p-1.5 rounded"
                      style={{ color: "var(--t3)" }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--t3)"; }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button onClick={addOption}
                  className="flex items-center gap-2 text-sm mt-2 transition-all"
                  style={{ color: "var(--t3)" }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--t3)"; }}>
                  <Plus size={14} /> Tambah opsi
                </button>
              )}
            </div>
          </div>
        )}

        {/* True/False */}
        {type === "true_false" && (
          <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 12 }}>
              JAWABAN BENAR
            </label>
            <div className="flex gap-3">
              {["Benar", "Salah"].map(v => (
                <button key={v} className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--t2)",
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Essay/Fill blank */}
        {(type === "essay" || type === "fill_blank") && (
          <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 10 }}>
              {type === "fill_blank" ? "KUNCI JAWABAN" : "PANDUAN PENILAIAN (OPSIONAL)"}
            </label>
            <textarea rows={3} placeholder={type === "fill_blank" ? "Jawaban yang diharapkan..." : "Panduan untuk menilai esai..."}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        )}

        {/* Pembahasan */}
        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 10 }}>
            PEMBAHASAN <span style={{ color: "var(--t3)", fontWeight: 400 }}>(opsional, ditampilkan setelah ujian)</span>
          </label>
          <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
            rows={3} placeholder="Penjelasan jawaban..."
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* Metadata */}
        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 14 }}>
            METADATA
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Mata Pelajaran</label>
              <input value={mapel} onChange={e => setMapel(e.target.value)} placeholder="cth: Matematika"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Topik</label>
              <input value={topik} onChange={e => setTopik(e.target.value)} placeholder="cth: Aljabar"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Kelas</label>
              <select value={tingkat} onChange={e => setTingkat(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Kelas {n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Kesulitan</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Kurikulum</label>
              <select value={kurikulum} onChange={e => setKurikulum(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="merdeka">Kurikulum Merdeka</option>
                <option value="k13">K13</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--t3)", display: "block", marginBottom: 6 }}>Visibilitas</label>
              <select value={scope} onChange={e => setScope(e.target.value as typeof scope)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="private">Pribadi</option>
                <option value="sekolah">Sekolah</option>
                <option value="yayasan">Yayasan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/bank-soal"
            className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--t2)", textDecoration: "none" }}>
            Batal
          </Link>
          <button onClick={handleSave} disabled={saving || !text.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            style={{ background: "var(--accent)", color: "#fff", opacity: saving || !text.trim() ? 0.6 : 1 }}>
            {saving ? "Menyimpan..." : "Simpan Soal"}
          </button>
        </div>
      </div>
    </div>
  );
}
