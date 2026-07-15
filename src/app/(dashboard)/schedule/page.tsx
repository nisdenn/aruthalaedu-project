import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, NotebookText, School } from "lucide-react";

const DAYS = [
  { day: "Senin", items: ["Matematika 07:00", "Bahasa Indonesia 09:00", "Ujian 13:00"] },
  { day: "Selasa", items: ["IPA 07:00", "Tugas 10:00", "Rapat Guru 14:00"] },
  { day: "Rabu", items: ["Bahasa Inggris 07:00", "Library 09:30", "Asesmen 13:30"] },
];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="page-title">Schedule</h1><p className="page-subtitle">Jadwal pelajaran, agenda ujian, dan kalender akademik sekolah.</p></div><Link href="/academic" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Akademik</Link></div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Hari aktif", value: "Senin", icon: CalendarDays },
          { title: "Agenda berikutnya", value: "Ujian IPA", icon: NotebookText },
          { title: "Jam terdekat", value: "07:00", icon: Clock3 },
          { title: "Ruang", value: "Kelas 9A", icon: School },
        ].map((item) => { const Icon = item.icon; return (<div key={item.title} className="card card-padding"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm text-gray-500 font-medium">{item.title}</p><p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p></div>); })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {DAYS.map((day) => (
          <div key={day.day} className="card card-padding space-y-4"><h2 className="text-base font-semibold text-gray-900">{day.day}</h2><div className="space-y-2">{day.items.map((item) => (<div key={item} className="rounded-2xl border border-[#e3ebfa] bg-white/70 px-4 py-3 text-sm text-gray-700">{item}</div>))}</div></div>
        ))}
      </div>

      <div className="card card-padding"><h2 className="text-base font-semibold text-gray-900">Kalender akademik siap backend</h2><p className="mt-2 text-sm leading-6 text-gray-500">Halaman ini bisa dipakai untuk jadwal pelajaran, deadline tugas, agenda sekolah, dan event ujian. Backend nanti tinggal isi data dari kalender akademik atau tabel schedule.</p></div>
    </div>
  );
}