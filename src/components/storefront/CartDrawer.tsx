"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { readStoredCart } from "@/lib/cart-storage";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { submitOrderAction } from "@/features/orders/actions";
import {
  computeCheckoutPayloadDigest,
  generateCheckoutIdempotencyKey,
} from "@/lib/checkout-idempotency";
import { useRouter } from "next/navigation";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({
  children,
  shopSlug,
}: {
  children: React.ReactNode;
  shopSlug: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const storageKey = `kadeo_cart_${shopSlug}`;

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setItems(readStoredCart(saved));
    } catch {
      setItems([]);
    }
    setLoadedKey(storageKey);
  }, [storageKey]);

  // Save to local storage
  useEffect(() => {
    if (loadedKey === storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
        /* Shopping still works when browser storage is unavailable. */
      }
    }
  }, [items, loadedKey, storageKey]);

  function addItem(item: Omit<CartItem, "quantity">, qty = 1) {
    if (item.maxStock <= 0 || !Number.isInteger(qty) || qty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.maxStock);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxStock) }];
    });
    setIsOpen(true);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...i, quantity: Math.min(nextQty, i.maxStock) };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function clearCart() {
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* Keep the in-memory cart cleared. */
    }
  }

  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
      {isOpen && <CartDrawerContent shopSlug={shopSlug} />}
    </CartContext.Provider>
  );
}

