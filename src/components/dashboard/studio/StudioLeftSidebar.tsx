"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  LayoutTemplate,
  FileText,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  MousePointerClick,
  Store,
  Gem,
  Tag,
  ArrowRight,
  Grid,
  Columns,
  Square,
  HelpCircle,
  FolderOpen,
  Megaphone,
  Layout,
  LayoutGrid,
  Shapes,
  MessageCircle,
  GripVertical,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";

interface StudioLeftSidebarProps {
  sidebarTab: "layouts" | "pages";
  setSidebarTab: (t: "layouts" | "pages") => void;
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  onResetToThemeDefaults: (id: string) => void;
  onSelectPalette: (preset: any) => void;
  selectedElementId: string;
  onSelectElement: (id: string) => void;
  shopSlug: string;
  baseThemes: any[];
  colorPresets: any[];
  sectionsOrder?: string[];
  onMoveSection?: (idx: number, dir: "up" | "down") => void;
  onReorderSections?: (fromIndex: number, toIndex: number) => void;
  onToggleSection?: (id: string) => void;
  content?: Record<string, string>;
}

const DEFAULT_SECTIONS = [
  { id: "announcement", name: "Announcement Bar", icon: Megaphone },
  { id: "navbar", name: "Header & Nav", icon: Layout },
  { id: "hero", name: "Hero Banner", icon: ImageIcon },
  { id: "categories", name: "Categories Grid", icon: LayoutGrid },
  { id: "products", name: "Products Catalog", icon: Shapes },
  { id: "promos", name: "Promo Deals", icon: Tag },
  { id: "benefits", name: "Trust Badges", icon: Store },
  { id: "reviews", name: "Customer Reviews", icon: Sparkles },
  { id: "contact", name: "Contact & WhatsApp", icon: MessageCircle },
  { id: "footer", name: "Store Footer", icon: HelpCircle },
];

