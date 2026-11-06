"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "@/features/orders/seller-actions";
import {
  STATUS_LABELS,
  getAllowedNextStatuses,
} from "@/features/orders/order-constants";
import { buildWhatsAppUrl } from "@/lib/phone";
import { Loader2, CheckCircle2, AlertCircle, Truck, MessageCircle } from "lucide-react";

interface OrderStatusFormProps {
  orderId: string;
  initialStatus: string;
  initialCourierName?: string | null;
  initialTrackingNumber?: string | null;
  customerPhone?: string | null;
  customerName?: string | null;
  orderCode?: string | null;
  shopSlug?: string | null;
}

export function OrderStatusForm({
  orderId,
  initialStatus,
  initialCourierName = "",
  initialTrackingNumber = "",
  customerPhone = "",
  customerName = "Customer",
  orderCode = "",
  shopSlug = "",
}: OrderStatusFormProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [courierName, setCourierName] = useState<string>(initialCourierName || "");
  const [trackingNumber, setTrackingNumber] = useState<string>(initialTrackingNumber || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allowedStatuses = getAllowedNextStatuses(currentStatus);
  const isTerminal = currentStatus === "completed" || currentStatus === "cancelled";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedStatus === currentStatus && !courierName && !trackingNumber) {
      setSuccess("Order is already at this status.");
      setError(null);
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateOrderStatusAction(orderId, selectedStatus, {
        courierName: courierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setCurrentStatus(selectedStatus);
        setSuccess(`Order status updated to ${STATUS_LABELS[selectedStatus] || selectedStatus}.`);
      }
    } catch {
      setError("Could not confirm the update. Refresh this order to check its current status before retrying.");
    } finally {
      setPending(false);
    }
  }

  const isShipping = selectedStatus === "shipped" || currentStatus === "shipped";

  // Build customer update WhatsApp message
  const statusLabel = STATUS_LABELS[currentStatus] || currentStatus;
  const trackingText = trackingNumber ? ` via ${courierName || "courier"} (Waybill: ${trackingNumber})` : "";
  const trackLink = shopSlug ? ` Track here: https://kadeo.lk/shop/${shopSlug}/track` : "";
  const waUpdateMsg = `Hello ${customerName || "Customer"}! Your order ${orderCode} has been updated to "${statusLabel}"${trackingText}.${trackLink} Thank you for shopping with us!`;
  const waUpdateUrl = customerPhone ? buildWhatsAppUrl(customerPhone, waUpdateMsg) : null;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`order-status-${orderId}`} className="sr-only">
            Order Status
          </label>
          <select
            id={`order-status-${orderId}`}
            name="status"
            value={selectedStatus}
            disabled={pending || isTerminal}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition"
          >
            {allowedStatuses.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st] || st} {st === currentStatus ? "(Current)" : ""}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={pending || isTerminal || (selectedStatus === currentStatus && !courierName && !trackingNumber)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#7959d4] hover:bg-[#6547be] text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7960df]"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{pending ? "Updating..." : "Update Status"}</span>
          </button>
        </div>

        {/* Courier & Tracking Waybill fields when Shipped */}
        {isShipping && !isTerminal && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
              <Truck className="w-3.5 h-3.5 text-[#7959d4] primary" />
              <span>Courier Delivery Waybill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label htmlFor="courier-name" className="block text-[10px] font-semibold text-zinc-500 uppercase mb-0.5">
                  Courier Partner
                </label>
                <input
                  id="courier-name"
                  type="text"
                  placeholder="e.g. Domex / Pronto / SL Post"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#7960df]"
                />
              </div>
              <div>
                <label htmlFor="courier-waybill" className="block text-[10px] font-semibold text-zinc-500 uppercase mb-0.5">
                  Tracking Waybill #
                </label>
                <input
                  id="courier-waybill"
                  type="text"
                  placeholder="e.g. DX-89218491"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-mono font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#7960df]"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* WhatsApp Status Update One-Click Button */}
      {waUpdateUrl && (
        <a
          href={waUpdateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Notify Customer on WhatsApp ({statusLabel})</span>
        </a>
      )}

      {isTerminal && (
        <p className="text-[11px] text-zinc-500 italic">
          This order is {STATUS_LABELS[currentStatus] || currentStatus} and cannot transition further.
        </p>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
