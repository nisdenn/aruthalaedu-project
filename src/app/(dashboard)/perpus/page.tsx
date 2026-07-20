"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Library, Search, BookOpen, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

type Book = {
  id: string;
  title: string;
  author: string | null;
  category: string;
  cover_color: string;
  total_stock: number;
  available_stock: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Buku Paket": "#2f66e9",
  Fiksi: "#e95f2f",
  Referensi: "#10b981",
  Teknologi: "#8b5cf6",
  Agama: "#f59e0b",
  Seni: "#ec4899",
};

export default function PerpusPage() {
  const identity = useDashboardIdentity();
  const isStaff = ["admin", "teacher"].includes(identity.roleGroup);
  const supabase = createClient();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add book form state (staff only)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "", category: "Buku Paket", total_stock: "1" });
  const [saving, setSaving] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!identity.sekolahId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("library_books")
      .select("id, title, author, category, cover_color, total_stock, available_stock")
      .eq("sekolah_id", identity.sekolahId)
      .order("title");

    if (error) {
      console.error("Fetch books error:", error);
      setBooks([]);
    } else {
      setBooks((data as Book[]) || []);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!identity.loading) fetchBooks();
  }, [fetchBooks, identity.loading]);

  const filtered = useMemo(() => {
    if (!search) return books;
    const q = search.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
  }, [books, search]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setSaving(true);

    const stock = parseInt(formData.total_stock) || 0;
    const { error } = await supabase.from("library_books").insert({
      title: formData.title,
      author: formData.author || null,
      category: formData.category,
      cover_color: CATEGORY_COLORS[formData.category] || "#2f66e9",
      total_stock: stock,
      available_stock: stock,
      sekolah_id: identity.sekolahId,
      yayasan_id: identity.yayasanId,
      added_by: identity.userId,
    });

    setSaving(false);
    if (error) {
      alert("Gagal menambah buku: " + error.message);
    } else {
      setShowForm(false);
      setFormData({ title: "", author: "", category: "Buku Paket", total_stock: "1" });
      fetchBooks();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-padding flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Perpustakaan</h1>
            <p className="page-subtitle">Katalog buku dan koleksi perpustakaan sekolah.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors shadow-lg shadow-[#2f66e9]/20">
              <Plus className="w-4 h-4" /> Tambah Buku
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Cari buku..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#2f66e9]" />
          <span className="ml-2 text-sm text-gray-500">Memuat katalog buku...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="mx-auto h-14 w-14 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Belum ada buku di perpustakaan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((book) => {
            const isAvailable = book.available_stock > 0;
            return (
              <div key={book.id} className="card overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Cover */}
                <div className="h-36 flex items-center justify-center transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: book.cover_color || "#2f66e9" }}>
                  <BookOpen className="w-12 h-12 text-white/30" />
                </div>
                <div className="p-4 space-y-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef5ff] text-[#2f66e9]">
                    {book.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{book.title}</h3>
                  {book.author && <p className="text-xs text-gray-500">{book.author}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-400"}`} />
                      <span className={isAvailable ? "text-green-600" : "text-red-500"}>
                        {isAvailable ? "Tersedia" : "Dipinjam"}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{book.available_stock} / {book.total_stock}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Book Modal (Staff only) */}
      {showForm && isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Tambah Buku Baru</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Judul Buku</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Penulis</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" placeholder="Opsional" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
                    {["Buku Paket", "Fiksi", "Referensi", "Teknologi", "Agama", "Seni"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Stok</label>
                  <input type="number" min="0" value={formData.total_stock} onChange={(e) => setFormData(p => ({ ...p, total_stock: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors disabled:opacity-50 shadow-lg shadow-[#2f66e9]/20">
                {saving ? "Menyimpan..." : "Tambah Buku"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
