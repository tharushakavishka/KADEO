"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loginAction, registerAction } from "@/features/auth/actions";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Store,
  ChevronRight,
} from "lucide-react";

interface AuthShellProps {
  mode: "login" | "register";
}

export default function AuthShell({ mode: initialMode }: AuthShellProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialMode);
  const isLogin = activeTab === "login";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync if initialMode changes
  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  // Support browser Back/Forward navigation
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      if (path.includes("register")) {
        setActiveTab("register");
      } else if (path.includes("login")) {
        setActiveTab("login");
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function switchTab(newTab: "login" | "register") {
    if (activeTab === newTab) return;
    setError(null);
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newTab === "login" ? "/login" : "/register");
    }
  }

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="min-h-screen w-full bg-[#f8faf9] relative flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Atmosphere Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/50 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100/40 via-amber-50/30 to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/3 -z-10" />

      {/* Outer Card Container */}
      <div className="w-full max-w-[1100px] bg-white rounded-3xl sm:rounded-[32px] border border-emerald-950/[0.08] shadow-[0_24px_70px_-15px_rgba(6,78,59,0.12)] overflow-hidden flex flex-col lg:flex-row backdrop-blur-sm">
        
        {/* Left Column: Interactive Animated Form Area */}
        <div className="w-full lg:w-[56%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-white">
          <div>
            {/* Top Navigation & Logo */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 p-1.5 flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/KADEO.png"
                    alt="KADEO"
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-emerald-950 font-sans leading-none">
                    kadeo<span className="text-emerald-500">.</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700/80 mt-0.5">
                    Merchant Portal
                  </span>
                </div>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-700 transition px-3 py-1.5 rounded-full hover:bg-emerald-50/80"
              >
                <span>Back to Home</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pill Toggle with Hardware-Accelerated Sliding Animation */}
            <div className="flex items-center justify-center mb-7">
              <div className="relative flex p-1.5 bg-zinc-100/90 rounded-2xl border border-zinc-200/80 max-w-sm w-full select-none shadow-inner shadow-zinc-200/40">
                {/* Sliding Green Pill */}
                <div
                  className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 shadow-md shadow-emerald-950/25 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    transform: isLogin ? "translateX(0%)" : "translateX(calc(100% + 6px))",
                  }}
                />

                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                    isLogin ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <LogIn className={`w-4 h-4 transition-transform duration-200 ${isLogin ? "scale-105" : "scale-100"}`} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                    !isLogin ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <UserPlus className={`w-4 h-4 transition-transform duration-200 ${!isLogin ? "scale-105" : "scale-100"}`} />
                  <span>Create Store</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200/90 text-xs sm:text-sm text-red-700 flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                <span className="w-4 h-4 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Smooth Sliding Form Panels Carousel Track */}
            <div className="overflow-hidden w-full relative">
              <div
                className="flex w-[200%] transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: isLogin ? "translateX(0%)" : "translateX(-50%)",
                }}
              >
                {/* PANEL 1: Sign In */}
                <div
                  className={`w-1/2 pr-3 sm:pr-4 transition-opacity duration-300 ${
                    isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="mb-5">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 font-sans">
                      Welcome back
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Sign in to your Kadeo merchant dashboard and track sales.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} method="POST" className="space-y-4">
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-email"
                          type="email"
                          name="email"
                          required
                          disabled={!isLogin}
                          placeholder="seller@yourstore.lk"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="login-password"
                          className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider"
                        >
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          disabled={!isLogin}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer transition"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isLogin}
                      className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-md shadow-emerald-900/20 hover:shadow-lg hover:shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing in to Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* PANEL 2: Create Account / Store */}
                <div
                  className={`w-1/2 pl-3 sm:pl-4 transition-opacity duration-300 ${
                    !isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 font-sans">
                      Start your store
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Launch your online store on KADEO in less than 2 minutes.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} method="POST" className="space-y-3.5">
                    <div>
                      <label
                        htmlFor="reg-fullName"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Full Name / Business Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-fullName"
                          type="text"
                          name="fullName"
                          required
                          disabled={isLogin}
                          placeholder="e.g. Kasun Perera"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-email"
                          type="email"
                          name="email"
                          required
                          disabled={isLogin}
                          placeholder="seller@yourbrand.lk"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-password"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          disabled={isLogin}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer transition"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-confirmPassword"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          required
                          disabled={isLogin}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 text-zinc-900 text-sm placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer transition"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || isLogin}
                      className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-md shadow-emerald-900/20 hover:shadow-lg hover:shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating your store...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Free Store Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Quick Trust Highlights */}
            <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                <span className="text-[11px] font-medium text-zinc-500">No card required</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">⚡</span>
                <span className="text-[11px] font-medium text-zinc-500">Instant WhatsApp</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">📦</span>
                <span className="text-[11px] font-medium text-zinc-500">Island-wide COD</span>
              </div>
            </div>
          </div>

          {/* Bottom Switch Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-center text-xs text-zinc-500">
            {isLogin ? (
              <span>
                Don&apos;t have a Kadeo store yet?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer ml-1"
                >
                  Create one for free
                </button>
              </span>
            ) : (
              <span>
                Already running a store on Kadeo?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer ml-1"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: High-End Brand Visual Showcase Banner */}
        <div className="hidden lg:flex lg:w-[44%] relative bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#01261f] p-10 flex-col justify-between overflow-hidden text-white select-none">
          {/* Subtle Graphic Glow and Circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sri Lanka&apos;s #1 Local Commerce</span>
            </span>
            <span className="text-xs font-mono text-emerald-300/80">v1.0 Live</span>
          </div>

          {/* Central Showcase Visual */}
          <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-2xl flex items-center justify-center">
                <Store className="w-12 h-12 text-emerald-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active Store
              </div>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-white max-w-xs leading-snug">
              Every tool you need to sell online.
            </h3>
            <p className="text-xs text-emerald-200/80 mt-2 max-w-xs leading-relaxed">
              Accept WhatsApp orders, print thermal receipts, manage island-wide courier deliveries, and grow your brand.
            </p>

            {/* Mini Stat Badges */}
            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-left">
                <div className="text-emerald-300 font-black text-lg">3x Faster</div>
                <div className="text-[11px] text-emerald-100/70">WhatsApp Checkout</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-left">
                <div className="text-emerald-300 font-black text-lg">100% COD</div>
                <div className="text-[11px] text-emerald-100/70">Domex / Koombiyo</div>
              </div>
            </div>
          </div>

          {/* Bottom Security / Trust Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Cloud Storage</span>
            </div>
            <span>Powered by Supabase</span>
          </div>
        </div>

      </div>
    </div>
  );
}
