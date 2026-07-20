import { Users, Megaphone, Trophy, Calendar } from "lucide-react";

export default function KesiswaanPage() {
  const announcements = [
    { id: 1, title: "Pendaftaran Ekstrakurikuler Semester Ganjil", date: "22 Jul 2026", type: "Pengumuman", icon: Megaphone, color: "bg-blue-50 text-blue-600" },
    { id: 2, title: "Jadwal Latihan Gabungan Paskibra", date: "24 Jul 2026", type: "Kegiatan", icon: Calendar, color: "bg-purple-50 text-purple-600" },
    { id: 3, title: "Selamat! Tim Basket Juara 1 Tingkat Provinsi", date: "15 Jul 2026", type: "Prestasi", icon: Trophy, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Kesiswaan</h1>
            <p className="page-subtitle">Informasi kegiatan siswa, ekstrakurikuler, dan pengumuman.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-gray-900">Papan Pengumuman</h2>
          <div className="space-y-4">
            {announcements.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="card bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">{item.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-base font-bold text-gray-900">Ekstrakurikuler Anda</h2>
          <div className="card bg-white p-5 rounded-2xl border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Belum tergabung</p>
              <p className="text-xs text-gray-500 mt-1">Anda belum memilih ekstrakurikuler untuk semester ini.</p>
            </div>
            <button className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold bg-[#eef5ff] text-[#2f66e9] hover:bg-[#d8e8ff] transition-colors">
              Lihat Daftar Ekskul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
