"use client";
import { StoreIcon } from "./StoreIcon";
import { useStoreText } from "./StoreContent";
import Link from "next/link";
import { useCart } from "./CartDrawer";
import { buildWhatsAppUrl } from "@/lib/phone";
import { StorePoliciesModal } from "./StorePoliciesModal";
import { Truck, Search } from "lucide-react";
import { customStyle } from "@/lib/store-custom-styles";

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
  const navbarStyle = customStyle(t, "navbar");
  const buttonStyle = customStyle(t, "buttons");

  return (
    <header
      data-style-part="navbar"
      data-custom-text={Boolean(navbarStyle.color)}
      style={navbarStyle}
      className="sticky top-0 z-40 bg-[#faf8f2]/95 backdrop-blur-md border-b border-[#e8e4dc] transition-all"
    >
      <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 h-18 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link href={`/shop/${shopSlug}`} className="flex items-center gap-2.5 sm:gap-3 group min-w-0 mr-1 sm:mr-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shopName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-xs border border-[#e8e4dc] shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#192d2a] text-[#e0f2eb] flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform shrink-0"
              style={buttonStyle.background ? { background: buttonStyle.background, color: buttonStyle.color } : undefined}
            >
              {shopName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span
              className="font-extrabold text-sm sm:text-base tracking-tight text-[#192d2a] group-hover:text-[#017d6e] transition-colors truncate max-w-[130px] xs:max-w-[190px] sm:max-w-xs md:max-w-sm"
              style={navbarStyle.color ? { color: navbarStyle.color } : undefined}
            >
              {shopName}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#6c7771] font-semibold flex items-center gap-1 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#017d6e] animate-pulse shrink-0"></span>
              <span className="truncate">{t("31dc199a1852", "Official Store")}</span>
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <div
          className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#192d2a]"
          style={navbarStyle.color ? { color: navbarStyle.color } : undefined}
        >
          <Link
            href={`/shop/${shopSlug}/track`}
            className="flex items-center gap-1.5 hover:opacity-80 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </Link>

          <StorePoliciesModal
            shopName={shopName}
            whatsappNumber={whatsappNumber}
            deliveryInformation={deliveryInformation}
            triggerLabel="Shipping & Policies"
            triggerClassName="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
          />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href={`/shop/${shopSlug}/track`}
            style={buttonStyle.borderRadius ? { borderRadius: buttonStyle.borderRadius } : undefined}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#e8e4dc] text-[11px] font-bold text-[#192d2a]"
          >
            Track
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle.borderRadius ? { borderRadius: buttonStyle.borderRadius } : undefined}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#e0f2eb] border border-[#c4e5d8] text-xs font-bold text-[#192d2a] hover:bg-[#d1ebdf] transition shadow-2xs"
          >
            <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#017d6e]" />
            <span>{t("8eb8a88ae376", "Chat on WhatsApp")}</span>
          </a>

          <button
            onClick={() => setIsOpen(true)}
            data-style-part="buttons"
            data-custom-text={Boolean(buttonStyle.color)}
            style={buttonStyle}
            className="relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#192d2a] text-[#faf8f2] hover:opacity-90 text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <StoreIcon name="ShoppingBag" className="w-4 h-4" />
            <span className="hidden xs:inline">{t("44656820495b", "Cart")}</span>
            {totalCount > 0 && (
              <span className="ml-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#017d6e] text-white text-[10px] sm:text-[11px] font-bold shadow-2xs">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
