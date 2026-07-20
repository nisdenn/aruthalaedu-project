import { CalendarCheck, Search } from "lucide-react";

export default function AbsenPage() {
  // Mock data untuk contoh absensi (Juli 2026)
  const daysInJuly = 31;
  const mockAttendance = Array.from({ length: daysInJuly }).map((_, i) => {
    const date = new Date(2026, 6, i + 1); // Bulan 6 = Juli
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
    const dateStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    
    // Logika dummy untuk status: akhir pekan libur, sisanya hadir
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    let status = isWeekend ? "Libur" : (i % 7 === 0 ? "Sakit" : "Hadir");
    let datang = isWeekend || status === "Sakit" ? "-" : "06:45";
    let pulang = isWeekend || status === "Sakit" ? "-" : "15:00";

    return {
      no: i + 1,
      tanggal: `${dayName}, ${dateStr}`,
      status,
      datang,
      pulang,
      isWeekend
    };
  });

  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Data Absensi Siswa</h1>
            <p className="page-subtitle">Rekapitulasi kehadiran harian Anda di sekolah.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all text-sm font-semibold text-gray-700 outline-none">
            <option value="07-2026">Juli 2026</option>
            <option value="08-2026">Agustus 2026</option>
          </select>
        </div>
      </div>

      <div className="card card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Riwayat Kehadiran</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tanggal..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Datang</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockAttendance.map((row) => (
                <tr key={row.no} className={`hover:bg-[#f8fbff] transition-colors ${row.isWeekend ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-500">{row.no}</td>
                  <td className={`px-5 py-3 text-sm ${row.isWeekend ? 'text-red-500 font-medium' : 'text-gray-900 font-semibold'}`}>
                    {row.tanggal}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      row.status === 'Hadir' ? 'bg-green-50 text-green-600 border border-green-200' :
                      row.status === 'Sakit' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.datang}</td>
                  <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.pulang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
