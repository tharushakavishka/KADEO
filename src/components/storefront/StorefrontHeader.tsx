"use client";
import { StoreIcon } from "./StoreIcon";
import { useStoreText } from "./StoreContent";
import Link from "next/link";
import { useCart } from "./CartDrawer";
import { buildWhatsAppUrl } from "@/lib/phone";
import { StorePoliciesModal } from "./StorePoliciesModal";
import { Truck, Search } from "lucide-react";

interface HeaderProps {
  shopName: string;
  shopSlug: string;
  whatsappNumber: string;
  logoUrl?: string | null;
  deliveryInformation?: string | null;
}

export function StorefrontHeader({
  shopName,
  shopSlug,
  whatsappNumber,
  logoUrl,
  deliveryInformation,
}: HeaderProps) {
  const t = useStoreText();
  const { totalCount, setIsOpen } = useCart();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f2]/95 backdrop-blur-md border-b border-[#e8e4dc] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link href={`/shop/${shopSlug}`} className="flex items-center gap-3 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shopName}
              className="w-10 h-10 rounded-2xl object-cover shadow-xs border border-[#e8e4dc]"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-[#192d2a] text-[#e0f2eb] flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              {shopName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#192d2a] group-hover:text-[#017d6e] transition-colors">
              {shopName}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#6c7771] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#017d6e] animate-pulse"></span>
              {t("31dc199a1852", "Official Store")}
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#192d2a]">
          <Link
            href={`/shop/${shopSlug}/track`}
            className="flex items-center gap-1.5 hover:text-[#017d6e] transition"
          >
            <Search className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>Track Order</span>
          </Link>

          <StorePoliciesModal
            shopName={shopName}
            whatsappNumber={whatsappNumber}
            deliveryInformation={deliveryInformation}
            triggerLabel="Shipping & Policies"
            triggerClassName="flex items-center gap-1.5 hover:text-[#017d6e] transition cursor-pointer"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/shop/${shopSlug}/track`}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#e8e4dc] text-[11px] font-bold text-[#192d2a]"
          >
            Track
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#e0f2eb] border border-[#c4e5d8] text-xs font-bold text-[#192d2a] hover:bg-[#d1ebdf] transition shadow-2xs"
          >
            <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#017d6e]" />
            <span>{t("8eb8a88ae376", "Chat on WhatsApp")}</span>
          </a>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#192d2a] text-[#faf8f2] hover:bg-[#122624] text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <StoreIcon name="ShoppingBag" className="w-4 h-4 text-[#e0f2eb]" />
            <span>{t("44656820495b", "Cart")}</span>
            {totalCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-[#017d6e] text-white text-[11px] font-bold shadow-2xs">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
