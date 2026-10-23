import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { Check, Globe, Shield, Lock, Bell, RefreshCw, Sparkles } from 'lucide-react';

export const SellerSettingsPage: React.FC = () => {
  const { currentShop, currentUser, refreshShop } = useAuth();
  const { isDark } = useTheme();
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentShop || !currentUser) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  const [ownerName, setOwnerName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [displayPhone, setDisplayPhone] = useState(currentShop.displayPhone);
  const [whatsappNumber, setWhatsappNumber] = useState(currentShop.whatsappNumber);
  const [city, setCity] = useState(currentShop.contactDetails.city);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user
    const users = StorageService.getUsers();
    const uIdx = users.findIndex(u => u.id === currentUser.id);
    if (uIdx !== -1) {
      users[uIdx].name = ownerName;
      users[uIdx].email = email;
      localStorage.setItem('kadeo_users_v1', JSON.stringify(users));
    }

    // Update shop preserving hero banner configured in Customize Studio
    StorageService.updateShop(currentShop.id, {
      displayPhone: displayPhone.trim(),
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
      heroBanner: currentShop.heroBanner,
      contactDetails: {
        ...currentShop.contactDetails,
        city: city.trim(),
      },
    });

    refreshShop();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? 'border-white/10' : 'border-[#E4E4E7]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full font-bold ${
                isDark
                  ? 'bg-white/10 text-neutral-300 border border-white/10'
                  : 'bg-neutral-100 text-[#0F0F11] border border-neutral-200'
              }`}
            >
              Merchant Preferences
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Account & Store Settings
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Manage your boutique credentials, contact lines, security, and trilingual i18n hooks.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 px-4 py-2 rounded-full border border-emerald-500/30 font-bold anim-slide-top">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Account Details */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <h2
            className={`text-xs font-extrabold uppercase tracking-wider pb-4 border-b ${
              isDark ? 'border-white/10' : 'border-[#F4F4F5]'
            }`}
          >
            1. Boutique Owner & Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Sign-in Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Display Telephone</label>
              <input
                type="tel"
                value={displayPhone}
                onChange={e => setDisplayPhone(e.target.value)}
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">WhatsApp Order Channel</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs font-mono transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Trilingual Readiness Preview */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              2. Sri Lankan Trilingual Localization Readiness
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Kadeo's catalog architecture includes direct i18n hooks for English, Sinhala (සිංහල), and Tamil (தமிழ்) localized buyer interfaces.
          </p>

          <div className="flex gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? isDark
                    ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                    : 'bg-[#0F0F11] text-white'
                  : isDark
                  ? 'border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                  : 'bg-neutral-100 text-[#71717A] hover:bg-neutral-200'
              }`}
            >
              English (Active Default)
            </button>
            <button
              type="button"
              onClick={() => setLang('si')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lang === 'si'
                  ? isDark
                    ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                    : 'bg-[#0F0F11] text-white'
                  : isDark
                  ? 'border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                  : 'bg-neutral-100 text-[#71717A] hover:bg-neutral-200'
              }`}
            >
              සිංහල (Preview)
            </button>
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lang === 'ta'
                  ? isDark
                    ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                    : 'bg-[#0F0F11] text-white'
                  : isDark
                  ? 'border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                  : 'bg-neutral-100 text-[#71717A] hover:bg-neutral-200'
              }`}
            >
              தமிழ் (Preview)
            </button>
          </div>

          {/* Sample translation preview */}
          <div
            className={`rounded-2xl p-4 text-xs border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAFAF9] border-[#E4E4E7]'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className={`block text-[11px] font-mono ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                  Shopping Bag
                </span>
                <span className="font-bold text-sm">
                  {lang === 'si' ? 'සාප්පු බෑගය' : lang === 'ta' ? 'ஷாப்பிங் பை' : 'Shopping Bag'}
                </span>
              </div>
              <div>
                <span className={`block text-[11px] font-mono ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                  Order via WhatsApp
                </span>
                <span className="font-bold text-sm">
                  {lang === 'si' ? 'වට්ස්ඇප් වෙත යවන්න' : lang === 'ta' ? 'வாட்ஸ்அப்பிற்கு அனுப்புக' : 'Send via WhatsApp'}
                </span>
              </div>
              <div>
                <span className={`block text-[11px] font-mono ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                  Sri Lankan Rupees
                </span>
                <span className="font-bold text-sm">
                  {lang === 'si' ? 'ශ්‍රී ලංකා රුපියල්' : lang === 'ta' ? 'இலங்கை ரூபாய்' : 'Sri Lankan Rupees'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              3. Security & Access Passcode
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. Live Storefront Hero Section Content & Media (Dedicated Customize Studio) */}
        <div
          className={`rounded-3xl border p-6 sm:p-8 transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider">
                  4. Live Storefront Hero Section Content & Media
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  DEDICATED STUDIO
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                Hero banners, editorial headlines, calls-to-action, media, and trust badges are now managed in the live interactive
                <strong className={isDark ? 'text-white' : 'text-[#0F0F11]'}> Customize</strong> Studio with real-time website preview.
              </p>
            </div>

            <Link
              to="/seller/customize"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                  : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Open Customize Studio →</span>
            </Link>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className={`rounded-full px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-luxury-xs cursor-pointer ${
              isDark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold shadow-emerald-500/10'
                : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
            }`}
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
