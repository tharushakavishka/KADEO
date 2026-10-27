import { ScrollReveal } from '../common/ScrollReveal';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Star,
  ArrowRight,
  ShieldCheck,
  Truck,
  Store,
  BadgeCheck,
  Check,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Sparkles,
  Smartphone,
  Shirt,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Coffee,
  CheckCircle2,
  Home as HomeIcon,
  Zap,
  Leaf,
  Flame,
} from 'lucide-react';
import { Shop, Product } from '../../types';
import { useCart } from '../../context/CartContext';
import {
  KaveeStoreService,
  KaveeStorefrontConfig,
  THEME_PRESETS,
} from '../../services/kaveeStoreService';
import { StorageService } from '../../services/storageService';

import heroBagImg from '../../assets/images/kadeo_hero_bag.jpg';
import sellerBannerImg from '../../assets/images/kadeo_seller_banner.jpg';
import electronicsBannerImg from '../../assets/images/kadeo_electronics_banner.jpg';
import prodTshirtImg from '../../assets/images/kadeo_prod_tshirt.jpg';
import prodEarbudsImg from '../../assets/images/kadeo_prod_earbuds.jpg';
import prodSkincareImg from '../../assets/images/kadeo_prod_skincare.jpg';
import prodBackpackImg from '../../assets/images/kadeo_prod_backpack.jpg';
import prodPlantImg from '../../assets/images/kadeo_prod_plant.jpg';

interface KaveeStorefrontProps {
  shop?: Shop;
  config?: KaveeStorefrontConfig;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

export const KaveeStorefront: React.FC<KaveeStorefrontProps> = ({ shop, config, viewport = 'desktop' }) => {
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';
  const isDesktop = viewport === 'desktop';
  const { totalItems, setIsCartOpen, addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    'prod-kavee-1': true,
  });
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Live configuration state
  const [liveConfig, setLiveConfig] = useState<KaveeStorefrontConfig>(() => {
    return config || KaveeStoreService.getConfig();
  });

  useEffect(() => {
    if (config) {
      setLiveConfig(config);
    }
  }, [config]);

