"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/overview");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9ff_100%)] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_18%,rgba(194,220,255,0.62),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(202,231,255,0.64),transparent_30%),radial-gradient(circle_at_48%_92%,rgba(255,255,255,0.98),transparent_34%)]" />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-[21px] bg-[#2f66e9] shadow-[0_12px_28px_rgba(47,102,233,0.3)]">
            <Shield className="h-8 w-8 text-white" strokeWidth={2.1} />
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.035em] text-[#1f2c43]">
            Masuk ke Aruthala
          </h1>
          <p className="mt-2 text-base text-[#667a99]">Platform LMS Ujian Aman Indonesia</p>
        </div>

        <div className="w-full rounded-[25px] border border-white/80 bg-white/60 p-8 shadow-[0_24px_70px_rgba(57,111,190,0.16)] backdrop-blur-xl sm:p-9">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a5bf]" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="nama@sekolah.sch.id"
                required
                className="input-field-lg"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a5bf]" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan kata sandi"
                required
                className="input-field-lg pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#91a5bf] transition-colors hover:text-[#5278c9]"
              >
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-[#f04444]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1 w-full rounded-2xl bg-[#2f66e9] py-4 text-base font-semibold text-white shadow-[0_7px_12px_rgba(47,102,233,0.23)] transition-all hover:bg-[#285bd3] hover:shadow-[0_9px_18px_rgba(47,102,233,0.28)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 space-y-3 text-center text-base text-[#687b98]">
            <p>
              Kamu siswa?{" "}
              <Link href="/siswa" className="font-semibold text-[#2f66e9] transition-colors hover:text-[#1c52cf]">
                Masuk dengan NISN →
              </Link>
            </p>
            <p>
              Sekolah belum terdaftar?{" "}
              <Link href="/register" className="font-semibold text-[#2f66e9] transition-colors hover:text-[#1c52cf]">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#8ea0bb]">
          © 2026 Aruthala Edu · Keamanan Data UU PDP
        </p>
      </div>
    </div>
  );
}
