"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Tag, Trash2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface SubjectStats {
  name: string;
  code: string;
  scope: string;
  questionCount: number;
  examCount: number;
}

const DEFAULT_SUBJECTS: SubjectStats[] = [
  { name: "Matematika", code: "MTK", scope: "SMP/SMA", questionCount: 0, examCount: 0 },
  { name: "Bahasa Indonesia", code: "BIN", scope: "SMP/SMA", questionCount: 0, examCount: 0 },
  { name: "Ilmu Pengetahuan Alam (IPA)", code: "IPA", scope: "SMP", questionCount: 0, examCount: 0 },
  { name: "Bahasa Inggris", code: "BIG", scope: "SMP/SMA", questionCount: 0, examCount: 0 },
  { name: "Pendidikan Agama & Budi Pekerti", code: "PAI", scope: "SMP/SMA", questionCount: 0, examCount: 0 },
  { name: "Pendidikan Pancasila & Kewarganegaraan", code: "PPKN", scope: "SMP/SMA", questionCount: 0, examCount: 0 },
];

export default function SubjectManagementPage() {
  const { user } = useUserRole();
  const [subjects, setSubjects] = useState<SubjectStats[]>(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newScope, setNewScope] = useState("SMP/SMA");

  async function loadSubjectStats() {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Ambil semua soal untuk hitung mapel
      let questionsQuery = supabase.from("questions").select("mata_pelajaran");
      if (user?.sekolah_id) questionsQuery = questionsQuery.eq("sekolah_id", user.sekolah_id);
      const { data: qData } = await questionsQuery;

      // Ambil semua ujian untuk hitung mapel
      let examsQuery = supabase.from("exams").select("mata_pelajaran");
      if (user?.sekolah_id) examsQuery = examsQuery.eq("sekolah_id", user.sekolah_id);
      const { data: eData } = await examsQuery;

      const qMap = new Map<string, number>();
      (qData || []).forEach(q => {
        if (q.mata_pelajaran) {
          const key = q.mata_pelajaran.trim();
          qMap.set(key, (qMap.get(key) || 0) + 1);
        }
      });

      const eMap = new Map<string, number>();
      (eData || []).forEach(e => {
        if (e.mata_pelajaran) {
          const key = e.mata_pelajaran.trim();
          eMap.set(key, (eMap.get(key) || 0) + 1);
        }
      });

      // Gabungkan dengan default mapel plus mapel baru yang ditemukan di DB
      const allNames = new Set<string>(DEFAULT_SUBJECTS.map(s => s.name));
      qMap.forEach((_, name) => allNames.add(name));
      eMap.forEach((_, name) => allNames.add(name));

      const merged: SubjectStats[] = Array.from(allNames).map(name => {
        const foundDefault = DEFAULT_SUBJECTS.find(s => s.name.toLowerCase() === name.toLowerCase());
        const qCount = qMap.get(name) || 0;
        const eCount = eMap.get(name) || 0;
        return {
          name,
          code: foundDefault?.code || name.slice(0, 3).toUpperCase(),
          scope: foundDefault?.scope || "SMP/SMA",
          questionCount: qCount,
          examCount: eCount,
        };
      });

      setSubjects(merged);
    } catch (err) {
      console.error("Gagal memuat mata pelajaran:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjectStats();
  }, [user?.sekolah_id]);

  const totalMapel = subjects.length;
  const totalQuestionsAll = subjects.reduce((acc, curr) => acc + curr.questionCount, 0);
  const totalExamsAll = subjects.reduce((acc, curr) => acc + curr.examCount, 0);

  function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const newSub: SubjectStats = {
      name: newName.trim(),
      code: newCode.trim() || newName.trim().slice(0, 3).toUpperCase(),
      scope: newScope,
      questionCount: 0,
      examCount: 0,
    };
    setSubjects(prev => [newSub, ...prev]);
    setShowAddModal(false);
    setNewName("");
    setNewCode("");
  }

  function deleteSubject(name: string) {
    if (!confirm(`Yakin ingin menghapus mata pelajaran "${name}" dari daftar?`)) return;
    setSubjects(prev => prev.filter(s => s.name !== name));
  }

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-subtitle">Atur mata pelajaran, kode mapel, dan cakupan kelas yang terhubung ke soal dan ujian.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin-hub" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Mapel</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Mapel Terdaftar", value: loading ? "..." : totalMapel.toString() },
          { label: "Total Bank Soal Terkait", value: loading ? "..." : totalQuestionsAll.toString() },
          { label: "Paket Ujian Terkait", value: loading ? "..." : totalExamsAll.toString() },
          { label: "Status Kurikulum", value: "Merdeka & K13" },
        ].map((item) => (
          <div key={item.label} className="card card-padding"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400 card card-padding">Memuat statistik mata pelajaran dari Supabase...</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {subjects.map((subject) => (
            <div key={subject.name} className="card card-padding space-y-4 hover:border-[#cbdffc] transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><BookOpen className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{subject.name}</h2>
                    <p className="text-sm text-gray-500">Kode mapel: {subject.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">{subject.scope}</span>
                  <button onClick={() => deleteSubject(subject.name)} title="Hapus Mapel" className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total Soal di Bank</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{subject.questionCount} soal</p>
                </div>
                <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Paket Ujian Aktif</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{subject.examCount} paket</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-3 text-xs text-[#2f66e9] flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Terhubung ke pemetaan soal dan ujian secara otomatis.</span>
                <Link href={`/bank-soal?mapel=${encodeURIComponent(subject.name)}`} className="font-semibold hover:underline">Buka Soal →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#e3ebfa] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Tambah Mata Pelajaran</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Biologi atau Fisika"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    placeholder="Contoh: BIO"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Jenjang / Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3ebfa] text-sm outline-none focus:border-[#2f66e9]"
                  >
                    <option value="SMP/SMA">SMP/SMA</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="SD">SD</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" className="btn-primary text-sm px-5 py-2">
                  Tambahkan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}