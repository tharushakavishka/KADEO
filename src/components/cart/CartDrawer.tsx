import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { StorageService } from '../../services/storageService';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, removeItem, updateQuantity, subtotal, itemsByShop } = useCart();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const shopIds = Object.keys(itemsByShop);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-heading"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F0F11]/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-luxury-xl flex flex-col anim-slide-right">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E4E7] bg-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F0F11] text-white">
                <ShoppingBag className="h-4 w-4 stroke-[2]" />
              </div>
              <div>
                <h2 id="cart-drawer-heading" className="text-base font-extrabold text-[#0F0F11]">Your Shopping Bag</h2>
                <span className="text-[11px] text-[#71717A] font-medium">
                  {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#71717A] hover:text-[#0F0F11] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Delivery Note */}
          {items.length > 0 && (
            <div className="bg-[#F7F6F2] px-6 py-2.5 border-b border-[#E4E4E7] flex items-center justify-between text-[11px] text-[#71717A]">
              <span className="flex items-center gap-1.5 font-medium text-[#0F0F11]">
                <Truck className="h-3.5 w-3.5 text-emerald-600" />
                Islandwide Courier Delivery (1-3 Days)
              </span>
              <span className="font-semibold text-emerald-700">Cash on Delivery</span>
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F4F4F5] text-[#71717A]">
                  <ShoppingBag className="h-10 w-10 stroke-[1.25]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F0F11]">Your bag is empty</h3>
                  <p className="mt-1.5 text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
                    Discover handcrafted linen, Ayurvedic skincare, and curated essentials from independent Sri Lankan creators.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/search');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0F0F11] px-6 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-luxury-xs cursor-pointer"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {shopIds.map(shopId => {
                  const shopGroup = itemsByShop[shopId];
                  return (
                    <div key={shopId} className="rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-luxury-xs space-y-4">
                      {/* Shop Header */}
                      <div className="flex items-center justify-between border-b border-[#F4F4F5] pb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={shopGroup.shop.logo}
                            alt={shopGroup.shop.name}
                            className="h-6 w-6 rounded-full object-cover border border-[#E4E4E7]"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <span className="font-bold text-[#0F0F11] block leading-tight">
                              {shopGroup.shop.name}
                            </span>
                            <span className="text-[10px] text-[#71717A]">
                              {shopGroup.shop.contactDetails.city}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/shop/${shopGroup.shop.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-[11px] font-semibold text-[#71717A] hover:text-[#0F0F11] underline underline-offset-2"
                        >
                          Visit Store
                        </Link>
                      </div>

                      {/* Items */}
                      <div className="space-y-4 divide-y divide-[#F4F4F5]">
                        {shopGroup.items.map(item => (
                          <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3.5">
                            <img
                              src={item.product.images[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="h-20 w-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-[#E4E4E7]"
                            />
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="text-xs font-semibold text-[#0F0F11] line-clamp-2 leading-snug">
                                  {item.product.name}
                                </h4>
                                <p className="mt-1 text-xs font-extrabold text-[#0F0F11] tabular-nums">
                                  {StorageService.formatLKR(item.product.price)}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                {/* Quantity stepper */}
                                <div className="flex items-center border border-[#E4E4E7] rounded-full bg-[#F7F6F2] p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-1 rounded-full text-[#71717A] hover:text-[#0F0F11] hover:bg-white transition-colors cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="px-2.5 text-xs font-bold tabular-nums text-[#0F0F11]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.product.stockQuantity}
                                    className="p-1 rounded-full text-[#71717A] hover:text-[#0F0F11] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item.product.id)}
                                  className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Store subtotal */}
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F4F4F5]">
                        <span className="text-[#71717A]">Shop Subtotal</span>
                        <span className="font-extrabold text-[#0F0F11] tabular-nums">
                          {StorageService.formatLKR(shopGroup.subtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Checkout Actions */}
          {items.length > 0 && (
            <div className="border-t border-[#E4E4E7] bg-white p-6 space-y-4 shadow-luxury-md">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#0F0F11] tabular-nums">
                    {StorageService.formatLKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Courier Delivery</span>
                  <span className="text-emerald-700 font-semibold">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0F0F11] pt-2 border-t border-[#E4E4E7]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">{StorageService.formatLKR(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0F0F11] py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-sm hover:bg-black transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center">
                  <span className="text-[11px] text-[#71717A] flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Direct WhatsApp order confirmation with seller</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
