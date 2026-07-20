import { FileText, Download, Search } from "lucide-react";

export default function FileMateriPage() {
  const mockMateri = [
    { id: 1, title: "Modul Matematika Wajib Bab 1", subject: "Matematika", type: "PDF", size: "2.4 MB", date: "20 Jul 2026", color: "bg-red-50 text-red-600" },
    { id: 2, title: "Slide Presentasi Fisika Kuantum", subject: "Fisika", type: "PPTX", size: "5.1 MB", date: "18 Jul 2026", color: "bg-orange-50 text-orange-600" },
    { id: 3, title: "Latihan Soal Bahasa Inggris", subject: "Bahasa Inggris", type: "DOCX", size: "1.1 MB", date: "15 Jul 2026", color: "bg-blue-50 text-blue-600" },
    { id: 4, title: "Rangkuman Sejarah Kemerdekaan", subject: "Sejarah", type: "PDF", size: "3.8 MB", date: "10 Jul 2026", color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">File Materi</h1>
            <p className="page-subtitle">Kumpulan file materi pelajaran dan dokumen sekolah.</p>
          </div>
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari materi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMateri.map((materi) => (
          <div key={materi.id} className="card bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${materi.color}`}>
                {materi.type}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{materi.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{materi.subject}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-gray-400">
                  <span>{materi.size}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{materi.date}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50">
              <button className="w-full py-2.5 rounded-xl bg-[#f8fbff] text-[#2f66e9] hover:bg-[#eef5ff] text-xs font-bold transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Unduh File
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
