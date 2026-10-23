import React, { useState } from 'react';
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
  Package,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Palette,
  Truck,
  Layers,
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('Colombo 07');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Branding
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80'
  );
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80'
  );

  // Step 3: Theme selection
  const [selectedTheme, setSelectedTheme] = useState<StorefrontThemeId>('minimal');

  // Step 4: First Product
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('4500');
  const [productStock, setProductStock] = useState('10');
  const [productCategory, setProductCategory] = useState('cat-apparel');
  const [productDesc, setProductDesc] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanSlug = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'your-shop-name';

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!ownerName.trim()) errs.ownerName = 'Owner name is required.';
    if (!shopName.trim()) errs.shopName = 'Boutique or business name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (!whatsappNumber.trim()) errs.whatsappNumber = 'WhatsApp order number is required.';
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
      const { user, shop } = registerSeller({
        ownerName,
        shopName,
        email,
        phone,
        whatsappNumber,
        city,
        themeId: selectedTheme,
        password,
      });

      if (logoUrl || coverUrl) {
        StorageService.updateShop(shop.id, {
          logo: logoUrl,
          coverImage: coverUrl,
        });
      }

      if (productName.trim()) {
        StorageService.addProduct({
          shopId: shop.id,
          categoryId: productCategory,
          name: productName.trim(),
          slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: productDesc.trim() || 'High quality Sri Lankan handcrafted creation.',
          price: Number(productPrice) || 3500,
          sku: `${shopName.slice(0, 3).toUpperCase()}-001`,
          stockQuantity: Number(productStock) || 10,
          images: [
            logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          ],
          status: 'active',
          featured: true,
        });
      }

      navigate('/seller/dashboard');
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Failed to complete registration.' });
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Store Details' },
    { num: 2, title: 'Branding' },
    { num: 3, title: 'Theme' },
    { num: 4, title: 'First Product' },
    { num: 5, title: 'Launch' },
  ];

  const presetThemes = [
    {
      id: 'minimal' as StorefrontThemeId,
      name: 'Minimalist Boutique',
      tag: 'Best for Fashion & Lifestyle',
      desc: 'Clean editorial lookbook, airy whitespace, and high-fashion product grid.',
      bgSample: 'bg-[#FAF8F5]',
      borderSample: 'border-neutral-300',
    },
    {
      id: 'beauty' as StorefrontThemeId,
      name: 'Glow & Wellness',
      tag: 'Best for Skincare & Ayurveda',
      desc: 'Warm terracotta hues, organic highlights, and trust accreditation badges.',
      bgSample: 'bg-[#FAF5EE]',
      borderSample: 'border-amber-200',
    },
    {
      id: 'modern' as StorefrontThemeId,
      name: 'Urban High-Contrast',
      tag: 'Best for Tech, Jewelry & Crafts',
      desc: 'Deep modern contrast, specification lists, and instant courier dispatch tags.',
      bgSample: 'bg-[#F3F4F6]',
      borderSample: 'border-neutral-300',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#111111] font-sans antialiased selection:bg-[#10B981] selection:text-white pb-16 page-transition">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <KadeoLogo size="md" showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-neutral-500 font-medium">
              Already have an account?
            </span>
            <Link
              to="/seller/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-neutral-400 text-xs font-bold text-neutral-800 transition-colors shadow-2xs"
            >
              <span>Seller Login</span>
              <ArrowRight className="h-3 w-3 text-[#10B981]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. PAGE HERO & HEADLINE
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pt-10 sm:pt-14 pb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-semibold text-[#047857]">
          <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px]">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
          <span>Zero Code • 0% Commission • Live in 5 Minutes</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
          Create Your Free Online Shop
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
          The easiest way for Sri Lankan boutique owners and makers to sell online. Receive verified orders straight to your WhatsApp.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MULTI-STEP PROGRESS BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            {steps.map(s => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-[#10B981] text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-neutral-950 text-white ring-4 ring-emerald-500/15 shadow-xs'
                        : 'bg-[#F8F8F5] text-neutral-500 border border-[#E5E7EB]'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold hidden sm:block ${
                      isCurrent
                        ? 'text-neutral-950 font-bold'
                        : isPast
                        ? 'text-[#10B981]'
                        : 'text-neutral-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress track */}
          <div className="mt-4 h-1.5 w-full bg-[#F0F1ED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. MAIN WIZARD FORM CARD
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-sm">
          {/* STEP 1: SHOP & ACCOUNT DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                  Step 1 of 5
                </span>
                <h2 className="text-xl font-black text-neutral-950 tracking-tight mt-0.5">
                  Boutique Information & Login Credentials
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Claim your unique store URL and secure your seller dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Owner Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Kasun Jayawardena"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.ownerName && <p className="text-[11px] font-medium text-rose-500">{errors.ownerName}</p>}
                </div>

                {/* Boutique Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Boutique / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="e.g. Ceylon Linen Co."
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.shopName && <p className="text-[11px] font-medium text-rose-500">{errors.shopName}</p>}
                </div>

                {/* Branded Store URL Preview */}
                <div className="sm:col-span-2 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span className="text-neutral-600 font-medium">Your dedicated storefront URL:</span>
                  </div>
                  <strong className="font-mono text-neutral-950 font-bold bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    kadeo.lk/shop/<span className="text-[#10B981]">{cleanSlug}</span>
                  </strong>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@brand.lk"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.email && <p className="text-[11px] font-medium text-rose-500">{errors.email}</p>}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.phone && <p className="text-[11px] font-medium text-rose-500">{errors.phone}</p>}
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#10B981]" />
                    <span>WhatsApp Order Hotline</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="94771234567 (with 94 country code)"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.whatsappNumber && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.whatsappNumber}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Colombo 07, Kandy, Galle"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Dashboard Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 pl-3.5 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] font-medium text-rose-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-medium text-rose-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING & MEDIA */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                  Step 2 of 5
                </span>
                <h2 className="text-xl font-black text-neutral-950 tracking-tight mt-0.5">
                  Boutique Logo & Hero Cover Image
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Upload or paste image links for your storefront header. You can change these anytime in your dashboard.
                </p>
              </div>

              <div className="space-y-5">
                {/* Logo Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800">Boutique Logo</label>
                  <div className="flex items-center gap-4">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-16 w-16 rounded-2xl object-cover border border-[#E5E7EB] shadow-xs"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={e => setLogoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                      />
                      <p className="text-[11px] text-neutral-400">Square 1:1 image recommended (PNG or JPG)</p>
                    </div>
                  </div>
                </div>

                {/* Hero Banner Cover */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800">Storefront Hero Banner</label>
                  <div className="aspect-[16/6] w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs bg-neutral-100">
                    <img
                      src={coverUrl}
                      alt="Cover banner preview"
                      className="h-full w-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80';
                      }}
                    />
                  </div>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="Paste banner image URL (https://...)"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-neutral-400">Wide banner 16:6 aspect ratio recommended</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THEME SELECTION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                  Step 3 of 5
                </span>
                <h2 className="text-xl font-black text-neutral-950 tracking-tight mt-0.5">
                  Select Your Storefront Theme
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Each theme is tailored for specific Sri Lankan product niches. You can switch themes anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetThemes.map(th => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => setSelectedTheme(th.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#10B981] bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/10'
                          : 'border-[#E5E7EB] bg-[#F8F8F5] hover:border-neutral-300 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded">
                            {th.tag}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                              isSelected
                                ? 'bg-[#10B981] border-[#10B981] text-white'
                                : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">{th.name}</h4>
                        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{th.desc}</p>
                      </div>

                      <div className={`mt-4 pt-3 border-t border-neutral-100 rounded-lg p-2.5 ${th.bgSample}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-neutral-900/10" />
                          <div className="space-y-1 flex-1">
                            <div className="h-2 w-16 bg-neutral-900/20 rounded" />
                            <div className="h-1.5 w-10 bg-neutral-900/15 rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: FIRST PRODUCT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                  Step 4 of 5
                </span>
                <h2 className="text-xl font-black text-neutral-950 tracking-tight mt-0.5">
                  Add Your First Product (Optional)
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  You can list one product now to test your store, or skip this step and add products from your dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">Product Title</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="e.g. Pure European Flax Linen Resort Shirt"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Price in LKR (Rs.)</label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={e => setProductPrice(e.target.value)}
                      placeholder="4500"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs font-bold text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Initial Stock</label>
                    <input
                      type="number"
                      value={productStock}
                      onChange={e => setProductStock(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Category</label>
                    <select
                      value={productCategory}
                      onChange={e => setProductCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="cat-apparel">Fashion & Apparel</option>
                      <option value="cat-beauty">Beauty & Wellness</option>
                      <option value="cat-living">Living & Decor</option>
                      <option value="cat-gourmet">Artisanal Pantry</option>
                      <option value="cat-audio">Modern Tech & Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">Description</label>
                  <textarea
                    rows={3}
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    placeholder="Brief description of materials, sizes, craftsmanship, or care instructions..."
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F8F5] py-2.5 px-3.5 text-xs text-neutral-900 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & LAUNCH */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#10B981] border border-emerald-200 shadow-sm">
                <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
                  Your Boutique is Ready to Launch!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  You're all set to begin receiving verified WhatsApp orders directly from your customers.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F8F5] p-5 text-xs text-left space-y-3 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">Boutique Name</span>
                  <strong className="text-neutral-900">{shopName}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">Storefront Link</span>
                  <strong className="font-mono text-[#10B981]">kadeo.lk/shop/{cleanSlug}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">WhatsApp Hotline</span>
                  <strong className="font-mono text-neutral-900">+{whatsappNumber || phone}</strong>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                  <span className="text-neutral-500 font-medium">Selected Theme</span>
                  <strong className="capitalize text-neutral-900">{selectedTheme} Theme</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Commission & Plan</span>
                  <span className="text-[#10B981] font-bold">0% Commission • Free Forever</span>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold max-w-md mx-auto">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────────────
              5. CONTROLS & NAVIGATION BUTTONS
          ────────────────────────────────────────────────────────────────────────── */}
          <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:border-neutral-400 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                to="/seller/login"
                className="text-xs font-bold text-neutral-600 hover:text-[#10B981] transition-colors"
              >
                Already have a store? Sign in →
              </Link>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 ml-auto"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? 'Launching Store...' : 'Launch Store & Open Dashboard'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            6. VALUE PROPOSITION FOOTER PILLS
        ────────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-center">
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-1">
            <ShieldCheck className="h-5 w-5 text-[#10B981] mx-auto mb-1.5" />
            <b className="text-xs font-bold text-neutral-900 block">0% Order Commission</b>
            <p className="text-[11px] text-neutral-500">Keep 100% of your earnings on every sale</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-1">
            <MessageCircle className="h-5 w-5 text-[#10B981] mx-auto mb-1.5" />
            <b className="text-xs font-bold text-neutral-900 block">Direct WhatsApp Orders</b>
            <p className="text-[11px] text-neutral-500">1-click order handoff with details pre-filled</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-1">
            <Truck className="h-5 w-5 text-[#10B981] mx-auto mb-1.5" />
            <b className="text-xs font-bold text-neutral-900 block">COD & Islandwide Ready</b>
            <p className="text-[11px] text-neutral-500">Courier integration and bank transfer instructions</p>
          </div>
        </div>
      </div>
    </div>
  );
};
