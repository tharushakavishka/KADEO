"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/features/auth/actions";
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Store,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (
        (err as { digest?: string })?.digest?.includes("NEXT_REDIRECT") ||
        (err instanceof Error && err.message?.includes("NEXT_REDIRECT"))
      ) {
        throw err;
      }
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#061612] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic KADEO Mesh Atmosphere Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Deep Emerald Glow Top Left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        {/* Teal Accent Glow Bottom Right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-teal-500/15 rounded-full blur-[140px]" />
        {/* Subtle Center Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-emerald-950/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-none">
              kadeo<span className="text-emerald-400">.</span>
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200/70 hover:text-white transition px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="w-full max-w-[430px] mx-auto px-4 py-4 my-auto z-10">
        {/* Top Tag & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Seller Dashboard Login</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back to KADEO
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/60 mt-1 max-w-xs mx-auto">
            Manage your store, track WhatsApp orders, and print customer receipts.
          </p>
        </div>

        {/* Floating Modern Glass Card */}
        <div className="bg-[#0b211a]/80 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Card Top Border Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-75" />

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
              <span className="font-bold">•</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seller@yourstore.lk"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-emerald-500/20 bg-black/25 text-white text-sm placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition hover:underline font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-emerald-500/20 bg-black/25 text-white text-sm placeholder:text-emerald-200/30 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50 hover:text-white p-1 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Stats Pill inside Card */}
          <div className="mt-6 pt-5 border-t border-emerald-500/15 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-emerald-400 font-bold text-xs">Instant</span>
              <span className="text-[10px] text-emerald-200/60">WhatsApp</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-emerald-400 font-bold text-xs">80mm</span>
              <span className="text-[10px] text-emerald-200/60">Thermal Slips</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-emerald-400 font-bold text-xs">Courier</span>
              <span className="text-[10px] text-emerald-200/60">Domex Ready</span>
            </div>
          </div>

          {/* Bottom Switch Link */}
          <div className="mt-5 pt-4 border-t border-emerald-500/15 text-center">
            <p className="text-xs text-emerald-100/60">
              Don&apos;t have a store yet?{" "}
              <Link
                href="/register"
                className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 ml-1 transition"
              >
                Create your store for free
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-5 text-center text-xs text-emerald-100/40 z-10">
        <p>© {new Date().getFullYear()} Kadeo. Empowering Sri Lankan Online Sellers.</p>
      </footer>
    </div>
  );
}
