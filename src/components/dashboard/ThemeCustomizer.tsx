"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
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
  AlertCircle
} from "lucide-react";
import { saveStoreContent } from "@/features/shops/content-actions";

interface ThemeCustomizerProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    theme_id: string;
    storefront_content?: Record<string, string>;
  };
  categories?: { id: string; name: string; slug: string }[];
  products?: any[];
}

export const COLOR_PRESETS = [
  {
    id: "emerald",
    name: "Ceylon Emerald",
    sinhalaName: "කේඩෝ සම්මත කොළ",
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
    sinhalaName: "රාජකීය නිල්",
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
    name: "Shop.com Purple",
    sinhalaName: "Shop App Violet",
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
    sinhalaName: "දම් පැහැය",
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
    sinhalaName: "උණුසුම් ඇම්බර්",
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
    sinhalaName: "රෝස පැහැය",
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
    sinhalaName: "අවම කළු",
    primary: "#18181b",
    buttonColor: "#ffffff",
    navbarBg: "#f4f4f5",
    navbarColor: "#09090b",
    cardBg: "#ffffff",
    cardBorder: "#e4e4e7",
    textColor: "#09090b",
    previewRing: "ring-[#18181b]",
  },
];

export function ThemeCustomizer({ shop, categories = [], products = [] }: ThemeCustomizerProps) {
  const [content, setContent] = useState<Record<string, string>>({
    ...(shop.storefront_content || {}),
  });
  const [savedJson, setSavedJson] = useState<string>(
    JSON.stringify(shop.storefront_content || {})
  );
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "shapes" | "visibility">("colors");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(content) !== savedJson;

  const updateKey = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
    setError(null);
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[number]) => {
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
    setMessage(null);
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
        const res = await saveStoreContent({
          name: shop.name,
          description: shop.description || "",
          logo_url: shop.logo_url || "",
          banner_url: shop.banner_url || "",
          storefront_content: content,
        });

        if (res && res.error) {
          setError(res.error);
        } else {
          setSavedJson(JSON.stringify(content));
          setMessage("තේමාවේ වෙනස්කම් සාර්ථකව Live Storefront එකට සුරකින ලදී!");
        }
      } catch (err: any) {
        setError(err?.message || "වෙනස්කම් සුරැකීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
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
  const cardRadius = content["custom:card:radius"] ? `${content["custom:card:radius"]}px` : "16px";
  const buttonRadius = content["custom:buttons:radius"] ? `${content["custom:buttons:radius"]}px` : "25px";
  const fontStyle = content["style:font"] || "sans";
  const fontFamilyClass = fontStyle === "serif" ? "font-serif" : fontStyle === "rounded" ? "font-sans font-medium tracking-tight" : "font-sans";

  const showHeroText = content["visibility:hero:title"] !== "hidden";
  const showHeroDesc = content["visibility:hero:description"] !== "hidden";
  const showActionButton = content["visibility:hero:button"] !== "hidden";
  const showSideCard = content["visibility:hero:note"] !== "hidden";
  const showMainCard = content["visibility:hero:content"] !== "hidden";

  const previewProducts = products.length > 0 ? products.slice(0, 4) : [
    { id: "1", name: "Wireless Audio Headset", price: 14500, compare_at_price: 18000, category: { name: "Electronics" } },
    { id: "2", name: "Pure Linen Casual Shirt", price: 4800, compare_at_price: 5900, category: { name: "Fashion" } },
    { id: "3", name: "Botanical Facial Glow Serum", price: 3200, compare_at_price: 3900, category: { name: "Beauty" } },
    { id: "4", name: "Artisan Drip Coffee Maker", price: 18900, compare_at_price: 22500, category: { name: "Home" } },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2eb] text-[#017d6e]">
              <Sparkles className="w-3.5 h-3.5" />
              Theme Customizer (තේමා සැකසුම්)
            </span>
            <span className="text-xs text-[#6a7872] font-semibold">
              Active Theme: <strong className="text-[#192d2a]">{shop.theme_id.replace(/_/g, " ").toUpperCase()}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#192d2a] tracking-tight">
            Customize Your Storefront Theme
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6861] mt-0.5">
            වෙබ් අඩවියේ ප්‍රධාන වර්ණ, අකුරු විලාස, කාඩ්පත් සහ බොත්තම් ඔබගේ වෙළඳ නාමයට ගැළපෙන සේ සකසා ගන්න.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
            <span>{isPending ? "සුරකිමින් පවතී..." : "Save Theme"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-[#e0f2eb] border border-[#bfe3d5] text-[#017d6e] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="ml-auto underline flex items-center gap-1 text-[#0e2a22] hover:text-black font-extrabold"
          >
            Live Storefront එක බලන්න <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout: Controls on Left, Real-Time Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#f0ebe1] p-1.5 rounded-2xl border border-[#ded8cb]">
            {[
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

          {/* TAB 1: COLORS */}
          {activeTab === "colors" && (
            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-6 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-[#192d2a] mb-1">
                  Ready-Made Theme Palettes (වර්ණ මාලාවන්)
                </h3>
                <p className="text-xs text-[#5a6861] mb-4">
                  එක් ක්ලික් කිරීමකින් ඔබගේ මුළු වෙබ් අඩවියටම ගැළපෙන වර්ණ රටාවක් යොදන්න:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      content["custom:buttons:background"] === preset.primary &&
                      content["custom:navbar:background"] === preset.navbarBg;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? `border-[#017d6e] bg-[#f0fbf7] ring-2 ${preset.previewRing}`
                            : "border-[#e8e4dc] hover:border-[#cfc7ba] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs -ml-2.5"
                            style={{ backgroundColor: preset.navbarBg }}
                          />
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#017d6e] ml-auto" />
                          )}
                        </div>
                        <div>
                          <strong className="text-[11px] font-bold text-[#192d2a] block truncate">
                            {preset.name}
                          </strong>
                          <span className="text-[10px] text-[#6c7771] block truncate">
                            {preset.sinhalaName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0ebe1] space-y-4">
                <h4 className="text-xs font-extrabold text-[#192d2a] uppercase tracking-wider text-[#017d6e]">
                  Fine-Tune Colors (තනි තනි වර්ණ වෙනස් කිරීම)
                </h4>

                {/* Primary / Button Color */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                  <div>
                    <label className="text-xs font-bold text-[#192d2a] block">
                      Primary Accent / Button Color
                    </label>
                    <span className="text-[10px] text-[#6c7771]">
                      බොත්තම්, highlights සහ මිලදී ගැනීමේ ක්‍රියා
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => updateKey("custom:buttons:background", e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                      aria-label="Primary Accent Color"
                    />
                    <span className="font-mono text-xs text-[#5a6861] uppercase">
                      {primaryColor}
                    </span>
                  </div>
                </div>

                {/* Header / Navbar Color */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                  <div>
                    <label className="text-xs font-bold text-[#192d2a] block">
                      Header / Navbar Background
                    </label>
                    <span className="text-[10px] text-[#6c7771]">
                      වෙබ් අඩවියේ ඉහළ navigation තීරුවේ පසුබිම
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={navbarBg}
                      onChange={(e) => updateKey("custom:navbar:background", e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                      aria-label="Navbar Background Color"
                    />
                    <span className="font-mono text-xs text-[#5a6861] uppercase">
                      {navbarBg}
                    </span>
                  </div>
                </div>

                {/* Card Background Color */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc]">
                  <div>
                    <label className="text-xs font-bold text-[#192d2a] block">
                      Product Card Background
                    </label>
                    <span className="text-[10px] text-[#6c7771]">
                      භාණ්ඩ පෙන්වන කාඩ්පත්වල පසුබිම් වර්ණය
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardBg}
                      onChange={(e) => updateKey("custom:card:background", e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-[#ded8cb] p-0.5 bg-white"
                      aria-label="Product Card Background Color"
                    />
                    <span className="font-mono text-xs text-[#5a6861] uppercase">
                      {cardBg}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY */}
          {activeTab === "typography" && (
            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-6 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-[#192d2a] mb-1">
                  Typography Style (අකුරු විලාසය)
                </h3>
                <p className="text-xs text-[#5a6861] mb-4">
                  ඔබගේ වෙළඳසැලට වඩාත් සුදුසු අකුරු විලාසය තෝරන්න:
                </p>

                <div className="space-y-3">
                  {[
                    {
                      id: "sans",
                      title: "Modern Clean Sans",
                      sinhala: "පැහැදිලි හා නවීන (Inter / Modern)",
                      desc: "ඉලෙක්ට්‍රොනික්, ඇඳුම් සහ සාමාන්‍ය වෙළඳසැල් සඳහා වඩාත් යෝග්‍යයි.",
                      fontClass: "font-sans",
                      sample: "The Quick Brown Fox",
                    },
                    {
                      id: "serif",
                      title: "Editorial Luxury Serif",
                      sinhala: "විශේෂිත සුඛෝපභෝගී (Playfair / Luxury)",
                      desc: "ස්වර්ණාභරණ, බතික්, සුවඳ විලවුන් සහ බුටික් වෙළඳසැල් සඳහා වඩාත් අලංකාරයි.",
                      fontClass: "font-serif",
                      sample: "The Curated Artisan Collection",
                    },
                    {
                      id: "rounded",
                      title: "Friendly Rounded Sans",
                      sinhala: "මිත්‍රශීලී වටකුරු (Friendly & Warm)",
                      desc: "ආහාර පාන, සෙල්ලම් බඩු සහ ළමා නිෂ්පාදන සඳහා ඉතා ආකර්ෂණීයයි.",
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
                          <p className={`text-sm font-bold text-[#192d2a] pt-1 ${font.fontClass}`}>
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
            </div>
          )}

          {/* TAB 3: SHAPES & CORNER RADIUS */}
          {activeTab === "shapes" && (
            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-6 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-[#192d2a] mb-1">
                  Card & Button Shapes (හැඩතල සහ කොන්)
                </h3>
                <p className="text-xs text-[#5a6861] mb-4">
                  බොත්තම් සහ භාණ්ඩ කාඩ්පත්වල කොන් වටකුරු වන ප්‍රමාණය තෝරන්න:
                </p>

                {/* Button Radius */}
                <div className="space-y-3 pb-5 border-b border-[#f0ebe1]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#192d2a]">
                      Button Corner Radius (බොත්තම් හැඩය)
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
                        onClick={() => updateKey("custom:buttons:radius", opt.value)}
                        className={`py-2 px-3 text-xs font-bold border transition text-center cursor-pointer ${
                          (content["custom:buttons:radius"] || "25") === opt.value
                            ? "border-[#017d6e] bg-[#e0f2eb] text-[#017d6e]"
                            : "border-[#e8e4dc] text-[#5a6861] hover:bg-[#faf8f2]"
                        }`}
                        style={{ borderRadius: `${opt.value}px` }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Radius */}
                <div className="space-y-3 pt-2 pb-5 border-b border-[#f0ebe1]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#192d2a]">
                      Product Card Radius (කාඩ්පත් කොන්)
                    </label>
                    <span className="text-xs font-mono text-[#017d6e] font-bold">
                      {cardRadius}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Minimal (0px)", value: "0" },
                      { label: "Rounded (16px)", value: "16" },
                      { label: "Soft (24px)", value: "24" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateKey("custom:card:radius", opt.value)}
                        className={`py-2.5 px-3 text-xs font-bold border transition text-center cursor-pointer ${
                          (content["custom:card:radius"] || "16") === opt.value
                            ? "border-[#017d6e] bg-[#e0f2eb] text-[#017d6e]"
                            : "border-[#e8e4dc] text-[#5a6861] hover:bg-[#faf8f2]"
                        }`}
                        style={{ borderRadius: `${opt.value}px` }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navbar Layout */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-[#192d2a] block">
                    Header Layout (ඉහළ තීරුවේ සැකසුම)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Logo Left", value: "left" },
                      { label: "Logo Center", value: "center" },
                      { label: "Floating Bar", value: "floating" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateKey("layout:navbar", opt.value)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                          (content["layout:navbar"] || "left") === opt.value
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
            </div>
          )}

          {/* TAB 4: SECTIONS & VISIBILITY */}
          {activeTab === "visibility" && (
            <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-extrabold text-[#192d2a]">
                Storefront Sections Visibility (කොටස් පෙන්වීම/සැඟවීම)
              </h3>
              <p className="text-xs text-[#5a6861] mb-2">
                මුල් පිටුවේ Hero section එකෙහි පෙන්විය යුතු කොටස් තෝරන්න:
              </p>

              {[
                { key: "visibility:hero:title", label: "Main Hero Heading", desc: "මුල් පිටුවේ ප්‍රධාන ශීර්ෂ පාඨය", isShown: showHeroText },
                { key: "visibility:hero:description", label: "Hero Description", desc: "වෙළඳසැල් විස්තරය", isShown: showHeroDesc },
                { key: "visibility:hero:button", label: "Shop Collection Action Button", desc: "Shop Now / Browse බොත්තම", isShown: showActionButton },
                { key: "visibility:hero:content", label: "Main Promotion Card", desc: "ප්‍රධාන විශේෂ ප්‍රවර්ධන කාඩ්පත", isShown: showMainCard },
                { key: "visibility:hero:note", label: "Secondary Side Promotion", desc: "අමතර තොරතුරු / පැති කාඩ්පත", isShown: showSideCard },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-[#e8e4dc] bg-[#faf8f2]"
                >
                  <div>
                    <strong className="text-xs font-bold text-[#192d2a] block">
                      {item.label}
                    </strong>
                    <span className="text-[10px] text-[#6c7771]">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateKey(item.key, item.isShown ? "hidden" : "shown")}
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
        </div>

        {/* Real-Time Live Preview Column */}
        <div className="lg:col-span-7 sticky top-6">
          <div className="bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden shadow-sm">
            {/* Preview Toolbar */}
            <div className="bg-[#faf8f2] border-b border-[#e8e4dc] px-4 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ded9ce]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6a7872] ml-1.5">
                  Live Simulated Storefront
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
              <div
                className="rounded-2xl border border-[#ded8cb] overflow-hidden shadow-xs bg-white text-[#192d2a]"
              >
                {/* Simulated Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b transition-colors"
                  style={{ backgroundColor: navbarBg, color: navbarColor }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-black block leading-none">
                        {shop.name}
                      </strong>
                      <span className="text-[9px] opacity-75 font-medium">Official Store</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                      style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Cart (1)</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Hero Section */}
                {showHeroText && (
                  <div className="p-4 sm:p-6 bg-gradient-to-b from-[#f9f7f2] to-white border-b border-[#f0ebe1] text-center space-y-2">
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      Official Online Store • Sri Lanka
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-[#192d2a] leading-tight">
                      Elevate Your Everyday
                    </h4>
                    {showHeroDesc && (
                      <p className="text-[11px] text-[#5a6861] max-w-sm mx-auto line-clamp-2">
                        {shop.description || "Quality products across every category delivered to your doorstep."}
                      </p>
                    )}
                    {showActionButton && (
                      <div className="pt-1">
                        <span
                          className="inline-block px-4 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                          style={{
                            backgroundColor: primaryColor,
                            color: buttonTextColor,
                            borderRadius: buttonRadius,
                          }}
                        >
                          Shop Collection &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated Category Pills */}
                <div className="px-4 py-2.5 bg-white border-b border-[#f0ebe1] flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold">
                  <span
                    className="px-2.5 py-1 rounded-full text-white shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    All Items
                  </span>
                  {(categories.length > 0 ? categories : [{ name: "Electronics" }, { name: "Fashion" }, { name: "Beauty" }]).slice(0, 4).map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-[#f0ebe1] text-[#5a6861] shrink-0"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>

                {/* Simulated Products Grid */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#192d2a]">
                    <span>Featured Catalog</span>
                    <span className="text-[10px] text-[#6c7771]">4 items</span>
                  </div>

                  <div
                    className={`grid gap-3 ${
                      previewViewport === "mobile" ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {previewProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 border transition shadow-2xs flex flex-col justify-between"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: cardBorder,
                          borderRadius: cardRadius,
                          color: cardColor,
                        }}
                      >
                        <div className="space-y-1.5">
                          <div className="w-full h-20 rounded-xl bg-[#f0ebe1] flex items-center justify-center text-[#75847e]">
                            <ShoppingBag className="w-6 h-6 opacity-40" />
                          </div>
                          <span className="text-[9px] font-bold text-[#017d6e] uppercase tracking-wider block">
                            {p.category?.name || "Store Pick"}
                          </span>
                          <strong className="text-xs font-bold block truncate">
                            {p.name}
                          </strong>
                          <div className="flex items-baseline gap-1.5 text-xs font-black">
                            <span style={{ color: primaryColor }}>
                              LKR {Number(p.price).toLocaleString()}
                            </span>
                            {p.compare_at_price && (
                              <del className="text-[10px] font-normal text-[#9ca3af]">
                                LKR {Number(p.compare_at_price).toLocaleString()}
                              </del>
                            )}
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-black/5 flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-[#6c7771]">
                            In Stock
                          </span>
                          <span
                            className="px-2.5 py-1 text-[10px] font-bold shadow-2xs cursor-pointer"
                            style={{
                              backgroundColor: primaryColor,
                              color: buttonTextColor,
                              borderRadius: buttonRadius,
                            }}
                          >
                            + Add to Bag
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated WhatsApp Footer */}
                <div className="p-3 bg-[#faf8f2] border-t border-[#f0ebe1] flex items-center justify-between text-[11px]">
                  <span className="text-[#6c7771] font-semibold">Questions? Chat directly</span>
                  <span
                    className="px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: "#25D366",
                      color: "#ffffff",
                      borderRadius: buttonRadius,
                    }}
                  >
                    WhatsApp Order
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
