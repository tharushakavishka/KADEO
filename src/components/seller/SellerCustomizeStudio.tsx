import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  FileText,
  Sparkles,
  Undo2,
  Redo2,
  Layers,
  Palette,
  Droplet,
  Type,
  ImageIcon,
  Settings,
  ExternalLink,
  Lock,
  RefreshCw,
  Check,
  CheckCircle2,
  X,
  Sliders,
  Sparkle,
  ShoppingBag,
  Grid,
  ShieldCheck,
  Phone,
  Mail,
  DollarSign,
  Truck,
  Search,
} from 'lucide-react';
import {
  KaveeStoreService,
  KaveeStorefrontConfig,
  THEME_PRESETS,
  StorefrontThemeType,
} from '../../services/kaveeStoreService';
import { KaveeStorefront } from '../storefront/KaveeStorefront';

export const SellerCustomizeStudio: React.FC = () => {
  // Live reactive storefront config
  const [config, setConfig] = useState<KaveeStorefrontConfig>(() => {
    return KaveeStoreService.getConfig();
  });

  // Undo/Redo history stack
  const [history, setHistory] = useState<KaveeStorefrontConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Viewport mode
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Active Tool & Section selection
  const [activeTool, setActiveTool] = useState<string>('theme');
  const [activeSection, setActiveSection] = useState<string>('theme');
  const [themeFilter, setThemeFilter] = useState<'all' | 'fashion' | 'tech' | 'artisan' | 'food'>('all');

  // Right Drawer Tab & State
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Deep-linking via URL hash (e.g. #categories, #header)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (['categories', 'header', 'hero', 'announcement', 'products', 'promoBanners', 'whyShop', 'footer'].includes(hash)) {
          setActiveSection(hash);
          setActiveTool(hash);
          setDrawerOpen(true);
        } else if (['theme', 'colors', 'typography', 'animations'].includes(hash)) {
          setActiveSection(hash);
          setActiveTool(hash);
          setDrawerOpen(true);
        } else if (hash === 'settings') {
          setActiveSection('storeSettings');
          setActiveTool('settings');
          setDrawerOpen(true);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State update helper with history recording
  const updateConfig = (updater: (prev: KaveeStorefrontConfig) => KaveeStorefrontConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(next);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setIsSaved(false);
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setConfig(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setConfig(history[nextIndex]);
    }
  };

  const handlePublish = () => {
    KaveeStoreService.saveConfig(config);
    setIsSaved(true);
    showToast('Storefront published successfully! Live at /shop/kavee-3');
  };

  const handleSaveDraft = () => {
    KaveeStoreService.saveConfig(config);
    setIsSaved(true);
    showToast('Draft changes saved successfully!');
  };

  const handleReset = () => {
    const fresh = KaveeStoreService.resetConfig();
    setConfig(fresh);
    showToast('Reset to default storefront configuration');
  };

  const handleSelectTheme = (themeId: StorefrontThemeType) => {
    const updated = KaveeStoreService.applyPreset(themeId, config);
    setConfig(updated);
    setHistory(prev => [...prev, updated]);
    setHistoryIndex(prev => prev + 1);
    setIsSaved(false);
    showToast(`Applied "${THEME_PRESETS[themeId].name}" Theme & Design`);
  };

  const toggleSection = (sectionKey: keyof KaveeStorefrontConfig['sectionsVisibility'], e: React.MouseEvent) => {
    e.stopPropagation();
    updateConfig(prev => ({
      ...prev,
      sectionsVisibility: {
        ...prev.sectionsVisibility,
        [sectionKey]: !prev.sectionsVisibility[sectionKey],
      },
    }));
  };

  const themeList = Object.values(THEME_PRESETS);

  const filteredThemes = themeList.filter(t => {
    if (themeFilter === 'all') return true;
    if (themeFilter === 'fashion') return ['linen', 'streetwear', 'beauty', 'surf'].includes(t.id);
    if (themeFilter === 'tech') return ['tech', 'cyber'].includes(t.id);
    if (themeFilter === 'artisan') return ['jewelry', 'pottery', 'classic', 'minimal'].includes(t.id);
    if (themeFilter === 'food') return ['spices', 'organic', 'kadeo'].includes(t.id);
    return true;
  });

  const colorPresets = [
    { label: 'Emerald Green', value: '#00A86B' },
    { label: 'Warm Sand Linen', value: '#8C7355' },
    { label: 'Electric Blue', value: '#0284C7' },
    { label: 'Velvet Rose', value: '#E11D48' },
    { label: 'Blaze Orange', value: '#EA580C' },
    { label: 'Forest Green', value: '#15803D' },
    { label: 'Pitch Black', value: '#18181B' },
    { label: 'Heritage Amber', value: '#B45309' },
    { label: 'Ceylon Spices', value: '#047857' },
    { label: 'Royal Sapphire', value: '#2563EB' },
    { label: 'Terracotta Clay', value: '#C2410C' },
    { label: 'Neon Cyber Violet', value: '#A855F7' },
    { label: 'Tropical Ocean Teal', value: '#0D9488' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8FAFC] text-neutral-900 font-sans overflow-hidden">
      {/* 1. TOP STUDIO NAVIGATION BAR */}
      <header className="h-16 bg-[#0B132B] text-white px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 border-b border-slate-800">
        {/* Left: Brand + Breadcrumb + Status */}
        <div className="flex items-center gap-3">
          <Link to="/seller/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-[#00A86B] flex items-center justify-center font-black text-white text-base shadow-sm">
              K
            </div>
            <span className="text-sm font-extrabold tracking-wider text-white">KADEO</span>
          </Link>

          <span className="h-4 w-px bg-slate-700/80 mx-1" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Storefront Editor</span>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-white">kavee-3</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
            <span>{isSaved ? 'All changes saved' : 'Unsaved changes'}</span>
          </div>
        </div>

        {/* Center: History & Viewport Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                historyIndex > 0 ? 'hover:text-white hover:bg-slate-800' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                historyIndex < history.length - 1 ? 'hover:text-white hover:bg-slate-800' : 'opacity-30 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Viewport Switcher Pills */}
          <div className="flex items-center bg-[#1E293B]/80 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewport === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewport === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewport === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/shop/kavee-3"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview Store</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs text-white shadow-md transition-all active:scale-95 cursor-pointer hover:opacity-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANE WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR: Design Tools + Page Structure */}
        <aside className="w-64 bg-white border-r border-neutral-200/90 flex flex-col justify-between shrink-0 z-10 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Design Tools Group */}
            <div>
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2">
                Design Tools
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('theme');
                    setActiveSection('theme');
                    setDrawerOpen(true);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSection === 'theme'
                      ? 'bg-[#ECFDF5] text-emerald-800'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 stroke-[2]" />
                    <span>Themes & Niches</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {themeList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('colors');
                    setActiveSection('colors');
                    setDrawerOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSection === 'colors'
                      ? 'bg-[#ECFDF5] text-emerald-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Droplet className="h-4 w-4 stroke-[1.8]" />
                  <span>Colors & Accents</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('typography');
                    setActiveSection('typography');
                    setDrawerOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSection === 'typography'
                      ? 'bg-[#ECFDF5] text-emerald-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Type className="h-4 w-4 stroke-[1.8]" />
                  <span>Typography</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('animations');
                    setActiveSection('animations');
                    setDrawerOpen(true);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSection === 'animations'
                      ? 'bg-[#ECFDF5] text-emerald-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 stroke-[2]" />
                    <span>Animations & Effects</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    NEW
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('settings');
                    setActiveSection('storeSettings');
                    setDrawerOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSection === 'storeSettings'
                      ? 'bg-[#ECFDF5] text-emerald-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Settings className="h-4 w-4 stroke-[1.8]" />
                  <span>Store Settings</span>
                </button>
              </div>
            </div>

            {/* Page Structure Group */}
            <div className="pt-2 border-t border-neutral-100">
              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2">
                Page Structure
              </h3>
              <div className="space-y-1">
                {[
                  { key: 'hero', label: 'Hero Banner', toolKey: 'hero' },
                  { key: 'announcement', label: 'Announcement Bar', toolKey: 'announcement' },
                  { key: 'header', label: 'Header / Navigation', toolKey: 'header' },
                  { key: 'categories', label: 'Categories Grid', toolKey: 'categories' },
                  { key: 'products', label: 'Products Collection', toolKey: 'products' },
                  { key: 'promoBanners', label: 'Dual Promo Banners', toolKey: 'promoBanners' },
                  { key: 'whyShop', label: 'Why Shop With Us', toolKey: 'whyShop' },
                  { key: 'footer', label: 'Footer Section', toolKey: 'footer' },
                ].map(item => {
                  const isActive = activeSection === item.key;
                  const isVisible = config.sectionsVisibility[item.key as keyof KaveeStorefrontConfig['sectionsVisibility']];

                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        setActiveSection(item.key);
                        setActiveTool(item.toolKey);
                        setDrawerOpen(true);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#ECFDF5] text-emerald-900 font-bold border-l-3'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                      style={{ borderLeftColor: isActive ? (config.theme.primaryColor || '#00A86B') : 'transparent' }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={e => toggleSection(item.key as any, e)}
                        className={`p-1 rounded-md transition-colors ${
                          isActive ? 'text-emerald-700 hover:bg-emerald-100' : 'text-neutral-400 hover:text-neutral-700'
                        }`}
                        title={isVisible ? 'Hide Section' : 'Show Section'}
                      >
                        <Eye className={`h-3.5 w-3.5 ${isVisible ? '' : 'opacity-30 line-through'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Store Profile Card */}
          <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-8 w-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
              >
                K
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">kavee-3</p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {THEME_PRESETS[config.theme.themeId]?.name || 'Custom Theme'}
                </p>
              </div>
            </div>
            <Link
              to="/shop/kavee-3"
              target="_blank"
              title="Open Live Shop"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        {/* CENTER PREVIEW CANVAS (Dedicated scrollable live storefront) */}
        <main className="flex-1 bg-[#F1F5F9] overflow-y-auto flex flex-col p-3 sm:p-5 lg:p-6 min-h-0">
          {/* Top Address & Simulation Bar (Sticky) */}
          <div className="sticky top-0 z-20 max-w-5xl mx-auto w-full mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F1F5F9]/90 backdrop-blur-md py-1">
            {/* Address bar input */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200/90 shadow-2xs text-xs text-neutral-600 flex-1 max-w-sm">
              <Lock className="h-3 w-3 text-neutral-400" />
              <span className="truncate font-mono text-[11px]">https://kadeo.lk/shop/kavee-3</span>
              <button
                type="button"
                onClick={handleReset}
                title="Reset to default"
                className="p-0.5 text-neutral-400 hover:text-neutral-700 ml-auto cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            {/* Currently Active Section/Theme indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <span>Section:</span>
              <span className="text-neutral-900 font-bold capitalize">
                {activeSection.replace(/([A-Z])/g, ' $1')}
              </span>
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
              />
            </div>

            {/* Live Preview Button */}
            <Link
              to="/shop/kavee-3"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-bold shadow-2xs transition-colors"
              style={{ color: config.theme.primaryColor || '#00A86B' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
              />
              <span>Live Preview</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          {/* Canvas Storefront Frame with dedicated scrollable viewport */}
          <div className="flex-1 flex justify-center w-full min-h-0">
            <div
              className={`bg-white rounded-2xl shadow-xl border border-neutral-200/80 transition-all duration-300 flex flex-col h-[calc(100vh-140px)] ${
                viewport === 'desktop'
                  ? 'w-full max-w-5xl'
                  : viewport === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {/* Scrollable Viewport Container */}
              <div className="flex-1 overflow-y-auto overscroll-contain rounded-2xl">
                <KaveeStorefront config={config} viewport={viewport} />
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT DRAWER: Dynamic Live Editor & Multi-Theme Selector */}
        {drawerOpen && (
          <aside className="w-88 lg:w-96 bg-white border-l border-neutral-200/90 flex flex-col justify-between shrink-0 z-20 overflow-y-auto">
            <div className="p-5 space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center"
                    style={{ color: config.theme.primaryColor || '#00A86B' }}
                  >
                    <Sliders className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-950 leading-tight capitalize">
                      {activeSection === 'theme' ? 'Storefront Themes' : `${activeSection.replace(/([A-Z])/g, ' $1')} Settings`}
                    </h3>
                    <p className="text-[11px] text-neutral-400">Instant real-time transformation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* DYNAMIC FORM BASED ON ACTIVE SECTION */}

              {/* 1. THEMES & NICHES SELECTOR */}
              {activeSection === 'theme' && (
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                    <p className="font-bold text-neutral-900 mb-0.5">Select a Niched E-Commerce Theme</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Click any theme below to instantly transform your storefront design, typography, colors, and layout.
                    </p>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {[
                      { id: 'all', label: `All (${themeList.length})` },
                      { id: 'fashion', label: 'Fashion & Luxury' },
                      { id: 'tech', label: 'Tech & Gaming' },
                      { id: 'artisan', label: 'Artisan & Craft' },
                      { id: 'food', label: 'Pantry & Living' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setThemeFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                          themeFilter === f.id
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredThemes.map(t => {
                      const isSelected = config.theme.themeId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTheme(t.id)}
                          className={`rounded-2xl border bg-white p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-2 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                          }`}
                          style={{ borderColor: isSelected ? (config.theme.primaryColor || '#00A86B') : undefined }}
                        >
                          <div>
                            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 mb-2">
                              <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white uppercase">
                                {t.category.split('&')[0]}
                              </div>
                              {isSelected && (
                                <div
                                  className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full text-white flex items-center justify-center shadow-xs"
                                  style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-neutral-950 leading-tight">{t.name}</h4>
                            <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{t.subtitle}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                            <div className="flex items-center gap-1">
                              {t.colors.map((c, i) => (
                                <span
                                  key={i}
                                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: t.primaryColor }}>
                              {isSelected ? 'Active' : 'Apply →'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. HERO BANNER EDITOR */}
              {activeSection === 'hero' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={config.hero.badgeText}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, badgeText: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Headline Line 1</label>
                    <input
                      type="text"
                      value={config.hero.headlineLine1}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, headlineLine1: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Headline Line 2</label>
                    <input
                      type="text"
                      value={config.hero.headlineLine2}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, headlineLine2: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Headline Accent (Colored)</label>
                    <input
                      type="text"
                      value={config.hero.headlineLine3}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, headlineLine3: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Subtitle Description</label>
                    <textarea
                      rows={3}
                      value={config.hero.subtitle}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Button CTA Text</label>
                      <input
                        type="text"
                        value={config.hero.ctaText}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            hero: { ...prev.hero, ctaText: e.target.value },
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Floating Badge</label>
                      <input
                        type="text"
                        value={config.hero.floatingBadge}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            hero: { ...prev.hero, floatingBadge: e.target.value },
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ANNOUNCEMENT BAR EDITOR */}
              {activeSection === 'announcement' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-neutral-900">Enable Announcement Bar</span>
                    <input
                      type="checkbox"
                      checked={config.announcementBar.enabled}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, enabled: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Announcement Message</label>
                    <textarea
                      rows={2}
                      value={config.announcementBar.text}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, text: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Link CTA Text</label>
                    <input
                      type="text"
                      value={config.announcementBar.linkText}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, linkText: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Bar Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.announcementBar.bgColor || '#00A86B'}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            announcementBar: { ...prev.announcementBar, bgColor: e.target.value },
                          }))
                        }
                        className="h-8 w-12 rounded cursor-pointer border border-neutral-300 p-0.5"
                      />
                      <span className="font-mono text-xs text-neutral-600">
                        {config.announcementBar.bgColor || '#00A86B'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. HEADER / NAVIGATION EDITOR */}
              {activeSection === 'header' && (
                <div className="space-y-5 text-xs text-neutral-700">
                  {/* Brand & Identity */}
                  <div className="space-y-3">
                    <label className="block font-bold text-neutral-900">Brand Identity</label>
                    <div>
                      <span className="block text-[11px] text-neutral-500 mb-1">Store / Brand Name</span>
                      <input
                        type="text"
                        value={config.header.storeName}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            header: { ...prev.header, storeName: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-bold"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] text-neutral-500 mb-1">Store Tagline</span>
                      <input
                        type="text"
                        value={config.header.tagline}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            header: { ...prev.header, tagline: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                      />
                    </div>
                  </div>

                  {/* Navigation Bar Style with Visual Previews */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-neutral-900">Navigation Bar Style</label>
                      <span className="text-[10px] text-neutral-400">Visual Layout</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'solid',
                          label: 'Solid Bar',
                          desc: 'Full-width anchored',
                          preview: (
                            <div className="w-full h-11 rounded-lg bg-neutral-100 p-1 flex flex-col justify-start mb-2 overflow-hidden border border-neutral-200">
                              <div className="w-full h-5 bg-white rounded-t-xs border-b border-neutral-200 flex items-center justify-between px-1.5 shadow-2xs">
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-3 rounded-xs bg-emerald-500" />
                                  <div className="h-1 w-2 rounded-xs bg-neutral-300" />
                                </div>
                                <div className="h-1.5 w-6 rounded-full bg-neutral-100 border border-neutral-200" />
                                <div className="flex items-center gap-0.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                </div>
                              </div>
                              <div className="flex-1 bg-neutral-50/60" />
                            </div>
                          ),
                        },
                        {
                          id: 'floating',
                          label: 'Floating Glass',
                          desc: 'Island container',
                          preview: (
                            <div className="w-full h-11 rounded-lg bg-neutral-100 p-1 flex flex-col justify-start mb-2 overflow-hidden border border-neutral-200">
                              <div className="w-full pt-0.5 px-0.5">
                                <div className="w-full h-4.5 bg-white/95 backdrop-blur-xs rounded-full border border-neutral-200 shadow-xs flex items-center justify-between px-1.5">
                                  <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-2.5 rounded-xs bg-emerald-500" />
                                    <div className="h-1 w-1.5 rounded-xs bg-neutral-300" />
                                  </div>
                                  <div className="h-1.5 w-5 rounded-full bg-neutral-100 border border-neutral-200" />
                                  <div className="flex items-center gap-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1" />
                            </div>
                          ),
                        },
                        {
                          id: 'transparent',
                          label: 'Transparent',
                          desc: 'Airy seamless look',
                          preview: (
                            <div className="w-full h-11 rounded-lg bg-gradient-to-br from-emerald-100/80 via-amber-50 to-neutral-200 p-1 flex flex-col justify-start mb-2 overflow-hidden border border-neutral-200">
                              <div className="w-full h-5 bg-white/60 backdrop-blur-xs border-b border-white/60 flex items-center justify-between px-1.5">
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-3 rounded-xs bg-emerald-600" />
                                  <div className="h-1 w-2 rounded-xs bg-neutral-700" />
                                </div>
                                <div className="h-1.5 w-6 rounded-full bg-white/70 border border-white/80" />
                                <div className="flex items-center gap-0.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                                </div>
                              </div>
                            </div>
                          ),
                        },
                      ].map(item => {
                        const isSelected = (config.header.navStyle || 'solid') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                header: { ...prev.header, navStyle: item.id as any },
                              }))
                            }
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            {item.preview}
                            <p className="font-bold text-neutral-900 text-[11px] leading-tight flex items-center justify-between">
                              <span>{item.label}</span>
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                            </p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Header Height with Visual Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-neutral-900">Header Height</label>
                      <span className="text-[10px] text-neutral-400">Vertical Scale</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'spacious',
                          label: 'Spacious Flagship (80px)',
                          desc: 'Generous luxury breathing room',
                          preview: (
                            <div className="w-full h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex flex-col justify-center px-2 mb-1.5">
                              <div className="w-full h-8 bg-white rounded-md border border-neutral-200 shadow-2xs flex items-center justify-between px-2">
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-3.5 rounded-xs bg-emerald-500" />
                                  <div className="h-1 w-2 rounded-xs bg-neutral-300" />
                                </div>
                                <div className="h-2.5 w-12 rounded-full bg-neutral-100 border border-neutral-200" />
                                <div className="h-2 w-2 rounded-full bg-neutral-300" />
                              </div>
                            </div>
                          ),
                        },
                        {
                          id: 'compact',
                          label: 'Compact Modern (64px)',
                          desc: 'Sleek, slim space-saving bar',
                          preview: (
                            <div className="w-full h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex flex-col justify-center px-2 mb-1.5">
                              <div className="w-full h-5 bg-white rounded-md border border-neutral-200 shadow-2xs flex items-center justify-between px-2">
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-3 rounded-xs bg-emerald-500" />
                                  <div className="h-1 w-2 rounded-xs bg-neutral-300" />
                                </div>
                                <div className="h-1.5 w-10 rounded-full bg-neutral-100 border border-neutral-200" />
                                <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                              </div>
                            </div>
                          ),
                        },
                      ].map(item => {
                        const isSelected = (config.header.navHeight || 'spacious') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                header: { ...prev.header, navHeight: item.id as any },
                              }))
                            }
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            {item.preview}
                            <p className="font-bold text-neutral-900 text-[11px] leading-tight flex items-center justify-between">
                              <span>{item.label}</span>
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                            </p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Links Alignment with Visual Mini-Nav Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-neutral-900">Menu Links Alignment</label>
                      <span className="text-[10px] text-neutral-400">Positioning</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'left',
                          label: 'Left Aligned',
                          desc: 'Beside store logo',
                          preview: (
                            <div className="w-full h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between px-1.5 mb-1.5">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-3 rounded-xs bg-emerald-500" />
                                <div className="flex items-center gap-0.5">
                                  <div className="h-1 w-2 rounded-full bg-emerald-600" />
                                  <div className="h-1 w-2 rounded-full bg-neutral-400" />
                                  <div className="h-1 w-2 rounded-full bg-neutral-400" />
                                </div>
                              </div>
                              <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                            </div>
                          ),
                        },
                        {
                          id: 'center',
                          label: 'Center Aligned',
                          desc: 'Symmetric & balanced',
                          preview: (
                            <div className="w-full h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between px-1.5 mb-1.5">
                              <div className="h-2 w-3 rounded-xs bg-emerald-500" />
                              <div className="flex items-center gap-0.5">
                                <div className="h-1 w-2 rounded-full bg-emerald-600" />
                                <div className="h-1 w-2 rounded-full bg-neutral-400" />
                                <div className="h-1 w-2 rounded-full bg-neutral-400" />
                              </div>
                              <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                            </div>
                          ),
                        },
                        {
                          id: 'right',
                          label: 'Right Aligned',
                          desc: 'Beside icons/cart',
                          preview: (
                            <div className="w-full h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between px-1.5 mb-1.5">
                              <div className="h-2 w-3 rounded-xs bg-emerald-500" />
                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-0.5">
                                  <div className="h-1 w-2 rounded-full bg-emerald-600" />
                                  <div className="h-1 w-2 rounded-full bg-neutral-400" />
                                  <div className="h-1 w-2 rounded-full bg-neutral-400" />
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                              </div>
                            </div>
                          ),
                        },
                      ].map(item => {
                        const isSelected = (config.header.linksAlignment || 'left') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                header: { ...prev.header, linksAlignment: item.id as any },
                              }))
                            }
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            {item.preview}
                            <p className="font-bold text-neutral-900 text-[11px] leading-tight flex items-center justify-between">
                              <span>{item.label}</span>
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                            </p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sticky Navbar Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div>
                      <p className="font-bold text-neutral-900">Sticky Header</p>
                      <p className="text-[10px] text-neutral-500">Keep navigation bar visible while scrolling</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.header.sticky !== false}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          header: { ...prev.header, sticky: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* SEARCH BAR SECTION */}
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">Search Bar</p>
                        <p className="text-[10px] text-neutral-500">Product discovery in navigation header</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.header.showSearch !== false}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            header: { ...prev.header, showSearch: e.target.checked },
                          }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                      />
                    </div>

                    {config.header.showSearch !== false && (
                      <div className="space-y-3 pl-2 border-l-2 border-neutral-200">
                        {/* Search Bar Shape with Live Previews */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="block text-[11px] font-bold text-neutral-700">Search Bar Shape</span>
                            <span className="text-[10px] text-neutral-400">Corner Radius</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                id: 'pill',
                                label: 'Rounded Pill',
                                desc: 'Full stadium curve',
                                preview: (
                                  <div className="w-full h-7 rounded-full border border-neutral-300 bg-white flex items-center px-2 gap-1.5 shadow-2xs mb-1.5">
                                    <Search className="h-2.5 w-2.5 text-neutral-400 shrink-0" />
                                    <div className="h-1 w-6 rounded-full bg-neutral-200" />
                                  </div>
                                ),
                              },
                              {
                                id: 'rounded',
                                label: 'Rounded-XL',
                                desc: 'Modern soft corner',
                                preview: (
                                  <div className="w-full h-7 rounded-lg border border-neutral-300 bg-white flex items-center px-2 gap-1.5 shadow-2xs mb-1.5">
                                    <Search className="h-2.5 w-2.5 text-neutral-400 shrink-0" />
                                    <div className="h-1 w-6 rounded-full bg-neutral-200" />
                                  </div>
                                ),
                              },
                              {
                                id: 'square',
                                label: 'Sharp Square',
                                desc: 'Architectural 90°',
                                preview: (
                                  <div className="w-full h-7 rounded-none border border-neutral-300 bg-white flex items-center px-2 gap-1.5 shadow-2xs mb-1.5">
                                    <Search className="h-2.5 w-2.5 text-neutral-400 shrink-0" />
                                    <div className="h-1 w-6 rounded-full bg-neutral-200" />
                                  </div>
                                ),
                              },
                            ].map(item => {
                              const isSelected = (config.header.searchStyle || 'pill') === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() =>
                                    updateConfig(prev => ({
                                      ...prev,
                                      header: { ...prev.header, searchStyle: item.id as any },
                                    }))
                                  }
                                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                                  }`}
                                >
                                  {item.preview}
                                  <p className="font-bold text-neutral-900 text-[11px] leading-tight flex items-center justify-between">
                                    <span>{item.label}</span>
                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                                  </p>
                                  <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Search Bar Variant with Live Fill/Outline Previews */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="block text-[11px] font-bold text-neutral-700">Search Bar Variant</span>
                            <span className="text-[10px] text-neutral-400">Fill & Outline</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                id: 'filled',
                                label: 'Soft Filled',
                                desc: 'Subtle gray background',
                                preview: (
                                  <div className="w-full h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center px-2.5 gap-2 mb-1.5">
                                    <Search className="h-3 w-3 text-neutral-400" />
                                    <span className="text-[9px] text-neutral-400 font-medium">Search...</span>
                                  </div>
                                ),
                              },
                              {
                                id: 'outline',
                                label: 'Crisp Outline',
                                desc: 'Clean white bordered frame',
                                preview: (
                                  <div className="w-full h-8 rounded-xl bg-white border-2 border-neutral-300 shadow-2xs flex items-center px-2.5 gap-2 mb-1.5">
                                    <Search className="h-3 w-3 text-neutral-600" />
                                    <span className="text-[9px] text-neutral-600 font-semibold">Search...</span>
                                  </div>
                                ),
                              },
                            ].map(item => {
                              const isSelected = (config.header.searchVariant || 'filled') === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() =>
                                    updateConfig(prev => ({
                                      ...prev,
                                      header: { ...prev.header, searchVariant: item.id as any },
                                    }))
                                  }
                                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                                  }`}
                                >
                                  {item.preview}
                                  <p className="font-bold text-neutral-900 text-[11px] leading-tight flex items-center justify-between">
                                    <span>{item.label}</span>
                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                                  </p>
                                  <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Search Placeholder */}
                        <div>
                          <span className="block text-[11px] text-neutral-500 mb-1">Search Placeholder Text</span>
                          <input
                            type="text"
                            value={config.header.searchPlaceholder || ''}
                            placeholder="Search 10,000+ products, artisan goods, brands..."
                            onChange={e =>
                              updateConfig(prev => ({
                                ...prev,
                                header: { ...prev.header, searchPlaceholder: e.target.value },
                              }))
                            }
                            className="w-full p-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 bg-neutral-50/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wishlist Button Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div>
                      <p className="font-bold text-neutral-900">Show Wishlist Button</p>
                      <p className="text-[10px] text-neutral-500">Heart icon for customer saved items</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.header.showWishlist !== false}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          header: { ...prev.header, showWishlist: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 5. CATEGORIES GRID EDITOR */}
              {activeSection === 'categories' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={config.categories?.title || 'Shop by Category'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          categories: { ...prev.categories, title: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-bold bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={config.categories?.subtitle || 'Explore handpicked collections curated for you.'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          categories: { ...prev.categories, subtitle: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Action Link Text</label>
                    <input
                      type="text"
                      value={config.categories?.viewAllText || 'View All'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          categories: { ...prev.categories, viewAllText: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>
                </div>
              )}

              {/* 6. PRODUCTS COLLECTION EDITOR */}
              {activeSection === 'products' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Collection Title</label>
                    <input
                      type="text"
                      value={config.products?.title || 'Featured Collection'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          products: { ...prev.products, title: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-bold bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Collection Subtitle</label>
                    <input
                      type="text"
                      value={config.products?.subtitle || 'Handcrafted & top-rated items from verified sellers'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          products: { ...prev.products, subtitle: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Button / Link Text</label>
                    <input
                      type="text"
                      value={config.products?.viewAllText || 'View All Products'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          products: { ...prev.products, viewAllText: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>
                </div>
              )}

              {/* 7. PROMO BANNERS EDITOR */}
              {activeSection === 'promoBanners' && (
                <div className="space-y-5 text-xs text-neutral-700">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <p className="font-bold text-emerald-900">Left Mint Banner</p>
                    <input
                      type="text"
                      value={config.promoBanner1.tag}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner1: { ...prev.promoBanner1, tag: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-neutral-200 text-xs bg-white"
                      placeholder="Tag"
                    />
                    <textarea
                      rows={2}
                      value={config.promoBanner1.title}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner1: { ...prev.promoBanner1, title: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-neutral-200 text-xs bg-white"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={config.promoBanner1.ctaText}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner1: { ...prev.promoBanner1, ctaText: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-neutral-200 text-xs bg-white font-semibold"
                      placeholder="Button Text"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2">
                    <p className="font-bold text-slate-100">Right Dark Slate Banner</p>
                    <input
                      type="text"
                      value={config.promoBanner2.tag}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner2: { ...prev.promoBanner2, tag: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-slate-700 text-xs bg-slate-800 text-white"
                      placeholder="Tag"
                    />
                    <textarea
                      rows={2}
                      value={config.promoBanner2.title}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner2: { ...prev.promoBanner2, title: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-slate-700 text-xs bg-slate-800 text-white"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={config.promoBanner2.ctaText}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          promoBanner2: { ...prev.promoBanner2, ctaText: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-slate-700 text-xs bg-slate-800 text-white font-semibold"
                      placeholder="Button Text"
                    />
                  </div>
                </div>
              )}

              {/* 8. WHY SHOP WITH US EDITOR */}
              {activeSection === 'whyShop' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={config.whyShop?.title || 'Why Shop with Kadeo?'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          whyShop: { ...prev.whyShop, title: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-bold bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={config.whyShop?.subtitle || 'A trusted Sri Lankan commerce platform tailored for quality and reliability.'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          whyShop: { ...prev.whyShop, subtitle: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  {/* 4 Trust Feature Cards */}
                  <div className="space-y-3 pt-2">
                    <p className="font-bold text-neutral-900">4 Trust Badges</p>
                    {[1, 2, 3, 4].map(num => {
                      const titleKey = `card${num}Title` as keyof typeof config.whyShop;
                      const descKey = `card${num}Desc` as keyof typeof config.whyShop;
                      return (
                        <div key={num} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                          <p className="font-bold text-neutral-800">Badge #{num}</p>
                          <input
                            type="text"
                            value={(config.whyShop as any)?.[titleKey] || ''}
                            onChange={e =>
                              updateConfig(prev => ({
                                ...prev,
                                whyShop: { ...prev.whyShop, [titleKey]: e.target.value },
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-neutral-200 text-xs bg-white font-bold"
                            placeholder="Title"
                          />
                          <input
                            type="text"
                            value={(config.whyShop as any)?.[descKey] || ''}
                            onChange={e =>
                              updateConfig(prev => ({
                                ...prev,
                                whyShop: { ...prev.whyShop, [descKey]: e.target.value },
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-neutral-200 text-xs bg-white"
                            placeholder="Description"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9. FOOTER EDITOR */}
              {activeSection === 'footer' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Footer Tagline & Description</label>
                    <textarea
                      rows={3}
                      value={config.footer.description}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          footer: { ...prev.footer, description: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Copyright Line</label>
                    <input
                      type="text"
                      value={config.footer.copyrightText}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          footer: { ...prev.footer, copyrightText: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>
                </div>
              )}

              {/* 10. COLORS EDITOR */}
              {activeSection === 'colors' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-2">Primary Brand Color</label>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <input
                        type="color"
                        value={config.theme.primaryColor || '#00A86B'}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: e.target.value },
                          }))
                        }
                        className="h-10 w-14 rounded-lg cursor-pointer border border-neutral-300 p-0.5"
                      />
                      <div>
                        <p className="font-bold text-neutral-900">{config.theme.primaryColor || '#00A86B'}</p>
                        <p className="text-[10px] text-neutral-400">Buttons, badges, highlights</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-2">Niche Color Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {colorPresets.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() =>
                            updateConfig(prev => ({
                              ...prev,
                              theme: { ...prev.theme, primaryColor: preset.value },
                            }))
                          }
                          className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 hover:border-neutral-300 text-left bg-white transition-all cursor-pointer"
                        >
                          <span className="h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.value }} />
                          <span className="text-[11px] font-semibold text-neutral-800 truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. TYPOGRAPHY */}
              {activeSection === 'typography' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <label className="block font-bold text-neutral-800 mb-1">Heading Typography Style</label>
                  <div className="space-y-2">
                    {[
                      { id: 'sans', name: 'Inter Sans (Modern & Clean)', preview: 'Clean modern digital shopping' },
                      { id: 'serif', name: 'Playfair Serif (Luxury & Boutique)', preview: 'Sophisticated timeless luxury' },
                      { id: 'mono', name: 'Technical Mono (Cyber & Gear)', preview: '0101 HIGH-PRECISION TECH SPECS' },
                    ].map(f => (
                      <div
                        key={f.id}
                        onClick={() =>
                          updateConfig(prev => ({
                            ...prev,
                            theme: { ...prev.theme, fontFamily: f.id as any },
                          }))
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          config.theme.fontFamily === f.id
                            ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <p className="font-bold text-neutral-900">{f.name}</p>
                        <p className={`text-[11px] text-neutral-500 mt-1 ${f.id === 'serif' ? 'font-serif' : f.id === 'mono' ? 'font-mono' : 'font-sans'}`}>
                          {f.preview}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* 11.5 ANIMATIONS & MOTION EDITOR */}
              {activeSection === 'animations' && (
                <div className="space-y-5 text-xs text-neutral-700">
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Interactive Storefront Animations</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Captivate your shoppers with modern fluid micro-animations, floating badges, marquee tickers, and hover dynamics.
                    </p>
                  </div>

                  
                  {/* Scroll-Driven Reveal Animations */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">Scroll Reveal Entrance (AOS)</p>
                        <p className="text-[10px] text-neutral-500">Elements gracefully animate in as you scroll down</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.animations?.scrollReveal !== false}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            animations: {
                              ...prev.animations,
                              scrollReveal: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Scroll Animation Style */}
                  {config.animations?.scrollReveal !== false && (
                    <div className="space-y-2">
                      <label className="block font-bold text-neutral-800">Scroll Entrance Effect</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'slide-up', label: 'Slide Up & Fade' },
                          { id: 'scale', label: 'Scale Pop & Rise' },
                          { id: 'fade', label: 'Pure Gentle Fade' },
                        ].map(item => {
                          const isSelected = (config.animations?.scrollRevealStyle || 'slide-up') === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                updateConfig(prev => ({
                                  ...prev,
                                  animations: {
                                    ...prev.animations,
                                    scrollRevealStyle: item.id as any,
                                  },
                                }))
                              }
                              className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-2 border-emerald-500 bg-emerald-50/50 font-bold'
                                  : 'border-neutral-200 bg-white hover:border-neutral-300'
                              }`}
                            >
                              <span className="text-[11px] text-neutral-800">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Announcement Bar Marquee */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">Continuous Scrolling Marquee</p>
                        <p className="text-[10px] text-neutral-500">Smooth infinite ticker on Announcement Bar</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.animations?.announcementTicker !== false}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            animations: {
                              ...prev.animations,
                              announcementTicker: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Hero Floating Badge Motion */}
                  <div className="space-y-2">
                    <label className="block font-bold text-neutral-800">Hero Floating Badge Motion</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'float', label: 'Floating Bob', desc: 'Smooth vertical oscillation' },
                        { id: 'pulse', label: 'Breathing Pulse', desc: 'Subtle attention pulse' },
                        { id: 'static', label: 'Static', desc: 'No animation' },
                      ].map(item => {
                        const isSelected = (config.animations?.heroBadge || 'float') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                animations: {
                                  ...prev.animations,
                                  heroBadge: item.id as any,
                                },
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <p className="font-bold text-neutral-900 text-[11px]">{item.label}</p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Button Pulse Aura */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">Primary Button Glowing Aura</p>
                        <p className="text-[10px] text-neutral-500">Breathing pulse effect on Hero CTA button</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.animations?.ctaButtonPulse !== false}
                        onChange={e =>
                          updateConfig(prev => ({
                            ...prev,
                            animations: {
                              ...prev.animations,
                              ctaButtonPulse: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Product Card Hover Reaction */}
                  <div className="space-y-2">
                    <label className="block font-bold text-neutral-800">Product Card Hover Effect</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'lift-zoom', label: 'Lift & Deep Shadow', desc: 'Card floats up with 3D elevation' },
                        { id: 'glow-border', label: 'Brand Color Glow', desc: 'Border illuminates with theme color' },
                        { id: 'scale', label: 'Gentle Scale Zoom', desc: 'Smooth proportional scaling' },
                        { id: 'subtle', label: 'Subtle Standard', desc: 'Minimal opacity touch' },
                      ].map(item => {
                        const isSelected = (config.animations?.productHover || 'lift-zoom') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                animations: {
                                  ...prev.animations,
                                  productHover: item.id as any,
                                },
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 shadow-xs'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <p className="font-bold text-neutral-900 text-[11px]">{item.label}</p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Motion Speed */}
                  <div className="space-y-2">
                    <label className="block font-bold text-neutral-800">Animation Transition Speed</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fast', label: 'Fast (200ms)' },
                        { id: 'normal', label: 'Normal (400ms)' },
                        { id: 'smooth', label: 'Cinematic (800ms)' },
                      ].map(item => {
                        const isSelected = (config.animations?.animationSpeed || 'normal') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateConfig(prev => ({
                                ...prev,
                                animations: {
                                  ...prev.animations,
                                  animationSpeed: item.id as any,
                                },
                              }))
                            }
                            className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-emerald-500 bg-emerald-50/50 font-bold'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-[11px] text-neutral-800">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 12. STORE SETTINGS */}
              {activeSection === 'storeSettings' && (
                <div className="space-y-4 text-xs text-neutral-700">
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={config.storeSettings?.currencySymbol || 'Rs.'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          storeSettings: { ...prev.storeSettings, currencySymbol: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Free Delivery Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={config.storeSettings?.freeShippingThreshold || 5000}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          storeSettings: { ...prev.storeSettings, freeShippingThreshold: Number(e.target.value) },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Support Contact Email</label>
                    <input
                      type="email"
                      value={config.footer?.supportEmail || 'support@kadeo.lk'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          footer: { ...prev.footer, supportEmail: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">Support Helpline Phone</label>
                    <input
                      type="text"
                      value={config.footer?.phone || '+94 11 234 5678'}
                      onChange={e =>
                        updateConfig(prev => ({
                          ...prev,
                          footer: { ...prev.footer, phone: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-neutral-50/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Apply & Publish Actions */}
            <div className="p-4 border-t border-neutral-200/90 bg-white space-y-2">
              <button
                type="button"
                onClick={handlePublish}
                style={{ backgroundColor: config.theme.primaryColor || '#00A86B' }}
                className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer hover:opacity-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Apply & Publish to Live Shop</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" style={{ color: config.theme.primaryColor || '#00A86B' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
