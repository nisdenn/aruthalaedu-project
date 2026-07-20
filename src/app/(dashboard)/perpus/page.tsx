import { Library, Search, BookOpen } from "lucide-react";

export default function PerpusPage() {
  const mockBooks = [
    { id: 1, title: "Buku Siswa Biologi SMA Kelas XII", category: "Buku Paket", coverColor: "bg-[#2f66e9]/10", iconColor: "text-[#2f66e9]", status: "Tersedia", stock: 15 },
    { id: 2, title: "Bumi Manusia", category: "Fiksi", coverColor: "bg-amber-50", iconColor: "text-amber-600", status: "Dipinjam", stock: 0 },
    { id: 3, title: "Kamus Besar Bahasa Indonesia (KBBI)", category: "Referensi", coverColor: "bg-emerald-50", iconColor: "text-emerald-600", status: "Tersedia", stock: 3 },
    { id: 4, title: "Pengantar Algoritma Pemrograman", category: "Teknologi", coverColor: "bg-purple-50", iconColor: "text-purple-600", status: "Tersedia", stock: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Perpustakaan</h1>
            <p className="page-subtitle">Akses koleksi buku digital perpustakaan sekolah.</p>
          </div>
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari buku atau pengarang..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockBooks.map((book) => (
          <div key={book.id} className="card bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group cursor-pointer flex flex-col h-full">
            <div className={`h-40 w-full ${book.coverColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
              <BookOpen className={`w-12 h-12 ${book.iconColor} opacity-80`} />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between z-10 bg-white">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {book.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{book.title}</h3>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                  book.status === 'Tersedia' ? 'text-green-600' : 'text-amber-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'Tersedia' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {book.status}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">{book.stock} Pcs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
