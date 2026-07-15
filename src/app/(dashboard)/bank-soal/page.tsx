"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";

const MAPEL = ["Semua", "Matematika", "IPA", "IPS", "Bahasa Indonesia", "Bahasa Inggris", "PKn", "Agama"];
const TINGKAT = ["Semua", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10", "Kelas 11", "Kelas 12"];

import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { createClient } from "@/lib/supabase/client";

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "Pilihan Ganda",
  essay: "Esai",
  true_false: "Benar/Salah",
  fill_blank: "Isian",
};

const DIFF_STYLE: Record<string, string> = {
  mudah: "badge-success",
  sedang: "badge-warning",
  sulit: "badge-danger",
};

const SCOPE_STYLE: Record<string, { label: string; className: string }> = {
  private: { label: "Pribadi", className: "text-gray-500" },
  sekolah: { label: "Sekolah", className: "text-blue-600" },
  yayasan: { label: "Yayasan", className: "text-green-600" },
};

export default function BankSoalPage() {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();
  const [search, setSearch] = useState("");
  const [mapel, setMapel] = useState("Semua");
  const [tingkat, setTingkat] = useState("Semua");
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (data) setQuestions(data);
    }
    fetchData();
  }, []);

  if (roleLoading || isSiswa) {
    return <div className="p-8 text-center text-gray-500">Memeriksa akses...</div>;
  }

  const filtered = questions.filter(q => {
    const mMatch = mapel === "Semua" || q.mata_pelajaran === mapel;
    const tMatch = tingkat === "Semua" || q.tingkat?.toString() === tingkat.replace("Kelas ", "");
    const sMatch = (q.content?.text || "").toLowerCase().includes(search.toLowerCase());
    return mMatch && tMatch && sMatch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      alert("Soal berhasil dihapus!");
    } else {
      if (error.code === '23503' || error.message.includes('foreign key constraint')) {
        alert("Gagal: Soal ini tidak dapat dihapus karena sedang digunakan dalam satu atau lebih Ujian. Hapus soal dari ujian terkait terlebih dahulu.");
      } else {
        alert("Gagal menghapus soal: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Bank Soal</h1>
          <p className="page-subtitle">{questions.length} soal tersimpan di perpustakaan sekolah Anda</p>
        </div>
        <Link href="/bank-soal/buat" className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Soal
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 card px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari soal..."
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <select
          value={mapel}
          onChange={(e) => setMapel(e.target.value)}
          className="input-field w-auto"
        >
          {MAPEL.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={tingkat}
          onChange={(e) => setTingkat(e.target.value)}
          className="input-field w-auto"
        >
          {TINGKAT.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/80">
              {["Soal", "Mapel · Kelas", "Topik", "Dipakai", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-medium text-xs text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id} className="table-row border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 mb-1 line-clamp-2 leading-relaxed" style={{ fontSize: 13 }}>
                    {q.content?.text || "(Tanpa teks)"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                      {TYPE_LABEL[q.type] || q.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_STYLE[q.difficulty] || "bg-gray-100"}`}>
                      {q.difficulty}
                    </span>
                    <span className={`text-xs font-medium ${SCOPE_STYLE[q.scope]?.className || "text-gray-500"}`}>
                      • {SCOPE_STYLE[q.scope]?.label || q.scope}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{q.mata_pelajaran}</div>
                  <div className="text-xs text-gray-500">Kelas {q.tingkat}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.topik || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                  {q.usage_count || 0}x
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/bank-soal/${q.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  Belum ada soal di Bank Soal.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/80">
          <div className="flex gap-1">
            {["1", "2", "3", "...", "16"].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${p === "1"
                    ? "bg-[#2f66e9] text-white"
                    : "text-gray-600 hover:bg-white"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
