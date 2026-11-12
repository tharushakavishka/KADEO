"use client";

import { useCart } from "./CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/phone";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { useStoreContent } from "./StoreContent";

interface MobileBarProps {
  shopName: string;
  whatsappNumber: string;
}

export function StorefrontMobileBar({ shopName, whatsappNumber }: MobileBarProps) {
  const { totalCount, subtotal, setIsOpen } = useCart();
  const content = useStoreContent();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  const isWaFloatingEnabled = content["whatsapp:floating_bar"] !== "false";
  const waButtonText = content["whatsapp:button_text"] || "WhatsApp";
  const waCustomTemplate =
    content["whatsapp:order_template"] ||
    content["interact:wa_message"] ||
    `Hi ${shopName}, I have a question about your products.`;

  return (
    <aside
      aria-label="Mobile quick actions"
      data-studio-element="whatsapp_bar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f2]/95 backdrop-blur-md border-t border-[#e8e4dc] px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      {/* WhatsApp Quick Chat (Toggleable & Customizable) */}
      {isWaFloatingEnabled && (
        <a
          href={`${whatsappUrl}?text=${encodeURIComponent(waCustomTemplate)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 px-3 rounded-2xl bg-[#e0f2eb] hover:bg-[#cbe8dc] text-[#017d6e] border border-[#c4e5d8] text-xs font-bold transition active:scale-95"
        >
          <MessageCircle className="w-4 h-4 shrink-0 text-[#017d6e]" />
          <span className="truncate">{waButtonText}</span>
        </a>
      )}

      {/* Cart Quick Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-2xl bg-[#192d2a] hover:bg-[#122624] text-[#faf8f2] text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
          isWaFloatingEnabled ? "flex-1" : "w-full"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-[#e0f2eb]" />
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#017d6e] text-white text-[9px] font-black flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </div>
        <span className="font-extrabold text-[#96d2b6] font-mono text-[11px]">
          {totalCount > 0 ? formatCurrency(subtotal) : "View"}
        </span>
      </button>
    </aside>
  );
}
