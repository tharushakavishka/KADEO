"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber, buildWhatsAppUrl } from "@/lib/phone";
import { useCart } from "../CartDrawer";
import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";
import { StorePoliciesModal } from "../StorePoliciesModal";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Truck,
  MessageCircle,
  Plus,
  Minus,
  Check,
  X,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  Package,
  Phone,
  RotateCcw,
  Home,
  LayoutGrid,
  Tag,
  Camera,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  images?: { storage_path: string }[];
  category?: { name: string } | null;
}

export interface ShopAppThemeProps {
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

const TRENDING_SEARCHES = [
  "Wireless Headphones",
  "Linen Shirts",
  "Artisan Coffee",
  "Glow Serum",
  "Ceylon Tea",
  "Casual Sneakers",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  all: "✨",
  electronics: "🎧",
  gadgets: "⚡",
  clothing: "👕",
  fashion: "👗",
  apparel: "👔",
  coffee: "☕",
  tea: "🫖",
  beauty: "🧴",
  cosmetics: "💄",
  skincare: "✨",
  wellness: "🌿",
  home: "🏠",
  living: "🛋️",
  lifestyle: "🎒",
  accessories: "👓",
  food: "🍪",
  beverages: "🧃",
  gifts: "🎁",
  sports: "🏀",
};

// Signature Shop.com droplet/swirl logo icon
function ShopAppLogoIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#5a31f4" />
      <path
        d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50C80 43.2 77.7 36.9 73.9 31.8C70.5 37 64.8 40.5 58.2 41.2C50.2 42.1 43.1 48.7 42.8 56.8C42.4 65.4 49.6 72.5 58.2 72.2C64.6 72 70.1 68 72.4 62.3C68.8 66.4 63.6 69 57.8 69C46.8 69 37.8 60 37.8 49C37.8 38 46.8 29 57.8 29C64.4 29 70.2 32.2 73.8 37.2C70.2 26.8 61 20 50 20Z"
        fill="white"
      />
    </svg>
  );
}


// Social Media Icon Helpers
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.18 8.18 0 0 0 4.77 1.52V6.78a4.83 4.83 0 0 1-1-.09z" />
    </svg>
  );
}

// Supported Courier Badges matching Sri Lankan logistics providers
function DomexBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition shadow-2xs">
      <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[10px] font-black flex items-center justify-center shrink-0">
        D
      </span>
      <span>Domex</span>
    </span>
  );
}

function KombiyoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition shadow-2xs">
      <span className="w-4 h-4 rounded-full bg-[#f97316] text-white text-[10px] font-black flex items-center justify-center shrink-0">
        K
      </span>
      <span>Kombiyo</span>
    </span>
  );
}

function ProntoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition shadow-2xs">
      <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white text-[10px] font-black flex items-center justify-center shrink-0">
        P
      </span>
      <span>Pronto</span>
    </span>
  );
}

function SLPostBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition shadow-2xs">
      <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[9px] font-black flex items-center justify-center shrink-0">
        SL
      </span>
      <span>SL Post</span>
    </span>
  );
}

