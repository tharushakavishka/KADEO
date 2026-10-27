import heroBagImg from '../assets/images/kadeo_hero_bag.jpg';
import linenHeroImg from '../assets/images/kadeo_linen_hero.jpg';
import electronicsBannerImg from '../assets/images/kadeo_electronics_banner.jpg';
import prodTshirtImg from '../assets/images/kadeo_prod_tshirt.jpg';
import prodSkincareImg from '../assets/images/kadeo_prod_skincare.jpg';
import prodPlantImg from '../assets/images/kadeo_prod_plant.jpg';
import themeLinenImg from '../assets/images/kadeo_theme_linen.jpg';
import themeMinimalImg from '../assets/images/kadeo_theme_minimal.jpg';
import themeBoldImg from '../assets/images/kadeo_theme_bold.jpg';
import themeClassicImg from '../assets/images/kadeo_theme_classic.jpg';
import themeNatureImg from '../assets/images/kadeo_theme_nature.jpg';

export type StorefrontThemeType =
  | 'kadeo'
  | 'linen'
  | 'tech'
  | 'beauty'
  | 'streetwear'
  | 'organic'
  | 'minimal'
  | 'classic';

export interface ThemePreset {
  id: StorefrontThemeType;
  name: string;
  category: string;
  subtitle: string;
  thumbnail: string;
  colors: string[];
  primaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  cardStyle: 'standard' | 'dark-tech' | 'luxury-serif' | 'clean-minimal' | 'bold-street' | 'organic-soft';
  heroBadge: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroHeadline3: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage: string;
  floatingBadge: string;
  announcementText: string;
  announcementLinkText: string;
  announcementBg: string;
  promoBanner1Tag: string;
  promoBanner1Title: string;
  promoBanner1Cta: string;
  promoBanner2Tag: string;
  promoBanner2Title: string;
  promoBanner2Cta: string;
  footerDescription: string;
}

