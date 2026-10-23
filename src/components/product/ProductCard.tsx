import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, MessageCircle, Heart, Sparkles } from 'lucide-react';
import { Product, Shop } from '../../types';
import { StorageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  shop?: Shop;
  categoryName?: string;
  themeStyle?: 'minimal' | 'beauty' | 'modern' | 'dark';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  shop: propShop,
  categoryName,
  themeStyle,
}) => {
  const { addItem } = useCart();
  const shop = propShop || StorageService.getShopById(product.shopId);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const isDark = themeStyle === 'dark';

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (shop && !isOutOfStock) {
      addItem(product, shop, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    }
  };

  const productUrl = shop
    ? `/shop/${shop.slug}/product/${product.slug}`
    : `/search?q=${encodeURIComponent(product.name)}`;
  const hasSecondaryImage = product.images && product.images.length > 1;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'border-white/10 bg-[#121215] hover:border-emerald-400/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]'
          : 'border-[#E4E4E7] bg-white hover:border-[#111113] hover:shadow-luxury-md'
      }`}
    >
      {/* Product Image Stage (4:5 Editorial Ratio) */}
      <Link
        to={productUrl}
        className={`relative aspect-[4/5] w-full overflow-hidden block focus-visible:outline-none ${
          isDark ? 'bg-[#18181D]' : 'bg-[#F4F4F2]'
        }`}
      >
        {/* Primary Image */}
        <img
          src={
            product.images[0] ||
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out ${
            hasSecondaryImage && isHovered
              ? 'opacity-0 scale-105'
              : 'opacity-100 group-hover:scale-[1.04]'
          }`}
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Secondary Image for smooth lookbook reveal */}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0'
            }`}
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80';
            }}
          />
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30 shadow-xs">
              <Sparkles className="h-2.5 w-2.5 text-emerald-300" />
              <span>Curated</span>
            </span>
          )}

          {isLowStock && !isOutOfStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
              <span>Only {product.stockQuantity} Left</span>
            </span>
          )}
        </div>

        {/* Out of Stock Backdrop */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-[4px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add floating pill on hover */}
        {!isOutOfStock && shop && (
          <div className="absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to bag`}
              className={`w-full min-h-[42px] flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-semibold shadow-luxury-md transition-all duration-200 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-500 text-black font-bold'
                  : isDark
                  ? 'bg-white text-[#0F0F11] hover:bg-neutral-200 active:scale-[0.98]'
                  : 'bg-[#0F0F11]/95 backdrop-blur-md text-white hover:bg-black active:scale-[0.98]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Quick Add to Bag</span>
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Card Body & Details */}
      <div className={`flex flex-1 flex-col p-4.5 ${isDark ? 'bg-[#121215]' : 'bg-white'}`}>
        {/* Boutique Origin & Category */}
        <div className="flex items-center justify-between text-[11px]">
          {shop && (
            <Link
              to={`/shop/${shop.slug}`}
              className={`font-medium transition-colors truncate max-w-[140px] ${
                isDark ? 'text-white/50 hover:text-emerald-300' : 'text-[#71717A] hover:text-[#0F0F11]'
              }`}
            >
              {shop.name}
            </Link>
          )}

          {categoryName && (
            <span
              className={`text-[10px] uppercase tracking-wider truncate ${
                isDark ? 'text-white/35 font-mono' : 'text-[#A1A1AA]'
              }`}
            >
              {categoryName}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3
          className={`mt-1.5 text-[13px] font-semibold line-clamp-2 leading-snug tracking-tight ${
            isDark ? 'text-white' : 'text-[#0F0F11]'
          }`}
        >
          <Link
            to={productUrl}
            className={`transition-colors ${isDark ? 'hover:text-emerald-300' : 'hover:text-[#52525B]'}`}
          >
            {product.name}
          </Link>
        </h3>

        {/* Bottom Price Bar */}
        <div
          className={`mt-auto pt-3 flex items-baseline justify-between border-t ${
            isDark ? 'border-white/10' : 'border-[#F4F4F5]'
          }`}
        >
          <div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider block ${
                isDark ? 'text-white/40' : 'text-[#71717A]'
              }`}
            >
              Direct Price
            </span>
            <span
              className={`text-sm font-extrabold tabular-nums tracking-tight ${
                isDark ? 'text-white' : 'text-[#0F0F11]'
              }`}
            >
              {StorageService.formatLKR(product.price)}
            </span>
          </div>

          <Link
            to={productUrl}
            className={`text-[11px] font-semibold transition-colors group-hover:underline underline-offset-2 ${
              isDark ? 'text-emerald-400/90 hover:text-emerald-300' : 'text-[#71717A] hover:text-[#0F0F11]'
            }`}
          >
            Details →
          </Link>
        </div>

        {/* Mobile & Desktop Direct Add to Cart Button matching Mockup */}
        {!isOutOfStock && shop && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="mt-2.5 w-full rounded-xl bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Added to Cart</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
