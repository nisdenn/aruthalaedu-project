"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Bell, X } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  time: string;
  type: "exam" | "personal";
}

export default function ReminderSystem() {
  const { user } = useUserRole();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!user) return;

    const checkSchedules = async () => {
      const supabase = createClient();
      const now = new Date();
      const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);

      // Check personal schedules
      const { data: personal } = await supabase
        .from("personal_schedules")
        .select("id, title, start_time")
        .eq("user_id", user.id);

      const newReminders: Reminder[] = [];

      personal?.forEach(p => {
        const startTime = new Date(p.start_time);
        // If it starts within the next 15 minutes and hasn't started yet
        if (startTime > now && startTime <= fifteenMinsFromNow) {
          newReminders.push({
            id: p.id,
            title: p.title,
            time: p.start_time,
            type: "personal"
          });
        }
      });

      setReminders(newReminders);
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  if (reminders.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {reminders.map(r => (
        <div key={r.id} className="pointer-events-auto bg-white border-l-4 border-[#2f66e9] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 w-[340px] flex items-start gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-[#eef5ff] text-[#2f66e9] p-2.5 rounded-full shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 mt-0.5">
            <h4 className="text-sm font-bold text-gray-900">Pengingat Jadwal</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              <strong className="text-gray-900">{r.title}</strong> akan dimulai dalam waktu dekat. Persiapkan diri Anda!
            </p>
          </div>
          <button onClick={() => setReminders(prev => prev.filter(p => p.id !== r.id))} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