export function StudioLeftSidebar({
  sidebarTab,
  setSidebarTab,
  selectedThemeId,
  onSelectTheme,
  onResetToThemeDefaults,
  onSelectPalette,
  selectedElementId,
  onSelectElement,
  shopSlug,
  baseThemes,
  colorPresets,
  sectionsOrder,
  onMoveSection,
  onReorderSections,
  onToggleSection,
  content = {},
}: StudioLeftSidebarProps) {
  // Collapsible accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sections: true,
    favourites: true,
    basic: false,
    themes: true,
    palettes: false,
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleAccordion = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Build ordered list of sections
  const activeOrder = sectionsOrder && sectionsOrder.length > 0
    ? sectionsOrder
    : DEFAULT_SECTIONS.map((s) => s.id);

  const resolvedSections = activeOrder.map((secId) => {
    const existing = DEFAULT_SECTIONS.find(
      (s) =>
        s.id === secId ||
        (secId === "featured_products" && s.id === "products") ||
        (secId === "deals_banner" && s.id === "promos") ||
        (secId === "delivery_info" && s.id === "benefits") ||
        (secId === "brand_story" && s.id === "hero")
    );
    if (existing) {
      return { ...existing, id: secId };
    }
    return {
      id: secId,
      name: secId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: Layers,
    };
  });

  return (
    <aside className="w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* TWO TOP TABS: Layouts vs Pages */}
      <div className="p-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setSidebarTab("layouts")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
              sidebarTab === "layouts"
                ? "bg-white text-zinc-900 shadow-2xs font-black"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Layouts
          </button>
          <Link
            href="/dashboard/themes"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-zinc-500 hover:text-emerald-700 hover:bg-white text-center flex items-center justify-center gap-1"
            title="Themes Simple Customizer"
          >
            <Palette className="w-3 h-3 text-emerald-600" />
            <span>Themes</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarTab("pages")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
              sidebarTab === "pages"
                ? "bg-white text-zinc-900 shadow-2xs font-black"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Pages
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {sidebarTab === "layouts" ? (
          <>
            {/* 1. STORE SECTIONS LIST (All Sections Separately Displayed & Selectable) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => toggleAccordion("sections")}
                className="w-full flex items-center justify-between text-xs font-black text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Store Sections ({resolvedSections.length})</span>
                </div>
                {openSections.sections ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {openSections.sections && (
                <div className="space-y-1">
                  {resolvedSections.map((sec, idx) => {
                    const Icon = sec.icon;
                    const isHidden = content[`visibility:section:${sec.id}`] === "hidden";
                    const isSelected =
                      selectedElementId === sec.id ||
                      (sec.id === "hero" &&
                        ["hero_cta", "hero_sec", "hero_title", "hero_desc", "hero_image", "hero_eyebrow", "hero"].includes(selectedElementId)) ||
                      ((sec.id === "products" || sec.id === "featured_products") &&
                        ["product_card", "products", "featured_products"].includes(selectedElementId)) ||
                      ((sec.id === "navbar" || sec.id === "branding") &&
                        ["branding", "navbar"].includes(selectedElementId)) ||
                      ((sec.id === "promos" || sec.id === "deals_banner") &&
                        ["promos", "deals_banner"].includes(selectedElementId)) ||
                      ((sec.id === "benefits" || sec.id === "delivery_info") &&
                        ["benefits", "delivery_info"].includes(selectedElementId)) ||
                      ((sec.id === "contact" || sec.id === "whatsapp_bar") &&
                        ["contact", "whatsapp_bar"].includes(selectedElementId));

                    return (
                      <div
                        key={sec.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(idx));
                          setDraggedIndex(idx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = Number(e.dataTransfer.getData("text/plain"));
                          if (!isNaN(from) && from !== idx && onReorderSections) {
                            onReorderSections(from, idx);
                          }
                          setDraggedIndex(null);
                        }}
                        onClick={() => onSelectElement(sec.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 text-blue-900 shadow-2xs ring-1 ring-blue-500/40"
                            : isHidden
                            ? "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                            : "bg-white border-[#e2e8f0] text-zinc-700 hover:bg-[#f8fafc] hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span title="Drag to reorder" className="inline-flex cursor-grab">
                            <GripVertical className="w-3 h-3 text-zinc-400 hover:text-black shrink-0" />
                          </span>
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? "text-blue-600 font-bold" : "text-zinc-400"
                            }`}
                          />
                          <div className="truncate flex flex-col leading-tight">
                            <span className="truncate text-[11px] font-bold">{sec.name}</span>
                            </div>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {onMoveSection && (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => onMoveSection(idx, "up")}
                                className="p-0.5 rounded text-zinc-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === resolvedSections.length - 1}
                                onClick={() => onMoveSection(idx, "down")}
                                className="p-0.5 rounded text-zinc-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {onToggleSection && (
                            <button
                              type="button"
                              onClick={() => onToggleSection(sec.id)}
                              className={`p-0.5 rounded cursor-pointer ${
                                isHidden ? "text-amber-500" : "text-zinc-400 hover:text-black"
                              }`}
                              title={isHidden ? "Show Section" : "Hide Section"}
                            >
                              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <Link
                      href="/dashboard/themes"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-emerald-200 shadow-2xs"
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Open Simple Themes Manager</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. FAVOURITES QUICK CARDS */}
            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => toggleAccordion("favourites")}
                className="w-full flex items-center justify-between text-xs font-black text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
              >
                <span>Favourites</span>
                {openSections.favourites ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {openSections.favourites && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "hero",
                      name: "Hero Banner",
                      icon: (
                        <div className="w-full h-8 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded flex items-center justify-center">
                          <span className="w-8 h-1.5 bg-blue-300 rounded" />
                        </div>
                      ),
                    },
                    {
                      id: "announcement",
                      name: "Announcement",
                      icon: (
                        <div className="w-full h-8 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded flex flex-col justify-end p-1">
                          <span className="w-full h-1 bg-amber-400 rounded" />
                        </div>
                      ),
                    },
                    {
                      id: "products",
                      name: "Products Grid",
                      icon: (
                        <div className="w-full h-8 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded p-1 flex gap-1">
                          <span className="w-3 h-full bg-zinc-200 rounded-xs" />
                          <span className="flex-1 space-y-0.5">
                            <span className="block w-full h-1 bg-zinc-300 rounded" />
                            <span className="block w-3/4 h-1 bg-zinc-200 rounded" />
                          </span>
                        </div>
                      ),
                    },
                    {
                      id: "footer",
                      name: "Store Footer",
                      icon: (
                        <div className="w-full h-8 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded flex flex-col justify-end p-1">
                          <span className="w-full h-2 bg-zinc-400 rounded" />
                        </div>
                      ),
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectElement(item.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                        selectedElementId === item.id
                          ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafafa]"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[11px] font-bold text-zinc-700 truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. BASIC COMPONENTS */}
            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => toggleAccordion("basic")}
                className="w-full flex items-center justify-between text-xs font-black text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
              >
                <span>Basic Elements</span>
                {openSections.basic ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {openSections.basic && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "hero",
                      name: "Banner Section",
                      icon: (
                        <div className="w-full h-8 border border-blue-200 rounded bg-blue-50/50 flex flex-col justify-around p-0.5">
                          <span className="h-1 bg-blue-200 rounded" />
                          <span className="h-1 bg-blue-200 rounded" />
                        </div>
                      ),
                    },
                    {
                      id: "products",
                      name: "Catalog Container",
                      icon: (
                        <div className="w-full h-8 border border-zinc-200 rounded flex items-center justify-center p-1">
                          <span className="w-full h-full border border-blue-400 rounded-xs bg-blue-50/20" />
                        </div>
                      ),
                    },
                    {
                      id: "categories",
                      name: "Category Grid",
                      icon: (
                        <div className="w-full h-8 border border-zinc-200 rounded p-1 grid grid-cols-2 gap-1">
                          <span className="bg-zinc-200 rounded-xs" />
                          <span className="bg-zinc-200 rounded-xs" />
                          <span className="bg-zinc-200 rounded-xs" />
                          <span className="bg-zinc-200 rounded-xs" />
                        </div>
                      ),
                    },
                    {
                      id: "benefits",
                      name: "Feature Columns",
                      icon: (
                        <div className="w-full h-8 border border-zinc-200 rounded p-1 flex gap-1">
                          <span className="flex-1 bg-zinc-200 rounded-xs" />
                          <span className="flex-1 bg-zinc-200 rounded-xs" />
                        </div>
                      ),
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectElement(item.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                        selectedElementId === item.id
                          ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafafa]"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[11px] font-bold text-zinc-700 truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. BASE THEMES */}
            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => toggleAccordion("themes")}
                className="w-full flex items-center justify-between text-xs font-black text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kadeo Themes ({baseThemes.length})</span>
                </div>
                {openSections.themes ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {openSections.themes && (
                <div className="space-y-2">
                  {baseThemes.map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer text-left space-y-1.5 ${
                          isSelected
                            ? "bg-blue-50/40 border-blue-600 shadow-2xs"
                            : "bg-white border-[#e2e8f0] hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-black text-zinc-900">
                            {theme.name}
                          </strong>
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-zinc-400">
                              {theme.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">
                          {theme.description}
                        </p>
                        {isSelected && (
                          <div className="pt-1 flex items-center justify-between border-t border-blue-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onResetToThemeDefaults(theme.id);
                              }}
                              className="text-[10px] font-bold text-zinc-500 hover:text-black flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Reset defaults</span>
                            </button>
                            <span className="text-[9px] font-mono text-blue-600">
                              Synced
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. COLOR PALETTES */}
            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => toggleAccordion("palettes")}
                className="w-full flex items-center justify-between text-xs font-black text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Color Palettes ({colorPresets.length})</span>
                </div>
                {openSections.palettes ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {openSections.palettes && (
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPalette(preset)}
                      className="p-2 rounded-xl border border-[#e2e8f0] bg-white hover:border-zinc-300 text-left transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: preset.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: preset.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-zinc-200" style={{ backgroundColor: preset.navbarBg }} />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-800 block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* PAGES TAB CONTENT */
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block px-1">
              Storefront Pages
            </span>
            {[
              { id: "home", name: "Landing Page / Home", active: true },
              { id: "about", name: "About Us & Story", active: false },
              { id: "contact", name: "Contact & WhatsApp", active: false },
              { id: "track", name: "Order Tracking", active: false },
              { id: "policies", name: "Store Policies Modal", active: false },
            ].map((page) => (
              <div
                key={page.id}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                  page.active
                    ? "bg-blue-50/50 border-blue-500 text-blue-900"
                    : "bg-white border-[#e2e8f0] text-zinc-600 hover:bg-[#fafafa]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className={`w-3.5 h-3.5 ${page.active ? "text-blue-600" : "text-zinc-400"}`} />
                  <span>{page.name}</span>
                </div>
                {page.active && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