export const THEME_PRESETS: Record<StorefrontThemeType, ThemePreset> = {
  kadeo: {
    id: 'kadeo',
    name: 'Kadeo Marketplace',
    category: 'Multi-Vendor & Retail',
    subtitle: 'Vibrant, trustworthy Sri Lankan commerce layout',
    thumbnail: themeBoldImg,
    colors: ['#00A86B', '#0F172A', '#F3F4F6'],
    primaryColor: '#00A86B',
    fontFamily: 'sans',
    borderRadius: 'rounded-2xl',
    cardStyle: 'standard',
    heroBadge: 'Sri Lankan Sellers Platform',
    heroHeadline1: 'Your Shop.',
    heroHeadline2: 'Your Customers.',
    heroHeadline3: 'Your Growth.',
    heroSubtitle: 'Discover amazing products from local sellers. Support small businesses. Shop with confidence.',
    heroCta: 'Shop Now →',
    heroImage: heroBagImg,
    floatingBadge: 'Local Sellers Big Dreams ↗',
    announcementText: '🚚 Free Islandwide Delivery on Orders Over Rs. 5,000 | Cash on Delivery Available',
    announcementLinkText: 'Shop Now →',
    announcementBg: '#00A86B',
    promoBanner1Tag: 'Support Local Small Businesses',
    promoBanner1Title: 'Discover passionate artisans and local creators across Sri Lanka.',
    promoBanner1Cta: 'Explore Sellers →',
    promoBanner2Tag: 'Best Deals',
    promoBanner2Title: 'Latest Electronics & Gadgets at Unbeatable Prices',
    promoBanner2Cta: 'Shop Electronics →',
    footerDescription: 'Your Shop. Your Customers. Your Growth. The all-in-one commerce platform for Sri Lankan entrepreneurs.',
  },
  linen: {
    id: 'linen',
    name: 'Linen & Luxury Boutique',
    category: 'High Fashion & Apparel',
    subtitle: 'Warm linen tones, serif elegance and artisan aesthetic',
    thumbnail: themeLinenImg,
    colors: ['#8C7355', '#292524', '#FAF8F5'],
    primaryColor: '#8C7355',
    fontFamily: 'serif',
    borderRadius: 'rounded-2xl',
    cardStyle: 'luxury-serif',
    heroBadge: 'PREMIUM LINEN COLLECTION',
    heroHeadline1: 'Timeless Elegance',
    heroHeadline2: 'for Everyday',
    heroHeadline3: 'Living.',
    heroSubtitle: 'Handcrafted breathable linen apparel tailored for the modern tropical lifestyle. Pure comfort, timeless style.',
    heroCta: 'Explore Collection →',
    heroImage: linenHeroImg,
    floatingBadge: 'Handcrafted Linen 100% ↗',
    announcementText: '✨ Complimentary Gift Packaging on all luxury linen orders this week',
    announcementLinkText: 'Claim Gift →',
    announcementBg: '#8C7355',
    promoBanner1Tag: 'Artisan Weavers of Ceylon',
    promoBanner1Title: 'Sustainable organic fabrics woven by master craftspeople.',
    promoBanner1Cta: 'View Lookbook →',
    promoBanner2Tag: 'Summer Solstice',
    promoBanner2Title: 'Lightweight Resort Wear & Breezy Linen Silhouettes',
    promoBanner2Cta: 'Shop New Arrivals →',
    footerDescription: 'Timeless elegance and handcrafted linen pieces designed for understated luxury and everyday comfort.',
  },
  tech: {
    id: 'tech',
    name: 'Cyber Tech & Gadgets',
    category: 'Electronics & Hardware',
    subtitle: 'Futuristic dark slate, cyan neon accents and spec highlights',
    thumbnail: electronicsBannerImg,
    colors: ['#0284C7', '#0F172A', '#1E293B'],
    primaryColor: '#0284C7',
    fontFamily: 'sans',
    borderRadius: 'rounded-xl',
    cardStyle: 'dark-tech',
    heroBadge: '⚡ NEXT-GEN GADGETS & AUDIO',
    heroHeadline1: 'Unleash Your',
    heroHeadline2: 'Ultimate Digital',
    heroHeadline3: 'Performance.',
    heroSubtitle: 'Pro-grade wireless audio, smart wearables, and gaming peripherals with official manufacturer warranty.',
    heroCta: 'Discover Tech Deals →',
    heroImage: electronicsBannerImg,
    floatingBadge: '1-Year Islandwide Warranty ↗',
    announcementText: '⚡ Flash Sale: Up to 40% OFF Studio ANC Wireless Earbuds & Gaming Headsets',
    announcementLinkText: 'Grab Deals →',
    announcementBg: '#0F172A',
    promoBanner1Tag: 'Audio Engineering',
    promoBanner1Title: 'Spatial Audio with Active Hybrid Noise Cancellation.',
    promoBanner1Cta: 'Explore Audio →',
    promoBanner2Tag: 'Smart Living',
    promoBanner2Title: 'High-speed fast chargers, magnetic docks & sleek desktop accessories',
    promoBanner2Cta: 'View Gear →',
    footerDescription: 'Cutting-edge electronics, audio gear, and peripherals delivered directly with guaranteed authenticity.',
  },
  beauty: {
    id: 'beauty',
    name: 'Glow Botanical Beauty',
    category: 'Cosmetics & Skincare',
    subtitle: 'Blush pink, rose gold details and soft aesthetic luxury',
    thumbnail: prodSkincareImg,
    colors: ['#E11D48', '#BE185D', '#FFF1F2'],
    primaryColor: '#E11D48',
    fontFamily: 'serif',
    borderRadius: 'rounded-3xl',
    cardStyle: 'luxury-serif',
    heroBadge: '🌸 100% DERMATOLOGIST TESTED',
    heroHeadline1: 'Reveal Your Most',
    heroHeadline2: 'Radiant, Youthful',
    heroHeadline3: 'Glow.',
    heroSubtitle: 'Clean, cruelty-free botanical skincare packed with antioxidant fruit extracts and deeply nourishing hyaluronic formulas.',
    heroCta: 'Shop Skincare Routine →',
    heroImage: prodSkincareImg,
    floatingBadge: 'Vegan & Cruelty Free ↗',
    announcementText: '✨ Free Deluxe Mini Radiance Serum with every order over Rs. 4,500',
    announcementLinkText: 'Shop Skincare →',
    announcementBg: '#E11D48',
    promoBanner1Tag: 'Clean Botanical Formulas',
    promoBanner1Title: 'Organic Rosewater and Ceylon Tea Seed Glow Concentrates.',
    promoBanner1Cta: 'Discover Serums →',
    promoBanner2Tag: 'Spa At Home',
    promoBanner2Title: 'Hydrating clay masks, cooling jade rollers & restorative night creams',
    promoBanner2Cta: 'Shop Self-Care →',
    footerDescription: 'Pure, scientifically formulated skincare crafted to elevate your daily self-care ritual with radiant results.',
  },
  streetwear: {
    id: 'streetwear',
    name: 'Urban Streetwear & Culture',
    category: 'Apparel, Sneakers & Drops',
    subtitle: 'High-contrast black & blaze orange with heavy bold typography',
    thumbnail: prodTshirtImg,
    colors: ['#EA580C', '#09090B', '#F3F4F6'],
    primaryColor: '#EA580C',
    fontFamily: 'sans',
    borderRadius: 'rounded-lg',
    cardStyle: 'bold-street',
    heroBadge: '🔥 LIMITED DROP // VOL. 04',
    heroHeadline1: 'HEAVYWEIGHT OVERSHOOT.',
    heroHeadline2: 'RAW STREETWEAR',
    heroHeadline3: 'CULTURE.',
    heroSubtitle: '300GSM custom-milled combed cotton tees, oversized silhouettes, and statement graphics designed in Colombo.',
    heroCta: 'COP THE DROP →',
    heroImage: prodTshirtImg,
    floatingBadge: 'Only 150 Made ↗',
    announcementText: '🔥 DROP 04 IS LIVE! ISLANDWIDE EXPRESS DISPATCH WITHIN 24 HOURS',
    announcementLinkText: 'Shop Drops →',
    announcementBg: '#09090B',
    promoBanner1Tag: 'Colombo Underground',
    promoBanner1Title: 'Heavyweight boxy fits crafted for the humid tropical streets.',
    promoBanner1Cta: 'View Drop →',
    promoBanner2Tag: 'Core Essentials',
    promoBanner2Title: 'Archival caps, utility tote bags and distressed vintage washed hoodies',
    promoBanner2Cta: 'Shop Gear →',
    footerDescription: 'Unapologetic urban streetwear inspired by modern youth culture and underground Colombo artistry.',
  },
  organic: {
    id: 'organic',
    name: 'Nature & Organic Living',
    category: 'Eco Living, Plants & Foods',
    subtitle: 'Botanical forest greens, soft rounded pill cards and eco vibe',
    thumbnail: prodPlantImg,
    colors: ['#15803D', '#166534', '#ECFDF5'],
    primaryColor: '#15803D',
    fontFamily: 'sans',
    borderRadius: 'rounded-3xl',
    cardStyle: 'organic-soft',
    heroBadge: '🌱 100% ECO-FRIENDLY & LOCAL',
    heroHeadline1: 'Nurture Your Home',
    heroHeadline2: 'With Living Green',
    heroHeadline3: 'Vibes.',
    heroSubtitle: 'Hand-potted indoor plants, organic micro-herbs, and sustainable biodegradable planters for a calmer, cleaner home.',
    heroCta: 'Bring Nature Home →',
    heroImage: prodPlantImg,
    floatingBadge: 'We Plant 1 Tree Per Order ↗',
    announcementText: '🌿 Plastic-Free Biodegradable Packaging | We plant a native tree with every purchase',
    announcementLinkText: 'Learn More →',
    announcementBg: '#15803D',
    promoBanner1Tag: 'Botanical Living',
    promoBanner1Title: 'Indoor air-purifying foliage and self-watering clay planters.',
    promoBanner1Cta: 'View Plants →',
    promoBanner2Tag: 'Wild & Organic',
    promoBanner2Title: 'Pure Ceylon wild-harvested honey, artisanal teas and herbal wellness infusions',
    promoBanner2Cta: 'Shop Pantry →',
    footerDescription: 'Connecting people with nature through sustainable indoor greenery, organic farm products, and eco-conscious living.',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimalist Scandinavian',
    category: 'Modern Living & Essentials',
    subtitle: 'Monochrome precision, airy typography and clean razor lines',
    thumbnail: themeMinimalImg,
    colors: ['#18181B', '#71717A', '#F4F4F5'],
    primaryColor: '#18181B',
    fontFamily: 'sans',
    borderRadius: 'rounded-none',
    cardStyle: 'clean-minimal',
    heroBadge: 'EDITION 2026 // STUDIO',
    heroHeadline1: 'Essential Design.',
    heroHeadline2: 'Quiet Luxury for',
    heroHeadline3: 'Daily Living.',
    heroSubtitle: 'Stripped of excess, crafted with purposeful materials. An uncompromising celebration of form, utility and silence.',
    heroCta: 'Explore Studio →',
    heroImage: heroBagImg,
    floatingBadge: 'Architectural Simplicity ↗',
    announcementText: 'Complimentary white-glove shipping on domestic orders above Rs. 7,500',
    announcementLinkText: 'Explore Collection →',
    announcementBg: '#18181B',
    promoBanner1Tag: 'Form & Function',
    promoBanner1Title: 'Minimalist carry goods and architectural desktop utilities.',
    promoBanner1Cta: 'View Lookbook →',
    promoBanner2Tag: 'Monochrome Living',
    promoBanner2Title: 'Matte black ceramics, linen throws, and timeless geometric home pieces',
    promoBanner2Cta: 'Shop Essentials →',
    footerDescription: 'Timeless architectural minimalism designed for modern interiors and thoughtful everyday living.',
  },
  classic: {
    id: 'classic',
    name: 'Heritage & Vintage Craft',
    category: 'Leather, Wood & Artisan',
    subtitle: 'Warm amber, hand-tooled leather aesthetics and legacy craft',
    thumbnail: themeClassicImg,
    colors: ['#B45309', '#78350F', '#FEF3C7'],
    primaryColor: '#B45309',
    fontFamily: 'serif',
    borderRadius: 'rounded-xl',
    cardStyle: 'standard',
    heroBadge: '🏛️ GENUINE HANDCRAFTED HERITAGE',
    heroHeadline1: 'Built to Last.',
    heroHeadline2: 'Hand-Stitched With',
    heroHeadline3: 'Master Pride.',
    heroSubtitle: 'Full-grain vegetable tanned leather goods, solid teak accents, and timeless heritage artifacts built to outlive generations.',
    heroCta: 'Explore Heritage →',
    heroImage: heroBagImg,
    floatingBadge: 'Lifetime Craftsmanship Guarantee ↗',
    announcementText: '🧭 Free custom monogram initials on all handcrafted leather goods this month',
    announcementLinkText: 'Personalize Now →',
    announcementBg: '#B45309',
    promoBanner1Tag: 'Master Leather Artisans',
    promoBanner1Title: 'Full-grain vegetable tanned hides aged to develop a rich patina over time.',
    promoBanner1Cta: 'View Leather Goods →',
    promoBanner2Tag: 'Teak & Brass',
    promoBanner2Title: 'Hand-carved reclaimed Ceylon teak home accents and solid brass desktop wares',
    promoBanner2Cta: 'Shop Heirlooms →',
    footerDescription: 'Honoring centuries of Sri Lankan craftsmanship with heirloom quality goods made with honest, natural materials.',
  },
};

