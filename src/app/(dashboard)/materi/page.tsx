"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { FileText, Search, Upload, X, Loader2, Download, File, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

type Material = {
  id: string;
  title: string;
  description: string | null;
  mata_pelajaran: string | null;
  file_url: string;
  file_type: string;
  file_size_bytes: number | null;
  created_at: string;
  uploader_name?: string;
};

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: "bg-red-50 text-red-600 border-red-200",
  PPTX: "bg-orange-50 text-orange-600 border-orange-200",
  DOCX: "bg-blue-50 text-blue-600 border-blue-200",
  XLSX: "bg-green-50 text-green-600 border-green-200",
  default: "bg-gray-50 text-gray-600 border-gray-200",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MateriPage() {
  const identity = useDashboardIdentity();
  const isStaff = ["admin", "teacher"].includes(identity.roleGroup);
  const supabase = createClient();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMapel, setFilterMapel] = useState("");

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", description: "", mata_pelajaran: "", file_type: "PDF" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const getFileAccept = (type: string) => {
    switch (type) {
      case "PDF": return ".pdf";
      case "PPTX": return ".ppt,.pptx";
      case "DOCX": return ".doc,.docx";
      case "XLSX": return ".xls,.xlsx";
      default: return "*";
    }
  };

  const fetchMaterials = useCallback(async () => {
    if (!identity.sekolahId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("materials")
      .select("id, title, description, mata_pelajaran, file_url, file_type, file_size_bytes, created_at, profiles!materials_uploaded_by_fkey(full_name)")
      .eq("is_published", true)
      .eq("sekolah_id", identity.sekolahId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch materials error:", error);
      setMaterials([]);
    } else {
      setMaterials(
        (data || []).map((d: Record<string, unknown>) => ({
          ...d,
          uploader_name: (d.profiles as Record<string, string>)?.full_name || "Guru",
        })) as Material[]
      );
    }
    setLoading(false);
  }, [identity.sekolahId, supabase]);

  useEffect(() => {
    if (!identity.loading) fetchMaterials();
  }, [fetchMaterials, identity.loading]);

  // Unique mata pelajaran for filter dropdown
  const mapelOptions = useMemo(() => {
    const set = new Set(materials.map((m) => m.mata_pelajaran).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [materials]);

  const filtered = useMemo(() => {
    let result = materials;
    if (filterMapel) result = result.filter((m) => m.mata_pelajaran === filterMapel);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || (m.mata_pelajaran || "").toLowerCase().includes(q));
    }
    return result;
  }, [materials, search, filterMapel]);

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi beserta filenya?")) return;
    
    setLoading(true);
    try {
      // Ekstrak path dari URL publik untuk menghapus file fisik di Storage
      const path = fileUrl.split("aruthala-materials/")[1];
      if (path) {
        await supabase.storage.from("aruthala-materials").remove([path]);
      }
      
      // Hapus data dari Database
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;
      
      fetchMaterials();
    } catch (e: any) {
      alert("Gagal menghapus materi: " + e.message);
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadFile) {
      alert("Harap isi judul dan pilih file.");
      return;
    }
    setSaving(true);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${identity.sekolahId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("aruthala-materials")
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("aruthala-materials")
        .getPublicUrl(filePath);

      // 3. Insert into Database
      const { error: dbError } = await supabase.from("materials").insert({
        title: uploadForm.title,
        description: uploadForm.description || null,
        mata_pelajaran: uploadForm.mata_pelajaran || null,
        file_url: publicUrl,
        file_type: uploadForm.file_type,
        file_size_bytes: uploadFile.size,
        uploaded_by: identity.userId,
        sekolah_id: identity.sekolahId,
        yayasan_id: identity.yayasanId,
        is_published: true,
      });

      if (dbError) throw dbError;

      setShowUpload(false);
      setUploadForm({ title: "", description: "", mata_pelajaran: "", file_type: "PDF" });
      setUploadFile(null);
      fetchMaterials();
    } catch (err: any) {
      alert("Gagal mengupload: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-padding flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">File Materi</h1>
            <p className="page-subtitle">Kumpulan materi pembelajaran yang dibagikan oleh guru.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterMapel} onChange={(e) => setFilterMapel(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
            <option value="">Semua Mapel</option>
            {mapelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {isStaff && (
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors shadow-lg shadow-[#2f66e9]/20">
              <Upload className="w-4 h-4" /> Upload Materi
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Cari materi..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#2f66e9]" />
          <span className="ml-2 text-sm text-gray-500">Memuat materi...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <File className="mx-auto h-14 w-14 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Belum ada materi untuk ditampilkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="card card-padding hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${FILE_TYPE_COLORS[m.file_type.toUpperCase()] || FILE_TYPE_COLORS.default}`}>
                  {m.file_type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{formatBytes(m.file_size_bytes)}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{m.title}</h3>
              {m.mata_pelajaran && <p className="text-xs text-[#2f66e9] font-medium mb-2">{m.mata_pelajaran}</p>}
              {m.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">{new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                <div className="flex items-center gap-3">
                  {isStaff && (
                    <button onClick={() => handleDelete(m.id, m.file_url)} className="text-gray-400 hover:text-red-500 transition-colors" title="Hapus Materi">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a href={m.file_url !== "#" ? m.file_url : undefined}
                    className={`flex items-center gap-1 text-xs font-semibold ${m.file_url !== "#" ? "text-[#2f66e9] hover:underline" : "text-gray-400 cursor-not-allowed"}`}
                    target="_blank" rel="noopener noreferrer">
                    <Download className="w-3.5 h-3.5" /> Unduh File
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Upload Materi Baru</h3>
              <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Judul Materi</label>
                <input type="text" value={uploadForm.title} onChange={(e) => setUploadForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" placeholder="Contoh: Modul Matematika Bab 1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mata Pelajaran</label>
                <input type="text" value={uploadForm.mata_pelajaran} onChange={(e) => setUploadForm(p => ({ ...p, mata_pelajaran: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" placeholder="Contoh: Matematika Wajib" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipe File</label>
                <select value={uploadForm.file_type} onChange={(e) => setUploadForm(p => ({ ...p, file_type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
                  {["PDF", "PPTX", "DOCX", "XLSX"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Deskripsi</label>
                <input type="text" value={uploadForm.description} onChange={(e) => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" placeholder="Opsional" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">File Dokumen</label>
                <input type="file" accept={getFileAccept(uploadForm.file_type)} onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
              </div>
              <button type="submit" disabled={saving || !uploadFile}
                className="w-full py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors disabled:opacity-50 shadow-lg shadow-[#2f66e9]/20">
                {saving ? "Mengupload..." : "Upload Materi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
