import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/product/ProductCard';
import { setActiveStorefrontSlug } from '../../hooks/useActiveStorefront';
import {
  MessageCircle,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  Sparkles,
  Share2,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { addItem, setIsCartOpen } = useCart();

  const { product, shop } = StorageService.getProductBySlug(slug || '', productSlug || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (shop?.slug) {
      setActiveStorefrontSlug(shop.slug);
    }
  }, [shop?.slug]);

  if (!shop || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-[#0F0F11]">Product Not Found</h1>
        <p className="mt-2 text-xs text-[#71717A] max-w-sm">
          The requested product could not be found under this seller's shop.
        </p>
        <Link
          to={shop ? `/shop/${shop.slug}` : '/'}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0F0F11] px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-luxury-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{shop ? `Return to ${shop.name}` : 'Return to Marketplace'}</span>
        </Link>
      </div>
    );
  }

  const category = StorageService.getCategories().find(c => c.id === product.categoryId);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;

  // More products from this shop
  const otherShopProducts = StorageService.getProductsByShop(shop.id)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addItem(product, shop, quantity);
    if (ok) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
      setIsCartOpen(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappInquiryUrl = `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${shop.name}! I would like to order "${product.name}" (Price: ${StorageService.formatLKR(
      product.price
    )}, SKU: ${product.sku}) on Kadeo (${window.location.href}). Is this available for delivery?`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Editorial Breadcrumb Bar */}
      <div className="border-b border-[#E4E4E7] bg-white py-3.5 text-xs text-[#71717A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#0F0F11] transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <Link to={`/shop/${shop.slug}`} className="hover:text-[#0F0F11] font-semibold transition-colors">
              {shop.name}
            </Link>
            <span>/</span>
            <span className="text-[#0F0F11] font-medium truncate max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#71717A] hover:text-[#0F0F11] transition-colors cursor-pointer"
          >
            <Share2 className="h-3 w-3" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Gallery Col (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-luxury-md">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-all duration-500"
              />

              {product.featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0F0F11]/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-xs">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Curated Selection</span>
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Selector */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#0F0F11] shadow-luxury-xs opacity-100 scale-[1.02]'
                        : 'border-[#E4E4E7] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Value Badges Under Gallery */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E4E4E7] text-center text-xs text-[#71717A]">
              <div className="p-3 bg-white rounded-xl border border-[#E4E4E7] shadow-luxury-xs">
                <Truck className="h-4 w-4 mx-auto text-[#0F0F11] mb-1" />
                <span className="font-semibold text-[#0F0F11] block text-[11px]">Islandwide Dispatch</span>
                <span className="text-[10px]">1-3 Business Days</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E4E4E7] shadow-luxury-xs">
                <ShieldCheck className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                <span className="font-semibold text-[#0F0F11] block text-[11px]">Direct Atelier Price</span>
                <span className="text-[10px]">Zero markup</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E4E4E7] shadow-luxury-xs">
                <MessageCircle className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                <span className="font-semibold text-[#0F0F11] block text-[11px]">WhatsApp Verified</span>
                <span className="text-[10px]">Instant chat with maker</span>
              </div>
            </div>
          </div>

          {/* Product Purchase & Details Col (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              {/* Category & Shop Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-[#71717A] mb-2">
                <Link
                  to={`/shop/${shop.slug}`}
                  className="font-bold text-[#0F0F11] hover:underline"
                >
                  {shop.name}
                </Link>
                {category && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium">{category.name}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-[#A1A1AA]">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F0F11] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Pill Tag matching Screen 3 */}
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-400">{'★'.repeat(5)}</div>
                  <span className="text-neutral-500 font-medium">(124)</span>
                </div>
                {!isOutOfStock && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] px-2.5 py-0.5 text-[11px] font-bold text-[#10B981]">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                    <span>In Stock</span>
                  </span>
                )}
              </div>

              {/* Price with strikethrough & discount pill */}
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-[#0F0F11] tabular-nums tracking-tight">
                  {StorageService.formatLKR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through">
                    {StorageService.formatLKR(product.originalPrice)}
                  </span>
                )}
                <span className="rounded-full bg-[#EAF7EE] px-2 py-0.5 text-[11px] font-bold text-[#10B981]">
                  {product.originalPrice
                    ? `-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                    : '-20%'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                {product.description ||
                  'Lightweight and hydrating cream that keeps your skin soft, smooth and healthy. Perfect for daily use.'}
              </p>
            </div>

            {/* Feature Checklist matching Screen 3 */}
            <div className="space-y-1.5 py-1 text-xs text-neutral-700">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Provides 24h hydration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Non-greasy formula</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#EAF7EE] flex items-center justify-center text-[#10B981] shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>Suitable for all skin types</span>
              </div>
            </div>

            {/* Purchase & WhatsApp Actions */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#0F0F11]">Quantity</span>
                  <div className="flex items-center border border-neutral-200 rounded-full bg-white p-0.5 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-neutral-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                      className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Primary Add to Cart (Solid Green matching Screen 3) */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-3.5 px-6 text-xs sm:text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{addedSuccess ? 'Added to Bag!' : 'Add to Cart'}</span>
                  </button>

                  {/* Secondary WhatsApp Direct CTA */}
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-50/50 py-3 px-6 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/60 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Storefront Atelier Card */}
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-luxury-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    referrerPolicy="no-referrer"
                    className="h-11 w-11 rounded-xl object-cover border border-[#E4E4E7] bg-white"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0F0F11]">{shop.name}</h4>
                    <p className="text-xs text-[#71717A] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{shop.contactDetails.city}</span>
                    </p>
                  </div>
                </div>
                <Link
                  to={`/shop/${shop.slug}`}
                  className="rounded-full border border-[#E4E4E7] bg-[#FAFAF9] px-3.5 py-1.5 text-xs font-semibold text-[#0F0F11] hover:bg-white hover:border-[#0F0F11] transition-all"
                >
                  Visit Atelier
                </Link>
              </div>

              <div className="pt-3 border-t border-[#F4F4F5] text-xs text-[#71717A] space-y-1.5">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{shop.contactDetails.deliveryCoverage || 'Islandwide Delivery (1-3 Business Days)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Direct phone: {shop.displayPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More From This Shop Section */}
        {otherShopProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E4E4E7]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                  From {shop.name}
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F0F11] mt-1">
                  More Pieces by This Atelier
                </h2>
              </div>
              <Link
                to={`/shop/${shop.slug}`}
                className="text-xs font-bold text-[#0F0F11] hover:underline"
              >
                View Full Collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {otherShopProducts.map(p => (
                <ProductCard key={p.id} product={p} shop={shop} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
