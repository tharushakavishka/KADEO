"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  Palette,
  Sparkles,
  Check,
  Eye,
  ExternalLink,
  RotateCcw,
  Smartphone,
  Monitor,
  ShoppingBag,
  Type,
  Layout,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Store,
  Sliders,
  Paintbrush,
  Tag,
  MessageCircle,
  HelpCircle,
  Wand2,
  ShoppingBag as BagIcon,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import {
  saveThemeStylesAction,
  updateStoreThemeAction,
} from "@/features/shops/content-actions";

interface SimpleThemeCustomizerProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    whatsapp_number?: string | null;
    address?: string | null;
    theme_id: string;
    storefront_content?: Record<string, string>;
  };
  categories?: { id: string; name: string; slug: string }[];
  products?: any[];
}

export const BASE_THEMES = [
  {
    id: "elite_commerce",
    name: "Elite Commerce",
    sinhalaTitle: "Mega Retail Marketplace",
    description:
      "Green mega-retail marketplace with top utility bar, search pill, pastel category showcase, and responsive image slider hero.",
    badge: "Featured Mega Store",
    category: "Marketplace & Retail",
    rating: 4.9,
    installCount: "1.2k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
    tags: ["🏬 Mega Retail", "🏷️ Pastel Categories", "🎠 Image Slider", "🔍 Instant Search"],
    bestFor: "Multi-category stores, supermarkets, electronics, headphones, fashion & mega retail",
    preview: {
      bgColor: "bg-[#f7faf8]",
      headerColor: "bg-[#0b3820] text-emerald-100",
      accentColor: "#00A859",
      heroText: "NEW ARRIVALS WINTER SALE",
      heroSub: "Premium sound, deep bass, and 30% off your perfect vibe starts here.",
      fontStyle: "font-sans",
      cardBg: "bg-white border-emerald-100",
      cardTitle: "Over-Ear Wireless Studio Headphones",
      cardPrice: "LKR 8,900",
      badge: "Winter Sale",
    },
  },
  {
    id: "modern_retail",
    name: "Modern Retail (Viva)",
    sinhalaTitle: "Flagship Modern Retail",
    description:
      "Flagship retail experience with top announcement bar, interactive search, circular category pills, promo trio banners, and trusted reviews.",
    badge: "Flagship Retail",
    category: "Marketplace & Retail",
    rating: 4.9,
    installCount: "2.4k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    tags: ["✨ Flagship", "📢 Top Bar", "🎯 Promo Trio", "⭐ Reviews"],
    bestFor: "Multi-category stores, lifestyle brands, electronics, fashion & supermarkets",
    preview: {
      bgColor: "bg-[#faf8f5]",
      headerColor: "bg-[#0e2a22] text-[#2ec49c]",
      accentColor: "#017d6e",
      heroText: "Elevate Your Everyday",
      heroSub: "Quality products across every category",
      fontStyle: "font-sans",
      cardBg: "bg-white border-zinc-200",
      cardTitle: "Wireless Audio / Linen",
      cardPrice: "LKR 4,800",
      badge: "Top Pick",
    },
  },
  {
    id: "minimal",
    name: "Minimal Store",
    sinhalaTitle: "Clean Minimal Ivory",
    description:
      "Warm ivory canvas, balanced clean layout, prominent product cards with modern rounded styling.",
    badge: "Most Popular",
    category: "Minimal & Clean",
    rating: 4.8,
    installCount: "3.1k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    tags: ["🤍 Clean Ivory", "📱 Mobile First", "⚡ High Speed", "📦 Clean Grid"],
    bestFor: "Homeware, lifestyle, gadgets & everyday items",
    preview: {
      bgColor: "bg-[#faf8f2]",
      headerColor: "bg-[#faf8f2] border-[#e8e4dc]",
      accentColor: "#017d6e",
      heroText: "Clean & Modern",
      heroSub: "Handcrafted & curated collection",
      fontStyle: "font-sans",
      cardBg: "bg-white border-[#e8e4dc]",
      cardTitle: "Natural Craft Item",
      cardPrice: "LKR 3,500",
      badge: "In Stock",
    },
  },
  {
    id: "modern_boutique",
    name: "Modern Boutique",
    sinhalaTitle: "Editorial Luxury Boutique",
    description:
      "Curated editorial layout with graceful serif typography, tailored for high-end craft, batik and jewelry.",
    badge: "Editorial Luxury",
    category: "Luxury & Fashion",
    rating: 4.9,
    installCount: "850+ stores",
    previewBanner: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    tags: ["💎 Editorial Serif", "👗 Boutique", "✨ High End", "🖼️ Curated Grid"],
    bestFor: "Boutiques, designer apparel, batik & fine jewelry",
    preview: {
      bgColor: "bg-[#faf8f2]",
      headerColor: "bg-[#faf8f2] border-[#e8e4dc]",
      accentColor: "#192d2a",
      heroText: "The Curated Collection",
      heroSub: "Artisanal pieces made slowly",
      fontStyle: "font-serif",
      cardBg: "bg-[#f4eedf] border-[#e8e4dc]",
      cardTitle: "Pure Linen Batik",
      cardPrice: "LKR 6,400",
      badge: "Limited Edition",
    },
  },
  {
    id: "classic",
    name: "Classic Shop",
    sinhalaTitle: "Traditional Catalog Retail",
    description:
      "Traditional catalog storefront with structured category sidebar, detailed specifications and compact grid.",
    badge: "Catalog Retail",
    category: "Classic & Catalog",
    rating: 4.7,
    installCount: "1.5k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    tags: ["📑 Sidebar Catalog", "🛒 Quick Buy", "🗂️ Department Tree"],
    bestFor: "Groceries, cosmetics, hardware & large inventories",
    preview: {
      bgColor: "bg-white",
      headerColor: "bg-white border-zinc-200",
      accentColor: "#18181b",
      heroText: "All Department Store",
      heroSub: "Complete daily catalog",
      fontStyle: "font-sans",
      cardBg: "bg-zinc-50 border-zinc-200",
      cardTitle: "Everyday Essential",
      cardPrice: "LKR 1,850",
      badge: "Available",
    },
  },
  {
    id: "shop_app",
    name: "Shop App Inspired",
    sinhalaTitle: "Modern Shop App Experience",
    description:
      "Clean modern marketplace feed with pill search, rounded white cards, package tracking and purple accents.",
    badge: "App Marketplace",
    category: "Mobile & App Style",
    rating: 4.9,
    installCount: "1.9k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    tags: ["📱 App Feed", "💜 Royal Violet", "🔍 Pill Search", "📦 Track Orders"],
    bestFor: "Multi-category stores, trending products & lifestyle brands",
    preview: {
      bgColor: "bg-[#f8f7ff]",
      headerColor: "bg-[#5c24ff] text-white",
      accentColor: "#5c24ff",
      heroText: "Discover & Track",
      heroSub: "Streamlined shopping with instant WhatsApp updates",
      fontStyle: "font-sans",
      cardBg: "bg-white border-purple-100",
      cardTitle: "Trending Release",
      cardPrice: "LKR 5,200",
      badge: "Shop App",
    },
  },
  {
    id: "custom",
    name: "Custom Studio Builder",
    sinhalaTitle: "Modular Canvas Blocks",
    description:
      "Full modular freedom: Modular blocks, Hero slider or banner, custom card layouts.",
    badge: "Modular Builder",
    category: "Custom Builder",
    rating: 5.0,
    installCount: "1.1k+ stores",
    previewBanner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    tags: ["🎨 Freeform Studio", "🧩 Modular Blocks", "📐 Unlimited Layouts"],
    bestFor: "Brands wanting unique custom layouts & flexible sections",
    preview: {
      bgColor: "bg-[#faf8f5]",
      headerColor: "bg-[#0e2a22] text-[#2ec49c]",
      accentColor: "#017d6e",
      heroText: "Custom Built Store",
      heroSub: "Designed your way with modular blocks",
      fontStyle: "font-sans",
      cardBg: "bg-white border-[#e8e4dc]",
      cardTitle: "Custom Product Item",
      cardPrice: "LKR 4,500",
      badge: "Custom Block",
    },
  },
];

