"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber, buildWhatsAppUrl } from "@/lib/phone";
import { useCart } from "../CartDrawer";
import { useStoreText } from "../StoreContent";
import { StorePoliciesModal } from "../StorePoliciesModal";
import {
  Search,
  ShoppingBag,
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
  RotateCcw,
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
  skincare: "✨",
  wellness: "🌿",
  home: "🏠",
  living: "🛋️",
  lifestyle: "🎒",
  accessories: "👓",
  food: "🍪",
  beverages: "🧃",
};

export function ShopAppTheme({ shop, categories, products }: ShopAppThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();

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

  const searchInputRef = useRef<HTMLInputElement>(null);

  const cleanWaNumber = normalizePhoneNumber(shop.whatsapp_number);
  const generalWaUrl = buildWhatsAppUrl(
    cleanWaNumber,
    `Hello ${shop.name}! I am browsing your online store on KADEO and would like to ask a question.`
  );

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
      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100/80 text-zinc-400">
        <Package className="w-8 h-8 opacity-40 mb-1" />
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          {p.category?.name || "Curated"}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-zinc-900 font-sans selection:bg-[#5a31f4] selection:text-white pb-24 sm:pb-16">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#5a31f4] text-white px-4 py-1.5 text-[11px] font-medium tracking-wide">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* 2. Ultra-clean Header with Prominent Pill Search Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5">
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
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-zinc-100 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-[#5a31f4] to-[#7952f5] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-sm">
                  {shop.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="hidden xs:block text-left">
                <span className="block font-black text-sm sm:text-base tracking-tight text-zinc-900 group-hover:text-[#5a31f4] transition leading-tight">
                  {shop.name}
                </span>
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Verified Merchant
                </span>
              </div>
            </Link>

            {/* Prominent Center Pill Search Bar (Shop App signature) */}
            <div className="flex-1 max-w-xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="relative flex items-center"
                role="search"
              >
                <div className="w-full flex items-center gap-2.5 px-4 py-2 sm:py-2.5 rounded-full bg-zinc-100/90 hover:bg-zinc-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5a31f4] focus-within:border-transparent border border-zinc-200/60 transition-all shadow-inner">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, essentials, brands..."
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden"
                    aria-label="Search store products"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 transition"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Header Right Actions: Wishlist & Shopping Bag */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Wishlist quick toggle */}
              <button
                type="button"
                onClick={() => {
                  if (wishlist.length > 0) {
                    document.getElementById("shop-products-grid")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="p-2 sm:p-2.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition relative"
                aria-label={`Wishlist with ${wishlist.length} saved items`}
                title="Saved Items"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-zinc-600"
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Shopping Bag Button (Shop App Indigo Accent) */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 py-2 px-3 sm:px-3.5 rounded-full bg-[#5a31f4] hover:bg-[#4a26d1] text-white text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                aria-label={`Open shopping bag with ${totalCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Bag</span>
                <span className="w-5 h-5 rounded-full bg-white/20 text-white font-extrabold text-[11px] flex items-center justify-center">
                  {totalCount}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Trending Suggested Search Pills */}
          <div className="mt-2.5 pt-2 border-t border-zinc-100/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1 shrink-0 pl-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trending:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {TRENDING_SEARCHES.map((term) => {
                const isSelected = search.toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTrendingClick(term)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[#5a31f4] text-white shadow-xs"
                        : "bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* 4. Dedicated 'Track Your Packages' Spotlight Banner */}
        <section
          aria-label="Islandwide Package Tracking Spotlight"
          className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-900 via-indigo-950 to-[#271052] text-white p-6 sm:p-8 shadow-lg border border-indigo-900/40"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-[11px] font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-indigo-300" />
                <span>Islandwide Courier Spotlight</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Track your packages in real-time
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Stay updated from order placement to doorstep handover across Sri Lanka (Pronto, Koombiyo, Domex, Certis Lanka).
              </p>
            </div>

            {/* Quick Order Tracking Input */}
            <div className="w-full md:w-auto shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (orderTrackCode.trim()) {
                    window.location.href = `/shop/${shop.slug || "store"}/track?code=${encodeURIComponent(orderTrackCode.trim())}`;
                  }
                }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 max-w-md"
              >
                <input
                  type="text"
                  placeholder="Order code (e.g. KAD-2026-X123)"
                  value={orderTrackCode}
                  onChange={(e) => setOrderTrackCode(e.target.value)}
                  className="px-3 py-2 bg-transparent text-xs sm:text-sm text-white placeholder:text-indigo-200/60 focus:outline-hidden font-mono uppercase w-full sm:w-56"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5a31f4] hover:bg-[#4a26d1] text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-sm"
                >
                  Track Order
                </button>
              </form>
              <div className="mt-2 text-right">
                <Link
                  href={`/shop/${shop.slug || "store"}/track`}
                  className="text-[11px] text-indigo-200 hover:text-white underline underline-offset-2 transition"
                >
                  View full tracking portal →
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative ambient background blur */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#5a31f4]/30 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* 5. Clean Category Pills with Subtle Emojis & Icons (No ugly missing text!) */}
        <section aria-label="Browse by category" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Categories
            </h2>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-semibold text-[#5a31f4] hover:underline cursor-pointer"
              >
                View All Categories
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* 'All Products' Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#5a31f4] text-white shadow-sm"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/70"
              }`}
            >
              <span>✨</span>
              <span>All Products</span>
              <span className="text-[10px] opacity-75 font-mono">({products.length})</span>
            </button>

            {/* Dynamic Category Pills */}
            {categoryNames.map((name) => {
              const isSelected = selectedCategory.toLowerCase() === name.toLowerCase();
              const count = products.filter(
                (p) => p.category?.name?.toLowerCase() === name.toLowerCase()
              ).length;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedCategory(name)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#5a31f4] text-white shadow-sm"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/70"
                  }`}
                >
                  <span>{getCategoryEmoji(name)}</span>
                  <span>{name}</span>
                  {count > 0 && (
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. Product Catalog Controls Toolbar */}
        <section id="shop-products-grid" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                {selectedCategory === "all" ? "Explore Catalog" : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-500">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                {search && ` matching "${search}"`}
              </p>
            </div>

            {/* Filter checkboxes & sorting */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#5a31f4] focus:ring-[#5a31f4]"
                />
                <span>In Stock Only</span>
              </label>

              <div className="flex items-center gap-1.5 bg-white border border-zinc-200/80 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
                  aria-label="Sort product catalog"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {(search || selectedCategory !== "all" || inStockOnly || sortBy !== "featured") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* 7. Product Cards Grid (White cards, rounded-2xl, soft borders, #5a31f4 accents) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredProducts.map((p) => {
                const isOut = p.stock_quantity <= 0;
                const isLow = p.stock_quantity > 0 && p.stock_quantity <= 3;
                const isAdded = addedId === p.id;
                const isSaved = wishlist.includes(p.id);
                const discount =
                  p.compare_at_price && p.compare_at_price > p.price
                    ? Math.round((1 - p.price / p.compare_at_price) * 100)
                    : 0;

                return (
                  <article
                    key={p.id}
                    className="bg-white border border-zinc-100 rounded-2xl p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group relative overflow-hidden"
                  >
                    {/* Visual Card Image Area */}
                    <div className="relative aspect-square w-full bg-zinc-50 rounded-xl overflow-hidden mb-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailProduct(p);
                          setDetailQty(1);
                        }}
                        className="w-full h-full block focus:outline-hidden cursor-pointer"
                        aria-label={`View details for ${p.name}`}
                      >
                        {getProductImage(p)}
                      </button>

                      {/* Stock Badges (Shop App style) */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-white font-extrabold text-[10px] tracking-wide uppercase">
                            Sold Out
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[10px] tracking-wide shadow-xs">
                            Only {p.stock_quantity} left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white font-extrabold text-[10px] tracking-wide shadow-xs">
                            In Stock
                          </span>
                        )}

                        {discount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[10px] tracking-wide w-fit">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-zinc-500 hover:text-rose-500 transition cursor-pointer"
                        aria-label={`${isSaved ? "Remove from" : "Add to"} wishlist`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isSaved ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {p.category?.name && (
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate mb-0.5">
                            {p.category.name}
                          </span>
                        )}
                        <h3
                          onClick={() => {
                            setDetailProduct(p);
                            setDetailQty(1);
                          }}
                          className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-[#5a31f4] transition line-clamp-2 leading-snug cursor-pointer"
                          title={p.name}
                        >
                          {p.name}
                        </h3>
                      </div>

                      {/* Price Row & Fast Add Button */}
                      <div className="pt-2.5 mt-auto flex items-center justify-between gap-1.5">
                        <div className="leading-tight">
                          <span className="block font-black text-xs sm:text-sm text-zinc-950 font-mono">
                            {formatCurrency(Number(p.price))}
                          </span>
                          {discount > 0 && p.compare_at_price && (
                            <del className="text-[10px] text-zinc-400 font-mono">
                              {formatCurrency(Number(p.compare_at_price))}
                            </del>
                          )}
                        </div>

                        {/* Fast 'Add to Bag' Button with Vibrant Purple CTA (#5a31f4) */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p, 1)}
                          disabled={isOut}
                          className={`h-8 px-2.5 sm:px-3 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                            isOut
                              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                              : isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#5a31f4] hover:bg-[#4a26d1] text-white"
                          }`}
                          aria-label={`Add ${p.name} to bag`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline text-[11px]">Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline text-[11px]">Add</span>
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
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-zinc-100 shadow-xs max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">No matching products found</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We couldn't find any products matching your current filters or search query. Try clearing your search or exploring another category.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5a31f4] hover:bg-[#4a26d1] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Reset all filters</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* 8. Trust & Local Fulfillment Guarantees */}
        <section
          aria-label="Store Guarantees"
          className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 pt-4 border-t border-zinc-100"
        >
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#5a31f4] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs font-bold text-zinc-900">Islandwide Shipping</strong>
              <span className="block text-[10px] text-zinc-500">2-4 Days All Provinces</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs font-bold text-zinc-900">Direct Merchant</strong>
              <span className="block text-[10px] text-zinc-500">Authentic & Verified</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs font-bold text-zinc-900">Cash on Delivery</strong>
              <span className="block text-[10px] text-zinc-500">Pay at Doorstep</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5a31f4] flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs font-bold text-zinc-900">WhatsApp Support</strong>
              <span className="block text-[10px] text-zinc-500">Fast 1-on-1 Help</span>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Product Details Quick-View Modal */}
      {detailProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailProduct(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {detailProduct.category?.name || "Product Overview"}
              </span>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-4">
              <div className="aspect-square w-full bg-zinc-50 rounded-2xl overflow-hidden relative">
                {getProductImage(detailProduct)}
              </div>

              <div>
                <h3
                  id="product-detail-modal-title"
                  className="text-lg font-black text-zinc-900 tracking-tight"
                >
                  {detailProduct.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-black text-zinc-950 font-mono">
                    {formatCurrency(Number(detailProduct.price))}
                  </span>
                  {detailProduct.compare_at_price && detailProduct.compare_at_price > detailProduct.price && (
                    <del className="text-xs text-zinc-400 font-mono">
                      {formatCurrency(Number(detailProduct.compare_at_price))}
                    </del>
                  )}
                </div>
              </div>

              {detailProduct.description && (
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs font-bold text-zinc-700 block mb-1">
                    Description
                  </span>
                  <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                    {detailProduct.description}
                  </p>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700">Quantity</span>
                <div className="flex items-center gap-2 border border-zinc-200 rounded-xl p-1 bg-zinc-50">
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                    disabled={detailQty <= 1}
                    className="p-1 rounded-lg hover:bg-white text-zinc-600 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono">
                    {detailQty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDetailQty((q) => Math.min(detailProduct.stock_quantity, q + 1))
                    }
                    disabled={detailQty >= detailProduct.stock_quantity}
                    className="p-1 rounded-lg hover:bg-white text-zinc-600 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(detailProduct, detailQty);
                  setDetailProduct(null);
                }}
                disabled={detailProduct.stock_quantity <= 0}
                className="flex-1 py-3 px-4 rounded-xl bg-[#5a31f4] hover:bg-[#4a26d1] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {detailProduct.stock_quantity <= 0 ? "Sold Out" : "Add to Shopping Bag"}
                </span>
              </button>

              {/* Direct WhatsApp Instant Buy Inquiry */}
              <a
                href={buildWhatsAppUrl(
                  cleanWaNumber,
                  `Hello! I am interested in purchasing "${detailProduct.name}" (Qty: ${detailQty}, Total: ${formatCurrency(
                    Number(detailProduct.price) * detailQty
                  )}) from your store on KADEO.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                title="Inquire directly on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden xs:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 10. 1-Click WhatsApp Direct Chat Floating Button (Sri Lanka buyer optimized) */}
      <aside aria-label="Direct WhatsApp customer support">
        <a
          href={generalWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 py-3 px-4.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Direct WhatsApp chat with seller"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="tracking-wide">Chat with Store</span>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </a>
      </aside>

      {/* 11. Footer */}
      <footer className="mt-16 bg-white border-t border-zinc-100 py-10 px-4 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-extrabold text-sm text-zinc-900 block">
              {shop.name}
            </span>
            <p className="max-w-md text-zinc-500">
              {shop.description || "Thoughtfully curated products delivered islandwide across Sri Lanka."}
            </p>
            {shop.address && (
              <p className="text-[11px] text-zinc-400">{shop.address}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-600 font-semibold">
            <Link
              href={`/shop/${shop.slug || "store"}/track`}
              className="hover:text-[#5a31f4] transition"
            >
              Live Package Tracker
            </Link>
            <StorePoliciesModal
              shopName={shop.name}
              whatsappNumber={shop.whatsapp_number}
              triggerLabel="Delivery & Return Terms"
              triggerClassName="text-inherit hover:text-[#5a31f4] transition cursor-pointer"
            />
          </div>

          <div className="text-center md:text-right text-[11px] text-zinc-400">
            <span>© {new Date().getFullYear()} {shop.name}.</span>{" "}
            <span className="font-semibold text-zinc-600">Powered by KADEO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ShopAppTheme;
