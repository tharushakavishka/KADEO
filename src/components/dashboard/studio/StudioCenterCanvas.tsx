"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MousePointerClick,
  ArrowRight,
  Type,
  Tag,
  Megaphone,
  LayoutGrid,
  Palette,
  Image as ImageIcon,
  MessageCircle,
  Hand,
  Store,
  Sparkles,
  HelpCircle,
  Layout,
  Shapes,
} from "lucide-react";

interface StudioCenterCanvasProps {
  viewport: "desktop" | "tablet" | "mobile";
  zoom: number;
  studioMode: "view" | "edit";
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  children: React.ReactNode;
}

interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetElement(container: HTMLElement, id: string): HTMLElement | null {
  if (!id) return null;

  // 1. Exact data-studio-element match (highest precision for text/buttons)
  let el = container.querySelector<HTMLElement>(`[data-studio-element="${id}"]`);
  if (el) return el;

  // 2. Exact data-studio-section match (for sections)
  el = container.querySelector<HTMLElement>(`[data-studio-section="${id}"]`);
  if (el) return el;

  // 3. Fallbacks and aliases
  const aliasMap: Record<string, string[]> = {
    hero: ['[data-studio-section="hero"]', '[data-studio-element="hero_image"]', 'section[class*="hero"]', '[data-editor-image="banner_url"]'],
    hero_image: ['[data-studio-element="hero_image"]', 'section[class*="hero"]'],
    hero_cta: ['[data-studio-element="hero_cta"]', 'button[class*="primary"]', '[data-style-part="buttons"]'],
    hero_sec: ['[data-studio-element="hero_sec"]', 'button[class*="secondary"]', 'a[class*="secondary"]'],
    hero_title: ['[data-studio-element="hero_title"]', 'h1', '[id*="title"]', '[class*="heroTitle"]'],
    hero_desc: ['[data-studio-element="hero_desc"]', '[class*="heroContent"] p', 'section[class*="hero"] p', '[class*="heroDesc"]', 'p'],
    hero_eyebrow: ['[data-studio-element="hero_eyebrow"]', '[class*="eyebrow"]', '[class*="tagline"]'],
    announcement: ['[data-studio-section="announcement"]', '[data-studio-element="announcement"]', '[class*="announcement"]', 'aside[aria-label*="announcement"]'],
    navbar: ['[data-studio-section="navbar"]', 'header', 'nav', '[data-studio-element="branding"]'],
    branding: ['[data-studio-section="navbar"]', 'header', '[data-studio-element="branding"]'],
    categories: ['[data-studio-section="categories"]', '[class*="categories"]', 'section[aria-label*="category"]', 'section[aria-label*="Category"]'],
    products: ['[data-studio-section="products"]', '#retail-products', '#custom-builder-products', '[class*="catalog"]'],
    featured_products: ['[data-studio-section="products"]', '#retail-products', '#custom-builder-products', '[class*="catalog"]'],
    product_card: ['[data-studio-element="product_card"]', 'article', '[class*="product"]'],
    promos: ['[data-studio-section="promos"]', '[class*="promos"]', 'section[aria-label*="highlight"]', 'section[aria-label*="Highlights"]'],
    deals_banner: ['[data-studio-section="promos"]', '[class*="promos"]'],
    benefits: ['[data-studio-section="benefits"]', '[class*="benefits"]', 'section[aria-label*="Shopping"]', 'section[aria-label*="Guarantees"]'],
    delivery_info: ['[data-studio-section="benefits"]', '[class*="benefits"]'],
    reviews: ['[data-studio-section="reviews"]', '[class*="reviews"]', 'section[aria-label*="Reviews"]'],
    brand_story: ['[data-studio-section="brand_story"]', 'section[class*="personal"]'],
    contact: ['[data-studio-section="contact"]', '[class*="contact"]', 'section[aria-label*="Contact"]', 'section[class*="personal"]'],
    whatsapp_bar: ['[data-studio-element="whatsapp_bar"]', '[class*="mobileBar"]'],
    footer: ['[data-studio-section="footer"]', 'footer', '[class*="footer"]'],
  };

  const selectors = aliasMap[id] || [`#${id}`, `.${id}`];
  for (const sel of selectors) {
    try {
      const found = container.querySelector<HTMLElement>(sel);
      if (found) return found;
    } catch {}
  }
  return null;
}