export const COLOR_PRESETS = [
  {
    id: "emerald",
    name: "Ceylon Emerald",
    sinhalaName: "Emerald & Forest Green",
    primary: "#017d6e",
    buttonColor: "#ffffff",
    navbarBg: "#f6faf7",
    navbarColor: "#183b35",
    cardBg: "#ffffff",
    cardBorder: "#e8e4dc",
    textColor: "#183b35",
    previewRing: "ring-[#017d6e]",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    sinhalaName: "Deep Ocean Blue",
    primary: "#1d4ed8",
    buttonColor: "#ffffff",
    navbarBg: "#eff6ff",
    navbarColor: "#1e3a8a",
    cardBg: "#ffffff",
    cardBorder: "#dbeafe",
    textColor: "#1e293b",
    previewRing: "ring-[#1d4ed8]",
  },
  {
    id: "shop_app_purple",
    name: "Shop App Purple",
    sinhalaName: "Vibrant Purple Accent",
    primary: "#5c24ff",
    buttonColor: "#ffffff",
    navbarBg: "#f8f7ff",
    navbarColor: "#1d0e5c",
    cardBg: "#ffffff",
    cardBorder: "#ede9fe",
    textColor: "#1d0e5c",
    previewRing: "ring-[#5c24ff]",
  },
  {
    id: "purple",
    name: "Velvet Purple",
    sinhalaName: "Plum & Dusty Lavender",
    primary: "#7c3aed",
    buttonColor: "#ffffff",
    navbarBg: "#faf5ff",
    navbarColor: "#4c1d95",
    cardBg: "#ffffff",
    cardBorder: "#ede9fe",
    textColor: "#2e1065",
    previewRing: "ring-[#7c3aed]",
  },
  {
    id: "amber",
    name: "Sunset Amber",
    sinhalaName: "Warm Amber & Terracotta",
    primary: "#d97706",
    buttonColor: "#ffffff",
    navbarBg: "#fffbeb",
    navbarColor: "#78350f",
    cardBg: "#ffffff",
    cardBorder: "#fef3c7",
    textColor: "#451a03",
    previewRing: "ring-[#d97706]",
  },
  {
    id: "rose",
    name: "Rose Glamour",
    sinhalaName: "Blush Pink & Rose Gold",
    primary: "#e11d48",
    buttonColor: "#ffffff",
    navbarBg: "#fff1f2",
    navbarColor: "#881337",
    cardBg: "#ffffff",
    cardBorder: "#ffe4e6",
    textColor: "#4c0519",
    previewRing: "ring-[#e11d48]",
  },
  {
    id: "dark",
    name: "Minimal Obsidian",
    sinhalaName: "Onyx Black & Slate",
    primary: "#18181b",
    buttonColor: "#ffffff",
    navbarBg: "#f4f4f5",
    navbarColor: "#09090b",
    cardBg: "#ffffff",
    cardBorder: "#e4e4e7",
    textColor: "#09090b",
    previewRing: "ring-[#18181b]",
  },
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    sinhalaName: "Monochrome Minimalist",
    primary: "#111111",
    buttonColor: "#ffffff",
    navbarBg: "#ffffff",
    navbarColor: "#111111",
    cardBg: "#ffffff",
    cardBorder: "#eaeaea",
    textColor: "#111111",
    previewRing: "ring-[#111111]",
  },
];

