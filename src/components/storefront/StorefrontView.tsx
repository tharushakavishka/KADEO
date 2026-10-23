import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MapPin,
  Clock,
  Phone,
  Search,
  ShoppingBag,
  Heart,
  User,
  Star,
  Leaf,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Check,
  X,
  Menu,
  Facebook,
  Instagram,
  Youtube,
  Share2,
  Image as ImageIcon,
  Upload,
  Link2,
  Sliders,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Shop, Product, Category } from '../../types';
import { StorageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';
import { setActiveStorefrontSlug } from '../../hooks/useActiveStorefront';

interface StorefrontViewProps {
  shop: Shop;
  products: Product[];
  categories: Category[];
  isDemoPreview?: boolean;
  selectedSection?: string;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onSelectSection?: (section: string) => void;
  onShopUpdate?: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  shop,
  products,
  categories,
  isDemoPreview = false,
  selectedSection,
  viewportMode = 'desktop',
  onSelectSection,
  onShopUpdate,
}) => {
  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';
  const { totalItems, setIsCartOpen, addItem } = useCart();

  // Global Storefront Customization
  const brandColor = shop.customization?.brandColor || '#10B981';
  const fontFamily = (shop.customization as any)?.fontFamily || 'sans';
  const buttonShape = (shop.customization as any)?.buttonShape || 'pill';

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const buttonRadiusClass =
    buttonShape === 'pill'
      ? 'rounded-full'
      : buttonShape === 'rounded'
      ? 'rounded-xl'
      : 'rounded-none';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic Hero Section Data from shop.heroBanner or shop defaults
  const heroConfig = shop.heroBanner || {};
  const defaultBg =
    heroConfig.backgroundImage ||
    shop.coverImage ||
    (shop.slug === 'ceylon-linen'
      ? '/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80');

  const [heroBgImage, setHeroBgImage] = useState<string>(defaultBg);
  const [useFullBg, setUseFullBg] = useState<boolean>(true);
  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [bgModalTab, setBgModalTab] = useState<'presets' | 'upload' | 'url' | 'texts' | 'badges'>('presets');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [bgSaveFeedback, setBgSaveFeedback] = useState<boolean>(false);

  // Editable Hero Texts & Badges State
  const [welcomeBadge, setWelcomeBadge] = useState<string>(
    heroConfig.welcomeBadge || `Welcome to ${shop.name}`
  );
  const [headlineMain, setHeadlineMain] = useState<string>(
    heroConfig.headlineMain || 'Look Good'
  );
  const [headlineHighlight, setHeadlineHighlight] = useState<string>(
    heroConfig.headlineHighlight || 'Feel Beautiful'
  );
  const [heroDescription, setHeroDescription] = useState<string>(
    heroConfig.description ||
      shop.description ||
      'Spun from 100% natural European flax fibers and cut by hand in Kollupitiya, Colombo. Tailored for equatorial ease and timeless elegance.'
  );
  const [primaryCtaText, setPrimaryCtaText] = useState<string>(
    heroConfig.primaryCtaText || 'Shop Collection'
  );
  const [secondaryCtaText, setSecondaryCtaText] = useState<string>(
    heroConfig.secondaryCtaText || 'WhatsApp Concierge'
  );
  const [spotlightImage, setSpotlightImage] = useState<string>(
    heroConfig.spotlightImage ||
      products[0]?.images[0] ||
      '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg'
  );
  const [trust1Title, setTrust1Title] = useState<string>(
    heroConfig.trustBadge1?.title || '100% Pure Flax & Organic'
  );
  const [trust1Sub, setTrust1Sub] = useState<string>(
    heroConfig.trustBadge1?.subtitle || 'Certified & Quality Tested'
  );
  const [trust2Title, setTrust2Title] = useState<string>(
    heroConfig.trustBadge2?.title || 'Fast Delivery'
  );
  const [trust2Sub, setTrust2Sub] = useState<string>(
    heroConfig.trustBadge2?.subtitle || 'Island Wide (1-3 Days)'
  );
  const [trust3Title, setTrust3Title] = useState<string>(
    heroConfig.trustBadge3?.title || 'Secure Checkout'
  );
  const [trust3Sub, setTrust3Sub] = useState<string>(
    heroConfig.trustBadge3?.subtitle || 'Cash on Delivery / Bank'
  );

  // Hero Element Visibility Toggles (default to true when undefined)
  const [showHeroBanner, setShowHeroBanner] = useState<boolean>(
    heroConfig.showHeroBanner !== false
  );
  const [showWelcomeBadge, setShowWelcomeBadge] = useState<boolean>(
    heroConfig.showWelcomeBadge !== false
  );
  const [showHeadline, setShowHeadline] = useState<boolean>(
    heroConfig.showHeadline !== false
  );
  const [showDescription, setShowDescription] = useState<boolean>(
    heroConfig.showDescription !== false
  );
  const [showCtaButtons, setShowCtaButtons] = useState<boolean>(
    heroConfig.showCtaButtons !== false
  );
  const [showSpotlightImage, setShowSpotlightImage] = useState<boolean>(
    heroConfig.showSpotlightImage !== false
  );
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(
    heroConfig.showTrustBadges !== false
  );

  // Sync state if shop updates
  useEffect(() => {
    if (shop.slug && !isDemoPreview) {
      setActiveStorefrontSlug(shop.slug);
    }
    if (shop.heroBanner) {
      if (shop.heroBanner.welcomeBadge) setWelcomeBadge(shop.heroBanner.welcomeBadge);
      if (shop.heroBanner.headlineMain) setHeadlineMain(shop.heroBanner.headlineMain);
      if (shop.heroBanner.headlineHighlight) setHeadlineHighlight(shop.heroBanner.headlineHighlight);
      if (shop.heroBanner.description) setHeroDescription(shop.heroBanner.description);
      if (shop.heroBanner.primaryCtaText) setPrimaryCtaText(shop.heroBanner.primaryCtaText);
      if (shop.heroBanner.secondaryCtaText) setSecondaryCtaText(shop.heroBanner.secondaryCtaText);
      if (shop.heroBanner.backgroundImage) setHeroBgImage(shop.heroBanner.backgroundImage);
      if (shop.heroBanner.spotlightImage) setSpotlightImage(shop.heroBanner.spotlightImage);
      if (shop.heroBanner.trustBadge1?.title) setTrust1Title(shop.heroBanner.trustBadge1.title);
      if (shop.heroBanner.trustBadge1?.subtitle) setTrust1Sub(shop.heroBanner.trustBadge1.subtitle);
      if (shop.heroBanner.trustBadge2?.title) setTrust2Title(shop.heroBanner.trustBadge2.title);
      if (shop.heroBanner.trustBadge2?.subtitle) setTrust2Sub(shop.heroBanner.trustBadge2.subtitle);
      if (shop.heroBanner.trustBadge3?.title) setTrust3Title(shop.heroBanner.trustBadge3.title);
      if (shop.heroBanner.trustBadge3?.subtitle) setTrust3Sub(shop.heroBanner.trustBadge3.subtitle);
      if (shop.heroBanner.showHeroBanner !== undefined) setShowHeroBanner(shop.heroBanner.showHeroBanner);
      if (shop.heroBanner.showWelcomeBadge !== undefined) setShowWelcomeBadge(shop.heroBanner.showWelcomeBadge);
      if (shop.heroBanner.showHeadline !== undefined) setShowHeadline(shop.heroBanner.showHeadline);
      if (shop.heroBanner.showDescription !== undefined) setShowDescription(shop.heroBanner.showDescription);
      if (shop.heroBanner.showCtaButtons !== undefined) setShowCtaButtons(shop.heroBanner.showCtaButtons);
      if (shop.heroBanner.showSpotlightImage !== undefined) setShowSpotlightImage(shop.heroBanner.showSpotlightImage);
      if (shop.heroBanner.showTrustBadges !== undefined) setShowTrustBadges(shop.heroBanner.showTrustBadges);
    }
  }, [shop]);

  // Reactive Effective Visibility:
  // In Demo Preview (Design studio), directly prioritize live shop.heroBanner so changes reflect on 0-ms frame!
  // On live storefront, check local modal state or shop.heroBanner.
  const isHeroBannerVisible = isDemoPreview
    ? (shop.heroBanner?.showHeroBanner !== false)
    : (showHeroBanner !== undefined ? showHeroBanner : (shop.heroBanner?.showHeroBanner !== false));

  const isWelcomeVisible = isDemoPreview
    ? (shop.heroBanner?.showWelcomeBadge !== false)
    : (showWelcomeBadge !== undefined ? showWelcomeBadge : (shop.heroBanner?.showWelcomeBadge !== false));

  const isHeadlineVisible = isDemoPreview
    ? (shop.heroBanner?.showHeadline !== false)
    : (showHeadline !== undefined ? showHeadline : (shop.heroBanner?.showHeadline !== false));

  const isDescriptionVisible = isDemoPreview
    ? (shop.heroBanner?.showDescription !== false)
    : (showDescription !== undefined ? showDescription : (shop.heroBanner?.showDescription !== false));

  const isCtaVisible = isDemoPreview
    ? (shop.heroBanner?.showCtaButtons !== false)
    : (showCtaButtons !== undefined ? showCtaButtons : (shop.heroBanner?.showCtaButtons !== false));

  const isSpotlightVisible = isDemoPreview
    ? (shop.heroBanner?.showSpotlightImage !== false)
    : (showSpotlightImage !== undefined ? showSpotlightImage : (shop.heroBanner?.showSpotlightImage !== false));

  const isTrust1Visible = (shop.heroBanner as any)?.showTrust1 !== false;
  const isTrust2Visible = (shop.heroBanner as any)?.showTrust2 !== false;
  const isTrust3Visible = (shop.heroBanner as any)?.showTrust3 !== false;
  const hasAnyTrustCard = isTrust1Visible || isTrust2Visible || isTrust3Visible;

  const isTrustVisible = (isDemoPreview
    ? (shop.heroBanner?.showTrustBadges !== false)
    : (showTrustBadges !== undefined ? showTrustBadges : (shop.heroBanner?.showTrustBadges !== false))) && hasAnyTrustCard;

  const isPrimaryCtaVisible = (shop.heroBanner as any)?.showPrimaryCta !== false;
  const isSecondaryCtaVisible = (shop.heroBanner as any)?.showSecondaryCta !== false;
  const hasAnyCta = isPrimaryCtaVisible || isSecondaryCtaVisible;

  // Reactive Effective Texts (single source of truth: shop.heroBanner):
  const activeWelcomeBadge = shop.heroBanner?.welcomeBadge !== undefined ? shop.heroBanner.welcomeBadge : welcomeBadge;
  const activeHeadlineMain = shop.heroBanner?.headlineMain !== undefined ? shop.heroBanner.headlineMain : headlineMain;
  const activeHeadlineHighlight = shop.heroBanner?.headlineHighlight !== undefined ? shop.heroBanner.headlineHighlight : headlineHighlight;
  const activeHeroDescription = shop.heroBanner?.description !== undefined ? shop.heroBanner.description : (shop.description || heroDescription);
  const activePrimaryCtaText = shop.heroBanner?.primaryCtaText !== undefined ? shop.heroBanner.primaryCtaText : primaryCtaText;
  const activeSecondaryCtaText = shop.heroBanner?.secondaryCtaText !== undefined ? shop.heroBanner.secondaryCtaText : secondaryCtaText;
  const activeSpotlightImage = shop.heroBanner?.spotlightImage || spotlightImage;
  const activeTrust1Title = shop.heroBanner?.trustBadge1?.title !== undefined ? shop.heroBanner.trustBadge1.title : trust1Title;
  const activeTrust1Sub = shop.heroBanner?.trustBadge1?.subtitle !== undefined ? shop.heroBanner.trustBadge1.subtitle : trust1Sub;
  const activeTrust2Title = shop.heroBanner?.trustBadge2?.title !== undefined ? shop.heroBanner.trustBadge2.title : trust2Title;
  const activeTrust2Sub = shop.heroBanner?.trustBadge2?.subtitle !== undefined ? shop.heroBanner.trustBadge2.subtitle : trust2Sub;
  const activeTrust3Title = shop.heroBanner?.trustBadge3?.title !== undefined ? shop.heroBanner.trustBadge3.title : trust3Title;
  const activeTrust3Sub = shop.heroBanner?.trustBadge3?.subtitle !== undefined ? shop.heroBanner.trustBadge3.subtitle : trust3Sub;
  const activeHeroBgImage = shop.heroBanner?.backgroundImage || heroBgImage;

  // Curated Preset Backgrounds
  const HERO_BG_PRESETS = [
    {
      id: 'ceylon-linen-campaign',
      name: 'Ceylon Linen Editorial Campaign',
      tag: 'Pure European Flax',
      url: '/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg',
    },
    {
      id: 'ceylon-lookbook',
      name: 'Colombo Atelier Resort Lifestyle',
      tag: 'Tailored Luxury',
      url: '/src/assets/images/ceylon_linen_lookbook_lifestyle_1792347214913.jpg',
    },
    {
      id: 'beauty-salon-glow',
      name: 'Glow & Grace Salon Interior',
      tag: 'Warm Studio Atmosphere',
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'botanical-spa',
      name: 'Ayurvedic Botanical Sanctuary',
      tag: 'Herbal Wellness',
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'model-portrait',
      name: 'Radiant Golden Hour Portrait',
      tag: 'Natural Glow',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'minimal-fashion',
      name: 'Minimalist Architectural Studio',
      tag: 'Editorial Modernism',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  // Accessible Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showBgModal) {
        setShowBgModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBgModal]);

  // Clean WhatsApp phone number for inquiries
  const cleanPhone = StorageService.formatWhatsAppNumber(shop.whatsappNumber || '94771234567');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${shop.name}! 👋 I am browsing your online store on Kadeo and would like to inquire about products and services.`
  )}`;

  // Handle local file upload for Hero Background
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        setHeroBgImage(result);
        setUseFullBg(true);
        // Persist to shop storage
        StorageService.updateShop(shop.id, { coverImage: result });
        setBgSaveFeedback(true);
        setTimeout(() => {
          setBgSaveFeedback(false);
          setShowBgModal(false);
        }, 1000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle URL apply for Hero Background
  const handleUrlApply = () => {
    if (!inputUrl.trim()) return;
    setHeroBgImage(inputUrl.trim());
    setUseFullBg(true);
    StorageService.updateShop(shop.id, { coverImage: inputUrl.trim() });
    setBgSaveFeedback(true);
    setTimeout(() => {
      setBgSaveFeedback(false);
      setShowBgModal(false);
    }, 1000);
  };

  // Handle Preset Select
  const handlePresetSelect = (presetUrl: string) => {
    setHeroBgImage(presetUrl);
    setUseFullBg(true);
    StorageService.updateShop(shop.id, { coverImage: presetUrl });
    setBgSaveFeedback(true);
    setTimeout(() => {
      setBgSaveFeedback(false);
      setShowBgModal(false);
    }, 800);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory =
          p.categoryId === selectedCategory ||
          p.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          p.description.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!matchesCategory) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Toggle wishlist heart
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Handle Add To Cart with instant feedback
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, shop, 1);
    setAddedMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Curated categories: dynamically synchronized from props / seller collections
  const displayCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug || c.id,
        image: c.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80',
        iconName: c.iconName,
      }));
    }
    return [];
  }, [categories]);

  // Verified Customer Reviews (populated only when real reviews exist)
  const customerTestimonials: Array<{ name: string; time: string; avatar?: string; text: string }> =
    (shop as any).testimonials || [];

  const storefrontContainerRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered entry animation observer for items entering viewport
  useEffect(() => {
    const root = storefrontContainerRef.current;
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const revealElements = root.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => {
      // If already visible in current viewport, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [filteredProducts, selectedCategory, displayCategories]);

  const announcementConfig = shop.customization?.announcement || {};
  const headerConfig = shop.customization?.header || {};
  const categoriesConfig = shop.customization?.categories || {};
  const aboutConfig = shop.customization?.about || {};
  const footerConfig = shop.customization?.footer || {};

  const configuredOrder = shop.customization?.sectionOrder;
  const defaultBodySections = useMemo(() => ['hero', 'categories', 'products', 'about'], []);
  const effectiveSectionOrder = useMemo(() => {
    if (!configuredOrder || !Array.isArray(configuredOrder) || configuredOrder.length === 0) {
      return defaultBodySections;
    }
    const set = new Set(configuredOrder);
    const order = configuredOrder.filter(id => defaultBodySections.includes(id));
    defaultBodySections.forEach(id => {
      if (!set.has(id)) order.push(id);
    });
    return order;
  }, [configuredOrder, defaultBodySections]);

  const handleContainerClickCapture = (e: React.MouseEvent) => {
    if (!isDemoPreview) return;
    const target = e.target as HTMLElement;
    const interactive = target.closest('a, button');
    if (interactive && !interactive.hasAttribute('data-studio-allow')) {
      e.preventDefault();
      const sectionEl = target.closest('[id]');
      if (sectionEl) {
        const id = sectionEl.getAttribute('id');
        if (id) {
          const mapped = id === 'home' ? 'hero' : id;
          onSelectSection?.(mapped);
        }
      }
    }
  };

  return (
    <div
      ref={storefrontContainerRef}
      onClickCapture={handleContainerClickCapture}
      className={`min-h-screen bg-[#FDFBF9] text-neutral-900 ${fontClass} selection:bg-[#10B981] selection:text-white`}
    >
      {/* ──────────────────────────────────────────────────────────────────────────
          0. ANNOUNCEMENT BAR (Customizable Live Banner)
      ────────────────────────────────────────────────────────────────────────── */}
      {announcementConfig.show !== false && (
        <div
          id="announcement"
          onClick={() => isDemoPreview && onSelectSection?.('announcement')}
          style={{
            backgroundColor: announcementConfig.bgColor || '#10B981',
            color: announcementConfig.textColor || '#FFFFFF',
            paddingTop: announcementConfig.topPadding !== undefined ? `${announcementConfig.topPadding}px` : '8px',
            paddingBottom: announcementConfig.bottomPadding !== undefined ? `${announcementConfig.bottomPadding}px` : '8px',
            textAlign: announcementConfig.alignment || 'center',
          }}
          className={`px-4 text-xs font-semibold tracking-wide transition-all relative ${
            isDemoPreview ? 'cursor-pointer hover:brightness-105' : ''
          } ${
            isDemoPreview && selectedSection === 'announcement'
              ? 'ring-2 ring-emerald-400 ring-inset shadow-md z-50'
              : ''
          }`}
        >
          {isDemoPreview && selectedSection === 'announcement' && (
            <div className="absolute top-1 left-2 z-30 pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                Announcement Bar
              </span>
            </div>
          )}
          <span>
            {announcementConfig.text ||
              '🎉 Free Islandwide Delivery on Orders Over Rs. 5,000 | Cash on Delivery Available'}
          </span>
          {announcementConfig.linkText && (
            <span className="ml-2 underline font-bold opacity-90 hover:opacity-100 cursor-pointer">
              {announcementConfig.linkText}
            </span>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR (Dark Modern Bar)
      ────────────────────────────────────────────────────────────────────────── */}
      {headerConfig.showHeader !== false && (
        <header
          id="header"
          onClick={() => isDemoPreview && onSelectSection?.('header')}
          style={{
            backgroundColor: headerConfig.bgColor || '#111827',
          }}
          className={`${headerConfig.sticky !== false ? 'sticky top-0' : 'relative'} z-40 text-white shadow-md transition-all ${
            isDemoPreview ? 'cursor-pointer hover:brightness-105' : ''
          } ${
            isDemoPreview && selectedSection === 'header'
              ? 'ring-2 ring-[#10B981] relative shadow-md'
              : ''
          }`}
        >
          {isDemoPreview && selectedSection === 'header' && (
            <div className="absolute top-2 left-4 z-30 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Header / Navigation
              </span>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            {/* Logo & Brand Name */}
            <Link to={`/shop/${shop.slug}`} className="flex items-center gap-3 shrink-0 group">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all overflow-hidden">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="h-full w-full object-cover" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white block leading-tight">
                  {shop.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold block">
                  {headerConfig.tagline || (shop.themeId === 'beauty' ? 'BEAUTY & SALON' : 'BOUTIQUE ATELIER')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={`${isMobile ? 'hidden' : 'hidden md:flex'} items-center gap-7 text-xs font-semibold`}>
              <a
                href="#home"
                className="text-white hover:text-[#10B981] transition-colors relative py-1 border-b-2 border-[#10B981]"
              >
                Home
              </a>
              {displayCategories.length > 0 && categoriesConfig.show !== false && (
                <a href="#categories" className="text-neutral-300 hover:text-white transition-colors">
                  Categories
                </a>
              )}
              <a href="#products" className="text-neutral-300 hover:text-white transition-colors">
                Shop
              </a>
              {aboutConfig.show !== false && (
                <a href="#about" className="text-neutral-300 hover:text-white transition-colors">
                  About
                </a>
              )}
              <a href="#contact" className="text-neutral-300 hover:text-white transition-colors">
                Contact
              </a>
              {headerConfig.showTrackOrder !== false && (
                <Link
                  to={`/track-order?shop=${shop.slug}`}
                  className="text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Order</span>
                </Link>
              )}
            </nav>

            {/* Search Bar & Action Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Pill Input */}
              {headerConfig.showSearch !== false && !isMobile && (
                <div className="relative hidden sm:block w-48 lg:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full rounded-full bg-white text-neutral-900 text-xs px-4 py-2 pr-9 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-xs transition-all"
                  />
                  <Search className="h-4 w-4 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              )}

              {/* Profile / Seller Login */}
              <Link
                to="/seller/login"
                title="Seller Portal"
                className="p-2 text-neutral-300 hover:text-white transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Wishlist Heart Icon */}
              <button
                type="button"
                title="Wishlist"
                className="p-2 text-neutral-300 hover:text-red-400 transition-colors relative"
              >
                <Heart className="h-5 w-5" />
                {Object.values(wishlist).filter(Boolean).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#10B981]" />
                )}
              </button>

              {/* Shopping Cart Bag Icon with Counter */}
              {headerConfig.showCart !== false && (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-white hover:text-[#10B981] transition-colors cursor-pointer"
                  title="View Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                </button>
              )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${isMobile ? 'block' : 'md:hidden'} p-2 text-neutral-300 hover:text-white cursor-pointer`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`${isMobile ? 'block' : 'md:hidden'} bg-[#161F30] border-t border-neutral-800 px-4 py-4 space-y-3`}>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full bg-white text-neutral-900 text-xs px-4 py-2 pr-9"
              />
              <Search className="h-4 w-4 text-neutral-400 absolute right-3 top-2.5" />
            </div>
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-white py-1"
            >
              Home
            </a>
            {displayCategories.length > 0 && (
              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-neutral-300 hover:text-white py-1"
              >
                Categories
              </a>
            )}
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1"
            >
              Shop Collection
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1"
            >
              About Boutique
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1"
            >
              Contact & WhatsApp
            </a>
            <Link
              to={`/track-order?shop=${shop.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-[#10B981] py-1"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order</span>
            </Link>
          </div>
        )}
      </header>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          BODY SECTIONS (Dynamically Reordered via sectionOrder)
      ────────────────────────────────────────────────────────────────────────── */}
      {effectiveSectionOrder.map(sectionId => {
        if (sectionId === 'hero') {
          return (
            <React.Fragment key="hero">
              {!isHeroBannerVisible ? (
                isDemoPreview ? (
                  <div className="py-8 px-4 bg-amber-500/10 border-b border-amber-500/20 text-center text-xs text-amber-400 font-bold flex items-center justify-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Storefront Hero Section is currently HIDDEN (Turned Off)</span>
                  </div>
                ) : null
              ) : (
        <section
          id="home"
          onClick={() => isDemoPreview && onSelectSection?.('hero')}
          style={{
            paddingTop: (shop.heroBanner as any)?.topPadding ? `${(shop.heroBanner as any).topPadding}px` : undefined,
            paddingBottom: (shop.heroBanner as any)?.bottomPadding ? `${(shop.heroBanner as any).bottomPadding}px` : undefined,
            backgroundColor: (shop.heroBanner as any)?.backgroundColor || undefined,
          }}
          className={`relative overflow-hidden py-16 lg:py-24 border-b border-neutral-200/50 min-h-[540px] flex items-center transition-all ${
            isDemoPreview ? 'cursor-pointer hover:brightness-105' : ''
          } ${
            isDemoPreview && selectedSection === 'hero' ? 'ring-2 ring-[#10B981] relative' : ''
          }`}
        >
          {/* Active Section Green Tag & Corner Handles in Studio Preview */}
          {isDemoPreview && selectedSection === 'hero' && (
            <>
              <div className="absolute top-2 left-4 z-30 pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  Hero Section
                </span>
              </div>
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-white border-2 border-[#10B981] rounded-xs z-30 pointer-events-none" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white border-2 border-[#10B981] rounded-xs z-30 pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-white border-2 border-[#10B981] rounded-xs z-30 pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-white border-2 border-[#10B981] rounded-xs z-30 pointer-events-none" />
            </>
          )}

          {/* Full Hero Background Image & Luxury Overlay */}
          {((shop.heroBanner as any)?.backgroundColor && !(shop.heroBanner as any)?.backgroundImage) ? (
            <div
              className="absolute inset-0 z-0 transition-colors duration-300"
              style={{ backgroundColor: (shop.heroBanner as any).backgroundColor }}
            />
          ) : (
            <div className="absolute inset-0 z-0">
              <img
                src={activeHeroBgImage}
                alt={`${shop.name} Cover Banner`}
                className="h-full w-full object-cover object-center transform scale-105 filter brightness-95"
              />
              {/* Elegant dark gradient overlay ensuring 100% text contrast and readability */}
              <div
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                  backgroundColor: (shop.heroBanner as any)?.overlayColor || '#000000',
                  opacity: (shop.heroBanner as any)?.overlayOpacity !== undefined ? (shop.heroBanner as any).overlayOpacity : 0.45,
                }}
              />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : isTablet ? 'grid-cols-1 lg:grid-cols-12 gap-6' : 'grid-cols-1 lg:grid-cols-12 gap-8'} items-center`}>
              {/* Left Content Column */}
              <div
                className={`${
                  isMobile
                    ? 'w-full'
                    : !isSpotlightVisible && !isTrustVisible
                    ? 'lg:col-span-12 max-w-3xl'
                    : isSpotlightVisible && isTrustVisible
                    ? 'lg:col-span-6'
                    : 'lg:col-span-8 max-w-2xl'
                } space-y-5 text-white ${
                  (shop.heroBanner as any)?.alignment === 'center' || isMobile
                    ? 'text-center items-center mx-auto flex flex-col'
                    : (shop.heroBanner as any)?.alignment === 'right'
                    ? 'text-right items-end ml-auto flex flex-col'
                    : 'text-left items-start'
                }`}
              >
                {/* Green Pill Badge */}
                {isWelcomeVisible && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-1.5 text-xs font-bold text-white shadow-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{activeWelcomeBadge}</span>
                  </div>
                )}

                {/* Big Bold Headline */}
                {isHeadlineVisible && (
                  <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl lg:text-6xl'} font-black text-white tracking-tight leading-[1.08] drop-shadow-sm`}>
                    {activeHeadlineMain}
                    {activeHeadlineHighlight && (
                      <>
                        <br />
                        <span className="text-[#10B981]">{activeHeadlineHighlight}</span>
                      </>
                    )}
                  </h1>
                )}

                {/* Tagline Description */}
                {isDescriptionVisible && (
                  <p className="text-sm sm:text-base text-neutral-200 max-w-lg font-normal leading-relaxed drop-shadow-xs">
                    {activeHeroDescription}
                  </p>
                )}

                {/* Action Buttons */}
                {isCtaVisible && hasAnyCta && (
                  <div className={`flex flex-wrap items-center ${isMobile ? 'justify-center w-full' : ''} gap-3.5 pt-3`}>
                    {isPrimaryCtaVisible && (
                      <a
                        href="#products"
                        style={{ backgroundColor: brandColor }}
                        className={`inline-flex items-center gap-2 ${buttonRadiusClass} text-white px-7 py-3.5 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-95 transition-all transform hover:-translate-y-0.5 cursor-pointer`}
                      >
                        <span>{activePrimaryCtaText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}

                    {isSecondaryCtaVisible && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 ${buttonRadiusClass} bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-white px-6 py-3.5 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer`}
                      >
                        <MessageCircle className="h-4 w-4 text-[#10B981]" />
                        <span>{activeSecondaryCtaText}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Center Lifestyle Portrait Column */}
              {isSpotlightVisible && !isMobile && (
                <div
                  className={`${
                    isTrustVisible ? 'lg:col-span-3' : 'lg:col-span-4'
                  } hidden md:flex justify-center`}
                >
                  <div className="relative w-full max-w-[260px] aspect-[4/5] rounded-[28px] overflow-hidden shadow-2xl border-2 border-white/30 bg-black/40 backdrop-blur-xs">
                    <img
                      src={activeSpotlightImage || products[0]?.images[0] || '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg'}
                      alt={shop.name}
                      className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                      <span>{products[0]?.name || 'Signature Resort Collection'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Floating Trust Cards */}
              {isTrustVisible && (
                <div
                  onClick={(e) => {
                    if (isDemoPreview) {
                      e.stopPropagation();
                      onSelectSection?.('hero');
                    }
                  }}
                  className={`${
                    isMobile
                      ? 'w-full'
                      : isSpotlightVisible
                      ? 'lg:col-span-3'
                      : 'lg:col-span-4'
                  } flex flex-col gap-3.5 justify-center ${isDemoPreview ? 'cursor-pointer group/trust' : ''}`}
                >
                  {/* Card 1 */}
                  {isTrust1Visible && (
                    <div className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl hover:bg-white transition-all ${
                      isDemoPreview && selectedSection === 'hero'
                        ? 'border-[#10B981] ring-2 ring-[#10B981]/50 shadow-emerald-100'
                        : 'border-white/40'
                    }`}>
                      <div className="h-11 w-11 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block leading-tight">
                          {activeTrust1Title}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {activeTrust1Sub}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card 2 */}
                  {isTrust2Visible && (
                    <div className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl hover:bg-white transition-all ${
                      isDemoPreview && selectedSection === 'hero'
                        ? 'border-[#10B981] ring-2 ring-[#10B981]/50 shadow-emerald-100'
                        : 'border-white/40'
                    }`}>
                      <div className="h-11 w-11 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block leading-tight">
                          {activeTrust2Title}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {activeTrust2Sub}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card 3 */}
                  {isTrust3Visible && (
                    <div className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl hover:bg-white transition-all ${
                      isDemoPreview && selectedSection === 'hero'
                        ? 'border-[#10B981] ring-2 ring-[#10B981]/50 shadow-emerald-100'
                        : 'border-white/40'
                    }`}>
                      <div className="h-11 w-11 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block leading-tight">
                          {activeTrust3Title}
                        </span>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {activeTrust3Sub}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          HERO CUSTOMIZER MODAL DIALOG (Texts, Headlines, CTAs, Badges & Images)
      ────────────────────────────────────────────────────────────────────────── */}
      {showBgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm anim-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#EAF7EE] text-[#10B981] flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 leading-tight">
                    Customize Hero Section
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Edit background image, headlines, description, buttons and badges
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBgModal(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl my-3 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setBgModalTab('presets')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bgModalTab === 'presets'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setBgModalTab('upload')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bgModalTab === 'upload'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Background Image
              </button>
              <button
                type="button"
                onClick={() => setBgModalTab('texts')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bgModalTab === 'texts'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Text & Headlines
              </button>
              <button
                type="button"
                onClick={() => setBgModalTab('badges')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bgModalTab === 'badges'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Badges & Spotlight
              </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4 py-2">
              {/* Tab 1: Presets */}
              {bgModalTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-500">Select a high-resolution campaign banner:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {HERO_BG_PRESETS.map(preset => {
                      const isCurrent = heroBgImage === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset.url)}
                          className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all group text-left cursor-pointer ${
                            isCurrent
                              ? 'border-[#10B981] ring-2 ring-[#10B981]/30'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 flex flex-col justify-end text-white">
                            <span className="text-[10px] font-bold leading-tight block">
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-[#10B981] block mt-0.5">
                              {preset.tag}
                            </span>
                          </div>
                          {isCurrent && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload Background */}
              {bgModalTab === 'upload' && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-neutral-300 hover:border-[#10B981] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-[#EAF7EE]/30">
                    <div className="h-10 w-10 rounded-xl bg-[#EAF7EE] text-[#10B981] flex items-center justify-center mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Upload Background from Device
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      JPG, PNG, WebP high-res images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                      Or Paste Image Direct URL:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={e => setInputUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      />
                      <button
                        type="button"
                        onClick={handleUrlApply}
                        className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold shrink-0 hover:bg-[#059669] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Text & Headlines */}
              {bgModalTab === 'texts' && (
                <div className="space-y-4">
                  {/* Master Switch: Entire Hero Banner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-100 border border-neutral-300">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Entire Storefront Hero Section</span>
                      <span className="text-[10px] text-neutral-500">Show or hide the whole hero banner</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHeroBanner(!showHeroBanner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        showHeroBanner
                          ? 'bg-[#10B981] text-white shadow-xs'
                          : 'bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {showHeroBanner ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <span>{showHeroBanner ? 'Section: Shown' : 'Section: Hidden'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800">Welcome Pill Tag</label>
                      <button
                        type="button"
                        onClick={() => setShowWelcomeBadge(!showWelcomeBadge)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showWelcomeBadge ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        {showWelcomeBadge ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showWelcomeBadge ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={welcomeBadge}
                      onChange={e => setWelcomeBadge(e.target.value)}
                      placeholder="Welcome to Ceylon Linen Co."
                      disabled={!showWelcomeBadge}
                      className={`w-full text-xs p-2.5 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showWelcomeBadge ? 'opacity-50' : ''}`}
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800">Headline (Main & Highlight)</label>
                      <button
                        type="button"
                        onClick={() => setShowHeadline(!showHeadline)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showHeadline ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                        }`}
                      >
                        {showHeadline ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showHeadline ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 block mb-1">Main Title</span>
                        <input
                          type="text"
                          value={headlineMain}
                          onChange={e => setHeadlineMain(e.target.value)}
                          placeholder="Look Good"
                          disabled={!showHeadline}
                          className={`w-full text-xs p-2 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showHeadline ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block mb-1">Green Highlight Title</span>
                        <input
                          type="text"
                          value={headlineHighlight}
                          onChange={e => setHeadlineHighlight(e.target.value)}
                          placeholder="Feel Beautiful"
                          disabled={!showHeadline}
                          className={`w-full text-xs p-2 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showHeadline ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800">Hero Description Paragraph</label>
                      <button
                        type="button"
                        onClick={() => setShowDescription(!showDescription)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showDescription ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                        }`}
                      >
                        {showDescription ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showDescription ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={heroDescription}
                      onChange={e => setHeroDescription(e.target.value)}
                      placeholder="Description of signature materials..."
                      disabled={!showDescription}
                      className={`w-full text-xs p-2.5 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showDescription ? 'opacity-50' : ''}`}
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800">CTA Buttons (Primary & WhatsApp)</label>
                      <button
                        type="button"
                        onClick={() => setShowCtaButtons(!showCtaButtons)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showCtaButtons ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                        }`}
                      >
                        {showCtaButtons ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showCtaButtons ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 block mb-1">Primary CTA Button</span>
                        <input
                          type="text"
                          value={primaryCtaText}
                          onChange={e => setPrimaryCtaText(e.target.value)}
                          placeholder="Shop Collection"
                          disabled={!showCtaButtons}
                          className={`w-full text-xs p-2 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showCtaButtons ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block mb-1">Secondary CTA (WhatsApp)</span>
                        <input
                          type="text"
                          value={secondaryCtaText}
                          onChange={e => setSecondaryCtaText(e.target.value)}
                          placeholder="WhatsApp Concierge"
                          disabled={!showCtaButtons}
                          className={`w-full text-xs p-2 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showCtaButtons ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Badges & Spotlight */}
              {bgModalTab === 'badges' && (
                <div className="space-y-4">
                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800">Center Spotlight Image</label>
                      <button
                        type="button"
                        onClick={() => setShowSpotlightImage(!showSpotlightImage)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showSpotlightImage ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                        }`}
                      >
                        {showSpotlightImage ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showSpotlightImage ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={spotlightImage}
                      onChange={e => setSpotlightImage(e.target.value)}
                      placeholder="https://... or leave blank for featured product"
                      disabled={!showSpotlightImage}
                      className={`w-full text-xs p-2.5 rounded-xl border bg-white border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#10B981] ${!showSpotlightImage ? 'opacity-50' : ''}`}
                    />
                  </div>

                  <div className="space-y-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 block">Floating Trust Badges</span>
                      <button
                        type="button"
                        onClick={() => setShowTrustBadges(!showTrustBadges)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          showTrustBadges ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                        }`}
                      >
                        {showTrustBadges ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{showTrustBadges ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>

                    <div className={`space-y-2.5 ${!showTrustBadges ? 'opacity-50' : ''}`}>
                      <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-[#10B981] block">Trust Badge 1</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={trust1Title}
                            onChange={e => setTrust1Title(e.target.value)}
                            placeholder="Badge 1 Title"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                          <input
                            type="text"
                            value={trust1Sub}
                            onChange={e => setTrust1Sub(e.target.value)}
                            placeholder="Badge 1 Subtitle"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-[#10B981] block">Trust Badge 2</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={trust2Title}
                            onChange={e => setTrust2Title(e.target.value)}
                            placeholder="Badge 2 Title"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                          <input
                            type="text"
                            value={trust2Sub}
                            onChange={e => setTrust2Sub(e.target.value)}
                            placeholder="Badge 2 Subtitle"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1.5">
                        <span className="text-[11px] font-bold text-[#10B981] block">Trust Badge 3</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={trust3Title}
                            onChange={e => setTrust3Title(e.target.value)}
                            placeholder="Badge 3 Title"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                          <input
                            type="text"
                            value={trust3Sub}
                            onChange={e => setTrust3Sub(e.target.value)}
                            placeholder="Badge 3 Subtitle"
                            disabled={!showTrustBadges}
                            className="text-xs p-2 rounded-xl border border-neutral-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback alert */}
            {bgSaveFeedback && (
              <div className="my-2 p-2.5 rounded-xl bg-[#EAF7EE] text-[#10B981] text-xs font-bold flex items-center gap-2 justify-center shrink-0">
                <Check className="h-4 w-4" />
                <span>Hero Section Content Updated & Saved!</span>
              </div>
            )}

            {/* Footer with Save Action */}
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs shrink-0">
              <span className="text-neutral-400 text-[11px]">
                Saves directly to shop settings
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBgModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    StorageService.updateShop(shop.id, {
                      coverImage: heroBgImage,
                      heroBanner: {
                        showHeroBanner,
                        welcomeBadge,
                        showWelcomeBadge,
                        headlineMain,
                        headlineHighlight,
                        showHeadline,
                        description: heroDescription,
                        showDescription,
                        primaryCtaText,
                        secondaryCtaText,
                        showCtaButtons,
                        backgroundImage: heroBgImage,
                        spotlightImage,
                        showSpotlightImage,
                        trustBadge1: { title: trust1Title, subtitle: trust1Sub, icon: 'leaf' },
                        trustBadge2: { title: trust2Title, subtitle: trust2Sub, icon: 'truck' },
                        trustBadge3: { title: trust3Title, subtitle: trust3Sub, icon: 'shield' },
                        showTrustBadges,
                      },
                    });
                    onShopUpdate?.();
                    setBgSaveFeedback(true);
                    setTimeout(() => {
                      setBgSaveFeedback(false);
                      setShowBgModal(false);
                    }, 1000);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer shadow-xs transition-colors"
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

if (sectionId === 'categories') {
  return (
    <React.Fragment key="categories">
      {categoriesConfig.show !== false && displayCategories.length > 0 && (
        <section
          id="categories"
          onClick={() => isDemoPreview && onSelectSection?.('categories')}
          style={{
            backgroundColor: categoriesConfig.bgColor || undefined,
            paddingTop: categoriesConfig.topPadding ? `${categoriesConfig.topPadding}px` : undefined,
            paddingBottom: categoriesConfig.bottomPadding ? `${categoriesConfig.bottomPadding}px` : undefined,
          }}
          className={`py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all relative ${
            isDemoPreview ? 'cursor-pointer hover:brightness-95' : ''
          } ${
            isDemoPreview && selectedSection === 'categories' ? 'ring-2 ring-[#10B981] rounded-2xl relative shadow-sm' : ''
          }`}
        >
          {isDemoPreview && selectedSection === 'categories' && (
            <div className="absolute top-2 left-4 z-30 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Categories Section
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                {categoriesConfig.title || 'Shop by Category'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {categoriesConfig.subtitle || 'Explore curated collections and craft essentials'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Dynamic Category Tiles Grid */}
          <div
            className={`grid gap-3.5 sm:gap-4 ${
              isMobile
                ? 'grid-cols-2'
                : isTablet
                ? 'grid-cols-3'
                : displayCategories.length <= 4
                ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl'
                : displayCategories.length <= 6
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'
            }`}
          >
            {displayCategories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  style={{ transitionDelay: `${(idx % 6) * 50}ms` }}
                  onClick={() =>
                    setSelectedCategory(prev =>
                      prev === cat.slug || prev === cat.id ? 'all' : cat.id
                    )
                  }
                  className={`scroll-reveal rounded-2xl p-3.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group border ${
                    isSelected
                      ? 'bg-[#EAF7EE] border-[#10B981] shadow-sm scale-105'
                      : 'bg-[#F9F6F0] hover:bg-white border-neutral-200/60 hover:shadow-md'
                  }`}
                >
                  {/* Circular Product / Category Thumbnail or Icon */}
                  <div className="h-16 w-16 rounded-full overflow-hidden mb-2.5 bg-white p-1 border border-neutral-200/70 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover rounded-full"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-[#10B981] transition-colors block">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </React.Fragment>
  );
}

if (sectionId === 'products') {
  return (
    <React.Fragment key="products">
      <section
        id="products"
        onClick={() => isDemoPreview && onSelectSection?.('products')}
        className={`py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all relative ${
          isDemoPreview ? 'cursor-pointer hover:brightness-[1.02]' : ''
        } ${
          isDemoPreview && selectedSection === 'products' ? 'ring-2 ring-[#10B981] rounded-3xl relative shadow-sm' : ''
        }`}
      >
        {isDemoPreview && selectedSection === 'products' && (
          <div className="absolute top-2 left-4 z-30 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Products Section
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                {(shop.customization as any)?.products?.title || 'Featured Products'}
              </h2>
              {selectedCategory !== 'all' && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  Filter: {selectedCategory}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {(shop.customization as any)?.products?.subtitle || 'Handpicked authentic items ready for instant dispatch'}
            </p>
          </div>
          <a
            href="#products"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200/80">
            <ShoppingBag className="h-10 w-10 text-neutral-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-neutral-800">No products match your criteria</p>
            <p className="text-xs text-neutral-500 mt-1">Try resetting the category filter or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${
            isMobile
              ? 'grid-cols-2 gap-3'
              : isTablet
              ? 'grid-cols-3 gap-4'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5'
          }`}>
            {filteredProducts.map((p, idx) => {
              const isAdded = !!addedMap[p.id];
              const isWishlisted = !!wishlist[p.id];
              // Calculate discount percentage if originalPrice exists
              const original = (p as any).originalPrice || Math.round(p.price * 1.2);
              const discountPct = Math.round(((original - p.price) / original) * 100);

              return (
                <div
                  key={p.id}
                  style={{ transitionDelay: `${(idx % 5) * 65}ms` }}
                  className="scroll-reveal rounded-2xl border border-neutral-200/90 bg-white p-3.5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative"
                >
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-[#10B981] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs">
                      -{discountPct > 0 ? discountPct : 15}%
                    </span>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1 rounded-full text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Save to wishlist"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isWishlisted ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Centered Image */}
                  <Link
                    to={`/shop/${shop.slug}/product/${p.slug}`}
                    className="h-36 sm:h-44 w-full flex items-center justify-center overflow-hidden my-2 group-hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="space-y-1 pt-1">
                    <Link
                      to={`/shop/${shop.slug}/product/${p.slug}`}
                      className="text-xs font-bold text-neutral-900 hover:text-[#10B981] transition-colors block truncate"
                      title={p.name}
                    >
                      {p.name}
                    </Link>

                    <span className="text-[11px] text-neutral-400 block truncate">
                      {shop.name}
                    </span>

                    {/* 5 Golden Stars Rating */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, sIdx) => (
                          <Star key={sIdx} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        ({70 + (idx * 17) % 60})
                      </span>
                    </div>

                    {/* Price and Original Strike-through Price */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-black text-neutral-900">
                        {StorageService.formatLKR(p.price)}
                      </span>
                      <span className="text-[11px] text-neutral-400 line-through">
                        {StorageService.formatLKR(original)}
                      </span>
                    </div>
                  </div>

                  {/* Solid Brand Full-Width Add To Cart Button */}
                  <button
                    type="button"
                    onClick={e => handleAddToCart(p, e)}
                    style={!isAdded ? { backgroundColor: brandColor } : undefined}
                    className={`mt-3 w-full py-2.5 ${buttonRadiusClass} text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                      isAdded
                        ? 'bg-neutral-800 text-white'
                        : 'text-white hover:brightness-95 active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Added ✓</span>
                      </>
                    ) : (
                      <span>Add to Cart</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </React.Fragment>
  );
}

if (sectionId === 'about') {
  return (
    <React.Fragment key="about">
      {aboutConfig.show !== false && (
        <section
          id="about"
          onClick={() => isDemoPreview && onSelectSection?.('about')}
          style={{
            backgroundColor: aboutConfig.bgColor || undefined,
            paddingTop: aboutConfig.topPadding ? `${aboutConfig.topPadding}px` : undefined,
            paddingBottom: aboutConfig.bottomPadding ? `${aboutConfig.bottomPadding}px` : undefined,
          }}
          className={`py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all relative ${
            isDemoPreview ? 'cursor-pointer hover:brightness-95' : ''
          } ${
            isDemoPreview && selectedSection === 'about' ? 'ring-2 ring-[#10B981] rounded-3xl relative shadow-sm' : ''
          }`}
        >
          {isDemoPreview && selectedSection === 'about' && (
            <div className="absolute top-2 left-4 z-30 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                About Section
              </span>
            </div>
          )}
          <div className="scroll-reveal rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10'} items-center`}>
              {/* Left Image: High-res Salon / Boutique Interior */}
              <div className={`${isMobile ? 'w-full' : 'lg:col-span-6'} rounded-2xl overflow-hidden shadow-md aspect-[16/10] bg-neutral-100`}>
                <img
                  src={aboutConfig.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"}
                  alt="About our boutique interior"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Right Information */}
              <div className={`${isMobile ? 'w-full' : 'lg:col-span-6'} space-y-4`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981] block">
                  {aboutConfig.badgeTitle || 'ABOUT OUR STORE'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                  {aboutConfig.title || shop.name}
                  <span className="block text-base font-normal text-neutral-500 mt-1">
                    {aboutConfig.subtitle || (shop.themeId === 'beauty' ? 'Beauty & Salon' : 'Artisanal Lifestyle')}
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {aboutConfig.description || (shop.description || 'We bring you the best handcrafted garments, skincare and professional services to help you look and feel your best. From pure European flax linens to bespoke artisan care — everything you need is right here.')}
                </p>

              {/* Contact & Hours Info Grid */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-3 pt-3`}>
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#10B981] shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {shop.contactDetails?.city || 'Colombo 03'}
                    </span>
                    <span className="text-[11px] text-neutral-500 block">Sri Lanka</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#10B981] shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Mon - Sat</span>
                    <span className="text-[11px] text-neutral-500 block">9:00 AM - 8:00 PM</span>
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#EAF7EE] text-[#10B981] shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {shop.displayPhone}
                    </span>
                    <span className="text-[11px] text-neutral-500 block">(WhatsApp)</span>
                  </div>
                </div>
              </div>

              {/* View Services / WhatsApp Concierge Button */}
              <div className="pt-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 hover:border-[#10B981] bg-white px-5 py-2.5 text-xs font-bold text-neutral-800 hover:text-[#10B981] transition-all shadow-2xs cursor-pointer"
                >
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          6. WHY CHOOSE US? (4 Cards Horizontal Row)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-8">
          Why Choose Us?
        </h2>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'}`}>
          {/* Feature 1 */}
          <div className="scroll-reveal rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex items-start gap-4" style={{ transitionDelay: '0ms' }}>
            <div className="h-12 w-12 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Premium Quality</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Only the best certified natural materials and formulations.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="scroll-reveal rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex items-start gap-4" style={{ transitionDelay: '70ms' }}>
            <div className="h-12 w-12 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Fast & Reliable Delivery</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Island wide delivery with live tracking.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="scroll-reveal rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex items-start gap-4" style={{ transitionDelay: '140ms' }}>
            <div className="h-12 w-12 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Secure Shopping</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Your data and payments are always safe.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="scroll-reveal rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs flex items-start gap-4" style={{ transitionDelay: '210ms' }}>
            <div className="h-12 w-12 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Trusted by Thousands</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Join our growing community of happy customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. WHAT OUR CUSTOMERS SAY (Testimonials - shown only if reviews exist)
      ────────────────────────────────────────────────────────────────────────── */}
      {customerTestimonials.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              What Our Customers Say
            </h2>
            <a
              href="#about"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-5'}`}>
            {customerTestimonials.map((t, idx) => (
              <div
                key={idx}
                style={{ transitionDelay: `${idx * 100}ms` }}
                className="scroll-reveal rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0 border border-neutral-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 text-xs shrink-0">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block leading-tight">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{t.time}</span>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, sIdx) => (
                      <Star key={sIdx} className="h-3 w-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Review Quote */}
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </React.Fragment>
  );
}

return null;
})}

      {/* ──────────────────────────────────────────────────────────────────────────
          8. FOOTER (Deep Dark Navy/Charcoal Bar #111827)
      ────────────────────────────────────────────────────────────────────────── */}
      {footerConfig.showFooter !== false && (
        <footer
          id="footer"
          onClick={() => isDemoPreview && onSelectSection?.('footer')}
          style={{
            backgroundColor: footerConfig.bgColor || '#111827',
          }}
          className={`text-white pt-16 pb-8 border-t border-neutral-800 transition-all relative ${
            isDemoPreview ? 'cursor-pointer hover:brightness-105' : ''
          } ${
            isDemoPreview && selectedSection === 'footer' ? 'ring-2 ring-[#10B981] relative shadow-md' : ''
          }`}
        >
          {isDemoPreview && selectedSection === 'footer' && (
            <div className="absolute top-2 left-4 z-30 pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Footer Section
              </span>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : isTablet ? 'grid-cols-2 gap-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8'} pb-12 border-b border-neutral-800`}>
              {/* Col 1: Brand & Slogan (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981] overflow-hidden">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.name} className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white block leading-tight">
                      {shop.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block">
                      {shop.themeId === 'beauty' ? 'BEAUTY & SALON' : 'BOUTIQUE ATELIER'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                  {footerConfig.aboutText ||
                    'Your style and beauty. Our priority. Handcrafted pieces and artisan care designed for everyday living.'}
                </p>

                {/* Social Media Links */}
                {footerConfig.showSocials !== false && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <a
                      href={`https://facebook.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#10B981] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://instagram.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#10B981] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a
                      href={`https://youtube.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#10B981] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#10B981] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Col 2: Quick Links (2 cols) */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
                <ul className="space-y-2 text-xs text-neutral-400 font-medium">
                  <li>
                    <a href="#home" className="hover:text-white transition-colors">Home</a>
                  </li>
                  <li>
                    <a href="#products" className="hover:text-white transition-colors">Shop</a>
                  </li>
                  {displayCategories.length > 0 && categoriesConfig.show !== false && (
                    <li>
                      <a href="#categories" className="hover:text-white transition-colors">Categories</a>
                    </li>
                  )}
                  {aboutConfig.show !== false && (
                    <li>
                      <a href="#about" className="hover:text-white transition-colors">About Us</a>
                    </li>
                  )}
                  <li>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                  </li>
                  <li>
                    <Link to={`/track-order?shop=${shop.slug}`} className="hover:text-[#10B981] transition-colors inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Customer Support (3 cols) */}
              <div className="lg:col-span-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Support</h4>
                <ul className="space-y-2 text-xs text-neutral-400 font-medium">
                  <li>
                    <Link to="/" className="hover:text-white transition-colors">Marketplace Directory</Link>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Shipping & Islandwide Delivery</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Return & Exchange Policy</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Privacy & Data Security</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span>
                  </li>
                </ul>
              </div>

              {/* Col 4: Newsletter Subscription (3 cols) */}
              {footerConfig.showNewsletter !== false && (
                <div className="lg:col-span-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {footerConfig.newsletterTitle || 'Subscribe to our newsletter'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Get the latest updates, offers and exclusive releases.
                  </p>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (newsletterEmail.trim()) {
                        setNewsletterSubscribed(true);
                        setNewsletterEmail('');
                      }
                    }}
                    className="space-y-2 pt-1"
                  >
                    <div className="flex rounded-xl overflow-hidden bg-white/10 border border-neutral-700 p-1">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={e => setNewsletterEmail(e.target.value)}
                        placeholder="Your email address"
                        required
                        className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-[#10B981] hover:bg-[#059669] text-white px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </div>
                    {newsletterSubscribed && (
                      <span className="text-[11px] font-bold text-[#10B981] block">
                        Thank you for subscribing! ✓
                      </span>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Bar: Copyright & Scroll to Top */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
              <span>{footerConfig.copyrightText || `© 2026 ${shop.name}. All rights reserved. Powered by Kadeo.`}</span>

              <button
                type="button"
                onClick={scrollToTop}
                className="h-9 w-9 rounded-full bg-neutral-800 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                title="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
