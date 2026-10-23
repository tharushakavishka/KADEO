import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { KadeoLogo } from '../../components/common/KadeoLogo';
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Store } from 'lucide-react';

export const SellerLoginPage: React.FC = () => {
  const { loginAsUser, loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Extract redirect query parameter if present and sanitize against open redirects
  const query = new URLSearchParams(location.search);
  const rawRedirect = query.get('redirect');
  const redirectPath =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
      ? rawRedirect
      : '/seller/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      if (result.success && result.user && (result.user.role === 'seller' || result.user.role === 'admin')) {
        navigate(redirectPath, { replace: true });
      } else if (result.success && result.user && result.user.role !== 'seller') {
        setError('This account does not have seller privileges. Please register below to create your store.');
      } else {
        setError(result.message || 'Invalid seller credentials. Please check your email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;

    await StorageService.syncWithDatabase().catch(() => {});

    // Check if this Google user is already an existing seller
    const users = StorageService.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === googleEmail.toLowerCase().trim());
    if (existing && existing.role === 'seller') {
      loginAsUser(existing.id);
      setGooglePromptOpen(false);
      navigate(redirectPath, { replace: true });
      return;
    }

    loginWithGoogle({
      name: googleName.trim() || 'Google Seller',
      email: googleEmail.trim(),
    });
    setGooglePromptOpen(false);
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-white flex flex-col justify-between page-transition">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <KadeoLogo size="md" showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-neutral-500 font-medium">
              Don't have a boutique yet?
            </span>
            <Link
              to="/seller/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-neutral-400 text-xs font-bold text-neutral-800 transition-colors shadow-2xs"
            >
              <span>Open Free Store</span>
              <ArrowRight className="h-3 w-3 text-[#10B981]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MAIN LOGIN FORM CARD
      ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-10 shadow-sm">
            {/* Header / Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span>Merchant Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Seller Sign In
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Log in to manage your inventory, process WhatsApp orders, and update storefront styling.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={() => setGooglePromptOpen(true)}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-[#E5E7EB] bg-white text-xs sm:text-sm font-semibold text-neutral-800 hover:bg-[#F8F8F5] hover:border-neutral-300 transition-all shadow-2xs cursor-pointer active:scale-[0.99] mb-5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Form Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-[#E5E7EB] w-full" />
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider absolute bg-white text-neutral-400">
                or email & password
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="seller-email"
                  className="block text-xs font-bold text-neutral-800 mb-1.5"
                >
                  Seller Email Address
                </label>
                <input
                  id="seller-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seller@yourbrand.lk"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="seller-password"
                    className="block text-xs font-bold text-neutral-800"
                  >
                    Password
                  </label>
                  <Link
                    to="/seller/register"
                    className="text-[11px] font-semibold text-[#10B981] hover:underline"
                  >
                    Need an account?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="seller-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Store Dashboard'}</span>
                <ArrowRight className="h-4 w-4 text-[#10B981]" />
              </button>
            </form>

            {/* Bottom Sign-Up Prompt */}
            <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center">
              <p className="text-xs text-neutral-600">
                New seller on Kadeo?{' '}
                <Link
                  to="/seller/register"
                  className="font-bold text-[#10B981] hover:underline hover:text-[#059669]"
                >
                  Create a boutique in 2 minutes →
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-semibold text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              <span>256-Bit SSL Protection</span>
            </span>
            <span>•</span>
            <span>Direct WhatsApp Ordering</span>
            <span>•</span>
            <span>0% Commission</span>
          </div>
        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. GOOGLE AUTHENTICATION MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      {googlePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl text-neutral-900 border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Sign in with Google</h3>
                <p className="text-[11px] text-neutral-500">Choose your Google Account</p>
              </div>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={e => setGoogleName(e.target.value)}
                  placeholder="e.g. Kasun Jayawardena"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGooglePromptOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Authorize & Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
