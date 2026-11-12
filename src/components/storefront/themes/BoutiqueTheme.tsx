"use client";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";

import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/phone";
import { Plus, Check, ShoppingBag, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
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

export function BoutiqueTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();
  const cardStyle = customStyle(t, "card");
  const buttonStyle = customStyle(t, "buttons");

  const heroVisible = (part: string) => t(`visibility:hero:${part}`, "shown") !== "hidden";
  const heroContentVisible = heroVisible("content") && ["eyebrow", "title", "description"].some(heroVisible);
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

  const heroBanner = t("element:hero:image", t("hero:image_url", shop.banner_url || ""));

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#192d2a] pb-28 font-serif">
      {/* Editorial Hero */}
      {heroBanner && (
        <img
          data-studio-element="hero_image"
          src={heroBanner}
          alt={t("element:hero_title:text", shop.name)}
          className="w-full max-h-96 2xl:max-h-[460px] object-cover"
        />
      )}
      {heroContentVisible && (
      <section className="py-14 sm:py-20 lg:py-28 px-4 text-center max-w-4xl mx-auto border-b border-[#e8e4dc]">
        {heroVisible("eyebrow") && (
        <span data-studio-element="hero_eyebrow" className="font-sans text-[11px] tracking-widest uppercase text-[#017d6e] font-extrabold mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2eb]">
          <StoreIcon name="Sparkles" className="w-3.5 h-3.5" />{t("fec5c948265e", "The Curated Collection")}</span>
        )}
        {heroVisible("title") && (
        <h1 data-studio-element="hero_title" className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#192d2a] mb-5">
          {shop.name}
        </h1>
        )}
        {shop.description && heroVisible("description") && (
          <p data-studio-element="hero_desc" className="font-sans text-xs sm:text-sm md:text-base text-[#5a6861] max-w-lg mx-auto leading-relaxed">
            {t("element:hero_desc:text", shop.description || "")}
          </p>
        )}
      </section>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto font-sans text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`pb-1.5 uppercase tracking-wider transition shrink-0 ${
              selectedCategory === "all"
                ? "font-extrabold text-[#192d2a] border-b-2 border-[#192d2a]"
                : "text-[#6c7771] hover:text-[#192d2a]"
            }`}
          >{t("60fe93b62249", "All Products")}</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`pb-1.5 uppercase tracking-wider transition shrink-0 ${
                selectedCategory === c.name
                  ? "font-extrabold text-[#192d2a] border-b-2 border-[#192d2a]"
                  : "text-[#6c7771] hover:text-[#192d2a]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      <section className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 py-8 sm:py-10 font-sans">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <StoreIcon name="ShoppingBag" className="w-10 h-10 text-[#aab8b2] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#192d2a]">{t("5c80a901a877", "No items in this collection")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-8 lg:gap-10">
            {filteredProducts.map((p) => {
              const imageSrc = p.images?.[0]?.storage_path;
              const isOut = p.stock_quantity <= 0;
              const isAdded = addedId === p.id;

              return (
                <div key={p.id} data-studio-element="product_card" data-style-part="card" data-custom-text={Boolean(cardStyle.color)} style={cardStyle} className="group flex flex-col p-3.5 sm:p-4 rounded-3xl border border-[#e8e4dc] transition-all bg-white hover:shadow-lg">
                  <div className="relative aspect-4/5 w-full bg-[#f4eedf] rounded-2xl sm:rounded-3xl overflow-hidden mb-3.5 sm:mb-4 border border-[#e8e4dc]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8e9c96]">
                        <StoreIcon name="ShoppingBag" className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={isOut}
                      data-studio-element="hero_cta"
                      data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={!isOut && !isAdded ? buttonStyle : undefined} className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2.5 sm:p-3 rounded-2xl shadow-lg transition-all cursor-pointer ${
                        isOut
                          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          : isAdded
                          ? "bg-[#017d6e] text-white"
                          : "bg-[#192d2a] text-[#faf8f2] hover:bg-[#122624]"
                      }`}
                    >
                      {isAdded ? <StoreIcon name="Check" className="w-4 h-4" /> : <StoreIcon name="Plus" className="w-4 h-4" />}
                    </button>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg text-[#192d2a] group-hover:text-[#017d6e] transition-colors line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-2 flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-sm font-bold text-[#192d2a]">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-[11px] text-[#017d6e] font-medium">{t("be1cda95600d", "WhatsApp Delivery")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Dock */}
      <div className="fixed bottom-5 inset-x-0 z-30 px-4 flex justify-center pointer-events-none font-sans">
        <div className="pointer-events-auto bg-[#192d2a]/95 backdrop-blur-lg border border-[#2a4540] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-4 max-w-[calc(100vw-32px)]">
          <a
            href={`https://wa.me/${cleanWaNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold hover:text-[#96d2b6] transition py-1"
          >
            <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#96d2b6]" />
            <span>{t("8eb8a88ae376", "Chat on WhatsApp")}</span>
          </a>
          <div className="h-4 w-[1px] bg-white/20" />
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-xs font-bold hover:text-[#96d2b6] transition py-1 cursor-pointer"
          >
            <div className="relative">
              <StoreIcon name="ShoppingBag" className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#017d6e] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </div>
            <span>{t("694fd79e26d5", "Bag")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
