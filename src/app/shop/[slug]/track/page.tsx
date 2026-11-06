"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackOrderAction, type TrackedOrderResult } from "@/features/orders/tracking-actions";
import { formatCurrency } from "@/lib/utils";
import { OrderThermalReceipt } from "@/components/shared/OrderThermalReceipt";
import { getCourierTrackingUrl } from "@/lib/couriers";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  XCircle,
  ShieldCheck,
  Receipt,
  ExternalLink,
} from "lucide-react";

interface TrackPageProps {
  params: Promise<{ slug: string }>;
}

export default function OrderTrackingPage({ params }: TrackPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrderResult | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTrackedOrder(null);
    setLoading(true);

    const res = await trackOrderAction({
      shopSlug: slug,
      orderCode,
      phone,
    });

    if (res.error) {
      setError(res.error);
    } else if (res.order) {
      setTrackedOrder(res.order);
    }

    setLoading(false);
  }

  const steps = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "completed", label: "Completed", icon: ShieldCheck },
  ];

  function getStepStatus(stepKey: string, currentStatus: string) {
    if (currentStatus === "cancelled") return "inactive";

    const orderIndex = steps.findIndex((s) => s.key === currentStatus);
    const thisIndex = steps.findIndex((s) => s.key === stepKey);

    if (thisIndex < orderIndex) return "completed";
    if (thisIndex === orderIndex) return "active";
    return "pending";
  }

  const courierUrl = trackedOrder
    ? getCourierTrackingUrl(trackedOrder.courierName, trackedOrder.trackingNumber)
    : null;

  return (
    <div className="min-h-screen bg-[#faf8f2] py-12 px-4 selection:bg-[#192d2a] selection:text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/shop/${slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#192d2a] hover:text-[#017d6e] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <span className="text-[11px] font-semibold text-[#6a7872] uppercase tracking-wider">
            Order Status & Tracking
          </span>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#e0f2eb] text-[#017d6e] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#192d2a]">
                Track Your Order
              </h1>
              <p className="text-xs text-[#6a7872]">
                Enter your order tracking code and phone number to see real-time progress.
              </p>
            </div>
          </div>

          <form onSubmit={handleTrack} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                  Order Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KAD-2026-123456"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] uppercase focus:outline-none focus:ring-2 focus:ring-[#017d6e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#192d2a] uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e8e4dc] bg-white text-xs font-semibold text-[#192d2a] focus:outline-none focus:ring-2 focus:ring-[#017d6e]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Result */}
        {trackedOrder && (
          <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#f0ebe1]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6a7872]">
                  Tracking Code
                </span>
                <h2 className="text-xl font-black text-[#192d2a] font-mono mt-0.5">
                  {trackedOrder.orderCode}
                </h2>
                <span className="text-xs text-[#6a7872]">
                  Placed on {new Date(trackedOrder.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })}
                </span>
              </div>

              <div>
                {trackedOrder.status === "cancelled" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-extrabold uppercase tracking-wider">
                    <XCircle className="w-4 h-4" /> Order Cancelled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e0f2eb] text-[#017d6e] text-xs font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Status: {trackedOrder.status}
                  </span>
                )}
              </div>
            </div>

            {/* Courier Dispatch Info when Shipped with Direct Tracking Link */}
            {trackedOrder.courierName && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-purple-950 block">Dispatched via {trackedOrder.courierName}</span>
                    {trackedOrder.trackingNumber && (
                      <span className="text-purple-700 font-mono text-[11px]">Waybill: {trackedOrder.trackingNumber}</span>
                    )}
                  </div>
                </div>

                {courierUrl && (
                  <a
                    href={courierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[11px] transition shadow-2xs shrink-0"
                  >
                    <span>Track on {trackedOrder.courierName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Timeline */}
            {trackedOrder.status === "cancelled" ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                This order was cancelled and is no longer being processed. If you have questions, please contact the seller directly.
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6a7872] mb-3">
                  Fulfillment Progress
                </h3>

                {/* Mobile Stepper: Connected List */}
                <div className="sm:hidden space-y-2">
                  {steps.map((s) => {
                    const status = getStepStatus(s.key, trackedOrder.status);
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.key}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs ${
                          status === "completed"
                            ? "bg-[#e0f2eb] border-[#c4e5d8] text-[#017d6e] font-semibold"
                            : status === "active"
                            ? "bg-[#192d2a] border-[#192d2a] text-white font-bold shadow-xs"
                            : "bg-[#faf8f2] border-[#e8e4dc] text-zinc-400 opacity-60"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{s.label}</span>
                        {status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-[#017d6e]" />}
                        {status === "active" && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white font-black">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Stepper: 5-Col Grid */}
                <div className="hidden sm:grid sm:grid-cols-5 gap-3">
                  {steps.map((s) => {
                    const status = getStepStatus(s.key, trackedOrder.status);
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.key}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition ${
                          status === "completed"
                            ? "bg-[#e0f2eb] border-[#c4e5d8] text-[#017d6e]"
                            : status === "active"
                            ? "bg-[#192d2a] border-[#192d2a] text-white shadow-sm"
                            : "bg-[#faf8f2] border-[#e8e4dc] text-zinc-400 opacity-60"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] font-bold">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Summary */}
            <div className="pt-4 border-t border-[#f0ebe1] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6a7872]">
                Order Items ({trackedOrder.items.length})
              </h3>
              <div className="divide-y divide-[#f0ebe1]">
                {trackedOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#192d2a]">{it.name}</span>
                      <span className="text-[#6a7872] ml-2 font-mono">x{it.quantity}</span>
                    </div>
                    <span className="font-extrabold text-[#192d2a]">
                      {formatCurrency(it.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#f0ebe1] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#6a7872]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#192d2a]">{formatCurrency(trackedOrder.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#6a7872]">
                  <span>Delivery ({trackedOrder.deliveryZone || "Standard"})</span>
                  <span className="font-bold text-[#192d2a]">
                    {trackedOrder.deliveryFee > 0 ? formatCurrency(trackedOrder.deliveryFee) : "FREE"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#f0ebe1]">
                  <span className="text-xs font-bold text-[#6a7872]">Total Payable (COD)</span>
                  <span className="text-lg font-black text-[#192d2a]">
                    {formatCurrency(trackedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="pt-4 border-t border-[#f0ebe1] text-xs space-y-1">
              <span className="font-bold text-[#6a7872] uppercase tracking-wider text-[10px]">
                Deliver To
              </span>
              <p className="font-bold text-[#192d2a]">{trackedOrder.customerName}</p>
              <p className="text-[#6a7872]">{trackedOrder.deliveryAddress}</p>
            </div>

            {/* Toggle Slip Button */}
            <div className="pt-4 border-t border-[#f0ebe1] flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowSlip(!showSlip)}
                className="flex-1 py-3 px-4 rounded-2xl border border-[#e8e4dc] bg-[#faf8f2] hover:bg-[#f0ebe1] text-[#192d2a] font-bold text-xs transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-[#017d6e] border-[#017d6e]" />
                <span>{showSlip ? "Hide Digital Slip" : "View Official Order Slip"}</span>
              </button>

              <a
                href={trackedOrder.whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

            {/* Rendered Thermal Slip Component */}
            {showSlip && (
              <div className="pt-4 border-t border-[#f0ebe1] flex justify-center">
                <OrderThermalReceipt
                  orderCode={trackedOrder.orderCode}
                  createdAt={trackedOrder.createdAt}
                  shopName={trackedOrder.shopName}
                  shopSlug={slug}
                  customerName={trackedOrder.customerName}
                  customerPhone={trackedOrder.customerPhone || phone}
                  customerAddress={trackedOrder.deliveryAddress}
                  items={trackedOrder.items}
                  subtotal={trackedOrder.subtotal}
                  deliveryFee={trackedOrder.deliveryFee}
                  deliveryZone={trackedOrder.deliveryZone || undefined}
                  total={trackedOrder.total}
                  courierName={trackedOrder.courierName}
                  trackingNumber={trackedOrder.trackingNumber}
                  operatorName={trackedOrder.shopName}
                  recipientType="seller"
                  showActions={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
