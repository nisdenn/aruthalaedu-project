export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Konfigurasi profil sekolah dan preferensi sistem</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sekolah", value: "SMPIT An-Nur" },
          { label: "Tenant", value: "annur-bekasi" },
          { label: "Mode", value: "Production" },
          { label: "Branding", value: "Blue glass" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Profil Sekolah</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Nama sekolah",
              "Nama yayasan",
              "Logo sekolah",
              "Domain custom",
              "Warna tema",
              "Deskripsi sekolah",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Preferensi Sistem</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-6">
            <p>Halaman ini bisa dipakai backend untuk toggle fitur dan konfigurasi tenant.</p>
            <p>UI ini siap untuk mode produksi, branding sekolah, dan pengaturan keamanan.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#eef5ff] p-4 text-sm text-[#2f66e9]">
            Tampilan ini sudah mengikuti sistem warna dan kartu utama dari referensi desain.
          </div>
        </div>
      </div>
    </div>
  );
}