export function StudioCenterCanvas({
  viewport,
  zoom,
  studioMode,
  selectedElementId,
  setSelectedElementId,
  children,
}: StudioCenterCanvasProps) {
  const canvasOuterRef = useRef<HTMLDivElement>(null);
  const canvasInnerRef = useRef<HTMLDivElement>(null);

  // Pan / Drag Navigation States
  const [isPanMode, setIsPanMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Dynamic Bounding Box state
  const [boxRect, setBoxRect] = useState<BoxRect | null>(null);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsDragging(false);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Update dynamic bounding box coordinates based on actual DOM element
  const updateBoundingBox = useCallback(() => {
    if (!selectedElementId || typeof window === "undefined") {
      setBoxRect(null);
      return;
    }
    const container = canvasInnerRef.current;
    if (!container) {
      setBoxRect(null);
      return;
    }

    const targetEl = getTargetElement(container, selectedElementId);
    if (!targetEl) {
      setBoxRect(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elRect = targetEl.getBoundingClientRect();
    const scale = (zoom || 100) / 100;

    const top = (elRect.top - containerRect.top) / scale + container.scrollTop;
    const left = (elRect.left - containerRect.left) / scale + container.scrollLeft;
    const width = elRect.width / scale;
    const height = elRect.height / scale;

    setBoxRect({
      top: Math.max(0, top),
      left: Math.max(0, left),
      width: Math.max(20, width),
      height: Math.max(20, height),
    });
  }, [selectedElementId, zoom]);

  // Smooth scroll and auto-align when selected element changes
  useEffect(() => {
    if (!selectedElementId || typeof window === "undefined") return;
    const container = canvasInnerRef.current;
    if (!container) return;

    const targetEl = getTargetElement(container, selectedElementId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    updateBoundingBox();
    const timer = setTimeout(updateBoundingBox, 250);
    return () => clearTimeout(timer);
  }, [selectedElementId, updateBoundingBox]);

  // Track scroll and window resize to keep box locked to the element
  useEffect(() => {
    const container = canvasInnerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateBoundingBox();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateBoundingBox);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateBoundingBox);
    };
  }, [updateBoundingBox]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || isSpacePressed || e.button === 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: canvasOuterRef.current?.scrollLeft || 0,
        scrollTop: canvasOuterRef.current?.scrollTop || 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasOuterRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    canvasOuterRef.current.scrollLeft = dragStart.scrollLeft - dx;
    canvasOuterRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const getSelectionBoxLabel = () => {
    switch (selectedElementId) {
      case "hero_cta":
        return "Button: Shop the collection";
      case "hero_sec":
        return "Button: Secondary Action";
      case "hero_title":
        return "Text: Hero Title";
      case "hero_desc":
        return "Text: Hero Subtitle";
      case "hero_image":
      case "hero":
        return "Hero Banner";
      case "hero_eyebrow":
        return "Badge: Promo Eyebrow";
      case "announcement":
        return "Text: Announcement";
      case "whatsapp_bar":
        return "WhatsApp Bar";
      case "branding":
      case "navbar":
        return "Header & Nav";
      case "categories":
        return "Categories Grid";
      case "products":
      case "featured_products":
        return "Products Catalog";
      case "product_card":
        return "Product Card";
      case "promos":
      case "deals_banner":
        return "Promo Deals";
      case "benefits":
      case "delivery_info":
        return "Trust Badges";
      case "reviews":
        return "Customer Reviews";
      case "brand_story":
        return "Brand Story";
      case "contact":
        return "Contact & WhatsApp";
      case "footer":
        return "Store Footer";
      default:
        return selectedElementId.replace(/_/g, " ").toUpperCase();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanMode || isSpacePressed) {
      e.preventDefault();
      return;
    }
    if (studioMode !== "edit") return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Prevent navigation in editor
    e.preventDefault();
    e.stopPropagation();

    // 1. Direct explicit element check via data-studio-element (Highest precision)
    const explicitEl = target.closest<HTMLElement>("[data-studio-element]");
    if (explicitEl?.dataset.studioElement) {
      setSelectedElementId(explicitEl.dataset.studioElement);
      return;
    }

    // 2. Click inside Hero Section - detect specific text / CTA elements accurately
    const heroSection = target.closest<HTMLElement>('[data-studio-section="hero"], section[class*="hero"], [data-editor-image]');
    if (heroSection) {
      if (target.closest('button, [data-style-part="buttons"], a[class*="primary"], a[href*="products"]')) {
        setSelectedElementId("hero_cta");
        return;
      }
      if (target.closest('h1, h2, [id*="hero-title"], [class*="heroTitle"], [class*="title"]')) {
        setSelectedElementId("hero_title");
        return;
      }
      if (target.closest('[class*="eyebrow"], [class*="tagline"], [class*="badge"], span[class*="text-xs"]')) {
        setSelectedElementId("hero_eyebrow");
        return;
      }
      if (target.closest('p, [class*="heroDesc"], [class*="description"]')) {
        setSelectedElementId("hero_desc");
        return;
      }
      setSelectedElementId("hero");
      return;
    }

    // 3. Direct section check via data-studio-section
    const secEl = target.closest<HTMLElement>("[data-studio-section]");
    if (secEl?.dataset.studioSection) {
      setSelectedElementId(secEl.dataset.studioSection);
      return;
    }

    // 4. Semantic element fallbacks
    if (target.closest("header, nav")) {
      setSelectedElementId("navbar");
      return;
    }
    if (target.closest("footer")) {
      setSelectedElementId("footer");
      return;
    }
    if (target.closest('[class*="categories"], section[aria-label*="category"], section[aria-label*="Category"]')) {
      setSelectedElementId("categories");
      return;
    }
    if (target.closest('#retail-products, #custom-builder-products, [class*="catalog"]')) {
      setSelectedElementId("products");
      return;
    }
    if (target.closest('[class*="promos"], section[aria-label*="highlight"], section[aria-label*="Highlights"]')) {
      setSelectedElementId("promos");
      return;
    }
    if (target.closest('[class*="benefits"], section[aria-label*="Shopping"], section[aria-label*="Guarantees"]')) {
      setSelectedElementId("benefits");
      return;
    }
    if (target.closest('[class*="reviews"], section[aria-label*="Reviews"]')) {
      setSelectedElementId("reviews");
      return;
    }
    if (target.closest('[class*="contact"], section[aria-label*="Contact"], section[class*="personal"]')) {
      setSelectedElementId("contact");
      return;
    }

    setSelectedElementId("hero");
  };

  const isPanActive = isPanMode || isSpacePressed;

  // ALL 10 STORE SECTIONS FOR QUICK SELECTOR
  const QUICK_SECTIONS = [
    { id: "announcement", label: "Bar", icon: Megaphone },
    { id: "navbar", label: "Header", icon: Layout },
    { id: "hero", label: "Hero", icon: ImageIcon },
    { id: "categories", label: "Categories", icon: LayoutGrid },
    { id: "products", label: "Products", icon: Shapes },
    { id: "promos", label: "Promos", icon: Tag },
    { id: "benefits", label: "Trust", icon: Store },
    { id: "reviews", label: "Reviews", icon: Sparkles },
    { id: "contact", label: "Contact", icon: MessageCircle },
    { id: "footer", label: "Footer", icon: HelpCircle },
  ];

  return (
    <main className="flex-1 bg-[#eaedf0] overflow-hidden flex flex-col relative select-none">
      {/* QUICK ELEMENT / SECTION SELECTOR BAR */}
      {studioMode === "edit" && (
        <div className="bg-white/95 backdrop-blur-xs border-b border-[#e2e8f0] px-3 py-1 flex items-center justify-between gap-2 overflow-x-auto shrink-0 z-20">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping shrink-0" />
            <span className="text-[10px] font-bold text-slate-500">
              Select Section:
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Pan Mode Tool Button */}
            <button
              type="button"
              onClick={() => setIsPanMode(!isPanMode)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                isPanMode
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "bg-[#f1f5f9] text-zinc-600 hover:bg-zinc-200"
              }`}
              title="Pan Canvas (or hold Spacebar)"
            >
              <Hand className="w-3 h-3" />
              <span>{isPanMode ? "Panning" : "Pan"}</span>
            </button>

            {QUICK_SECTIONS.map((el) => {
              const Icon = el.icon;
              const isElActive =
                selectedElementId === el.id ||
                (el.id === "hero" && ["hero_cta", "hero_sec", "hero_title", "hero_desc", "hero_image", "hero_eyebrow", "hero"].includes(selectedElementId)) ||
                (el.id === "products" && ["product_card", "products", "featured_products"].includes(selectedElementId)) ||
                (el.id === "navbar" && ["branding", "navbar"].includes(selectedElementId));

              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => {
                    setIsPanMode(false);
                    setSelectedElementId(el.id);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    isElActive
                      ? "bg-blue-600 text-white shadow-2xs font-black ring-1 ring-blue-500"
                      : "bg-[#f1f5f9] text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{el.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ZOOMABLE WORKSPACE CANVAS CONTAINER */}
      <div
        ref={canvasOuterRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        className={`flex-1 overflow-auto p-2 sm:p-4 flex items-start justify-center ${
          isDragging ? "cursor-grabbing" : isPanActive ? "cursor-grab" : ""
        }`}
      >
        <div
          ref={canvasInnerRef}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className={`transition-all duration-300 rounded-2xl border border-[#cbd5e1] shadow-xl bg-white relative shrink-0 ${
            viewport === "mobile"
              ? "w-[375px] max-w-[95vw] h-[720px]"
              : viewport === "tablet"
              ? "w-[768px] max-w-[95vw] h-[780px]"
              : "w-full max-w-[1240px] min-h-[680px] h-[calc(100vh-140px)]"
          } overflow-y-auto`}
        >
          {/* VISUAL SELECTION BOUNDING BOX OVERLAY (Pixel-perfect real element dimensions) */}
          {studioMode === "edit" && !isPanActive && boxRect && (
            <div
              data-studio-selection-overlay="true"
              style={{
                position: "absolute",
                top: `${boxRect.top}px`,
                left: `${boxRect.left}px`,
                width: `${Math.max(boxRect.width, 32)}px`,
                height: `${Math.max(boxRect.height, 24)}px`,
                pointerEvents: "none",
                zIndex: 35,
                transition: isDragging ? "none" : "all 0.15s ease-out",
              }}
            >
              <div className="relative w-full h-full border-2 border-blue-600 ring-4 ring-blue-500/20 rounded-lg">
                {/* 4 Corner Anchor Handles */}
                <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs" />
                <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs" />
                <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs" />

                {/* Dimension & Element Tag */}
                <div
                  data-studio-selection-badge="true"
                  className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5 whitespace-nowrap z-40 border border-blue-500"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{getSelectionBoxLabel()}</span>
                  <span className="opacity-90 font-mono text-[9px] bg-white/20 px-1 rounded">
                    {Math.round(boxRect.width)} × {Math.round(boxRect.height)} PX
                  </span>
                  {["hero_title", "hero_desc", "hero_eyebrow", "hero_cta", "hero_sec", "announcement"].includes(selectedElementId) && (
                    <span className="bg-amber-400 text-black text-[9px] font-black px-1 rounded ml-0.5">
                      ✎ Edit Text
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTUAL LIVE STOREFRONT RENDERER WITH CLICK-TO-INSPECT CAPTURE */}
          <div
            onClickCapture={handleCanvasClick}
            className={`min-h-full ${studioMode === "edit" && !isPanActive ? "cursor-pointer" : ""}`}
            title={studioMode === "edit" && !isPanActive ? "Click any section or text element to inspect & edit" : undefined}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
