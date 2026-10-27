import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { KadeoLogo } from '../../components/common/KadeoLogo';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Palette,
  Truck,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Zap,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { StorefrontThemeId } from '../../types';

export const SellerRegisterPage: React.FC = () => {
  const { registerSeller } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialShopParam = searchParams.get('shop') || '';

  const [step, setStep] = useState(1);

  // Step 1: Account & Shop Details
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState(
    initialShopParam
      ? initialShopParam
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : ''
  );

  // Custom Editable Store URL Slug
  const [customSlug, setCustomSlug] = useState(
    initialShopParam
      ? initialShopParam.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : ''
  );
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);

  // Auto-sync slug from shopName if user hasn't manually customized it
  useEffect(() => {
    if (!isSlugCustomized) {
      const generated = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCustomSlug(generated);
    }
  }, [shopName, isSlugCustomized]);

  const handleSlugChange = (val: string) => {
    setIsSlugCustomized(true);
    // Sanitize slug input to URL-friendly characters only (lowercase letters, numbers, hyphens)
    const sanitized = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setCustomSlug(sanitized);
  };

  const handleResetSlug = () => {
    setIsSlugCustomized(false);
    const generated = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCustomSlug(generated);
  };

  const cleanSlug = customSlug.replace(/^-+|-+$/g, '') || 'your-shop-name';

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('Colombo');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Branding & Theme
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80'
  );
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80'
  );
  const [selectedTheme, setSelectedTheme] = useState<StorefrontThemeId>('minimal');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!ownerName.trim()) errs.ownerName = 'Your full name is required.';
    if (!shopName.trim()) errs.shopName = 'Boutique or brand name is required.';
    if (!cleanSlug || cleanSlug === 'your-shop-name') errs.slug = 'Please provide a valid store URL slug.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (!whatsappNumber.trim()) errs.whatsappNumber = 'WhatsApp order hotline is required.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOnboarding = async () => {
    try {
      setIsSubmitting(true);
      const { shop } = registerSeller({
        ownerName,
        shopName,
        email,
        phone,
        whatsappNumber,
        city,
        themeId: selectedTheme,
        password,
      });

      // Ensure customized slug, logo, and cover are stored
      StorageService.updateShop(shop.id, {
        slug: cleanSlug,
        ...(logoUrl || coverUrl ? { logo: logoUrl, coverImage: coverUrl } : {}),
      });

      navigate('/seller/dashboard');
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Failed to complete registration.' });
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Store Info', icon: Store },
    { num: 2, label: 'Branding & Theme', icon: Palette },
    { num: 3, label: 'Launch Store', icon: Sparkles },
  ];

  const presetThemes = [
    {
      id: 'minimal' as StorefrontThemeId,
      name: 'Minimalist Boutique',
      tag: 'Best for Fashion & Linen',
      desc: 'Airy layout, serif typography, high-fashion product grid and subtle shadows.',
      primaryColor: '#00B074',
      bgSample: 'bg-[#F9FAF8]',
    },
    {
      id: 'beauty' as StorefrontThemeId,
      name: 'Glow & Wellness',
      tag: 'Best for Skincare & Organic',
      desc: 'Warm organic terracotta hues, herbal highlights, and verified botanical badges.',
      primaryColor: '#D97706',
      bgSample: 'bg-[#FAF6F0]',
    },
    {
      id: 'modern' as StorefrontThemeId,
      name: 'Urban High-Contrast',
      tag: 'Best for Tech & Crafts',
      desc: 'Crisp modern dark mode elements, technical specs, and fast shipping indicators.',
      primaryColor: '#0284C7',
      bgSample: 'bg-[#F1F5F9]',
    },
  ];

  const presetCovers = [
    {
      name: 'Linen Boutique',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Botanical & Beauty',
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Handcrafted Decor',
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 font-sans antialiased selection:bg-[#00B074] selection:text-white pb-20">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER NAVIGATION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <KadeoLogo size="md" showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50/70 border border-emerald-200/70 px-3 py-1 rounded-full">
              <ShieldCheck className="h-4 w-4 text-[#00B074]" />
              <span>Verified Seller Registration</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                Already registered?
              </span>
              <Link
                to="/seller/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>Seller Login</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00B074]" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. PAGE HERO & STEPPER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1 text-xs font-bold text-[#00B074] shadow-2xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ZERO CODE • 0% COMMISSION • LIVE IN 2 MINUTES</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Create Your Free Online Store
        </h1>

        <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          The easiest way for Sri Lankan boutique owners, makers, and creators to sell products online with their own branded website.
        </p>

        {/* Stepper Navigation Bar (3 Steps) */}
        <div className="max-w-xl mx-auto pt-6">
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-between gap-1.5">
            {steps.map(s => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={s.num > step}
                  onClick={() => s.num < step && setStep(s.num)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#00B074] text-white shadow-sm ring-2 ring-[#00B074]/20'
                      : isPast
                      ? 'text-[#00B074] hover:bg-emerald-50 cursor-pointer'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? 'bg-white text-[#00B074]'
                        : isPast
                        ? 'bg-emerald-100 text-[#00B074]'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="h-3 w-3 stroke-[3]" /> : s.num}
                  </div>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. CLEAN CENTERED FORM CARD
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 relative">
          {/* STEP 1: STORE & CREDENTIALS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00B074]">
                  Step 1 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Boutique & Account Information
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your boutique name, customize your dedicated URL, and secure your dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Boutique Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-[#00B074]" />
                    <span>Boutique / Brand Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="e.g. Ceylon Linen Atelier, UrbanPulse Tech"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-3 px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:ring-2 focus:ring-[#00B074]/15 focus:outline-none transition-all font-medium"
                  />
                  {errors.shopName && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.shopName}</p>
                  )}
                </div>

                {/* EDITABLE CUSTOM STORE URL SLUG INPUT */}
                <div className="sm:col-span-2 space-y-2 p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#00B074]" />
                      <span>Your live dedicated store URL:</span>
                    </label>

                    {isSlugCustomized && (
                      <button
                        type="button"
                        onClick={handleResetSlug}
                        className="text-[11px] font-semibold text-slate-500 hover:text-[#00B074] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Reset to name-based URL"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Auto-sync with name</span>
                      </button>
                    )}
                  </div>

                  {/* Interactive Editable URL Box */}
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:border-[#00B074] focus-within:ring-2 focus-within:ring-[#00B074]/20 transition-all">
                    <span className="bg-slate-100/90 px-3 sm:px-3.5 py-2.5 text-xs text-slate-600 font-mono font-semibold border-r border-slate-200 select-none shrink-0 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-[#00B074]" />
                      <span>kadeo.lk/shop/</span>
                    </span>

                    <input
                      type="text"
                      value={customSlug}
                      onChange={e => handleSlugChange(e.target.value)}
                      placeholder="your-shop-name"
                      className="flex-1 px-3 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#00B074] placeholder:text-slate-300 bg-transparent focus:outline-none min-w-0"
                    />

                    <div className="px-3 py-1 flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg m-1 shrink-0">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Available</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Type your desired custom web address above (letters, numbers and hyphens only). Customers can visit your store directly with this link!
                  </p>
                  {errors.slug && <p className="text-[11px] font-medium text-rose-500">{errors.slug}</p>}
                </div>

                {/* Owner Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Owner's Full Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Kasun Jayawardena"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.ownerName && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.ownerName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Address</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourbrand.lk"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.email && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.email}</p>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                    <span>WhatsApp Order Hotline</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="94771234567 (with 94 country code)"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.whatsappNumber && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.whatsappNumber}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>City / District</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Colombo 07, Kandy, Galle"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Contact Phone */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Customer Helpline Phone</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Dashboard Password</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 pl-3.5 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Confirm Password</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING & THEME SELECTION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00B074]">
                  Step 2 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Boutique Branding & Editorial Theme
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select a curated Sri Lankan theme and customize your visual lookbook.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800">
                  Choose Your Storefront Theme:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {presetThemes.map(th => {
                    const isSelected = selectedTheme === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => setSelectedTheme(th.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#00B074] bg-emerald-50/50 shadow-sm ring-2 ring-[#00B074]/15'
                            : 'border-slate-200 bg-[#F9FAF8] hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B074] bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              {th.tag}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                                isSelected
                                  ? 'bg-[#00B074] border-[#00B074] text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{th.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{th.desc}</p>
                        </div>

                        <div className={`mt-3 pt-2.5 border-t border-slate-200/60 rounded-lg p-2 ${th.bgSample}`}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-md"
                              style={{ backgroundColor: th.primaryColor }}
                            />
                            <div className="space-y-1 flex-1">
                              <div className="h-1.5 w-14 bg-slate-900/30 rounded" />
                              <div className="h-1 w-8 bg-slate-900/20 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Banner Presets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-800">
                  Quick Pick Store Banner (or paste custom URL below):
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {presetCovers.map(banner => (
                    <div
                      key={banner.name}
                      onClick={() => setCoverUrl(banner.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer aspect-[16/9] transition-all ${
                        coverUrl === banner.url
                          ? 'border-[#00B074] ring-2 ring-[#00B074]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={banner.url}
                        alt={banner.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white font-semibold truncate block">
                        {banner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Banner & Logo URL Inputs */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Custom Banner Image URL</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2 px-3 text-xs text-slate-900 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Boutique Logo Image URL</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 bg-[#F9FAF8] py-2 px-3 text-xs text-slate-900 focus:border-[#00B074] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & LAUNCH CELEBRATION */}
          {step === 3 && (
            <div className="space-y-6 text-center py-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#00B074] border border-emerald-200 shadow-sm">
                <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Your Storefront is Ready to Launch!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Your boutique has been created. You can immediately share your custom link on Instagram, TikTok, and WhatsApp.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-[#F9FAF8] p-5 text-xs text-left space-y-3 max-w-lg mx-auto shadow-2xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Boutique Name</span>
                  <strong className="text-slate-900 font-bold">{shopName || 'Ceylon Linen Atelier'}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Storefront Link</span>
                  <strong className="font-mono text-[#00B074] font-bold">kadeo.lk/shop/{cleanSlug}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">WhatsApp Orders Hotline</span>
                  <strong className="font-mono text-slate-900">+{whatsappNumber || phone || '94771234567'}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Theme Style</span>
                  <strong className="capitalize text-slate-900">{selectedTheme} Theme</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Platform Fee</span>
                  <span className="text-[#00B074] font-extrabold">0% Commission • Free Forever</span>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold max-w-md mx-auto">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION CONTROLS */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                to="/seller/login"
                className="text-xs font-bold text-slate-500 hover:text-[#00B074] transition-colors"
              >
                Already registered? Sign in ➔
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-extrabold shadow-sm shadow-[#00B074]/30 transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#00B074]/35 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ml-auto"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? 'Launching Store...' : 'Launch Store & Open Dashboard ➔'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. VALUE PROPOSITION PILLARS (BOTTOM OF PAGE)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#00B074] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">0% Commission Forever</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep 100% of your earnings. No hidden charges or transaction cuts on your hard-earned sales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#00B074] flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Direct WhatsApp Orders</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers send 1-click orders with customer address and quantities straight into your chat.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#00B074] flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Islandwide Courier Ready</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Supports Cash on Delivery (COD) across all 25 Sri Lankan districts with automated delivery slips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
