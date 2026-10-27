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
import ceylonSpicesImg from '../assets/images/ceylon_cinnamon_spices.jpg';
import catCraftImg from '../assets/images/category_handcrafted_living_1792347730298.jpg';
import catTechImg from '../assets/images/category_audio_tech_1792347731311.jpg';
import catBeautyImg from '../assets/images/category_beauty_wellness_1792347729900.jpg';
import surfLifestyleImg from '../assets/images/marketplace_hero_lifestyle_1792347748759.jpg';

export type StorefrontThemeType =
  | 'kadeo'
  | 'linen'
  | 'tech'
  | 'beauty'
  | 'streetwear'
  | 'organic'
  | 'minimal'
  | 'classic'
  | 'spices'
  | 'jewelry'
  | 'pottery'
  | 'cyber'
  | 'surf';

export type StorefrontCardStyle =
  | 'standard'
  | 'dark-tech'
  | 'luxury-serif'
  | 'clean-minimal'
  | 'bold-street'
  | 'organic-soft';

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
  cardStyle: StorefrontCardStyle;
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
    heroBadge: '🇱🇰 Sri Lankan Sellers Platform',
    heroHeadline1: 'Your Shop.',
    heroHeadline2: 'Your Customers.',
    heroHeadline3: 'Your Growth.',
    heroSubtitle: 'Discover amazing products from local sellers. Support small businesses across Sri Lanka. Shop with confidence.',
    heroCta: 'Shop Now →',
    heroImage: heroBagImg,
    floatingBadge: 'Local Sellers Big Dreams ✨',
    announcementText: '✨ Free Islandwide Delivery on Orders Over Rs. 5,000 | Cash on Delivery Available',
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
    heroHeadline3: 'Tropical Living.',
    heroSubtitle: 'Handcrafted breathable linen apparel tailored for the modern tropical lifestyle. Pure comfort, timeless style.',
    heroCta: 'Explore Collection →',
    heroImage: linenHeroImg,
    floatingBadge: 'Handcrafted Linen 100% ✨',
    announcementText: '🌿 Complimentary Gift Packaging on all luxury linen orders this week',
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
    floatingBadge: '1-Year Islandwide Warranty ✨',
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
    thumbnail: catBeautyImg,
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
    floatingBadge: 'Vegan & Cruelty Free ✨',
    announcementText: '🌸 Free Deluxe Mini Radiance Serum with every order over Rs. 4,500',
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
    floatingBadge: 'Only 150 Made ✨',
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
    thumbnail: themeNatureImg,
    colors: ['#15803D', '#166534', '#ECFDF5'],
    primaryColor: '#15803D',
    fontFamily: 'sans',
    borderRadius: 'rounded-3xl',
    cardStyle: 'organic-soft',
    heroBadge: '🌿 100% ECO-FRIENDLY & LOCAL',
    heroHeadline1: 'Nurture Your Home',
    heroHeadline2: 'With Living Green',
    heroHeadline3: 'Vibes.',
    heroSubtitle: 'Hand-potted indoor plants, organic micro-herbs, and sustainable biodegradable planters for a calmer, cleaner home.',
    heroCta: 'Bring Nature Home →',
    heroImage: prodPlantImg,
    floatingBadge: 'We Plant 1 Tree Per Order ✨',
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
    floatingBadge: 'Architectural Simplicity ✨',
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
    heroBadge: '🛡️ GENUINE HANDCRAFTED HERITAGE',
    heroHeadline1: 'Built to Last.',
    heroHeadline2: 'Hand-Stitched With',
    heroHeadline3: 'Master Pride.',
    heroSubtitle: 'Full-grain vegetable tanned leather goods, solid teak accents, and timeless heritage artifacts built to outlive generations.',
    heroCta: 'Explore Heritage →',
    heroImage: heroBagImg,
    floatingBadge: 'Lifetime Craftsmanship Guarantee ✨',
    announcementText: '🛡️ Free custom monogram initials on all handcrafted leather goods this month',
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
  spices: {
    id: 'spices',
    name: 'Ceylon Spices & Tea Heritage',
    category: 'Artisanal Food & Pantry',
    subtitle: 'Warm cinnamon tones, single-origin teas and harvest freshness',
    thumbnail: ceylonSpicesImg,
    colors: ['#047857', '#92400E', '#FEF3C7'],
    primaryColor: '#047857',
    fontFamily: 'serif',
    borderRadius: 'rounded-2xl',
    cardStyle: 'organic-soft',
    heroBadge: '🌿 100% PURE CEYLON SINGLE-ORIGIN',
    heroHeadline1: 'Authentic Spices',
    heroHeadline2: 'Handpicked From',
    heroHeadline3: 'Ceylon Soil.',
    heroSubtitle: 'Directly sourced pure Ceylon Alba cinnamon, artisan high-grown black teas, and organic sun-dried whole spices from multigenerational estate growers.',
    heroCta: 'Explore Pantry Spices →',
    heroImage: ceylonSpicesImg,
    floatingBadge: 'Lion Logo Standard Guaranteed ✨',
    announcementText: '🌿 Farm-to-Table Freshness | Free islandwide shipping on all tea & spice packs over Rs. 3,500',
    announcementLinkText: 'Shop Spices →',
    announcementBg: '#047857',
    promoBanner1Tag: 'Single-Estate Harvest',
    promoBanner1Title: 'High-elevation Ceylon silver tips & artisanal whole black pepper.',
    promoBanner1Cta: 'View Harvest →',
    promoBanner2Tag: 'Artisanal Wellness',
    promoBanner2Title: 'Pure Ceylon wild bee honey, turmeric elixirs & herbal infusions',
    promoBanner2Cta: 'Shop Wellness →',
    footerDescription: 'Preserving the heritage of world-renowned Ceylon spices and single-estate teas with ethical direct-trade grower partnerships.',
  },
  jewelry: {
    id: 'jewelry',
    name: 'Royal Ceylon Gems & Fine Jewelry',
    category: 'Luxury Jewelry & Gems',
    subtitle: 'Midnight sapphire navy, 18K solid gold and lab-certified brilliance',
    thumbnail: catBeautyImg,
    colors: ['#2563EB', '#D97706', '#0F172A'],
    primaryColor: '#2563EB',
    fontFamily: 'serif',
    borderRadius: 'rounded-2xl',
    cardStyle: 'luxury-serif',
    heroBadge: '💎 GEMMOLOGICAL CERTIFICATE INCLUDED',
    heroHeadline1: 'Untamed Radiance.',
    heroHeadline2: 'Handcrafted Fine',
    heroHeadline3: 'Ceylon Gems.',
    heroSubtitle: 'Natural unheated Ceylon Blue Sapphires, ethically mined Padparadscha gems, and bespoke 18K solid gold heirlooms crafted by master Sri Lankan lapidarists.',
    heroCta: 'Explore Gem Collection →',
    heroImage: catBeautyImg,
    floatingBadge: '100% Natural Unheated Sapphires ✨',
    announcementText: '💎 Complimentary Insured Islandwide Courier on all Fine Jewelry & Gemstone orders',
    announcementLinkText: 'View Heirlooms →',
    announcementBg: '#0F172A',
    promoBanner1Tag: 'Ratnapura Sapphire Mines',
    promoBanner1Title: 'Directly sourced unheated royal blue and cornflower Ceylon sapphires.',
    promoBanner1Cta: 'Discover Sapphires →',
    promoBanner2Tag: 'Bespoke Bridal',
    promoBanner2Title: 'Custom 18K rose gold solitaire rings, moonstone drops & diamond bands',
    promoBanner2Cta: 'Book Consultation →',
    footerDescription: 'Celebrated worldwide for timeless gemstone artistry, ethically sourced Ceylon sapphires, and master handcrafted jewelry.',
  },
  pottery: {
    id: 'pottery',
    name: 'Artisan Pottery & Clay Atelier',
    category: 'Handcrafted Living & Ceramics',
    subtitle: 'Warm terracotta clay, wheel-turned ceramics and raw glaze textures',
    thumbnail: catCraftImg,
    colors: ['#C2410C', '#78350F', '#FFF7ED'],
    primaryColor: '#C2410C',
    fontFamily: 'serif',
    borderRadius: 'rounded-2xl',
    cardStyle: 'organic-soft',
    heroBadge: '🏺 WHEEL-TURNED BY LOCAL POTTERS',
    heroHeadline1: 'Raw Earth.',
    heroHeadline2: 'Molded By Hand,',
    heroHeadline3: 'Fired With Soul.',
    heroSubtitle: 'Wheel-thrown terracotta amphoras, glazed ceramic tableware, and sculpted stoneware accents celebrating centuries of traditional Sri Lankan pottery traditions.',
    heroCta: 'View Ceramic Atelier →',
    heroImage: catCraftImg,
    floatingBadge: '100% Biodegradable Ceylon Clay ✨',
    announcementText: '🏺 Fragile-Care Protected Delivery | Free handcrafted terracotta coaster set with every order over Rs. 4,000',
    announcementLinkText: 'Claim Gift →',
    announcementBg: '#C2410C',
    promoBanner1Tag: 'Wood-Fired Kiln Batch',
    promoBanner1Title: 'Unique smoke-glazed stoneware planters and artisan bowls.',
    promoBanner1Cta: 'Explore Batch →',
    promoBanner2Tag: 'Tableware & Living',
    promoBanner2Title: 'Hand-thrown terracotta water carafes, coffee drippers & decorative urns',
    promoBanner2Cta: 'Shop Tableware →',
    footerDescription: 'Honoring ancient Sri Lankan clay sculpting techniques with contemporary functional ceramics designed for soulful everyday living.',
  },
  cyber: {
    id: 'cyber',
    name: 'Tokyo Neon Cyber Arcade',
    category: 'Gaming, Peripherals & RGB',
    subtitle: 'Electric neon violet, cyber matrix accents and mechanical audio',
    thumbnail: catTechImg,
    colors: ['#A855F7', '#06B6D4', '#0F172A'],
    primaryColor: '#A855F7',
    fontFamily: 'mono',
    borderRadius: 'rounded-xl',
    cardStyle: 'dark-tech',
    heroBadge: '⚡ // OVERCLOCKED ESPORTS GEAR //',
    heroHeadline1: 'RGB SYNCHRONIZED.',
    heroHeadline2: 'PRO PERFORMANCE,',
    heroHeadline3: 'ZERO LATENCY.',
    heroSubtitle: 'Hot-swap custom mechanical keydecks, low-latency 2.4G spatial gaming audio, and competition-ready gaming gear with full local warranty.',
    heroCta: 'Upgrade Battlestation →',
    heroImage: catTechImg,
    floatingBadge: 'Esports Tournament Certified ✨',
    announcementText: '⚡ NEXT-GEN DROP: 1,000Hz Polling Rate Wireless Mice & Cyber ANC Headsets In Stock',
    announcementLinkText: 'Check Specs →',
    announcementBg: '#090714',
    promoBanner1Tag: 'Mechanical Keyboards',
    promoBanner1Title: 'Lubed switches, sound-dampened gasket mounts & PBT dye-sub keycaps.',
    promoBanner1Cta: 'View Keydecks →',
    promoBanner2Tag: 'Battlestation Setup',
    promoBanner2Title: 'Magnetic charging docks, monitor lightbars & ambient soundbars',
    promoBanner2Cta: 'Shop Accessories →',
    footerDescription: 'Engineered for dedicated gamers and creators. Ultimate performance, tactile precision, and cyberpunk aesthetics.',
  },
  surf: {
    id: 'surf',
    name: 'Tropical Island & Coastal Resort',
    category: 'Beachwear, Swim & Coastal',
    subtitle: 'Ocean seafoam turquoise, coral warmth and sun-drenched coastal vibes',
    thumbnail: surfLifestyleImg,
    colors: ['#0D9488', '#F97316', '#F0FDFA'],
    primaryColor: '#0D9488',
    fontFamily: 'sans',
    borderRadius: 'rounded-2xl',
    cardStyle: 'standard',
    heroBadge: '🌊 TROPICAL ISLAND LIVING & SURF',
    heroHeadline1: 'Endless Summer.',
    heroHeadline2: 'Breezy Beachwear &',
    heroHeadline3: 'Coastal Living.',
    heroSubtitle: 'Hand-tailored quick-dry boardshorts, mineral reef-safe suncare, and coastal lifestyle accessories inspired by the warm waves of Arugam Bay and Mirissa.',
    heroCta: 'Explore Coastal Gear →',
    heroImage: surfLifestyleImg,
    floatingBadge: 'Handcrafted in Coastal Ceylon ✨',
    announcementText: '🌊 Free Waterproof Dry Bag with every tropical boardshort order over Rs. 6,000',
    announcementLinkText: 'View Surf Drops →',
    announcementBg: '#0D9488',
    promoBanner1Tag: 'Southern Coastline',
    promoBanner1Title: 'Breathable tropical resort wear and sun-protecting swim layers.',
    promoBanner1Cta: 'View Boardshorts →',
    promoBanner2Tag: 'Reef-Safe Suncare',
    promoBanner2Title: 'Non-nano zinc oxide sunscreens, organic aloe lotions & coconut balms',
    promoBanner2Cta: 'Shop Suncare →',
    footerDescription: 'Celebrating the sun, sea, and tropical surf lifestyle of Sri Lanka with sustainable coastal apparel and ocean-friendly suncare.',
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
    cardStyle?: StorefrontCardStyle;
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
    copyrightText: '© 2026 Kadeo Commerce. All rights reserved. Sri Lanka.',
    supportEmail: 'support@kadeo.lk',
    phone: '+94 77 123 4567',
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
    if (typeof window === 'undefined') {
      return DEFAULT_KAVEE_CONFIG;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('kadeo_config_updated', { detail: DEFAULT_KAVEE_CONFIG }));
    } catch (e) {
      console.error('Failed to reset kavee config', e);
    }
    return DEFAULT_KAVEE_CONFIG;
  },
};
