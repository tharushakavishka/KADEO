import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { StorefrontView } from '../../components/storefront/StorefrontView';
import { Shop, Product, Category, StorefrontThemeId } from '../../types';
import {
  Sparkles,
  Eye,
  EyeOff,
  Cloud,
  ExternalLink,
  Upload,
  Link2,
  Type,
  ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Plus,
  Minus,
  X,
  Settings,
  Palette,
  Layers,
  Bell,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Droplet,
  SlidersHorizontal,
  Info,
  CreditCard,
  Check,
  Store,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Wifi,
  Battery,
  ShoppingBag,
  ShieldCheck,
  Copy,
  Radio,
  GripVertical,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface EditorConfigSnapshot {
  storeName: string;
  storeDesc: string;
  storeWhatsapp: string;
  storeDisplayPhone: string;
  storeCity: string;
  storeThemeId: StorefrontThemeId;
  storeLogo: string;
  brandColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  buttonShape: 'pill' | 'rounded' | 'sharp';
  sectionOrder: string[];
  sectionVisibility: {
    announcement: boolean;
    header: boolean;
    hero: boolean;
    categories: boolean;
    products: boolean;
    about: boolean;
    footer: boolean;
  };
  announceText: string;
  announceLinkText: string;
  announceBgColor: string;
  announceTextColor: string;
  announceAlign: 'left' | 'center' | 'right';
  announcePadding: number;
  headerTagline: string;
  headerBgColor: string;
  headerSticky: boolean;
  headerShowSearch: boolean;
  headerShowCart: boolean;
  headerShowTrack: boolean;
  mainHeading: string;
  welcomeBadgeText: string;
  secondaryCtaText: string;
  subheading: string;
  buttonLabel: string;
  bgType: 'image' | 'color';
  bgImage: string;
  bgColor: string;
  overlayColor: string;
  overlayOpacity: string;
  contentAlignment: 'left' | 'center' | 'right';
  topPadding: number;
  bottomPadding: number;
  showWelcomeBadge: boolean;
  showHeadline: boolean;
  showDescription: boolean;
  showCtaButtons: boolean;
  showPrimaryCta: boolean;
  showSecondaryCta: boolean;
  showSpotlightImage: boolean;
  spotlightImage: string;
  showTrustBadges: boolean;
  showTrust1: boolean;
  showTrust2: boolean;
  showTrust3: boolean;
  trust1Title: string;
  trust1Sub: string;
  trust2Title: string;
  trust2Sub: string;
  trust3Title: string;
  trust3Sub: string;
  catTitle: string;
  catSubtitle: string;
  catBgColor: string;
  catTopPadding: number;
  catBottomPadding: number;
  productsTitle: string;
  productsSubtitle: string;
  productsColumns: number;
  aboutBadgeTitle: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDesc: string;
  aboutImageUrl: string;
  aboutBgColor: string;
  aboutTopPadding: number;
  aboutBottomPadding: number;
  footerAboutText: string;
  footerNewsletterTitle: string;
  footerCopyright: string;
  footerBgColor: string;
  footerShowNewsletter: boolean;
  footerShowSocials: boolean;
}

export const SellerCustomizePage: React.FC = () => {
  const { currentShop, refreshShop } = useAuth();

  // Active shop fallback: prioritize current authenticated shop, then 'kavee'
  const activeShop: Shop = useMemo(() => {
    if (currentShop) return currentShop;
    const foundKavee = StorageService.getShopBySlug('kavee');
    if (foundKavee) return foundKavee;
    return StorageService.getShops()[0];
  }, [currentShop]);

  // Actual live products and categories belonging to this seller
  const [actualProducts, setActualProducts] = useState<Product[]>([]);
  const [actualCategories, setActualCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (activeShop?.id) {
      const prods = StorageService.getProductsByShop(activeShop.id);
      setActualProducts(prods.length > 0 ? prods : StorageService.getProducts().slice(0, 8));
      setActualCategories(StorageService.getCategories());
    }
  }, [activeShop?.id]);

  // Viewport mode: 'desktop' | 'tablet' | 'mobile'
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Zoom scale: 'fit' | '100' | '75' | '50'
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100' | '75' | '50'>('100');

  // Active Left Navigation Tool: 'sections' | 'theme' | 'typography' | 'colors' | 'media' | 'buttons' | 'settings'
  const [activeNavTab, setActiveNavTab] = useState<
    'sections' | 'theme' | 'typography' | 'colors' | 'media' | 'buttons' | 'settings'
  >('sections');

  // Selected Section for Properties Inspector: 'hero' | 'announcement' | 'header' | 'categories' | 'products' | 'about' | 'footer'
  const [selectedSection, setSelectedSection] = useState<
    'hero' | 'announcement' | 'header' | 'categories' | 'products' | 'about' | 'footer'
  >('hero');

  // Inspector Sub-tab: 'content' | 'style'
  const [inspectorTab, setInspectorTab] = useState<'content' | 'style'>('content');

  // ── Global Store Settings State ──
  const [storeName, setStoreName] = useState(activeShop.name || 'Kavee Boutique');
  const [storeDesc, setStoreDesc] = useState(activeShop.description || '');
  const [storeWhatsapp, setStoreWhatsapp] = useState(activeShop.whatsappNumber || '');
  const [storeDisplayPhone, setStoreDisplayPhone] = useState(activeShop.displayPhone || '');
  const [storeCity, setStoreCity] = useState(activeShop.contactDetails?.city || 'Colombo 03');
  const [storeThemeId, setStoreThemeId] = useState<StorefrontThemeId>(activeShop.themeId || 'minimal');
  const [storeLogo, setStoreLogo] = useState(activeShop.logo || '');
  const [brandColor, setBrandColor] = useState(activeShop.customization?.brandColor || '#10B981');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>(activeShop.customization?.fontFamily || 'sans');
  const [buttonShape, setButtonShape] = useState<'pill' | 'rounded' | 'sharp'>(activeShop.customization?.buttonShape || 'pill');

  // Section Ordering
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    return activeShop.customization?.sectionOrder || ['hero', 'categories', 'products', 'about'];
  });

  // Section Visibility Toggles
  const [sectionVisibility, setSectionVisibility] = useState({
    announcement: activeShop.customization?.announcement?.show !== false,
    header: activeShop.customization?.header?.showHeader !== false,
    hero: activeShop.heroBanner?.showHeroBanner !== false,
    categories: activeShop.customization?.categories?.show !== false,
    products: (activeShop.customization as any)?.products?.show !== false,
    about: activeShop.customization?.about?.show !== false,
    footer: activeShop.customization?.footer?.showFooter !== false,
  });

  // ── 1. Announcement Bar State ──
  const initialAnnounce = activeShop.customization?.announcement || {};
  const [announceText, setAnnounceText] = useState(
    initialAnnounce.text || '🎉 Free Islandwide Delivery on Orders Over Rs. 5,000 | Cash on Delivery Available'
  );
  const [announceLinkText, setAnnounceLinkText] = useState(initialAnnounce.linkText || 'Shop Now');
  const [announceBgColor, setAnnounceBgColor] = useState(initialAnnounce.bgColor || '#10B981');
  const [announceTextColor, setAnnounceTextColor] = useState(initialAnnounce.textColor || '#FFFFFF');
  const [announceAlign, setAnnounceAlign] = useState<'left' | 'center' | 'right'>(
    initialAnnounce.alignment || 'center'
  );
  const [announcePadding, setAnnouncePadding] = useState<number>(initialAnnounce.topPadding || 8);

  // ── 2. Header / Nav State ──
  const initialHeader = activeShop.customization?.header || {};
  const [headerTagline, setHeaderTagline] = useState(
    initialHeader.tagline || (activeShop.themeId === 'beauty' ? 'BEAUTY & SALON' : 'BOUTIQUE ATELIER')
  );
  const [headerBgColor, setHeaderBgColor] = useState(initialHeader.bgColor || '#111827');
  const [headerSticky, setHeaderSticky] = useState<boolean>(initialHeader.sticky !== false);
  const [headerShowSearch, setHeaderShowSearch] = useState<boolean>(initialHeader.showSearch !== false);
  const [headerShowCart, setHeaderShowCart] = useState<boolean>(initialHeader.showCart !== false);
  const [headerShowTrack, setHeaderShowTrack] = useState<boolean>(initialHeader.showTrackOrder !== false);

  // ── 3. Hero Section State ──
  const initialHero = activeShop.heroBanner || {};
  const [mainHeading, setMainHeading] = useState(
    initialHero.headlineMain && initialHero.headlineHighlight
      ? `${initialHero.headlineMain}\n${initialHero.headlineHighlight}`
      : 'Look Good.\nFeel Beautiful.'
  );
  const [welcomeBadgeText, setWelcomeBadgeText] = useState(
    initialHero.welcomeBadge || 'PREMIUM LINEN COLLECTION'
  );
  const [secondaryCtaText, setSecondaryCtaText] = useState(
    initialHero.secondaryCtaText || 'WhatsApp Concierge'
  );
  const [subheading, setSubheading] = useState(
    initialHero.description ||
      activeShop.description ||
      'Handcrafted linen apparel for the modern Sri Lankan lifestyle. Timeless style, everyday comfort.'
  );
  const [buttonLabel, setButtonLabel] = useState(initialHero.primaryCtaText || 'Shop Collection');

  // Hero Background & Styling
  const [bgType, setBgType] = useState<'image' | 'color'>(
    (initialHero as any).backgroundColor && !(initialHero as any).backgroundImage ? 'color' : 'image'
  );
  const [bgImage, setBgImage] = useState(
    initialHero.backgroundImage ||
      activeShop.coverImage ||
      '/src/assets/images/ceylon_linen_hero_campaign_1792347214765.jpg'
  );
  const [bgColor, setBgColor] = useState('#F8F6F0');
  const [overlayColor, setOverlayColor] = useState((initialHero as any).overlayColor || '#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(
    (initialHero as any).overlayOpacity !== undefined ? `${Math.round((initialHero as any).overlayOpacity * 100)}%` : '20%'
  );

  // Content Alignment: 'left' | 'center' | 'right'
  const [contentAlignment, setContentAlignment] = useState<'left' | 'center' | 'right'>(
    (initialHero as any).alignment || 'left'
  );

  // Section Spacing (Padding)
  const [topPadding, setTopPadding] = useState<number>((initialHero as any).topPadding || 80);
  const [bottomPadding, setBottomPadding] = useState<number>((initialHero as any).bottomPadding || 80);

  // ── Hero Element Visibility Toggles ──
  const [showWelcomeBadge, setShowWelcomeBadge] = useState<boolean>(
    initialHero.showWelcomeBadge !== false
  );
  const [showHeadline, setShowHeadline] = useState<boolean>(
    initialHero.showHeadline !== false
  );
  const [showDescription, setShowDescription] = useState<boolean>(
    initialHero.showDescription !== false
  );
  const [showCtaButtons, setShowCtaButtons] = useState<boolean>(
    initialHero.showCtaButtons !== false
  );
  const [showPrimaryCta, setShowPrimaryCta] = useState<boolean>(
    (initialHero as any).showPrimaryCta !== false
  );
  const [showSecondaryCta, setShowSecondaryCta] = useState<boolean>(
    (initialHero as any).showSecondaryCta !== false
  );
  const [showSpotlightImage, setShowSpotlightImage] = useState<boolean>(
    initialHero.showSpotlightImage !== false
  );
  const [spotlightImage, setSpotlightImage] = useState<string>(
    initialHero.spotlightImage ||
      actualProducts[0]?.images[0] ||
      '/src/assets/images/ceylon_linen_shirt_1792345877981.jpg'
  );
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(
    initialHero.showTrustBadges !== false
  );
  const [showTrust1, setShowTrust1] = useState<boolean>(
    (initialHero as any).showTrust1 !== false
  );
  const [showTrust2, setShowTrust2] = useState<boolean>(
    (initialHero as any).showTrust2 !== false
  );
  const [showTrust3, setShowTrust3] = useState<boolean>(
    (initialHero as any).showTrust3 !== false
  );

  // ── Floating Trust Badges Texts ──
  const [trust1Title, setTrust1Title] = useState<string>(
    initialHero.trustBadge1?.title || '100% Pure Flax & Organic'
  );
  const [trust1Sub, setTrust1Sub] = useState<string>(
    initialHero.trustBadge1?.subtitle || 'Certified & Quality Tested'
  );
  const [trust2Title, setTrust2Title] = useState<string>(
    initialHero.trustBadge2?.title || 'Fast Delivery'
  );
  const [trust2Sub, setTrust2Sub] = useState<string>(
    initialHero.trustBadge2?.subtitle || 'Island Wide (1-3 Days)'
  );
  const [trust3Title, setTrust3Title] = useState<string>(
    initialHero.trustBadge3?.title || 'Secure Checkout'
  );
  const [trust3Sub, setTrust3Sub] = useState<string>(
    initialHero.trustBadge3?.subtitle || 'Cash on Delivery / Bank'
  );

  // ── 4. Categories Section State ──
  const initialCat = activeShop.customization?.categories || {};
  const [catTitle, setCatTitle] = useState(initialCat.title || 'Shop by Category');
  const [catSubtitle, setCatSubtitle] = useState(
    initialCat.subtitle || 'Explore curated collections and craft essentials'
  );
  const [catBgColor, setCatBgColor] = useState(initialCat.bgColor || '#FFFFFF');
  const [catTopPadding, setCatTopPadding] = useState<number>(initialCat.topPadding || 56);
  const [catBottomPadding, setCatBottomPadding] = useState<number>(initialCat.bottomPadding || 64);

  // ── 5. Products Section State ──
  const initialProducts = (activeShop.customization as any)?.products || {};
  const [productsTitle, setProductsTitle] = useState<string>(
    initialProducts.title || 'Featured Products'
  );
  const [productsSubtitle, setProductsSubtitle] = useState<string>(
    initialProducts.subtitle || 'Handpicked authentic items ready for instant dispatch'
  );
  const [productsColumns, setProductsColumns] = useState<number>(
    initialProducts.columns || 5
  );

  // ── 6. About Section State ──
  const initialAbout = activeShop.customization?.about || {};
  const [aboutBadgeTitle, setAboutBadgeTitle] = useState(initialAbout.badgeTitle || 'ABOUT OUR STORE');
  const [aboutTitle, setAboutTitle] = useState(initialAbout.title || activeShop.name);
  const [aboutSubtitle, setAboutSubtitle] = useState(
    initialAbout.subtitle || (activeShop.themeId === 'beauty' ? 'Beauty & Salon' : 'Artisanal Lifestyle')
  );
  const [aboutDesc, setAboutDesc] = useState(
    initialAbout.description ||
      'We bring you the best handcrafted garments, skincare and professional services to help you look and feel your best. From pure European flax linens to bespoke artisan care — everything you need is right here.'
  );
  const [aboutImageUrl, setAboutImageUrl] = useState(
    initialAbout.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80'
  );
  const [aboutBgColor, setAboutBgColor] = useState(initialAbout.bgColor || '#FFFFFF');
  const [aboutTopPadding, setAboutTopPadding] = useState<number>(initialAbout.topPadding || 64);
  const [aboutBottomPadding, setAboutBottomPadding] = useState<number>(initialAbout.bottomPadding || 64);

  // ── 7. Footer Section State ──
  const initialFooter = activeShop.customization?.footer || {};
  const [footerAboutText, setFooterAboutText] = useState(
    initialFooter.aboutText ||
      'Your style and beauty. Our priority. Handcrafted pieces and artisan care designed for everyday living.'
  );
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState(
    initialFooter.newsletterTitle || 'Subscribe to our newsletter'
  );
  const [footerCopyright, setFooterCopyright] = useState(
    initialFooter.copyrightText || `© 2026 ${activeShop.name}. All rights reserved. Powered by Kadeo.`
  );
  const [footerBgColor, setFooterBgColor] = useState(initialFooter.bgColor || '#111827');
  const [footerShowNewsletter, setFooterShowNewsletter] = useState<boolean>(
    initialFooter.showNewsletter !== false
  );
  const [footerShowSocials, setFooterShowSocials] = useState<boolean>(initialFooter.showSocials !== false);

  // Save / Publish Feedback
  const [saveToast, setSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('All changes saved and published live!');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // File Upload Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spotlightFileInputRef = useRef<HTMLInputElement>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Snapshot generation
  const getSnapshot = useCallback((): EditorConfigSnapshot => ({
    storeName,
    storeDesc,
    storeWhatsapp,
    storeDisplayPhone,
    storeCity,
    storeThemeId,
    storeLogo,
    brandColor,
    fontFamily,
    buttonShape,
    sectionOrder,
    sectionVisibility: { ...sectionVisibility },
    announceText,
    announceLinkText,
    announceBgColor,
    announceTextColor,
    announceAlign,
    announcePadding,
    headerTagline,
    headerBgColor,
    headerSticky,
    headerShowSearch,
    headerShowCart,
    headerShowTrack,
    mainHeading,
    welcomeBadgeText,
    secondaryCtaText,
    subheading,
    buttonLabel,
    bgType,
    bgImage,
    bgColor,
    overlayColor,
    overlayOpacity,
    contentAlignment,
    topPadding,
    bottomPadding,
    showWelcomeBadge,
    showHeadline,
    showDescription,
    showCtaButtons,
    showPrimaryCta,
    showSecondaryCta,
    showSpotlightImage,
    spotlightImage,
    showTrustBadges,
    showTrust1,
    showTrust2,
    showTrust3,
    trust1Title,
    trust1Sub,
    trust2Title,
    trust2Sub,
    trust3Title,
    trust3Sub,
    catTitle,
    catSubtitle,
    catBgColor,
    catTopPadding,
    catBottomPadding,
    productsTitle,
    productsSubtitle,
    productsColumns,
    aboutBadgeTitle,
    aboutTitle,
    aboutSubtitle,
    aboutDesc,
    aboutImageUrl,
    aboutBgColor,
    aboutTopPadding,
    aboutBottomPadding,
    footerAboutText,
    footerNewsletterTitle,
    footerCopyright,
    footerBgColor,
    footerShowNewsletter,
    footerShowSocials,
  }), [
    storeName, storeDesc, storeWhatsapp, storeDisplayPhone, storeCity, storeThemeId, storeLogo,
    brandColor, fontFamily, buttonShape, sectionOrder, sectionVisibility,
    announceText, announceLinkText, announceBgColor, announceTextColor, announceAlign, announcePadding,
    headerTagline, headerBgColor, headerSticky, headerShowSearch, headerShowCart, headerShowTrack,
    mainHeading, welcomeBadgeText, secondaryCtaText, subheading, buttonLabel,
    bgType, bgImage, bgColor, overlayColor, overlayOpacity, contentAlignment, topPadding, bottomPadding,
    showWelcomeBadge, showHeadline, showDescription, showCtaButtons, showPrimaryCta, showSecondaryCta,
    showSpotlightImage, spotlightImage, showTrustBadges, showTrust1, showTrust2, showTrust3,
    trust1Title, trust1Sub, trust2Title, trust2Sub, trust3Title, trust3Sub,
    catTitle, catSubtitle, catBgColor, catTopPadding, catBottomPadding,
    productsTitle, productsSubtitle, productsColumns,
    aboutBadgeTitle, aboutTitle, aboutSubtitle, aboutDesc, aboutImageUrl, aboutBgColor, aboutTopPadding, aboutBottomPadding,
    footerAboutText, footerNewsletterTitle, footerCopyright, footerBgColor, footerShowNewsletter, footerShowSocials,
  ]);

  const applySnapshot = useCallback((s: EditorConfigSnapshot) => {
    setStoreName(s.storeName);
    setStoreDesc(s.storeDesc);
    setStoreWhatsapp(s.storeWhatsapp);
    setStoreDisplayPhone(s.storeDisplayPhone);
    setStoreCity(s.storeCity);
    setStoreThemeId(s.storeThemeId);
    setStoreLogo(s.storeLogo);
    setBrandColor(s.brandColor);
    setFontFamily(s.fontFamily);
    setButtonShape(s.buttonShape);
    setSectionOrder(s.sectionOrder);
    setSectionVisibility(s.sectionVisibility);
    setAnnounceText(s.announceText);
    setAnnounceLinkText(s.announceLinkText);
    setAnnounceBgColor(s.announceBgColor);
    setAnnounceTextColor(s.announceTextColor);
    setAnnounceAlign(s.announceAlign);
    setAnnouncePadding(s.announcePadding);
    setHeaderTagline(s.headerTagline);
    setHeaderBgColor(s.headerBgColor);
    setHeaderSticky(s.headerSticky);
    setHeaderShowSearch(s.headerShowSearch);
    setHeaderShowCart(s.headerShowCart);
    setHeaderShowTrack(s.headerShowTrack);
    setMainHeading(s.mainHeading);
    setWelcomeBadgeText(s.welcomeBadgeText);
    setSecondaryCtaText(s.secondaryCtaText);
    setSubheading(s.subheading);
    setButtonLabel(s.buttonLabel);
    setBgType(s.bgType);
    setBgImage(s.bgImage);
    setBgColor(s.bgColor);
    setOverlayColor(s.overlayColor);
    setOverlayOpacity(s.overlayOpacity);
    setContentAlignment(s.contentAlignment);
    setTopPadding(s.topPadding);
    setBottomPadding(s.bottomPadding);
    setShowWelcomeBadge(s.showWelcomeBadge);
    setShowHeadline(s.showHeadline);
    setShowDescription(s.showDescription);
    setShowCtaButtons(s.showCtaButtons);
    setShowPrimaryCta(s.showPrimaryCta);
    setShowSecondaryCta(s.showSecondaryCta);
    setShowSpotlightImage(s.showSpotlightImage);
    setSpotlightImage(s.spotlightImage);
    setShowTrustBadges(s.showTrustBadges);
    setShowTrust1(s.showTrust1);
    setShowTrust2(s.showTrust2);
    setShowTrust3(s.showTrust3);
    setTrust1Title(s.trust1Title);
    setTrust1Sub(s.trust1Sub);
    setTrust2Title(s.trust2Title);
    setTrust2Sub(s.trust2Sub);
    setTrust3Title(s.trust3Title);
    setTrust3Sub(s.trust3Sub);
    setCatTitle(s.catTitle);
    setCatSubtitle(s.catSubtitle);
    setCatBgColor(s.catBgColor);
    setCatTopPadding(s.catTopPadding);
    setCatBottomPadding(s.catBottomPadding);
    setProductsTitle(s.productsTitle);
    setProductsSubtitle(s.productsSubtitle);
    setProductsColumns(s.productsColumns);
    setAboutBadgeTitle(s.aboutBadgeTitle);
    setAboutTitle(s.aboutTitle);
    setAboutSubtitle(s.aboutSubtitle);
    setAboutDesc(s.aboutDesc);
    setAboutImageUrl(s.aboutImageUrl);
    setAboutBgColor(s.aboutBgColor);
    setAboutTopPadding(s.aboutTopPadding);
    setAboutBottomPadding(s.aboutBottomPadding);
    setFooterAboutText(s.footerAboutText);
    setFooterNewsletterTitle(s.footerNewsletterTitle);
    setFooterCopyright(s.footerCopyright);
    setFooterBgColor(s.footerBgColor);
    setFooterShowNewsletter(s.footerShowNewsletter);
    setFooterShowSocials(s.footerShowSocials);
  }, []);

  // History & Undo/Redo Stacks
  const [history, setHistory] = useState<EditorConfigSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const isHistoryAction = useRef(false);

  // Initialize history on mount / shop load
  useEffect(() => {
    if (activeShop && history.length === 0) {
      const snap = getSnapshot();
      setHistory([snap]);
      setHistoryIndex(0);
      setSavedSnapshot(JSON.stringify(snap));
    }
  }, [activeShop?.id, getSnapshot, history.length]);

  // Debounced history record
  useEffect(() => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const snap = getSnapshot();
      setHistory(prev => {
        if (prev.length === 0) return [snap];
        const current = prev[historyIndex];
        if (JSON.stringify(current) === JSON.stringify(snap)) return prev;
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced.length >= 30) sliced.shift();
        return [...sliced, snap];
      });
      setHistoryIndex(prev => Math.min(prev + 1, 29));
    }, 400);

    return () => clearTimeout(timer);
  }, [getSnapshot, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isHistoryAction.current = true;
      const target = history[historyIndex - 1];
      applySnapshot(target);
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex, history, applySnapshot]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isHistoryAction.current = true;
      const target = history[historyIndex + 1];
      applySnapshot(target);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history, applySnapshot]);

  const hasUnsavedChanges = useMemo(() => {
    if (!savedSnapshot) return false;
    return JSON.stringify(getSnapshot()) !== savedSnapshot;
  }, [savedSnapshot, getSnapshot]);

  // Section Reordering
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSectionOrder(prev => {
      const idx = prev.indexOf(sectionId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      next.splice(targetIdx, 0, removed);
      return next;
    });
  };

  // Image Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        setBgImage(result);
        setBgType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSpotlightUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) setSpotlightImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAboutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) setAboutImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) setStoreLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSection = (section: 'hero' | 'announcement' | 'header' | 'categories' | 'products' | 'about' | 'footer') => {
    setActiveNavTab('sections');
    setSelectedSection(section);
    const targetId = section === 'hero' ? 'home' : section;
    const targetEl = previewContainerRef.current?.querySelector(`#${targetId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Construct Reactive Preview Shop Object
  const previewShop: Shop = useMemo(() => {
    const lines = mainHeading.split('\n');
    const line1 = lines[0] ?? '';
    const line2 = lines.slice(1).join('\n') ?? '';

    return {
      ...activeShop,
      name: storeName,
      description: storeDesc,
      whatsappNumber: storeWhatsapp,
      displayPhone: storeDisplayPhone,
      themeId: storeThemeId,
      logo: storeLogo,
      coverImage: bgImage || activeShop.coverImage || '',
      contactDetails: {
        ...activeShop.contactDetails,
        city: storeCity,
      },
      heroBanner: {
        ...activeShop.heroBanner,
        showHeroBanner: sectionVisibility.hero,
        showWelcomeBadge,
        showHeadline,
        showDescription,
        showCtaButtons,
        showPrimaryCta,
        showSecondaryCta,
        showSpotlightImage,
        spotlightImage,
        showTrustBadges,
        showTrust1,
        showTrust2,
        showTrust3,
        welcomeBadge: welcomeBadgeText,
        headlineMain: line1,
        headlineHighlight: line2,
        description: subheading,
        primaryCtaText: buttonLabel,
        secondaryCtaText,
        backgroundImage: bgType === 'image' ? bgImage : undefined,
        backgroundColor: bgType === 'color' ? bgColor : undefined,
        overlayColor,
        overlayOpacity: parseInt(overlayOpacity, 10) / 100,
        alignment: contentAlignment,
        topPadding,
        bottomPadding,
        trustBadge1: { title: trust1Title, subtitle: trust1Sub },
        trustBadge2: { title: trust2Title, subtitle: trust2Sub },
        trustBadge3: { title: trust3Title, subtitle: trust3Sub },
      } as any,
      customization: {
        brandColor,
        fontFamily,
        buttonShape,
        sectionOrder,
        announcement: {
          show: sectionVisibility.announcement,
          text: announceText,
          linkText: announceLinkText,
          bgColor: announceBgColor,
          textColor: announceTextColor,
          alignment: announceAlign,
          topPadding: announcePadding,
          bottomPadding: announcePadding,
        },
        header: {
          showHeader: sectionVisibility.header,
          tagline: headerTagline,
          bgColor: headerBgColor,
          sticky: headerSticky,
          showSearch: headerShowSearch,
          showCart: headerShowCart,
          showTrackOrder: headerShowTrack,
        },
        categories: {
          show: sectionVisibility.categories,
          title: catTitle,
          subtitle: catSubtitle,
          bgColor: catBgColor,
          topPadding: catTopPadding,
          bottomPadding: catBottomPadding,
        },
        products: {
          show: sectionVisibility.products,
          title: productsTitle,
          subtitle: productsSubtitle,
          columns: productsColumns,
        },
        about: {
          show: sectionVisibility.about,
          badgeTitle: aboutBadgeTitle,
          title: aboutTitle,
          subtitle: aboutSubtitle,
          description: aboutDesc,
          imageUrl: aboutImageUrl,
          bgColor: aboutBgColor,
          topPadding: aboutTopPadding,
          bottomPadding: aboutBottomPadding,
        },
        footer: {
          showFooter: sectionVisibility.footer,
          aboutText: footerAboutText,
          newsletterTitle: footerNewsletterTitle,
          copyrightText: footerCopyright,
          bgColor: footerBgColor,
          showNewsletter: footerShowNewsletter,
          showSocials: footerShowSocials,
        },
      },
    };
  }, [
    activeShop,
    storeName,
    storeDesc,
    storeWhatsapp,
    storeDisplayPhone,
    storeCity,
    storeThemeId,
    storeLogo,
    mainHeading,
    welcomeBadgeText,
    secondaryCtaText,
    subheading,
    buttonLabel,
    bgType,
    bgImage,
    bgColor,
    overlayColor,
    overlayOpacity,
    contentAlignment,
    topPadding,
    bottomPadding,
    showWelcomeBadge,
    showHeadline,
    showDescription,
    showCtaButtons,
    showPrimaryCta,
    showSecondaryCta,
    showSpotlightImage,
    spotlightImage,
    showTrustBadges,
    showTrust1,
    showTrust2,
    showTrust3,
    trust1Title,
    trust1Sub,
    trust2Title,
    trust2Sub,
    trust3Title,
    trust3Sub,
    sectionVisibility,
    announceText,
    announceLinkText,
    announceBgColor,
    announceTextColor,
    announceAlign,
    announcePadding,
    headerTagline,
    headerBgColor,
    headerSticky,
    headerShowSearch,
    headerShowCart,
    headerShowTrack,
    catTitle,
    catSubtitle,
    catBgColor,
    catTopPadding,
    catBottomPadding,
    productsTitle,
    productsSubtitle,
    productsColumns,
    aboutBadgeTitle,
    aboutTitle,
    aboutSubtitle,
    aboutDesc,
    aboutImageUrl,
    aboutBgColor,
    aboutTopPadding,
    aboutBottomPadding,
    footerAboutText,
    footerNewsletterTitle,
    footerCopyright,
    footerBgColor,
    footerShowNewsletter,
    footerShowSocials,
    brandColor,
    fontFamily,
    buttonShape,
    sectionOrder,
  ]);

  const handleSaveAndPublish = useCallback(() => {
    setIsSaving(true);
    const lines = mainHeading.split('\n');
    const line1 = lines[0] ?? '';
    const line2 = lines.slice(1).join('\n') ?? '';

    const updatedHero = {
      ...activeShop.heroBanner,
      showHeroBanner: sectionVisibility.hero,
      showWelcomeBadge,
      showHeadline,
      showDescription,
      showCtaButtons,
      showPrimaryCta,
      showSecondaryCta,
      showSpotlightImage,
      spotlightImage,
      showTrustBadges,
      showTrust1,
      showTrust2,
      showTrust3,
      welcomeBadge: welcomeBadgeText,
      headlineMain: line1,
      headlineHighlight: line2,
      description: subheading,
      primaryCtaText: buttonLabel,
      secondaryCtaText,
      backgroundImage: bgType === 'image' ? bgImage : undefined,
      backgroundColor: bgType === 'color' ? bgColor : undefined,
      overlayColor,
      overlayOpacity: parseInt(overlayOpacity, 10) / 100,
      alignment: contentAlignment,
      topPadding,
      bottomPadding,
      trustBadge1: { title: trust1Title, subtitle: trust1Sub },
      trustBadge2: { title: trust2Title, subtitle: trust2Sub },
      trustBadge3: { title: trust3Title, subtitle: trust3Sub },
    };

    const updatedCustomization = {
      brandColor,
      fontFamily,
      buttonShape,
      sectionOrder,
      announcement: {
        show: sectionVisibility.announcement,
        text: announceText,
        linkText: announceLinkText,
        bgColor: announceBgColor,
        textColor: announceTextColor,
        alignment: announceAlign,
        topPadding: announcePadding,
        bottomPadding: announcePadding,
      },
      header: {
        showHeader: sectionVisibility.header,
        tagline: headerTagline,
        bgColor: headerBgColor,
        sticky: headerSticky,
        showSearch: headerShowSearch,
        showCart: headerShowCart,
        showTrackOrder: headerShowTrack,
      },
      categories: {
        show: sectionVisibility.categories,
        title: catTitle,
        subtitle: catSubtitle,
        bgColor: catBgColor,
        topPadding: catTopPadding,
        bottomPadding: catBottomPadding,
      },
      products: {
        show: sectionVisibility.products,
        title: productsTitle,
        subtitle: productsSubtitle,
        columns: productsColumns,
      },
      about: {
        show: sectionVisibility.about,
        badgeTitle: aboutBadgeTitle,
        title: aboutTitle,
        subtitle: aboutSubtitle,
        description: aboutDesc,
        imageUrl: aboutImageUrl,
        bgColor: aboutBgColor,
        topPadding: aboutTopPadding,
        bottomPadding: aboutBottomPadding,
      },
      footer: {
        showFooter: sectionVisibility.footer,
        aboutText: footerAboutText,
        newsletterTitle: footerNewsletterTitle,
        copyrightText: footerCopyright,
        bgColor: footerBgColor,
        showNewsletter: footerShowNewsletter,
        showSocials: footerShowSocials,
      },
    };

    StorageService.updateShop(activeShop.id, {
      name: storeName,
      description: storeDesc,
      whatsappNumber: storeWhatsapp,
      displayPhone: storeDisplayPhone,
      themeId: storeThemeId,
      logo: storeLogo,
      coverImage: bgImage || activeShop.coverImage || '',
      contactDetails: {
        ...activeShop.contactDetails,
        city: storeCity,
      },
      heroBanner: updatedHero as any,
      customization: updatedCustomization,
    });

    if (refreshShop) refreshShop();

    setTimeout(() => {
      setIsSaving(false);
      setSavedSnapshot(JSON.stringify(getSnapshot()));
      setSaveToastMessage('Changes published live to your storefront!');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3500);
    }, 600);
  }, [
    activeShop,
    mainHeading,
    sectionVisibility,
    showWelcomeBadge,
    showHeadline,
    showDescription,
    showCtaButtons,
    showPrimaryCta,
    showSecondaryCta,
    showSpotlightImage,
    spotlightImage,
    showTrustBadges,
    showTrust1,
    showTrust2,
    showTrust3,
    welcomeBadgeText,
    subheading,
    buttonLabel,
    secondaryCtaText,
    bgType,
    bgImage,
    bgColor,
    overlayColor,
    overlayOpacity,
    contentAlignment,
    topPadding,
    bottomPadding,
    trust1Title,
    trust1Sub,
    trust2Title,
    trust2Sub,
    trust3Title,
    trust3Sub,
    brandColor,
    fontFamily,
    buttonShape,
    sectionOrder,
    announceText,
    announceLinkText,
    announceBgColor,
    announceTextColor,
    announceAlign,
    announcePadding,
    headerTagline,
    headerBgColor,
    headerSticky,
    headerShowSearch,
    headerShowCart,
    headerShowTrack,
    catTitle,
    catSubtitle,
    catBgColor,
    catTopPadding,
    catBottomPadding,
    productsTitle,
    productsSubtitle,
    productsColumns,
    aboutBadgeTitle,
    aboutTitle,
    aboutSubtitle,
    aboutDesc,
    aboutImageUrl,
    aboutBgColor,
    aboutTopPadding,
    aboutBottomPadding,
    footerAboutText,
    footerNewsletterTitle,
    footerCopyright,
    footerBgColor,
    footerShowNewsletter,
    footerShowSocials,
    storeName,
    storeDesc,
    storeWhatsapp,
    storeDisplayPhone,
    storeThemeId,
    storeLogo,
    storeCity,
    refreshShop,
    getSnapshot,
  ]);

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    const lines = mainHeading.split('\n');
    const line1 = lines[0] ?? '';
    const line2 = lines.slice(1).join('\n') ?? '';

    const updatedHero = {
      ...activeShop.heroBanner,
      showHeroBanner: sectionVisibility.hero,
      showWelcomeBadge,
      showHeadline,
      showDescription,
      showCtaButtons,
      showPrimaryCta,
      showSecondaryCta,
      showSpotlightImage,
      spotlightImage,
      showTrustBadges,
      showTrust1,
      showTrust2,
      showTrust3,
      welcomeBadge: welcomeBadgeText,
      headlineMain: line1,
      headlineHighlight: line2,
      description: subheading,
      primaryCtaText: buttonLabel,
      secondaryCtaText,
      backgroundImage: bgType === 'image' ? bgImage : undefined,
      backgroundColor: bgType === 'color' ? bgColor : undefined,
      overlayColor,
      overlayOpacity: parseInt(overlayOpacity, 10) / 100,
      alignment: contentAlignment,
      topPadding,
      bottomPadding,
      trustBadge1: { title: trust1Title, subtitle: trust1Sub },
      trustBadge2: { title: trust2Title, subtitle: trust2Sub },
      trustBadge3: { title: trust3Title, subtitle: trust3Sub },
    };

    const updatedCustomization = {
      brandColor,
      fontFamily,
      buttonShape,
      sectionOrder,
      announcement: {
        show: sectionVisibility.announcement,
        text: announceText,
        linkText: announceLinkText,
        bgColor: announceBgColor,
        textColor: announceTextColor,
        alignment: announceAlign,
        topPadding: announcePadding,
        bottomPadding: announcePadding,
      },
      header: {
        showHeader: sectionVisibility.header,
        tagline: headerTagline,
        bgColor: headerBgColor,
        sticky: headerSticky,
        showSearch: headerShowSearch,
        showCart: headerShowCart,
        showTrackOrder: headerShowTrack,
      },
      categories: {
        show: sectionVisibility.categories,
        title: catTitle,
        subtitle: catSubtitle,
        bgColor: catBgColor,
        topPadding: catTopPadding,
        bottomPadding: catBottomPadding,
      },
      products: {
        show: sectionVisibility.products,
        title: productsTitle,
        subtitle: productsSubtitle,
        columns: productsColumns,
      },
      about: {
        show: sectionVisibility.about,
        badgeTitle: aboutBadgeTitle,
        title: aboutTitle,
        subtitle: aboutSubtitle,
        description: aboutDesc,
        imageUrl: aboutImageUrl,
        bgColor: aboutBgColor,
        topPadding: aboutTopPadding,
        bottomPadding: aboutBottomPadding,
      },
      footer: {
        showFooter: sectionVisibility.footer,
        aboutText: footerAboutText,
        newsletterTitle: footerNewsletterTitle,
        copyrightText: footerCopyright,
        bgColor: footerBgColor,
        showNewsletter: footerShowNewsletter,
        showSocials: footerShowSocials,
      },
    };

    StorageService.updateShop(activeShop.id, {
      name: storeName,
      description: storeDesc,
      whatsappNumber: storeWhatsapp,
      displayPhone: storeDisplayPhone,
      themeId: storeThemeId,
      logo: storeLogo,
      coverImage: bgImage || activeShop.coverImage || '',
      contactDetails: {
        ...activeShop.contactDetails,
        city: storeCity,
      },
      heroBanner: updatedHero as any,
      customization: updatedCustomization,
    });

    setTimeout(() => {
      setIsSaving(false);
      setSavedSnapshot(JSON.stringify(getSnapshot()));
      setSaveToastMessage('Draft configuration saved!');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }, 400);
  }, [
    activeShop,
    mainHeading,
    sectionVisibility,
    showWelcomeBadge,
    showHeadline,
    showDescription,
    showCtaButtons,
    showPrimaryCta,
    showSecondaryCta,
    showSpotlightImage,
    spotlightImage,
    showTrustBadges,
    showTrust1,
    showTrust2,
    showTrust3,
    welcomeBadgeText,
    subheading,
    buttonLabel,
    secondaryCtaText,
    bgType,
    bgImage,
    bgColor,
    overlayColor,
    overlayOpacity,
    contentAlignment,
    topPadding,
    bottomPadding,
    trust1Title,
    trust1Sub,
    trust2Title,
    trust2Sub,
    trust3Title,
    trust3Sub,
    brandColor,
    fontFamily,
    buttonShape,
    sectionOrder,
    announceText,
    announceLinkText,
    announceBgColor,
    announceTextColor,
    announceAlign,
    announcePadding,
    headerTagline,
    headerBgColor,
    headerSticky,
    headerShowSearch,
    headerShowCart,
    headerShowTrack,
    catTitle,
    catSubtitle,
    catBgColor,
    catTopPadding,
    catBottomPadding,
    productsTitle,
    productsSubtitle,
    productsColumns,
    aboutBadgeTitle,
    aboutTitle,
    aboutSubtitle,
    aboutDesc,
    aboutImageUrl,
    aboutBgColor,
    aboutTopPadding,
    aboutBottomPadding,
    footerAboutText,
    footerNewsletterTitle,
    footerCopyright,
    footerBgColor,
    footerShowNewsletter,
    footerShowSocials,
    storeName,
    storeDesc,
    storeWhatsapp,
    storeDisplayPhone,
    storeThemeId,
    storeLogo,
    storeCity,
    getSnapshot,
  ]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSaveAndPublish();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveAndPublish]);

  const toggleSectionVisibility = (section: keyof typeof sectionVisibility, e: React.MouseEvent) => {
    e.stopPropagation();
    setSectionVisibility(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyLiveUrl = () => {
    const url = `${window.location.origin}/shop/${activeShop.slug || 'kavee'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const zoomFactor = zoomLevel === '75' ? 0.75 : zoomLevel === '50' ? 0.5 : 1;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[700px] bg-[#F3F5F8] text-[#111827] -m-2 sm:-m-4 overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-xs">
      {/* ──────────────────────────────────────────────────────────────────────────
          A. TOP EDITOR TOOLBAR (56-64px)
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-[#111827] text-white px-3 sm:px-5 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0 select-none z-30">
        {/* Left Section: KADEO Logo, Breadcrumb, Saved State Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-7 px-2.5 rounded-lg bg-emerald-500/20 text-[#10B981] flex items-center gap-1.5 text-xs font-black tracking-wide border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>KADEO</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium truncate">
            <span>/</span>
            <span className="text-neutral-300 truncate">Storefront Editor</span>
            <span>/</span>
            <strong className="text-white truncate font-semibold">{storeName}</strong>
          </div>

          {/* Saved State Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium">
            {hasUnsavedChanges ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-medium">Unsaved changes</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-neutral-300">All changes saved</span>
              </>
            )}
          </div>
        </div>

        {/* Center Section: Undo, Redo, Viewport Switcher, Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Controls */}
          <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-700/80 mx-0.5 hidden sm:block" />

          {/* Viewport Switcher */}
          <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              title="Desktop View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewportMode === 'desktop'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[11px]">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              title="Tablet View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewportMode === 'tablet'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[11px]">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              title="Mobile View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewportMode === 'mobile'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[11px]">Mobile</span>
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-700/80 mx-0.5 hidden lg:block" />

          {/* Zoom Level Selector */}
          <div className="hidden lg:flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10 text-[11px] font-semibold text-neutral-300">
            <button
              type="button"
              onClick={() => setZoomLevel('100')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                zoomLevel === '100' ? 'bg-white/20 text-white font-bold' : 'hover:text-white'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('75')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                zoomLevel === '75' ? 'bg-white/20 text-white font-bold' : 'hover:text-white'
              }`}
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('50')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                zoomLevel === '50' ? 'bg-white/20 text-white font-bold' : 'hover:text-white'
              }`}
            >
              50%
            </button>
          </div>
        </div>

        {/* Right Section: Preview Store, Save Draft, Save & Publish */}
        <div className="flex items-center gap-2">
          <Link
            to={`/shop/${activeShop.slug || 'kavee'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview Store</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          B. STUDIO WORKSPACE (Left Nav + Center Canvas + Right Inspector)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Design Tools & Layers (240px) */}
        <aside className="w-56 lg:w-60 bg-white border-r border-[#E5E7EB] flex flex-col shrink-0 select-none overflow-y-auto">
          {/* Design Tools Navigation */}
          <div className="p-3 border-b border-[#E5E7EB]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2 px-2">
              Design Tools
            </span>
            <div className="space-y-0.5">
              {[
                { id: 'sections', label: 'Sections', icon: Layers },
                { id: 'theme', label: 'Theme Style', icon: Palette },
                { id: 'colors', label: 'Brand Colors', icon: Droplet },
                { id: 'typography', label: 'Typography', icon: Type },
                { id: 'media', label: 'Store Media', icon: ImageIcon },
                { id: 'buttons', label: 'Button Styling', icon: SlidersHorizontal },
                { id: 'settings', label: 'Store Settings', icon: Settings },
              ].map(tool => {
                const Icon = tool.icon;
                const isActive = activeNavTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveNavTab(tool.id as any)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#ECFDF5] text-emerald-900 font-bold border-l-2 border-[#10B981]'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#10B981]' : 'text-[#6B7280]'}`} />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layers / Sections Manager */}
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Layers / Sections
              </span>
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                7 Active
              </span>
            </div>

            <div className="space-y-1">
              {/* 1. Announcement Bar (Pinned Top) */}
              <div
                onClick={() => handleSelectSection('announcement')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  activeNavTab === 'sections' && selectedSection === 'announcement'
                    ? 'bg-[#ECFDF5] text-emerald-900 font-bold ring-1 ring-[#10B981]/50'
                    : 'text-[#4B5563] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bell className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">Announcement</span>
                </div>
                <button
                  type="button"
                  onClick={e => toggleSectionVisibility('announcement', e)}
                  title={sectionVisibility.announcement ? 'Hide Section' : 'Show Section'}
                  className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                >
                  {sectionVisibility.announcement ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-neutral-400" />}
                </button>
              </div>

              {/* 2. Header / Nav (Pinned Top) */}
              <div
                onClick={() => handleSelectSection('header')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  activeNavTab === 'sections' && selectedSection === 'header'
                    ? 'bg-[#ECFDF5] text-emerald-900 font-bold ring-1 ring-[#10B981]/50'
                    : 'text-[#4B5563] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Store className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">Header & Nav</span>
                </div>
                <button
                  type="button"
                  onClick={e => toggleSectionVisibility('header', e)}
                  title={sectionVisibility.header ? 'Hide Section' : 'Show Section'}
                  className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                >
                  {sectionVisibility.header ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-neutral-400" />}
                </button>
              </div>

              {/* Reorderable Body Sections (Hero, Categories, Products, About) */}
              {sectionOrder.map((secId, idx) => {
                const isHero = secId === 'hero';
                const isCat = secId === 'categories';
                const isProd = secId === 'products';
                const isAbout = secId === 'about';

                const title = isHero
                  ? 'Hero Banner'
                  : isCat
                  ? 'Categories'
                  : isProd
                  ? 'Products Grid'
                  : 'About Store';

                const Icon = isHero
                  ? ImageIcon
                  : isCat
                  ? Layers
                  : isProd
                  ? ShoppingBag
                  : Info;

                const isVisible = isHero
                  ? sectionVisibility.hero
                  : isCat
                  ? sectionVisibility.categories
                  : isProd
                  ? sectionVisibility.products
                  : sectionVisibility.about;

                const isSelected = activeNavTab === 'sections' && selectedSection === secId;

                return (
                  <div
                    key={secId}
                    onClick={() => handleSelectSection(secId as any)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#ECFDF5] text-emerald-900 font-bold ring-1 ring-[#10B981]/50'
                        : 'text-[#4B5563] hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="flex flex-col -space-y-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={e => {
                            e.stopPropagation();
                            moveSection(secId, 'up');
                          }}
                          title="Move Section Up"
                          className="text-neutral-400 hover:text-neutral-800 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sectionOrder.length - 1}
                          onClick={e => {
                            e.stopPropagation();
                            moveSection(secId, 'down');
                          }}
                          title="Move Section Down"
                          className="text-neutral-400 hover:text-neutral-800 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>

                      <Icon className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                      <span className="truncate">{title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={e => toggleSectionVisibility(secId as any, e)}
                      title={isVisible ? 'Hide Section' : 'Show Section'}
                      className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                    >
                      {isVisible ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-neutral-400" />}
                    </button>
                  </div>
                );
              })}

              {/* 7. Footer (Pinned Bottom) */}
              <div
                onClick={() => handleSelectSection('footer')}
                className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  activeNavTab === 'sections' && selectedSection === 'footer'
                    ? 'bg-[#ECFDF5] text-emerald-900 font-bold ring-1 ring-[#10B981]/50'
                    : 'text-[#4B5563] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <CreditCard className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">Footer</span>
                </div>
                <button
                  type="button"
                  onClick={e => toggleSectionVisibility('footer', e)}
                  title={sectionVisibility.footer ? 'Hide Section' : 'Show Section'}
                  className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                >
                  {sectionVisibility.footer ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-neutral-400" />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTRAL CANVAS: Real Interactive Visual Preview (60-70% width) */}
        <main
          className="flex-1 bg-[#E9EDF3] p-3 sm:p-5 flex flex-col items-center justify-start overflow-y-auto relative select-none"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        >
          {/* Canvas Floating Top Info Bar */}
          <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md border border-[#E5E7EB] rounded-xl px-3 py-1.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
            {/* Live Store URL with Copy */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-[#4B5563] font-mono text-[11px] truncate">
                <Lock className="h-3 w-3 text-[#10B981]" />
                <span className="truncate">https://kadeo.lk/shop/{activeShop.slug || 'kavee'}</span>
              </span>
              <button
                type="button"
                onClick={copyLiveUrl}
                title="Copy Storefront URL"
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Editing Selection Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B7280]">
                Editing: <strong className="text-[#111827] capitalize">{selectedSection.replace('-', ' ')}</strong>
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Interactive Canvas
              </span>
            </div>
          </div>

          {/* Scaled Device Hardware Container */}
          <div
            style={{
              transform: `scale(${zoomFactor})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}
            className="w-full flex justify-center"
          >
            {viewportMode === 'desktop' ? (
              /* Desktop: macOS Chrome Window Frame */
              <div className="w-full max-w-[1200px] flex flex-col rounded-2xl shadow-xl border border-neutral-300 bg-white overflow-hidden transition-all duration-300">
                {/* Browser Title Bar */}
                <div className="bg-[#1E293B] border-b border-neutral-700/80 px-4 py-2 flex items-center justify-between gap-4 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
                    <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                    <div className="h-3 w-3 rounded-full bg-[#10B981]" />
                    <div className="hidden sm:flex items-center gap-1 ml-3 text-neutral-400">
                      <ChevronLeft className="h-3.5 w-3.5 opacity-60" />
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                      <RotateCw className="h-3 w-3 opacity-60 ml-1" />
                    </div>
                  </div>

                  {/* Browser URL Input */}
                  <div className="flex-1 max-w-sm bg-[#0F172A] border border-neutral-700/60 rounded-lg px-3 py-1 flex items-center justify-center gap-2 text-xs text-neutral-300">
                    <Lock className="h-3 w-3 text-[#10B981] shrink-0" />
                    <span className="truncate font-mono text-[11px] text-neutral-300">
                      https://kadeo.lk/shop/{activeShop.slug || 'kavee'}
                    </span>
                  </div>

                  <span className="hidden sm:inline bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    Live Preview
                  </span>
                </div>

                {/* Desktop Scrollable Storefront */}
                <div
                  ref={previewContainerRef}
                  className="bg-white overflow-y-auto max-h-[720px] text-neutral-900 scroll-smooth"
                >
                  <StorefrontView
                    shop={previewShop}
                    products={actualProducts}
                    categories={actualCategories}
                    isDemoPreview={true}
                    selectedSection={selectedSection}
                    viewportMode="desktop"
                    onSelectSection={sec => handleSelectSection(sec as any)}
                    onShopUpdate={() => {}}
                  />
                </div>
              </div>
            ) : viewportMode === 'tablet' ? (
              /* Tablet: iPad Pro Hardware Frame */
              <div className="w-[760px] max-w-full flex flex-col bg-[#1E293B] p-3.5 rounded-[36px] shadow-2xl border-4 border-[#334155] ring-1 ring-white/10 transition-all duration-300">
                <div className="flex items-center justify-center pb-2 select-none shrink-0">
                  <div className="h-2 w-2 rounded-full bg-black border border-neutral-700/80 shadow-inner" />
                </div>
                <div
                  ref={previewContainerRef}
                  className="bg-white rounded-[22px] overflow-hidden overflow-y-auto max-h-[700px] text-neutral-900 border border-neutral-200 shadow-inner scroll-smooth"
                >
                  <StorefrontView
                    shop={previewShop}
                    products={actualProducts}
                    categories={actualCategories}
                    isDemoPreview={true}
                    selectedSection={selectedSection}
                    viewportMode="tablet"
                    onSelectSection={sec => handleSelectSection(sec as any)}
                    onShopUpdate={() => {}}
                  />
                </div>
                <div className="pt-2 flex justify-center">
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              </div>
            ) : (
              /* Mobile: iPhone 16 Pro Hardware Frame with Dynamic Island */
              <div className="w-[390px] max-w-full flex flex-col bg-[#1E293B] p-2.5 rounded-[50px] shadow-2xl border-4 border-[#334155] ring-1 ring-white/10 transition-all duration-300">
                <div className="px-5 pt-1.5 pb-2 flex items-center justify-between text-neutral-400 select-none shrink-0">
                  <span className="text-[11px] font-semibold text-neutral-300 tracking-tight">9:41</span>
                  <div className="w-24 h-5.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 border border-neutral-800" />
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div
                  ref={previewContainerRef}
                  className="bg-white rounded-[38px] overflow-hidden overflow-y-auto max-h-[660px] text-neutral-900 border border-neutral-200 shadow-inner scroll-smooth"
                >
                  <StorefrontView
                    shop={previewShop}
                    products={actualProducts}
                    categories={actualCategories}
                    isDemoPreview={true}
                    selectedSection={selectedSection}
                    viewportMode="mobile"
                    onSelectSection={sec => handleSelectSection(sec as any)}
                    onShopUpdate={() => {}}
                  />
                </div>
                <div className="pt-2 pb-0.5 flex justify-center">
                  <div className="w-32 h-1 bg-neutral-400/80 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL: Contextual Properties Inspector (320px) */}
        <aside className="w-72 lg:w-80 bg-white border-l border-[#E5E7EB] flex flex-col shrink-0 overflow-y-auto p-3.5 sm:p-4 text-xs">
          {/* Inspector Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-50 text-[#10B981] border border-emerald-100">
                <Settings className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">
                  {activeNavTab === 'settings'
                    ? 'Store Settings'
                    : activeNavTab === 'theme'
                    ? 'Theme Style'
                    : activeNavTab === 'typography'
                    ? 'Typography'
                    : activeNavTab === 'colors'
                    ? 'Brand Colors'
                    : activeNavTab === 'media'
                    ? 'Store Media'
                    : activeNavTab === 'buttons'
                    ? 'Button Styling'
                    : selectedSection === 'announcement'
                    ? 'Announcement Bar'
                    : selectedSection === 'header'
                    ? 'Header / Navigation'
                    : selectedSection === 'hero'
                    ? 'Hero Banner'
                    : selectedSection === 'categories'
                    ? 'Categories Section'
                    : selectedSection === 'products'
                    ? 'Products Grid'
                    : selectedSection === 'about'
                    ? 'About Store'
                    : 'Footer Section'}
                </h3>
                <p className="text-[10px] text-[#6B7280]">Contextual Properties</p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              STORE SETTINGS PANEL (when activeNavTab === 'settings')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'settings' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="Kavee Boutique"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Store Bio / Tagline</label>
                <textarea
                  rows={3}
                  value={storeDesc}
                  onChange={e => setStoreDesc(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] font-normal text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none leading-relaxed"
                  placeholder="Handcrafted boutique apparel and fashion essentials in Sri Lanka..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">WhatsApp Order Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#10B981]" />
                  <input
                    type="text"
                    value={storeWhatsapp}
                    onChange={e => setStoreWhatsapp(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#E5E7EB] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="94771234567"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Display Phone</label>
                <input
                  type="text"
                  value={storeDisplayPhone}
                  onChange={e => setStoreDisplayPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Location / City</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#10B981]" />
                  <input
                    type="text"
                    value={storeCity}
                    onChange={e => setStoreCity(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#E5E7EB] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Colombo 03, Sri Lanka"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              THEME PANEL (when activeNavTab === 'theme')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'theme' && (
            <div className="space-y-3">
              <label className="font-bold text-[#111827] block">Available Themes</label>
              {[
                { id: 'minimal', title: 'Boutique Atelier', desc: 'Minimal clean aesthetic for linen, apparel & craft' },
                { id: 'beauty', title: 'Beauty & Salon', desc: 'Warm glow & luxury ambiance for salons & cosmetic brands' },
                { id: 'modern', title: 'Modern Commerce', desc: 'High-contrast bold retail shopping experience' },
              ].map(thm => (
                <div
                  key={thm.id}
                  onClick={() => setStoreThemeId(thm.id as any)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    storeThemeId === thm.id
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#E5E7EB] hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827]">{thm.title}</span>
                    {storeThemeId === thm.id && <Check className="h-4 w-4 text-[#10B981]" />}
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{thm.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TYPOGRAPHY PANEL (when activeNavTab === 'typography')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'typography' && (
            <div className="space-y-3">
              <label className="font-bold text-[#111827] block">Font Family</label>
              {[
                { id: 'sans', name: 'Inter / Modern Sans', sample: 'Clean, legible modern look' },
                { id: 'serif', name: 'Playfair Editorial Serif', sample: 'Luxury artisanal boutique elegance' },
                { id: 'mono', name: 'Plus Jakarta Sans', sample: 'Geometric tech & lifestyle aesthetic' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontFamily(f.id as any)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    fontFamily === f.id
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#E5E7EB] hover:border-neutral-300'
                  }`}
                >
                  <span className="font-bold text-[#111827] block">{f.name}</span>
                  <span className="text-[11px] text-[#6B7280] block mt-0.5">{f.sample}</span>
                </button>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              COLORS PANEL (when activeNavTab === 'colors')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'colors' && (
            <div className="space-y-3">
              <label className="font-bold text-[#111827] block">Primary Brand Accent</label>
              <div className="flex items-center gap-2">
                {['#10B981', '#059669', '#111827', '#4F46E5', '#D97706', '#E11D48'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer ${
                      brandColor === c ? 'border-[#111827] scale-110 shadow-sm' : 'border-transparent'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="h-8 w-8 rounded-lg border border-[#E5E7EB] cursor-pointer ml-1"
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              MEDIA PANEL (when activeNavTab === 'media')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'media' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111827] block">Store Logo</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-[#E5E7EB] bg-neutral-100 flex items-center justify-center shrink-0">
                    {storeLogo ? (
                      <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Change Logo
                  </button>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#E5E7EB]">
                <label className="font-bold text-[#111827] block">Hero Cover Image</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 rounded-xl overflow-hidden border border-[#E5E7EB] bg-neutral-100 shrink-0">
                    {bgImage ? (
                      <img src={bgImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-neutral-400 m-auto" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Change Cover
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              BUTTONS PANEL (when activeNavTab === 'buttons')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'buttons' && (
            <div className="space-y-3">
              <label className="font-bold text-[#111827] block">Button Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pill', label: 'Pill Rounded' },
                  { id: 'rounded', label: 'Rounded Rect' },
                  { id: 'sharp', label: 'Sharp Crisp' },
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setButtonShape(b.id as any)}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl border-2 transition-all cursor-pointer ${
                      buttonShape === b.id
                        ? 'border-[#10B981] bg-[#ECFDF5] text-emerald-900'
                        : 'border-[#E5E7EB] text-[#4B5563] hover:border-neutral-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              SECTIONS CONTEXTUAL PANEL (when activeNavTab === 'sections')
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeNavTab === 'sections' && (
            <>
              {/* Content vs Style Sub-tabs */}
              <div className="flex border-b border-[#E5E7EB] mb-3">
                <button
                  type="button"
                  onClick={() => setInspectorTab('content')}
                  className={`flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    inspectorTab === 'content'
                      ? 'text-[#111827] border-b-2 border-[#10B981]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Content
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('style')}
                  className={`flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    inspectorTab === 'style'
                      ? 'text-[#111827] border-b-2 border-[#10B981]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Style
                </button>
              </div>

              {/* ── 1. HERO BANNER INSPECTOR ── */}
              {selectedSection === 'hero' && inspectorTab === 'content' && (
                <div className="space-y-3">
                  {/* Welcome Tag */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827]">Welcome Badge Pill</span>
                      <button
                        type="button"
                        onClick={() => setShowWelcomeBadge(!showWelcomeBadge)}
                        className="text-neutral-400 hover:text-[#10B981] cursor-pointer"
                      >
                        {showWelcomeBadge ? <Eye className="h-3.5 w-3.5 text-[#10B981]" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {showWelcomeBadge && (
                      <input
                        type="text"
                        value={welcomeBadgeText}
                        onChange={e => setWelcomeBadgeText(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white font-semibold text-xs focus:ring-1 focus:ring-[#10B981]"
                      />
                    )}
                  </div>

                  {/* Main Headline */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827]">Main Headline</span>
                      <button
                        type="button"
                        onClick={() => setShowHeadline(!showHeadline)}
                        className="text-neutral-400 hover:text-[#10B981] cursor-pointer"
                      >
                        {showHeadline ? <Eye className="h-3.5 w-3.5 text-[#10B981]" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {showHeadline && (
                      <textarea
                        rows={2}
                        value={mainHeading}
                        onChange={e => setMainHeading(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white font-semibold text-xs focus:ring-1 focus:ring-[#10B981] resize-none"
                      />
                    )}
                  </div>

                  {/* Subheading / Description */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-[#E5E7EB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827]">Subheading Description</span>
                      <button
                        type="button"
                        onClick={() => setShowDescription(!showDescription)}
                        className="text-neutral-400 hover:text-[#10B981] cursor-pointer"
                      >
                        {showDescription ? <Eye className="h-3.5 w-3.5 text-[#10B981]" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {showDescription && (
                      <textarea
                        rows={3}
                        value={subheading}
                        onChange={e => setSubheading(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white text-xs focus:ring-1 focus:ring-[#10B981] resize-none"
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827]">CTA Buttons</span>
                      <button
                        type="button"
                        onClick={() => setShowCtaButtons(!showCtaButtons)}
                        className="text-neutral-400 hover:text-[#10B981] cursor-pointer"
                      >
                        {showCtaButtons ? <Eye className="h-3.5 w-3.5 text-[#10B981]" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {showCtaButtons && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={buttonLabel}
                          onChange={e => setButtonLabel(e.target.value)}
                          placeholder="Primary CTA"
                          className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={secondaryCtaText}
                          onChange={e => setSecondaryCtaText(e.target.value)}
                          placeholder="Secondary CTA"
                          className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827]">Trust Badges</span>
                      <button
                        type="button"
                        onClick={() => setShowTrustBadges(!showTrustBadges)}
                        className="text-neutral-400 hover:text-[#10B981] cursor-pointer"
                      >
                        {showTrustBadges ? <Eye className="h-3.5 w-3.5 text-[#10B981]" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {showTrustBadges && (
                      <div className="space-y-2 text-[11px]">
                        <div>
                          <input
                            type="text"
                            value={trust1Title}
                            onChange={e => setTrust1Title(e.target.value)}
                            className="w-full p-1.5 rounded-lg border border-[#E5E7EB] bg-white font-semibold"
                            placeholder="Trust 1 Title"
                          />
                          <input
                            type="text"
                            value={trust1Sub}
                            onChange={e => setTrust1Sub(e.target.value)}
                            className="w-full p-1.5 mt-1 rounded-lg border border-[#E5E7EB] bg-white text-neutral-500"
                            placeholder="Trust 1 Subtitle"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={trust2Title}
                            onChange={e => setTrust2Title(e.target.value)}
                            className="w-full p-1.5 rounded-lg border border-[#E5E7EB] bg-white font-semibold"
                            placeholder="Trust 2 Title"
                          />
                          <input
                            type="text"
                            value={trust2Sub}
                            onChange={e => setTrust2Sub(e.target.value)}
                            className="w-full p-1.5 mt-1 rounded-lg border border-[#E5E7EB] bg-white text-neutral-500"
                            placeholder="Trust 2 Subtitle"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSection === 'hero' && inspectorTab === 'style' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Background Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBgType('image')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border ${
                          bgType === 'image' ? 'bg-[#ECFDF5] border-[#10B981] text-emerald-900' : 'border-[#E5E7EB]'
                        }`}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgType('color')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border ${
                          bgType === 'color' ? 'bg-[#ECFDF5] border-[#10B981] text-emerald-900' : 'border-[#E5E7EB]'
                        }`}
                      >
                        Color
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Overlay Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={parseInt(overlayOpacity, 10) || 20}
                      onChange={e => setOverlayOpacity(`${e.target.value}%`)}
                      className="w-full accent-[#10B981]"
                    />
                    <span className="text-[11px] text-[#6B7280]">{overlayOpacity} dark overlay</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Top & Bottom Spacing</label>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      step="10"
                      value={topPadding}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        setTopPadding(val);
                        setBottomPadding(val);
                      }}
                      className="w-full accent-[#10B981]"
                    />
                    <span className="text-[11px] text-[#6B7280]">{topPadding}px vertical padding</span>
                  </div>
                </div>
              )}

              {/* ── 2. ANNOUNCEMENT BAR INSPECTOR ── */}
              {selectedSection === 'announcement' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Announcement Text</label>
                    <textarea
                      rows={2}
                      value={announceText}
                      onChange={e => setAnnounceText(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Link Text</label>
                    <input
                      type="text"
                      value={announceLinkText}
                      onChange={e => setAnnounceLinkText(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={announceBgColor}
                        onChange={e => setAnnounceBgColor(e.target.value)}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={announceBgColor}
                        onChange={e => setAnnounceBgColor(e.target.value)}
                        className="w-28 p-1.5 rounded-lg border border-[#E5E7EB] font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. HEADER / NAV INSPECTOR ── */}
              {selectedSection === 'header' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Header Tagline</label>
                    <input
                      type="text"
                      value={headerTagline}
                      onChange={e => setHeaderTagline(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Header Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={headerBgColor}
                        onChange={e => setHeaderBgColor(e.target.value)}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerBgColor}
                        onChange={e => setHeaderBgColor(e.target.value)}
                        className="w-28 p-1.5 rounded-lg border border-[#E5E7EB] font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-[#E5E7EB]">
                    <span className="font-bold text-[#111827]">Sticky on Scroll</span>
                    <button
                      type="button"
                      onClick={() => setHeaderSticky(!headerSticky)}
                      className={`h-5 w-9 rounded-full transition-colors cursor-pointer relative ${
                        headerSticky ? 'bg-[#10B981]' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                          headerSticky ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ── 4. CATEGORIES INSPECTOR ── */}
              {selectedSection === 'categories' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Section Title</label>
                    <input
                      type="text"
                      value={catTitle}
                      onChange={e => setCatTitle(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Section Subtitle</label>
                    <input
                      type="text"
                      value={catSubtitle}
                      onChange={e => setCatSubtitle(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs"
                    />
                  </div>
                </div>
              )}

              {/* ── 5. PRODUCTS GRID INSPECTOR ── */}
              {selectedSection === 'products' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Grid Title</label>
                    <input
                      type="text"
                      value={productsTitle}
                      onChange={e => setProductsTitle(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Subtitle</label>
                    <input
                      type="text"
                      value={productsSubtitle}
                      onChange={e => setProductsSubtitle(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Columns (Desktop)</label>
                    <div className="flex gap-2">
                      {[3, 4, 5].map(cols => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => setProductsColumns(cols)}
                          className={`flex-1 py-1.5 rounded-lg border font-bold text-xs ${
                            productsColumns === cols ? 'bg-[#ECFDF5] border-[#10B981] text-emerald-900' : 'border-[#E5E7EB]'
                          }`}
                        >
                          {cols} Cols
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 6. ABOUT STORE INSPECTOR ── */}
              {selectedSection === 'about' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Section Title</label>
                    <input
                      type="text"
                      value={aboutTitle}
                      onChange={e => setAboutTitle(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Story Description</label>
                    <textarea
                      rows={4}
                      value={aboutDesc}
                      onChange={e => setAboutDesc(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs leading-relaxed resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Showcase Image</label>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 rounded-xl overflow-hidden border border-[#E5E7EB] bg-neutral-100 shrink-0">
                        <img src={aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => aboutFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] font-bold hover:bg-neutral-50 transition-colors cursor-pointer text-xs"
                      >
                        Upload Image
                      </button>
                      <input
                        ref={aboutFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAboutFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── 7. FOOTER INSPECTOR ── */}
              {selectedSection === 'footer' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">About Brand Text</label>
                    <textarea
                      rows={3}
                      value={footerAboutText}
                      onChange={e => setFooterAboutText(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Copyright Text</label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={e => setFooterCopyright(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#111827]">Footer Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={footerBgColor}
                        onChange={e => setFooterBgColor(e.target.value)}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={footerBgColor}
                        onChange={e => setFooterBgColor(e.target.value)}
                        className="w-28 p-1.5 rounded-lg border border-[#E5E7EB] font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Floating Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          <div>
            <p className="text-xs font-bold">{saveToastMessage}</p>
            <p className="text-[10px] text-neutral-400">Sync completed to storage and public storefront.</p>
          </div>
          <Link
            to={`/shop/${activeShop.slug || 'kavee'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold"
          >
            View Live
          </Link>
        </div>
      )}
    </div>
  );
};
