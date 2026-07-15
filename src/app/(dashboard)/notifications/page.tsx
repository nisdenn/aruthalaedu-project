"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Bell, AlertCircle, CheckCircle2, ShieldAlert, Users, GraduationCap, Megaphone, Clock, ArrowRight, Filter, CheckCheck, FileText } from "lucide-react";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";
import { createClient } from "@/lib/supabase/client";

interface NotifItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "info" | "warning" | "success" | "alert" | "broadcast";
  category: "broadcast" | "academic" | "security";
  created_at: string;
  actionHref?: string;
  actionText?: string;
}

export default function NotificationsPage() {
  const identity = useDashboardIdentity();
  const isSiswa = identity.roleGroup === "student";
  
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "broadcast" | "academic" | "security">("all");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      if (identity.loading) return;
      setLoading(true);
      const supabase = createClient();
      const list: NotifItem[] = [];

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || "";
        const sekolahId = identity.sekolahId || user?.user_metadata?.sekolah_id || null;

        const { data: annData } = await supabase
          .from("system_announcements")
          .select("id, title, content, type, target_type, target_sekolah_id, target_user_id, created_at")
          .order("created_at", { ascending: false })
          .limit(12);

        if (annData && Array.isArray(annData)) {
          annData.forEach((a) => {
            const isGlobal = a.target_type === "GLOBAL";
            const isSchool = a.target_type === "SCHOOL" && (!sekolahId || a.target_sekolah_id === sekolahId);
            const isRoleSiswa = a.target_type === "ROLE_SISWA" && isSiswa && (!a.target_sekolah_id || a.target_sekolah_id === sekolahId);
            const isRoleGuru = a.target_type === "ROLE_GURU" && !isSiswa && (!a.target_sekolah_id || a.target_sekolah_id === sekolahId);
            const isPrivate = a.target_type === "PRIVATE" && a.target_user_id === userId;

            if (isGlobal || isSchool || isRoleSiswa || isRoleGuru || isPrivate) {
              list.push({
                id: `ann-${a.id}`,
                title: a.title,
                desc: a.content,
                time: new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
                type: (a.type as any) || "broadcast",
                category: "broadcast",
                created_at: a.created_at,
              });
            }
          });
        }

        if (isSiswa) {
          let eQuery = supabase.from("exams").select("id, title, status, duration_minutes, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(6);
          if (sekolahId) eQuery = eQuery.eq("sekolah_id", sekolahId);
          const { data: eData } = await eQuery;

          (eData || []).forEach(e => {
            list.push({
              id: `exam-pub-${e.id}`,
              title: `Ujian Tersedia: ${e.title}`,
              desc: `Durasi pengerjaan ${e.duration_minutes} menit. Silakan kerjakan sebelum batas waktu yang ditentukan.`,
              time: new Date(e.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
              type: "success",
              category: "academic",
              created_at: e.created_at,
              actionHref: `/ujian/${e.id}`,
              actionText: "Mulai Ujian",
            });
          });

          let sQuery = supabase.from("exam_sessions").select("id, score, finished_at, exam_id, exams(title)").eq("status", "submitted").order("finished_at", { ascending: false }).limit(6);
          if (sekolahId) sQuery = sQuery.eq("sekolah_id", sekolahId);
          const { data: sData } = await sQuery;

          (sData || []).forEach(s => {
            const examTitle = (s.exams as unknown as { title?: string })?.title || "Ujian";
            list.push({
              id: `score-${s.id}`,
              title: `Hasil Ujian Keluar: ${examTitle}`,
              desc: `Pengerjaan telah selesai dikoreksi sistem. Nilai Akhir Anda: ${s.score}.`,
              time: s.finished_at ? new Date(s.finished_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru saja",
              type: "info",
              category: "academic",
              created_at: s.finished_at || new Date().toISOString(),
              actionHref: `/ujian/${s.exam_id}/hasil`,
              actionText: "Lihat Hasil",
            });
          });
        } else {
          let violQuery = supabase.from("exam_violations").select("id, violation_type, created_at, exam_session_id").order("created_at", { ascending: false }).limit(8);
          if (sekolahId) violQuery = violQuery.eq("sekolah_id", sekolahId);
          const { data: violData } = await violQuery;

          (violData || []).forEach(v => {
            list.push({
              id: `viol-${v.id}`,
              title: `Peringatan Pengawasan: ${v.violation_type}`,
              desc: `Sistem mendeteksi aktivitas mencurigakan pada sesi pengerjaan ujian #${v.exam_session_id?.slice(0, 8) || "-"}.`,
              time: new Date(v.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              type: "alert",
              category: "security",
              created_at: v.created_at,
              actionHref: `/monitoring-center`,
              actionText: "Buka Monitoring Center",
            });
          });

          let draftQuery = supabase.from("exams").select("id, title, created_at").eq("status", "draft").order("created_at", { ascending: false }).limit(4);
          if (sekolahId) draftQuery = draftQuery.eq("sekolah_id", sekolahId);
          const { data: draftData } = await draftQuery;

          (draftData || []).forEach(d => {
            list.push({
              id: `draft-${d.id}`,
              title: `Draft Soal: ${d.title}`,
              desc: "Paket ujian masih berstatus draft dan belum dipublikasikan kepada siswa.",
              time: new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
              type: "warning",
              category: "academic",
              created_at: d.created_at,
              actionHref: `/ujian/${d.id}`,
              actionText: "Periksa Draft",
            });
          });
        }

        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (active) setNotifs(list);
      } catch (err) {
        console.error("Gagal memuat notifikasi:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [identity.loading, identity.roleGroup, identity.sekolahId, isSiswa]);

  const filteredNotifs = useMemo(() => {
    if (activeTab === "all") return notifs;
    return notifs.filter((n) => n.category === activeTab);
  }, [notifs, activeTab]);

  const stats = useMemo(() => {
    return {
      total: notifs.length,
      broadcast: notifs.filter((n) => n.category === "broadcast").length,
      academic: notifs.filter((n) => n.category === "academic").length,
      security: notifs.filter((n) => n.category === "security").length,
    };
  }, [notifs]);

  return (
    <div className="space-y-6">
      {/* Header Card ala Denis */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Pusat Notifikasi & Pengumuman</h1>
          <p className="page-subtitle">Aliran informasi real-time dari sekolah, ujian aktif, dan siaran administrator.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl bg-gray-50 border border-gray-200/80 px-4 py-2 text-center">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Akses</span>
            <span className="text-base font-bold text-gray-900">{stats.total}</span>
          </div>
          <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 px-4 py-2 text-center">
            <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Siaran Admin</span>
            <span className="text-base font-bold text-[#2f66e9]">{stats.broadcast}</span>
          </div>
          <div className="rounded-xl bg-green-50/80 border border-green-200/80 px-4 py-2 text-center">
            <span className="block text-[10px] font-semibold text-green-600 uppercase tracking-wider">Akademik</span>
            <span className="text-base font-bold text-green-700">{stats.academic}</span>
          </div>
          {!isSiswa && (
            <div className="rounded-xl bg-red-50/80 border border-red-200/80 px-4 py-2 text-center">
              <span className="block text-[10px] font-semibold text-red-600 uppercase tracking-wider">Keamanan</span>
              <span className="text-base font-bold text-red-600">{stats.security}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs ala Denis */}
      <div className="card card-padding space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
            {[
              { id: "all", label: "Semua Notifikasi", count: stats.total },
              { id: "broadcast", label: "Siaran Admin", count: stats.broadcast },
              { id: "academic", label: "Akademik & Ujian", count: stats.academic },
              ...(!isSiswa ? [{ id: "security", label: "Peringatan Keamanan", count: stats.security }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#2f66e9] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Clock className="h-3.5 w-3.5 text-gray-400" /> Auto-sync tiap 30 detik
          </div>
        </div>

        {/* Feed Daftar Notifikasi Compact */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Menyinkronkan notifikasi dari Supabase...</div>
          ) : filteredNotifs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[#f9fbff] border border-dashed border-[#e3ebfa] space-y-2">
              <Bell className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">Tidak ada notifikasi pada kategori ini</p>
              <p className="text-xs text-gray-400">Semua aktivitas dan siaran sekolah akan terdata otomatis di sini.</p>
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const isAlert = item.type === "alert";
              const isWarning = item.type === "warning";
              const isSuccess = item.type === "success";
              const isBroadcast = item.type === "broadcast";

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isAlert ? "bg-red-50/40 border-red-200/80 hover:border-red-300" :
                    isWarning ? "bg-amber-50/40 border-amber-200/80 hover:border-amber-300" :
                    isBroadcast ? "bg-blue-50/40 border-blue-200/80 hover:border-blue-300" :
                    isSuccess ? "bg-green-50/40 border-green-200/80 hover:border-green-300" :
                    "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isAlert ? "bg-red-100 text-red-600" :
                      isWarning ? "bg-amber-100 text-amber-600" :
                      isBroadcast ? "bg-blue-100 text-[#2f66e9]" :
                      isSuccess ? "bg-green-100 text-green-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {isAlert && <ShieldAlert className="w-4 h-4" />}
                      {isWarning && <AlertCircle className="w-4 h-4" />}
                      {isBroadcast && <Megaphone className="w-4 h-4" />}
                      {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                      {!isAlert && !isWarning && !isBroadcast && !isSuccess && <FileText className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isAlert ? "bg-red-100 text-red-700" :
                          isWarning ? "bg-amber-100 text-amber-700" :
                          isBroadcast ? "bg-blue-100 text-[#2f66e9]" :
                          isSuccess ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {item.category === "broadcast" ? "Siaran Admin" : item.category === "security" ? "Keamanan" : "Akademik"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{item.time}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">{item.desc}</p>
                    </div>
                  </div>

                  {item.actionHref && (
                    <div className="shrink-0 self-start sm:self-center">
                      <Link
                        href={item.actionHref}
                        className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isAlert ? "bg-red-600 text-white hover:bg-red-700" :
                          isBroadcast ? "bg-[#2f66e9] text-white hover:bg-[#1d52cd]" :
                          "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{item.actionText || "Lihat Detail"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}