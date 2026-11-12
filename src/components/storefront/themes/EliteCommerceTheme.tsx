"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
    Heart,
  Eye,
  Plus,
  Phone,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Check,
  X,
  MessageCircle,
  Truck,
  ShieldCheck,
  SlidersHorizontal,
  Layers,
  Store,
  Tag,
  Package,
  MoreHorizontal,
  Minus,
  RotateCcw,
  Headphones,
  Maximize2,
  Crown,
} from "lucide-react";
import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/phone";
import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";
import { StorePoliciesModal } from "../StorePoliciesModal";
import { parseProductDescription } from "@/lib/product-variants";

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
  categories: { id: string; name: string; slug: string; image_url?: string | null; imageUrl?: string | null }[];
  products: ProductItem[];
}

// Curated pastel palettes for category cards matching the luxury e-commerce UI
const CATEGORY_PALETTES = [
  { bg: "bg-gradient-to-b from-[#f3faf5] to-[#e4f5eb]" }, // Mint (Hair Care)
  { bg: "bg-gradient-to-b from-[#f2f7fd] to-[#e4eefa]" }, // Sky Blue (Skin Care)
  { bg: "bg-gradient-to-b from-[#fdf4fa] to-[#f9e5f3]" }, // Lavender Pink (Beauty)
  { bg: "bg-gradient-to-b from-[#fff5f2] to-[#fde7e2]" }, // Peach Coral (Makeup)
  { bg: "bg-gradient-to-b from-[#f0faf7] to-[#dff5ee]" }, // Seafoam (Personal Care)
  { bg: "bg-gradient-to-b from-[#fdf3f8] to-[#f9e2f1]" }, // Rose / Orchid (Fragrances)
  { bg: "bg-gradient-to-b from-[#fffef5] to-[#fef3db]" }, // Cream / Sand (Home & Living)
  { bg: "bg-gradient-to-b from-[#f2f6fa] to-[#e3ecf5]" }, // Slate / Cool Blue (Men's Care)
  { bg: "bg-gradient-to-b from-[#fff7f0] to-[#fde8d9]" }, // Apricot / Warm (Baby Care)
  { bg: "bg-gradient-to-b from-[#f8f5fc] to-[#efe9fa]" }, // Soft Lilac (More)
];

function resolveCategoryVisual(catName: string, products: ProductItem[], existingImageUrl?: string | null): string {
  const lower = catName.toLowerCase().trim();

  // If there's an existing image url that was uploaded or set to /images or /uploads
  if (existingImageUrl && (existingImageUrl.startsWith("/images") || existingImageUrl.startsWith("/uploads") || existingImageUrl.startsWith("/api") || existingImageUrl.startsWith("data:"))) {
    return existingImageUrl;
  }

  // 1. Direct keywords to the 9 high-quality cutout images in public/images
  if (lower.includes("hair") || lower.includes("shampoo") || lower.includes("oil")) {
    return "/images/img01.png";
  }
  if (
    lower.includes("skin") ||
    lower.includes("gel") ||
    lower.includes("aloe") ||
    lower.includes("cream") ||
    lower.includes("lotion") ||
    lower.includes("saloon")
  ) {
    return "/images/img02.png";
  }
  if (lower.includes("beauty") || lower.includes("serum") || lower.includes("cosmetic")) {
    return "/images/img03.png";
  }
  if (lower.includes("makeup") || lower.includes("powder") || lower.includes("blush") || lower.includes("lipstick")) {
    return "/images/img04.png";
  }
  if (lower.includes("personal") || lower.includes("care") || lower.includes("body") || lower.includes("bath") || lower.includes("soap")) {
    return "/images/img05.png";
  }
  if (lower.includes("fragrance") || lower.includes("perfume") || lower.includes("scent") || lower.includes("spray") || lower.includes("cologne")) {
    return "/images/img06.png";
  }
  if (lower.includes("home") || lower.includes("living") || lower.includes("diffuser") || lower.includes("aroma") || lower.includes("candle")) {
    return "/images/img07.png";
  }
  if (lower.includes("men") || lower.includes("grooming") || lower.includes("beard") || lower.includes("shave")) {
    return "/images/img08.png";
  }
  if (lower.includes("baby") || lower.includes("kid") || lower.includes("child") || lower.includes("toddler") || lower.includes("toy")) {
    return "/images/img09.png";
  }

  // 2. Fallback to existing image url if provided (e.g. valid external https://)
  if (existingImageUrl && existingImageUrl.startsWith("http")) {
    return existingImageUrl;
  }

  // 3. Real product photo from seller's catalog in this category
  const matchingProduct = products.find(
    (p) =>
      p.category?.name?.trim().toLowerCase() === lower &&
      p.images &&
      p.images.length > 0 &&
      p.images[0].storage_path
  );
  if (matchingProduct?.images?.[0]?.storage_path) {
    return matchingProduct.images[0].storage_path;
  }

  // 4. Fallback rotation across the 9 clean cutout images
  const fallbackImages = [
    "/images/img01.png",
    "/images/img02.png",
    "/images/img03.png",
    "/images/img04.png",
    "/images/img05.png",
    "/images/img06.png",
    "/images/img07.png",
    "/images/img08.png",
    "/images/img09.png",
  ];
  let hash = 0;
  for (let i = 0; i < catName.length; i++) {
    hash = (hash + catName.charCodeAt(i)) % fallbackImages.length;
  }
  return fallbackImages[hash];
}



