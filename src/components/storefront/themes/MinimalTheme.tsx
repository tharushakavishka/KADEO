"use client";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";

import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/phone";
import { Plus, Check, ShoppingBag, MessageCircle, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  images?: { storage_path: string }[];
  category?: { name: string } | null;
}

interface ThemeProps {
  shop: {
    name: string;
    description: string | null;
    banner_url: string | null;
    whatsapp_number: string;
    address: string | null;
  };
  categories: { id: string; name: string; slug: string }[];
  products: ProductItem[];
}

export function MinimalTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();
  const cardStyle = customStyle(t, "card");
  const buttonStyle = customStyle(t, "buttons");

  const heroVisible = (part: string) => t(`visibility:hero:${part}`, "shown") !== "hidden";
  const heroContentVisible = heroVisible("content") && ["eyebrow", "title", "description", "trust"].some(heroVisible);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const cleanWaNumber = normalizePhoneNumber(shop.whatsapp_number);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category?.name === selectedCategory);

  function handleAddToCart(p: ProductItem) {
    if (p.stock_quantity <= 0) return;
    addItem({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.images?.[0]?.storage_path,
      maxStock: p.stock_quantity,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  function handleDirectOrder(p: ProductItem) {
    handleAddToCart(p);
    setIsOpen(true);
  }

  const heroBanner = t("element:hero:image", t("hero:image_url", shop.banner_url || ""));

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#192d2a] pb-28 selection:bg-[#192d2a] selection:text-white">
      {/* Hero Section */}
      {heroBanner && (
        <img
          data-studio-element="hero_image"
          src={heroBanner}
          alt={t("element:hero_title:text", shop.name)}
          className="w-full max-h-96 2xl:max-h-[460px] object-cover"
        />
      )}
      {heroContentVisible && (
      <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 px-4 border-b border-[#e8e4dc] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5ede1]/60 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          {heroVisible("eyebrow") && (
          <div data-studio-element="hero_eyebrow" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f2eb] border border-[#c4e5d8] text-[#192d2a] text-xs font-bold mb-4 sm:mb-5 shadow-2xs">
            <StoreIcon name="Sparkles" className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>{t("0debef41f459", "Handcrafted & Authentic • Sri Lanka")}</span>
          </div>
          )}

          {heroVisible("title") && (
          <h1 data-studio-element="hero_title" className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#192d2a] mb-4 sm:mb-5 leading-[1.1]">
            {shop.name}
          </h1>
          )}

          {shop.description && heroVisible("description") && (
            <p data-studio-element="hero_desc" className="text-xs sm:text-base md:text-lg text-[#5a6861] max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
              {t("element:hero_desc:text", shop.description || "")}
            </p>
          )}

          {/* Trust Badges */}
          {heroVisible("trust") && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 pt-2 text-[11px] sm:text-xs font-semibold text-[#6a7872]">
            <span className="flex items-center gap-1.5">
              <StoreIcon name="Truck" className="w-4 h-4 text-[#017d6e]" />{t("532223c4bb3b", "Islandwide COD Delivery")}</span>
            <span className="flex items-center gap-1.5">
              <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#017d6e]" />{t("91044de3c78f", "Instant WhatsApp Confirmation")}</span>
            <span className="flex items-center gap-1.5">
              <StoreIcon name="ShieldCheck" className="w-4 h-4 text-[#017d6e]" />{t("6dab2bb87b5f", "Verified Local Seller")}</span>
          </div>
          )}
        </div>
      </section>
      )}

      {/* High-Impact Ceylon Emerald Promotional Banner (Figma Signature Section) */}
      {heroVisible("note") && (
      <section className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#192d2a] via-[#122624] to-[#1a3833] p-6 sm:p-10 lg:p-12 text-white shadow-xl overflow-hidden border border-[#23423d]">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#017d6e]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-[#e0f2eb]/20 text-[#e0f2eb] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">{t("fab32a6fabf0", "Exclusive Direct Deal")}</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-3 leading-snug">{t("014c127b8656", "Order directly via WhatsApp for quick delivery & Cash on Delivery.")}</h2>
            <p className="text-xs sm:text-sm text-[#c7d5cf] mb-6 leading-relaxed">{t("7d1325a12044", "No complicated signups. Browse items, add to cart, and send your order straight to our WhatsApp business line.")}</p>
            {heroVisible("button") && (
            <a
              href={`https://wa.me/${cleanWaNumber}?text=Hello!%20I%20am%20browsing%20your%20Kadeo%20store%20and%20would%20like%20to%20inquire.`}
              target="_blank"
              rel="noopener noreferrer"
              data-studio-element="hero_cta"
              data-style-part="buttons"
              data-custom-text={Boolean(buttonStyle.color)}
              style={buttonStyle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white text-xs font-bold transition shadow-md active:scale-95"
            >
              <StoreIcon name="MessageCircle" className="w-4 h-4" />
              <span>{t("da0bf4f5c15f", "Ask a Question on WhatsApp")}</span>
            </a>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              style={selectedCategory === "all" ? buttonStyle : undefined}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-2xs shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[#192d2a] text-white"
                  : "bg-[#f0ebe1] text-[#4a5550] hover:bg-[#e6dfd3] hover:text-[#192d2a]"
              }`}
            >{t("8b7a91124b57", "All Collection (")}{products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                style={selectedCategory === c.name ? buttonStyle : undefined}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-2xs shrink-0 ${
                  selectedCategory === c.name
                    ? "bg-[#192d2a] text-white"
                    : "bg-[#f0ebe1] text-[#4a5550] hover:bg-[#e6dfd3] hover:text-[#192d2a]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#e8e4dc] p-8">
            <StoreIcon name="ShoppingBag" className="w-12 h-12 text-[#b0beba] mx-auto mb-3" />
            <p className="text-base font-bold text-[#192d2a]">{t("2ab447eb84f5", "No items found")}</p>
            <p className="text-xs text-[#6a7872] mt-1">{t("0ac2dba00b26", "Check back soon for new arrivals in this collection.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((p) => {
              const imageSrc = p.images?.[0]?.storage_path;
              const isOut = p.stock_quantity <= 0;
              const isAdded = addedId === p.id;

              return (
                <div
                  key={p.id}
                  data-studio-element="product_card"
                  data-style-part="card" data-custom-text={Boolean(cardStyle.color)} style={cardStyle} className="group flex flex-col bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden hover:shadow-xl hover:border-[#cfc7ba] transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-[#f4eedf] overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#9caaa4]">
                        <StoreIcon name="ShoppingBag" className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">{t("e9a8f4c20134", "Handmade")}</span>
                      </div>
                    )}

                    {/* Stock Tag */}
                    {isOut && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold">
                        {t("a23bcb769dcc", "Currently sold out")}
                      </span>
                    )}

                    {/* Quick Add Button */}
                    {!isOut && (
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isAdded}
                        className={`absolute bottom-2.5 right-2.5 p-2.5 rounded-2xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
                          isAdded
                            ? "bg-[#017d6e] text-white scale-105"
                            : "bg-white/95 text-[#192d2a] hover:bg-[#192d2a] hover:text-white"
                        }`}
                        title="Add to cart"
                      >
                        {isAdded ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-[#017d6e] uppercase tracking-wider mb-1">
                        {p.category?.name || t("10ddb7727da2", "The everyday collection")}
                      </div>
                      <h3 className="font-extrabold text-[#192d2a] text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#017d6e] transition-colors">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-[11px] text-[#6c7b74] line-clamp-1 mt-1 font-normal">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#f0ebe1]/70">
                      <div>
                        <span className="text-xs sm:text-base font-black text-[#192d2a] tracking-tight">
                          {formatCurrency(Number(p.price))}
                        </span>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="text-[10px] text-[#9caaa4] line-through ml-1.5 font-medium">
                            {formatCurrency(Number(p.compare_at_price))}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDirectOrder(p)}
                        disabled={isOut}
                        data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 cursor-pointer ${
                          isOut
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : "bg-[#192d2a] text-white hover:bg-[#017d6e]"
                        }`}
                      >
                        {isOut ? t("4d5a6b7c8d9e", "Sold") : t("95355cde18ea", "Order")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Policies Footer Modal Strip */}
      <footer className="mt-16 border-t border-[#e8e4dc] bg-[#f4eedf]/40 py-8 text-center text-xs text-[#6a7872]">
        <div className="flex items-center justify-center gap-6 mb-3">
          <StoreIcon name="ShieldCheck" className="w-4 h-4 text-[#017d6e]" />
          <span>{t("a1b2c3d4e5f6", "Secure WhatsApp Checkout")}</span>
          <span>•</span>
          <span>{t("b2c3d4e5f6a7", "Handmade in Sri Lanka")}</span>
        </div>
        <p className="text-[11px] text-[#8c9c95]">
          © {new Date().getFullYear()} {shop.name}. {t("c3d4e5f6a7b8", "Powered by Kadeo.")}
        </p>
      </footer>
    </div>
  );
}
