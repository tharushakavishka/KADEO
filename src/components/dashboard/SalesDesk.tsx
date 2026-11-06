"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Search, CheckCircle2, RotateCcw, ArrowDown, Receipt, MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createDeskOrderAction } from "@/features/orders/desk-actions";
import { OrderThermalReceipt } from "@/components/shared/OrderThermalReceipt";
import {
  computeCheckoutPayloadDigest,
  generateCheckoutIdempotencyKey,
} from "@/lib/checkout-idempotency";
import {
  readStoredSalesDeskDraft,
  getSalesDeskStorageKey,
  SalesDeskLine,
  SalesDeskCustomer,
  EMPTY_SALES_DESK_DRAFT,
} from "@/lib/sales-desk-storage";

export type DeskProduct = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock_quantity: number;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7960df] transition";

export function SalesDesk({
  products,
  query,
  page,
  totalPages,
  shopId,
}: {
  products: DeskProduct[];
  query: string;
  page: number;
  totalPages: number;
  shopId?: string;
}) {
  const router = useRouter();
  const storageKey = getSalesDeskStorageKey(shopId);

  // Bind hydration state to the specific storageKey to prevent cross-shop draft overwrite on prop change
  // Preserving strict hook ordering: index 0 (hydratedKey), index 1 (lines), index 2 (customer)
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [lines, setLines] = useState<SalesDeskLine[]>([]);
  const [customer, setCustomer] = useState<SalesDeskCustomer>(EMPTY_SALES_DESK_DRAFT.customer);
  const [pending, setPending] = useState(false);
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ id: string; code: string; total: number } | null>(null);
  const checkoutAttemptRef = useRef<{ key: string; digest: string } | null>(null);
  const [deliveryZone, setDeliveryZone] = useState<string>("counter");
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [createdSlip, setCreatedSlip] = useState<{
    orderId: string;
    orderCode: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    deliveryZone: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    orderNote?: string;
    items: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
    shopName: string;
    shopSlug: string;
    createdAt: string;
  } | null>(null);

  // Restore draft from sessionStorage whenever storageKey changes
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;
      const draft = readStoredSalesDeskDraft(raw);
      setLines(draft.lines);
      setCustomer(draft.customer);
    } catch {
      // If storage access fails or throws, cleanly reset in-memory state
      setLines([]);
      setCustomer(EMPTY_SALES_DESK_DRAFT.customer);
    }
    setHydratedKey(storageKey);
  }, [storageKey]);

  // Persist draft changes into sessionStorage only when hydrated for the CURRENT storageKey
  useEffect(() => {
    if (hydratedKey !== storageKey || typeof window === "undefined") return;
    try {
      const hasContent =
        lines.length > 0 ||
        Boolean(customer.name.trim() || customer.phone.trim() || customer.address.trim() || customer.note.trim());
      if (hasContent) {
        sessionStorage.setItem(storageKey, JSON.stringify({ lines, customer }));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Silently fall back to in-memory state
    }
  }, [lines, customer, hydratedKey, storageKey]);

  const itemsSubtotal = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
  const total = itemsSubtotal + deliveryFee;
  const totalItemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  function change(product: DeskProduct, delta: number) {
    setReceipt(null);
    setCreatedSlip(null);
    setLines((current) => {
      const existing = current.find((line) => line.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = Math.max(0, Math.min(product.stock_quantity, currentQty + delta));

      if (newQty <= 0) {
        return current.filter((line) => line.id !== product.id);
      }

      if (existing) {
        return current.map((line) =>
          line.id === product.id ? { ...line, quantity: newQty, stock_quantity: product.stock_quantity } : line
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock_quantity: product.stock_quantity,
          quantity: newQty,
        },
      ];
    });
  }

  function handleClearDraft() {
    checkoutAttemptRef.current = null;
    setLines([]);
    setCustomer(EMPTY_SALES_DESK_DRAFT.customer);
    setError("");
    setReceipt(null);
    setCreatedSlip(null);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || !lines.length) return;
    locked.current = true;
    setPending(true);
    setError("");

    const basePayload = {
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerAddress: customer.address.trim(),
      customerEmail: "",
      orderNote: customer.note.trim(),
      deliveryFee,
      deliveryZone: deliveryZone === "colombo" ? "Colombo & Suburbs" : deliveryZone === "outstation" ? "Outstation Express" : "Counter Pickup",
      items: lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
    };

    const currentDigest = computeCheckoutPayloadDigest(basePayload);
    let idempotencyKey: string;

    if (checkoutAttemptRef.current && checkoutAttemptRef.current.digest === currentDigest) {
      // Retry with identical order details: retain same idempotency key
      idempotencyKey = checkoutAttemptRef.current.key;
    } else {
      // First attempt or modified details: generate fresh idempotency key
      idempotencyKey = generateCheckoutIdempotencyKey("pos");
      checkoutAttemptRef.current = { key: idempotencyKey, digest: currentDigest };
    }

    try {
      const result = await createDeskOrderAction({
        ...basePayload,
        idempotencyKey,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.orderId && result.orderCode) {
        checkoutAttemptRef.current = null;
        const lineSnapshot = lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitPrice: Number(l.price),
          lineTotal: Number(l.price) * l.quantity,
        }));
        setReceipt({ id: result.orderId, code: result.orderCode, total: Number(result.total) });
        setCreatedSlip({
          orderId: result.orderId,
          orderCode: result.orderCode,
          total: Number(result.total),
          subtotal: Number(result.subtotal || itemsSubtotal),
          deliveryFee: Number(result.deliveryFee ?? deliveryFee),
          deliveryZone: result.deliveryZone || (deliveryZone === "colombo" ? "Colombo & Suburbs" : deliveryZone === "outstation" ? "Outstation Express" : "Counter Pickup"),
          customerName: customer.name.trim(),
          customerPhone: customer.phone.trim(),
          customerAddress: customer.address.trim(),
          orderNote: customer.note.trim(),
          items: lineSnapshot,
          shopName: result.shopName || "Kadeo Store",
          shopSlug: result.shopSlug || "",
          createdAt: result.createdAt || new Date().toISOString(),
        });
        setLines([]);
        setCustomer(EMPTY_SALES_DESK_DRAFT.customer);
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(storageKey);
          }
        } catch {}
        router.refresh();
      }
    } catch {
      setError("The result could not be confirmed. Check Orders before retrying to avoid a duplicate.");
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  const hasDraftContent =
    lines.length > 0 ||
    Boolean(customer.name.trim() || customer.phone.trim() || customer.address.trim() || customer.note.trim());

  return (
    <div className={`grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px] ${lines.length > 0 ? "pb-24 xl:pb-0" : ""}`}>
      {/* Catalog Section */}
      <section className="min-w-0 space-y-4" aria-label="Product catalog">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q") || "";
            router.push(`/dashboard/pos?q=${encodeURIComponent(String(value))}`);
          }}
          className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs"
        >
          <label htmlFor="desk-search" className="sr-only">
            Search products by name
          </label>
          <input
            id="desk-search"
            name="q"
            defaultValue={query}
            placeholder="Search products by name..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df]"
          />
          <button
            type="submit"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#191b30] px-4 text-white hover:bg-[#25283f] flex items-center justify-center transition shadow-xs cursor-pointer"
            aria-label="Search products"
          >
            <Search size={18} />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>Select products to add to current order. Prices and stock are verified again upon submission.</p>
          {query && (
            <Link
              href="/dashboard/pos"
              className="font-semibold text-[#7960df] hover:underline"
            >
              Clear search filter
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const inBasket = lines.find((l) => l.id === product.id)?.quantity || 0;
            const isOutOfStock = product.stock_quantity <= 0;
            return (
              <button
                key={product.id}
                type="button"
                disabled={pending || isOutOfStock}
                onClick={() => change(product, 1)}
                className={`group rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#7960df] ${
                  inBasket > 0
                    ? "border-[#7960df] bg-purple-50/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-[#8a73f0] hover:shadow-md"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-[#7960df]">
                    <ShoppingBag size={18} />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {inBasket > 0 && (
                      <span className="rounded-full bg-[#7959d4] px-2 py-0.5 text-xs font-bold text-white">
                        {inBasket} in order
                      </span>
                    )}
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 group-hover:border-[#7960df] group-hover:bg-[#7960df] group-hover:text-white transition">
                      <Plus size={16} />
                    </span>
                  </div>
                </div>

                <span className="block text-sm font-semibold text-slate-900 group-hover:text-[#30234e]">
                  {product.name}
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  {product.sku || "No SKU"} •{" "}
                  {product.stock_quantity > 0 ? (
                    product.stock_quantity <= 5 ? (
                      <span className="font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                        Low stock: {product.stock_quantity} left
                      </span>
                    ) : (
                      <span className="font-medium text-emerald-700">{product.stock_quantity} available</span>
                    )
                  ) : (
                    <span className="font-semibold text-rose-600">Out of stock</span>
                  )}
                </span>

                <span className="mt-3 block text-base font-bold text-slate-900">
                  {formatCurrency(Number(product.price))}
                </span>
              </button>
            );
          })}
        </div>

        {!products.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 bg-white">
            <ShoppingBag size={28} className="mx-auto mb-2 text-slate-400" />
            <p className="font-medium">No active products found matching your search.</p>
            <p className="text-xs text-slate-400 mt-1">Try another search or view all items.</p>
          </div>
        )}

        <nav aria-label="Catalog pages" className="flex items-center justify-between text-sm py-2">
          {page > 1 ? (
            <Link
              href={`/dashboard/pos?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="min-h-[40px] px-3.5 py-2 inline-flex items-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="font-medium text-slate-600 text-xs">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/dashboard/pos?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="min-h-[40px] px-3.5 py-2 inline-flex items-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </section>

      {/* Current Order Panel */}
      <section
        id="current-order-section"
        className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        aria-label="Current order"
      >
        <div className="bg-[#191b30] p-5 text-white flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Current order</h2>
            <p className="mt-1 text-xs text-slate-300">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"} • Pending fulfillment
            </p>
          </div>

          {hasDraftContent && (
            <button
              type="button"
              disabled={pending}
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#363953] bg-[#25283f] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#2c2f49] transition cursor-pointer"
              title="Reset order draft"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="space-y-4 p-5">
          {/* Generated Thermal Order Slip & WhatsApp Action Card */}
          {createdSlip ? (
            <div className="space-y-4">
              <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <p className="font-bold">Order {createdSlip.orderCode} Created!</p>
                </div>
                <p className="mt-1 text-xs text-emerald-800">
                  Slip generated below. You can share it directly with the customer on WhatsApp or print it.
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-emerald-200 text-xs">
                  <Link
                    className="font-semibold text-emerald-900 underline hover:text-emerald-700"
                    href={`/dashboard/orders/${createdSlip.orderId}`}
                  >
                    Open order details →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSlip(null);
                      setReceipt(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    New Sale
                  </button>
                </div>
              </div>

              {/* Rendered Thermal Receipt Matching Reference Image */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <OrderThermalReceipt
                  orderCode={createdSlip.orderCode}
                  createdAt={createdSlip.createdAt}
                  shopName={createdSlip.shopName}
                  shopSlug={createdSlip.shopSlug}
                  customerName={createdSlip.customerName}
                  customerPhone={createdSlip.customerPhone}
                  customerAddress={createdSlip.customerAddress}
                  orderNote={createdSlip.orderNote}
                  orderType="POS Sales Desk"
                  items={createdSlip.items}
                  subtotal={createdSlip.subtotal}
                  deliveryFee={createdSlip.deliveryFee}
                  deliveryZone={createdSlip.deliveryZone}
                  total={createdSlip.total}
                  operatorName={createdSlip.shopName}
                  recipientType="customer"
                  showActions={true}
                />
              </div>
            </div>
          ) : receipt && (
            <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <p className="font-bold">Order {receipt.code} saved</p>
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                {formatCurrency(receipt.total)} • Payment not recorded (Fulfillment pending)
              </p>
              <Link
                className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-900 underline hover:text-emerald-700"
                href={`/dashboard/orders/${receipt.id}`}
              >
                Open order & receipt →
              </Link>
            </div>
          )}

          {!lines.length ? (
            <div className="py-8 text-center text-slate-500 space-y-1">
              <ShoppingBag size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Your basket is empty</p>
              <p className="text-xs text-slate-400">
                Select items from the catalog. Your basket stays saved as you search or browse.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{line.name}</p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {formatCurrency(Number(line.price) * line.quantity)} •{" "}
                      <span className="text-slate-400">{formatCurrency(Number(line.price))} each</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => change(line, -1)}
                      aria-label={`Decrease ${line.name}`}
                      className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-[28px] text-center text-sm font-bold tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={pending || line.quantity >= line.stock_quantity}
                      onClick={() => change(line, 1)}
                      aria-label={`Increase ${line.name}`}
                      className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items subtotal</span>
              <span className="tabular-nums font-semibold">{formatCurrency(itemsSubtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Delivery fee</span>
                <span className="tabular-nums font-semibold">{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-base font-bold pt-1.5 border-t border-slate-100 text-slate-900">
              <span>Order total</span>
              <span className="text-xl tabular-nums text-[#30234e]">{formatCurrency(total)}</span>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Creates a pending order and reserves stock under your storefront rules. No payment is collected or marked paid.
          </p>

          <form onSubmit={submit} className="space-y-3.5">
            <fieldset disabled={pending} className="space-y-3">
              <div>
                <label htmlFor="desk-name" className="text-xs font-semibold text-slate-700">
                  Customer name *
                </label>
                <input
                  id="desk-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={customer.name}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kasun Perera"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="desk-phone" className="text-xs font-semibold text-slate-700">
                  Customer phone *
                </label>
                <input
                  id="desk-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="0771234567"
                  value={customer.phone}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="desk-delivery-zone" className="text-xs font-semibold text-slate-700">
                  Delivery Zone & Fee
                </label>
                <select
                  id="desk-delivery-zone"
                  value={deliveryZone}
                  onChange={(e) => {
                    const zone = e.target.value;
                    setDeliveryZone(zone);
                    if (zone === "colombo") setDeliveryFee(350);
                    else if (zone === "outstation") setDeliveryFee(450);
                    else setDeliveryFee(0);
                  }}
                  className={inputClass}
                >
                  <option value="counter">Counter / Store Pickup (LKR 0)</option>
                  <option value="colombo">Colombo & Suburbs Delivery (LKR 350)</option>
                  <option value="outstation">Islandwide Outstation Delivery (LKR 450)</option>
                </select>
              </div>

              <div>
                <label htmlFor="desk-address" className="text-xs font-semibold text-slate-700">
                  Delivery address / pickup details *
                </label>
                <textarea
                  id="desk-address"
                  name="address"
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={2}
                  placeholder="Counter pickup or street address"
                  value={customer.address}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="desk-note" className="text-xs font-semibold text-slate-700">
                  Order note (optional)
                </label>
                <input
                  id="desk-note"
                  name="note"
                  maxLength={1000}
                  placeholder="Special instructions..."
                  value={customer.note}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, note: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !lines.length}
              className="min-h-[44px] w-full rounded-xl bg-[#7959d4] hover:bg-[#6547be] px-4 py-3 font-semibold text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {pending ? "Saving order..." : "Create order"}
            </button>
          </form>
        </div>
      </section>

      {/* Mobile Sticky Order Summary Bar (< xl, 360px/390px/768px) */}
      {lines.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3 shadow-lg flex items-center justify-between xl:hidden z-30">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total ({totalItemCount} items)</span>
            <span className="block text-base font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              document.getElementById("current-order-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7959d4] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <span>Proceed to checkout</span>
            <ArrowDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
