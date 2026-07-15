import { useState } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, AlignLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface ScheduleModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleModal({ selectedDate, onClose, onSuccess }: ScheduleModalProps) {
  const { user } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState("60");
  const [type, setType] = useState("belajar");

  if (!selectedDate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Parse dates
      const startDate = new Date(selectedDate);
      const [hours, minutes] = time.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + Number(duration));

      const { error: insErr } = await supabase
        .from("personal_schedules")
        .insert({
          user_id: user.id,
          title,
          description,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          type
        });

      if (insErr) throw insErr;
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Tambah Jadwal Pribadi</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
          
          <div className="p-3 bg-blue-50/50 rounded-xl flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Tanggal Terpilih</p>
              <p className="text-sm font-bold text-gray-900">{format(selectedDate, "dd MMMM yyyy")}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Kegiatan</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Belajar Matematika" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Waktu Mulai</label>
              <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Durasi (Menit)</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                <option value="30">30 Menit</option>
                <option value="60">1 Jam</option>
                <option value="90">1.5 Jam</option>
                <option value="120">2 Jam</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Kegiatan</label>
            <div className="flex gap-2">
              {['belajar', 'tugas', 'ekskul', 'lainnya'].map(t => (
                <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border ${type === t ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#2f66e9] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
