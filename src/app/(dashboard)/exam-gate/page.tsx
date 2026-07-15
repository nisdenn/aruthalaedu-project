import Link from "next/link";
import { ArrowLeft, LockKeyhole, MonitorX, ShieldAlert } from "lucide-react";

export default function ExamGatePage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Exam Gate</h1>
          <p className="page-subtitle">Rute khusus untuk mode ujian aman dan lock mode SEB di fase berikutnya.</p>
        </div>
        <Link href="/ujian" className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"><ArrowLeft className="h-4 w-4" /> Kembali ke Ujian</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card card-padding space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><ShieldAlert className="h-6 w-6" /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Browser validation</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">UI ini nantinya menerima validasi browser, token gate, dan pesan fallback kalau bukan mode ujian.</p>
          </div>
        </div>

        <div className="card card-padding space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]"><LockKeyhole className="h-6 w-6" /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lock mode placeholders</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">Backend nanti bisa menautkan SEB, UA gatekeeper, dan halaman peringatan browser biasa.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e6fb] bg-[#f7fbff] p-4 text-sm text-[#2f66e9]">Mode ini hanya anchor frontend untuk flow ujian aman.</div>
        </div>
      </div>

      <div className="card card-padding flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><MonitorX className="h-5 w-5" /></div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Fallback UI</h2>
          <p className="text-sm text-gray-500">Kalau browser tidak sesuai, backend bisa mengarahkan ke pesan fallback atau instruksi instal SEB.</p>
        </div>
      </div>
    </div>
  );
}