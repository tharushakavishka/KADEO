import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MapPin,
  Share2,
  Check,
  ArrowLeft,
  ShoppingBag,
  Search,
  Star,
  Truck,
  ShieldCheck,
  Plus,
  RefreshCw,
  X,
  BadgeCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { Shop, Product, Category } from '../../types';
import { StorageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';

interface CeylonLinenStorefrontProps {
  shop: Shop;
  products: Product[];
  categories: Category[];
  isDemoPreview?: boolean;
}

export const CeylonLinenStorefront: React.FC<CeylonLinenStorefrontProps> = ({
  shop,
  products,
  categories,
  isDemoPreview = false,
}) => {
  const { totalItems, setIsCartOpen, addItem } = useCart();

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'match' | 'price-low' | 'price-high'>('match');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Hero Slider State (Standard modern e-commerce hero banner carousel)
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Clean WhatsApp number
  const cleanPhone = StorageService.formatWhatsAppNumber(shop.whatsappNumber || '94771234567');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello Ceylon Linen Co.! 👋 I'm browsing your online store on Kadeo and would like to inquire about piece availability.`
  )}`;

  // Hero Slides Data
  const slides = useMemo(() => [
    {
      id: 1,
      badge: 'NEW SEASON 2026 // RESORT EDIT',
      title: 'The Poetry of Pure European Flax',
      subtitle: 'Spun from 100% natural European flax fibers and cut by hand in Kollupitiya, Colombo. Tailored for equatorial ease.',
      ctaText: 'Explore Collection',
      ctaCategory: 'all',
      image: shop.coverImage || '/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg',
      highlight: '100% Pure Flax · 220 GSM · Zero Synthetics',
    },
    {
      id: 2,
      badge: 'ATELIER SIGNATURE CREATION',
      title: 'Terracotta Linen Wrap Midi Dress',
      subtitle: 'A timeless resort silhouette featuring an adjustable wrap waist, deep side pockets, and breathable pre-washed linen.',
      ctaText: 'Shop Wrap Dresses',
      ctaCategory: 'dresses',
      image: '/src/assets/images/ceylon_linen_lookbook_lifestyle_1792347214913.jpg',
      highlight: 'Naturally Enzyme Washed · Pre-Shrunk Fit',
    },
    {
      id: 3,
      badge: 'EVERYDAY TROPICAL LUXURY',
      title: 'Relaxed Camp-Collar Resort Shirts',
      subtitle: 'Washed European linen with mother-of-pearl buttons and a comfortable drape that lets ocean breezes pass through.',
      ctaText: 'Shop Resort Shirts',
      ctaCategory: 'shirts',
      image: '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg',
      highlight: 'Limited Boutique Runs · Colombo 03',
    },
  ], [shop.coverImage]);

  // Auto-advance hero slides every 5 seconds (pauses on hover per accessibility guidelines)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: products.length,
      shirts: products.filter(p => p.slug.includes('shirt') || p.slug.includes('overshirt')).length,
      dresses: products.filter(p => p.slug.includes('dress')).length,
      bottoms: products.filter(p => p.slug.includes('trousers') || p.slug.includes('shorts')).length,
      accessories: products.filter(p => p.slug.includes('tote') || p.slug.includes('bag')).length,
    };
  }, [products]);

  // Dynamic Category Tabs: Synchronized with seller's real categories
  const categoryTabs = useMemo(() => {
    const list = [{ id: 'all', label: `All Products (${products.length})` }];
    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        const count = products.filter(p => p.categoryId === cat.id).length;
        list.push({ id: cat.id, label: `${cat.name} (${count})` });
      });
    } else {
      list.push(
        { id: 'shirts', label: `Shirts (${categoryCounts.shirts})` },
        { id: 'dresses', label: `Dresses (${categoryCounts.dresses})` },
        { id: 'bottoms', label: `Shorts & Pants (${categoryCounts.bottoms})` },
        { id: 'accessories', label: `Bags (${categoryCounts.accessories})` }
      );
    }
    return list;
  }, [categories, products, categoryCounts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter(p => {
        if (selectedCategory === 'shirts') return p.slug.includes('shirt') || p.slug.includes('overshirt');
        if (selectedCategory === 'dresses') return p.slug.includes('dress');
        if (selectedCategory === 'bottoms') return p.slug.includes('trousers') || p.slug.includes('shorts');
        if (selectedCategory === 'accessories') return p.slug.includes('tote') || p.slug.includes('bag');
        return p.categoryId === selectedCategory;
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Filter by in-stock
    if (inStockOnly) {
      list = list.filter(p => p.stockQuantity > 0);
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;

    addItem(product, shop, 1);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setIsCartOpen(true);
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-neutral-900 font-sans antialiased pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP UTILITY HEADER (E-commerce Navigation Bar)
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Back Link & Store Brand */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kadeo Marketplace</span>
            </Link>

            <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

            <Link to="/shop/ceylon-linen" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-full border border-neutral-300 overflow-hidden bg-neutral-100 shrink-0">
                <img
                  src={shop.logo || '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg'}
                  alt={shop.name}
                  className="h-full w-full object-cover grayscale contrast-105"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-neutral-900 block leading-none">
                  Ceylon Linen Co.
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5 font-medium">
                  Colombo 03 · Verified Merchant
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Input (Standard E-Commerce Search) */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in Ceylon Linen Co. (shirts, dresses, pants)..."
              className="w-full bg-[#F5F5F5] rounded-full py-2 pl-10 pr-9 text-xs border border-transparent focus:border-neutral-300 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: WhatsApp, Share & Shopping Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp Chat</span>
            </a>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share store link"
              className="h-9 w-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Share store"
            >
              {copiedUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-[#1C1B1A] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">My Bag</span>
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-neutral-900">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. BEST E-COMMERCE HERO SECTION (Standard Modern Campaign Banner Slider)
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 shadow-lg text-white">
          {/* Main Slide Presentation */}
          <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[480px] w-full flex items-center">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Image with Rich Gradient Overlays */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover object-center scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Content Container */}
                  <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center max-w-2xl z-20 py-12">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-white/95 border border-white/20 w-fit mb-3 sm:mb-4">
                      <Sparkles className="h-3 w-3 text-amber-300" />
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-3">
                      {slide.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm text-neutral-200 line-clamp-3 leading-relaxed mb-6 font-light max-w-lg">
                      {slide.subtitle}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(slide.ctaCategory);
                          scrollToProducts();
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white px-5 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-all"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span>WhatsApp Order</span>
                      </a>
                    </div>

                    {/* Quality Spec Highlight Tag */}
                    <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2 text-[11px] text-white/80">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{slide.highlight}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Next & Previous Arrows */}
          <button
            type="button"
            onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
            aria-label="Previous banner slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
            aria-label="Next banner slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === idx ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            E-COMMERCE TRUST & SHOPPING GUARANTEES STRIP
        ────────────────────────────────────────────────────────────────────────── */}
        <div className="mt-3 bg-white rounded-xl border border-neutral-200 px-4 py-3.5 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-700">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block leading-tight">Islandwide Courier</span>
                <span className="text-[11px] text-neutral-500">Fast 48h Delivery</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block leading-tight">100% Certified Flax</span>
                <span className="text-[11px] text-neutral-500">Zero Synthetic Waste</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Scissors className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block leading-tight">Hand-Cut in Colombo</span>
                <span className="text-[11px] text-neutral-500">Limited Atelier Batches</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block leading-tight">WhatsApp Concierge</span>
                <span className="text-[11px] text-neutral-500">Custom Sizing Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. CATEGORIES TABS & FILTERS BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <div id="products-section" className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        {/* Mobile Search input */}
        <div className="relative mb-3 md:hidden">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search shirts, dresses, shorts..."
            className="w-full bg-white rounded-lg py-2 pl-9 pr-8 text-xs border border-neutral-200 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {categoryTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#1C1B1A] text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls: In Stock & Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none cursor-pointer"
              >
                <option value="match">Best Match</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. DARAZ-STYLE PRODUCT ITEMS GRID
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        <div className="flex items-center justify-between mb-3 text-xs text-neutral-500">
          <span>{filteredProducts.length} items found</span>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-neutral-900 font-medium hover:underline cursor-pointer"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <p className="text-sm font-semibold text-neutral-700">No products found</p>
            <p className="text-xs text-neutral-400 mt-1">Try resetting your filters or search query.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stockQuantity <= 0;
              const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Product Image Aspect Box */}
                  <Link
                    to={`/shop/ceylon-linen/product/${product.slug}`}
                    className="relative aspect-square w-full overflow-hidden bg-neutral-100 block"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg';
                      }}
                    />

                    {/* Stock & Popular Badges */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
                      {product.featured && (
                        <span className="rounded bg-[#1C1B1A] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-2xs">
                          Popular
                        </span>
                      )}
                      {isLowStock && (
                        <span className="rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                          {product.stockQuantity} Left
                        </span>
                      )}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-900">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Details (Daraz style: title, price, free delivery, rating, add button) */}
                  <div className="p-2.5 sm:p-3 flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/shop/ceylon-linen/product/${product.slug}`}
                        className="text-xs text-neutral-800 line-clamp-2 hover:text-[#B86B53] transition-colors font-medium leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      {/* E-Commerce Price */}
                      <div className="mt-1.5">
                        <span className="text-sm sm:text-base font-bold text-[#1C1B1A] block leading-tight">
                          {StorageService.formatLKR(product.price)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                          <span className="line-through">{StorageService.formatLKR(Math.round(product.price * 1.15))}</span>
                          <span className="text-emerald-700 font-semibold">-15%</span>
                        </div>
                      </div>

                      {/* Free Delivery & Rating */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                          <Truck className="h-2.5 w-2.5" />
                          <span>Free Delivery</span>
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-neutral-600">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          <span>5.0</span>
                        </span>
                      </div>

                      {/* Location Note */}
                      <span className="text-[10px] text-neutral-400 block mt-1">
                        Colombo 03 · 100% Linen
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mt-3 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={e => handleAddToCart(product, e)}
                        disabled={isOutOfStock}
                        aria-label={`Add ${product.name} to cart`}
                        className={`w-full py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : addedMap[product.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95'
                        }`}
                      >
                        {addedMap[product.id] ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
