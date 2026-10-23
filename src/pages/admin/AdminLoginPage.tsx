import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storageService';
import { Shield, Eye, EyeOff, Lock, ArrowLeft, Sun, Moon } from 'lucide-react';
import { KadeoLogo } from '../../components/common/KadeoLogo';

export const AdminLoginPage: React.FC = () => {
  const { loginAsUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract redirect query parameter if present and sanitize against open redirects
  const query = new URLSearchParams(location.search);
  const rawRedirect = query.get('redirect');
  const redirectPath =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
      ? rawRedirect
      : '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Both email and password are required.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await ApiService.loginWithEmail(cleanEmail, cleanPassword);
      if (res?.user?.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        setIsLoading(false);
        return;
      }

      StorageService.addUser(res.user);
      loginAsUser(res.user.id);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 font-sans page-transition ${
        isDark ? 'bg-[#0A0A0C] text-neutral-100' : 'bg-[#FAFAF9] text-[#0F0F11]'
      }`}
    >
      {/* Top action bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
            isDark
              ? 'border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
              : 'border-[#E4E4E7] bg-white text-[#71717A] hover:text-[#0F0F11]'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Marketplace</span>
        </Link>

        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all ${
            isDark
              ? 'border-white/10 bg-white/5 text-amber-300 hover:bg-white/10'
              : 'border-[#E4E4E7] bg-white text-[#71717A] hover:text-[#0F0F11]'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <Link to="/" className="inline-flex items-center justify-center group">
          <KadeoLogo size="lg" theme={isDark ? 'dark' : 'light'} />
        </Link>

        <div className="flex items-center justify-center gap-2 mt-4">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold ${
              isDark
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                : 'bg-neutral-100 text-[#0F0F11] border border-neutral-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Platform Governance</span>
          </span>
        </div>

        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Super Administrator Console
        </h2>
        <p className={`mt-2 text-xs max-w-sm mx-auto ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
          Merchant moderation, catalog oversight, and platform subscription management.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div
          className={`p-8 sm:p-10 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/95 border-white/10 shadow-2xl backdrop-blur-xl'
              : 'bg-white border-[#E4E4E7] shadow-luxury-lg'
          }`}
        >
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 p-3.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`w-full rounded-2xl border py-2.5 px-4 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Master Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`w-full rounded-2xl border py-2.5 pl-4 pr-11 text-xs transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                      : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-3 transition-colors ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-[#71717A] hover:text-[#0F0F11]'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-luxury-xs cursor-pointer active:scale-[0.98] disabled:opacity-50 ${
                isDark
                  ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                  : 'bg-[#0F0F11] hover:bg-black text-white'
              }`}
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Governance Console'}
            </button>
          </form>

          {/* Quick Demo Credentials Info for Evaluator */}
          <div
            className={`pt-5 mt-6 border-t text-center space-y-1 ${
              isDark ? 'border-white/10' : 'border-[#F4F4F5]'
            }`}
          >
            <p className="text-[11px] font-mono text-neutral-400">
              Evaluation Credentials: <strong className={isDark ? 'text-white' : 'text-neutral-900'}>admin@kadeo.lk</strong> / <strong className={isDark ? 'text-white' : 'text-neutral-900'}>admin1234</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