export function SimpleThemeCustomizer({
  shop,
  categories = [],
  products = [],
}: SimpleThemeCustomizerProps) {
  // Step 1: Theme, Step 2: Color Theme, Step 3: Customize
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    shop.theme_id || "modern_retail"
  );
  const [themeFilterCategory, setThemeFilterCategory] = useState<string>("all");
  const [themeSearchQuery, setThemeSearchQuery] = useState<string>("");

  const [content, setContent] = useState<Record<string, string>>({
    ...(shop.storefront_content || {}),
  });
  const [savedJson, setSavedJson] = useState<string>(
    JSON.stringify(shop.storefront_content || {})
  );
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [activeTab, setActiveTab] = useState<
    "hero" | "colors" | "typography" | "shapes" | "visibility"
  >("hero");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(content) !== savedJson;

  const updateKey = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
    setError(null);
  };

  const updateKeys = (entries: Record<string, string>) => {
    setContent((prev) => ({ ...prev, ...entries }));
    setMessage(null);
    setError(null);
  };

  // Slider image uploading state
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null);

  // File upload handler for slider images
  const handleUploadSlide = async (slideNum: number, file: File | undefined) => {
    if (!file) return;
    setUploadingSlide(slideNum);
    setError(null);
    try {
      if (file.size > 4 * 1024 * 1024) {
        throw new Error("Image must be smaller than 4 MB.");
      }
      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (!allowed.includes(file.type)) {
        throw new Error("Please upload a PNG, JPEG, or WebP image.");
      }
      const form = new FormData();
      form.set("image", file);
      const res = await fetch("/api/store-images", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image upload failed.");
      }
      const url = data.url;
      const key = `slider:slide:${slideNum}`;
      if (slideNum === 1) {
        updateKeys({
          [key]: url,
          "element:hero:image": url,
          "hero:image_url": url,
        });
      } else {
        updateKey(key, url);
      }
      setMessage(`Slide ${slideNum} image uploaded successfully!`);
    } catch (err: any) {
      setError(err?.message || "Failed to upload image.");
    } finally {
      setUploadingSlide(null);
    }
  };

  const handleRemoveSlide = (slideNum: number) => {
    setContent((prev) => {
      const next = { ...prev };
      delete next[`slider:slide:${slideNum}`];
      return next;
    });
    setMessage(`Slide ${slideNum} removed.`);
  };

  const handleAddSlide = () => {
    // Find lowest available index between 2 and 6
    for (let i = 2; i <= 6; i++) {
      if (content[`slider:slide:${i}`] === undefined) {
        updateKey(`slider:slide:${i}`, "");
        setMessage(`Slide ${i} added. Upload an image or enter a URL.`);
        return;
      }
    }
  };

  // Configured slides list for editor
  const configuredSlides = useMemo(() => {
    const list: { num: number; url: string }[] = [];
    const s1 =
      content["slider:slide:1"] ??
      content["element:hero:image"] ??
      content["hero:image_url"] ??
      shop.banner_url ??
      "";
    list.push({ num: 1, url: s1 });

    for (let i = 2; i <= 6; i++) {
      if (content[`slider:slide:${i}`] !== undefined) {
        list.push({ num: i, url: content[`slider:slide:${i}`] || "" });
      }
    }
    return list;
  }, [content, shop.banner_url]);

  // Active preview slides for live simulated carousel
  const activePreviewSlides = useMemo(() => {
    const list: string[] = [];
    const s1 =
      content["slider:slide:1"] ||
      content["element:hero:image"] ||
      content["hero:image_url"] ||
      shop.banner_url;
    if (s1 && s1.trim()) list.push(s1.trim());

    for (let i = 2; i <= 6; i++) {
      const s = content[`slider:slide:${i}`];
      if (s && s.trim()) list.push(s.trim());
    }

    if (list.length === 0) {
      if (selectedThemeId === "elite_commerce") {
        list.push(
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
        );
      } else {
        list.push(
          shop.banner_url ||
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
        );
      }
    }
    return list;
  }, [content, shop.banner_url, selectedThemeId]);

  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [isPreviewSliderPaused, setIsPreviewSliderPaused] = useState(false);

  useEffect(() => {
    if (activePreviewSlides.length <= 1 || isPreviewSliderPaused) return;
    const interval = setInterval(() => {
      setPreviewSlideIdx((prev) => (prev + 1) % activePreviewSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activePreviewSlides.length, isPreviewSliderPaused]);

  const handleSelectTheme = (themeId: string) => {
    setMessage(null);
    setError(null);
    setSelectedThemeId(themeId);
    startTransition(async () => {
      try {
        const res = await updateStoreThemeAction(themeId);
        if (res && res.error) {
          setError(res.error);
        } else {
          const themeMeta = BASE_THEMES.find((t) => t.id === themeId);
          setMessage(
            `"${themeMeta?.name || themeId}" theme was activated successfully! You can preview changes live.`
          );
        }
      } catch (err: any) {
        setError(err?.message || "An error occurred while switching the theme.");
      }
    });
  };

  const applyPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    setContent((prev) => ({
      ...prev,
      "custom:buttons:background": preset.primary,
      "custom:buttons:color": preset.buttonColor,
      "custom:navbar:background": preset.navbarBg,
      "custom:navbar:color": preset.navbarColor,
      "custom:card:background": preset.cardBg,
      "custom:card:borderColor": preset.cardBorder,
      "custom:card:color": preset.textColor,
    }));
    setMessage(`"${preset.name}" color palette applied successfully.`);
    setError(null);
  };

  const handleReset = () => {
    setContent(JSON.parse(savedJson));
    setMessage(null);
    setError(null);
  };

  const handleSave = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await saveThemeStylesAction(content);
        if (res && res.error) {
          setError(res.error);
        } else {
          setSavedJson(JSON.stringify(content));
          setMessage("Theme changes have been saved and published to your live storefront!");
        }
      } catch (err: any) {
        setError(err?.message || "An error occurred while saving. Please try again.");
      }
    });
  };

  // Derived style variables for preview
  const primaryColor = content["custom:buttons:background"] || "#017d6e";
  const buttonTextColor = content["custom:buttons:color"] || "#ffffff";
  const navbarBg = content["custom:navbar:background"] || "#faf8f2";
  const navbarColor = content["custom:navbar:color"] || "#192d2a";
  const cardBg = content["custom:card:background"] || "#ffffff";
  const cardColor = content["custom:card:color"] || "#192d2a";
  const cardBorder = content["custom:card:borderColor"] || "#e8e4dc";
  const cardRadius = content["custom:card:radius"]
    ? `${content["custom:card:radius"]}px`
    : "16px";
  const buttonRadius = content["custom:buttons:radius"]
    ? `${content["custom:buttons:radius"]}px`
    : "25px";
  const fontStyle = content["style:font"] || "sans";
  const fontFamilyClass =
    fontStyle === "serif"
      ? "font-serif"
      : fontStyle === "rounded"
      ? "font-sans font-medium tracking-tight"
      : "font-sans";

  const isHeroSectionVisible = content["visibility:section:hero"] !== "hidden";
  const showHeroText = content["visibility:hero:title"] !== "hidden";
  const showHeroDesc = content["visibility:hero:description"] !== "hidden";
  const showHeroEyebrow = content["visibility:hero:eyebrow"] !== "hidden";
  const showActionButton = content["visibility:hero:button"] !== "hidden";
  const showSideCard = content["visibility:hero:note"] !== "hidden";
  const showMainCard = content["visibility:hero:content"] !== "hidden";

  const activeThemeMeta =
    BASE_THEMES.find((t) => t.id === selectedThemeId) || BASE_THEMES[0];

  const heroEyebrowText =
    content["element:hero_eyebrow:text"] ||
    content["section:hero:badge"] ||
    content["elite:hero:tag"] ||
    (selectedThemeId === "elite_commerce" ? "— Today Best Deal" : `${activeThemeMeta.badge} • Sri Lanka`);
  const heroTitleText =
    content["element:hero_title:text"] ||
    content["section:hero:heading"] ||
    content["hero:title"] ||
    activeThemeMeta.preview.heroText;
  const heroDescText =
    content["element:hero_desc:text"] ||
    content["section:hero:subheading"] ||
    content["hero:desc"] ||
    shop.description ||
    activeThemeMeta.preview.heroSub;
  const heroButtonText =
    content["element:hero_cta:text"] ||
    content["section:hero:button_text"] ||
    content["hero:cta"] ||
    (selectedThemeId === "elite_commerce" ? "Shop Now →" : "Shop Collection →");
  const heroTextAlign =
    content["element:hero_title:align"] ||
    (selectedThemeId === "elite_commerce" ? "left" : "center");



  return (
    <div className="space-y-6">
      {/* 3-STEP PROGRESS STEPPER BAR */}
      <div className="bg-white rounded-3xl border border-[#e8e4dc] p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* STEP 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
              currentStep === 1
                ? "bg-[#e0f2eb] border-[#017d6e] ring-2 ring-[#017d6e]/50 shadow-2xs"
                : "bg-[#faf8f2] border-[#e8e4dc] hover:border-[#cfc7ba]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition ${
                currentStep === 1
                  ? "bg-[#017d6e] text-white"
                  : "bg-white border border-[#ded8cb] text-[#5a6861]"
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-[#017d6e] uppercase tracking-wider block">
                Step 01
              </span>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block truncate">
                Select Theme
              </strong>
              <span className="text-[10px] text-[#6c7771] block truncate">
                {activeThemeMeta.name}
              </span>
            </div>
          </button>

          {/* STEP 2 */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
              currentStep === 2
                ? "bg-[#e0f2eb] border-[#017d6e] ring-2 ring-[#017d6e]/50 shadow-2xs"
                : "bg-[#faf8f2] border-[#e8e4dc] hover:border-[#cfc7ba]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition ${
                currentStep === 2
                  ? "bg-[#017d6e] text-white"
                  : "bg-white border border-[#ded8cb] text-[#5a6861]"
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-[#017d6e] uppercase tracking-wider block">
                Step 02
              </span>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block truncate">
                Color Palette
              </strong>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-[10px] text-[#6c7771] truncate font-mono">
                  {primaryColor}
                </span>
              </div>
            </div>
          </button>

          {/* STEP 3 */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
              currentStep === 3
                ? "bg-[#e0f2eb] border-[#017d6e] ring-2 ring-[#017d6e]/50 shadow-2xs"
                : "bg-[#faf8f2] border-[#e8e4dc] hover:border-[#cfc7ba]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition ${
                currentStep === 3
                  ? "bg-[#017d6e] text-white"
                  : "bg-white border border-[#ded8cb] text-[#5a6861]"
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-[#017d6e] uppercase tracking-wider block">
                Step 03
              </span>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block truncate">
                Customize Store
              </strong>
              <span className="text-[10px] text-[#6c7771] block truncate">
                Hero content, colors, shapes
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* STATUS & FEEDBACK NOTIFICATIONS */}
      {message && (
        <div className="p-4 rounded-2xl bg-[#e0f2eb] border border-[#bfe3d5] text-[#017d6e] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="ml-auto underline flex items-center gap-1 text-[#0e2a22] hover:text-black font-extrabold"
          >
            View Live Storefront <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

{/* STEP 1: THEME STORE (App Store / Marketplace Style) */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* THEME STORE HERO & SEARCH BAR */}
          <div className="bg-gradient-to-r from-[#0b3820] via-[#0f4b2b] to-[#017d6e] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-emerald-200 border border-white/10">
                <Store className="w-3.5 h-3.5 text-[#34d399]" />
                <span>KADEO OFFICIAL THEME STORE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Select a High-Converting Theme for Your Store
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                Curated high-converting storefront layouts designed for e-commerce brands. Activate with 1-click and customize colors, typography, and hero content.
              </p>

              {/* Theme Store Search & Filter Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-800" />
                  <input
                    type="text"
                    value={themeSearchQuery}
                    onChange={(e) => setThemeSearchQuery(e.target.value)}
                    placeholder="Search themes by name, feature (Mega retail, search bar, slider...)"
                    className="w-full bg-white text-gray-800 text-xs sm:text-sm placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                  />
                  {themeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setThemeSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-2xl bg-white text-[#0b3820] hover:bg-emerald-50 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition shrink-0"
                >
                  <span>Next: Color Palette (Step 02)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A859]" />
                </button>
              </div>
            </div>

            {/* Quick Filter Categories Bar */}
            <div className="relative z-10 flex items-center gap-2 overflow-x-auto pt-5 mt-2 border-t border-emerald-800/40 scrollbar-none text-xs">
              {[
                { id: "all", label: "All Themes", icon: Store },
                { id: "Marketplace & Retail", label: "Retail & Mega Stores", icon: ShoppingBag },
                { id: "Minimal & Clean", label: "Minimal & Clean", icon: Layout },
                { id: "Luxury & Fashion", label: "Fashion & Boutique", icon: Sparkles },
                { id: "Mobile & App Style", label: "App & Trending", icon: Zap },
                { id: "Custom Builder", label: "Modular Canvas", icon: Wand2 },
              ].map((tab) => {
                const isActive = themeFilterCategory === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setThemeFilterCategory(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white text-[#0b3820] shadow-sm"
                        : "bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/60 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THEMES SHOWCASE GRID (App Store Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BASE_THEMES.filter((theme) => {
              const matchesCat =
                themeFilterCategory === "all" || theme.category === themeFilterCategory;
              const matchesQuery =
                !themeSearchQuery.trim() ||
                `${theme.name} ${theme.sinhalaTitle} ${theme.description} ${theme.tags.join(" ")}`
                  .toLowerCase()
                  .includes(themeSearchQuery.trim().toLowerCase());
              return matchesCat && matchesQuery;
            }).map((theme) => {
              const isSelected = selectedThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`group bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-[#017d6e] ring-2 ring-[#017d6e] shadow-lg shadow-emerald-500/10 scale-[1.01]"
                      : "border-[#e8e4dc] hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {/* Card Banner Preview Image with Overlay Badges */}
                  <div className="relative w-full h-44 sm:h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={theme.previewBanner}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{theme.badge}</span>
                      </span>

                      {isSelected ? (
                        <span className="px-3 py-1 rounded-full bg-[#00A859] text-white text-xs font-black flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Active Theme</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#192d2a] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          ⭐ {theme.rating} • {theme.installCount}
                        </span>
                      )}
                    </div>

                    {/* Banner Headline Preview */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">
                        {theme.category}
                      </span>
                      <h4 className="text-base font-black truncate drop-shadow-sm">
                        {theme.preview.heroText}
                      </h4>
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-[#192d2a] group-hover:text-[#017d6e] transition">
                          {theme.name}
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Free on Kadeo
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-[#017d6e] block">
                        {theme.sinhalaTitle}
                      </span>

                      <p className="text-xs text-[#5a6861] leading-relaxed line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {theme.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-lg bg-[#faf8f2] border border-[#e8e4dc] text-[10px] font-semibold text-[#5a6861]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions & Best For Info */}
                    <div className="pt-3 border-t border-[#f0ebe1] space-y-3">
                      <p className="text-[11px] text-[#6c7771] line-clamp-1">
                        <strong className="text-[#192d2a]">Best for: </strong>
                        {theme.bestFor}
                      </p>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentStep(2);
                            }}
                            className="w-full py-2.5 rounded-2xl bg-[#017d6e] hover:bg-[#0b3820] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <span>Customize Colors &rarr;</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full py-2.5 rounded-2xl bg-[#192d2a] hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 transition shadow-2xs group-hover:bg-[#017d6e]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply this Theme</span>
                          </button>
                        )}
                        <Link
                          href={`/shop/${shop.slug}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 rounded-2xl border border-[#e8e4dc] hover:border-[#192d2a] text-[#5a6861] hover:text-[#192d2a] transition shrink-0"
                          title="Preview Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM QUICK JUMP BAR */}
          <div className="bg-white rounded-3xl border border-[#e8e4dc] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e0f2eb] text-[#017d6e] flex items-center justify-center font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-black text-[#192d2a] block">
                  Active Theme: {activeThemeMeta.name}
                </strong>
                <span className="text-[11px] text-[#6c7771]">
                  After selecting a theme, proceed to choose color palettes and customize your store.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-2xl bg-[#017d6e] hover:bg-[#0b3820] text-white text-xs font-black flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>Proceed to Step 02 (Color Palette)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS 2 & 3: TWO-COLUMN WORKFLOW (Controls on Left, Live Preview on Right) */}
      {currentStep !== 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: ACTIVE STEP CONTENT */}
          <div className="lg:col-span-6 space-y-6">

          {/* =================================================================== */}
          {/* STEP 2: COLOR THEME */}
          {/* =================================================================== */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                <div>
                  <span className="text-[10px] font-black text-[#017d6e] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e0f2eb]">
                    Step 02 • Curated Color Palettes
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#192d2a] mt-1">
                    Select Color Theme
                  </h3>
                  <p className="text-xs text-[#5a6861]">
                    Choose a color palette that matches your brand identity and product catalog:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    content["custom:buttons:background"] === preset.primary &&
                    content["custom:navbar:background"] === preset.navbarBg;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between h-28 relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? `border-[#017d6e] bg-[#f0fbf7] ring-2 ${preset.previewRing} shadow-2xs`
                          : "border-[#e8e4dc] hover:border-[#cfc7ba] bg-white hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border border-black/10 shadow-xs -ml-2.5"
                            style={{ backgroundColor: preset.navbarBg }}
                          />
                        </div>
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#e0f2eb] text-[#017d6e] text-[10px] font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8a9992] opacity-0 group-hover:opacity-100 transition">
                            Apply &rarr;
                          </span>
                        )}
                      </div>

                      <div>
                        <strong className="text-xs font-black text-[#192d2a] block truncate">
                          {preset.name}
                        </strong>
                        <span className="text-[11px] text-[#6c7771] block truncate font-medium">
                          {preset.sinhalaName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ACTION FOOTER TO STEP 1 OR STEP 3 */}
              <div className="pt-4 border-t border-[#f0ebe1] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-2xl border border-[#e8e4dc] hover:bg-[#faf8f2] text-xs font-bold text-[#5a6861] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Themes</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isPending}
                    className="px-4 py-2.5 rounded-2xl border border-[#017d6e] text-[#017d6e] hover:bg-[#e0f2eb] text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? "Saving..." : "Save Colors"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-2xl bg-[#017d6e] hover:bg-[#0e2a22] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <span>Next: Customize Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: CUSTOMIZE DETAILS */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Detailed Settings Tabs Bar */}
              <div className="bg-white rounded-3xl border border-[#e8e4dc] p-4 shadow-2xs">
                <div className="flex items-center gap-1.5 bg-[#f0ebe1] p-1.5 rounded-2xl border border-[#ded8cb]">
                  {[
                    { id: "hero", label: "Hero Content", icon: Sparkles },
                    { id: "colors", label: "Colors", icon: Palette },
                    { id: "typography", label: "Fonts", icon: Type },
                    { id: "shapes", label: "Shapes", icon: Layout },
                    { id: "visibility", label: "Sections", icon: Layers },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isActive
                            ? "bg-white text-[#192d2a] shadow-2xs"
                            : "text-[#6c7771] hover:text-[#192d2a]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAB: HERO SECTION CONTENT & SLIDER */}
              {activeTab === "hero" && (
                <div className="space-y-6">
                  {/* SECTION 1: HERO BANNER & SLIDER IMAGES */}
                  <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-5 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#017d6e] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e0f2eb]">
                            Carousel & Banner
                          </span>
                        </div>
                        <h4 className="text-base font-black text-[#192d2a] mt-1">
                          Hero Slider & Banner Images
                        </h4>
                        <p className="text-xs text-[#5a6861]">
                          Upload or add multiple image slides to create an auto-sliding hero carousel for your storefront:
                        </p>
                      </div>
                    </div>

                    {/* List of configured slides */}
                    <div className="space-y-3.5">
                      {configuredSlides.map((slide) => {
                        const n = slide.num;
                        const url = slide.url;
                        const isUploading = uploadingSlide === n;

                        return (
                          <div
                            key={n}
                            className="p-4 rounded-2xl border border-[#e8e4dc] bg-[#faf8f2] space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#017d6e] text-white text-[10px] font-black flex items-center justify-center">
                                  {n}
                                </span>
                                <strong className="text-xs font-bold text-[#192d2a]">
                                  Slide {n} {n === 1 ? "(Primary Banner)" : ""}
                                </strong>
                              </div>

                              {n > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlide(n)}
                                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            {/* Preview Thumbnail and Controls */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              {/* Thumbnail */}
                              <div className="w-full sm:w-28 h-20 rounded-xl bg-gray-200 border border-[#ded8cb] overflow-hidden shrink-0 relative flex items-center justify-center">
                                {url ? (
                                  <img
                                    src={url}
                                    alt={`Slide ${n}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-center p-2 text-gray-400">
                                    <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                    <span className="text-[9px] block font-medium">No Image</span>
                                  </div>
                                )}
                                {isUploading && (
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-[10px] font-bold">
                                    Uploading...
                                  </div>
                                )}
                              </div>

                              {/* URL Input and Upload button */}
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={url}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (n === 1) {
                                      updateKeys({
                                        "slider:slide:1": val,
                                        "element:hero:image": val,
                                        "hero:image_url": val,
                                      });
                                    } else {
                                      updateKey(`slider:slide:${n}`, val);
                                    }
                                  }}
                                  placeholder="https://... or upload image"
                                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#e8e4dc] focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] font-mono"
                                />

                                <div className="flex items-center gap-2">
                                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ded8cb] hover:border-[#017d6e] text-xs font-bold text-[#192d2a] cursor-pointer shadow-2xs transition">
                                    <Upload className="w-3.5 h-3.5 text-[#017d6e]" />
                                    <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                                    <input
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp"
                                      disabled={isUploading}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadSlide(n, file);
                                        e.target.value = "";
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                  <span className="text-[10px] text-[#6c7771]">
                                    PNG, JPG, or WebP up to 4 MB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Slide Button */}
                    {configuredSlides.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddSlide}
                        className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#cfc7ba] hover:border-[#017d6e] text-[#017d6e] bg-[#fcfbf7] hover:bg-[#e0f2eb]/50 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Another Slide Image ({configuredSlides.length}/6)</span>
                      </button>
                    )}

                    {/* Preset Banner Inspiration */}
                    <div className="pt-2 border-t border-[#f0ebe1] space-y-2">
                      <span className="text-[11px] font-bold text-[#6c7771] block">
                        Quick Preset Banners (Click to apply as Slide 1):
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            name: "Modern Retail",
                            url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
                          },
                          {
                            name: "Electronics & Audio",
                            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
                          },
                          {
                            name: "Curated Boutique",
                            url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
                          },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              updateKeys({
                                "slider:slide:1": preset.url,
                                "element:hero:image": preset.url,
                                "hero:image_url": preset.url,
                              });
                              setMessage(`Applied "${preset.name}" preset banner!`);
                            }}
                            className="p-1.5 rounded-xl border border-[#e8e4dc] hover:border-[#017d6e] bg-white text-left transition group cursor-pointer"
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-12 object-cover rounded-lg mb-1 group-hover:scale-102 transition"
                            />
                            <span className="text-[10px] font-bold text-[#192d2a] block truncate">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: HERO TEXT & VISIBILITY CONTROLS */}
                  <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-5 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#017d6e] mb-1">
                          Hero Text & Content Overlay
                        </h4>
                        <p className="text-xs text-[#5a6861]">
                          Customize the headline, subtitle description, eyebrow badge, and call-to-action button for your storefront:
                        </p>
                      </div>
                    </div>

                    {/* Quick Hero Visibility Switch */}
                    <div className="p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-[#192d2a] block">
                          Show Hero Section on Storefront
                        </strong>
                        <span className="text-[10px] text-[#6c7771]">
                          Toggle the hero section visibility on your homepage
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateKey(
                            "visibility:section:hero",
                            content["visibility:section:hero"] === "hidden" ? "shown" : "hidden"
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          content["visibility:section:hero"] !== "hidden"
                            ? "bg-[#017d6e] text-white shadow-2xs"
                            : "bg-[#e8e4dc] text-[#5a6861]"
                        }`}
                      >
                        {content["visibility:section:hero"] !== "hidden" ? "Visible" : "Hidden"}
                      </button>
                    </div>

                    {/* Hero Title & Dark Shading Notice */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#192d2a] flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-[#017d6e]" />
                          <span>Hero Title / Main Heading</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = content["visibility:hero:title"] === "hidden" ? "shown" : "hidden";
                            updateKey("visibility:hero:title", nextVal);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            showHeroText
                              ? "bg-[#e0f2eb] text-[#017d6e]"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {showHeroText ? "👁️ Show" : "👁️ Hide"}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          content["element:hero_title:text"] ??
                          content["section:hero:heading"] ??
                          content["hero:title"] ??
                          ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          updateKeys({
                            "element:hero_title:text": val,
                            "section:hero:heading": val,
                            "hero:title": val,
                            "2e3e53c92e34": val,
                          });
                        }}
                        placeholder={activeThemeMeta.preview.heroText}
                        className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] font-bold"
                      />
                      {!showHeroText && (
                        <p className="text-[11px] text-[#017d6e] font-semibold flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Hero text is hidden. Dark contrast overlay has been removed from the banner image.</span>
                        </p>
                      )}
                    </div>

                    {/* Hero Eyebrow / Tag */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#192d2a] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#017d6e]" />
                          <span>Eyebrow Tag / Small Badge</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateKey(
                              "visibility:hero:eyebrow",
                              content["visibility:hero:eyebrow"] === "hidden" ? "shown" : "hidden"
                            )
                          }
                          className="text-[10px] font-bold text-[#6c7771] hover:text-[#017d6e] cursor-pointer"
                        >
                          {content["visibility:hero:eyebrow"] === "hidden" ? "👁️ Show" : "👁️ Hide"}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          content["element:hero_eyebrow:text"] ??
                          content["section:hero:badge"] ??
                          content["elite:hero:tag"] ??
                          ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          updateKeys({
                            "element:hero_eyebrow:text": val,
                            "section:hero:badge": val,
                            "elite:hero:tag": val,
                            "hero:eyebrow": val,
                          });
                        }}
                        placeholder={selectedThemeId === "elite_commerce" ? "— Today Best Deal" : "— Handcrafted & Authentic"}
                        className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] font-medium"
                      />
                    </div>

                    {/* Hero Subtitle / Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#192d2a] flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#017d6e]" />
                          <span>Hero Subtitle / Description</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateKey(
                              "visibility:hero:description",
                              content["visibility:hero:description"] === "hidden" ? "shown" : "hidden"
                            )
                          }
                          className="text-[10px] font-bold text-[#6c7771] hover:text-[#017d6e] cursor-pointer"
                        >
                          {content["visibility:hero:description"] === "hidden" ? "👁️ Show" : "👁️ Hide"}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={
                          content["element:hero_desc:text"] ??
                          content["section:hero:subheading"] ??
                          content["hero:desc"] ??
                          ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          updateKeys({
                            "element:hero_desc:text": val,
                            "section:hero:subheading": val,
                            "hero:desc": val,
                            "5779ac00b259": val,
                          });
                        }}
                        placeholder={activeThemeMeta.preview.heroSub}
                        className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] leading-relaxed resize-none font-medium"
                      />
                    </div>

                    {/* Hero Action Button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#192d2a] block">
                            Button Text
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              updateKey(
                                "visibility:hero:button",
                                content["visibility:hero:button"] === "hidden" ? "shown" : "hidden"
                              )
                            }
                            className="text-[10px] font-bold text-[#6c7771] hover:text-[#017d6e] cursor-pointer"
                          >
                            {content["visibility:hero:button"] === "hidden" ? "👁️ Show" : "👁️ Hide"}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={
                            content["element:hero_cta:text"] ??
                            content["section:hero:button_text"] ??
                            content["hero:cta"] ??
                            ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            updateKeys({
                              "element:hero_cta:text": val,
                              "section:hero:button_text": val,
                              "hero:cta": val,
                              "cb0301452f41": val,
                            });
                          }}
                          placeholder={selectedThemeId === "elite_commerce" ? "Shop Now →" : "Shop Collection →"}
                          className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#192d2a] block">
                          Button Link Target
                        </label>
                        <input
                          type="text"
                          value={
                            content["element:hero_cta:url"] ??
                            content["section:hero:button_url"] ??
                            ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            updateKeys({
                              "element:hero_cta:url": val,
                              "section:hero:button_url": val,
                            });
                          }}
                          placeholder="#products or WhatsApp link"
                          className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#017d6e]/30 text-[#192d2a] font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-2 pt-1 border-t border-[#f0ebe1]">
                      <label className="text-xs font-bold text-[#192d2a] block">
                        Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ].map((align) => {
                          const currentAlign = content["element:hero_title:align"] || (selectedThemeId === "elite_commerce" ? "left" : "center");
                          return (
                            <button
                              key={align.value}
                              type="button"
                              onClick={() => {
                                updateKeys({
                                  "element:hero_title:align": align.value,
                                  "element:hero_desc:align": align.value,
                                  "element:hero_cta:align": align.value,
                                });
                              }}
                              className={`py-2 px-3 text-xs font-bold border transition text-center cursor-pointer rounded-xl ${
                                currentAlign === align.value
                                  ? "border-[#017d6e] bg-[#e0f2eb] text-[#017d6e]"
                                  : "border-[#e8e4dc] text-[#5a6861] hover:bg-[#faf8f2]"
                              }`}
                            >
                              {align.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FINE-TUNE COLORS */}
              {activeTab === "colors" && (
                <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-4 shadow-2xs">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#192d2a] uppercase tracking-wider text-[#017d6e] mb-1">
                      Fine-Tune Individual Colors
                    </h4>
                    <p className="text-xs text-[#5a6861] mb-4">
                      Customize primary buttons, header backgrounds, and card colors to match your brand:
                    </p>
                  </div>

                  {/* Primary Button Color */}
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                    <div>
                      <label className="text-xs font-bold text-[#192d2a] block">
                        Primary / Action Button Color
                      </label>
                      <span className="text-[10px] text-[#6c7771]">
                        Primary buttons and Add to Cart color
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) =>
                          updateKey("custom:buttons:background", e.target.value)
                        }
                        className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                        aria-label="Primary Button Color"
                      />
                      <span className="font-mono text-xs text-[#5a6861] uppercase">
                        {primaryColor}
                      </span>
                    </div>
                  </div>

                  {/* Navbar / Header Background */}
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                    <div>
                      <label className="text-xs font-bold text-[#192d2a] block">
                        Header / Navigation Background
                      </label>
                      <span className="text-[10px] text-[#6c7771]">
                        Storefront navigation and header background color
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={navbarBg}
                        onChange={(e) =>
                          updateKey("custom:navbar:background", e.target.value)
                        }
                        className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                        aria-label="Navbar Background Color"
                      />
                      <span className="font-mono text-xs text-[#5a6861] uppercase">
                        {navbarBg}
                      </span>
                    </div>
                  </div>

                  {/* Card Background Color */}
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                    <div>
                      <label className="text-xs font-bold text-[#192d2a] block">
                        Product Card Background
                      </label>
                      <span className="text-[10px] text-[#6c7771]">
                        Product card background color
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardBg}
                        onChange={(e) =>
                          updateKey("custom:card:background", e.target.value)
                        }
                        className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                        aria-label="Product Card Background Color"
                      />
                      <span className="font-mono text-xs text-[#5a6861] uppercase">
                        {cardBg}
                      </span>
                    </div>
                  </div>

                  {/* Card Border Color */}
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                    <div>
                      <label className="text-xs font-bold text-[#192d2a] block">
                        Product Card Border Color
                      </label>
                      <span className="text-[10px] text-[#6c7771]">
                        Product card border color
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardBorder}
                        onChange={(e) =>
                          updateKey("custom:card:borderColor", e.target.value)
                        }
                        className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                        aria-label="Product Card Border Color"
                      />
                      <span className="font-mono text-xs text-[#5a6861] uppercase">
                        {cardBorder}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TYPOGRAPHY */}
              {activeTab === "typography" && (
                <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-4 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-[#192d2a] uppercase tracking-wider text-[#017d6e] mb-1">
                    Typography Style
                  </h4>
                  <p className="text-xs text-[#5a6861] mb-4">
                    Choose the primary typography style used across your storefront:
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        id: "sans",
                        title: "Modern Clean Sans",
                        sinhala: "Inter & Modern Sans",
                        desc: "Fast-loading, highly legible, and versatile for all store catalogs.",
                        fontClass: "font-sans",
                        sample: "The Quick Brown Fox (New Arrival Collection)",
                      },
                      {
                        id: "serif",
                        title: "Editorial Luxury Serif",
                        sinhala: "Playfair & Luxury Serif",
                        desc: "Sophisticated and prestigious for cosmetics, jewelry, and luxury apparel.",
                        fontClass: "font-serif",
                        sample: "The Curated Artisan Collection",
                      },
                      {
                        id: "rounded",
                        title: "Friendly Rounded Sans",
                        sinhala: "Friendly & Warm Typography",
                        desc: "Approachable and cheerful for kids wear, food, lifestyle, and modern brands.",
                        fontClass: "font-sans tracking-tight font-medium",
                        sample: "Handcrafted with Everyday Joy",
                      },
                    ].map((font) => {
                      const isSelected = fontStyle === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => updateKey("style:font", font.id)}
                          className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? "border-[#017d6e] bg-[#f0fbf7] ring-2 ring-[#017d6e]/80"
                              : "border-[#e8e4dc] hover:border-[#cfc7ba] bg-white"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-bold text-[#192d2a]">
                                {font.title}
                              </strong>
                              <span className="text-[10px] text-[#6c7771]">
                                {font.sinhala}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5a6861]">{font.desc}</p>
                            <p
                              className={`text-sm font-bold text-[#192d2a] pt-1 ${font.fontClass}`}
                            >
                              {font.sample}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#017d6e] text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: SHAPES & CORNERS */}
              {activeTab === "shapes" && (
                <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-6 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-[#192d2a] uppercase tracking-wider text-[#017d6e]">
                    Card & Button Shapes
                  </h4>

                  {/* Button Radius */}
                  <div className="space-y-3 pb-5 border-b border-[#f0ebe1]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#192d2a]">
                        Button Corner Radius
                      </label>
                      <span className="text-xs font-mono text-[#017d6e] font-bold">
                        {buttonRadius}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Sharp Square", value: "0" },
                        { label: "Smooth Rounded", value: "8" },
                        { label: "Pill Rounded", value: "25" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            updateKey("custom:buttons:radius", opt.value)
                          }
                          className={`py-2 px-3 text-xs font-bold border transition text-center cursor-pointer rounded-xl ${
                            (content["custom:buttons:radius"] || "25") ===
                            opt.value
                              ? "border-[#017d6e] bg-[#e0f2eb] text-[#017d6e]"
                              : "border-[#e8e4dc] text-[#5a6861] hover:bg-[#faf8f2]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Radius */}
                  <div className="space-y-3 pb-5 border-b border-[#f0ebe1]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#192d2a]">
                        Card Corner Radius
                      </label>
                      <span className="text-xs font-mono text-[#017d6e] font-bold">
                        {cardRadius}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Square (0px)", value: "0" },
                        { label: "Soft (12px)", value: "12" },
                        { label: "Rounded (20px)", value: "20" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            updateKey("custom:card:radius", opt.value)
                          }
                          className={`py-2 px-3 text-xs font-bold border transition text-center cursor-pointer rounded-xl ${
                            (content["custom:card:radius"] || "16") === opt.value
                              ? "border-[#017d6e] bg-[#e0f2eb] text-[#017d6e]"
                              : "border-[#e8e4dc] text-[#5a6861] hover:bg-[#faf8f2]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SECTIONS VISIBILITY */}
              {activeTab === "visibility" && (
                <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-4 shadow-2xs">
                  <h4 className="text-xs font-extrabold text-[#192d2a] uppercase tracking-wider text-[#017d6e] mb-1">
                    Storefront Sections Visibility
                  </h4>
                  <p className="text-xs text-[#5a6861] mb-2">
                    Choose which homepage sections to show or hide:
                  </p>

                  {[
                    {
                      key: "visibility:hero:title",
                      label: "Main Hero Heading",
                      desc: "Main hero headline text",
                      isShown: showHeroText,
                    },
                    {
                      key: "visibility:hero:description",
                      label: "Hero Description",
                      desc: "Subtitle and description copy",
                      isShown: showHeroDesc,
                    },
                    {
                      key: "visibility:hero:button",
                      label: "Shop Collection Action Button",
                      desc: "Shop Now / Collection button",
                      isShown: showActionButton,
                    },
                    {
                      key: "visibility:hero:content",
                      label: "Main Promotion Card",
                      desc: "Primary featured promo card",
                      isShown: showMainCard,
                    },
                    {
                      key: "visibility:hero:note",
                      label: "Secondary Side Promotion",
                      desc: "Secondary announcement pill or badge",
                      isShown: showSideCard,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-[#e8e4dc] bg-[#faf8f2]"
                    >
                      <div>
                        <strong className="text-xs font-bold text-[#192d2a] block">
                          {item.label}
                        </strong>
                        <span className="text-[10px] text-[#6c7771]">
                          {item.desc}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateKey(item.key, item.isShown ? "hidden" : "shown")
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          item.isShown
                            ? "bg-[#017d6e] text-white shadow-2xs"
                            : "bg-[#e8e4dc] text-[#5a6861]"
                        }`}
                      >
                        {item.isShown ? "Shown" : "Hidden"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* SAVE & RESET ACTIONS */}
              <div className="bg-white rounded-3xl border border-[#e8e4dc] p-5 shadow-xs flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-2xl border border-[#e8e4dc] hover:bg-[#faf8f2] text-xs font-bold text-[#5a6861] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Color Palette</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isDirty || isPending}
                    className="px-4 py-2.5 rounded-2xl border border-[#e8e4dc] text-xs font-bold text-[#5a6861] hover:text-[#192d2a] hover:bg-[#faf8f2] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isPending}
                    className="px-6 py-2.5 rounded-2xl bg-[#017d6e] hover:bg-[#0e2a22] text-white text-xs font-bold transition shadow-xs hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isPending ? "Saving..." : "Save Theme Changes"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME SIMULATED LIVE STOREFRONT PREVIEW */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden shadow-sm">
            {/* Preview Toolbar */}
            <div className="bg-[#faf8f2] border-b border-[#e8e4dc] px-4 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6a7872] ml-1.5">
                  Live Preview: {activeThemeMeta.name}
                </span>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-[#ded8cb]/40 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewViewport === "desktop"
                      ? "bg-white text-[#017d6e] shadow-2xs"
                      : "text-[#6a7872] hover:text-[#192d2a]"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewViewport === "mobile"
                      ? "bg-white text-[#017d6e] shadow-2xs"
                      : "text-[#6a7872] hover:text-[#192d2a]"
                  }`}
                  title="Mobile 360px View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div
              className={`mx-auto p-4 transition-all duration-300 ${fontFamilyClass} ${
                previewViewport === "mobile"
                  ? "max-w-[360px] bg-[#f0ebe1]/30 py-6"
                  : "w-full bg-[#faf8f5]"
              }`}
            >
              {/* Simulated Screen */}
              <div className="rounded-2xl border border-[#ded8cb] overflow-hidden shadow-xs bg-white text-[#192d2a]">
                {/* Simulated Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b transition-colors"
                  style={{ backgroundColor: navbarBg, color: navbarColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs overflow-hidden"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt=""
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        shop.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <strong className="text-xs font-black block leading-none">
                        {shop.name}
                      </strong>
                      <span className="text-[9px] opacity-75 font-medium">
                        Official Store
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                      style={{
                        backgroundColor: primaryColor,
                        color: buttonTextColor,
                      }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Bag (1)</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Hero Section */}
                {!isHeroSectionVisible ? (
                  <div className="p-4 text-center text-xs text-[#8a9992] bg-[#faf8f2] border-b border-[#f0ebe1] font-medium">
                    [Hero Section Hidden]
                  </div>
                ) : (
                  <div
                    className="relative w-full min-h-[170px] sm:min-h-[210px] md:min-h-[230px] bg-gradient-to-r from-[#0d4a2b] via-[#14663b] to-[#60b37c] overflow-hidden shadow-inner flex items-center group select-none"
                    onMouseEnter={() => setIsPreviewSliderPaused(true)}
                    onMouseLeave={() => setIsPreviewSliderPaused(false)}
                  >
                    {/* Multi-Slide Carousel Track */}
                    {activePreviewSlides.map((slideUrl, idx) => {
                      const isActive = idx === (previewSlideIdx % activePreviewSlides.length);
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                            isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
                          }`}
                        >
                          <img
                            src={slideUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}

                    {/* Dark Contrast Shading Overlay: ONLY rendered when hero text is shown! */}
                    {showHeroText && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent z-10 pointer-events-none transition-opacity duration-300" />
                    )}

                    {/* Real-time Hero Text Overlay */}
                    {showHeroText && (
                      <div
                        className={`relative z-20 p-4 sm:p-5 max-w-[80%] space-y-1.5 ${
                          heroTextAlign === "center"
                            ? "text-center mx-auto"
                            : heroTextAlign === "right"
                            ? "text-right ml-auto"
                            : "text-left"
                        }`}
                      >
                        {showHeroEyebrow && (
                          <span className="text-[9px] font-bold text-emerald-300 block tracking-wider">
                            {heroEyebrowText}
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-black text-white leading-tight uppercase drop-shadow-sm line-clamp-2">
                          {heroTitleText}
                        </h4>
                        {showHeroDesc && (
                          <p className="text-[10px] text-emerald-100/90 leading-snug line-clamp-2">
                            {heroDescText}
                          </p>
                        )}
                        {showActionButton && (
                          <div className="pt-1">
                            <span className="inline-block px-3 py-1 text-[10px] font-black shadow-xs bg-white text-[#00A859] rounded-full">
                              {heroButtonText}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prev Slide Arrow on Hover */}
                    {activePreviewSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSlideIdx(
                            (prev) => (prev - 1 + activePreviewSlides.length) % activePreviewSlides.length
                          );
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        aria-label="Previous Slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    {/* Next Slide Arrow on Hover */}
                    {activePreviewSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSlideIdx(
                            (prev) => (prev + 1) % activePreviewSlides.length
                          );
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        aria-label="Next Slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Slider Pagination Dots / Pills */}
                    {activePreviewSlides.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs z-30">
                        {activePreviewSlides.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setPreviewSlideIdx(dotIdx)}
                            className={`rounded-full transition-all cursor-pointer ${
                              dotIdx === (previewSlideIdx % activePreviewSlides.length)
                                ? "w-4 h-1.5 bg-white shadow-xs"
                                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated Category Pills */}
                <div className="px-4 py-2 bg-white border-b border-[#f0ebe1] flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold">
                  <span
                    className="px-2.5 py-1 rounded-full text-white shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    All Items
                  </span>
                  {(categories.length > 0
                    ? categories
                    : [{ name: "Featured" }, { name: "Offers" }, { name: "New" }]
                  )
                    .slice(0, 4)
                    .map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-[#f0ebe1] text-[#5a6861] shrink-0"
                      >
                        {c.name}
                      </span>
                    ))}
                </div>

                {/* Simulated Product Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#192d2a]">
                    <span>Featured Catalog Item</span>
                    <span className="text-[10px] text-[#6c7771]">1 item</span>
                  </div>

                  <div
                    className="border p-3 flex items-center justify-between shadow-2xs transition-all"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      color: cardColor,
                      borderRadius: cardRadius,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#e0f2eb] flex items-center justify-center shrink-0 text-[#017d6e]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-[#017d6e] uppercase block">
                          In Stock
                        </span>
                        <strong className="text-xs font-bold block text-[#192d2a]">
                          {products.length > 0
                            ? products[0].name
                            : "Ceylon Artisan Craft Item"}
                        </strong>
                        <span className="text-xs font-black text-[#192d2a]">
                          LKR{" "}
                          {products.length > 0 && products[0].price
                            ? Number(products[0].price).toLocaleString("en-US")
                            : "3,500"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs transition flex items-center gap-1"
                      style={{
                        backgroundColor: primaryColor,
                        color: buttonTextColor,
                        borderRadius: buttonRadius,
                      }}
                    >
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Link to Storefront */}
            <div className="p-3 bg-[#faf8f2] border-t border-[#e8e4dc] flex items-center justify-between text-xs">
              <span className="text-[#6c7771] text-[11px]">
                Active Theme:{" "}
                <strong className="text-[#192d2a]">
                  {activeThemeMeta.name}
                </strong>
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/shop/${shop.slug}`}
                  target="_blank"
                  className="font-bold text-[#017d6e] hover:text-[#0e2a22] flex items-center gap-1 text-[11px]"
                >
                  <span>View Live Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
