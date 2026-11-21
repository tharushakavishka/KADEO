"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("KADEO Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#061612] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      <header className="w-full max-w-5xl mx-auto px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 flex items-center justify-center">
            <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-sans">
            kadeo<span className="text-emerald-400">.</span>
          </span>
        </Link>
      </header>

      <main className="w-full max-w-md mx-auto px-4 py-8 my-auto text-center z-10">
        <div className="bg-[#0b211a]/80 backdrop-blur-xl rounded-3xl border border-red-500/20 p-8 sm:p-10 shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Something went wrong
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/60 leading-relaxed mb-6">
            An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-emerald-100/40">
        <p>© {new Date().getFullYear()} Kadeo. All rights reserved.</p>
      </footer>
    </div>
  );
}
