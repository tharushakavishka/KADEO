import Link from "next/link";
import { ArrowLeft, Home, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#061612] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 flex items-center justify-center">
            <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-sans">
            kadeo<span className="text-emerald-400">.</span>
          </span>
        </Link>
      </header>

      {/* Center 404 Box */}
      <main className="w-full max-w-md mx-auto px-4 py-8 my-auto text-center z-10">
        <div className="bg-[#0b211a]/80 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-8 sm:p-10 shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 text-emerald-400">
            <Search className="w-8 h-8" />
          </div>

          <span className="text-5xl font-black text-emerald-400 tracking-tight font-mono block mb-2">
            404
          </span>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Page or Store Not Found
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/60 leading-relaxed mb-6">
            The page or online storefront you are looking for doesn&apos;t exist, might have been moved, or the link may be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Create Store</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-emerald-100/40">
        <p>© {new Date().getFullYear()} Kadeo. Empowering Sri Lankan Online Sellers.</p>
      </footer>
    </div>
  );
}