export interface StorefrontAnimationsConfig {
  pageTransition: 'fade' | 'slide' | 'zoom' | 'none';
  heroBadge: 'float' | 'pulse' | 'static';
  productHover: 'lift-zoom' | 'glow-border' | 'scale' | 'subtle';
  announcementTicker: boolean;
  ctaButtonPulse: boolean;
  scrollReveal: boolean;
  scrollRevealStyle: 'slide-up' | 'scale' | 'fade';
  animationSpeed: 'fast' | 'normal' | 'smooth';
}

export interface KaveeStorefrontConfig {
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText: string;
    bgColor: string;
  };
  header: {
    storeName: string;
    tagline: string;
    logoText: string;
    navStyle: 'solid' | 'floating' | 'transparent';
    navHeight: 'compact' | 'spacious';
    linksAlignment: 'left' | 'center' | 'right';
    sticky: boolean;
    searchStyle: 'pill' | 'rounded' | 'square';
    searchVariant: 'filled' | 'outline';
    searchPlaceholder: string;
    showSearch: boolean;
    showWishlist: boolean;
  };
  hero: {
    badgeText: string;
    headlineLine1: string;
    headlineLine2: string;
    headlineLine3: string;
    subtitle: string;
    ctaText: string;
    floatingBadge: string;
    imageUrl?: string;
  };
  categories: {
    title: string;
    subtitle: string;
    viewAllText: string;
  };
  products: {
    title: string;
    subtitle: string;
    viewAllText: string;
  };
  theme: {
    themeId: StorefrontThemeType;
    primaryColor: string;
    fontFamily: 'sans' | 'serif' | 'mono';
    borderRadius?: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
    cardStyle?: 'standard' | 'dark-tech' | 'luxury-serif' | 'clean-minimal' | 'bold-street' | 'organic-soft';
  };
  sectionsVisibility: {
    announcement: boolean;
    header: boolean;
    hero: boolean;
    categories: boolean;
    products: boolean;
    promoBanners: boolean;
    whyShop: boolean;
    footer: boolean;
  };
  promoBanner1: {
    tag: string;
    title: string;
    ctaText: string;
  };
  promoBanner2: {
    tag: string;
    title: string;
    ctaText: string;
  };
  whyShop: {
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  footer: {
    description: string;
    copyrightText: string;
    supportEmail: string;
    phone: string;
  };
  storeSettings: {
    currencySymbol: string;
    freeShippingThreshold: number;
    islandwideDeliveryText: string;
  };
  animations: StorefrontAnimationsConfig;
}