// 3D Cardboard Parcel Box & Colombo Lotus Tower Skyline Illustration
function CourierParcelScene({ shopName }: { shopName: string }) {
  return (
    <div className="relative w-full h-[260px] flex items-center justify-end select-none pointer-events-none">
      <svg
        viewBox="0 0 460 260"
        className="w-full h-full max-w-[460px] overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lotusBulbGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#db2777" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>

          <radialGradient id="pedestalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#581c87" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2e1065" stopOpacity="0.2" />
          </radialGradient>

          <filter id="neonPurpleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="cardboardTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5deb3" />
            <stop offset="100%" stopColor="#e3be96" />
          </linearGradient>
          <linearGradient id="cardboardFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dfb78c" />
            <stop offset="100%" stopColor="#cc9b6c" />
          </linearGradient>
          <linearGradient id="cardboardSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b88354" />
            <stop offset="100%" stopColor="#9c6b3e" />
          </linearGradient>
        </defs>

        {/* 1. Skyline Silhouettes in Twilight Purple */}
        <g fill="#170535" opacity="0.65">
          <rect x="230" y="145" width="20" height="75" rx="1" />
          <rect x="255" y="130" width="16" height="90" rx="1" />
          <rect x="275" y="150" width="28" height="70" rx="1" />
          <rect x="310" y="115" width="22" height="105" rx="1" />
          <rect x="336" y="138" width="18" height="82" rx="1" />
          <rect x="390" y="125" width="25" height="95" rx="1" />
          <rect x="420" y="150" width="30" height="70" rx="1" />
        </g>

        {/* 2. Colombo Lotus Tower */}
        <g transform="translate(365, 25)">
          <path d="M12 180 L14.5 70 L17.5 70 L20 180 Z" fill="#24074d" />
          <path d="M15 180 L15.7 70 L16.3 70 L17 180 Z" fill="#a855f7" opacity="0.4" />
          <ellipse cx="16" cy="70" rx="9" ry="2.5" fill="#3b0764" />
          <path
            d="M7 70 C6 55, 10 42, 16 38 C22 42, 26 55, 25 70 C22 74, 10 74, 7 70 Z"
            fill="url(#lotusBulbGrad)"
            filter="drop-shadow(0 0 8px #f43f5e)"
          />
          <path d="M13 68 C12 56, 14 46, 16 40 C18 46, 20 56, 19 68 Z" fill="#fecdd3" opacity="0.75" />
          <rect x="13.5" y="34" width="5" height="4.5" fill="#fbcfe8" rx="0.5" />
          <line x1="16" y1="34" x2="16" y2="4" stroke="#e9d5ff" strokeWidth="1.2" />
          <circle cx="16" cy="4" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />
        </g>

        {/* 3. Glowing Pedestal / Circular Stage */}
        <g transform="translate(320, 205)">
          <ellipse
            cx="0"
            cy="0"
            rx="125"
            ry="36"
            fill="none"
            stroke="#c084fc"
            strokeWidth="2.5"
            opacity="0.85"
            filter="url(#neonPurpleGlow)"
          />
          <ellipse cx="0" cy="0" rx="120" ry="34" fill="url(#pedestalGrad)" />
          <ellipse cx="0" cy="0" rx="98" ry="26" fill="#4c1d95" opacity="0.5" />
        </g>

        {/* 4. Realistic 3D Delivery Cardboard Parcel Box */}
        <g transform="translate(320, 150)">
          <ellipse cx="0" cy="50" rx="64" ry="18" fill="#090217" opacity="0.75" />

          {/* Top Face (isometric diamond) */}
          <polygon points="0,-48 64,-14 0,20 -64,-14" fill="url(#cardboardTop)" />
          {/* Packaging tape on top */}
          <polygon points="-7,-44 5,-38 5,16 -7,10" fill="rgba(255,255,255,0.4)" />

          {/* Left / Front Main Face */}
          <polygon points="-64,-14 0,20 0,76 -64,42" fill="url(#cardboardFront)" />
          {/* Packaging tape running down the front edge */}
          <polygon points="-7,14 4,20 4,76 -7,70" fill="rgba(255,255,255,0.3)" />

          {/* Right Shaded Side Face */}
          <polygon points="0,20 64,-14 64,42 0,76" fill="url(#cardboardSide)" />

          {/* Store Logo and Name printed on the front-left cardboard face */}
          <g transform="matrix(0.88, 0.46, 0, 0.88, -50, 6)">
            <circle cx="12" cy="18" r="8.5" fill="#5a31f4" />
            <path
              d="M12 13.5C9.5 13.5 7.5 15.5 7.5 18C7.5 20.5 9.5 22.5 12 22.5C14.5 22.5 16.5 20.5 16.5 18C16.5 16.5 15.5 15.2 14.2 14.5C13.5 15.5 12.2 16.2 10.8 16.2C9.5 16.2 8.5 15 8.5 13.8C8.5 13.6 8.6 13.5 8.6 13.5Z"
              fill="white"
            />
            <text
              x="25"
              y="22"
              fill="#1e1145"
              fontSize="11.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.3"
            >
              {shopName}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function ShopAppTheme({ shop, categories, products }: ShopAppThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();
  const cardStyle = customStyle(t, "card");
  const navbarStyle = customStyle(t, "navbar");
  const searchStyle = customStyle(t, "search");
  const buttonStyle = customStyle(t, "buttons");
  const menuLayout = t("layout:menu", "floating_dock");

  const showHeroContent = t("visibility:hero:content", "shown") !== "hidden";
  const showHeroTitle = t("visibility:hero:title", "shown") !== "hidden";
  const showHeroDesc = t("visibility:hero:description", "shown") !== "hidden";
  const showHeroButton = t("visibility:hero:button", "shown") !== "hidden";

  // State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [orderTrackCode, setOrderTrackCode] = useState("");
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [activeDockTab, setActiveDockTab] = useState<"home" | "categories" | "cart" | "deals" | "orders">("home");

  // Hero Image Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const cleanWaNumber = normalizePhoneNumber(shop.whatsapp_number);
  const generalWaUrl = buildWhatsAppUrl(
    cleanWaNumber,
    `Hello ${shop.name}! I am browsing your online store on KADEO and would like to ask a question.`
  );

  // Collect slider images from custom configuration or shop banner
  const slides = useMemo(() => {
    const list: { id: string; url: string }[] = [];
    
    // Check custom slides configured by seller (slides 1 to 6)
    for (let i = 1; i <= 6; i++) {
      const customSlide = t(`slider:slide:${i}`) || t(`shopapp:slide:${i}`);
      if (customSlide && customSlide.trim()) {
        list.push({ id: `custom-${i}`, url: customSlide.trim() });
      }
    }

    // If slide 1 was not explicitly in storefront_content, but shop.banner_url is provided, use it
    if (list.length === 0 && shop.banner_url) {
      list.push({ id: "shop-banner", url: shop.banner_url });
    }

    // Curated default high-resolution showcase banner slides if no custom slides configured
    if (list.length === 0) {
      list.push(
        {
          id: "default-1",
          url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1800&q=80",
        },
        {
          id: "default-2",
          url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80",
        },
        {
          id: "default-3",
          url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1800&q=80",
        }
      );
    }

    return list;
  }, [t, shop.banner_url]);

  // Auto-play slider with timer (pauses when hovered)
  useEffect(() => {
    if (slides.length <= 1 || isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length, isSliderPaused]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Category names list
  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => c.name);
    }
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [categories, products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // In-stock only
    if (inStockOnly) {
      list = list.filter((p) => p.stock_quantity > 0);
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, search, selectedCategory, inStockOnly, sortBy]);

  // Trending products subset (first 4 items or products with discounts)
  const trendingProducts = useMemo(() => {
    const discounted = products.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
    if (discounted.length >= 3) return discounted.slice(0, 4);
    return products.slice(0, 4);
  }, [products]);

  function handleAddToCart(p: ProductItem, qty = 1) {
    if (p.stock_quantity <= 0) return;
    addItem(
      {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.images?.[0]?.storage_path,
        maxStock: p.stock_quantity,
      },
      qty
    );
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1400);
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleTrendingClick(query: string) {
    setSearch(query);
    setSelectedCategory("all");
    searchInputRef.current?.focus();
    document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategory("all");
    setInStockOnly(false);
    setSortBy("featured");
  }

  const getCategoryEmoji = (name: string) => {
    const key = name.toLowerCase();
    for (const [catKey, emoji] of Object.entries(CATEGORY_EMOJIS)) {
      if (key.includes(catKey)) return emoji;
    }
    return "🏷️";
  };

  const getProductImage = (p: ProductItem) => {
    const url = p.images?.[0]?.storage_path;
    if (url && !brokenImages.includes(p.id)) {
      return (
        <img
          src={url}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setBrokenImages((prev) => [...prev, p.id])}
        />
      );
    }
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/80 text-slate-400">
        <Package className="w-8 h-8 opacity-40 mb-1" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {p.category?.name || "Curated"}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-[#5a31f4] selection:text-white pb-24 sm:pb-16 relative">
      {/* 1. DYNAMIC NAVIGATION BAR & DOCK (5 Configurable Styles) */}
      {/* STYLE 1: Floating Curved Side Dock (Default Shop App) */}
      {menuLayout === "floating_dock" && (
        <aside
          aria-label="Shop Navigation Dock"
          className="fixed left-3 sm:left-4 top-20 bottom-6 z-40 hidden md:flex flex-col justify-between items-center py-4 px-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[32px] w-14 transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeDockTab === "home"
                  ? "bg-slate-950 text-white shadow-sm scale-105"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Home"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("categories");
                document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeDockTab === "categories"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Categories"
              aria-label="Categories"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("cart");
                setIsOpen(true);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all relative cursor-pointer"
              title="Shopping Cart"
              aria-label={`Shopping cart with ${totalCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#5a31f4] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("deals");
                document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeDockTab === "deals"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Special Offers & Deals"
              aria-label="Deals"
            >
              <Tag className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("orders");
                document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeDockTab === "orders"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Track Orders"
              aria-label="Track Orders"
            >
              <Package className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1.5 w-full pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (wishlist.length > 0) {
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all relative cursor-pointer"
              title={`Saved Items (${wishlist.length})`}
              aria-label={`Wishlist with ${wishlist.length} saved items`}
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <span className="text-[10px] font-semibold text-slate-400 select-none">Sign in</span>
          </div>
        </aside>
      )}

      {/* STYLE 2: Compact Left Sidebar (Straight & Slim Vertical Bar) */}
      {menuLayout === "compact_left" && (
        <aside
          aria-label="Compact Left Navigation"
          className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col justify-between items-center py-6 px-1.5 bg-white border-r border-slate-200 shadow-sm w-16 transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <Link href={`/shop/${shop.slug || ""}`} className="p-2 mb-2">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <ShopAppLogoIcon className="w-8 h-8" />
              )}
            </Link>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeDockTab === "home" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("categories");
                document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeDockTab === "categories" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Browse Categories"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("deals");
                document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeDockTab === "deals" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Deals"
            >
              <Tag className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDockTab("orders");
                document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeDockTab === "orders" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Track Package"
            >
              <Package className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 relative cursor-pointer"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#5a31f4] text-white text-[9px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* STYLE 3: Expanded Sidebar with Text Labels */}
      {menuLayout === "expanded_left" && (
        <aside
          aria-label="Expanded Left Sidebar Navigation"
          className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col justify-between py-6 px-4 bg-white border-r border-slate-200/90 shadow-sm w-56 transition-all duration-300"
        >
          <div className="space-y-6">
            <Link href={`/shop/${shop.slug || ""}`} className="flex items-center gap-3 px-2">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <ShopAppLogoIcon className="w-9 h-9" />
              )}
              <span className="font-black text-sm text-slate-900 truncate">{shop.name}</span>
            </Link>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "home" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("categories");
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "categories" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("deals");
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "deals" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Special Offers</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("orders");
                  document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "orders" ? "bg-[#5a31f4] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Order Tracking</span>
              </button>
            </nav>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-slate-600" />
                <span>Shopping Bag</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#5a31f4] text-white text-[10px] font-black flex items-center justify-center">
                {totalCount}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* MOBILE BOTTOM NAVIGATION DOCK (Mobile screens) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-6 py-2 flex items-center justify-between shadow-lg"
      >
        <button
          type="button"
          onClick={() => {
            setActiveDockTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-[#5a31f4]"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveDockTab("categories");
            document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#5a31f4]"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Browse</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#5a31f4] relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cart</span>
          {totalCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#5a31f4] text-white text-[9px] font-black flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" })}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-[#5a31f4]"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium">Track</span>
        </button>

        <button
          type="button"
          onClick={() => document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" })}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-rose-500"
        >
          <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
          <span className="text-[10px] font-medium">Saved</span>
        </button>
      </nav>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#5a31f4] text-white px-4 py-1.5 text-[11px] font-medium tracking-wide" style={buttonStyle.background ? { background: buttonStyle.background } : undefined}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${
          menuLayout === "floating_dock" || menuLayout === "compact_left"
            ? "md:pl-20"
            : menuLayout === "expanded_left"
            ? "md:pl-60"
            : ""
        }`}>
          <div className="flex items-center gap-2 truncate">
            <Truck className="w-3.5 h-3.5 shrink-0 text-indigo-200" />
            <span className="truncate">
              {t("announcement", "Islandwide Delivery across Sri Lanka • Cash on Delivery / Bank Transfer Available")}
            </span>
          </div>
          <a
            href={generalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-white/90 hover:text-white transition shrink-0 ml-4 font-semibold"
          >
            <span>Questions? Chat with seller</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* MAIN CONTENT AREA WITH ADAPTIVE DESKTOP OFFSET */}
      <div className={`transition-all duration-300 ${
        menuLayout === "floating_dock" || menuLayout === "compact_left"
          ? "md:pl-20"
          : menuLayout === "expanded_left"
          ? "md:pl-60"
          : "md:pl-0"
      }`}>
        {/* 2. TOP HEADER & PROMINENT PILL SEARCH BAR (Exact match to Shop.com) */}
        <header data-style-part="navbar" data-custom-text={Boolean(navbarStyle.color)} style={navbarStyle} className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3 sm:gap-6">
              {/* Brand Logo & Name */}
              <Link
                href={`/shop/${shop.slug || ""}`}
                className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden"
                aria-label={`${shop.name} home`}
              >
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <ShopAppLogoIcon className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
                <div className="hidden xs:block text-left">
                  <span className="block font-black text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-[#5a31f4] transition leading-tight">
                    {shop.name}
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Official Shop
                  </span>
                </div>
              </Link>

              {/* Centered Large Rounded Pill Search Bar ("What are you shopping for today?") */}
              <div className="flex-1 max-w-2xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative flex items-center"
                  role="search"
                >
                  <div data-style-part="search" data-custom-text={Boolean(searchStyle.color)} style={searchStyle} className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5a31f4] focus-within:border-transparent border border-slate-200/80 transition-all shadow-inner">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("shopapp:search:placeholder", "What are you shopping for today?")}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                      aria-label="Search store products"
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => searchInputRef.current?.focus()}
                        className="p-1 text-slate-400 hover:text-[#5a31f4] transition cursor-pointer"
                        title="Visual Search"
                        aria-label="Visual Search"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* STYLE 4: Top Horizontal Header Links */}
              {menuLayout === "top_navbar" && (
                <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDockTab("home");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      activeDockTab === "home" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDockTab("categories");
                      document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      activeDockTab === "categories" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDockTab("deals");
                      document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      activeDockTab === "deals" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Deals
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDockTab("orders");
                      document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      activeDockTab === "orders" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Tracking
                  </button>
                </nav>
              )}

              {/* Right Side Header Action (Cart & Wishlist) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full bg-[#5a31f4] hover:bg-[#4a22cb] text-white text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                  aria-label={`Open cart with ${totalCount} items`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Bag</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white font-extrabold text-[11px] flex items-center justify-center">
                    {totalCount}
                  </span>
                </button>
              </div>
            </div>

            
          </div>
        </header>

        {/* STYLE 5: Top Centered Floating Pill Navigation Bar */}
        {menuLayout === "top_floating_pill" && (
          <div className="sticky top-20 z-20 flex justify-center px-4 pt-2 pointer-events-none">
            <nav className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-lg pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "home" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("categories");
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "categories" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("deals");
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "deals" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Deals</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab("orders");
                  document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeDockTab === "orders" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Tracking</span>
              </button>
            </nav>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-10">
          {/* 4. HERO BANNER / IMAGE SLIDER SECTION (Clean Image Carousel without text & buttons) */}
          {showHeroContent && (
            <section
              id="hero-banner-card"
              data-editor-image="banner_url"
              data-editor-slider="true"
              aria-label="Store Promotional Banner Slider"
              className="relative overflow-hidden rounded-3xl sm:rounded-[40px] shadow-xl border border-slate-200/80 bg-slate-950 group select-none"
              onMouseEnter={() => setIsSliderPaused(true)}
              onMouseLeave={() => setIsSliderPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slider Track / Slides */}
              <div className="relative w-full h-[260px] xs:h-[320px] sm:h-[400px] md:h-[460px] lg:h-[500px] overflow-hidden">
                {slides.map((slide, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <div
                      key={slide.id || idx}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                        isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                      }`}
                      aria-hidden={!isActive}
                    >
                      <img
                        src={slide.url}
                        alt={`Slide ${idx + 1}`}
                        fetchPriority={idx === 0 ? "high" : "low"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      {/* Fallback gradient background if image is slow or missing */}
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#8ba1f8] via-[#a8b8fc] to-[#dfe5fc] flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-indigo-900/20" />
                      </div>
                    </div>
                  );
                })}

                {/* Left (Prev) Arrow Button */}
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-slate-950 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer active:scale-95"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                {/* Right (Next) Arrow Button */}
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide((prev) => (prev + 1) % slides.length);
                    }}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-slate-950 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer active:scale-95"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                {/* Bottom Pagination Dots / Pill Indicator (Exact Shop App signature styling) */}
                {slides.length > 1 && (
                  <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md">
                    {slides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(dotIdx);
                        }}
                        className={`transition-all duration-300 cursor-pointer ${
                          dotIdx === currentSlide
                            ? "w-7 sm:w-8 h-2 sm:h-2.5 rounded-full bg-white shadow-md scale-105"
                            : "w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 6. MAIN ALL PRODUCTS CATALOG WITH LIVE PILL FILTERS */}
          <section id="shop-products-grid" aria-label="Store Catalog" className="space-y-6 pt-4 border-t border-slate-200/80">
            {/* Header + Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Browse Products</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {filteredProducts.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Handpicked authentic products available for immediate delivery
                </p>
              </div>

              {/* Sort & In-stock Toggles */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-50 transition shadow-2xs">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#5a31f4] focus:ring-[#5a31f4]"
                  />
                  <span>In stock only</span>
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#5a31f4] cursor-pointer shadow-2xs"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                {(search || selectedCategory !== "all" || inStockOnly) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline px-2 cursor-pointer"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Only actual store categories, if any exist) */}
            {categoryNames.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
                  }`}
                >
                  All
                </button>
                {categoryNames.map((name) => {
                  const isSelected = selectedCategory.toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedCategory(name)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? "bg-[#5a31f4] text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
                      }`}
                    >
                      <span>{getCategoryEmoji(name)}</span>
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {filteredProducts.map((p) => {
                  const discount =
                    p.compare_at_price && p.compare_at_price > p.price
                      ? Math.round((1 - p.price / p.compare_at_price) * 100)
                      : 0;

                  return (
                    <article
                      key={p.id}
                      data-style-part="card"
                      data-custom-text={Boolean(cardStyle.color)}
                      style={cardStyle}
                      className="group bg-white rounded-3xl p-3 sm:p-3.5 border border-slate-200/80 hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      {/* Image Box */}
                      <div
                        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 mb-2.5 cursor-pointer"
                        onClick={() => setDetailProduct(p)}
                      >
                        {getProductImage(p)}

                        {/* Wishlist button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 flex items-center justify-center transition shadow-xs cursor-pointer"
                          aria-label={`Save ${p.name}`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              wishlist.includes(p.id) ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                        </button>

                        {/* Out of Stock Ribbon */}
                        {p.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center z-10">
                            <span className="text-[11px] font-black text-white uppercase tracking-wider bg-rose-600 px-2.5 py-1 rounded-full shadow-sm">
                              Sold Out
                            </span>
                          </div>
                        )}

                        {discount > 0 && p.stock_quantity > 0 && (
                          <span className="absolute bottom-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            −{discount}%
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            {p.category?.name || "Official"}
                          </span>
                          <h3
                            onClick={() => setDetailProduct(p)}
                            className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#5a31f4] transition line-clamp-2 cursor-pointer leading-snug"
                          >
                            {p.name}
                          </h3>
                        </div>

                        {/* Price & Add to Bag */}
                        <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
                          <div>
                            <div className="font-black text-xs sm:text-sm text-slate-900">
                              {formatCurrency(Number(p.price))}
                            </div>
                            {discount > 0 && p.compare_at_price && (
                              <del className="text-[10px] text-slate-400 block -mt-0.5">
                                {formatCurrency(Number(p.compare_at_price))}
                              </del>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(p, 1)}
                            disabled={p.stock_quantity <= 0}
                            data-style-part="buttons"
                            data-custom-text={Boolean(buttonStyle.color)}
                            style={buttonStyle}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              addedId === p.id
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 hover:bg-[#5a31f4] text-white active:scale-95"
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            aria-label={`Add ${p.name} to cart`}
                          >
                            {addedId === p.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No items match your search</h3>
                  <p className="text-xs text-slate-500">
                    Try checking your spelling, choosing a different category, or clearing your active filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2 rounded-full bg-[#5a31f4] text-white text-xs font-bold hover:bg-[#4a22cb] transition cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* 7. ISLANDWIDE PACKAGE TRACKING SPOTLIGHT (DOMEX, KOMBIYO, PRONTO, SL POST) */}
          <section
            id="package-tracking-spotlight"
            aria-label="Order Tracking"
            className="rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-[#20084c] via-[#331174] to-[#180539] text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-purple-500/20"
          >
            {/* Ambient background glows */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(168,85,247,0.22),transparent_55%)] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left / Center Info & Input Form */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-5">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
                  <Truck className="w-4 h-4 text-white shrink-0" />
                  <span>Islandwide Courier Support</span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-black tracking-tight leading-[1.15] text-white max-w-xl">
                  Track your packages in real-time
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-xl font-normal">
                  Enter your order reference number (e.g. KAD-2026-XXXXX) or your courier waybill code to check instant status updates across Sri Lanka.
                </p>

                {/* Large White Pill Search Input with Emerald Green Button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (orderTrackCode.trim()) {
                      window.open(
                        `/shop/${shop.slug || ""}/track?code=${encodeURIComponent(orderTrackCode.trim())}`,
                        "_blank"
                      );
                    }
                  }}
                  className="pt-2 max-w-2xl"
                >
                  <div className="bg-white rounded-full p-1.5 pl-4 sm:pl-5 shadow-2xl flex items-center gap-2 sm:gap-3 border border-white/80 transition-all focus-within:ring-4 focus-within:ring-purple-400/30">
                    <Package className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={orderTrackCode}
                      onChange={(e) => setOrderTrackCode(e.target.value)}
                      placeholder="Enter order reference or phone number..."
                      className="w-full bg-transparent border-0 outline-hidden text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#008a45] hover:bg-[#00753b] text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 active:scale-95"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Supported Couriers Row */}
                <div className="pt-2 flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-purple-200/90">Supported Couriers:</span>
                  <DomexBadge />
                  <KombiyoBadge />
                  <ProntoBadge />
                  <SLPostBadge />
                </div>
              </div>

              {/* Right Side 3D Parcel & Colombo Skyline Graphic */}
              <div className="lg:col-span-4 hidden lg:flex items-center justify-end relative h-[260px]">
                <CourierParcelScene shopName={shop.name} />
              </div>
            </div>
          </section>
        </main>

        {/* 8. FOOTER WITH POLICY MODALS AND DIRECT WHATSAPP SUPPORT */}
        <footer className="mt-16 border-t border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Col */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <ShopAppLogoIcon className="w-8 h-8" />
                  <span className="font-black text-xl text-slate-900 tracking-tight">{shop.name}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                  {shop.description || "Thoughtfully curated authentic products, delivered islandwide across Sri Lanka."}
                </p>
                {/* Social Media Circular Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="TikTok"
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Explore Links */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">EXPLORE</span>
                <ul className="space-y-2 text-xs font-medium text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-[#5a31f4] transition cursor-pointer"
                    >
                      All Products
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        setInStockOnly(true);
                        document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-[#5a31f4] transition cursor-pointer"
                    >
                      In Stock Finds
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("package-tracking-spotlight")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-[#5a31f4] transition cursor-pointer"
                    >
                      Package Tracking
                    </button>
                  </li>
                  <li>
                    <Link href={`/shop/${shop.slug || ""}`} className="hover:text-[#5a31f4] transition">
                      Stores
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-[#5a31f4] transition cursor-pointer"
                    >
                      Deals & Offers
                    </button>
                  </li>
                </ul>
              </div>

              {/* Customer Care Links */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">CUSTOMER CARE</span>
                <ul className="space-y-2 text-xs font-medium text-slate-600">
                  <li>
                    <StorePoliciesModal
                      shopName={shop.name}
                      whatsappNumber={shop.whatsapp_number}
                      triggerLabel="Shipping & Courier Policies"
                      triggerClassName="hover:text-[#5a31f4] transition cursor-pointer text-left"
                    />
                  </li>
                  <li>
                    <StorePoliciesModal
                      shopName={shop.name}
                      whatsappNumber={shop.whatsapp_number}
                      triggerLabel="Returns & Refund Guidelines"
                      triggerClassName="hover:text-[#5a31f4] transition cursor-pointer text-left"
                    />
                  </li>
                  <li>
                    <StorePoliciesModal
                      shopName={shop.name}
                      whatsappNumber={shop.whatsapp_number}
                      triggerLabel="Direct WhatsApp Checkout Info"
                      triggerClassName="hover:text-[#5a31f4] transition cursor-pointer text-left"
                    />
                  </li>
                  <li>
                    <StorePoliciesModal
                      shopName={shop.name}
                      whatsappNumber={shop.whatsapp_number}
                      triggerLabel="Help Center / FAQs"
                      triggerClassName="hover:text-[#5a31f4] transition cursor-pointer text-left"
                    />
                  </li>
                </ul>
              </div>

              {/* Direct Contact */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">DIRECT CONTACT</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Have inquiries or want bulk order discounts? Chat directly with our store team.
                </p>
                <div className="pt-1">
                  <a
                    href={generalWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#00c853] hover:bg-[#00b248] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {shop.whatsapp_number ? `+94 ${shop.whatsapp_number.replace(/^(\+94|0)/, "")}` : "+94 77 123 4567"} (Mon – Sat, 9:00 AM – 6:00 PM)
                  </span>
                </div>
              </div>
            </div>

            {/* Copyright & Powered By */}
            <div className="pt-8 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-xs bg-[#00c853] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  K
                </span>
                <span className="font-semibold text-slate-600">
                  Powered by <strong className="text-slate-800 font-bold">KADEO</strong> • Built for Sri Lankan Commerce
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* FLOATING WHATSAPP BUTTON (BOTTOM RIGHT) */}
      <a
        href={generalWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-5 z-40 w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group cursor-pointer"
        aria-label="Chat with Store on WhatsApp"
        title="Chat with Store on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md pointer-events-none">
          Chat with Store
        </span>
      </a>

      {/* 9. FAST PRODUCT QUICK-VIEW MODAL */}
      {detailProduct && (
        <dialog
          className="fixed inset-0 z-50 w-full h-full bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 border-0"
          open
          onCancel={() => setDetailProduct(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailProduct(null);
          }}
        >
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              {getProductImage(detailProduct)}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {detailProduct.category?.name || "Official Collection"}
                </span>
                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {detailProduct.name}
                </h2>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(Number(detailProduct.price))}
                </span>
                {detailProduct.compare_at_price && detailProduct.compare_at_price > detailProduct.price && (
                  <del className="text-sm text-slate-400">
                    {formatCurrency(Number(detailProduct.compare_at_price))}
                  </del>
                )}
              </div>

              {detailProduct.description && (
                <p className="text-xs text-slate-600 leading-relaxed max-h-28 overflow-y-auto">
                  {detailProduct.description}
                </p>
              )}

              {/* Quantity + Add Button */}
              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center text-slate-600 cursor-pointer transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{detailQty}</span>
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.min(detailProduct.stock_quantity, q + 1))}
                    disabled={detailQty >= detailProduct.stock_quantity}
                    className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center text-slate-600 cursor-pointer transition disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(detailProduct, detailQty);
                    setDetailProduct(null);
                  }}
                  disabled={detailProduct.stock_quantity <= 0}
                  data-style-part="buttons"
                  data-custom-text={Boolean(buttonStyle.color)}
                  style={buttonStyle}
                  className="flex-1 py-3 px-6 rounded-full bg-[#5a31f4] hover:bg-[#4a22cb] text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {detailQty} to Bag</span>
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
