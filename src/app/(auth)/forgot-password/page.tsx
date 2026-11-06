"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPasswordAction } from "@/features/auth/actions";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPasswordAction(formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess("If an account exists with that email, a password reset link has been sent.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/70 via-[#f0fbf7] to-teal-50/50 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-[1060px] bg-white rounded-3xl border border-emerald-100/80 shadow-2xl shadow-emerald-950/10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Column: Form Section */}
        <div className="w-full md:w-[58%] lg:w-[55%] p-6 sm:p-9 lg:p-11 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>

              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="you@domain.lk"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 bg-emerald-50/70 border border-emerald-100/80 rounded-xl py-2.5 px-4 text-xs text-zinc-600 text-center flex items-center justify-center gap-2">
            <span>
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>

        {/* Right Column: Branded Graphic Image Banner (login.png) */}
        <div className="hidden md:flex md:w-[42%] lg:w-[45%] relative bg-[#012f2c] items-center justify-center overflow-hidden">
          <img
            src="/images/login.png"
            alt="KADEO online store platform"
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
          />
        </div>

      </div>
    </div>
  );
}