export const DEFAULT_KAVEE_CONFIG: KaveeStorefrontConfig = {
  announcementBar: {
    enabled: true,
    text: THEME_PRESETS.kadeo.announcementText,
    linkText: THEME_PRESETS.kadeo.announcementLinkText,
    bgColor: THEME_PRESETS.kadeo.announcementBg,
  },
  header: {
    storeName: 'Kadeo',
    tagline: 'Sri Lankan Marketplace',
    logoText: 'Kadeo',
    navStyle: 'solid',
    navHeight: 'spacious',
    linksAlignment: 'left',
    sticky: true,
    searchStyle: 'pill',
    searchVariant: 'filled',
    searchPlaceholder: 'Search 10,000+ products, artisan goods, brands...',
    showSearch: true,
    showWishlist: true,
  },
  hero: {
    badgeText: THEME_PRESETS.kadeo.heroBadge,
    headlineLine1: THEME_PRESETS.kadeo.heroHeadline1,
    headlineLine2: THEME_PRESETS.kadeo.heroHeadline2,
    headlineLine3: THEME_PRESETS.kadeo.heroHeadline3,
    subtitle: THEME_PRESETS.kadeo.heroSubtitle,
    ctaText: THEME_PRESETS.kadeo.heroCta,
    floatingBadge: THEME_PRESETS.kadeo.floatingBadge,
    imageUrl: THEME_PRESETS.kadeo.heroImage,
  },
  categories: {
    title: 'Shop by Category',
    subtitle: 'Explore handpicked collections curated for you.',
    viewAllText: 'View All',
  },
  products: {
    title: 'Featured Collection',
    subtitle: 'Handcrafted & top-rated items from verified sellers',
    viewAllText: 'View All Products',
  },
  theme: {
    themeId: 'kadeo',
    primaryColor: THEME_PRESETS.kadeo.primaryColor,
    fontFamily: THEME_PRESETS.kadeo.fontFamily,
    borderRadius: THEME_PRESETS.kadeo.borderRadius,
    cardStyle: THEME_PRESETS.kadeo.cardStyle,
  },
  sectionsVisibility: {
    announcement: true,
    header: true,
    hero: true,
    categories: true,
    products: true,
    promoBanners: true,
    whyShop: true,
    footer: true,
  },
  promoBanner1: {
    tag: THEME_PRESETS.kadeo.promoBanner1Tag,
    title: THEME_PRESETS.kadeo.promoBanner1Title,
    ctaText: THEME_PRESETS.kadeo.promoBanner1Cta,
  },
  promoBanner2: {
    tag: THEME_PRESETS.kadeo.promoBanner2Tag,
    title: THEME_PRESETS.kadeo.promoBanner2Title,
    ctaText: THEME_PRESETS.kadeo.promoBanner2Cta,
  },
  whyShop: {
    title: 'Why Shop with Kadeo?',
    subtitle: 'A trusted Sri Lankan commerce platform tailored for quality and reliability.',
    card1Title: 'Guaranteed Protection',
    card1Desc: '100% genuine products with full buyer security on every order.',
    card2Title: 'Islandwide Delivery',
    card2Desc: 'Swift shipping across all 25 districts within 2-4 business days.',
    card3Title: 'Support Local Sellers',
    card3Desc: 'Every purchase directly empowers passionate Sri Lankan businesses.',
    card4Title: 'Curated Quality',
    card4Desc: 'All merchants are vetted to guarantee exceptional craftsmanship.',
  },
  footer: {
    description: THEME_PRESETS.kadeo.footerDescription,
    copyrightText: '© 2026 Kadeo. All rights reserved. Made with ❤️ in Sri Lanka.',
    supportEmail: 'support@kadeo.lk',
    phone: '+94 11 234 5678',
  },
  storeSettings: {
    currencySymbol: 'Rs.',
    freeShippingThreshold: 5000,
    islandwideDeliveryText: 'Fast Islandwide Courier',
  },
  animations: {
    pageTransition: 'fade',
    heroBadge: 'float',
    productHover: 'lift-zoom',
    announcementTicker: true,
    ctaButtonPulse: true,
    scrollReveal: true,
    scrollRevealStyle: 'slide-up',
    animationSpeed: 'normal',
  },
};

