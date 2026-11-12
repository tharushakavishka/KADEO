"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Layout,
  MousePointerClick,
  Shapes,
  Maximize2,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Sparkles,
  MoveUp,
  MoveDown,
  Palette,
  Tag,
  Megaphone,
  Check,
  CheckCircle2,
  Smartphone,
  Store,
  Compass,
  Image as ImageIcon,
  Upload,
  GripVertical,
  RefreshCw,
  Trash2,
  Smile,
  ShieldCheck,
  AlertTriangle,
  Minus,
  Plus,
} from "lucide-react";

async function compressImageClientSide(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<{ file: File; originalSize: number; compressedSize: number; savedPercent: number }> {
  const originalSize = file.size;
  if (typeof window === "undefined") {
    return { file, originalSize, compressedSize: originalSize, savedPercent: 0 };
  }
  if (file.type === "image/svg+xml" || file.type === "image/gif" || originalSize < 102400) {
    return { file, originalSize, compressedSize: originalSize, savedPercent: 0 };
  }
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= originalSize) {
            resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
          } else {
            const ext = "image/webp";
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: ext,
              lastModified: Date.now(),
            });
            const savedPercent = Math.round(((originalSize - newFile.size) / originalSize) * 100);
            resolve({ file: newFile, originalSize, compressedSize: newFile.size, savedPercent });
          }
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, originalSize, compressedSize: originalSize, savedPercent: 0 });
    };
    img.src = objectUrl;
  });
}

function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const rgb = [
    parseInt(full.substring(0, 2), 16) / 255,
    parseInt(full.substring(2, 4), 16) / 255,
    parseInt(full.substring(4, 6), 16) / 255,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  } catch {
    return 4.5;
  }
}

