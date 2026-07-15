import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Exam, PersonalSchedule } from "@/types";

interface CalendarViewProps {
  exams: Exam[];
  personalSchedules: PersonalSchedule[];
  onAddSchedule: (date: Date) => void;
}

export default function CalendarView({ exams, personalSchedules, onAddSchedule }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 capitalize">{format(currentDate, dateFormat)}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-gray-100 gap-[1px]">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          
          // Filter events for this day
          const dayExams = exams.filter(e => isSameDay(new Date(e.created_at), day));
          const daySchedules = personalSchedules.filter(s => isSameDay(new Date(s.start_time), day));

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[120px] bg-white p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50 group ${!isCurrentMonth ? "text-gray-400 bg-gray-50/50" : "text-gray-900"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-[#2f66e9] text-white" : ""}`}>
                  {format(day, "d")}
                </span>
                {isCurrentMonth && (
                  <button onClick={() => onAddSchedule(day)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#2f66e9] transition-opacity bg-gray-50 hover:bg-blue-50 rounded-md">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] no-scrollbar">
                {dayExams.map(exam => (
                  <div key={exam.id} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-1 rounded truncate font-medium flex items-center gap-1" title={exam.title}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">{exam.title}</span>
                  </div>
                ))}
                {daySchedules.map(sched => (
                  <div key={sched.id} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-1.5 py-1 rounded truncate font-medium flex items-center gap-1" title={sched.title}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span className="truncate">{format(new Date(sched.start_time), "HH:mm")} {sched.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
