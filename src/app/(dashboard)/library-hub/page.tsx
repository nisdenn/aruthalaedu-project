import Link from "next/link";
import { BookMarked, FileSearch, Sparkles, Upload, BrainCircuit } from "lucide-react";

export default function LibraryHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f66e9]"><Sparkles className="h-3.5 w-3.5" /> Optional Module</div>
          <h1 className="page-title mt-3">Library & RAG</h1>
          <p className="page-subtitle">Pencarian dokumen, materi, dan knowledge base untuk fitur AI masa depan.</p>
        </div>
        <Link href="/overview" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto">Kembali ke Dashboard</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Knowledge Base", desc: "Dokumen, SOP, dan materi pembelajaran yang siap dicari.", icon: FileSearch },
          { title: "Library", desc: "Pusat materi, modul, dan file yang dibagikan guru.", icon: BookMarked },
          { title: "Upload Module", desc: "UI untuk unggah file baru ke tenant sekolah.", icon: Upload },
          { title: "RAG Module", desc: "Placeholder untuk pencarian semantik dan sitasi sumber.", icon: BrainCircuit },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="card card-padding space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Catatan implementasi RAG</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Tenant-safe retrieval",
            "Role-aware filters",
            "Citation-first answers",
            "Chunking dokumen",
            "Audit query penting",
            "Fallback kalau data tidak cukup",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}