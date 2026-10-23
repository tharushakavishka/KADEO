import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { StorageService } from '../../services/storageService';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotal, itemsByShop, clearCart } = useCart();
  const navigate = useNavigate();

  const shopIds = Object.keys(itemsByShop);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#71717A] mb-4">
          <ShoppingBag className="h-10 w-10 stroke-[1.25]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F0F11]">Your bag is empty</h1>
        <p className="mt-2 text-xs text-[#71717A] max-w-sm">
          You haven't added any handcrafted goods to your bag yet. Explore Sri Lankan boutiques on Kadeo.
        </p>
        <Link
          to="/search"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0F0F11] px-6 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-luxury-xs"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#0F0F11]">
      {/* Header matching Screen 4: Your Cart */}
      <div className="border-b border-neutral-100 bg-white py-4 px-4 sticky top-16 z-20 shadow-2xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-xl font-bold text-neutral-900">
              Your Cart
            </h1>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items List Col (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {shopIds.map(shopId => {
              const group = itemsByShop[shopId];
              return (
                <div
                  key={shopId}
                  className="rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-luxury-xs space-y-5"
                >
                  {/* Shop header */}
                  <div className="flex items-center justify-between border-b border-[#F4F4F5] pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={group.shop.logo}
                        alt={group.shop.name}
                        className="h-8 w-8 rounded-lg object-cover border border-[#E4E4E7]"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <h2 className="text-sm font-extrabold text-[#0F0F11]">
                          {group.shop.name}
                        </h2>
                        <p className="text-xs text-[#71717A]">
                          Fulfilled from {group.shop.contactDetails.city}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/shop/${group.shop.slug}`}
                      className="text-xs font-semibold text-[#71717A] hover:text-[#0F0F11] underline"
                    >
                      Visit Boutique
                    </Link>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#F4F4F5]">
                    {group.items.map(item => (
                      <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="h-20 w-20 rounded-xl object-cover bg-neutral-100 border border-[#E4E4E7] shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between gap-3">
                            <div>
                              <h3 className="text-xs font-bold text-[#0F0F11]">
                                {item.product.name}
                              </h3>
                              <p className="text-[11px] font-mono text-[#A1A1AA]">
                                SKU: {item.product.sku}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-[#0F0F11] tabular-nums">
                              {StorageService.formatLKR(item.product.price * item.quantity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3">
                            <div className="flex items-center border border-[#E4E4E7] rounded-full bg-[#FAFAF9] p-0.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 rounded-full text-[#71717A] hover:text-[#0F0F11] hover:bg-white cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 text-xs font-bold tabular-nums text-[#0F0F11]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stockQuantity}
                                className="p-1 rounded-full text-[#71717A] hover:text-[#0F0F11] hover:bg-white disabled:opacity-30 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-xs font-medium text-[#71717A] hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#F4F4F5] pt-3 flex justify-between text-xs text-[#71717A]">
                    <span>Boutique Subtotal</span>
                    <span className="font-extrabold text-[#0F0F11] tabular-nums">
                      {StorageService.formatLKR(group.subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F0F11] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Continue browsing marketplace</span>
              </Link>
            </div>
          </div>

          {/* Summary Col (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-luxury-md space-y-5 sticky top-24">
              <h3 className="text-xs font-bold text-[#0F0F11] uppercase tracking-wider border-b border-[#F4F4F5] pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#0F0F11] tabular-nums">
                    {StorageService.formatLKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-neutral-400" />
                    Delivery
                  </span>
                  <span className="font-semibold text-[#0F0F11]">
                    Rs. 350
                  </span>
                </div>
                <div className="border-t border-[#E4E4E7] pt-3 flex justify-between text-base font-black text-[#0F0F11]">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {StorageService.formatLKR(subtotal + 350)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] py-4 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-xs text-emerald-950 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>How Direct WhatsApp Order Works:</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Kadeo generates a verified order reference and sends your order straight to the merchant's WhatsApp. You can coordinate Cash on Delivery (COD) or Direct Bank Transfer safely without gateway card fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