const STORAGE_KEY = 'kadeo_storefront_config_kavee-3';

export const KaveeStoreService = {
  getConfig(): KaveeStorefrontConfig {
    if (typeof window === 'undefined') return DEFAULT_KAVEE_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_KAVEE_CONFIG, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Failed to parse kavee config', e);
    }
    return DEFAULT_KAVEE_CONFIG;
  },

  saveConfig(config: KaveeStorefrontConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('kadeo_config_updated', { detail: config }));
    } catch (e) {
      console.error('Failed to save kavee config', e);
    }
  },

  applyPreset(themeId: StorefrontThemeType, existingConfig: KaveeStorefrontConfig): KaveeStorefrontConfig {
    const preset = THEME_PRESETS[themeId] || THEME_PRESETS.kadeo;
    const updated: KaveeStorefrontConfig = {
      ...existingConfig,
      theme: {
        themeId: preset.id,
        primaryColor: preset.primaryColor,
        fontFamily: preset.fontFamily,
        borderRadius: preset.borderRadius,
        cardStyle: preset.cardStyle,
      },
      announcementBar: {
        ...existingConfig.announcementBar,
        text: preset.announcementText,
        linkText: preset.announcementLinkText,
        bgColor: preset.announcementBg,
      },
      hero: {
        ...existingConfig.hero,
        badgeText: preset.heroBadge,
        headlineLine1: preset.heroHeadline1,
        headlineLine2: preset.heroHeadline2,
        headlineLine3: preset.heroHeadline3,
        subtitle: preset.heroSubtitle,
        ctaText: preset.heroCta,
        imageUrl: preset.heroImage,
        floatingBadge: preset.floatingBadge,
      },
      promoBanner1: {
        tag: preset.promoBanner1Tag,
        title: preset.promoBanner1Title,
        ctaText: preset.promoBanner1Cta,
      },
      promoBanner2: {
        tag: preset.promoBanner2Tag,
        title: preset.promoBanner2Title,
        ctaText: preset.promoBanner2Cta,
      },
      footer: {
        ...existingConfig.footer,
        description: preset.footerDescription,
      },
    };
    this.saveConfig(updated);
    return updated;
  },

  resetConfig(): KaveeStorefrontConfig {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('kadeo_config_updated', { detail: DEFAULT_KAVEE_CONFIG }));
    }
    return DEFAULT_KAVEE_CONFIG;
  },
};
