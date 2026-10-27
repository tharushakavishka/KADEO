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
  StorefrontThemeType,
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
import linenHeroImg from '../../assets/images/kadeo_linen_hero.jpg';
import ceylonSpicesImg from '../../assets/images/ceylon_cinnamon_spices.jpg';
import catCraftImg from '../../assets/images/category_handcrafted_living_1792347730298.jpg';
import catTechImg from '../../assets/images/category_audio_tech_1792347731311.jpg';
import catBeautyImg from '../../assets/images/category_beauty_wellness_1792347729900.jpg';
import surfLifestyleImg from '../../assets/images/marketplace_hero_lifestyle_1792347748759.jpg';

interface KaveeStorefrontProps {
  shop?: Shop;
  config?: KaveeStorefrontConfig;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

export const KaveeStorefront: React.FC<KaveeStorefrontProps> = ({ shop, config, viewport = 'desktop' }) => {
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const [liveConfig, setLiveConfig] = useState<KaveeStorefrontConfig>(() => {
    return config || KaveeStoreService.getConfig();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [sellerCatalog, setSellerCatalog] = useState<any[]>([]);

  const { addItem, totalItems } = useCart();

  useEffect(() => {
    if (config) {
      setLiveConfig(config);
    }
  }, [config]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
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
  const themeId = (liveConfig.theme?.themeId as StorefrontThemeType) || 'kadeo';

  // Dynamic Theme-based styling flags
  const isDarkTech = cardStyle === 'dark-tech' || themeId === 'tech';
  const isJewelry = themeId === 'jewelry';
  const isCyber = themeId === 'cyber';
  const isDarkBackground = isDarkTech || isJewelry || isCyber;

  const isLuxury = cardStyle === 'luxury-serif' || themeId === 'linen' || themeId === 'beauty' || isJewelry;
  const isBoldStreet = cardStyle === 'bold-street' || themeId === 'streetwear';
  const isOrganic = cardStyle === 'organic-soft' || themeId === 'organic' || themeId === 'spices' || themeId === 'pottery';
  const isMinimal = cardStyle === 'clean-minimal' || themeId === 'minimal';
  const isStreetwear = isBoldStreet;
  const isBeauty = themeId === 'beauty';
  const isSpices = themeId === 'spices';
  const isPottery = themeId === 'pottery';
  const isSurf = themeId === 'surf';
  const isClassic = themeId === 'classic';

  const headingFontClass =
    isJewelry || isLuxury || isPottery || isClassic || isSpices || fontFamily === 'serif'
      ? 'font-serif'
      : isCyber || fontFamily === 'mono'
      ? 'font-mono'
      : isBoldStreet
      ? 'font-black tracking-tighter'
      : isMinimal
      ? 'font-light tracking-wider'
      : 'font-sans font-black';

  const rootBgClass = isCyber
    ? 'bg-[#08070F] text-slate-100'
    : isJewelry
    ? 'bg-[#090A14] text-slate-100'
    : isDarkTech
    ? 'bg-[#0B0F19] text-slate-100'
    : isPottery
    ? 'bg-[#FAF6F0] text-stone-900'
    : isSpices
    ? 'bg-[#FAF7F2] text-amber-950'
    : isSurf
    ? 'bg-[#F0FDFA] text-teal-950'
    : isLuxury
    ? 'bg-[#FCFAF7] text-neutral-900'
    : isClassic
    ? 'bg-[#FAF7F2] text-amber-950'
    : isMinimal
    ? 'bg-[#FFFFFF] text-black'
    : 'bg-[#FCFCFD] text-neutral-900';

  const heroSectionBgClass = isCyber
    ? 'bg-[#0E0C1C] border-purple-900/30'
    : isJewelry
    ? 'bg-[#0D1020] border-amber-900/20'
    : isDarkTech
    ? 'bg-[#0F172A] border-slate-800'
    : isPottery
    ? 'bg-[#F7F2E9] border-stone-200'
    : isSpices
    ? 'bg-[#F9F5EC] border-amber-200/50'
    : isSurf
    ? 'bg-[#E6FFFA] border-teal-100'
    : isLuxury
    ? 'bg-[#FAF8F5] border-amber-900/10'
    : isOrganic
    ? 'bg-[#F0FDF4] border-emerald-100'
    : 'bg-[#FAFAF8] border-neutral-100';

  const shopSectionBgClass = isCyber
    ? 'bg-[#090714] border-purple-900/30'
    : isJewelry
    ? 'bg-[#080B17] border-amber-900/20'
    : isDarkTech
    ? 'bg-[#0F172A] border-slate-800'
    : isPottery
    ? 'bg-[#F5EFE6] border-stone-200'
    : isSpices
    ? 'bg-[#F7F2E7] border-amber-200/40'
    : isSurf
    ? 'bg-[#EBFBF7] border-teal-100'
    : isLuxury
    ? 'bg-[#FAF8F5] border-amber-900/10'
    : 'bg-[#FAFAF8] border-neutral-100';

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
      ? isDarkBackground
        ? 'bg-slate-900 border-2 border-slate-700 text-white focus:border-sky-500'
        : 'bg-white border-2 border-neutral-300 text-neutral-800 focus:border-emerald-500 shadow-2xs'
      : isDarkBackground
      ? 'bg-slate-900/80 border border-slate-800 text-white placeholder:text-slate-500 focus:bg-slate-900'
      : 'bg-[#F3F4F6] border border-transparent focus:border-neutral-300 focus:bg-white text-neutral-800 placeholder:text-neutral-400';

  const navHeightClass = navHeight === 'compact' ? 'h-16' : 'h-20';

  let navWrapperClass = `${isNavSticky ? 'sticky top-0 z-50' : 'relative z-20'} transition-all `;
  if (navStyle === 'floating') {
    navWrapperClass += isDarkBackground
      ? 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-800 shadow-2xl'
      : isLuxury
      ? 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-[#FCFAF7]/95 backdrop-blur-xl border border-amber-900/15 shadow-xl'
      : 'max-w-6xl mx-auto my-3 px-4 sm:px-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200/90 shadow-xl';
  } else if (navStyle === 'transparent') {
    navWrapperClass += isDarkBackground
      ? 'bg-[#0B0F19]/70 backdrop-blur-md border-b border-slate-800/60'
      : 'bg-white/70 backdrop-blur-md border-b border-neutral-200/50';
  } else {
    navWrapperClass += isDarkBackground
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
    liveConfig.animations?.ctaButtonPulse !== false ? 'animate-kadeo-pulse' : '';

  const cardAnimClass =
    liveConfig.animations?.productHover === 'glow-border'
      ? 'hover:border-emerald-500 hover:shadow-lg transition-all duration-300'
      : liveConfig.animations?.productHover === 'scale'
      ? 'hover:scale-[1.03] transition-transform duration-300 shadow-sm hover:shadow-md'
      : liveConfig.animations?.productHover === 'subtle'
      ? 'hover:opacity-95 transition-opacity'
      : 'hover:-translate-y-1 hover:shadow-xl transition-all duration-300';

  // Real-time catalog detection
  useEffect(() => {
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

  // Authentic Catalog generator tailored to each of the 13 themes
  const getCatalogForTheme = (tId: StorefrontThemeType) => {
    switch (tId) {
      case 'spices':
        return [
          {
            id: 'spices-1',
            name: 'Pure Ceylon Alba Cinnamon Quills (100g)',
            seller: 'Royal Ceylon Spices',
            price: 1450,
            originalPrice: 1800,
            rating: 4.9,
            reviews: 148,
            badge: 'Alba Grade',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            image: ceylonSpicesImg,
          },
          {
            id: 'spices-2',
            name: 'Single-Origin Ruhuna Flowery Pekoe Tea',
            seller: 'Estate Teas Ceylon',
            price: 1850,
            originalPrice: 2200,
            rating: 4.9,
            reviews: 112,
            badge: 'Hand-Picked',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            image: ceylonSpicesImg,
          },
          {
            id: 'spices-3',
            name: 'Organic Sun-Dried Ceylon Green Cardamom',
            seller: 'Ceylon Organics',
            price: 2200,
            rating: 4.8,
            reviews: 84,
            badge: 'Pure Harvest',
            badgeColor: 'bg-green-100 text-green-800 border-green-300',
            image: prodPlantImg,
          },
          {
            id: 'spices-4',
            name: 'Wild Forest Bee Honey & Ginger Infusion (500g)',
            seller: 'Heritage Bee Co.',
            price: 2900,
            originalPrice: 3400,
            rating: 5.0,
            reviews: 95,
            badge: 'Raw & Wild',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: ceylonSpicesImg,
          },
          {
            id: 'spices-5',
            name: 'Whole Ceylon Cloves & Black Peppercorns Blend',
            seller: 'Royal Ceylon Spices',
            price: 1200,
            rating: 4.7,
            reviews: 63,
            badge: 'Single Estate',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            image: ceylonSpicesImg,
          },
        ];
      case 'jewelry':
        return [
          {
            id: 'jewel-1',
            name: 'Ceylon Royal Blue Sapphire Solitaire Ring (18K Gold)',
            seller: 'Ceylon Gem House',
            price: 145000,
            originalPrice: 165000,
            rating: 5.0,
            reviews: 42,
            badge: 'Lab Certified',
            badgeColor: 'bg-blue-900/60 text-blue-200 border-blue-500/40',
            image: catBeautyImg,
          },
          {
            id: 'jewel-2',
            name: 'Hand-Carved Ceylon Moonstone Drop Earrings',
            seller: 'Lanka Lapidary',
            price: 28500,
            rating: 4.9,
            reviews: 67,
            badge: 'Meetiyagoda',
            badgeColor: 'bg-indigo-900/60 text-indigo-200 border-indigo-500/40',
            image: prodSkincareImg,
          },
          {
            id: 'jewel-3',
            name: 'Natural Star Ruby Artisan Vintage Pendant',
            seller: 'Royal Heirlooms',
            price: 85000,
            originalPrice: 98000,
            rating: 4.9,
            reviews: 31,
            badge: 'Unheated',
            badgeColor: 'bg-rose-900/60 text-rose-200 border-rose-500/40',
            image: catCraftImg,
          },
          {
            id: 'jewel-4',
            name: '18K Solid Gold Emerald-Cut Diamond Band',
            seller: 'Ceylon Gem House',
            price: 95000,
            rating: 5.0,
            reviews: 58,
            badge: 'Bespoke',
            badgeColor: 'bg-amber-900/60 text-amber-200 border-amber-500/40',
            image: catBeautyImg,
          },
          {
            id: 'jewel-5',
            name: 'Faceted Ceylon Sky Blue Topaz Necklace',
            seller: 'Lanka Lapidary',
            price: 34000,
            rating: 4.8,
            reviews: 29,
            badge: 'Natural Gem',
            badgeColor: 'bg-sky-900/60 text-sky-200 border-sky-500/40',
            image: prodSkincareImg,
          },
        ];
      case 'pottery':
        return [
          {
            id: 'pottery-1',
            name: 'Hand-Thrown Terracotta Urn Amphora Vase',
            seller: 'Clay & Kiln Studio',
            price: 3400,
            originalPrice: 4200,
            rating: 4.9,
            reviews: 73,
            badge: 'Wheel-Turned',
            badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
            image: catCraftImg,
          },
          {
            id: 'pottery-2',
            name: 'Earthy Smoke-Glazed Ceramic Matcha Bowl',
            seller: 'Artisan Wheel Ceylon',
            price: 2600,
            rating: 4.9,
            reviews: 88,
            badge: 'Wood-Fired',
            badgeColor: 'bg-stone-200 text-stone-800 border-stone-300',
            image: catCraftImg,
          },
          {
            id: 'pottery-3',
            name: 'Rustic Terracotta Self-Watering Planter',
            seller: 'Clay & Kiln Studio',
            price: 2800,
            rating: 4.8,
            reviews: 62,
            badge: '100% Clay',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            image: prodPlantImg,
          },
          {
            id: 'pottery-4',
            name: 'Wheel-Turned Stoneware Dinner Plate Set (4-Piece)',
            seller: 'Ceylon Potters Guild',
            price: 5200,
            originalPrice: 6200,
            rating: 4.9,
            reviews: 45,
            badge: 'Handcrafted',
            badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
            image: catCraftImg,
          },
          {
            id: 'pottery-5',
            name: 'Traditional Handcrafted Clay Water Carafe',
            seller: 'Clay & Kiln Studio',
            price: 4100,
            rating: 4.8,
            reviews: 51,
            badge: 'Natural Cool',
            badgeColor: 'bg-stone-200 text-stone-800 border-stone-300',
            image: catCraftImg,
          },
        ];
      case 'cyber':
        return [
          {
            id: 'cyber-1',
            name: 'RGB Optical Hot-Swap Mechanical Keydeck (Linear Red)',
            seller: 'CyberBattlestation',
            price: 18900,
            originalPrice: 22500,
            rating: 4.9,
            reviews: 134,
            badge: 'Pro Esports',
            badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-500/40',
            image: catTechImg,
          },
          {
            id: 'cyber-2',
            name: 'Spatial 7.1 Cyber ANC Wireless Gaming Headset',
            seller: 'NeonAudio',
            price: 14500,
            rating: 4.9,
            reviews: 97,
            badge: 'Zero Latency',
            badgeColor: 'bg-cyan-900/60 text-cyan-200 border-cyan-500/40',
            image: prodEarbudsImg,
          },
          {
            id: 'cyber-3',
            name: 'Holographic Magnetic 100W GaN Charging Station',
            seller: 'CyberBattlestation',
            price: 11200,
            originalPrice: 13500,
            rating: 4.8,
            reviews: 76,
            badge: 'Fast GaN',
            badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-500/40',
            image: catTechImg,
          },
          {
            id: 'cyber-4',
            name: 'Aerospace CNC Aluminum Programmable Macro Pad',
            seller: 'NeonAudio',
            price: 8900,
            rating: 4.7,
            reviews: 52,
            badge: 'Custom Firmware',
            badgeColor: 'bg-cyan-900/60 text-cyan-200 border-cyan-500/40',
            image: catTechImg,
          },
          {
            id: 'cyber-5',
            name: 'Esports Nanoweave Ultrawide Desk Matrix Pad (900x400)',
            seller: 'CyberBattlestation',
            price: 4500,
            rating: 4.9,
            reviews: 89,
            badge: 'Nanoweave',
            badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-500/40',
            image: electronicsBannerImg,
          },
        ];
      case 'surf':
        return [
          {
            id: 'surf-1',
            name: 'Fast-Dry 4-Way Stretch Tropical Boardshorts',
            seller: 'Southern Coast Surf',
            price: 4800,
            originalPrice: 5600,
            rating: 4.9,
            reviews: 87,
            badge: 'Water-Repellent',
            badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
            image: surfLifestyleImg,
          },
          {
            id: 'surf-2',
            name: 'Mineral Zinc Reef-Safe Sunscreen SPF50 (120ml)',
            seller: 'SunTropics Ceylon',
            price: 3200,
            rating: 5.0,
            reviews: 104,
            badge: 'Reef Safe',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            image: prodSkincareImg,
          },
          {
            id: 'surf-3',
            name: 'UV50+ Long Sleeve Performance Rashguard',
            seller: 'Southern Coast Surf',
            price: 5200,
            originalPrice: 6200,
            rating: 4.8,
            reviews: 61,
            badge: 'UPF 50+',
            badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
            image: prodTshirtImg,
          },
          {
            id: 'surf-4',
            name: 'Hand-Shaped Warm Water Surf Wax & Bamboo Comb Kit',
            seller: 'Arugam Craft',
            price: 1800,
            rating: 4.9,
            reviews: 78,
            badge: 'Organic Beeswax',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            image: surfLifestyleImg,
          },
          {
            id: 'surf-5',
            name: 'Handwoven Island Straw Hat & Heavy Canvas Beach Tote',
            seller: 'Southern Coast Surf',
            price: 3600,
            rating: 4.8,
            reviews: 49,
            badge: 'Artisan Woven',
            badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
            image: heroBagImg,
          },
        ];
      case 'tech':
        return [
          {
            id: 'tech-1',
            name: 'Pro ANC Wireless Earbuds with Spatial Audio',
            seller: 'TechMatrix',
            price: 7990,
            originalPrice: 9990,
            rating: 4.9,
            reviews: 142,
            badge: 'Wireless ANC',
            badgeColor: 'bg-sky-900/60 text-sky-200 border-sky-500/40',
            image: prodEarbudsImg,
          },
          {
            id: 'tech-2',
            name: 'Gaming Mechanical Hot-Swap Deck',
            seller: 'CyberGear',
            price: 12800,
            originalPrice: 14900,
            rating: 4.8,
            reviews: 98,
            badge: 'RGB Mechanical',
            badgeColor: 'bg-blue-900/60 text-blue-200 border-blue-500/40',
            image: catTechImg,
          },
          {
            id: 'tech-3',
            name: '65W Fast GaN Magnetic Power Bank 20,000mAh',
            seller: 'PowerVolt',
            price: 5900,
            rating: 4.8,
            reviews: 73,
            badge: 'Fast GaN',
            badgeColor: 'bg-cyan-900/60 text-cyan-200 border-cyan-500/40',
            image: electronicsBannerImg,
          },
          {
            id: 'tech-4',
            name: 'Studio Monitoring In-Ear Monitors',
            seller: 'SonicLab',
            price: 8400,
            rating: 4.9,
            reviews: 56,
            badge: 'Hi-Res Audio',
            badgeColor: 'bg-indigo-900/60 text-indigo-200 border-indigo-500/40',
            image: prodEarbudsImg,
          },
          {
            id: 'tech-5',
            name: 'Ergonomic Wireless Silent Mouse',
            seller: 'DeskFlow',
            price: 4200,
            rating: 4.7,
            reviews: 64,
            badge: 'Bluetooth 5.3',
            badgeColor: 'bg-sky-900/60 text-sky-200 border-sky-500/40',
            image: catTechImg,
          },
        ];
      case 'linen':
        return [
          {
            id: 'linen-1',
            name: 'Ceylon Pure Handwoven Linen Shirt',
            seller: 'Kavee Boutique',
            price: 5800,
            originalPrice: 6900,
            rating: 4.9,
            reviews: 128,
            badge: '100% Pure Linen',
            badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
            image: prodTshirtImg,
          },
          {
            id: 'linen-2',
            name: 'Terracotta Linen Summer Midi Dress',
            seller: 'Kavee Boutique',
            price: 6900,
            originalPrice: 8200,
            rating: 4.9,
            reviews: 84,
            badge: 'Limited Batch',
            badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
            image: prodTshirtImg,
          },
          {
            id: 'linen-3',
            name: 'Breathable Resort Linen Trousers',
            seller: 'Ceylon Weavers',
            price: 5400,
            rating: 4.8,
            reviews: 67,
            badge: 'Tailored Fit',
            badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
            image: prodTshirtImg,
          },
          {
            id: 'linen-4',
            name: 'Artisan Washed Soft Linen Scarf',
            seller: 'Kavee Boutique',
            price: 2400,
            rating: 4.7,
            reviews: 49,
            badge: 'Organic Dye',
            badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
            image: heroBagImg,
          },
          {
            id: 'linen-5',
            name: 'Relaxed Tropical Linen Kimono',
            seller: 'Kavee Boutique',
            price: 7200,
            rating: 5.0,
            reviews: 52,
            badge: 'Artisan Weave',
            badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
            image: prodTshirtImg,
          },
        ];
      case 'beauty':
        return [
          {
            id: 'beauty-1',
            name: 'Rose Radiance Glow Elixir (30ml)',
            seller: 'Glow Botanics',
            price: 3800,
            originalPrice: 4500,
            rating: 4.9,
            reviews: 164,
            badge: 'Bestseller',
            badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
            image: prodSkincareImg,
          },
          {
            id: 'beauty-2',
            name: 'Botanical Skin Hydration Face Cream',
            seller: 'Aarya Botanicals',
            price: 4990,
            originalPrice: 6500,
            rating: 4.9,
            reviews: 98,
            badge: 'Deep Hydration',
            badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
            image: prodSkincareImg,
          },
          {
            id: 'beauty-3',
            name: 'Ceylon Green Tea Seed Brightening Serum',
            seller: 'Glow Botanics',
            price: 4200,
            rating: 4.8,
            reviews: 82,
            badge: 'Antioxidant',
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            image: prodSkincareImg,
          },
          {
            id: 'beauty-4',
            name: 'Cooling Rose Quartz Facial Sculpting Roller',
            seller: 'Pure Rituals',
            price: 2400,
            rating: 4.8,
            reviews: 59,
            badge: 'Natural Quartz',
            badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
            image: catBeautyImg,
          },
          {
            id: 'beauty-5',
            name: 'Hibiscus & Mineral Clarifying Clay Mask',
            seller: 'Glow Botanics',
            price: 2600,
            rating: 4.7,
            reviews: 43,
            badge: 'Detoxifying',
            badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
            image: prodSkincareImg,
          },
        ];
      case 'streetwear':
        return [
          {
            id: 'street-1',
            name: 'Drop 04 Oversized Heavyweight Tee (300GSM)',
            seller: 'Colombo Raw',
            price: 3850,
            originalPrice: 4500,
            rating: 4.9,
            reviews: 182,
            badge: 'Limited Drop',
            badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
            image: prodTshirtImg,
          },
          {
            id: 'street-2',
            name: 'Boxy Underground Colombo Fleece Hoodie',
            seller: 'Colombo Raw',
            price: 7900,
            originalPrice: 9200,
            rating: 5.0,
            reviews: 119,
            badge: 'Heavyweight',
            badgeColor: 'bg-neutral-900 text-white border-neutral-700',
            image: prodTshirtImg,
          },
          {
            id: 'street-3',
            name: 'Tactical Utility Crossbody Sling Pack',
            seller: 'Distrikt',
            price: 4200,
            rating: 4.8,
            reviews: 94,
            badge: 'Waterproof',
            badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
            image: prodBackpackImg,
          },
          {
            id: 'street-4',
            name: 'Distressed Vintage Wash Archival Cap',
            seller: 'Colombo Raw',
            price: 2800,
            rating: 4.7,
            reviews: 73,
            badge: 'Archival',
            badgeColor: 'bg-neutral-900 text-white border-neutral-700',
            image: prodTshirtImg,
          },
          {
            id: 'street-5',
            name: 'Relaxed Heavy French Terry Cargo Sweats',
            seller: 'Distrikt',
            price: 5400,
            rating: 4.9,
            reviews: 65,
            badge: 'Heavy Terry',
            badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
            image: prodTshirtImg,
          },
        ];
      case 'organic':
        return [
          {
            id: 'org-1',
            name: 'Living Air-Purifying Monstera Deliciosa Plant',
            seller: 'Green Living',
            price: 2450,
            originalPrice: 2900,
            rating: 4.9,
            reviews: 115,
            badge: 'Air Purifying',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            image: prodPlantImg,
          },
          {
            id: 'org-2',
            name: 'Biodegradable Terracotta Clay Planter Pot',
            seller: 'EcoVibe',
            price: 1800,
            rating: 4.8,
            reviews: 84,
            badge: '100% Eco Clay',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
            image: prodPlantImg,
          },
          {
            id: 'org-3',
            name: 'Organic Micro-Herbs Home Growing Kit',
            seller: 'Pure Sprout Ceylon',
            price: 1950,
            rating: 4.8,
            reviews: 62,
            badge: 'Easy Grow',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            image: prodPlantImg,
          },
          {
            id: 'org-4',
            name: 'Ceylon Wildflower Raw Unfiltered Honey (500g)',
            seller: 'Forest Gatherers',
            price: 2600,
            rating: 5.0,
            reviews: 97,
            badge: 'Raw & Wild',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: ceylonSpicesImg,
          },
          {
            id: 'org-5',
            name: 'Pure Organic Lemongrass Aromatherapy Oil',
            seller: 'Pure Ceylon Eco',
            price: 1400,
            rating: 4.7,
            reviews: 58,
            badge: 'Pure Essential',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            image: prodPlantImg,
          },
        ];
      case 'minimal':
        return [
          {
            id: 'min-1',
            name: 'Architectural Matte Ceramic Vessel',
            seller: 'Studio Form',
            price: 4200,
            originalPrice: 5000,
            rating: 4.9,
            reviews: 79,
            badge: 'Studio Batch',
            badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
            image: catCraftImg,
          },
          {
            id: 'min-2',
            name: 'Ultra-Slim Full-Grain Leather Folio',
            seller: 'Nordik Living',
            price: 6800,
            originalPrice: 7900,
            rating: 4.9,
            reviews: 64,
            badge: 'Minimal Carry',
            badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
            image: heroBagImg,
          },
          {
            id: 'min-3',
            name: 'Minimalist Precision Aluminum Desk Clock',
            seller: 'Studio Form',
            price: 3500,
            rating: 4.8,
            reviews: 51,
            badge: 'Anodized Alloy',
            badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
            image: electronicsBannerImg,
          },
          {
            id: 'min-4',
            name: 'Geometric Solid Teak Coaster Set (4-Pack)',
            seller: 'Nordik Living',
            price: 1800,
            rating: 4.7,
            reviews: 42,
            badge: 'Solid Teak',
            badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
            image: catCraftImg,
          },
          {
            id: 'min-5',
            name: 'Monochromatic Heavy Cotton Woven Throw',
            seller: 'Studio Form',
            price: 5200,
            rating: 4.9,
            reviews: 48,
            badge: '100% Cotton',
            badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
            image: prodTshirtImg,
          },
        ];
      case 'classic':
        return [
          {
            id: 'classic-1',
            name: 'Full-Grain Leather Weekender Duffel Bag',
            seller: 'Heritage Leatherworks',
            price: 16500,
            originalPrice: 19500,
            rating: 5.0,
            reviews: 92,
            badge: 'Full Grain',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: heroBagImg,
          },
          {
            id: 'classic-2',
            name: 'Hand-Stitched Vegetable Tanned Bifold Wallet',
            seller: 'Artisan Guild Ceylon',
            price: 4800,
            rating: 4.9,
            reviews: 114,
            badge: 'Lifetime Stitch',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: heroBagImg,
          },
          {
            id: 'classic-3',
            name: 'Reclaimed Solid Ceylon Teak Catchall Tray',
            seller: 'Ceylon Heirlooms',
            price: 3200,
            rating: 4.8,
            reviews: 67,
            badge: 'Aged Teak',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: catCraftImg,
          },
          {
            id: 'classic-4',
            name: 'Antique Solid Brass Pocket Compass',
            seller: 'Legacy Artifacts',
            price: 5900,
            originalPrice: 6900,
            rating: 4.9,
            reviews: 53,
            badge: 'Solid Brass',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: heroBagImg,
          },
          {
            id: 'classic-5',
            name: 'Hand-Bound Refillable Leather Travel Journal',
            seller: 'Heritage Leatherworks',
            price: 2900,
            rating: 4.8,
            reviews: 75,
            badge: 'Parchment',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            image: heroBagImg,
          },
        ];
      case 'kadeo':
      default:
        return [
          {
            id: 'prod-kavee-1',
            name: 'Ceylon Pure Linen Oversized Shirt',
            seller: 'Urban Threads',
            price: 4500,
            originalPrice: 5500,
            rating: 4.9,
            reviews: 142,
            badge: 'Bestseller',
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            image: prodTshirtImg,
          },
          {
            id: 'prod-kavee-2',
            name: 'Pro ANC Wireless Earbuds with Spatial Audio',
            seller: 'TechZone',
            price: 7990,
            originalPrice: 9990,
            rating: 4.8,
            reviews: 98,
            badge: 'Trending',
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            image: prodEarbudsImg,
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
            name: 'All-Weather Utility Carry Pack',
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
            name: 'Purifying Tropical Houseplant in Clay Pot',
            seller: 'Ceylon Living',
            price: 1450,
            rating: 4.8,
            reviews: 56,
            badge: 'Fresh',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            image: prodPlantImg,
          },
        ];
    }
  };

  const themeProducts = getCatalogForTheme(themeId);
  const displayedProducts = sellerCatalog.length > 0 ? sellerCatalog : themeProducts;

  // Tailored Promo Banner Images
  const banner1Img = isSpices
    ? ceylonSpicesImg
    : isJewelry
    ? catBeautyImg
    : isPottery
    ? catCraftImg
    : isCyber
    ? catTechImg
    : isOrganic
    ? prodPlantImg
    : isSurf
    ? surfLifestyleImg
    : isLuxury
    ? linenHeroImg
    : isStreetwear
    ? prodTshirtImg
    : isBeauty
    ? prodSkincareImg
    : isClassic
    ? heroBagImg
    : sellerBannerImg;

  const banner2Img = isSpices
    ? ceylonSpicesImg
    : isJewelry
    ? catCraftImg
    : isPottery
    ? catCraftImg
    : isCyber
    ? electronicsBannerImg
    : isOrganic
    ? prodPlantImg
    : isSurf
    ? surfLifestyleImg
    : isLuxury
    ? prodTshirtImg
    : isStreetwear
    ? prodBackpackImg
    : isBeauty
    ? catBeautyImg
    : isClassic
    ? heroBagImg
    : electronicsBannerImg;

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
      title: liveConfig.whyShop?.card1Title || (isDarkBackground ? 'Verified Authenticity' : 'Guaranteed Protection'),
      desc: liveConfig.whyShop?.card1Desc || '100% genuine products with full buyer security on every order.',
    },
    {
      icon: Truck,
      title: liveConfig.whyShop?.card2Title || 'Islandwide Delivery',
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
    <div className={`min-h-screen transition-colors ${rootBgClass}`}>
      {/* Dynamic Keyframes for Storefront Animations */}
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
              <span className="flex items-center gap-2">
                <span>{liveConfig.announcementBar.text}</span>
                {liveConfig.announcementBar.linkText && (
                  <span className="font-extrabold underline cursor-pointer">{liveConfig.announcementBar.linkText}</span>
                )}
              </span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex items-center justify-center gap-2">
              <span>{liveConfig.announcementBar.text}</span>
              {liveConfig.announcementBar.linkText && (
                <span className="font-extrabold underline cursor-pointer">{liveConfig.announcementBar.linkText}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1. Header Navigation */}
      {liveConfig.sectionsVisibility.header && (
        <header className={navWrapperClass}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${navHeightClass} flex items-center justify-between gap-4`}>
            {/* Brand Logo */}
            <div className={`flex items-center gap-8 ${linksAlignment === 'center' ? 'flex-none' : ''}`}>
              <Link to="/shop/kavee-3" className="flex items-center gap-2 group">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-2xl font-black tracking-tight ${
                      isDarkBackground ? 'text-white' : 'text-neutral-950'
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
                    isDarkBackground ? 'text-slate-300' : 'text-neutral-600'
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
                  isDarkBackground ? 'text-slate-300' : 'text-neutral-600'
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

            {/* Center / Search bar (Desktop & Tablet) */}
            {showSearch && !isMobile && (
              <div className="flex-1 max-w-md relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-10 pr-4 py-2 text-xs transition-all focus:outline-none ${searchShapeClass} ${searchInputStyleClass}`}
                />
              </div>
            )}

            {/* Desktop Navigation Links (Right Aligned) */}
            {!isMobile && linksAlignment === 'right' && (
              <nav
                className={`${isTablet ? 'flex' : 'hidden lg:flex'} items-center gap-7 text-sm font-medium ${
                  isDarkBackground ? 'text-slate-300' : 'text-neutral-600'
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

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              {showWishlist && (
                <button
                  type="button"
                  aria-label="Wishlist"
                  className={`p-2 rounded-full hover:bg-neutral-100 transition-colors relative cursor-pointer ${
                    isDarkBackground ? 'text-slate-300 hover:bg-slate-800' : 'text-neutral-700'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  {Object.values(wishlist).filter(Boolean).length > 0 && (
                    <span
                      className="absolute top-1 right-1 h-2 w-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    ></span>
                  )}
                </button>
              )}

              <Link
                to="/account"
                aria-label="Account"
                className={`p-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer ${
                  isDarkBackground ? 'text-slate-300 hover:bg-slate-800' : 'text-neutral-700'
                }`}
              >
                <User className="h-5 w-5" />
              </Link>

              <button
                type="button"
                aria-label="Cart"
                className={`p-2 rounded-full hover:bg-neutral-100 transition-colors relative cursor-pointer ${
                  isDarkBackground ? 'text-slate-300 hover:bg-slate-800' : 'text-neutral-700'
                }`}
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
          className={`relative overflow-hidden py-14 lg:py-24 border-b transition-colors ${heroSectionBgClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${isMobile ? 'flex flex-col gap-8' : isTablet ? 'grid grid-cols-12 gap-8 items-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'}`}>
              {/* Left Content */}
              <div className={`${isMobile ? 'space-y-4' : 'lg:col-span-6 space-y-6'}`}>
                {liveConfig.hero.badgeText && (
                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      isDarkBackground
                        ? 'bg-slate-800/80 text-sky-400 border-slate-700'
                        : isSpices
                        ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                        : isPottery
                        ? 'bg-orange-100/80 text-orange-950 border-orange-300'
                        : isSurf
                        ? 'bg-teal-100/80 text-teal-900 border-teal-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <span>{liveConfig.hero.badgeText}</span>
                  </div>
                )}

                <h1
                  className={`text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.12] ${
                    isDarkBackground ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  <span className="block">{liveConfig.hero.headlineLine1}</span>
                  <span className="block" style={{ color: primaryColor }}>
                    {liveConfig.hero.headlineLine2}
                  </span>
                  <span className="block">{liveConfig.hero.headlineLine3}</span>
                </h1>

                <p
                  className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                    isDarkBackground ? 'text-slate-400' : 'text-neutral-600'
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
                      isDarkBackground
                        ? 'border-slate-700 bg-slate-900 rounded-3xl'
                        : isLuxury
                        ? 'border-amber-200/60 bg-[#F5EFE6] rounded-3xl'
                        : isPottery
                        ? 'border-orange-200/60 bg-[#F7F2E9] rounded-3xl'
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
                          isDarkBackground
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
                    isDarkBackground ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  {liveConfig.categories?.title || 'Shop by Category'}
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isDarkBackground ? 'text-slate-400' : 'text-neutral-500'}`}>
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
                      isDarkBackground
                        ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/50 hover:bg-slate-800'
                        : isPottery
                        ? 'bg-[#FFFDF9] border-stone-200/90 hover:border-orange-300 hover:shadow-md'
                        : isSpices
                        ? 'bg-[#FFFEFA] border-amber-200/80 hover:border-emerald-300 hover:shadow-md'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-md'
                    } ${cardShape}`}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                        isDarkBackground ? 'bg-slate-800 text-sky-400' : cat.color
                      }`}
                    >
                      <Icon className="h-6 w-6 stroke-[1.8]" />
                    </div>
                    <h3 className={`text-xs font-bold truncate w-full ${isDarkBackground ? 'text-white' : 'text-neutral-900'}`}>
                      {cat.name}
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isDarkBackground ? 'text-slate-500' : 'text-neutral-400'}`}>
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
          className={`py-16 border-y transition-colors ${shopSectionBgClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <h2
                    className={`text-2xl sm:text-3xl tracking-tight ${
                      isDarkBackground ? 'text-white' : 'text-neutral-950'
                    } ${headingFontClass}`}
                  >
                    {liveConfig.products?.title || 'Featured Collection'}
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 ${isDarkBackground ? 'text-slate-400' : 'text-neutral-500'}`}>
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

            <div className={`${isMobile ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : isTablet ? 'grid grid-cols-3 gap-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'}`}>
              {displayedProducts.map((product, idx) => {
                const isFavorited = !!wishlist[product.id];
                const isAdded = !!addedMap[product.id];

                return (
                  <ScrollReveal key={product.id || idx} enabled={isScrollReveal} animationStyle={scrollStyle} delay={idx * 70}>
                    <div
                      className={`group relative border shadow-2xs flex flex-col justify-between overflow-hidden ${cardShape} ${cardAnimClass} ${
                        isDarkBackground
                          ? 'bg-slate-900/90 border-slate-800 text-white'
                          : isPottery
                          ? 'bg-[#FFFDF9] border-stone-200/90 text-stone-900'
                          : isSpices
                          ? 'bg-[#FFFEFA] border-amber-200/80 text-amber-950'
                          : 'bg-white border-neutral-200/90 text-neutral-900'
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
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-white transition-all shadow-xs cursor-pointer"
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
                          <p className={`text-[11px] font-semibold mb-1 ${isDarkBackground ? 'text-slate-400' : 'text-neutral-600'}`}>
                            {product.seller}
                          </p>
                          <h3
                            className={`text-sm font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors ${
                              isDarkBackground ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100/60 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-sm font-black ${isDarkBackground ? 'text-white' : 'text-neutral-950'}`}>
                                {liveConfig.storeSettings?.currencySymbol || 'Rs.'}{' '}
                                {product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className={`text-[11px] line-through ${isDarkBackground ? 'text-slate-400' : 'text-neutral-500'}`}>
                                  {liveConfig.storeSettings?.currencySymbol || 'Rs.'}{' '}
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className={`text-[11px] font-bold ${isDarkBackground ? 'text-slate-300' : 'text-neutral-700'}`}>
                                {product.rating}
                              </span>
                              <span className={`text-[10px] ${isDarkBackground ? 'text-slate-500' : 'text-neutral-400'}`}>
                                ({product.reviews})
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            style={{
                              backgroundColor: isAdded ? '#10B981' : primaryColor,
                            }}
                            className={`p-2.5 text-white transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${
                              isMinimal ? 'rounded-none' : 'rounded-xl'
                            }`}
                            title="Add to Cart"
                          >
                            {isAdded ? (
                              <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50" />
                            ) : (
                              <ShoppingBag className="h-4 w-4" />
                            )}
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

      {/* 5. Promotional Banners */}
      {liveConfig.sectionsVisibility.promoBanners && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Warm Sand Banner */}
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={100}>
              <div
                className={`relative p-8 sm:p-10 overflow-hidden flex flex-col justify-between shadow-xs border ${
                  isMinimal ? 'rounded-none' : 'rounded-3xl'
                } ${
                  isDarkBackground
                    ? 'bg-slate-900 border-slate-800'
                    : isPottery
                    ? 'bg-[#F2ECE1] border-stone-300'
                    : isSpices
                    ? 'bg-[#F6EFE2] border-amber-200'
                    : 'bg-[#FDF6E2] border-amber-200/80'
                }`}
              >
                <div className="max-w-xs space-y-3 z-10">
                  <span className={`text-[11px] font-extrabold tracking-wider uppercase ${isDarkBackground ? 'text-sky-400' : 'text-amber-800'}`}>
                    {liveConfig.promoBanner1.tag}
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-black tracking-tight leading-snug ${isDarkBackground ? 'text-white' : 'text-neutral-950'} ${headingFontClass}`}>
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
                    src={banner1Img}
                    alt="Promo Spotlight"
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
                    src={banner2Img}
                    alt="Promo Feature"
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
            isDarkBackground ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-neutral-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <h2
                  className={`text-2xl sm:text-3xl tracking-tight ${
                    isDarkBackground ? 'text-white' : 'text-neutral-950'
                  } ${headingFontClass}`}
                >
                  {liveConfig.whyShop?.title || 'Why Shop with Kadeo?'}
                </h2>
                <p className={`text-xs sm:text-sm ${isDarkBackground ? 'text-slate-400' : 'text-neutral-500'}`}>
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
                      className={`p-6 text-center flex flex-col items-center justify-between border ${cardShape} ${
                        isDarkBackground
                          ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                          : isPottery
                          ? 'bg-[#FFFDF9] border-stone-200 text-stone-900'
                          : isSpices
                          ? 'bg-[#FFFEFA] border-amber-200/80 text-amber-950'
                          : 'bg-neutral-50/80 border-neutral-100 text-neutral-900'
                      }`}
                    >
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                        }}
                      >
                        <Icon className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      <h3 className={`text-sm font-bold mb-1 ${isDarkBackground ? 'text-white' : 'text-neutral-900'}`}>{card.title}</h3>
                      <p className={`text-xs leading-relaxed ${isDarkBackground ? 'text-slate-400' : 'text-neutral-500'}`}>{card.desc}</p>
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
        <footer className="bg-[#0B132B] text-white pt-16 pb-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal enabled={isScrollReveal} animationStyle={scrollStyle} delay={50}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
                <div className="md:col-span-4 space-y-4">
                  <div className="flex items-center gap-1.5">
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
