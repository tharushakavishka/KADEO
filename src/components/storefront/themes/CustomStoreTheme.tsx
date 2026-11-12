"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Search,
  X,
  SlidersHorizontal,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  Package,
  Sparkles,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
} from "lucide-react";
import { StoreIcon } from "../StoreIcon";
import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";
import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl, normalizePhoneNumber } from "@/lib/phone";
import { StorePoliciesModal } from "../StorePoliciesModal";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  images?: { storage_path: string }[];
  category?: { name: string } | null;
}

interface ThemeProps {
  shop: {
    name: string;
    description: string | null;
    banner_url: string | null;
    whatsapp_number: string;
    address: string | null;
    slug?: string;
    logo_url?: string | null;
  };
  categories: { id: string; name: string; slug: string }[];
  products: ProductItem[];
}

const DEFAULT_SECTIONS_ORDER = [
  "announcement",
  "navbar",
  "hero",
  "categories",
  "products",
  "promos",
  "benefits",
  "reviews",
  "contact",
  "footer",
];

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85";

export function CustomStoreTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const cardStyle = customStyle(t, "card");
  const navbarStyle = customStyle(t, "navbar");
  const searchStyle = customStyle(t, "search");
  const buttonStyle = customStyle(t, "buttons");

  const heroTitleStyle: React.CSSProperties = {
    fontSize: t("element:hero_title:font_size") ? `${t("element:hero_title:font_size")}px` : undefined,
    color: t("element:hero_title:color") || undefined,
    fontFamily: t("element:hero_title:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_title:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_title:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_title:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_title:font_family") === "mono" ? "monospace"
      : t("element:hero_title:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
    textAlign: (t("element:hero_title:align") || t("element:hero_cta:align", "left")) as any,
  };

  const heroDescStyle: React.CSSProperties = {
    fontSize: t("element:hero_desc:font_size") ? `${t("element:hero_desc:font_size")}px` : undefined,
    color: t("element:hero_desc:color") || undefined,
    fontFamily: t("element:hero_desc:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_desc:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_desc:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_desc:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_desc:font_family") === "mono" ? "monospace"
      : t("element:hero_desc:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
    textAlign: (t("element:hero_desc:align") || t("element:hero_cta:align", "left")) as any,
  };

  const heroEyebrowStyle: React.CSSProperties = {
    fontSize: t("element:hero_eyebrow:font_size") ? `${t("element:hero_eyebrow:font_size")}px` : undefined,
    color: t("element:hero_eyebrow:color") || undefined,
    fontFamily: t("element:hero_eyebrow:font_family") === "sinhala_sans" ? "'Noto Sans Sinhala', var(--font-geist-sans), sans-serif"
      : t("element:hero_eyebrow:font_family") === "sinhala_display" ? "'Gemunu Libre', var(--font-geist-sans), sans-serif"
      : t("element:hero_eyebrow:font_family") === "sinhala_traditional" ? "'Iskoola Pota', 'Noto Sans Sinhala', serif"
      : t("element:hero_eyebrow:font_family") === "serif" ? "Playfair Display, Georgia, serif"
      : t("element:hero_eyebrow:font_family") === "mono" ? "monospace"
      : t("element:hero_eyebrow:font_family") === "rounded" ? "Outfit, sans-serif"
      : undefined,
    textAlign: (t("element:hero_eyebrow:align") || t("element:hero_cta:align", "left")) as any,
  };
  const { addItem, setIsOpen, totalCount } = useCart();

  // Search & Catalog state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [inStock, setInStock] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState<ProductItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);

  // Hero Slider state
  const [activeSlide, setActiveSlide] = useState(0);

  const wa = buildWhatsAppUrl(shop.whatsapp_number);
  const categoryNames = useMemo(
    () => [
      ...new Set([
        ...categories.map((c) => c.name),
        ...products.flatMap((p) => (p.category?.name ? [p.category.name] : [])),
      ]),
    ],
    [categories, products]
  );

  // Dynamic Layout & Modularity options
  const rawSectionsOrder = t("sections:order", "");
  const sectionsOrder = useMemo(() => {
    if (!rawSectionsOrder) return DEFAULT_SECTIONS_ORDER;
    const items = rawSectionsOrder
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    // Ensure all standard sections are represented
    const set = new Set(items);
    for (const d of DEFAULT_SECTIONS_ORDER) {
      if (!set.has(d)) items.push(d);
    }
    return items;
  }, [rawSectionsOrder]);

  const isSectionVisible = (id: string) => {
    const val = t(`visibility:section:${id}`, "shown");
    return val !== "hidden";
  };

  const heroVariant = t("layout:hero:variant", "slider"); // "slider" | "single_image" | "split_banner"
  const cardVariant = t("layout:card:variant", "stacked"); // "stacked" | "horizontal" | "overlay"

  // Slider slides
  const sliderImages = useMemo(() => {
    const imgs: string[] = [];
    if (shop.banner_url) imgs.push(shop.banner_url);
    for (let i = 1; i <= 6; i++) {
      const slide = t(`slider:slide:${i}`, "");
      if (slide && !imgs.includes(slide)) imgs.push(slide);
    }
    if (imgs.length === 0) imgs.push(DEFAULT_HERO_IMAGE);
    return imgs;
  }, [shop.banner_url, t]);

  useEffect(() => {
    if (heroVariant !== "slider" || sliderImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((curr) => (curr + 1) % sliderImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroVariant, sliderImages.length]);

  const filtered = useMemo(() => {
    return products
      .filter(
        (p) =>
          (category === "all" || p.category?.name === category) &&
          (!inStock || p.stock_quantity > 0) &&
          (!savedOnly || wishlist.includes(p.id)) &&
          `${p.name} ${p.description || ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        if (sort === "price-low") return Number(a.price) - Number(b.price);
        if (sort === "price-high") return Number(b.price) - Number(a.price);
        if (sort === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, category, inStock, savedOnly, wishlist, search, sort]);

  function browse(catName = "all") {
    setCategory(catName);
    setSavedOnly(false);
    const target = document.getElementById("custom-builder-products");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function reset() {
    setSearch("");
    setCategory("all");
    setInStock(false);
    setSavedOnly(false);
    setSort("featured");
  }

  function toggleWishlist(id: string) {
    setWishlist((old) =>
      old.includes(id) ? old.filter((v) => v !== id) : [...old, id]
    );
  }

  function handleAddToCart(p: ProductItem) {
    if (p.stock_quantity <= 0) return;
    addItem({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.images?.[0]?.storage_path,
      maxStock: p.stock_quantity,
    });
  }

  function renderProductVisual(p: ProductItem) {
    const url = p.images?.[0]?.storage_path;
    const hasImage = url && !brokenImages.includes(p.id);
    return hasImage ? (
      <img
        src={url}
        alt={p.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        onError={() => setBrokenImages((old) => [...old, p.id])}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
        <StoreIcon name="Package" size={32} strokeWidth={1.4} />
      </div>
    );
  }

  // Section Renderers
  function renderAnnouncementSection() {
    if (!isSectionVisible("announcement")) return null;
    return (
      <aside
        key="announcement" data-studio-section="announcement"
        aria-label="Store announcement"
        className="bg-[#0e2a22] text-[#2ec49c] py-2 px-4 text-xs font-semibold tracking-wide border-b border-[#174c42]"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#2ec49c]" />
            <span>
              {t(
                "announcement:text",
                "දිවයින පුරා ආරක්ෂිතව බෙදාහැරීම · Islandwide Delivery"
              )}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span>{t("announcement:sub", "100% Genuine & Hand-picked")}</span>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#2ec49c] hover:underline"
            >
              <span>{t("announcement:cta", "WhatsApp Chat")}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  function renderNavbarSection() {
    if (!isSectionVisible("navbar")) return null;
    return (
      <header
        key="navbar" data-studio-section="navbar"
        data-style-part="navbar"
        style={navbarStyle}
        className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e4dc] transition-all shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand */}
          <Link
            href={`/shop/${shop.slug || ""}`}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-10 h-10 object-contain rounded-xl border border-stone-200 bg-white p-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#017d6e] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div>
              <strong className="block text-base sm:text-lg font-black text-[#192d2a] leading-tight tracking-tight">
                {shop.name}
              </strong>
              <small className="block text-[10px] font-extrabold uppercase tracking-wider text-[#017d6e]">
                {t("navbar:tagline", "Official Store")}
              </small>
            </div>
          </Link>

          {/* Search Box */}
          <div
            data-style-part="search"
            style={searchStyle}
            className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs focus-within:border-[#017d6e] transition"
          >
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              aria-label="Search products"
              placeholder={t(
                "navbar:search_placeholder",
                "Search in store (භාණ්ඩ සොයන්න)..."
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs text-[#192d2a] outline-none bg-transparent placeholder:text-stone-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setSavedOnly(!savedOnly);
                browse(category);
              }}
              aria-label="Saved Wishlist"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                savedOnly
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-white border border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  savedOnly ? "fill-rose-500 text-rose-500" : "text-stone-500"
                }`}
              />
              <span className="hidden sm:inline">
                {wishlist.length > 0 ? `Saved (${wishlist.length})` : "Saved"}
              </span>
            </button>

            <button
              type="button"
              data-style-part="buttons"
              style={buttonStyle}
              onClick={() => setIsOpen(true)}
              aria-label={`Shopping Cart ${totalCount} items`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#017d6e] text-white text-xs font-black shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t("navbar:cart_label", "Bag")}</span>
              <span className="w-5 h-5 rounded-full bg-white text-[#017d6e] flex items-center justify-center text-[10px] font-black">
                {totalCount}
              </span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  function renderHeroSection() {
    if (!isSectionVisible("hero")) return null;
    const hasCustomHeroText = t("visibility:hero:title", "shown") !== "hidden" && t("visibility:hero:content", "shown") !== "hidden";

    if (heroVariant === "single_image") {
      return (
        <section
          key="hero" data-studio-section="hero"
          data-editor-image="banner_url"
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6"
        >
          <div className="relative rounded-3xl overflow-hidden border border-[#e8e4dc] aspect-21/9 max-h-[460px] shadow-sm">
            <img
              src={shop.banner_url || DEFAULT_HERO_IMAGE}
              alt={shop.name}
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
            {hasCustomHeroText && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <span data-studio-element="hero_eyebrow" style={heroEyebrowStyle} className="text-xs font-bold uppercase tracking-widest text-[#2ec49c] mb-1">
                {t("hero:tagline", "Special Storefront Feature")}
              </span>
              <h1 data-studio-element="hero_title" style={heroTitleStyle} className="text-2xl sm:text-4xl font-black tracking-tight max-w-xl">
                {shop.name}
              </h1>
              {shop.description && (
                <p data-studio-element="hero_desc" style={heroDescStyle} className="text-xs sm:text-sm text-stone-200 mt-2 max-w-lg line-clamp-2">
                  {shop.description}
                </p>
              )}
            </div>
            )}
          </div>
        </section>
      );
    }

    if (heroVariant === "split_banner") {
      return (
        <section
          key="hero" data-studio-section="hero"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
        >
          <div className="bg-[#f5ede1] rounded-3xl border border-[#ded8cb] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
            <div className="space-y-4">
              <span data-studio-element="hero_eyebrow" style={heroEyebrowStyle} className="inline-block px-3 py-1 rounded-full bg-[#017d6e]/10 text-[#017d6e] text-xs font-black tracking-wider uppercase">
                {t("hero:eyebrow", "Curated Collection")}
              </span>
              <h1 data-studio-element="hero_title" style={heroTitleStyle} className="text-3xl sm:text-5xl font-black text-[#192d2a] tracking-tight leading-tight">
                {shop.name}
              </h1>
              <p data-studio-element="hero_desc" style={heroDescStyle} className="text-xs sm:text-sm text-[#5a6861] leading-relaxed max-w-md">
                {shop.description ||
                  t(
                    "hero:description",
                    "Welcome to our verified direct WhatsApp online shop. Browse our latest arrivals with instant ordering."
                  )}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  data-style-part="buttons"
                  style={buttonStyle}
                  data-studio-element="hero_cta"
                  onClick={() => browse()}
                  className="px-6 py-3 rounded-2xl bg-[#017d6e] text-white text-xs font-bold shadow-xs flex items-center gap-2 hover:opacity-95 transition"
                >
                  <span>{t("hero:cta", "Shop Collection")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white border border-[#ded8cb] text-[#192d2a] text-xs font-bold hover:bg-stone-50 transition flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t("hero:chat_cta", "Chat with Seller")}</span>
                </a>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-4/3 border border-[#ded8cb] shadow-sm">
              <img
                src={shop.banner_url || DEFAULT_HERO_IMAGE}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      );
    }

    // Default: Interactive Slider Carousel
    return (
      <section
        key="hero" data-studio-section="hero"
        data-editor-slider="true"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-6 select-none"
      >
        <div className="relative rounded-3xl overflow-hidden border border-[#e8e4dc] aspect-21/9 max-h-[460px] shadow-sm group">
          {sliderImages.map((imgUrl, idx) => (
            <div
              key={imgUrl + idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === activeSlide
                  ? "opacity-100 z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <img
                src={imgUrl}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover"
                fetchPriority={idx === 0 ? "high" : "low"}
              />
              {hasCustomHeroText && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                <span data-studio-element="hero_eyebrow" style={heroEyebrowStyle} className="text-[11px] font-extrabold uppercase tracking-widest text-[#2ec49c] mb-1">
                  {t("slider:eyebrow", "Explore Featured Picks")}
                </span>
                <h1 data-studio-element="hero_title" style={heroTitleStyle} className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight max-w-xl">
                  {shop.name}
                </h1>
                <p data-studio-element="hero_desc" style={heroDescStyle} className="text-xs sm:text-sm text-stone-200 mt-1 max-w-md line-clamp-2">
                  {shop.description ||
                    t(
                      "slider:sub",
                      "Order directly with real-time stock and instant WhatsApp confirmation."
                    )}
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    data-style-part="buttons"
                    style={buttonStyle}
                    data-studio-element="hero_cta"
                    onClick={() => browse()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#017d6e] text-white text-xs font-bold shadow-xs hover:opacity-90 transition"
                  >
                    <span>{t("slider:button", "View Products")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              )}
            </div>
          ))}

          {/* Slider Arrow Controls */}
          {sliderImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveSlide(
                    (curr) => (curr - 1 + sliderImages.length) % sliderImages.length
                  )
                }
                aria-label="Previous Slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSlide((curr) => (curr + 1) % sliderImages.length)
                }
                aria-label="Next Slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slider Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {sliderImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeSlide ? "w-6 bg-[#2ec49c]" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  function renderCategoriesSection() {
    if (!isSectionVisible("categories") || categoryNames.length === 0)
      return null;
    return (
      <section
        key="categories" data-studio-section="categories"
        aria-label="Browse by Category"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm sm:text-base font-black text-[#192d2a] tracking-tight">
            {t("categories:heading", "Shop by Category (කාණ්ඩ අනුව තෝරන්න)")}
          </h2>
          <button
            type="button"
            onClick={() => browse("all")}
            className="text-xs font-bold text-[#017d6e] hover:underline"
          >
            {t("categories:view_all", "View All")}
          </button>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => browse("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              category === "all"
                ? "bg-[#017d6e] text-white shadow-xs"
                : "bg-white border border-[#e8e4dc] text-[#192d2a] hover:border-[#cfc7ba]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Items</span>
          </button>
          {categoryNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => browse(name)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
                category === name
                  ? "bg-[#017d6e] text-white shadow-xs"
                  : "bg-white border border-[#e8e4dc] text-[#192d2a] hover:border-[#cfc7ba]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderProductsSection() {
    if (!isSectionVisible("products")) return null;
    return (
      <section
        key="products" data-studio-section="products"
        id="custom-builder-products"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e8e4dc] pb-4 mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#017d6e]">
              {savedOnly
                ? "Your Wishlist"
                : category !== "all"
                ? `Category · ${category}`
                : "Featured Catalog"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#192d2a] tracking-tight mt-0.5">
              {savedOnly
                ? "Saved Products"
                : category !== "all"
                ? category
                : t("products:heading", "Top Picks & New Arrivals")}
            </h2>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#ded8cb] text-xs font-semibold text-[#192d2a] cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-[#017d6e] focus:ring-[#017d6e]"
              />
              <span>In stock only</span>
            </label>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ded8cb] text-xs font-semibold text-[#192d2a]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-xs"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {(search || category !== "all" || inStock || savedOnly) && (
              <button
                type="button"
                onClick={reset}
                className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8e4dc] p-12 text-center max-w-lg mx-auto space-y-3">
            <Search className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-black text-[#192d2a]">
              No products found
            </h3>
            <p className="text-xs text-stone-500">
              {savedOnly
                ? "You haven't saved any items yet. Click the heart icon to save items."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-[#017d6e] text-white text-xs font-bold"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div
            className={
              cardVariant === "horizontal"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            }
          >
            {filtered.map((p) => {
              const isSaved = wishlist.includes(p.id);
              const discount =
                p.compare_at_price && p.compare_at_price > p.price
                  ? Math.round((1 - p.price / p.compare_at_price) * 100)
                  : 0;

              if (cardVariant === "horizontal") {
                return (
                  <article
                    key={p.id}
                    data-style-part="card"
                    style={cardStyle}
                    className="bg-white rounded-2xl border border-[#e8e4dc] p-3 flex gap-3 shadow-2xs hover:shadow-xs transition group"
                  >
                    <button
                      type="button"
                      onClick={() => setDetail(p)}
                      aria-label={`View ${p.name}`}
                      className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-stone-100"
                    >
                      {renderProductVisual(p)}
                    </button>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <small className="text-[10px] font-bold uppercase text-stone-500 truncate">
                            {p.category?.name || "Product"}
                          </small>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(p.id)}
                            aria-label="Save item"
                            className="text-stone-400 hover:text-rose-500"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isSaved ? "fill-rose-500 text-rose-500" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <h3
                          onClick={() => setDetail(p)}
                          className="text-xs sm:text-sm font-bold text-[#192d2a] truncate cursor-pointer hover:text-[#017d6e]"
                        >
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <strong className="text-sm font-black text-[#192d2a]">
                            {formatCurrency(Number(p.price))}
                          </strong>
                          {discount > 0 && (
                            <del className="text-[11px] text-stone-400">
                              {formatCurrency(Number(p.compare_at_price))}
                            </del>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          data-style-part="buttons"
                          style={buttonStyle}
                          disabled={p.stock_quantity <= 0}
                          onClick={() => handleAddToCart(p)}
                          className="flex-1 py-1.5 rounded-xl bg-[#017d6e] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-95 disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {p.stock_quantity > 0 ? "Add to Bag" : "Sold Out"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }

              // Default Stacked Card
              return (
                <article
                  key={p.id}
                  data-style-part="card"
                  style={cardStyle}
                  className="bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square bg-stone-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDetail(p)}
                      aria-label={`View ${p.name}`}
                      className="w-full h-full text-left"
                    >
                      {renderProductVisual(p)}
                    </button>
                    {discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs">
                        −{discount}%
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      aria-label="Wishlist toggle"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-stone-600 hover:text-rose-600 flex items-center justify-center shadow-xs backdrop-blur-xs transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isSaved ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <small className="text-[10px] font-extrabold uppercase tracking-wider text-[#017d6e] block truncate">
                        {p.category?.name || "Featured Item"}
                      </small>
                      <h3
                        onClick={() => setDetail(p)}
                        className="text-xs sm:text-sm font-bold text-[#192d2a] line-clamp-2 mt-0.5 cursor-pointer hover:text-[#017d6e]"
                      >
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <strong className="text-sm sm:text-base font-black text-[#192d2a]">
                          {formatCurrency(Number(p.price))}
                        </strong>
                        {discount > 0 && (
                          <del className="text-xs text-stone-400">
                            {formatCurrency(Number(p.compare_at_price))}
                          </del>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        data-style-part="buttons"
                        style={buttonStyle}
                        disabled={p.stock_quantity <= 0}
                        onClick={() => handleAddToCart(p)}
                        className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#017d6e] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>
                          {p.stock_quantity > 0 ? "Add to Bag" : "Sold Out"}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderPromosSection() {
    if (!isSectionVisible("promos") || categoryNames.length === 0) return null;
    return (
      <section
        key="promos" data-studio-section="promos"
        aria-label="Collection Highlights"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryNames.slice(0, 3).map((name, i) => {
            const promoGradients = [
              "from-[#017d6e] to-[#0e2a22]",
              "from-[#1d4ed8] to-[#1e3a8a]",
              "from-[#5c24ff] to-[#3b0764]",
            ];
            return (
              <div
                key={name}
                onClick={() => browse(name)}
                className={`rounded-3xl bg-gradient-to-br ${
                  promoGradients[i % promoGradients.length]
                } text-white p-6 sm:p-8 flex flex-col justify-between shadow-xs cursor-pointer hover:shadow-md transition-all group`}
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2ec49c]">
                    Featured Showcase
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                    {name}
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                    Curated authentic products with express ordering.
                  </p>
                </div>
                <div className="pt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2ec49c] group-hover:underline flex items-center gap-1.5">
                    Explore Collection
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#2ec49c]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function renderBenefitsSection() {
    if (!isSectionVisible("benefits")) return null;
    return (
      <section
        key="benefits" data-studio-section="benefits"
        aria-label="Store Guarantees"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      >
        <div className="bg-white rounded-3xl border border-[#e8e4dc] p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e0f2eb] text-[#017d6e] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block">
                {t("benefit:1:title", "Carefully Curated")}
              </strong>
              <small className="text-[11px] text-stone-500 block">
                {t("benefit:1:desc", "Verified quality items")}
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff6ff] text-[#1d4ed8] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block">
                {t("benefit:2:title", "Express Islandwide")}
              </strong>
              <small className="text-[11px] text-stone-500 block">
                {t("benefit:2:desc", "Safe door-to-door delivery")}
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block">
                {t("benefit:3:title", "Instant Bag")}
              </strong>
              <small className="text-[11px] text-stone-500 block">
                {t("benefit:3:desc", "One-click order checkout")}
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f0fdf4] text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-black text-[#192d2a] block">
                {t("benefit:4:title", "Direct Seller Chat")}
              </strong>
              <small className="text-[11px] text-stone-500 block">
                {t("benefit:4:desc", "Talk directly on WhatsApp")}
              </small>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderReviewsSection() {
    if (!isSectionVisible("reviews")) return null;
    return (
      <section
        key="reviews" data-studio-section="reviews"
        aria-label="Customer Reviews & Trust"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      >
        <div className="bg-[#fcfbf9] rounded-3xl border border-[#ded8cb] p-6 sm:p-10 shadow-2xs">
          <div className="max-w-xl mx-auto text-center space-y-2 mb-8">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#192d2a] tracking-tight">
              {t("reviews:title", "Customer Trust & Genuine Service")}
            </h2>
            <p className="text-xs text-stone-500">
              {t(
                "reviews:subtitle",
                "Real reviews and verified order updates directly through WhatsApp."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-700 italic">
                &ldquo;Fast delivery and the seller answered all my questions on WhatsApp immediately!&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <strong className="text-stone-900 font-bold">Tharushi K.</strong>
                <span className="text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-700 italic">
                &ldquo;Packaging was great and product quality exceeded my expectations. Highly recommended!&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <strong className="text-stone-900 font-bold">Dilshan R.</strong>
                <span className="text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-stone-700 italic">
                &ldquo;Ordering process is super simple. Sent my order receipt and received tracking details quickly.&rdquo;
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <strong className="text-stone-900 font-bold">Nuwan P.</strong>
                <span className="text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderContactSection() {
    if (!isSectionVisible("contact")) return null;
    return (
      <section
        key="contact" data-studio-section="contact"
        aria-label="Direct WhatsApp Contact"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      >
        <div className="bg-[#0e2a22] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#174c42]">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-[#2ec49c] uppercase tracking-wider">
              {t("contact:eyebrow", "Direct Line to Seller")}
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              {t("contact:title", "Have a question or custom order?")}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg">
              {t(
                "contact:desc",
                "Chat with us directly on WhatsApp for real-time stock, inquiries and order tracking."
              )}
            </p>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-[#2ec49c] text-[#0e2a22] text-xs font-black shadow-md hover:bg-[#25ab88] transition flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-[#0e2a22]" />
            <span>{t("contact:btn", "Chat on WhatsApp")}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    );
  }

  function renderFooterSection() {
    if (!isSectionVisible("footer")) return null;
    return (
      <footer
        key="footer" data-studio-section="footer"
        className="mt-12 bg-white border-t border-[#e8e4dc] py-12 px-4 sm:px-6 text-[#192d2a]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-8 h-8 object-contain rounded-lg border border-stone-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#017d6e] text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-base font-black tracking-tight">{shop.name}</h2>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {shop.description ||
                t(
                  "footer:about",
                  "Authentic products and friendly service. Verified official online storefront powered by KADEO."
                )}
            </p>
            <small className="text-[11px] text-stone-400 block pt-1">
              {shop.address || "Sri Lanka"}
            </small>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-3">
              Catalog
            </h3>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <button
                  type="button"
                  onClick={() => browse("all")}
                  className="hover:text-[#017d6e]"
                >
                  All Products
                </button>
              </li>
              {categoryNames.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => browse(cat)}
                    className="hover:text-[#017d6e]"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-3">
              Customer Support
            </h3>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link
                  href={`/shop/${shop.slug}/track`}
                  className="hover:text-[#017d6e]"
                >
                  Track My Order
                </Link>
              </li>
              <li>
                <StorePoliciesModal
                  shopName={shop.name}
                  whatsappNumber={shop.whatsapp_number}
                  triggerLabel="Shipping & Delivery Policy"
                  triggerClassName="text-left text-inherit cursor-pointer hover:underline"
                />
              </li>
              <li>
                <StorePoliciesModal
                  shopName={shop.name}
                  whatsappNumber={shop.whatsapp_number}
                  triggerLabel="Returns & Exchanges"
                  triggerClassName="text-left text-inherit cursor-pointer hover:underline"
                />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-3">
              Instant Ordering
            </h3>
            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
              Have questions about sizing, delivery or wholesale?
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>
            © {new Date().getFullYear()} {shop.name}. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5">
            <img
              src="/KADEO.png"
              alt="KADEO"
              className="w-3.5 h-3.5 object-contain inline-block"
            />
            <span>Built with KADEO Ceylon Commerce</span>
          </span>
        </div>
      </footer>
    );
  }

  // Section Dispatcher
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    announcement: renderAnnouncementSection,
    navbar: renderNavbarSection,
    hero: renderHeroSection,
    categories: renderCategoriesSection,
    products: renderProductsSection,
    promos: renderPromosSection,
    benefits: renderBenefitsSection,
    reviews: renderReviewsSection,
    contact: renderContactSection,
    footer: renderFooterSection,
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#192d2a] font-sans selection:bg-[#017d6e] selection:text-white pb-20">
      {/* Skip Link for accessibility */}
      <a
        href="#custom-builder-products"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#017d6e] focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to products
      </a>

      {/* Dynamic Sections rendering in seller's configured order */}
      {sectionsOrder.map((sectionId) => {
        const renderer = sectionRenderers[sectionId];
        return renderer ? renderer() : null;
      })}

      {/* Product Detail Modal */}
      {detail && (
        <dialog
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs w-full h-full"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative flex flex-col max-h-[90vh]">
            <button
              type="button"
              onClick={() => setDetail(null)}
              aria-label="Close details"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-video bg-stone-100 overflow-hidden shrink-0">
              {renderProductVisual(detail)}
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#017d6e]">
                  {detail.category?.name || "Product Item"}
                </span>
                <h2 className="text-xl font-black text-[#192d2a] mt-0.5">
                  {detail.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <strong className="text-lg font-black text-[#192d2a]">
                    {formatCurrency(Number(detail.price))}
                  </strong>
                  {detail.compare_at_price &&
                    detail.compare_at_price > detail.price && (
                      <del className="text-xs text-stone-400">
                        {formatCurrency(Number(detail.compare_at_price))}
                      </del>
                    )}
                </div>
              </div>

              {detail.description && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {detail.description}
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  data-style-part="buttons"
                  style={buttonStyle}
                  disabled={detail.stock_quantity <= 0}
                  onClick={() => {
                    handleAddToCart(detail);
                    setDetail(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#017d6e] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {detail.stock_quantity > 0
                      ? "Add to Shopping Bag"
                      : "Out of Stock"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