const CEYLON_BANNER_PRESETS = [
  {
    name: "Herbal & Wellness",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ceylon Tea & Spices",
    url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Handmade Crafts",
    url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Organic Groceries",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  },
];

const COLOR_PRESETS = [
  { id: "emerald", name: "Ceylon Emerald", primary: "#017d6e", buttonColor: "#ffffff" },
  { id: "navy", name: "Royal Navy", primary: "#0f172a", buttonColor: "#ffffff" },
  { id: "earth", name: "Spiced Cinnamon", primary: "#b45309", buttonColor: "#ffffff" },
  { id: "rose", name: "Lotus Rose", primary: "#be185d", buttonColor: "#ffffff" },
  { id: "ink", name: "Minimal Ink", primary: "#18181b", buttonColor: "#ffffff" },
  { id: "purple", name: "Shop Violet", primary: "#5c24ff", buttonColor: "#ffffff" },
];

const QUICK_COLORS = [
  { hex: "#000000", label: "Black" },
  { hex: "#0f172a", label: "Deep Slate" },
  { hex: "#017d6e", label: "Ceylon Green" },
  { hex: "#2ec49c", label: "Mint Green" },
  { hex: "#ffffff", label: "White" },
  { hex: "#d97706", label: "Amber Gold" },
  { hex: "#e11d48", label: "Crimson Rose" },
  { hex: "#64748b", label: "Slate Gray" },
];

interface StudioRightInspectorProps {
  inspectorTab: "design" | "interact" | "layers";
  setInspectorTab: (tab: "design" | "interact" | "layers") => void;
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  content: Record<string, string>;
  updateKey: (key: string, value: string) => void;
  updateKeys: (entries: Record<string, string>) => void;
  sectionsOrder: string[];
  onMoveSection?: (idx: any, dir: "up" | "down") => void;
  onReorderSections?: (newOrder: any, toIndex?: any) => void;
  onToggleSection: (id: string) => void;
  shop: any;
}

export function StudioRightInspector({
  inspectorTab,
  setInspectorTab,
  selectedElementId,
  setSelectedElementId,
  content,
  updateKey,
  updateKeys,
  sectionsOrder,
  onMoveSection,
  onReorderSections,
  onToggleSection,
  shop,
}: StudioRightInspectorProps) {
  const [activeHeroSlideTab, setActiveHeroSlideTab] = useState<1 | 2 | 3>(1);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Auto focus input when switching text elements
  useEffect(() => {
    if (["hero_title", "hero_desc", "hero_eyebrow", "hero_cta", "hero_sec", "announcement"].includes(selectedElementId)) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
        if (textInputRef.current instanceof HTMLInputElement || textInputRef.current instanceof HTMLTextAreaElement) {
          textInputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedElementId]);

  const applyUpdates = (updates: Record<string, string>) => {
    updateKeys(updates);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploadingBanner(true);

    try {
      const { file: processedFile, savedPercent } = await compressImageClientSide(file);
      const formData = new FormData();
      formData.append("file", processedFile);
      formData.append("shop_id", shop?.id || "");
      formData.append("type", "banner");

      const res = await fetch("/api/store-images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.url) {
        if (activeHeroSlideTab === 1) {
          applyUpdates({
            "element:hero:image": data.url,
            "image:hero": data.url,
            "hero:image_url": data.url,
            "slider:slide:1": data.url,
          });
        } else {
          applyUpdates({
            [`slider:slide:${activeHeroSlideTab}`]: data.url,
            "hero:slider:enabled": "true",
          });
        }
        if (savedPercent > 0) {
          setUploadSuccess(`WebP: ${savedPercent}% saved ✓`);
        } else {
          setUploadSuccess("Uploaded ✓");
        }
      }
    } catch (err: any) {
      setUploadError(err?.message || "Upload error");
    } finally {
      setIsUploadingBanner(false);
      e.target.value = "";
    }
  };

  const [panels, setPanels] = useState<Record<string, boolean>>({
    content: true,
    banner: true,
    button: true,
    typography: true,
    whatsapp: true,
    card: true,
    branding: true,
  });

  const togglePanel = (p: string) => {
    setPanels((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const isHeroTitle = selectedElementId === "hero_title";
  const isHeroDesc = selectedElementId === "hero_desc";
  const isHeroEyebrow = selectedElementId === "hero_eyebrow";
  const isHeroBtn = selectedElementId === "hero_cta" || selectedElementId === "hero_sec";
  const isHeroTextSelected = isHeroTitle || isHeroDesc || isHeroEyebrow || isHeroBtn;

  const getElementMeta = (id: string) => {
    switch (id) {
      case "hero_cta":
        return { label: "Primary Button", icon: MousePointerClick, type: "button" };
      case "hero_sec":
        return { label: "Secondary Button", icon: ArrowRight, type: "button" };
      case "hero_title":
        return { label: "Hero Title", icon: Type, type: "text" };
      case "hero":
      case "hero_image":
        return { label: "Hero Banner", icon: ImageIcon, type: "banner" };
      case "hero_eyebrow":
        return { label: "Promo Badge", icon: Tag, type: "text" };
      case "hero_desc":
        return { label: "Hero Subtitle", icon: Type, type: "text" };
      case "announcement":
        return { label: "Announcement Bar", icon: Megaphone, type: "text" };
      case "whatsapp_bar":
        return { label: "WhatsApp Bar", icon: MessageCircle, type: "whatsapp" };
      case "products":
      case "featured_products":
      case "product_card":
        return { label: "Products Catalog", icon: Shapes, type: "card" };
      case "categories":
        return { label: "Categories Grid", icon: Layout, type: "categories" };
      case "promos":
      case "deals_banner":
        return { label: "Promo Highlights", icon: Tag, type: "promos" };
      case "benefits":
      case "delivery_info":
        return { label: "Trust Badges & Benefits", icon: Store, type: "benefits" };
      case "reviews":
        return { label: "Customer Reviews", icon: Sparkles, type: "reviews" };
      case "brand_story":
        return { label: "Brand Story", icon: Type, type: "text" };
      case "contact":
        return { label: "Contact & WhatsApp", icon: MessageCircle, type: "whatsapp" };
      case "footer":
        return { label: "Store Footer", icon: HelpCircle, type: "footer" };
      case "navbar":
      case "branding":
        return { label: "Header & Navigation", icon: Layout, type: "branding" };
      default:
        return { label: id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: MousePointerClick, type: "general" };
    }
  };

  const currentMeta = getElementMeta(selectedElementId);

  // Content text getter
  const currentElementText =
    selectedElementId === "hero_cta"
      ? content["element:hero_cta:text"] ?? "Shop the collection"
      : selectedElementId === "hero_sec"
      ? content["element:hero_sec:text"] ?? "Explore Services"
      : selectedElementId === "hero_title"
      ? content["element:hero_title:text"] ?? (shop?.name || "Elevate your everyday.")
      : selectedElementId === "hero_eyebrow"
      ? content["element:hero_eyebrow:text"] ?? "A LITTLE MORE EVERYDAY JOY"
      : selectedElementId === "hero_desc"
      ? content["element:hero_desc:text"] ?? (shop?.description || "Thoughtful finds. Beautiful essentials.")
      : selectedElementId === "announcement"
      ? content["element:announcement:text"] ?? "Everyday finds, delivered to your door"
      : content[`element:${selectedElementId}:text`] ?? "";

  const handleTextChange = (newVal: string) => {
    const key =
      selectedElementId === "hero_cta"
        ? "element:hero_cta:text"
        : selectedElementId === "hero_sec"
        ? "element:hero_sec:text"
        : selectedElementId === "hero_title"
        ? "element:hero_title:text"
        : selectedElementId === "hero_eyebrow"
        ? "element:hero_eyebrow:text"
        : selectedElementId === "hero_desc"
        ? "element:hero_desc:text"
        : selectedElementId === "announcement"
        ? "element:announcement:text"
        : `element:${selectedElementId}:text`;
    updateKey(key, newVal);
  };

  // Font Size logic
  const defaultFontSize = isHeroTitle ? 36 : isHeroDesc ? 16 : isHeroEyebrow ? 12 : isHeroBtn ? 14 : 14;
  const currentFontSize = parseInt(
    content[`element:${selectedElementId}:font_size`] || String(defaultFontSize),
    10
  );

  const handleFontSizeChange = (size: number) => {
    const clamped = Math.max(10, Math.min(80, size));
    updateKey(`element:${selectedElementId}:font_size`, String(clamped));
  };

  // Font Family logic
  const currentFontFamily =
    content[`element:${selectedElementId}:font_family`] ||
    content["typography:family"] ||
    content["style:font"] ||
    "sans";

  const handleFontFamilyChange = (font: string) => {
    updateKey(`element:${selectedElementId}:font_family`, font);
  };

  // Color logic
  const defaultColor = isHeroTitle ? "#192d2a" : isHeroDesc ? "#5a6861" : isHeroEyebrow ? "#017d6e" : isHeroBtn ? "#ffffff" : "#192d2a";
  const currentTextColor =
    isHeroBtn
      ? content["element:hero_cta:color"] || content["custom:buttons:color"] || "#ffffff"
      : content[`element:${selectedElementId}:color`] || defaultColor;

  const handleColorChange = (col: string) => {
    if (isHeroBtn) {
      applyUpdates({
        "element:hero_cta:color": col,
        "custom:buttons:color": col,
        "color:button_text": col,
      });
    } else {
      updateKey(`element:${selectedElementId}:color`, col);
    }
  };

  // Alignment logic
  const currentTextAlign =
    content[`element:${selectedElementId}:align`] ||
    (isHeroBtn ? content["element:hero_cta:align"] || "left" : "left");

  const handleAlignChange = (al: string) => {
    updateKey(`element:${selectedElementId}:align`, al);
    if (isHeroBtn) {
      updateKey("element:hero_cta:align", al);
    }
  };

  // Cursor-aware emoji insertion
  const handleInsertEmoji = (emoji: string) => {
    const el = textInputRef.current;
    if (!el) {
      handleTextChange((currentElementText ? currentElementText + " " : "") + emoji);
      return;
    }
    const start = el.selectionStart ?? currentElementText.length;
    const end = el.selectionEnd ?? currentElementText.length;
    const before = currentElementText.substring(0, start);
    const after = currentElementText.substring(end);
    const nextVal = before + emoji + after;
    handleTextChange(nextVal);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // Active Button States
  const currentBtnBg = content["element:hero_cta:bg"] || content["custom:buttons:background"] || content["color:primary"] || "#017d6e";
  const currentBtnColor = content["element:hero_cta:color"] || content["custom:buttons:color"] || content["color:button_text"] || "#ffffff";
  const currentBtnRadius = content["shape:btn_radius"] || "16";
  const currentBtnVariant = content["button:variant"] || content["style:buttons"] || "solid";
  const btnContrast = getContrastRatio(currentBtnBg, currentBtnColor);
  const isBtnAccessible = btnContrast >= 4.5;

  // Active Hero Banner Image
  const currentBannerImage =
    content["element:hero:image"] ||
    content["image:hero"] ||
    content["hero:image_url"] ||
    shop?.banner_url ||
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85";

  return (
    <aside className="w-[300px] bg-white border-l border-[#e2e8f0] flex flex-col h-full select-none shrink-0 overflow-hidden text-xs">
      {/* 1. TOP TABS: DESIGN | INTERACT | LAYERS */}
      <div className="p-2 border-b border-[#f1f5f9] shrink-0">
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
          {(["design", "interact", "layers"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setInspectorTab(tab)}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-bold capitalize transition cursor-pointer text-center ${
                inspectorTab === tab
                  ? "bg-white text-zinc-900 shadow-2xs font-black"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. INSPECTOR BODY */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {/* ========================================================= */}
        {/* DESIGN TAB */}
        {/* ========================================================= */}
        {inspectorTab === "design" && (
          <>
            {/* COMPACT TARGET ELEMENT STRIP & QUICK SWITCHER */}
            <div className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <currentMeta.icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-zinc-900 truncate">
                    {currentMeta.label}
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                  Editing
                </span>
              </div>

              {/* Quick element switch chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "hero_title", label: "Title" },
                  { id: "hero_desc", label: "Subtitle" },
                  { id: "hero_eyebrow", label: "Badge" },
                  { id: "hero_cta", label: "Button" },
                  { id: "hero", label: "All Hero" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedElementId(item.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      selectedElementId === item.id
                        ? "bg-blue-600 text-white shadow-2xs font-black"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================= */}
            {/* CONTEXTUAL HERO TEXT CONTROLS (ONLY RELEVANT CONTROLS SHOWN) */}
            {/* ========================================================= */}
            {isHeroTextSelected ? (
              <div className="space-y-3">
                {/* 1. TEXT EDITING CARD */}
                <div className="space-y-2 p-2.5 rounded-xl border border-blue-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-blue-600" />
                      <span>Text Edit</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentElementText.length} chars
                    </span>
                  </div>

                  {isHeroDesc || isHeroTitle ? (
                    <textarea
                      ref={textInputRef as React.RefObject<HTMLTextAreaElement>}
                      rows={isHeroTitle ? 2 : 3}
                      value={currentElementText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Type text..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  ) : (
                    <input
                      ref={textInputRef as React.RefObject<HTMLInputElement>}
                      type="text"
                      value={currentElementText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Type text..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  )}

                  {/* Clean Mini Emojis Row */}
                  <div className="flex items-center gap-1 pt-0.5 overflow-x-auto">
                    <span title="Insert emoji at cursor" className="inline-flex">
                      <Smile className="w-3 h-3 text-slate-400 shrink-0" />
                    </span>
                    {["🔥", "🚚", "🌿", "✨", "🎉", "🛍️", "🇱🇰", "🏷️", "💬"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-blue-100 hover:scale-110 text-xs flex items-center justify-center transition cursor-pointer shrink-0"
                        title={`Insert ${emoji} at cursor`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* 1-Click Suggestions */}
                  {isHeroTitle && (
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Quick Suggestions:</span>
                      <div className="flex flex-col gap-1">
                        {[
                          "Natural Organic Beauty & Hair Care",
                          "Elevate your everyday.",
                          "Good finds. Thoughtfully selected.",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleTextChange(sug)}
                            className="text-left text-[10px] text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded truncate transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isHeroDesc && (
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Quick Suggestions:</span>
                      <div className="flex flex-col gap-1">
                        {[
                          "Thoughtful finds. Beautiful essentials.",
                          "Island-wide trusted delivery and direct WhatsApp support.",
                          "Order directly with real-time stock and instant WhatsApp confirmation.",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleTextChange(sug)}
                            className="text-left text-[10px] text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded truncate transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isHeroEyebrow && (
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "A LITTLE MORE EVERYDAY JOY",
                          "100% GENUINE & HAND-PICKED",
                          "SPECIAL STOREFRONT FEATURE",
                          "NEW ARRIVALS ✧",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleTextChange(sug)}
                            className="text-[10px] text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isHeroBtn && (
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "Shop Now",
                          "Shop the collection",
                          "Browse Products",
                          "Order via WhatsApp",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleTextChange(sug)}
                            className="text-[10px] text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded transition cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. FONT SIZE CARD ( ‍) */}
                <div className="space-y-2 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Font Size</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {currentFontSize} PX
                    </span>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange(currentFontSize - 2)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center justify-center shrink-0"
                      title="Decrease font size (-2px)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min={isHeroEyebrow ? 9 : 12}
                      max={isHeroTitle ? 72 : 40}
                      step={1}
                      value={currentFontSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange(currentFontSize + 2)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center justify-center shrink-0"
                      title="Increase font size (+2px)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Presets Tailored to Element */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(isHeroTitle
                      ? [
                          { label: "Normal", size: 30 },
                          { label: "Large", size: 36 },
                          { label: "XL", size: 44 },
                          { label: "Huge", size: 54 },
                        ]
                      : isHeroDesc
                      ? [
                          { label: "Small", size: 13 },
                          { label: "Normal", size: 15 },
                          { label: "Large", size: 18 },
                          { label: "XL", size: 22 },
                        ]
                      : isHeroEyebrow
                      ? [
                          { label: "Micro", size: 10 },
                          { label: "Small", size: 11 },
                          { label: "Normal", size: 12 },
                          { label: "Large", size: 14 },
                        ]
                      : [
                          { label: "Small", size: 12 },
                          { label: "Normal", size: 14 },
                          { label: "Medium", size: 16 },
                          { label: "Large", size: 18 },
                        ]
                    ).map((preset) => {
                      const isActive = currentFontSize === preset.size;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleFontSizeChange(preset.size)}
                          className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer text-center ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. FONT FAMILY CARD */}
                <div className="space-y-2 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    <span>Font Style</span>
                  </span>

                  <select
                    value={currentFontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-zinc-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="sinhala_sans">Noto Sans</option>
                    <option value="sinhala_display">Gemunu Libre (Display)</option>
                    <option value="sinhala_traditional">Iskoola Pota (Serif)</option>
                    <option value="sans">Kullim Park (Modern Sans)</option>
                    <option value="serif">Playfair Display (Luxury Serif)</option>
                    <option value="rounded">Outfit (Friendly Rounded)</option>
                    <option value="mono">Clean Mono</option>
                  </select>
                </div>

                {/* 4. TEXT COLOR CARD */}
                <div className="space-y-2 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isHeroBtn ? "Button Colors (Text & Background)" : "Text Color"}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {currentTextColor}
                    </span>
                  </div>

                  {/* Color Picker + Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <input
                        type="color"
                        value={currentTextColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={currentTextColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1 text-xs font-mono uppercase bg-transparent outline-none text-slate-800"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Fast Color Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleColorChange(c.hex)}
                        className={`w-6 h-6 rounded-full border transition cursor-pointer flex items-center justify-center shrink-0 ${
                          currentTextColor.toLowerCase === c.hex.toLowerCase
                            ? "ring-2 ring-blue-600 ring-offset-1 border-white"
                            : "border-slate-300 hover:scale-110"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {currentTextColor.toLowerCase === c.hex.toLowerCase && (
                          <Check className={`w-3 h-3 ${c.hex === "#ffffff" ? "text-black" : "text-white"}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* If CTA Button: Fill Background & Contrast badge */}
                  {isHeroBtn && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">Button Background</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded p-1">
                          <input
                            type="color"
                            value={currentBtnBg}
                            onChange={(e) =>
                              applyUpdates({
                                "element:hero_cta:bg": e.target.value,
                                "custom:buttons:background": e.target.value,
                                "color:primary": e.target.value,
                              })
                            }
                            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-[10px] font-mono uppercase text-slate-700">
                            {currentBtnBg}
                          </span>
                        </div>
                      </div>

                      {/* WCAG Contrast badge */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-600">WCAG Contrast</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isBtnAccessible
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                          <span>{btnContrast}:1</span>
                          <span>{isBtnAccessible ? "Pass ✓" : "Low ⚠️"}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. ALIGNMENT & EXTRA STYLE */}
                <div className="space-y-2 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
                    <span>Alignment</span>
                  </span>

                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {[
                      { id: "left", icon: AlignLeft, label: "Left" },
                      { id: "center", icon: AlignCenter, label: "Center" },
                      { id: "right", icon: AlignRight, label: "Right" },
                    ].map((al) => {
                      const Icon = al.icon;
                      const isActive = currentTextAlign === al.id;
                      return (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => handleAlignChange(al.id)}
                          className={`flex-1 py-1 rounded flex items-center justify-center transition cursor-pointer ${
                            isActive
                              ? "bg-white text-blue-600 shadow-2xs font-bold"
                              : "text-slate-500 hover:text-black"
                          }`}
                          title={al.label}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>

                  {/* If Button: Radius and Variant */}
                  {isHeroBtn && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">Radius</span>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { id: "99", label: "Pill", radiusVal: "30" },
                            { id: "16", label: "Round", radiusVal: "16" },
                            { id: "8", label: "Soft", radiusVal: "8" },
                            { id: "0", label: "Flat", radiusVal: "0" },
                          ].map((sh) => {
                            const isActive = currentBtnRadius === sh.id;
                            return (
                              <button
                                key={sh.id}
                                type="button"
                                onClick={() => {
                                  applyUpdates({
                                    "shape:btn_radius": sh.id,
                                    "custom:buttons:radius": sh.radiusVal,
                                  });
                                }}
                                className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer text-center ${
                                  isActive
                                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {sh.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">Style</span>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { id: "solid", label: "Solid" },
                            { id: "glass", label: "Glass" },
                            { id: "outline", label: "Border" },
                            { id: "soft", label: "Soft" },
                          ].map((v) => {
                            const isActive = currentBtnVariant === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  applyUpdates({
                                    "button:variant": v.id,
                                    "style:buttons": v.id,
                                  });
                                }}
                                className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer text-center ${
                                  isActive
                                    ? "bg-blue-50 border-blue-600 text-blue-700 font-black shadow-2xs"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {v.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* NON-TEXT / GENERAL HERO & STORE PANELS */
              /* ========================================================= */
              <div className="space-y-3">
                {/* HERO SECTION ALL-IN-ONE TEXTS (When 'hero' section or 'hero_image' is selected) */}
                {(selectedElementId === "hero" || selectedElementId === "hero_image") && (
                  <div className="space-y-2.5 p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-blue-600" />
                        Hero Section Texts
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                        Overview
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Eyebrow */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">Promo Eyebrow / Badge</span>
                          <button
                            type="button"
                            onClick={() => setSelectedElementId("hero_eyebrow")}
                            className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit Eyebrow
                          </button>
                        </div>
                        <input
                          type="text"
                          value={content["element:hero_eyebrow:text"] ?? "A LITTLE MORE EVERYDAY JOY"}
                          onChange={(e) => updateKey("element:hero_eyebrow:text", e.target.value)}
                          placeholder="Promo badge text..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      {/* Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">Hero Title / Main Heading</span>
                          <button
                            type="button"
                            onClick={() => setSelectedElementId("hero_title")}
                            className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit Title
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={content["element:hero_title:text"] ?? (shop?.name || "Elevate your everyday.")}
                          onChange={(e) => updateKey("element:hero_title:text", e.target.value)}
                          placeholder="Main headline..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">Hero Subtitle / Description</span>
                          <button
                            type="button"
                            onClick={() => setSelectedElementId("hero_desc")}
                            className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit Subtitle
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={content["element:hero_desc:text"] ?? (shop?.description || "Thoughtful finds. Beautiful essentials.")}
                          onChange={(e) => updateKey("element:hero_desc:text", e.target.value)}
                          placeholder="Subtitle or description..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      {/* CTA Button */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">Button Text</span>
                          <button
                            type="button"
                            onClick={() => setSelectedElementId("hero_cta")}
                            className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit Button
                          </button>
                        </div>
                        <input
                          type="text"
                          value={content["element:hero_cta:text"] ?? "Shop the collection"}
                          onChange={(e) => updateKey("element:hero_cta:text", e.target.value)}
                          placeholder="Button label..."
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* HERO BANNER IMAGE PANEL */}
                {(currentMeta.type === "banner" ||
                  selectedElementId === "hero_image" ||
                  selectedElementId === "hero") && (
                  <div className="space-y-2 p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => togglePanel("banner")}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        Hero Media & Banner
                      </span>
                      {panels.banner ? (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>

                    {panels.banner && (
                      <div className="space-y-2.5">
                        {/* Multi-Slide Tabs */}
                        <div className="flex items-center justify-between gap-1 bg-[#f1f5f9] p-0.5 rounded-lg">
                          {[1, 2, 3].map((slideNum) => {
                            const hasImg = Boolean(
                              slideNum === 1
                                ? content["slider:slide:1"] || content["element:hero:image"] || content["image:hero"]
                                : content[`slider:slide:${slideNum}`]
                            );
                            const isActive = activeHeroSlideTab === slideNum;
                            return (
                              <button
                                key={slideNum}
                                type="button"
                                onClick={() => setActiveHeroSlideTab(slideNum as 1 | 2 | 3)}
                                className={`flex-1 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                                  isActive
                                    ? "bg-white text-blue-700 shadow-2xs font-black"
                                    : "text-slate-600 hover:text-black"
                                }`}
                              >
                                <span>Slide {slideNum}</span>
                                {hasImg && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Preview */}
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#cbd5e1] bg-zinc-100">
                          <img
                            src={currentBannerImage}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1 rounded">
                            Slide {activeHeroSlideTab}
                          </span>
                        </div>

                        {uploadSuccess && (
                          <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-1 rounded border border-emerald-200">
                            {uploadSuccess}
                          </p>
                        )}

                        {uploadError && (
                          <p className="text-[10px] text-red-600 font-bold bg-red-50 p-1 rounded border border-red-200">
                            {uploadError}
                          </p>
                        )}

                        {/* Upload button */}
                        <label className="w-full py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingBanner ? "Uploading..." : "Upload Image"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={isUploadingBanner}
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                        </label>

                        {/* 1-Click Curated Presets */}
                        <div className="grid grid-cols-4 gap-1 pt-1">
                          {CEYLON_BANNER_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                if (activeHeroSlideTab === 1) {
                                  applyUpdates({
                                    "element:hero:image": preset.url,
                                    "image:hero": preset.url,
                                    "hero:image_url": preset.url,
                                    "slider:slide:1": preset.url,
                                  });
                                } else {
                                  applyUpdates({
                                    [`slider:slide:${activeHeroSlideTab}`]: preset.url,
                                    "hero:slider:enabled": "true",
                                  });
                                }
                              }}
                              className="h-10 rounded-md border border-slate-200 hover:border-blue-500 overflow-hidden relative cursor-pointer group"
                              title={preset.name}
                            >
                              <img src={preset.url} alt="" className="w-full h-full object-cover" />
                              <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white truncate text-center">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* WHATSAPP BAR CONTROLS (Only when whatsapp_bar is selected or general) */}
                {(selectedElementId === "whatsapp_bar" || selectedElementId === "contact") && (
                  <div className="space-y-2 p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp Bar Settings
                    </span>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateKey(
                            "whatsapp:floating_bar",
                            content["whatsapp:floating_bar"] === "false" ? "true" : "false"
                          )
                        }
                        className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          content["whatsapp:floating_bar"] !== "false"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <span>Floating Bar</span>
                        <span className="text-[10px] uppercase font-mono">
                          {content["whatsapp:floating_bar"] !== "false" ? "Enabled ✓" : "Hidden"}
                        </span>
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500">Order Message Template</span>
                        <textarea
                          rows={2}
                          value={
                            content["whatsapp:default_message"] ||
                            `Hi ${shop?.name || "Shop"}! I would like to place an order.`
                          }
                          onChange={(e) => updateKey("whatsapp:default_message", e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-zinc-900 font-medium focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* GENERAL STORE PALETTES (Only when general or branding selected) */}
                {(selectedElementId === "branding" || selectedElementId === "navbar") && (
                  <div className="space-y-2 p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      Color Palettes
                    </span>

                    <div className="grid grid-cols-3 gap-1.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            applyUpdates({
                              "custom:buttons:background": preset.primary,
                              "color:primary": preset.primary,
                              "custom:buttons:color": preset.buttonColor,
                            });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 text-left transition cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span className="text-[10px] font-bold text-slate-700 truncate">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* INTERACT TAB */}
        {/* ========================================================= */}
        {inspectorTab === "interact" && (
          <div className="space-y-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Interactions & Behavior
              </span>
              <p className="text-[11px] text-slate-500">
                Configure touch gestures, zoom animations, and live action responses.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYERS TAB */}
        {/* ========================================================= */}
        {inspectorTab === "layers" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold text-slate-500">Active Canvas Elements</span>
              <span className="text-[10px] font-mono text-slate-400">{sectionsOrder.length} Layers</span>
            </div>

            <div className="space-y-1">
              {[
                { id: "hero_title", name: "Hero Title" },
                { id: "hero_desc", name: "Hero Subtitle" },
                { id: "hero_eyebrow", name: "Promo Badge" },
                { id: "hero_cta", name: "Primary Button" },
                { id: "hero", name: "Hero Banner" },
                { id: "announcement", name: "Announcement Bar" },
                { id: "navbar", name: "Header & Navigation" },
                { id: "products", name: "Products Catalog" },
                { id: "categories", name: "Categories Grid" },
                { id: "whatsapp_bar", name: "WhatsApp Bar" },
                { id: "footer", name: "Store Footer" },
              ].map((layer) => {
                const isActive = selectedElementId === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setSelectedElementId(layer.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                      isActive
                        ? "bg-blue-50 border border-blue-200 text-blue-700 font-bold"
                        : "bg-white border border-slate-100 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{layer.name}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

