export type UserRole = 'seller' | 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended';
  shopId?: string;
  avatar?: string;
  createdAt: string;
}

export type StorefrontThemeId = 'minimal' | 'beauty' | 'modern';

export interface ShopContact {
  email: string;
  address: string;
  city: string;
  instagram?: string;
  deliveryCoverage?: string;
}

export interface HeroTrustBadge {
  title: string;
  subtitle: string;
  icon?: 'leaf' | 'truck' | 'shield' | 'heart' | 'sparkles';
}

export interface HeroBannerConfig {
  showHeroBanner?: boolean;
  welcomeBadge?: string;
  showWelcomeBadge?: boolean;
  headlineMain?: string;
  headlineHighlight?: string;
  showHeadline?: boolean;
  description?: string;
  showDescription?: boolean;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  showCtaButtons?: boolean;
  backgroundImage?: string;
  backgroundColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  alignment?: 'left' | 'center' | 'right';
  topPadding?: number;
  bottomPadding?: number;
  spotlightImage?: string;
  showSpotlightImage?: boolean;
  trustBadge1?: HeroTrustBadge;
  trustBadge2?: HeroTrustBadge;
  trustBadge3?: HeroTrustBadge;
  showTrustBadges?: boolean;
}

export interface AnnouncementBarConfig {
  show?: boolean;
  text?: string;
  linkText?: string;
  linkUrl?: string;
  bgColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  topPadding?: number;
  bottomPadding?: number;
}

export interface HeaderConfig {
  showHeader?: boolean;
  tagline?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showTrackOrder?: boolean;
  bgColor?: string;
  sticky?: boolean;
}

export interface CategoriesSectionConfig {
  show?: boolean;
  title?: string;
  subtitle?: string;
  columns?: number;
  bgColor?: string;
  topPadding?: number;
  bottomPadding?: number;
}

export interface AboutSectionConfig {
  show?: boolean;
  badgeTitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  showContactBadges?: boolean;
  bgColor?: string;
  topPadding?: number;
  bottomPadding?: number;
}

export interface FooterConfig {
  showFooter?: boolean;
  aboutText?: string;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  showNewsletter?: boolean;
  showSocials?: boolean;
  bgColor?: string;
  textColor?: string;
  copyrightText?: string;
}

export interface ProductsSectionConfig {
  show?: boolean;
  title?: string;
  subtitle?: string;
  columns?: number;
}

export interface ShopCustomization {
  announcement?: AnnouncementBarConfig;
  header?: HeaderConfig;
  categories?: CategoriesSectionConfig;
  products?: ProductsSectionConfig;
  about?: AboutSectionConfig;
  footer?: FooterConfig;
  brandColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  buttonShape?: 'pill' | 'rounded' | 'sharp';
  sectionOrder?: string[];
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  coverVideo?: string;
  coverMediaType?: 'image' | 'video';
  whatsappNumber: string; // e.g. "94771234567" for wa.me API
  displayPhone: string; // e.g. "+94 77 123 4567"
  contactDetails: ShopContact;
  themeId: StorefrontThemeId;
  heroBanner?: HeroBannerConfig;
  customization?: ShopCustomization;
  status: 'active' | 'suspended';
  createdAt: string;
  subscriptionPlanId: 'free' | 'starter' | 'pro';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in LKR
  originalPrice?: number; // original price for discounts
  sku: string;
  stockQuantity: number;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
  imageSnapshot: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderCode: string; // e.g. "KAD-7X29P"
  shopId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerCity: string;
  customerNote?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: 'cod' | 'bank' | 'card';
  paymentSlipUrl?: string;
  paymentSlipUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'starter' | 'pro';
  name: string;
  monthlyPrice: number; // in LKR
  productLimit: number;
  imagesPerProductLimit: number;
  availableThemes: StorefrontThemeId[];
  features: string[];
  recommended?: boolean;
}

export interface CartItem {
  product: Product;
  shop: Shop;
  quantity: number;
}