  useEffect(() => {
    if (config) return;
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setLiveConfig(e.detail);
      } else {
        setLiveConfig(KaveeStoreService.getConfig());
      }
    };
    window.addEventListener('kadeo_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kadeo_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [config]);

  const primaryColor = liveConfig.theme?.primaryColor || '#00A86B';
  const fontFamily = liveConfig.theme?.fontFamily || 'sans';
  const borderRadius = liveConfig.theme?.borderRadius || 'rounded-2xl';
  const cardStyle = liveConfig.theme?.cardStyle || 'standard';
  const themeId = liveConfig.theme?.themeId || 'kadeo';

  // Dynamic Theme-based styling flags
  const isDarkTech = cardStyle === 'dark-tech' || themeId === 'tech';
  const isLuxury = cardStyle === 'luxury-serif' || themeId === 'linen' || themeId === 'beauty';
  const isBoldStreet = cardStyle === 'bold-street' || themeId === 'streetwear';
  const isOrganic = cardStyle === 'organic-soft' || themeId === 'organic';
  const isMinimal = cardStyle === 'clean-minimal' || themeId === 'minimal';
  const isStreetwear = isBoldStreet;
  const isBeauty = themeId === 'beauty';

  const headingFontClass =
    fontFamily === 'serif' || isLuxury
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : isBoldStreet
      ? 'font-black tracking-tighter'
      : isMinimal
      ? 'font-light tracking-wider'
      : 'font-sans font-black';

  const toggleWishlist = (id: string) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const defaultShop: Shop = {
    id: shop?.id || 'shop-kavee-3',
    ownerId: shop?.ownerId || 'seller-kavee-3',
    name: shop?.name || liveConfig.header.storeName || 'Kadeo',
    slug: shop?.slug || 'kavee-3',
    description: shop?.description || 'Authentic Sri Lankan handcrafted products and premium boutique goods.',
    logo: shop?.logo || '',
    coverImage: shop?.coverImage || '',
    whatsappNumber: shop?.whatsappNumber || '94771234567',
    displayPhone: shop?.displayPhone || '+94 77 123 4567',
    contactDetails: shop?.contactDetails || {
      email: 'kavee@kadeo.lk',
      address: 'Colombo 03',
      city: 'Colombo',
    },
    themeId: (liveConfig.theme?.themeId as any) || 'kadeo',
    status: 'active',
    createdAt: new Date().toISOString(),
    subscriptionPlanId: 'pro',
  };

  const currentShop: Shop = shop || defaultShop;

  const handleAddToCart = (item: any) => {
    const product: Product = {
      id: item.id,
      shopId: currentShop.id,
      categoryId: item.categoryId || 'cat-general',
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      sku: 'KAD-' + item.id,
      stockQuantity: 25,
      images: [item.image],
      status: 'active',
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Correctly pass (product, shop, quantity) to CartContext
    addItem(product, currentShop, 1);

    setAddedMap(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  // Shape helpers
  const cardShape =
    borderRadius === 'rounded-none' || isMinimal
      ? 'rounded-none'
      : borderRadius === 'rounded-3xl' || isOrganic
      ? 'rounded-3xl'
      : borderRadius === 'rounded-xl'
      ? 'rounded-xl'
      : 'rounded-2xl';

  const btnShape =
    borderRadius === 'rounded-none' || isMinimal
      ? 'rounded-none'
      : borderRadius === 'rounded-3xl' || isOrganic
      ? 'rounded-full'
      : borderRadius === 'rounded-xl'
      ? 'rounded-xl'
      : 'rounded-full';

  // Navigation & Search Styling
  const navStyle = liveConfig.header?.navStyle || 'solid';
  const navHeight = liveConfig.header?.navHeight || 'spacious';
  const linksAlignment = liveConfig.header?.linksAlignment || 'left';
  const isNavSticky = liveConfig.header?.sticky !== false;

  const searchStyle = liveConfig.header?.searchStyle || 'pill';
  const searchVariant = liveConfig.header?.searchVariant || 'filled';
  const searchPlaceholder =
    liveConfig.header?.searchPlaceholder || 'Search 10,000+ products, artisan goods, brands...';
  const showSearch = liveConfig.header?.showSearch !== false;
  const showWishlist = liveConfig.header?.showWishlist !== false;

  const searchShapeClass =
    searchStyle === 'pill'
      ? 'rounded-full'
      : searchStyle === 'square'
      ? 'rounded-none'
      : 'rounded-xl';

  const searchInputStyleClass =
    searchVariant === 'outline'
      ? isDarkTech
        ? 'bg-slate-900 border-2 border-slate-700 text-white focus:border-sky-500'
        : 'bg-white border-2 border-neutral-300 text-neutral-800 focus:border-emerald-500 shadow-2xs'
      : isDarkTech
      ? 'bg-slate-900/80 border border-slate-800 text-white placeholder:text-slate-500 focus:bg-slate-900'
      : 'bg-[#F3F4F6] border border-transparent focus:border-neutral-300 focus:bg-white text-neutral-800 placeholder:text-neutral-400';

  const navHeightClass = navHeight === 'compact' ? 'h-16' : 'h-20';

  let navWrapperClass = `${isNavSticky ? 'sticky top-0 z-50' : 'relative z-20'} transition-all `;
  if (navStyle === 'floating') {
    navWrapperClass += isDarkTech
      ? 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-800 shadow-2xl'
      : isLuxury
      ? 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-[#FCFAF7]/95 backdrop-blur-xl border border-amber-900/15 shadow-xl'
      : 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200/90 shadow-xl';
  } else if (navStyle === 'transparent') {
    navWrapperClass += isDarkTech
      ? 'bg-[#0B0F19]/70 backdrop-blur-md border-b border-slate-800/60'
      : 'bg-white/70 backdrop-blur-md border-b border-neutral-200/50';
  } else {
    // solid
    navWrapperClass += isDarkTech
      ? 'bg-[#0B0F19] border-b border-slate-800 shadow-xs'
      : isLuxury
      ? 'bg-[#FCFAF7] border-b border-amber-900/10 shadow-xs'
      : 'bg-white border-b border-neutral-100 shadow-xs';
  }

  // Animation bindings
  const isScrollReveal = liveConfig.animations?.scrollReveal !== false;
  const scrollStyle = liveConfig.animations?.scrollRevealStyle || 'slide-up';
  const isMarquee = liveConfig.animations?.announcementTicker !== false;

  const badgeAnimClass =
    liveConfig.animations?.heroBadge === 'pulse'
      ? 'animate-pulse'
      : liveConfig.animations?.heroBadge === 'static'
      ? ''
      : 'animate-kadeo-float';

  const ctaButtonAnimClass =
    liveConfig.animations?.ctaButtonPulse !== false
      ? 'animate-kadeo-pulse'
      : 'hover:scale-[1.02] shadow-sm';

  const cardAnimClass =
    liveConfig.animations?.productHover === 'glow-border'
      ? 'hover:ring-2 hover:ring-emerald-400 hover:shadow-lg transition-all duration-300'
      : liveConfig.animations?.productHover === 'scale'
      ? 'hover:scale-[1.03] hover:shadow-xl transition-all duration-300'
      : liveConfig.animations?.productHover === 'subtle'
      ? 'hover:opacity-95 transition-opacity'
      : 'hover:-translate-y-2 hover:shadow-2xl transition-all duration-300';

  // Live sync with Seller Catalog (StorageService)
  const [sellerCatalog, setSellerCatalog] = useState<any[]>(() => {
    try {
      const real = StorageService.getProductsByShop(currentShop.id);
      if (real && real.length > 0) {
        return real.map(p => ({
          id: p.id,
          name: p.name,
          seller: currentShop.name,
          price: p.price,
          originalPrice: p.originalPrice,
          rating: 4.9,
          reviews: 12,
          badge: 'Featured',
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          image: p.images?.[0] || prodTshirtImg,
        }));
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    const handleProductsChange = () => {
      try {
        const real = StorageService.getProductsByShop(currentShop.id);
        if (real && real.length > 0) {
          setSellerCatalog(
            real.map(p => ({
              id: p.id,
              name: p.name,
              seller: currentShop.name,
              price: p.price,
              originalPrice: p.originalPrice,
              rating: 4.9,
              reviews: 12,
              badge: 'Featured',
              badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              image: p.images?.[0] || prodTshirtImg,
            }))
          );
        }
      } catch {}
    };
    window.addEventListener('kadeo_products_updated', handleProductsChange);
    window.addEventListener('storage', handleProductsChange);
    return () => {
      window.removeEventListener('kadeo_products_updated', handleProductsChange);
      window.removeEventListener('storage', handleProductsChange);
    };
  }, [currentShop.id, currentShop.name]);

  // Products adapted dynamically according to selected theme
  const themeProducts = [
    {
      id: 'prod-kavee-1',
      name: isDarkTech ? 'Pro ANC Wireless Earbuds' : isLuxury ? 'Ceylon Pure Linen Shirt' : isOrganic ? 'Organic Plant Sanctuary' : isStreetwear ? 'Drop 04 Oversized Heavy Tee' : 'Oversized T-Shirt',
      seller: isDarkTech ? 'TechMatrix' : isLuxury ? 'Kavee Boutique' : isOrganic ? 'Green Living' : isStreetwear ? 'Colombo Raw' : 'Urban Threads',
      price: isDarkTech ? 7990 : isLuxury ? 5800 : isOrganic ? 2450 : isStreetwear ? 3850 : 2490,
      originalPrice: isDarkTech ? 9990 : isLuxury ? 6900 : isOrganic ? 2900 : isStreetwear ? 4500 : 3200,
      rating: 4.9,
      reviews: 142,
      badge: isDarkTech ? 'Wireless' : isLuxury ? 'Handwoven' : isOrganic ? 'Eco' : isStreetwear ? 'Limited Drop' : 'Bestseller',
      badgeColor: isDarkTech ? 'bg-sky-50 text-sky-700 border-sky-200' : isLuxury ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      image: isDarkTech ? prodEarbudsImg : isLuxury ? prodTshirtImg : isOrganic ? prodPlantImg : prodTshirtImg,
    },
    {
      id: 'prod-kavee-2',
      name: isDarkTech ? 'Gaming Mechanical Deck' : isLuxury ? 'Terracotta Linen Summer Dress' : isOrganic ? 'Biodegradable Terracotta Planter' : isBeauty ? 'Rose Radiance Glow Elixir' : 'Wireless Earbuds',
      seller: isDarkTech ? 'CyberGear' : isLuxury ? 'Kavee Boutique' : isOrganic ? 'EcoVibe' : isBeauty ? 'Glow Botanics' : 'TechZone',
      price: 7990,
      rating: 4.8,
      reviews: 98,
      badge: 'Trending',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      image: isDarkTech ? prodEarbudsImg : isBeauty ? prodSkincareImg : prodEarbudsImg,
    },
    {
      id: 'prod-kavee-3',
      name: 'Botanical Skin Hydration Set',
      seller: 'Glow Beauty',
      price: 4990,
      originalPrice: 6500,
      rating: 4.9,
      reviews: 67,
      badge: 'Sale',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      image: prodSkincareImg,
    },
    {
      id: 'prod-kavee-4',
      name: 'All-Weather Utility Pack',
      seller: 'GearUp Studio',
      price: 5990,
      rating: 4.6,
      reviews: 102,
      badge: 'Hot',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      image: prodBackpackImg,
    },
    {
      id: 'prod-kavee-5',
      name: 'Purifying Tropical Houseplant',
      seller: 'Ceylon Living',
      price: 1450,
      rating: 4.8,
      reviews: 56,
      badge: 'Fresh',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      image: prodPlantImg,
    },
  ];

  const displayedProducts = sellerCatalog.length > 0 ? sellerCatalog : themeProducts;

  const categories = [
    { name: 'Fashion & Apparel', count: '1,200+ Items', icon: Shirt, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Electronics & Gadgets', count: '850+ Items', icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
    { name: 'Beauty & Skincare', count: '640+ Items', icon: Sparkles, color: 'bg-pink-50 text-pink-600' },
    { name: 'Home & Green Living', count: '920+ Items', icon: HomeIcon, color: 'bg-amber-50 text-amber-600' },
    { name: 'Sports & Activewear', count: '380+ Items', icon: Dumbbell, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Ceylon Books & Arts', count: '450+ Items', icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
    { name: 'Gaming & Tech', count: '290+ Items', icon: Gamepad2, color: 'bg-rose-50 text-rose-600' },
    { name: 'Artisan Tea & Pantry', count: '510+ Items', icon: Coffee, color: 'bg-orange-50 text-orange-600' },
  ];

  const trustCards = [
    {
      icon: ShieldCheck,
      title: liveConfig.whyShop?.card1Title || (isDarkTech ? 'Verified Authenticity' : 'Guaranteed Protection'),
      desc: liveConfig.whyShop?.card1Desc || '100% genuine products with full buyer security on every order.',
    },
    {
      icon: Truck,
      title: liveConfig.whyShop?.card2Title || (isStreetwear ? 'Express 24H Courier' : 'Islandwide Delivery'),
      desc: liveConfig.whyShop?.card2Desc || 'Swift shipping across all 25 districts within 2-4 business days.',
    },
    {
      icon: Store,
      title: liveConfig.whyShop?.card3Title || 'Support Local Sellers',
      desc: liveConfig.whyShop?.card3Desc || 'Every purchase directly empowers passionate Sri Lankan businesses.',
    },
    {
      icon: BadgeCheck,
      title: liveConfig.whyShop?.card4Title || 'Curated Quality',
      desc: liveConfig.whyShop?.card4Desc || 'All merchants are vetted to guarantee exceptional craftsmanship.',
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkTech
          ? 'bg-[#0B0F19] text-slate-100'
          : isLuxury
          ? 'bg-[#FCFAF7] text-neutral-900'
          : 'bg-[#FCFCFD] text-neutral-900'
      }`}
    >
      {/* Dynamic Keyframes to Guarantee Storefront Animations */}
      <style>{`
        @keyframes kadeoMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes kadeoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes kadeoPulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 168, 107, 0.45); transform: scale(1); }
          50% { box-shadow: 0 0 0 14px rgba(0, 168, 107, 0); transform: scale(1.02); }
        }
        .animate-kadeo-marquee {
          display: flex;
          width: 200%;
          animation: kadeoMarquee 20s linear infinite;
        }
        .animate-kadeo-marquee:hover {
          animation-play-state: paused;
        }
        .animate-kadeo-float {
          animation: kadeoFloat 3.2s ease-in-out infinite;
        }
        .animate-kadeo-pulse {
          animation: kadeoPulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* 0. Announcement Bar */}
      {liveConfig.sectionsVisibility.announcement && liveConfig.announcementBar.enabled && (
        <div
          style={{ backgroundColor: liveConfig.announcementBar.bgColor || primaryColor }}
          className="text-white py-2.5 text-xs font-semibold overflow-hidden transition-colors shadow-2xs"
        >
          {isMarquee ? (
            <div className="animate-kadeo-marquee items-center gap-12 whitespace-nowrap">
              <span className="flex items-center gap-2">
                <span>{liveConfig.announcementBar.text}</span>
                {liveConfig.announcementBar.linkText && (
                  <span className="font-extrabold underline cursor-pointer">{liveConfig.announcementBar.linkText}</span>
                )}
              </span>
              <span className="opacity-50">•</span>
              <span className="flex items-center gap-2">
                <span>{liveConfig.announcementBar.text}</span>
                {liveConfig.announcementBar.linkText && (
                  <span className="font-extrabold underline cursor-pointer">{liveConfig.announcementBar.linkText}</span>
                )}
              </span>
              <span className="opacity-50">•</span>
              <span className="flex items-center gap-2">
                <span>{liveConfig.announcementBar.text}</span>
                {liveConfig.announcementBar.linkText && (
                  <span className="font-extrabold underline cursor-pointer">{liveConfig.announcementBar.linkText}</span>
                )}
              </span>
              <span className="opacity-50">•</span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 text-center truncate">
              <span>{liveConfig.announcementBar.text}</span>
              {liveConfig.announcementBar.linkText && (
                <a href="#shop" className="font-extrabold underline ml-1.5 hover:opacity-90">
                  {liveConfig.announcementBar.linkText}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1. Header / Navbar */}
      {liveConfig.sectionsVisibility.header && (
        <header className={navWrapperClass}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${navHeightClass} flex items-center justify-between gap-4`}>
            {/* Brand Logo */}
            <div className={`flex items-center gap-8 ${linksAlignment === 'center' ? 'flex-none' : ''}`}>
              <Link to="/shop/kavee-3" className="flex items-center gap-2 group">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-2xl font-black tracking-tight ${
                      isDarkTech ? 'text-white' : 'text-neutral-950'
                    } ${headingFontClass}`}
                  >
                    {liveConfig.header.storeName || 'Kadeo'}
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                </div>
              </Link>

              {/* Desktop Navigation Links (Left Aligned) */}
              {!isMobile && linksAlignment === 'left' && (
                <nav
                  className={`${isTablet ? 'flex' : 'hidden lg:flex'} items-center gap-7 text-sm font-medium ${
                    isDarkTech ? 'text-slate-300' : 'text-neutral-600'
                  }`}
                >
                  <Link
                    to="/shop/kavee-3"
                    className="font-bold transition-colors"
                    style={{ color: primaryColor }}
                  >
                    Home
                  </Link>
                  <a href="#shop" className="hover:opacity-80 transition-opacity">
                    Shop
                  </a>
                  <a href="#categories" className="hover:opacity-80 transition-opacity">
                    Categories
                  </a>
                  <a href="#sellers" className="hover:opacity-80 transition-opacity">
                    Sellers
                  </a>
                  <a href="#about" className="hover:opacity-80 transition-opacity">
                    About
                  </a>
                </nav>
              )}
            </div>

            {/* Desktop Navigation Links (Center Aligned) */}
            {!isMobile && linksAlignment === 'center' && (
              <nav
                className={`${isTablet ? 'flex' : 'hidden lg:flex'} items-center justify-center gap-8 text-sm font-medium flex-1 ${
                  isDarkTech ? 'text-slate-300' : 'text-neutral-600'
                }`}
              >
                <Link
                  to="/shop/kavee-3"
                  className="font-bold transition-colors"
                  style={{ color: primaryColor }}
                >
                  Home
                </Link>
                <a href="#shop" className="hover:opacity-80 transition-opacity">
                  Shop
                </a>
                <a href="#categories" className="hover:opacity-80 transition-opacity">
                  Categories
                </a>
                <a href="#sellers" className="hover:opacity-80 transition-opacity">
                  Sellers
                </a>
                <a href="#about" className="hover:opacity-80 transition-opacity">
                  About
                </a>
              </nav>
            )}

            {/* Dynamic Search Bar */}
            {showSearch && (
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${searchShapeClass} ${searchInputStyleClass}`}
                  />
                </div>
              </div>
            )}

            {/* Right Action Icons & Right Aligned Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              {!isMobile && linksAlignment === 'right' && (
                <nav
                  className={`${isTablet ? 'flex' : 'hidden lg:flex'} items-center gap-6 text-sm font-medium mr-2 ${
                    isDarkTech ? 'text-slate-300' : 'text-neutral-600'
                  }`}
                >
                  <Link to="/shop/kavee-3" className="font-bold" style={{ color: primaryColor }}>
                    Home
                  </Link>
                  <a href="#shop" className="hover:opacity-80">Shop</a>
                  <a href="#categories" className="hover:opacity-80">Categories</a>
                  <a href="#about" className="hover:opacity-80">About</a>
                </nav>
              )}

              {/* Wishlist Button */}
              {showWishlist && (
                <button
                  type="button"
                  className={`p-2.5 rounded-full transition-colors relative cursor-pointer ${
                    isDarkTech
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                  title="Wishlist"
                  onClick={() => toggleWishlist('prod-kavee-1')}
                >
                  <Heart className="h-5 w-5" />
                  {Object.values(wishlist).filter(Boolean).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  )}
                </button>
              )}

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`p-2.5 rounded-full transition-colors relative cursor-pointer ${
                  isDarkTech
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
                title="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute top-1 right-1 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Menu */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 text-neutral-700 hover:text-neutral-950 cursor-pointer ${isMobile ? 'block' : 'lg:hidden'}`}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Interactive Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="border-t border-neutral-100 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl ${searchInputStyleClass}`}
                />
              </div>
              <nav className="flex flex-col space-y-1 text-sm font-semibold text-neutral-800">
                <Link to="/shop/kavee-3" className="px-3 py-2 rounded-lg bg-neutral-50" style={{ color: primaryColor }}>Home</Link>
                <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-neutral-50">Shop</a>
                <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-neutral-50">Categories</a>
                <a href="#sellers" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-neutral-50">Sellers</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-neutral-50">About</a>
              </nav>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Helpline: +94 11 234 5678</span>
                <span className="font-bold" style={{ color: primaryColor }}>Kadeo Verified</span>
              </div>
            </div>
          )}
        </header>
      )}

      {/* 2. Hero Section */}
      {liveConfig.sectionsVisibility.hero && (
        <section
          className={`relative overflow-hidden py-14 lg:py-24 border-b transition-colors ${
            isDarkTech
              ? 'bg-[#0F172A] border-slate-800'
              : isLuxury
              ? 'bg-[#FAF8F5] border-amber-900/10'
              : isOrganic
              ? 'bg-[#F0FDF4] border-emerald-100'
              : 'bg-[#FAFAF8] border-neutral-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${isMobile ? 'flex flex-col gap-8' : isTablet ? 'grid grid-cols-12 gap-8 items-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'}`}>
              {/* Left Content */}
              <div className={`${isMobile ? 'space-y-4' : 'lg:col-span-6 space-y-6'}`}>
                {liveConfig.hero.badgeText && (
                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold ${
                      isDarkTech
                        ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg'
                        : isLuxury
                        ? 'bg-amber-100/60 border border-amber-200/80 text-amber-900 rounded-full'
                        : 'bg-emerald-50 border border-emerald-200/60 text-emerald-800 rounded-full'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
                    <span className={fontFamily === 'mono' ? 'font-mono' : ''}>{liveConfig.hero.badgeText}</span>
                  </div>
                )}

                <h1
                  className={`text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] ${
                    isDarkTech ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  {liveConfig.hero.headlineLine1}
                  <br />
                  {liveConfig.hero.headlineLine2}
                  <br />
                  <span style={{ color: primaryColor }}>{liveConfig.hero.headlineLine3}</span>
                </h1>

                <p
                  className={`text-sm sm:text-base max-w-lg leading-relaxed ${
                    isDarkTech ? 'text-slate-300' : 'text-neutral-600'
                  }`}
                >
                  {liveConfig.hero.subtitle}
                </p>

                <div className="pt-2">
                  <a
                    href="#shop"
                    style={{ backgroundColor: primaryColor }}
                    className={`inline-flex items-center gap-2.5 px-8 py-4 text-white text-sm font-bold shadow-lg transition-all duration-200 active:scale-[0.98] ${btnShape} ${ctaButtonAnimClass}`}
                  >
                    <span>{liveConfig.hero.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right Graphic */}
              <div className={`${isMobile ? 'w-full flex justify-center' : 'lg:col-span-6 flex justify-center lg:justify-end'}`}>
                <div className="relative w-full max-w-md">
                  <div
                    className={`aspect-[4/4.2] overflow-hidden shadow-2xl relative border ${
                      isDarkTech
                        ? 'border-slate-700 bg-slate-900 rounded-3xl'
                        : isLuxury
                        ? 'border-amber-200/60 bg-[#F5EFE6] rounded-3xl'
                        : 'border-neutral-200 bg-white rounded-3xl'
                    }`}
                  >
                    <img
                      src={liveConfig.hero.imageUrl || heroBagImg}
                      alt="Storefront Showcase"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Decorative Floating Badge */}
                    {liveConfig.hero.floatingBadge && (
                      <div
                        className={`absolute bottom-6 left-6 backdrop-blur-md px-4 py-2.5 shadow-xl border flex items-center gap-3 ${badgeAnimClass} ${
                          isDarkTech
                            ? 'bg-slate-900/90 border-slate-700 text-white rounded-xl'
                            : 'bg-white/95 border-white/80 text-neutral-900 rounded-2xl'
                        }`}
                      >
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm bg-neutral-100"
                          style={{ color: primaryColor }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold leading-tight">Featured Selection</p>
                          <p className="text-[11px] font-bold leading-tight" style={{ color: primaryColor }}>
                            {liveConfig.hero.floatingBadge}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Shop by Category */}
      {liveConfig.sectionsVisibility.categories && (
        <section id="categories" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2
                  className={`text-2xl sm:text-3xl tracking-tight ${
                    isDarkTech ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  {liveConfig.categories?.title || 'Shop by Category'}
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isDarkTech ? 'text-slate-400' : 'text-neutral-500'}`}>
                  {liveConfig.categories?.subtitle || 'Explore handpicked collections curated for you.'}
                </p>
              </div>
              <a
                href="#categories"
                className="text-xs font-bold flex items-center gap-1 transition-colors group"
                style={{ color: primaryColor }}
              >
                <span>{liveConfig.categories?.viewAllText || 'View All'}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </ScrollReveal>

          <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : isTablet ? 'grid grid-cols-4 gap-4' : 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4'}`}>
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <ScrollReveal key={idx} enabled={isScrollReveal} animationStyle={scrollStyle} delay={idx * 60}>
                  <div
                    className={`group p-4 text-center cursor-pointer transition-all duration-300 border flex flex-col items-center justify-center ${
                      isDarkTech
                        ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/50 hover:bg-slate-800'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-md'
                    } ${cardShape}`}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                        isDarkTech ? 'bg-slate-800 text-sky-400' : cat.color
                      }`}
                    >
                      <Icon className="h-6 w-6 stroke-[1.8]" />
                    </div>
                    <h3 className={`text-xs font-bold truncate w-full ${isDarkTech ? 'text-white' : 'text-neutral-900'}`}>
                      {cat.name}
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isDarkTech ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {cat.count}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Featured Products Section */}
      {liveConfig.sectionsVisibility.products && (
        <section
          id="shop"
          className={`py-16 border-y transition-colors ${
            isDarkTech
              ? 'bg-[#0F172A] border-slate-800'
              : isLuxury
              ? 'bg-[#FAF8F5] border-amber-900/10'
              : 'bg-[#FAFAF8] border-neutral-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <h2
                    className={`text-2xl sm:text-3xl tracking-tight ${
                      isDarkTech ? 'text-white' : 'text-neutral-950'
                    } ${headingFontClass}`}
                  >
                    {liveConfig.products?.title || 'Featured Collection'}
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 ${isDarkTech ? 'text-slate-400' : 'text-neutral-500'}`}>
                    {liveConfig.products?.subtitle || 'Handcrafted & top-rated items from verified sellers'}
                  </p>
                </div>
                <a
                  href="#shop"
                  className="text-xs font-bold flex items-center gap-1 transition-colors group"
                  style={{ color: primaryColor }}
                >
                  <span>{liveConfig.products?.viewAllText || 'View All Products'}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </ScrollReveal>

            <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : isTablet ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'}`}>
              {displayedProducts.map((product, idx) => {
                const isFavorited = !!wishlist[product.id];
                const isAdded = !!addedMap[product.id];

                return (
                  <ScrollReveal key={product.id} enabled={isScrollReveal} animationStyle={scrollStyle} delay={idx * 75}>
                    <div
                      className={`group relative bg-white border border-neutral-200/90 shadow-2xs flex flex-col justify-between overflow-hidden ${cardShape} ${cardAnimClass} ${
                        isDarkTech ? 'bg-slate-900/80 border-slate-800 text-white' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-md border shadow-2xs ${product.badgeColor}`}
                        >
                          {product.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-white transition-all shadow-xs"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFavorited ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Info & Cart Action */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-600 mb-1">
                            {product.seller}
                          </p>
                          <h3
                            className={`text-sm font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors ${
                              isDarkTech ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-neutral-950">
                                {liveConfig.storeSettings?.currencySymbol || 'Rs.'}{' '}
                                {product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[11px] text-neutral-500 line-through">
                                  {liveConfig.storeSettings?.currencySymbol || 'Rs.'}{' '}
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-bold text-neutral-700">
                                {product.rating}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                ({product.reviews})
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            style={{ backgroundColor: isAdded ? '#059669' : primaryColor }}
                            className="h-9 w-9 rounded-xl text-white flex items-center justify-center transition-all duration-200 hover:opacity-90 active:scale-95 shadow-xs cursor-pointer"
                          >
                            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Dual Promotional Banners */}
      {liveConfig.sectionsVisibility.promoBanners && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
            {/* Left Banner */}
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={100}>
              <div
                className={`relative p-8 sm:p-10 overflow-hidden flex flex-col justify-between shadow-xs border ${
                  isDarkTech
                    ? 'bg-slate-900 border-slate-800 rounded-xl'
                    : isMinimal
                    ? 'bg-neutral-100 border-neutral-300 rounded-none'
                    : 'bg-[#ECFDF5] border-emerald-100 rounded-3xl'
                }`}
              >
                <div className="max-w-xs space-y-3 z-10">
                  <span className="text-[11px] font-extrabold tracking-wider uppercase" style={{ color: primaryColor }}>
                    {liveConfig.promoBanner1.tag}
                  </span>
                  <h3
                    className={`text-2xl sm:text-3xl font-black tracking-tight leading-snug ${
                      isDarkTech ? 'text-white' : 'text-neutral-900'
                    } ${headingFontClass}`}
                  >
                    {liveConfig.promoBanner1.title}
                  </h3>
                  <div className="pt-4">
                    <a
                      href="#sellers"
                      style={{ backgroundColor: primaryColor }}
                      className={`inline-flex items-center gap-2 px-6 py-3 text-white text-xs font-bold shadow-md transition-all duration-200 hover:scale-105 ${
                        isMinimal ? 'rounded-none' : 'rounded-full'
                      }`}
                    >
                      <span>{liveConfig.promoBanner1.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden flex items-end justify-end pointer-events-none">
                  <img
                    src={sellerBannerImg}
                    alt="Artisan Seller"
                    className="h-full w-full object-cover object-left opacity-95"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Right Dark Slate Banner */}
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={200}>
              <div
                className={`relative p-8 sm:p-10 overflow-hidden flex flex-col justify-between shadow-xs border bg-[#111827] border-neutral-800 ${
                  isMinimal ? 'rounded-none' : 'rounded-3xl'
                }`}
              >
                <div className="max-w-xs space-y-3 z-10">
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-400">
                    {liveConfig.promoBanner2.tag}
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug ${headingFontClass}`}>
                    {liveConfig.promoBanner2.title}
                  </h3>
                  <div className="pt-4">
                    <a
                      href="#shop"
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold shadow-md transition-all duration-200 hover:scale-105 ${
                        isMinimal ? 'rounded-none' : 'rounded-full'
                      }`}
                    >
                      <span>{liveConfig.promoBanner2.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden flex items-center justify-end pointer-events-none">
                  <img
                    src={electronicsBannerImg}
                    alt="Latest Gadgets"
                    className="h-full w-full object-cover object-center opacity-90"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 6. Why Shop with Us */}
      {liveConfig.sectionsVisibility.whyShop && (
        <section
          id="about"
          className={`py-16 border-t ${
            isDarkTech ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-neutral-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <h2
                  className={`text-2xl sm:text-3xl tracking-tight ${
                    isDarkTech ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  {liveConfig.whyShop?.title || 'Why Shop with Kadeo?'}
                </h2>
                <p className={`text-xs sm:text-sm ${isDarkTech ? 'text-slate-400' : 'text-neutral-500'}`}>
                  {liveConfig.whyShop?.subtitle || 'A trusted Sri Lankan commerce platform tailored for quality and reliability.'}
                </p>
              </div>
            </ScrollReveal>

            <div className={`${isMobile ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : isTablet ? 'grid grid-cols-2 gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'}`}>
              {trustCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <ScrollReveal key={idx} enabled={isScrollReveal} animationStyle={scrollStyle} delay={idx * 80}>
                    <div
                      className={`p-6 border text-center flex flex-col items-center space-y-3 transition-all ${
                        isDarkTech
                          ? 'bg-slate-900/60 border-slate-800 text-white'
                          : 'bg-[#FAFAF8] border-neutral-200/60'
                      } ${cardShape}`}
                    >
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        <Icon className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      <h3 className="text-sm font-bold">{card.title}</h3>
                      <p className={`text-xs leading-relaxed ${isDarkTech ? 'text-slate-400' : 'text-neutral-500'}`}>
                        {card.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Footer */}
      {liveConfig.sectionsVisibility.footer && (
        <footer className="bg-[#090D16] text-white pt-16 pb-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className={`${isMobile ? 'flex flex-col gap-8 pb-10 border-b border-slate-800' : 'grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800'}`}>
                <div className="md:col-span-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-black tracking-tight text-white ${headingFontClass}`}>
                      {liveConfig.header.storeName || 'Kadeo'}
                    </span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    {liveConfig.footer.description}
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-slate-400">
                    <span className="h-8 w-8 rounded-full bg-slate-800 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                      <Facebook className="h-4 w-4" />
                    </span>
                    <span className="h-8 w-8 rounded-full bg-slate-800 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                      <Instagram className="h-4 w-4" />
                    </span>
                    <span className="h-8 w-8 rounded-full bg-slate-800 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                      <Twitter className="h-4 w-4" />
                    </span>
                    <span className="h-8 w-8 rounded-full bg-slate-800 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Shop</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li><a href="#shop" className="hover:text-white">All Products</a></li>
                    <li><a href="#categories" className="hover:text-white">Featured</a></li>
                    <li><a href="#shop" className="hover:text-white">Discounts & Offers</a></li>
                    <li><a href="#shop" className="hover:text-white">New Arrivals</a></li>
                  </ul>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sell</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li><Link to="/seller/dashboard" className="hover:text-white">Seller Portal</Link></li>
                    <li><Link to="/seller/customize" className="hover:text-white">Store Customizer</Link></li>
                    <li><a href="#sellers" className="hover:text-white">Merchant Handbook</a></li>
                  </ul>
                </div>

                <div className="md:col-span-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Stay in the Loop</h4>
                  <p className="text-xs text-slate-400">Subscribe for secret drops and weekly discounts.</p>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setSubscribed(true);
                      setEmail('');
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700 flex-1"
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: primaryColor }}
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {subscribed ? 'Subscribed!' : 'Join'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>{liveConfig.footer.copyrightText}</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-slate-400">Privacy Policy</a>
                  <a href="#" className="hover:text-slate-400">Terms of Service</a>
                  <a href="#" className="hover:text-slate-400">Security</a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </footer>
      )}
    </div>
  );
};
