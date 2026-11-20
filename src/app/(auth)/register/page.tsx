"use client";

import Link from "next/link";
import { useState } from "react";
import { registerAction } from "@/features/auth/actions";
import { ArrowRight, Loader2, Lock, Mail, User, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerAction(formData);
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
    <div className="min-h-screen w-full bg-[#f7f4ec] text-[#0a1410] flex flex-col justify-between selection:bg-[#2d6a4f] selection:text-[#f7f4ec] relative overflow-hidden font-sans">
      {/* Background Organic Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(76,154,112,0.14), transparent 70%),
            radial-gradient(ellipse 45% 30% at 90% 15%, rgba(200,162,68,0.1), transparent 70%)
          `,
        }}
      />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0f3d2e] p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0a1410]">
            kadeo<span className="text-[#4c9a70]">.</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b5e4a] hover:text-[#0a1410] transition-colors px-3 py-1.5 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Content Center */}
      <main className="w-full max-w-[460px] mx-auto px-6 py-4 my-auto">
        {/* Subtle Top Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#0a141018] bg-white/70 text-[11px] font-mono tracking-widest text-[#6b5e4a] uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4c9a70] shadow-[0_0_0_2px_rgba(76,154,112,0.2)]" />
            Start Selling Online
          </span>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a1410] mt-3.5">
            Let&apos;s start your <em className="text-[#2d6a4f] font-serif font-normal italic">store.</em>
          </h1>
          <p className="text-sm text-[#6b5e4a] mt-1.5 leading-relaxed">
            Create your account in seconds. No credit card required.
          </p>
        </div>

        {/* Clean Foreststore Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#0a141018] p-7 sm:p-8 shadow-[0_16px_40px_-12px_rgba(10,20,16,0.08)]">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50/80 border border-red-200/80 text-xs text-red-800 flex items-start gap-2.5">
              <span className="font-bold">•</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6b5e4a] mb-1.5">
                Full Name / Brand Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6b5e4a]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Ceylon Spices"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0a141020] bg-[#f7f4ec]/40 text-[#0a1410] text-sm placeholder:text-[#6b5e4a]/50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-3 focus:ring-[#4c9a70]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6b5e4a] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6b5e4a]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seller@yourbrand.lk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0a141020] bg-[#f7f4ec]/40 text-[#0a1410] text-sm placeholder:text-[#6b5e4a]/50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-3 focus:ring-[#4c9a70]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6b5e4a] mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6b5e4a]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#0a141020] bg-[#f7f4ec]/40 text-[#0a1410] text-sm placeholder:text-[#6b5e4a]/50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-3 focus:ring-[#4c9a70]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5e4a]/60 hover:text-[#0a1410] p-1 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6b5e4a] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6b5e4a]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#0a141020] bg-[#f7f4ec]/40 text-[#0a1410] text-sm placeholder:text-[#6b5e4a]/50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-3 focus:ring-[#4c9a70]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5e4a]/60 hover:text-[#0a1410] p-1 transition"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f3d2e] hover:bg-[#1b4d3c] text-[#f7f4ec] font-medium text-sm tracking-wide transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#f7f4ec]" />
                  <span>Creating store...</span>
                </>
              ) : (
                <>
                  <span>Create Free Store</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Perks Pill */}
          <div className="mt-5 py-2.5 px-3 rounded-2xl bg-[#f7f4ec] border border-[#0a141010] flex items-center justify-around text-[11px] text-[#6b5e4a]">
            <span>✓ No card needed</span>
            <span>•</span>
            <span>⚡ 2-min setup</span>
            <span>•</span>
            <span>📦 COD ready</span>
          </div>

          {/* Bottom Switch Link */}
          <div className="mt-5 pt-4 border-t border-[#0a141012] text-center">
            <p className="text-xs text-[#6b5e4a]">
              Already have a store on Kadeo?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0f3d2e] hover:text-[#2d6a4f] underline underline-offset-4 decoration-[#4c9a70]/50 ml-1 transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-[#6b5e4a]/70">
        <p>© {new Date().getFullYear()} Kadeo. Built for Sri Lankan businesses.</p>
      </footer>
    </div>
  );
}
