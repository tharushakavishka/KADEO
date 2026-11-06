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
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/70 via-[#f0fbf7] to-teal-50/50 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1080px] bg-white rounded-3xl border border-emerald-100/80 shadow-2xl shadow-emerald-950/10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Column: Interactive Animated Form Area */}
        <div className="w-full md:w-[58%] lg:w-[56%] p-6 sm:p-9 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Top Badge: Trusted by Sri Lankan sellers */}
            <div className="flex items-center justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold shadow-xs">
                <span className="text-emerald-600 text-sm leading-none" aria-hidden="true">
                  🌿
                </span>
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span className="tracking-tight">Trusted by Sri Lankan sellers</span>
                <span className="text-emerald-600 text-sm leading-none scale-x-[-1] inline-block" aria-hidden="true">
                  🌿
                </span>
              </div>
            </div>

            {/* Pill Toggle with Hardware-Accelerated Sliding Animation */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative flex p-1 bg-zinc-100 rounded-full border border-zinc-200/90 max-w-sm w-full select-none">
                {/* Sliding Green Pill */}
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#064e3b] shadow-md transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    transform: isLogin ? "translateX(0%)" : "translateX(calc(100% + 4px))",
                  }}
                />

                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    isLogin ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <LogIn className={`w-4 h-4 transition-transform duration-200 ${isLogin ? "scale-105" : "scale-100"}`} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    !isLogin ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <UserPlus className={`w-4 h-4 transition-transform duration-200 ${!isLogin ? "scale-105" : "scale-100"}`} />
                  <span>Create Account</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2 animate-in fade-in duration-200">
                <span className="font-bold">•</span>
                <span>{error}</span>
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center mb-2">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <h1 className="text-2xl sm:text-[25px] font-bold tracking-tight text-zinc-900">
                      Sign In
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                      Access your Kadeo account and manage your store.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                          placeholder="you@domain.lk"
                          className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
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
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          Forgot Password?
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
                          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer"
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
                      className="w-full mt-3 py-3 px-5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* PANEL 2: Create Account */}
                <div
                  className={`w-1/2 pl-3 sm:pl-4 transition-opacity duration-300 ${
                    !isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="mb-5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center mb-2">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <h1 className="text-2xl sm:text-[25px] font-bold tracking-tight text-zinc-900">
                      Create Account
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                      Start your online store on Kadeo in just a few steps.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="reg-fullName"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-fullName"
                          type="text"
                          name="fullName"
                          required
                          disabled={isLogin}
                          placeholder="John Perera"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
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
                          placeholder="you@domain.lk"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-password"
                        className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          disabled={isLogin}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer"
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
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 cursor-pointer"
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
                      className="w-full mt-2 py-3 px-5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating store...</span>
                        </>
                      ) : (
                        <>
                          <span>Create your store</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200/90" />
              </div>
              <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                <span className="bg-white px-3">or</span>
              </div>
            </div>

            {/* Trust points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px] sm:text-xs text-zinc-600 mb-5">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Quick and easy setup</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Built for Sri Lankan sellers</span>
              </div>
            </div>
          </div>

          {/* Bottom Tinted Pill with Instant Animated Switch */}
          <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl py-2.5 px-4 text-xs text-zinc-600 text-center flex items-center justify-center gap-2 transition-all duration-300">
            {isLogin ? (
              <span>
                New to Kadeo?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Branded Graphic Image Banner (login.png) */}
        <div className="hidden md:flex md:w-[42%] lg:w-[44%] relative bg-[#012f2c] items-center justify-center overflow-hidden">
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
