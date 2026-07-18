"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    
    try {
      const supabase = createClient();
      await supabase.from("error_logs").insert({
        error_message: error.message || "Unknown error",
        error_stack: error.stack || "",
        component_stack: errorInfo.componentStack || "",
        url: typeof window !== "undefined" ? window.location.href : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : ""
      });
    } catch (err) {
      console.error("Failed to log error to Supabase:", err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Oops, Sesuatu Salah!</h1>
            <p className="text-sm text-gray-500">
              Sistem mendeteksi adanya gangguan atau error pada halaman ini. 
              Tim teknis kami telah secara otomatis menerima notifikasi tentang masalah ini.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full px-6 py-3 bg-[#2f66e9] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-[0_12px_28px_rgba(47,102,233,0.32)]"
            >
              Muat Ulang Halaman
            </button>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-4 bg-gray-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs text-red-600 font-mono whitespace-pre-wrap">{this.state.error?.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
