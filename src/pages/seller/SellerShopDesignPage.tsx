import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { StorefrontThemeId } from '../../types';
import { StorefrontView } from '../../components/storefront/StorefrontView';
import { Palette, Check, Save, Sparkles, ExternalLink, Video, Image as ImageIcon, Upload, FileVideo, Link2, Eye, EyeOff } from 'lucide-react';

export const SellerShopDesignPage: React.FC = () => {
  const { currentShop, refreshShop } = useAuth();
  const { isDark } = useTheme();

  if (!currentShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  const [themeId, setThemeId] = useState<StorefrontThemeId>(currentShop.themeId);
  const [name, setName] = useState(currentShop.name);
  const [slug, setSlug] = useState(currentShop.slug);
  const [description, setDescription] = useState(currentShop.description);
  const [whatsappNumber, setWhatsappNumber] = useState(currentShop.whatsappNumber);
  const [displayPhone, setDisplayPhone] = useState(currentShop.displayPhone);
  const [logo, setLogo] = useState(currentShop.logo);
  const [coverImage, setCoverImage] = useState(currentShop.coverImage);
  const [coverVideo, setCoverVideo] = useState(currentShop.coverVideo || '');
  const [coverMediaType, setCoverMediaType] = useState<'image' | 'video'>(
    currentShop.coverMediaType || (currentShop.coverVideo ? 'video' : 'image')
  );
  const [videoFileName, setVideoFileName] = useState('');
  const [city, setCity] = useState(currentShop.contactDetails.city);
  const [deliveryCoverage, setDeliveryCoverage] = useState(currentShop.contactDetails.deliveryCoverage || '');

  // Hero Section Customizer State (All Texts, Headlines, CTAs, Badges & Images)
  const initialHero = currentShop.heroBanner || {};
  const [welcomeBadge, setWelcomeBadge] = useState(initialHero.welcomeBadge || `Welcome to ${currentShop.name}`);
  const [headlineMain, setHeadlineMain] = useState(initialHero.headlineMain || 'Look Good');
  const [headlineHighlight, setHeadlineHighlight] = useState(initialHero.headlineHighlight || 'Feel Beautiful');
  const [heroDescription, setHeroDescription] = useState(initialHero.description || currentShop.description || '');
  const [primaryCtaText, setPrimaryCtaText] = useState(initialHero.primaryCtaText || 'Shop Collection');
  const [secondaryCtaText, setSecondaryCtaText] = useState(initialHero.secondaryCtaText || 'WhatsApp Concierge');
  const [spotlightImage, setSpotlightImage] = useState(initialHero.spotlightImage || '');
  const [trust1Title, setTrust1Title] = useState(initialHero.trustBadge1?.title || '100% Pure Flax & Organic');
  const [trust1Sub, setTrust1Sub] = useState(initialHero.trustBadge1?.subtitle || 'Certified & Quality Tested');
  const [trust2Title, setTrust2Title] = useState(initialHero.trustBadge2?.title || 'Fast Delivery');
  const [trust2Sub, setTrust2Sub] = useState(initialHero.trustBadge2?.subtitle || 'Island Wide (1-3 Days)');
  const [trust3Title, setTrust3Title] = useState(initialHero.trustBadge3?.title || 'Secure Checkout');
  const [trust3Sub, setTrust3Sub] = useState(initialHero.trustBadge3?.subtitle || 'Cash on Delivery / Bank');

  // Hero Section Element Visibility Toggles (show / hide)
  const [showHeroBanner, setShowHeroBanner] = useState<boolean>(initialHero.showHeroBanner !== false);
  const [showWelcomeBadge, setShowWelcomeBadge] = useState<boolean>(initialHero.showWelcomeBadge !== false);
  const [showHeadline, setShowHeadline] = useState<boolean>(initialHero.showHeadline !== false);
  const [showDescription, setShowDescription] = useState<boolean>(initialHero.showDescription !== false);
  const [showCtaButtons, setShowCtaButtons] = useState<boolean>(initialHero.showCtaButtons !== false);
  const [showSpotlightImage, setShowSpotlightImage] = useState<boolean>(initialHero.showSpotlightImage !== false);
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(initialHero.showTrustBadges !== false);

  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const [products, setProducts] = useState(() => StorageService.getProductsByShop(currentShop.id));
  const [categories, setCategories] = useState(() => StorageService.getCategories());

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(StorageService.getProductsByShop(currentShop.id));
      setCategories(StorageService.getCategories());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, [currentShop.id]);

  // Create preview shop object
  const previewShop = {
    ...currentShop,
    name,
    slug,
    description,
    whatsappNumber,
    displayPhone,
    logo,
    coverImage,
    coverVideo,
    coverMediaType,
    themeId,
    heroBanner: {
      showHeroBanner,
      welcomeBadge,
      showWelcomeBadge,
      headlineMain,
      headlineHighlight,
      showHeadline,
      description: heroDescription,
      showDescription,
      primaryCtaText,
      secondaryCtaText,
      showCtaButtons,
      backgroundImage: coverImage,
      spotlightImage: spotlightImage || products[0]?.images[0] || '',
      showSpotlightImage,
      trustBadge1: { title: trust1Title, subtitle: trust1Sub, icon: 'leaf' as const },
      trustBadge2: { title: trust2Title, subtitle: trust2Sub, icon: 'truck' as const },
      trustBadge3: { title: trust3Title, subtitle: trust3Sub, icon: 'shield' as const },
      showTrustBadges,
    },
    contactDetails: {
      ...currentShop.contactDetails,
      city,
      deliveryCoverage,
    },
  };

  const handleCoverImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        setCoverImage(res);
        setCoverMediaType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSpotlightFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        setSpotlightImage(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    const objectUrl = URL.createObjectURL(file);
    setCoverVideo(objectUrl);
    setCoverMediaType('video');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Shop name cannot be blank.');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = StorageService.getShopBySlug(cleanSlug);
    if (existing && existing.id !== currentShop.id) {
      setError(`The slug "${cleanSlug}" is already in use by another shop.`);
      return;
    }

    StorageService.updateShop(currentShop.id, {
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      themeId,
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
      displayPhone: displayPhone.trim(),
      logo: logo.trim(),
      coverImage: coverImage.trim(),
      coverVideo: coverVideo.trim(),
      coverMediaType,
      heroBanner: {
        showHeroBanner,
        welcomeBadge: welcomeBadge.trim(),
        showWelcomeBadge,
        headlineMain: headlineMain.trim(),
        headlineHighlight: headlineHighlight.trim(),
        showHeadline,
        description: heroDescription.trim(),
        showDescription,
        primaryCtaText: primaryCtaText.trim(),
        secondaryCtaText: secondaryCtaText.trim(),
        showCtaButtons,
        backgroundImage: coverImage.trim(),
        spotlightImage: spotlightImage.trim(),
        showSpotlightImage,
        trustBadge1: { title: trust1Title.trim(), subtitle: trust1Sub.trim(), icon: 'leaf' },
        trustBadge2: { title: trust2Title.trim(), subtitle: trust2Sub.trim(), icon: 'truck' },
        trustBadge3: { title: trust3Title.trim(), subtitle: trust3Sub.trim(), icon: 'shield' },
        showTrustBadges,
      },
      contactDetails: {
        ...currentShop.contactDetails,
        city: city.trim(),
        deliveryCoverage: deliveryCoverage.trim(),
      },
    });

    setIsSaved(true);
    refreshShop();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
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
              Lookbook Atelier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Storefront Design Studio
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Choose your layout theme and customize your boutique branding and ambient cover video.
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer ${
            isDark
              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
              : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
          }`}
        >
          {isSaved ? <Check className="h-4 w-4 stroke-[3]" /> : <Save className="h-4 w-4" />}
          <span>{isSaved ? 'Changes Published!' : 'Publish Updates'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* 1. Theme Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider">
            Curated Storefront Layouts
          </h2>
          <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Active Theme: <strong className={isDark ? 'text-white' : 'text-[#0F0F11]'}>{themeId.toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Theme A: Minimal */}
          <div
            onClick={() => setThemeId('minimal')}
            className={`cursor-pointer rounded-3xl border-2 p-6 transition-all ${
              themeId === 'minimal'
                ? isDark
                  ? 'border-emerald-500 bg-[#161622] ring-2 ring-emerald-500/20 shadow-2xl'
                  : 'border-[#0F0F11] bg-white ring-2 ring-[#0F0F11]/10 shadow-luxury-sm'
                : isDark
                ? 'border-white/10 bg-[#121217]/90 hover:border-white/25'
                : 'border-[#E4E4E7] bg-white hover:border-neutral-400 shadow-luxury-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold">Theme A — Minimal Editorial</span>
              {themeId === 'minimal' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 font-bold">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>

            <div
              className={`h-28 rounded-2xl p-3 flex flex-col justify-between mb-4 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAFAF9] border-[#E4E4E7]'
              }`}
            >
              <div className={`h-3 w-20 rounded ${isDark ? 'bg-white/40' : 'bg-[#0F0F11]'}`} />
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-10 rounded border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-[#E4E4E7]'}`} />
                <div className={`h-10 rounded border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-[#E4E4E7]'}`} />
                <div className={`h-10 rounded border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-[#E4E4E7]'}`} />
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              Spacious grid, refined typography, and high-contrast lookbook presentation. Best for linen, fashion & atelier pieces.
            </p>
          </div>

          {/* Theme B: Beauty */}
          <div
            onClick={() => setThemeId('beauty')}
            className={`cursor-pointer rounded-3xl border-2 p-6 transition-all ${
              themeId === 'beauty'
                ? isDark
                  ? 'border-emerald-500 bg-[#161622] ring-2 ring-emerald-500/20 shadow-2xl'
                  : 'border-[#0F0F11] bg-[#FAF7F0] ring-2 ring-[#0F0F11]/10 shadow-luxury-sm'
                : isDark
                ? 'border-white/10 bg-[#121217]/90 hover:border-white/25'
                : 'border-[#E4E4E7] bg-[#FAF7F0] hover:border-neutral-400 shadow-luxury-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">Theme B — Organic Beauty</span>
              {themeId === 'beauty' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 font-bold">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="h-28 rounded-2xl bg-[#F4EFE6] dark:bg-amber-950/20 border border-[#E5DEC9] dark:border-amber-500/20 p-3 flex flex-col justify-between mb-4">
              <div className="h-3 w-20 bg-amber-950/70 dark:bg-amber-300/70 rounded" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-white/80 dark:bg-amber-900/30 rounded border border-[#E5DEC9] dark:border-amber-500/20" />
                <div className="h-10 bg-white/80 dark:bg-amber-900/30 rounded border border-[#E5DEC9] dark:border-amber-500/20" />
                <div className="h-10 bg-white/80 dark:bg-amber-900/30 rounded border border-[#E5DEC9] dark:border-amber-500/20" />
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              Warm earth tones, serif headings, and gentle organic aesthetics. Perfect for Ceylon tea, spices, and Ayurvedic wellness.
            </p>
          </div>

          {/* Theme C: Modern Store */}
          <div
            onClick={() => setThemeId('modern')}
            className={`cursor-pointer rounded-3xl border-2 p-6 transition-all ${
              themeId === 'modern'
                ? isDark
                  ? 'border-emerald-500 bg-[#161622] ring-2 ring-emerald-500/20 shadow-2xl'
                  : 'border-[#0F0F11] bg-white ring-2 ring-[#0F0F11]/10 shadow-luxury-sm'
                : isDark
                ? 'border-white/10 bg-[#121217]/90 hover:border-white/25'
                : 'border-[#E4E4E7] bg-white hover:border-neutral-400 shadow-luxury-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold">Theme C — Modern Atelier</span>
              {themeId === 'modern' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 font-bold">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="h-28 rounded-2xl bg-neutral-900 p-3 flex flex-col justify-between mb-4 border border-neutral-800">
              <div className="h-3 w-20 bg-white rounded" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-neutral-800 rounded" />
                <div className="h-10 bg-neutral-800 rounded" />
                <div className="h-10 bg-neutral-800 rounded" />
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              High-density grid with dark accents, fast browsing, and modern typography. Designed for jewelry, craft art, and gear.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Shop Details Form */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all ${
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
          Boutique Identity & Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Boutique Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Storefront Web Slug</label>
            <div className="flex items-center">
              <span
                className={`rounded-l-2xl border border-r-0 py-2.5 px-3.5 text-xs font-mono select-none ${
                  isDark ? 'border-white/10 bg-white/5 text-neutral-400' : 'border-[#E4E4E7] bg-neutral-100 text-[#71717A]'
                }`}
              >
                kadeo.lk/shop/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className={`w-full rounded-r-2xl border py-2.5 px-3.5 text-xs font-mono transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">
              WhatsApp Order Receiving Line
            </label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Display Telephone</label>
            <input
              type="text"
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
            <label className="text-xs font-semibold">City / Atelier Base</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Courier / Delivery Coverage</label>
            <input
              type="text"
              value={deliveryCoverage}
              onChange={e => setDeliveryCoverage(e.target.value)}
              placeholder="e.g. Islandwide 2-3 Business Days via PromptX"
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold">Editorial Shop Bio</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold">Brand Emblem / Logo Image URL</label>
            <input
              type="text"
              value={logo}
              onChange={e => setLogo(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Hero Background Media Section */}
          <div
            className={`sm:col-span-2 space-y-3.5 pt-4 border-t ${
              isDark ? 'border-white/10' : 'border-[#F4F4F5]'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider">
                Storefront Cinematic Hero Media
              </label>
              <div
                className={`flex rounded-full border p-1 text-xs ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-[#E4E4E7] bg-neutral-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCoverMediaType('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    coverMediaType === 'video'
                      ? isDark
                        ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                        : 'bg-[#0F0F11] text-white'
                      : isDark
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-[#71717A] hover:text-[#0F0F11]'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Ambient Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMediaType('image')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    coverMediaType === 'image'
                      ? isDark
                        ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                        : 'bg-[#0F0F11] text-white'
                      : isDark
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-[#71717A] hover:text-[#0F0F11]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Cover Photo</span>
                </button>
              </div>
            </div>

            {coverMediaType === 'video' ? (
              <div
                className={`space-y-3 rounded-2xl p-4 border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAFAF9] border-[#E4E4E7]'
                }`}
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Looping MP4 / WebM Video Stream URL
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-3 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={coverVideo}
                      onChange={e => setCoverVideo(e.target.value)}
                      placeholder="https://assets.mixkit.co/.../video.mp4"
                      className={`w-full rounded-2xl border py-2.5 pl-10 pr-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                          : 'bg-white border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Local Video File Upload */}
                <div
                  className={`space-y-2 pt-2 border-t ${
                    isDark ? 'border-white/10' : 'border-[#E4E4E7]'
                  }`}
                >
                  <label className="text-xs font-semibold">Or upload video file from device</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/*"
                      id="seller-design-video-upload"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="seller-design-video-upload"
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                          : 'border-[#E4E4E7] bg-white text-[#0F0F11] hover:bg-[#FAFAF9]'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Select Video File</span>
                    </label>

                    {videoFileName && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 truncate">
                        <FileVideo className="h-4 w-4 shrink-0" />
                        <span className="truncate">{videoFileName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div
                  className={`pt-2 border-t ${
                    isDark ? 'border-white/10' : 'border-[#E4E4E7]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-2 font-mono ${
                      isDark ? 'text-neutral-400' : 'text-[#71717A]'
                    }`}
                  >
                    Atelier Cinematic Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverVideo('https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-green-leaves-40243-large.mp4')}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-white/5 hover:border-emerald-500/50 text-neutral-300'
                          : 'border-[#E4E4E7] bg-white hover:border-[#0F0F11] text-[#0F0F11]'
                      }`}
                    >
                      🌿 Rainforest Mist
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverVideo('https://assets.mixkit.co/videos/preview/mixkit-herbs-and-flowers-in-glass-tubes-43666-large.mp4')}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-white/5 hover:border-emerald-500/50 text-neutral-300'
                          : 'border-[#E4E4E7] bg-white hover:border-[#0F0F11] text-[#0F0F11]'
                      }`}
                    >
                      💧 Herbal Alchemy
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverVideo('https://assets.mixkit.co/videos/preview/mixkit-tea-plantation-field-42798-large.mp4')}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isDark
                          ? 'border-white/10 bg-white/5 hover:border-emerald-500/50 text-neutral-300'
                          : 'border-[#E4E4E7] bg-white hover:border-[#0F0F11] text-[#0F0F11]'
                      }`}
                    >
                      🌱 Highland Hills
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`space-y-3 rounded-2xl p-4 border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAFAF9] border-[#E4E4E7]'
                }`}
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Hero Background Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                      isDark
                        ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                        : 'bg-white border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="seller-design-cover-upload"
                    onChange={handleCoverImageFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="seller-design-cover-upload"
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isDark
                        ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                        : 'border-[#E4E4E7] bg-white text-[#0F0F11] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image from Device</span>
                  </label>

                  <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                    JPG, PNG, WebP supported
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2.5 Hero Section Text & Content Customizer */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider">
                Hero Section Content, Text & Badges
              </h2>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              Customize all headlines, subtext, call-to-action buttons, and trust badges displayed on your hero banner.
            </p>
          </div>
        </div>

        {/* Master Switch: Entire Hero Section */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
            showHeroBanner
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-emerald-50/80 border-emerald-200'
              : isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${showHeroBanner ? 'bg-[#10B981]' : 'bg-neutral-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider block">
                Entire Storefront Hero Section
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {showHeroBanner
                ? 'Hero section banner is currently SHOWN on your boutique.'
                : 'Hero section banner is currently HIDDEN from your boutique (storefront shows products immediately).'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHeroBanner(!showHeroBanner)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              showHeroBanner
                ? isDark
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'bg-[#10B981] text-white shadow-sm'
                : isDark
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                : 'bg-neutral-300 text-neutral-800 border border-neutral-400'
            }`}
          >
            {showHeroBanner ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showHeroBanner ? 'Hero Section: SHOWN' : 'Hero Section: HIDDEN'}</span>
          </button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${!showHeroBanner ? 'opacity-40 pointer-events-none' : ''}`}>
          {/* Welcome Badge Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Welcome Pill Tag</label>
              <button
                type="button"
                onClick={() => setShowWelcomeBadge(!showWelcomeBadge)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showWelcomeBadge
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showWelcomeBadge ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showWelcomeBadge ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
            {!showWelcomeBadge && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Hidden from Storefront</span>
            )}
            <input
              type="text"
              value={welcomeBadge}
              onChange={e => setWelcomeBadge(e.target.value)}
              placeholder="e.g. Welcome to Ceylon Linen Co."
              disabled={!showWelcomeBadge}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showWelcomeBadge ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Primary CTA Button Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Primary CTA Button Label</label>
              <button
                type="button"
                onClick={() => setShowCtaButtons(!showCtaButtons)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showCtaButtons
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showCtaButtons ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showCtaButtons ? 'Buttons Visible' : 'Buttons Hidden'}</span>
              </button>
            </div>
            {!showCtaButtons && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Hidden from Storefront</span>
            )}
            <input
              type="text"
              value={primaryCtaText}
              onChange={e => setPrimaryCtaText(e.target.value)}
              placeholder="e.g. Shop Collection"
              disabled={!showCtaButtons}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showCtaButtons ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Headline Part 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Headline (Main Title)</label>
              <button
                type="button"
                onClick={() => setShowHeadline(!showHeadline)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showHeadline
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showHeadline ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showHeadline ? 'Headline Visible' : 'Headline Hidden'}</span>
              </button>
            </div>
            {!showHeadline && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Hidden from Storefront</span>
            )}
            <input
              type="text"
              value={headlineMain}
              onChange={e => setHeadlineMain(e.target.value)}
              placeholder="e.g. Look Good"
              disabled={!showHeadline}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showHeadline ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Headline Part 2 (Highlight) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Headline (Green Highlight Title)</label>
            <input
              type="text"
              value={headlineHighlight}
              onChange={e => setHeadlineHighlight(e.target.value)}
              placeholder="e.g. Feel Beautiful"
              disabled={!showHeadline}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showHeadline ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Secondary CTA Button Text */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold">Secondary Action Button Label (WhatsApp)</label>
            <input
              type="text"
              value={secondaryCtaText}
              onChange={e => setSecondaryCtaText(e.target.value)}
              placeholder="e.g. WhatsApp Concierge"
              disabled={!showCtaButtons}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showCtaButtons ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Description Text */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Hero Description / Tagline Paragraph</label>
              <button
                type="button"
                onClick={() => setShowDescription(!showDescription)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showDescription
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showDescription ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showDescription ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
            {!showDescription && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Hidden from Storefront</span>
            )}
            <textarea
              rows={3}
              value={heroDescription}
              onChange={e => setHeroDescription(e.target.value)}
              placeholder="Editorial description of your signature collection and materials..."
              disabled={!showDescription}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showDescription ? 'opacity-40' : ''} ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
          </div>

          {/* Center Spotlight Image */}
          <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-neutral-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Hero Center Spotlight Image URL</label>
              <button
                type="button"
                onClick={() => setShowSpotlightImage(!showSpotlightImage)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showSpotlightImage
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showSpotlightImage ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showSpotlightImage ? 'Spotlight Visible' : 'Spotlight Hidden'}</span>
              </button>
            </div>
            {!showSpotlightImage && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Hidden from Storefront</span>
            )}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={spotlightImage}
                onChange={e => setSpotlightImage(e.target.value)}
                placeholder="https://... or leave blank to use top product image"
                disabled={!showSpotlightImage}
                className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${!showSpotlightImage ? 'opacity-40' : ''} ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                }`}
              />
              <input
                type="file"
                accept="image/*"
                id="seller-design-spotlight-upload"
                onChange={handleSpotlightFileChange}
                disabled={!showSpotlightImage}
                className="hidden"
              />
              <label
                htmlFor="seller-design-spotlight-upload"
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${!showSpotlightImage ? 'opacity-40 pointer-events-none' : ''} ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                    : 'border-[#E4E4E7] bg-white text-[#0F0F11] hover:bg-[#FAFAF9]'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
              </label>
            </div>
          </div>

          {/* 3 Trust Badges Inputs */}
          <div className="sm:col-span-2 pt-4 border-t border-neutral-100 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider block">
                Floating Trust Badges
              </span>
              <button
                type="button"
                onClick={() => setShowTrustBadges(!showTrustBadges)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  showTrustBadges
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                }`}
              >
                {showTrustBadges ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span>{showTrustBadges ? 'Badges Visible' : 'Badges Hidden'}</span>
              </button>
            </div>
            {!showTrustBadges && (
              <span className="text-[10px] text-amber-400 font-bold block">🙈 Badges Hidden from Storefront</span>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${!showTrustBadges ? 'opacity-40' : ''}`}>
              {/* Trust Badge 1 */}
              <div className="space-y-2 p-3.5 rounded-2xl border bg-neutral-50/50 dark:bg-white/5 border-neutral-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-[#10B981] block">Badge 1 (Quality)</span>
                <input
                  type="text"
                  value={trust1Title}
                  onChange={e => setTrust1Title(e.target.value)}
                  placeholder="Title (e.g. 100% Pure Flax)"
                  disabled={!showTrustBadges}
                  className="w-full text-xs font-bold p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
                <input
                  type="text"
                  value={trust1Sub}
                  onChange={e => setTrust1Sub(e.target.value)}
                  placeholder="Subtitle (e.g. Certified Organic)"
                  disabled={!showTrustBadges}
                  className="w-full text-[11px] p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
              </div>

              {/* Trust Badge 2 */}
              <div className="space-y-2 p-3.5 rounded-2xl border bg-neutral-50/50 dark:bg-white/5 border-neutral-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-[#10B981] block">Badge 2 (Delivery)</span>
                <input
                  type="text"
                  value={trust2Title}
                  onChange={e => setTrust2Title(e.target.value)}
                  placeholder="Title (e.g. Fast Delivery)"
                  disabled={!showTrustBadges}
                  className="w-full text-xs font-bold p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
                <input
                  type="text"
                  value={trust2Sub}
                  onChange={e => setTrust2Sub(e.target.value)}
                  placeholder="Subtitle (e.g. Island Wide 1-3 Days)"
                  disabled={!showTrustBadges}
                  className="w-full text-[11px] p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
              </div>

              {/* Trust Badge 3 */}
              <div className="space-y-2 p-3.5 rounded-2xl border bg-neutral-50/50 dark:bg-white/5 border-neutral-200 dark:border-white/10">
                <span className="text-[11px] font-bold text-[#10B981] block">Badge 3 (Payment)</span>
                <input
                  type="text"
                  value={trust3Title}
                  onChange={e => setTrust3Title(e.target.value)}
                  placeholder="Title (e.g. Secure Checkout)"
                  disabled={!showTrustBadges}
                  className="w-full text-xs font-bold p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
                <input
                  type="text"
                  value={trust3Sub}
                  onChange={e => setTrust3Sub(e.target.value)}
                  placeholder="Subtitle (e.g. Cash on Delivery)"
                  disabled={!showTrustBadges}
                  className="w-full text-[11px] p-2 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Interactive Storefront Preview */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              Live Storefront Preview
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
              Real-time rendering of your shop with selected theme ({themeId.toUpperCase()})
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer ${
              isDark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
            }`}
          >
            {isSaved ? 'Saved!' : 'Save & Publish'}
          </button>
        </div>

        <div
          className={`rounded-3xl border overflow-hidden shadow-2xl ${
            isDark ? 'border-white/15 bg-[#0F0F12]' : 'border-[#E4E4E7] bg-white'
          }`}
        >
          <div
            className={`px-6 py-3 flex items-center justify-between text-xs font-mono border-b ${
              isDark ? 'bg-white/5 border-white/10 text-neutral-400' : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#71717A]'
            }`}
          >
            <span>kadeo.lk/shop/{previewShop.slug}</span>
            <span className="text-[11px] uppercase tracking-wider">Interactive Preview Viewport</span>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            <StorefrontView
              shop={previewShop}
              products={products}
              categories={categories}
              isDemoPreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
