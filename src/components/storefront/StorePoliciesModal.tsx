"use client";

import { useState } from "react";
import { Truck, RotateCcw, ShieldCheck, X, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/phone";

interface StorePoliciesModalProps {
  shopName: string;
  whatsappNumber: string;
  deliveryInformation?: string | null;
  triggerClassName?: string;
  triggerLabel?: string;
}

export function StorePoliciesModal({
  shopName,
  whatsappNumber,
  deliveryInformation,
  triggerClassName,
  triggerLabel = "Shipping & Returns Policy",
}: StorePoliciesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"delivery" | "returns">("delivery");

  const effectiveDelivery =
    deliveryInformation && deliveryInformation.trim().length > 0
      ? deliveryInformation
      : "Standard island-wide courier delivery across Sri Lanka within 2-4 business days. Cash on delivery (COD) available for all provinces.";

  const returnInquiryUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hi ${shopName}! I would like to inquire about returning or exchanging an item.`
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ||
          "text-xs font-semibold text-[#192d2a] hover:text-[#017d6e] transition underline underline-offset-4 cursor-pointer"
        }
      >
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e4dc] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              aria-label="Close policies modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-2xl bg-[#e0f2eb] text-[#017d6e] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#192d2a]">
                  Store Policies & Delivery
                </h3>
                <p className="text-[11px] text-[#6a7872]">{shopName}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#f0ebe1] mb-5 gap-4">
              <button
                type="button"
                onClick={() => setTab("delivery")}
                className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  tab === "delivery"
                    ? "border-[#017d6e] text-[#017d6e]"
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <Truck className="w-4 h-4" />
                Shipping & Delivery
              </button>
              <button
                type="button"
                onClick={() => setTab("returns")}
                className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  tab === "returns"
                    ? "border-[#017d6e] text-[#017d6e]"
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Returns & Exchanges
              </button>
            </div>

            {/* Content */}
            {tab === "delivery" ? (
              <div className="space-y-4 text-xs text-[#192d2a]">
                <div className="p-4 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] leading-relaxed">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#017d6e] block mb-1">
                    Seller Delivery Information
                  </span>
                  <p className="whitespace-pre-line text-xs text-zinc-800">
                    {effectiveDelivery}
                  </p>
                </div>

                <div className="space-y-2 text-[11px] text-[#6a7872]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#017d6e] shrink-0" />
                    <span>Cash on Delivery (COD) collected at doorstep.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#017d6e] shrink-0" />
                    <span>Orders are dispatched directly by the seller after WhatsApp confirmation.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-[#192d2a]">
                <div className="p-4 rounded-2xl bg-[#faf8f2] border border-[#e8e4dc] leading-relaxed space-y-2">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#017d6e] block">
                    Returns & Exchange Policy
                  </span>
                  <p className="text-xs text-zinc-800">
                    If you receive a defective or incorrect item, please notify the seller within 7 days of delivery.
                    Items must be unused and in their original packaging.
                  </p>
                </div>

                <a
                  href={returnInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Request Return / Exchange via WhatsApp</span>
                </a>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#f0ebe1] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-2 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
