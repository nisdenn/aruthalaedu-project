"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Clock, Users, BarChart2, Play, Settings, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "badge-default" },
  published: { label: "Aktif", className: "badge-success" },
  closed: { label: "Selesai", className: "badge-default" },
};

const FILTERS = ["Semua", "Aktif", "Draft", "Selesai"];

export default function UjianPage() {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();
  const [filter, setFilter] = useState("Semua");
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  useEffect(() => {
    async function fetchExams() {
      const supabase = createClient();
      const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
      if (data) setExams(data);
    }
    fetchExams();
  }, []);

  if (roleLoading || isSiswa) {
    return <div className="p-8 text-center text-gray-500">Memeriksa akses...</div>;
  }

  const filtered = exams.filter((e) => {
    if (filter === "Aktif") return e.status === "published";
    if (filter === "Draft") return e.status === "draft";
    if (filter === "Selesai") return e.status === "closed";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Ujian</h1>
          <p className="page-subtitle">Kelola semua paket ujian sekolah Anda</p>
        </div>
        <Link href="/ujian/buat" className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Ujian
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all border ${filter === f
                ? "bg-[#eef5ff] text-[#2f66e9] border-[#d8e6fb]"
                : "bg-white/70 text-gray-600 border-white/80 hover:bg-white"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((exam) => {
          const st = STATUS[exam.status];
          return (
            <div
              key={exam.id}
              className="card card-padding flex items-center gap-5 hover:border-[#d8e6fb] transition-all"
            >
              <div
                className={`w-1 self-stretch rounded-full shrink-0 ${exam.status === "published"
                    ? "bg-green-500"
                    : exam.status === "draft"
                      ? "bg-gray-300"
                      : "bg-gray-200"
                  }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">{exam.title}</h3>
                  <span className={st?.className || "badge-default"}>{st?.label || exam.status}</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {exam.duration_minutes} menit
                  </span>
                  <span>{exam.mata_pelajaran}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {exam.siswa || 0} siswa
                  </span>
                  {exam.start_at && <span>{new Date(exam.start_at).toLocaleString()}</span>}
                </div>
              </div>

              {exam.status !== "draft" && (
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {exam.submitted || 0}/{exam.siswa || 0}
                    </div>
                    <div className="text-[11px] text-gray-400">Submit</div>
                  </div>
                  {exam.avg_score != null && (
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${exam.avg_score >= 75 ? "text-green-600" : "text-amber-600"
                          }`}
                      >
                        {Number(exam.avg_score).toFixed(1)}
                      </div>
                      <div className="text-[11px] text-gray-400">Rata-rata</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {exam.status === "published" && (
                  <Link
                    href={`/ujian/${exam.id}/monitor`}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    <Play className="w-3 h-3" /> Monitor
                  </Link>
                )}
                <Link
                  href={`/ujian/${exam.id}/hasil`}
                  className="btn-outline p-2"
                >
                  <BarChart2 className="w-4 h-4" />
                </Link>
                <Link href={`/ujian/${exam.id}`} className="btn-outline p-2">
                  <Settings className="w-4 h-4" />
                </Link>
                <button 
                  onClick={async () => {
                    if (!confirm(`Hapus ujian "${exam.title}"? Seluruh sesi dan jawaban akan ikut terhapus.`)) return;
                    const supabase = createClient();
                    // Hapus sesi ujian terlebih dahulu (karena foreign key constraint)
                    await supabase.from('exam_sessions').delete().eq('exam_id', exam.id);
                    // Hapus ujian
                    const { error } = await supabase.from('exams').delete().eq('id', exam.id);
                    if (!error) {
                      setExams(prev => prev.filter(e => e.id !== exam.id));
                      alert("Ujian berhasil dihapus.");
                    } else {
                      alert("Gagal menghapus ujian: " + error.message);
                    }
                  }}
                  className="btn-outline p-2 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