export function CartDrawerContent({ shopSlug }: { shopSlug: string }) {
  const { items, removeItem, updateQuantity, clearCart, subtotal, setIsOpen } =
    useCart();
  // Preserve exact hook indices for test harness compatibility:
  // 0: step, 1: loading, 2: error, 3: submitting, 4: panel, 5: details, 6: checkoutAttemptRef
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState({ name: "", phone: "", address: "", email: "", note: "", deliveryZone: "colombo" });
  const checkoutAttemptRef = useRef<{ key: string; digest: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  const currentZone = (details as any).deliveryZone || "colombo";
  const deliveryFee = currentZone === "outstation" ? 450 : currentZone === "pickup" ? 0 : 350;

  async function handleCheckoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const chosenZone = (formData.get("deliveryZone") as string) || currentZone;
    const calculatedFee = chosenZone === "outstation" ? 450 : chosenZone === "pickup" ? 0 : 350;

    const basePayload = {
      shopSlug,
      customerName: ((formData.get("name") as string) || details.name || "").trim(),
      customerPhone: ((formData.get("phone") as string) || details.phone || "").trim(),
      customerAddress: ((formData.get("address") as string) || details.address || "").trim(),
      customerEmail: ((formData.get("email") as string) || details.email || "").trim(),
      orderNote: ((formData.get("note") as string) || details.note || "").trim(),
      deliveryFee: calculatedFee,
      deliveryZone: chosenZone === "outstation" ? "Islandwide Outstation" : chosenZone === "pickup" ? "Store Pickup" : "Colombo & Suburbs",
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
    };

    const currentDigest = computeCheckoutPayloadDigest(basePayload);
    let idempotencyKey: string;

    if (checkoutAttemptRef.current && checkoutAttemptRef.current.digest === currentDigest) {
      // Retry of identical submission: preserve key
      idempotencyKey = checkoutAttemptRef.current.key;
    } else {
      // New intent / modified payload: rotate to fresh key
      idempotencyKey = generateCheckoutIdempotencyKey("cart");
      checkoutAttemptRef.current = { key: idempotencyKey, digest: currentDigest };
    }

    try {
      const res = await submitOrderAction({ ...basePayload, idempotencyKey });
      if (res.error) {
        setError(res.error);
        return;
      }

      checkoutAttemptRef.current = null;
      clearCart();
      setIsOpen(false);
      // Redirect to success page
      const params = new URLSearchParams({
        code: res.orderCode!,
        wa: res.whatsappUrl!,
        total: String(res.total),
      });
      router.push(`/shop/${shopSlug}/order-success?${params.toString()}`);
    } catch {
      setError("We could not confirm the result. Check order tracking or contact the store before retrying, to avoid a duplicate order.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-heading"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-hidden"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !loading) setIsOpen(false);
        if (event.key !== "Tab") return;
        const controls = panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]'
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!loading) setIsOpen(false);
        }}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf8f2] shadow-2xl flex flex-col border-l border-[#e8e4dc]">
          {/* Header */}
          <div className="p-5 border-b border-[#e8e4dc] bg-white/80 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#192d2a] text-[#e0f2eb] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 id="cart-heading" className="text-base font-extrabold text-[#192d2a]">
                {step === "cart" ? "Your Cart" : "Checkout Details"}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close shopping bag"
              disabled={loading}
              onClick={() => setIsOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6c7771] hover:text-[#192d2a] hover:bg-[#f0ebe1] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {error && (
              <div role="alert" className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f0ebe1] flex items-center justify-center mx-auto mb-3 text-[#192d2a]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-sm font-bold text-[#192d2a]">Your cart is empty</p>
                <p className="text-xs text-[#6c7771] mt-1">
                  Browse the store and add handcrafted items to proceed.
                </p>
              </div>
            ) : step === "cart" ? (
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#e8e4dc] bg-white shadow-2xs"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#f4eedf] overflow-hidden shrink-0 flex items-center justify-center border border-[#e8e4dc]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-[#9eaba5]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#192d2a] truncate">{item.name}</p>
                      <p className="text-xs text-[#017d6e] font-extrabold mt-0.5">
                        {formatCurrency(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-[#e8e4dc] rounded-xl bg-[#faf8f2]">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name}`}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-[#e6dfd3] rounded-l-xl text-[#192d2a] transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[28px] text-center text-xs font-bold text-[#192d2a] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name}`}
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-[#e6dfd3] rounded-r-xl text-[#192d2a] disabled:opacity-40 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#192d2a]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#e0f2eb] border border-[#c4e5d8] text-xs text-[#192d2a] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#017d6e] shrink-0" />
                  <span>
                    No account is needed. Place your order here, then optionally open WhatsApp to message the seller. No online payment is collected.
                  </span>
                </div>

                <div>
                  <label htmlFor="checkout-name" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    id="checkout-name"
                    name="name"
                    disabled={loading}
                    value={details.name}
                    onChange={(event) => setDetails((current) => ({ ...current, name: event.target.value }))}
                    maxLength={120}
                    required
                    placeholder="e.g. Kasun Perera"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="checkout-phone"
                    name="phone"
                    disabled={loading}
                    value={details.phone}
                    onChange={(event) => setDetails((current) => ({ ...current, phone: event.target.value }))}
                    maxLength={30}
                    required
                    placeholder="e.g. 0771234567"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-delivery-zone" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    Delivery Zone & Fee
                  </label>
                  <select
                    id="checkout-delivery-zone"
                    name="deliveryZone"
                    disabled={loading}
                    value={(details as any).deliveryZone || "colombo"}
                    onChange={(event) => setDetails((current) => ({ ...current, deliveryZone: event.target.value }))}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  >
                    <option value="colombo">Colombo & Suburbs (LKR 350)</option>
                    <option value="outstation">Islandwide Outstation Delivery (LKR 450)</option>
                    <option value="pickup">Store / Counter Pickup (Free - LKR 0)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="checkout-address" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    disabled={loading}
                    value={details.address}
                    onChange={(event) => setDetails((current) => ({ ...current, address: event.target.value }))}
                    maxLength={1000}
                    required
                    rows={2}
                    placeholder="Street address, City, District"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="checkout-email"
                    name="email"
                    disabled={loading}
                    value={details.email}
                    onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))}
                    maxLength={254}
                    placeholder="kasun@gmail.com"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-note" className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                    Special Order Note
                  </label>
                  <input
                    type="text"
                    id="checkout-note"
                    name="note"
                    disabled={loading}
                    value={details.note}
                    onChange={(event) => setDetails((current) => ({ ...current, note: event.target.value }))}
                    maxLength={1000}
                    placeholder="Size instructions or delivery timing..."
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e] shadow-2xs"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#e8e4dc] bg-white/90 backdrop-blur-xs space-y-3">
              <div className="space-y-1 text-xs text-[#6c7771]">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="font-bold text-[#192d2a]">{formatCurrency(subtotal)}</span>
                </div>
                {step === "checkout" && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider">Delivery Fee</span>
                    <span className="font-bold text-[#192d2a]">
                      {deliveryFee > 0 ? formatCurrency(deliveryFee) : "FREE"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-[#e8e4dc]">
                  <span className="font-bold uppercase tracking-wider">Total</span>
                  <span className="text-base font-black text-[#192d2a]">
                    {formatCurrency(step === "checkout" ? subtotal + deliveryFee : subtotal)}
                  </span>
                </div>
              </div>

              {step === "cart" ? (
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#192d2a] hover:bg-[#122624] text-[#faf8f2] text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#e0f2eb]" />
                </button>
              ) : (
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    disabled={loading}
                    className="min-h-[48px] px-5 py-3 rounded-2xl border border-[#e8e4dc] text-xs font-bold text-[#192d2a] hover:bg-[#f0ebe1] transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Place order</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
