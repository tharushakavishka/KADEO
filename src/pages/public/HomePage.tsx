import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Heart,
  Star,
  ShoppingBag,
  Store,
  Sparkles,
  Smartphone,
  Palette,
  MessageCircle,
  ExternalLink,
  Check,
  Zap,
  Grid2X2,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ScrollReveal } from '../../components/common/ScrollReveal';

// Asset Images matching the screenshot
import heroArtisanImg from '../../assets/images/marketplace_hero_lifestyle_1792347748759.jpg';
import catLinenImg from '../../assets/images/category_apparel_linen_1792347729400.jpg';
import catBeautyImg from '../../assets/images/category_beauty_wellness_1792347729900.jpg';
import catTechImg from '../../assets/images/category_audio_tech_1792347731311.jpg';
import catCraftImg from '../../assets/images/category_handcrafted_living_1792347730298.jpg';
import catSpicesImg from '../../assets/images/ceylon_cinnamon_spices.jpg';
import prodLinenShirtImg from '../../assets/images/ceylon_linen_shirt_1792345877981.jpg';
import prodSkincareImg from '../../assets/images/aarya_botanicals_cream_1792345879081.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCart();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    'prod-1': false,
    'prod-2': true,
    'prod-3': false,
    'prod-4': false,
    'prod-5': false,
  });
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Interactive Live Theme Simulator for Sellers
  const [activeSellerTheme, setActiveSellerTheme] = useState<'linen' | 'tech' | 'craft' | 'pantry'>('linen');

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 5 Featured Products matching the reference screenshot
  const featuredProducts = [
    {
      id: 'prod-1',
      title: 'Linen Oversized Shirt',
      category: 'Apparel & Linen',
      categoryLink: '/categories',
      price: 4500,
      priceFormatted: 'Rs. 4,500',
      rating: 4.8,
      reviews: 120,
      badge: 'Bestseller',
      image: prodLinenShirtImg,
      shopSlug: 'ceylon-linen',
    },
    {
      id: 'prod-2',
      title: 'Natural Skincare Set',
      category: 'Beauty & Wellness',
      categoryLink: '/categories',
      price: 3200,
      priceFormatted: 'Rs. 3,200',
      rating: 4.7,
      reviews: 86,
      badge: null,
      image: prodSkincareImg,
      shopSlug: 'ceylon-linen',
    },
    {
      id: 'prod-3',
      title: 'Wireless Headphones',
      category: 'Audio & Mobile Tech',
      categoryLink: '/categories',
      price: 12900,
      priceFormatted: 'Rs. 12,900',
      rating: 4.6,
      reviews: 64,
      badge: null,
      image: catTechImg,
      shopSlug: 'ceylon-linen',
    },
    {
      id: 'prod-4',
      title: 'Wooden Planter Box',
      category: 'Handcrafted Living',
      categoryLink: '/categories',
      price: 2800,
      priceFormatted: 'Rs. 2,800',
      rating: 4.9,
      reviews: 52,
      badge: null,
      image: catCraftImg,
      shopSlug: 'ceylon-linen',
    },
    {
      id: 'prod-5',
      title: 'Ceylon Cinnamon Powder',
      category: 'Ceylon Artisanal Pantry',
      categoryLink: '/categories',
      price: 1250,
      priceFormatted: 'Rs. 1,250',
      rating: 4.8,
      reviews: 93,
      badge: null,
      image: catSpicesImg,
      shopSlug: 'ceylon-linen',
    },
  ];

  const handleAddToCart = (product: typeof featuredProducts[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      {
        id: product.id,
        shopId: 'shop-kavee-3',
        categoryId: 'cat-featured',
        name: product.title,
        slug: product.title.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        description: `Authentic ${product.title} made by Sri Lankan artisans.`,
        images: [product.image],
        sku: `SKU-${product.id}`,
        stockQuantity: 25,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shop-kavee-3',
        ownerId: 'user-seller-1',
        name: 'Kadeo Verified Seller',
        slug: product.shopSlug,
        description: 'Handpicked artisan goods direct from local creators',
        logo: product.image,
        coverImage: product.image,
        displayPhone: '+94 77 123 4567',
        whatsappNumber: '94771234567',
        contactDetails: {
          email: 'support@kadeo.lk',
          city: 'Colombo',
          address: 'Kadeo Marketplace Hub',
          deliveryCoverage: 'Islandwide Sri Lanka',
        },
        themeId: 'modern',
        status: 'active',
        subscriptionPlanId: 'pro',
        createdAt: new Date().toISOString(),
      },
      1
    );

    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
    setIsCartOpen(true);
  };

  // Seller Theme Simulator Data
  const sellerThemes = {
    linen: {
      name: 'Linen & Apparel Atelier',
      storeName: 'Ceylon Linen Co.',
      tagline: 'Pure Handwoven Linen Fashion',
      url: 'kadeo.lk/shop/ceylon-linen',
      primaryColor: '#00B074',
      badgeText: 'Pure Sri Lankan Organic Linen',
      bannerImg: catLinenImg,
      sampleItem: 'Linen Oversized Shirt • Rs. 4,500',
    },
    tech: {
      name: 'Modern Tech & Audio',
      storeName: 'UrbanPulse Tech',
      tagline: 'Acoustic Audio & Gadgets',
      url: 'kadeo.lk/shop/urbanpulse',
      primaryColor: '#0284C7',
      badgeText: 'Official Islandwide Warranty',
      bannerImg: catTechImg,
      sampleItem: 'Wireless Headphones • Rs. 12,900',
    },
    craft: {
      name: 'Handcrafted Home & Decor',
      storeName: 'Kavee Living Atelier',
      tagline: 'Natural Teak & Woven Goods',
      url: 'kadeo.lk/shop/kavee-living',
      primaryColor: '#D97706',
      badgeText: '100% Handcrafted by Artisans',
      bannerImg: catCraftImg,
      sampleItem: 'Wooden Planter Box • Rs. 2,800',
    },
    pantry: {
      name: 'Ceylon Artisanal Pantry',
      storeName: 'SpiceRoot Heritage',
      tagline: 'Farm-Fresh Spices & Herbal Wellness',
      url: 'kadeo.lk/shop/spiceroot',
      primaryColor: '#16A34A',
      badgeText: 'Certified Pure Organic Ceylon Spices',
      bannerImg: catSpicesImg,
      sampleItem: 'Ceylon Cinnamon Powder • Rs. 1,250',
    },
  };

  const activeTheme = sellerThemes[activeSellerTheme];

  const sellerPerks = [
    {
      icon: Store,
      title: 'Your Dedicated Store URL',
      desc: 'Claim kadeo.lk/shop/your-brand in 30 seconds. Put it in your Instagram bio, TikTok, and WhatsApp catalogue.',
    },
    {
      icon: Palette,
      title: 'Visual Lookbook & Theme Studio',
      desc: 'Customize hero banners, brand typography, and colors with instant live preview. Zero coding required.',
    },
    {
      icon: MessageCircle,
      title: '1-Click Direct WhatsApp Orders',
      desc: 'Customers place verified orders with pre-filled items, customer name, and delivery address sent straight to your WhatsApp.',
    },
    {
      icon: Zap,
      title: '0% Sales Commission',
      desc: 'Keep 100% of your earnings. No hidden charges or transaction cuts on your hard-earned sales.',
    },
    {
      icon: Truck,
      title: 'Islandwide Cash on Delivery (COD)',
      desc: 'Integrated courier support for all 25 Sri Lankan districts with automated delivery slips and tracking.',
    },
    {
      icon: Smartphone,
      title: 'App-Like Mobile Experience',
      desc: 'Fast, responsive, and stunning on every smartphone. Seamless product zoom, bottom drawers, and instant cart.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-[#00B074] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#F5F8F6]/80 via-[#FAFBF9] to-[#F3F6F4]">
        {/* Subtle blurred green foliage element on the left edge */}
        <div className="absolute top-1/4 -left-16 w-48 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/3 -left-10 w-28 h-40 bg-emerald-600/15 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Tag, Headline, Subtitle, Create Shop & Log in Buttons, Trust Badges */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Green Sub-label with Leaf & Accent Line */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <Leaf className="h-3.5 w-3.5 text-[#00B074]" />
                  <span>SUPPORT LOCAL • SHOP SRI LANKA</span>
                </span>
                <span className="h-[1.5px] w-10 sm:w-14 bg-slate-300 rounded-full inline-block" />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.14]">
                Discover Unique Products <br />
                from <span className="text-[#00B074]">Local Sellers</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
                From handcrafts to everyday essentials — find authentic, high-quality products made by talented Sri Lankan sellers, or start selling your own products online today.
              </p>

              {/* PROMINENT ACTION BUTTONS: "Create Shop" & "Log in" */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 max-w-lg">
                <Link
                  to="/seller/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white text-sm sm:text-base font-extrabold shadow-lg shadow-[#00B074]/30 hover:shadow-xl hover:shadow-[#00B074]/35 transition-all active:scale-95 cursor-pointer text-center"
                >
                  <Store className="h-4 w-4" />
                  <span>Create Shop</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/seller/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold border-2 border-slate-200/90 shadow-2xs hover:border-[#00B074] hover:text-[#00B074] transition-all active:scale-95 cursor-pointer text-center"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
              </div>

              {/* 3 Trust Badges (Optimized for Mobile Screens) */}
              <div className="pt-2 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-10 text-xs text-slate-600 font-medium border-t border-slate-200/60 sm:border-0 pt-4 sm:pt-2">
                {/* 1. Secure Shopping */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5 text-center sm:text-left">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <ShieldCheck className="h-4 w-4 text-[#00B074]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight text-[11px] sm:text-xs">Secure Platform</p>
                    <p className="text-[10px] text-slate-400">100% Guaranteed</p>
                  </div>
                </div>

                {/* 2. Fast Delivery */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5 text-center sm:text-left">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Truck className="h-4 w-4 text-[#00B074]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight text-[11px] sm:text-xs">Fast Delivery</p>
                    <p className="text-[10px] text-slate-400">Islandwide</p>
                  </div>
                </div>

                {/* 3. Support Local Businesses */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5 text-center sm:text-left">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Leaf className="h-4 w-4 text-[#00B074]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight text-[11px] sm:text-xs">Local Makers</p>
                    <p className="text-[10px] text-slate-400">Verified Creators</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Artisan Lifestyle Image with Cursive Script & Dots */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-300/50 border-[3px] border-white aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3] group">
                <img
                  src={heroArtisanImg}
                  alt="Sri Lankan Local Artisan"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                />

                {/* Cursive Artistic Script matching screenshot in upper right */}
                <div className="absolute top-4 right-4 sm:top-7 sm:right-7 pointer-events-none select-none text-right">
                  <span className="font-serif italic text-slate-800 text-lg sm:text-2xl drop-shadow-sm tracking-wide block leading-[1.1]">
                    Local <br />
                    Hands <br />
                    Global <br />
                    <span className="text-slate-700 font-sans text-base sm:text-xl">✨</span> Dreams
                  </span>
                </div>

                {/* Carousel Indicator Dots in bottom right */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#00B074] shadow-xs" />
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white/90" />
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING CATEGORY RIBBON BAR */}
      <section className="relative -mt-6 sm:-mt-12 z-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-2.5 sm:p-4">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth pr-4 sm:pr-0">
            {/* 1. All Categories */}
            <Link
              to="/categories"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-4 sm:pr-5 rounded-xl bg-[#F0FDF4] hover:bg-emerald-100/60 border border-emerald-200/70 transition-all shrink-0 group cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[#00B074] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Grid2X2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight">
                  All Categories
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span>Explore products</span>
                  <ArrowRight className="h-2.5 w-2.5 text-[#00B074]" />
                </p>
              </div>
            </Link>

            {/* 2. Apparel & Linen */}
            <Link
              to="/category/fashion"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shrink-0 group cursor-pointer"
            >
              <img
                src={catLinenImg}
                alt="Apparel & Linen"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight flex items-center gap-1">
                  <span>Apparel & Linen</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-[#00B074]" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Fashion & Clothing</p>
              </div>
            </Link>

            {/* 3. Beauty & Wellness */}
            <Link
              to="/category/beauty"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shrink-0 group cursor-pointer"
            >
              <img
                src={catBeautyImg}
                alt="Beauty & Wellness"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight flex items-center gap-1">
                  <span>Beauty & Wellness</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-[#00B074]" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Skincare & Self Care</p>
              </div>
            </Link>

            {/* 4. Audio & Mobile Tech */}
            <Link
              to="/category/electronics"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shrink-0 group cursor-pointer"
            >
              <img
                src={catTechImg}
                alt="Audio & Mobile Tech"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight flex items-center gap-1">
                  <span>Audio & Tech</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-[#00B074]" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Gadgets & Audio</p>
              </div>
            </Link>

            {/* 5. Handcrafted Living */}
            <Link
              to="/category/lifestyle"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shrink-0 group cursor-pointer"
            >
              <img
                src={catCraftImg}
                alt="Handcrafted Living"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight flex items-center gap-1">
                  <span>Handcrafted</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-[#00B074]" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Home & Decor</p>
              </div>
            </Link>

            {/* 6. Ceylon Artisanal Pantry */}
            <Link
              to="/category/groceries"
              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3.5 sm:pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shrink-0 group cursor-pointer"
            >
              <img
                src={catSpicesImg}
                alt="Ceylon Artisanal Pantry"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors leading-tight">
                  Ceylon Pantry
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Food & Spices</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section id="featured-products" className="pt-14 sm:pt-16 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animationStyle="slide-up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-[2px] w-6 bg-[#00B074] rounded-full inline-block" />
                <span className="text-[11px] font-bold tracking-widest text-[#00B074] uppercase">
                  FEATURED PRODUCTS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Handpicked Just for You
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Discover our top-selling products, loved by customers across Sri Lanka.
              </p>
            </div>

            <Link
              to="/shop/ceylon-linen"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B074] hover:text-[#009E67] transition-colors group self-start sm:self-auto cursor-pointer"
            >
              <span>View All Products</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 5-Card Product Grid (2 columns on mobile, 3 on tablet, 5 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {featuredProducts.map((p, idx) => (
            <ScrollReveal key={p.id} delay={idx * 70} animationStyle="slide-up">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group">
                {/* Product Thumbnail Container with Wishlist & Bestseller badge */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Bestseller Badge on Top Left */}
                  {p.badge && (
                    <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#00B074] text-white shadow-2xs">
                      {p.badge}
                    </span>
                  )}

                  {/* Wishlist Heart Button on Top Right in white circle */}
                  <button
                    type="button"
                    onClick={e => toggleWishlist(p.id, e)}
                    aria-label="Wishlist"
                    className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-full bg-white/95 hover:bg-white text-slate-600 hover:text-rose-500 flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                  >
                    <Heart
                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                        wishlist[p.id] ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                      }`}
                    />
                  </button>

                  {/* Quick Add To Cart Hover Pill (Desktop) */}
                  <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={e => handleAddToCart(p, e)}
                      className="w-full py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-[11px] font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="h-3 w-3 text-[#00B074]" />
                      <span>{addedMap[p.id] ? 'Added!' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Meta Content with Mobile Quick-Add Button */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 truncate">{p.category}</p>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00B074] transition-colors line-clamp-1 leading-snug">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {p.priceFormatted}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{p.rating}</span>
                        <span className="text-slate-400 hidden xs:inline">({p.reviews})</span>
                      </div>
                    </div>

                    {/* Mobile Tap-to-Add-Cart Button */}
                    <button
                      type="button"
                      onClick={e => handleAddToCart(p, e)}
                      aria-label="Add to cart"
                      className="sm:hidden h-7 w-7 rounded-xl bg-emerald-50 hover:bg-[#00B074] text-[#00B074] hover:text-white border border-emerald-200/80 flex items-center justify-center transition-colors active:scale-90 shrink-0"
                    >
                      {addedMap[p.id] ? (
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      ) : (
                        <ShoppingBag className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. SELLER EMPOWERMENT LIVE STUDIO SIMULATOR */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FAFBF9] via-white to-[#F6F9F7] border-y border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal animationStyle="slide-up">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase bg-emerald-50 text-[#00B074] border border-emerald-200/80 inline-block mb-3 shadow-2xs">
                EMPOWERING LOCAL MAKERS & BRANDS
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                Turn Your Craft into a Website. <br />
                <span className="text-[#00B074]">Launch Your Store in 3 Minutes.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 max-w-2xl mx-auto leading-relaxed">
                Stop managing orders in messy Instagram direct messages and lost WhatsApp chats. Kadeo empowers every Sri Lankan creator, boutique owner, and artisan to build their own branded online storefront with zero code and 0% commission.
              </p>

              {/* Theme Simulator Pills */}
              <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 justify-start sm:justify-center px-1">
                <span className="text-xs font-semibold text-slate-400 shrink-0">Try Themes:</span>
                {(
                  [
                    { key: 'linen', label: 'Linen & Apparel', color: '#00B074' },
                    { key: 'tech', label: 'Gadgets & Tech', color: '#0284C7' },
                    { key: 'craft', label: 'Handcrafted Living', color: '#D97706' },
                    { key: 'pantry', label: 'Ceylon Spices', color: '#16A34A' },
                  ] as const
                ).map(theme => {
                  const isCurrent = activeSellerTheme === theme.key;
                  return (
                    <button
                      key={theme.key}
                      onClick={() => setActiveSellerTheme(theme.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-sm ring-2 ring-[#00B074]'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Interactive Live Storefront Mockup Canvas */}
          <ScrollReveal animationStyle="scale">
            <div className="max-w-5xl mx-auto bg-slate-950 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800 text-white relative">
              {/* Fake Browser Top Chrome */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 px-3 sm:px-4 py-1.5 rounded-full border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-300 truncate max-w-[180px] sm:max-w-none">
                  <span className="text-emerald-400">https://</span>
                  <span className="truncate">{activeTheme.url}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00B074] animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">LIVE PREVIEW</span>
                </div>
              </div>

              {/* Inside Storefront Preview Frame */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mt-3 bg-slate-900 min-h-[320px] sm:min-h-[420px] flex flex-col justify-between p-5 sm:p-10 transition-all duration-500">
                {/* Background Banner Image with Gradient Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src={activeTheme.bannerImg}
                    alt={activeTheme.storeName}
                    className="w-full h-full object-cover object-center opacity-30 blur-xs transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                {/* Simulated Storefront Header & Hero */}
                <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>{activeTheme.badgeText}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {activeTheme.storeName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeTheme.tagline}. Curated Sri Lankan craftsmanship with instant 1-click WhatsApp order fulfillment and islandwide delivery.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                    <span
                      style={{ backgroundColor: activeTheme.primaryColor }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer hover:opacity-95 text-center"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Shop Collection</span>
                    </span>

                    <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-center">
                      <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                      <span>Chat on WhatsApp</span>
                    </span>
                  </div>
                </div>

                {/* Floating Realistic Store Badges */}
                <div className="relative z-10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 flex items-center gap-3 shadow-xl">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">⚡ New Order Dispatched!</p>
                      <p className="text-[10px] text-slate-400">{activeTheme.sampleItem}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-300">
                    <Truck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Islandwide Cash on Delivery (COD) Active</span>
                  </div>
                </div>
              </div>

              {/* Bottom Callout Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  Want your brand to look like this? Create your store in 3 clicks.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Link
                    to="/shop/ceylon-linen"
                    target="_blank"
                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors py-1.5"
                  >
                    <span>View Live Shop</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    to="/seller/register"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer text-center"
                  >
                    <span>Claim Your Storefront Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. SCROLLING STEP-BY-STEP WORKFLOW */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animationStyle="slide-up">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-[11px] font-bold tracking-widest text-[#00B074] uppercase">
              SIMPLE 3-STEP ONBOARDING
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Start Selling in Three Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              No technical expertise needed. You can launch your own e-commerce website right from your smartphone.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {[
            {
              n: '01',
              title: 'Name & Claim Your Store URL',
              desc: 'Choose your unique brand link (e.g. kadeo.lk/shop/your-name). Setup takes under 30 seconds with no credit card required.',
              highlight: '30-second setup',
            },
            {
              n: '02',
              title: 'Customize Your Website & Theme',
              desc: 'Select from handcrafted editorial themes (Linen, Tech, Minimal, Handcrafted). Upload your logo and custom banners effortlessly.',
              highlight: 'Visual theme editor',
            },
            {
              n: '03',
              title: 'Receive Direct WhatsApp Orders',
              desc: 'Share your store link on your Instagram bio, TikTok, and Facebook. Receive customer orders pre-formatted straight into WhatsApp.',
              highlight: '0% sales commission',
            },
          ].map((step, idx) => (
            <ScrollReveal key={step.n} delay={idx * 100} animationStyle="slide-up">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between h-full">
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-[#00B074] transition-colors font-mono">
                      {step.n}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00B074] border border-emerald-200/60">
                      {step.highlight}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#00B074] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6 flex items-center text-xs font-bold text-[#00B074] gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 6. BENTO GRID OF SELLER ADVANTAGES */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animationStyle="slide-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#00B074] uppercase">
                  EVERYTHING YOU NEED TO SCALE
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Built Specifically for Sri Lankan Sellers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  From payment trust to local courier dispatch, Kadeo provides all the tools you need to run a profitable online boutique.
                </p>
              </div>

              <Link
                to="/seller/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/25 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <span>Open Your Free Shop</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* 6 Perk Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sellerPerks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <ScrollReveal key={perk.title} delay={idx * 60} animationStyle="slide-up">
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
                    <div className="space-y-3">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 text-[#00B074] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00B074] transition-colors">
                        {perk.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. GRAND FINALE SELLER CTA BANNER */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animationStyle="scale">
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-[#0A1A14] to-slate-950 p-6 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-emerald-900/40">
            {/* Luminous Glow */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5">
              <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-[#00D084] border border-[#00D084]/30 inline-block shadow-2xs">
                JOIN 1,200+ SRI LANKAN CREATORS
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Build Your Own Brand Website?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Take your boutique or craft business to the next level. Get your branded link, customize your storefront theme, and receive orders directly on WhatsApp.
              </p>

              <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  to="/seller/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-[#00B074]/30 transition-all active:scale-95 cursor-pointer text-center"
                >
                  <span>Create Your Free Store Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/shop/ceylon-linen"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all cursor-pointer text-center"
                >
                  <span>Explore Demo Store</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
