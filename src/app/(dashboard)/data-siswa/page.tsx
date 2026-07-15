"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function SiswaPage() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { user, isSiswa, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  useEffect(() => {
    async function fetchSiswa() {
      if (!user?.sekolah_id) {
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'SISWA')
        .eq('sekolah_id', user.sekolah_id);
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,nisn.ilike.%${search}%`);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setSiswa(data || []);
      setLoading(false);
    }
    
    // Simple debounce for search
    const timer = setTimeout(() => {
      fetchSiswa();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (roleLoading || isSiswa) {
    return <div className="p-8 text-center text-gray-500">Memeriksa akses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Siswa</h1>
          <p className="page-subtitle">{siswa.length} siswa terdaftar di sekolah ini</p>
        </div>
        <Link href="/data-siswa/import" className="btn-primary">
          <Upload className="w-4 h-4" /> Import Siswa
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 card px-3 py-2.5 max-w-xs flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NISN..."
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/80">
              {["Nama", "NISN", "Kelas", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">Memuat data siswa...</td>
              </tr>
            ) : siswa.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                  {search ? "Siswa tidak ditemukan." : "Belum ada data siswa."}
                </td>
              </tr>
            ) : (
              siswa.map((s) => (
                <tr key={s.id} className="border-b border-white/60 hover:bg-white/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#eef5ff] text-[#2f66e9]">
                        {s.full_name ? s.full_name[0].toUpperCase() : "?"}
                      </div>
                      <span className="font-medium text-gray-900">{s.full_name || "Tanpa Nama"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{s.nisn || "-"}</td>
                  <td className="px-5 py-3.5 text-gray-600">Belum diatur</td>
                  <td className="px-5 py-3.5">
                    <span className="badge-success">Aktif</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/data-siswa/${s.id}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
