"use client";

import { getAllAnswers, markAnswerSynced, getPendingSessionSync, clearPendingSessionSync } from "./offline-storage";

const BATCH_INTERVAL_MS = 3 * 60 * 1000; // 3 menit sesuai spec

interface SyncManagerOptions {
  sessionId: string;
  supabaseUrl: string;
  token: string;
  anonKey: string;
  onSyncSuccess?: (count: number) => void;
  onSyncError?: (error: Error) => void;
}

export class SyncManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private opts: SyncManagerOptions;

  constructor(opts: SyncManagerOptions) {
    this.opts = opts;
  }

  start() {
    // Sync immediately once
    this.sync();
    // Then every 3 menit
    this.intervalId = setInterval(() => this.sync(), BATCH_INTERVAL_MS);
    // Online event: flush immediately
    window.addEventListener("online", this.handleOnline);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener("online", this.handleOnline);
  }

  private handleOnline = () => {
    console.log("[sync] Back online — flushing queue");
    this.sync();
  };

  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      const answers = await getAllAnswers(this.opts.sessionId);
      const unsynced = answers.filter((a) => !a.synced);
      if (unsynced.length === 0) return;

      const body = unsynced.map((a) => ({
        session_id: this.opts.sessionId,
        question_id: a.question_id,
        answer: a.answer,
        client_timestamp: new Date(a.timestamp).toISOString(),
        synced_from_offline: true,
      }));

      // BUG FIX: Jika token kosong atau merupakan mock_token, fallback ke anonKey untuk Authorization
      // karena Supabase REST API akan menolak mock_token dengan 401 Unauthorized.
      const isMockOrEmpty = !this.opts.token || this.opts.token.includes("mock_token");
      const bearerToken = isMockOrEmpty ? this.opts.anonKey : this.opts.token;

      const res = await fetch(`${this.opts.supabaseUrl}/rest/v1/exam_answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "apikey": this.opts.anonKey,
          "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await Promise.all(unsynced.map((a) => markAnswerSynced(this.opts.sessionId, a.question_id)));
        this.opts.onSyncSuccess?.(unsynced.length);
      } else {
        console.error(`[sync] Failed answers sync: ${res.status}`);
      }

      // Sync pending sessions
      const pendingSessions = await getPendingSessionSync();
      if (pendingSessions.length > 0) {
        for (const session of pendingSessions) {
          const sessionRes = await fetch(`${this.opts.supabaseUrl}/rest/v1/exam_sessions?id=eq.${session.session_id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${bearerToken}`,
              "apikey": this.opts.anonKey,
            },
            body: JSON.stringify({
              status: session.status,
              score: session.score,
              time_remaining: session.time_remaining,
              submitted_at: new Date(session.timestamp).toISOString(),
            }),
          });
          if (sessionRes.ok) {
            await clearPendingSessionSync(session.session_id);
            console.log(`[sync] Successfully synced pending session ${session.session_id}`);
          } else {
            console.error(`[sync] Failed session sync: ${sessionRes.status}`);
          }
        }
      }
    } catch (e) {
      this.opts.onSyncError?.(e as Error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Force flush — dipakai saat final submit
  async flushAll(): Promise<void> {
    this.stop();
    await this.sync();
  }
}
