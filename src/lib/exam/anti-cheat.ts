"use client";

import type { AntiCheatConfig, ViolationType } from "@/types";

export interface ViolationEvent {
  type: ViolationType;
  count: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type ViolationCallback = (event: ViolationEvent) => void;
export type ForceSubmitCallback = (reason: ViolationType) => void;
export type LockCallback = (reason: string) => void;

export class ExamAntiCheat {
  private violations = new Map<ViolationType, number>();
  private cleanups: Array<() => void> = [];
  private sessionId: string;
  private config: AntiCheatConfig;
  private supabaseUrl: string;
  private anonKey: string;
  private token: string;
  private hasEnteredFullscreen = false;

  onViolation?: ViolationCallback;
  onForceSubmit?: ForceSubmitCallback;
  onLock?: LockCallback;
  onProctorLock?: (reason: string) => void;

  constructor(opts: {
    sessionId: string;
    config: AntiCheatConfig;
    supabaseUrl: string;
    anonKey: string;
    token: string;
  }) {
    this.sessionId = opts.sessionId;
    this.config = opts.config;
    this.supabaseUrl = opts.supabaseUrl;
    this.anonKey = opts.anonKey;
    this.token = opts.token;
  }

  init() {
    if (this.config.fullscreen) this.cleanups.push(this.enforceFullscreen());
    if (this.config.tab_blur) this.cleanups.push(this.watchTabBlur());
    if (this.config.clipboard) this.cleanups.push(this.blockClipboard());
    if (this.config.keyboard_shortcuts) this.cleanups.push(this.blockKeyboard());
    if (this.config.right_click) this.cleanups.push(this.blockContextMenu());
    // SEB check
    if (this.config.require_seb) {
      const isSEB = navigator.userAgent.includes("SEB/");
      if (!isSEB) window.location.href = "/ujian/exam-gate";
    }
  }

  destroy() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  private log(type: ViolationType, metadata?: Record<string, unknown>) {
    const prev = this.violations.get(type) ?? 0;
    const count = prev + 1;
    this.violations.set(type, count);

    const event: ViolationEvent = { type, count, timestamp: Date.now(), metadata };
    this.onViolation?.(event);

    // Non-blocking sync to server
    fetch(`${this.supabaseUrl}/rest/v1/exam_violations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
        "apikey": this.anonKey,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        session_id: this.sessionId,
        violation_type: type,
        count_at_time: count,
        metadata,
        client_timestamp: new Date().toISOString(),
      }),
    }).catch(() => {/* non-blocking */});

    // Check threshold → proctor lock
    const threshold = this.getThreshold(type);
    if (threshold && count >= threshold) {
      this.onProctorLock?.(`Batas toleransi pelanggaran terlampaui (${type} x${count}). Sesi terkunci menunggu pengawas.`);
    }
  }

  private getThreshold(type: ViolationType): number | null {
    if (type === "fullscreen_exit") return this.config.max_fullscreen_exits;
    if (type === "tab_blur") return this.config.max_tab_blurs;
    return null;
  }

  private enforceFullscreen(): () => void {
    const tryFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        this.hasEnteredFullscreen = true;
      } catch {
        this.hasEnteredFullscreen = false;
      }
    };

    const handler = () => {
      if (!document.fullscreenElement && this.hasEnteredFullscreen) {
        this.onLock?.("Keluar dari mode layar penuh terdeteksi. Kembali ke fullscreen untuk melanjutkan.");
        this.log("fullscreen_exit");
      }
    };

    tryFullscreen();
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }

  private watchTabBlur(): () => void {
    const visHandler = () => {
      if (document.hidden) this.log("tab_blur", { event: "visibility_hidden" });
    };
    const blurHandler = () => this.log("tab_blur", { event: "window_blur" });

    document.addEventListener("visibilitychange", visHandler);
    window.addEventListener("blur", blurHandler);
    return () => {
      document.removeEventListener("visibilitychange", visHandler);
      window.removeEventListener("blur", blurHandler);
    };
  }

  private blockClipboard(): () => void {
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("paste", stop);
    return () => {
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("paste", stop);
    };
  }

  private blockKeyboard(): () => void {
    const BLOCKED = new Set(["F12", "F5"]);
    const BLOCKED_CTRL = new Set(["c", "v", "a", "u", "s", "p", "f"]);
    const BLOCKED_CTRL_SHIFT = new Set(["i", "j", "c"]);

    const handler = (e: KeyboardEvent) => {
      if (BLOCKED.has(e.key)) { e.preventDefault(); this.log("keyboard_shortcut", { key: e.key }); }
      if (e.ctrlKey && BLOCKED_CTRL.has(e.key.toLowerCase())) { e.preventDefault(); this.log("keyboard_shortcut", { key: `Ctrl+${e.key}` }); }
      if (e.ctrlKey && e.shiftKey && BLOCKED_CTRL_SHIFT.has(e.key.toLowerCase())) { e.preventDefault(); this.log("keyboard_shortcut", { key: `Ctrl+Shift+${e.key}` }); }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }

  private blockContextMenu(): () => void {
    const handler = (e: MouseEvent) => { e.preventDefault(); this.log("right_click"); };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }

  getViolationSummary() {
    return Object.fromEntries(this.violations.entries());
  }
}