const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=85",
];


interface ProductQuickViewModalProps {
  product: ProductItem;
  onClose: () => void;
  onAddToCart: (
    p: ProductItem,
    variantName?: string,
    size?: string,
    qty?: number,
    priceOverride?: number
  ) => void;
  whatsAppNumber: string;
}

function ProductQuickViewModal({
  product,
  onClose,
  onAddToCart,
  whatsAppNumber,
}: ProductQuickViewModalProps) {
  const { cleanDescription, variants } = parseProductDescription(product.description);
  const images = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img) => img.storage_path);
    }
    return [
      "/images/serum/serum-original.png",
      "/images/serum/serum-greentea.png",
      "/images/serum/serum-lavender.png",
      "/images/serum/serum-rose.png",
      "/images/serum/serum-box.png",
    ];
  }, [product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex?: string;
    price?: number;
  } | null>(variants?.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    variants?.sizes?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const effectivePrice = selectedColor?.price
    ? Number(selectedColor.price)
    : Number(product.price);
  const comparePrice = product.compare_at_price
    ? Number(product.compare_at_price)
    : null;
  const discountPercent =
    comparePrice && comparePrice > effectivePrice
      ? Math.round(((comparePrice - effectivePrice) / comparePrice) * 100)
      : null;

  const currentImage = images[activeImageIndex] || images[0];

  const waMessage = useMemo(() => {
    const parts = [`Hello, I would like to order: ${product.name}`];
    if (selectedColor) parts.push(`Variant: ${selectedColor.name}`);
    if (selectedSize) parts.push(`Size: ${selectedSize}`);
    parts.push(`Quantity: ${quantity}`);
    parts.push(`Total: ${formatCurrency(effectivePrice * quantity)}`);
    return parts.join("\n");
  }, [product.name, selectedColor, selectedSize, quantity, effectivePrice]);

  const waUrl = buildWhatsAppUrl(whatsAppNumber, waMessage);

  const handleSelectColor = (
    colorVar: { name: string; hex?: string; price?: number },
    idx: number
  ) => {
    setSelectedColor(colorVar);
    if (idx < images.length) {
      setActiveImageIndex(idx);
    }
  };

  const formattedDescription = (cleanDescription || "Nourishing organic hair growth serum with rosemary, biotin and essential herbal extracts. Helps reduce hair fall and promote healthier, thicker hair.")
    .replace(/\\n/g, " ")
    .trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="product-quick-view-modal fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-5xl xl:max-w-6xl w-full p-4 sm:p-8 lg:p-9 shadow-2xl relative border border-gray-100 max-h-[94vh] overflow-y-auto">
        <div className="product-quick-view-grid grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: Gallery & Main Image */}
          <div className="w-full">
            <div className="relative w-full aspect-square bg-[#F7F7F5] rounded-2xl sm:rounded-3xl overflow-hidden select-none shadow-xs">
              {/* Bestseller Badge */}
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-[#00875A] shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>Bestseller</span>
              </div>

              {/* Expand Button */}
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition backdrop-blur-xs cursor-pointer"
                title={isZoomed ? "Zoom out" : "Zoom in"}
                aria-label="Toggle zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Prev / Next Slide Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Main Photo */}
              <img
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? "scale-125" : "scale-100"
                }`}
              />
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 sm:gap-3 mt-3.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 transition bg-white border-2 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#00875A] ring-2 ring-[#00875A]/25 scale-100"
                        : "border-gray-100 hover:border-gray-200 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Details & Options */}
          <div className="w-full flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Close */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#00875A] bg-[#E8F8F0] border border-[#C6F0DC] uppercase tracking-wide">
                  🌿 {product.category?.name || "Featured Item"}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Title */}
              <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 leading-tight tracking-tight mt-2.5">
                {product.name}
              </h2>

              

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mt-3.5">
                <span className="text-3xl sm:text-4xl font-black text-[#00875A]">
                  {formatCurrency(effectivePrice)}
                </span>
                {comparePrice && comparePrice > effectivePrice && (
                  <>
                    <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">
                      {formatCurrency(comparePrice)}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3">
                {formattedDescription}
              </p>

              {/* Color / Variant */}
              {variants?.colors && variants.colors.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Color / Variant
                    </span>
                    <span className="text-xs text-gray-500">
                      Select a variant
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {variants.colors.map((colorVar, idx) => {
                      const isSelected = selectedColor?.name === colorVar.name;
                      const variantPrice = colorVar.price
                        ? Number(colorVar.price)
                        : Number(product.price);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectColor(colorVar, idx)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? "border-[#00875A] bg-[#E8F8F0]/40 ring-1 ring-[#00875A]"
                              : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                            style={{
                              backgroundColor: colorVar.hex || "#333333",
                            }}
                          />
                          <div className="leading-tight truncate">
                            <div className="text-xs font-bold text-gray-900 truncate">
                              {colorVar.name}
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium">
                              {formatCurrency(variantPrice)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes (for apparel / clothing) */}
              {variants?.sizes && variants.sizes.length > 0 && (
                <div className="mt-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Size
                    </span>
                    <span className="text-xs text-gray-500">Select size</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variants.sizes.map((sz, idx) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[42px] px-3.5 py-1.5 rounded-lg font-bold text-xs border text-center transition cursor-pointer ${
                            isSelected
                              ? "border-[#00875A] bg-[#00875A] text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions & Trust Badges */}
            <div className="mt-6 pt-2">
              {/* Quantity + Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Quantity */}
                <div className="inline-flex items-center border border-gray-200 rounded-full p-1 bg-gray-50/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-xs font-bold text-base transition disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-bold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(product.stock_quantity || 99, q + 1)
                      )
                    }
                    disabled={quantity >= (product.stock_quantity || 99)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-xs font-bold text-base transition disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart(
                      product,
                      selectedColor?.name,
                      selectedSize || undefined,
                      quantity,
                      effectivePrice
                    )
                  }
                  disabled={product.stock_quantity <= 0}
                  className="flex-1 min-w-[140px] py-3.5 px-6 rounded-full bg-[#00875A] hover:bg-[#00734c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                {/* Instant WhatsApp Order */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#047857] font-bold text-xs sm:text-sm border border-[#A7F3D0] hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer w-full sm:w-auto shrink-0 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#047857]" />
                  <span>Instant WhatsApp Order</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="product-trust-badges-grid grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E7F3ED] mt-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Truck className="w-4 h-4 text-[#00875A] shrink-0" />
                  <span>Islandwide Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-[#00875A] shrink-0" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <RotateCcw className="w-4 h-4 text-[#00875A] shrink-0" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Headphones className="w-4 h-4 text-[#00875A] shrink-0" />
                  <span>Customer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function EliteCommerceTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();

  // State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [policyModal, setPolicyModal] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);

  // Hero Image Slider State
  const customHeroSlides = [
    t("slider:slide:1") || t("hero:slide_1:image") || shop.banner_url,
    t("slider:slide:2") || t("hero:slide_2:image"),
    t("slider:slide:3") || t("hero:slide_3:image"),
    t("slider:slide:4") || t("hero:slide_4:image"),
    t("slider:slide:5") || t("hero:slide_5:image"),
  ].filter(Boolean) as string[];

  const heroSlides = customHeroSlides.length > 0 ? customHeroSlides : DEFAULT_SLIDES;
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  useEffect(() => {
    if (isSliderPaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSliderPaused, heroSlides.length]);

  // Style overrides & theme variables
  const primaryColor = t("theme:primary_color") || t("custom:buttons:background") || "#00A859";
  const secondaryColor = t("theme:secondary_color") || t("custom:navbar:background") || "#0b3b24";

  // Section visibility checks
  const isSectionVisible = (sec: string) => t(`visibility:section:${sec}`) !== "hidden";

  // Category list ONLY from categories added by the seller (from DB categories and/or products)
  const categoryList = useMemo(() => {
    const list: { id: string; name: string; slug?: string; image_url?: string | null }[] = [];
    const seenNames = new Set<string>();

    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        const trimmed = cat.name?.trim();
        if (trimmed && !seenNames.has(trimmed.toLowerCase())) {
          seenNames.add(trimmed.toLowerCase());
          list.push({ id: cat.id, name: trimmed, slug: cat.slug, image_url: (cat as any).image_url || (cat as any).imageUrl || null });
        }
      });
    }

    if (products && products.length > 0) {
      products.forEach((p, idx) => {
        const catName = p.category?.name?.trim();
        if (catName && !seenNames.has(catName.toLowerCase())) {
          seenNames.add(catName.toLowerCase());
          list.push({
            id: `prod-cat-${idx}`,
            name: catName,
            slug: catName.toLowerCase().replace(/\s+/g, "-"),
          });
        }
      });
    }

    return list.map((cat, idx) => {
      const palette = CATEGORY_PALETTES[idx % CATEGORY_PALETTES.length];
      return {
        id: cat.id,
        name: cat.name,
        image: resolveCategoryVisual(cat.name, products, (cat as any).image_url),
        bg: palette.bg,
      };
    });
  }, [categories, products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === "all" ||
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        `${p.name} ${p.description || ""}`.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  // Wishlist toggle
  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const handleAddModalToCart = (
    p: ProductItem,
    variantName?: string,
    size?: string,
    qty = 1,
    priceOverride?: number
  ) => {
    let displayName = p.name;
    const tags: string[] = [];
    if (variantName) tags.push(variantName);
    if (size) tags.push(size);
    if (tags.length > 0) {
      displayName = `${p.name} (${tags.join(", ")})`;
    }

    const cartId = [p.id, variantName, size].filter(Boolean).join("-");

    addItem(
      {
        id: cartId,
        name: displayName,
        price: priceOverride ?? Number(p.price),
        imageUrl: p.images?.[0]?.storage_path,
        maxStock: p.stock_quantity ?? 99,
      },
      qty
    );
    setCartToast(`Added ${qty} × ${displayName} to bag`);
    setTimeout(() => setCartToast(null), 3000);
    setDetailProduct(null);
    setIsOpen(true);
  };

  // Add to cart with feedback
  const handleAddToCart = (p: ProductItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (p.stock_quantity <= 0) return;
    addItem({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.images?.[0]?.storage_path,
      maxStock: p.stock_quantity,
    });
    setCartToast(`Added "${p.name}" to cart!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  // WhatsApp checkout link
  const wa = buildWhatsAppUrl(shop.whatsapp_number);

  // Content text overrides
  const topAnnouncement = t("elite:topbar:announcement") || t("announcement:text") || "Get 50% off on Member Exclusive Month";
  const contactPhone = t("elite:topbar:phone") || shop.whatsapp_number || "(403) 555-0102";
  const categoriesHeading = t("elite:categories:title") || "Best Categories";
  const productsHeading = t("elite:products:title") || t("section:products:title") || "For You";

  // Hero section visibility & texts
  const showHeroSection = isSectionVisible("hero");
  const showHeroContent = showHeroSection && t("visibility:hero:content", "shown") !== "hidden";
  const showHeroEyebrow = t("visibility:hero:eyebrow", "shown") !== "hidden";
  const showHeroTitle = t("visibility:hero:title", "shown") !== "hidden";
  const showHeroDesc = t("visibility:hero:description", "shown") !== "hidden";
  const showHeroBtn = t("visibility:hero:button", "shown") !== "hidden";

  const heroEyebrow = t("element:hero_eyebrow:text", t("elite:hero:tag", t("hero:eyebrow", t("section:hero:badge", "— Today Best Deal"))));
  const heroTitle = t("element:hero_title:text", t("elite:hero:title", t("hero:title", t("section:hero:heading", "NEW ARRIVALS WINTER SALE"))));
  const heroDesc = t("element:hero_desc:text", t("elite:hero:desc", t("hero:desc", t("section:hero:subheading", "Premium sound, deep bass, and 30% off your perfect vibe starts here."))));
  const heroBtnText = t("element:hero_cta:text", t("elite:hero:btn_text", t("hero:cta", t("section:hero:button_text", "Shop Now →"))));
  const heroBtnUrl = t("element:hero_cta:url", t("elite:hero:btn_url", t("section:hero:button_url", "#elite-products-grid")));
  const heroAlign = t("element:hero_title:align", "left");

  // Determine if hero text is actually visible and if dark contrast overlay should be rendered
  const isHeroTextVisible = showHeroTitle && Boolean(heroTitle);
  const isAnyHeroItemVisible =
    isHeroTextVisible ||
    (showHeroDesc && Boolean(heroDesc)) ||
    (showHeroEyebrow && Boolean(heroEyebrow)) ||
    (showHeroBtn && Boolean(heroBtnText));

  // Only render dark shading overlay if text is visible. If text is hidden, remove shading completely!
  const showDarkOverlay =
    showHeroContent &&
    isHeroTextVisible &&
    t("visibility:hero:overlay", "shown") !== "hidden";

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#1a2e26] font-sans antialiased selection:bg-[#00A859] selection:text-white pb-24">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f3d26] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#00A859]/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-7 h-7 rounded-full bg-[#00A859] flex items-center justify-center text-white">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{cartToast}</span>
          <button
            onClick={() => setIsOpen(true)}
            className="ml-2 text-xs font-bold text-[#6ee7b7] hover:underline"
          >
            View Bag
          </button>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      {isSectionVisible("banner") && (
        <div
          className="bg-[#0b3820] text-emerald-100 text-xs py-2 px-4 sm:px-8 border-b border-emerald-900/50"
          style={{
            backgroundColor: secondaryColor,
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs">
            {/* Left utility links */}
            <div className="flex items-center gap-4 text-emerald-200/80">
              <button
                onClick={() => setPolicyModal("about")}
                className="hover:text-white transition"
              >
                About
              </button>
              <span className="text-emerald-700">•</span>
              <button
                onClick={() => setPolicyModal("privacy")}
                className="hover:text-white transition"
              >
                Privacy Policy
              </button>
              <span className="text-emerald-700">•</span>
              <button
                onClick={() => setPolicyModal("terms")}
                className="hover:text-white transition"
              >
                Terms & Condition
              </button>
            </div>

            {/* Center promotion highlight */}
            <div className="hidden md:flex items-center gap-2 font-medium text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
              <span>{topAnnouncement}</span>
            </div>

            {/* Right contact, wishlist, cart, and sign-in */}
            <div className="flex items-center gap-3.5 ml-auto sm:ml-0 font-medium">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 hover:text-white transition text-emerald-300"
              >
                <Phone className="w-3.5 h-3.5 text-[#00A859]" />
                <span>{contactPhone}</span>
              </a>

              {/* Wishlist badge */}
              <button
                onClick={() => {
                  if (wishlist.length > 0) {
                    setSelectedCategory("all");
                    const el = document.getElementById("elite-products-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="relative p-1 hover:text-white transition"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.length > 0 ? "fill-red-500 text-red-500" : "text-emerald-300"
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-1 hover:text-white transition"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#00A859] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Sign in button pill */}
              <a
                href={`/shop/${shop.slug}/login`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#0b3820] font-bold text-[11px] hover:bg-emerald-100 transition shadow-sm"
              >
                <User className="w-3 h-3 text-[#00A859]" />
                <span>Sign In</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MAIN HEADER & BRAND ROW */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Logo */}
          <Link
            href={`/shop/${shop.slug}`}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00A859] to-[#34d399] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <Store className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-base sm:text-xl font-black tracking-tight text-[#0f3d26] flex items-center gap-1">
                <span>{shop.name || "ELITE COMMERCE"}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold hidden sm:block">
                Mega Retail Store
              </p>
            </div>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for Products or category"
                className="w-full bg-[#f4f7f5] hover:bg-[#edf2ee] focus:bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 pl-4 pr-12 py-2.5 sm:py-3 rounded-full border border-transparent focus:border-[#00A859] focus:outline-none transition shadow-inner"
              />
              <button
                type="button"
                className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00A859] hover:bg-[#00914c] flex items-center justify-center text-white transition shadow-sm"
                aria-label="Search"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick Cart Pill on Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/60 transition text-[#0f3d26]"
            >
              <ShoppingBag className="w-4 h-4 text-[#00A859]" />
              <div className="text-left text-xs">
                <div className="text-[10px] text-gray-500 leading-tight">My Cart</div>
                <div className="font-bold text-[#00A859] leading-tight">
                  {totalCount} {totalCount === 1 ? "Item" : "Items"}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-t border-gray-100 bg-white px-4 sm:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
            {/* All Category Dropdown Button */}
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearch("");
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                selectedCategory === "all"
                  ? "bg-[#00A859] text-white shadow-emerald-500/20"
                  : "bg-emerald-50 text-[#00A859] hover:bg-emerald-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Category</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Horizontal Category Links */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === "all"
                    ? "text-[#00A859] bg-emerald-50"
                    : "text-gray-600 hover:text-[#00A859] hover:bg-gray-50"
                }`}
              >
                Home
              </button>
              {categoryList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    const el = document.getElementById("elite-products-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? "text-white bg-[#00A859] shadow-sm"
                      : "text-gray-600 hover:text-[#00A859] hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* HERO IMAGE SLIDER SECTION (Clean, immersive, zero text clutter) */}
      {isSectionVisible("hero") && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
          <div
            className="relative rounded-3xl overflow-hidden shadow-lg border border-black/5 bg-gray-100 group"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            {/* Slider track */}
            <div className="relative w-full h-[220px] xs:h-[280px] sm:h-[380px] md:h-[450px] lg:h-[480px] overflow-hidden">
              {heroSlides.map((slideUrl, idx) => {
                const isActive = idx === currentHeroSlide;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                      isActive
                        ? "opacity-100 z-10 pointer-events-auto scale-100"
                        : "opacity-0 z-0 pointer-events-none scale-105"
                    }`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={slideUrl}
                      alt={`Banner Slide ${idx + 1}`}
                      fetchPriority={idx === 0 ? "high" : "low"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {/* Hero Text Overlay (Customizable via Dashboard Themes) */}
              {showHeroContent && isAnyHeroItemVisible && (
                <div
                  className={`absolute inset-0 z-15 flex items-center px-6 sm:px-12 md:px-16 pointer-events-none transition-all duration-300 ${
                    showDarkOverlay
                      ? "bg-gradient-to-r from-black/65 via-black/35 to-transparent"
                      : "bg-transparent"
                  }`}
                >
                  <div className={`max-w-xl space-y-2 sm:space-y-3.5 text-white pointer-events-auto ${heroAlign === "center" ? "text-center mx-auto" : heroAlign === "right" ? "text-right ml-auto" : "text-left"}`}>
                    {showHeroEyebrow && heroEyebrow && (
                      <span className="inline-block text-xs sm:text-sm font-bold text-emerald-300 tracking-wider">
                        {heroEyebrow}
                      </span>
                    )}
                    {showHeroTitle && heroTitle && (
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm uppercase">
                        {heroTitle}
                      </h1>
                    )}
                    {showHeroDesc && heroDesc && (
                      <p className="text-xs sm:text-sm md:text-base text-emerald-50/90 font-medium leading-relaxed max-w-lg line-clamp-3">
                        {heroDesc}
                      </p>
                    )}
                    {showHeroBtn && heroBtnText && (
                      <div className="pt-2 sm:pt-3">
                        <a
                          href={heroBtnUrl || "#elite-products-grid"}
                          onClick={(e) => {
                            if (heroBtnUrl?.startsWith("#") || !heroBtnUrl) {
                              e.preventDefault();
                              document.getElementById("elite-products-grid")?.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white text-[#00A859] hover:bg-emerald-50 hover:text-[#0b3820] text-xs sm:text-sm font-black transition shadow-lg cursor-pointer active:scale-95"
                        >
                          <span>{heroBtnText}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prev Slide Arrow Button */}
              {heroSlides.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentHeroSlide(
                      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                    );
                  }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer active:scale-95"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Next Slide Arrow Button */}
              {heroSlides.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
                  }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer active:scale-95"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Bottom Pagination Dots */}
              {heroSlides.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                  {heroSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentHeroSlide(dotIdx);
                      }}
                      className={`transition-all duration-300 cursor-pointer ${
                        dotIdx === currentHeroSlide
                          ? "w-7 sm:w-8 h-2 sm:h-2.5 rounded-full bg-white shadow-md scale-105"
                          : "w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* BEST CATEGORIES SECTION (Only shown when seller has added categories) */}
      {isSectionVisible("categories") && categoryList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3d26] tracking-tight">
                {categoriesHeading}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Browse our top departmental collections
              </p>
            </div>

            {/* Carousel navigation controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const container = document.getElementById("categories-carousel");
                  container?.scrollBy({ left: -260, behavior: "smooth" });
                }}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm transition"
                aria-label="Previous Categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById("categories-carousel");
                  container?.scrollBy({ left: 260, behavior: "smooth" });
                }}
                className="w-9 h-9 rounded-full bg-[#00A859] hover:bg-[#00914c] flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 transition"
                aria-label="Next Categories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Cards Carousel / Row */}
          <div
            id="categories-carousel"
            className="flex items-center gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none pb-3 pt-1 px-1 -mx-1"
          >
            {categoryList.map((cat, idx) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id || idx}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCategory("all");
                    } else {
                      setSelectedCategory(cat.name);
                    }
                    const el = document.getElementById("elite-products-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`shrink-0 w-[96px] sm:w-[104px] h-[108px] sm:h-[116px] rounded-[18px] sm:rounded-[20px] p-2.5 pb-2.5 pt-3 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 group active:scale-95 text-left focus:outline-none ${
                    isSelected
                      ? "border-2 border-[#00A859] bg-[#eef8f2] shadow-sm shadow-emerald-500/15"
                      : `${cat.bg} border border-black/[0.04] hover:-translate-y-1 hover:shadow-md`
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="w-full h-14 sm:h-16 flex items-center justify-center relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-110 transition duration-300 pointer-events-none select-none"
                      loading="lazy"
                    />
                  </div>
                  <h3
                    className={`text-[11px] sm:text-xs font-bold text-center tracking-tight leading-tight px-1 truncate w-full transition-colors ${
                      isSelected ? "text-[#00A859]" : "text-gray-900 group-hover:text-gray-950"
                    }`}
                  >
                    {cat.name}
                  </h3>
                </button>
              );
            })}

            {/* "More" Card at the end */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                const el = document.getElementById("elite-products-grid");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="shrink-0 w-[96px] sm:w-[104px] h-[108px] sm:h-[116px] rounded-[18px] sm:rounded-[20px] bg-gradient-to-b from-[#f8f5fc] to-[#efe9fa] border border-black/[0.04] p-2.5 pb-2.5 pt-3 flex flex-col items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 group active:scale-95 text-left focus:outline-none"
              aria-label="View all categories"
            >
              <div className="w-full h-14 sm:h-16 flex items-center justify-center relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <MoreHorizontal className="w-5 h-5 text-gray-800" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 text-center tracking-tight leading-tight px-1 truncate w-full">
                More
              </span>
            </button>
          </div>
        </section>
      )}

      {/* FOR YOU (PRODUCT CATALOG) SECTION */}
      {isSectionVisible("products") && (
        <section
          id="elite-products-grid"
          className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f3d26] tracking-tight">
                {selectedCategory === "all" ? productsHeading : selectedCategory}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} available
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearch("");
                }}
                className="text-xs font-bold text-[#00A859] hover:underline flex items-center gap-1"
              >
                <span>See All Product</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No items match your active search or category filters. Try resetting filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearch("");
                }}
                className="px-5 py-2.5 rounded-full bg-[#00A859] text-white text-xs font-bold shadow-md hover:bg-[#00914c] transition"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => {
                const isLiked = wishlist.includes(p.id);
                const hasDiscount =
                  p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((Number(p.compare_at_price) - Number(p.price)) /
                        Number(p.compare_at_price)) *
                        100
                    )
                  : null;

                const photoUrl =
                  p.images?.[0]?.storage_path ||
                  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80";

                return (
                  <article
                    key={p.id}
                    className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-gray-100/90 hover:border-emerald-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
                    style={{
                      borderRadius: t("shape:card_radius") ? `${t("shape:card_radius")}px` : "20px",
                    }}
                  >
                    {/* Top Image Container with subtle off-white background */}
                    <div
                      onClick={() => setDetailProduct(p)}
                      className="relative w-full aspect-square bg-[#f4f4f5] rounded-xl sm:rounded-2xl overflow-hidden mb-3 flex items-center justify-center p-3 sm:p-4 cursor-pointer"
                    >
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-[#e63946] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}

                      {/* Floating Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(p.id, e)}
                        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                          isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"
                        }`}
                        aria-label="Save to Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </button>

                      {/* Product Image */}
                      <img
                        src={photoUrl}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition duration-300 pointer-events-none select-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Metadata & Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category Label */}
                        <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-tight mb-0.5 line-clamp-1">
                          {p.category?.name || "Personal Care"}
                        </p>

                        {/* Product Title */}
                        <h3
                          onClick={() => setDetailProduct(p)}
                          className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#00A859] cursor-pointer transition-colors leading-snug mb-1"
                        >
                          {p.name}
                        </h3>
                      </div>

                      {/* Bottom Row: Price on Left, Shopping Cart Button on Right */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-[#00A859] tracking-tight">
                            {formatCurrency(Number(p.price))}
                          </span>
                          {hasDiscount && (
                            <del className="text-[11px] text-gray-400 font-medium -mt-0.5">
                              {formatCurrency(Number(p.compare_at_price))}
                            </del>
                          )}
                        </div>

                        {/* Circular Green Cart Button with ShoppingCart Icon */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(p, e)}
                          disabled={p.stock_quantity <= 0}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00A859] hover:bg-[#00914c] disabled:bg-gray-200 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          aria-label={`Add ${p.name} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* QUICK VIEW MODAL */}
      {detailProduct && (
        <ProductQuickViewModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddModalToCart}
          whatsAppNumber={shop.whatsapp_number}
        />
      )}

      {/* POLICY MODAL */}
      {policyModal && (
        <StorePoliciesModal
          type={policyModal as any}
          shopName={shop.name}
          onClose={() => setPolicyModal(null)}
        />
      )}

      {/* FOOTER */}
      {isSectionVisible("footer") && (
        <footer className="mt-20 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand info */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00A859] flex items-center justify-center text-white">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base text-[#0f3d26]">{shop.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {shop.description || "Your favorite online marketplace with fast delivery and islandwide service."}
                </p>
                {shop.address && (
                  <p className="text-[11px] text-gray-400">{shop.address}</p>
                )}
              </div>

              {/* Fast Delivery & Trust */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Shop Safely
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Fast Islandwide COD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Verified Seller Guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Direct WhatsApp Chat</span>
                  </li>
                </ul>
              </div>

              {/* Quick Categories */}
              {categoryList.length > 0 && (
                <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Top Departments
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {categoryList.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(c.name);
                          const el = document.getElementById("elite-products-grid");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="hover:text-[#00A859] transition"
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
                </div>
              )}

              {/* Contact Seller */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Customer Care
                </h4>
                <p className="text-xs text-gray-500">
                  Have questions about an order or delivery?
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#00A859] text-white font-bold text-xs shadow-sm hover:bg-[#00914c] transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
              <p>© {new Date().getFullYear()} {shop.name}. Powered by Kadeo Platform.</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setPolicyModal("privacy")} className="hover:underline">
                  Privacy Policy
                </button>
                <button onClick={() => setPolicyModal("terms")} className="hover:underline">
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
