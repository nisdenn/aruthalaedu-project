import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, Edit2, Layers3 } from "lucide-react";

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Detail Soal</h1>
            <p className="page-subtitle">Preview isi soal, metadata, dan riwayat pemakaian.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/bank-soal" className="btn-outline inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
          <button className="btn-primary inline-flex items-center gap-2"><Edit2 className="h-4 w-4" /> Edit Soal</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "ID Soal", value: id },
          { label: "Mapel", value: "Matematika" },
          { label: "Kelas", value: "9" },
          { label: "Dipakai", value: "12×" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-padding lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Preview isi soal</h2>
          <div className="rounded-2xl border border-[#e3ebfa] bg-white/70 p-4 text-sm leading-6 text-gray-700">
            Diketahui x = 5 dan y = 3. Berapakah nilai dari x² + 2xy?
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Pilihan jawaban",
              "Pembahasan",
              "Topik: Aljabar",
              "Kesulitan: sedang",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-[#2f66e9]" />
            <h2 className="text-base font-semibold text-gray-900">Metadata</h2>
          </div>
          <div className="space-y-3 text-sm leading-6 text-gray-600">
            <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#2f66e9]" /> Dibuat 2026-06-15</p>
            <p>Scope: sekolah</p>
            <p>Usage count: 12 kali</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">
            Backend bisa menambahkan history edit, tag, dan referensi ujian.
          </div>
        </div>
      </div>
    </div>
  );
}