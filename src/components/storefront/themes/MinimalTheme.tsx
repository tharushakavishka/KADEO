"use client";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";

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

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#192d2a] pb-28 selection:bg-[#192d2a] selection:text-white">
      {/* Hero Section */}
      {shop.banner_url && <img src={shop.banner_url} alt={shop.name} className="w-full max-h-96 object-cover" />}
      <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-20 px-4 border-b border-[#e8e4dc] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5ede1]/60 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f2eb] border border-[#c4e5d8] text-[#192d2a] text-xs font-bold mb-5 shadow-2xs">
            <StoreIcon name="Sparkles" className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>{t("0debef41f459", "Handcrafted & Authentic • Sri Lanka")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#192d2a] mb-5 leading-[1.1]">
            {shop.name}
          </h1>

          {shop.description && (
            <p className="text-base sm:text-lg text-[#5a6861] max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
              {shop.description}
            </p>
          )}

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-[#6a7872]">
            <span className="flex items-center gap-1.5">
              <StoreIcon name="Truck" className="w-4 h-4 text-[#017d6e]" />{t("532223c4bb3b", "Islandwide COD Delivery")}</span>
            <span className="flex items-center gap-1.5">
              <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#017d6e]" />{t("91044de3c78f", "Instant WhatsApp Confirmation")}</span>
            <span className="flex items-center gap-1.5">
              <StoreIcon name="ShieldCheck" className="w-4 h-4 text-[#017d6e]" />{t("6dab2bb87b5f", "Verified Local Seller")}</span>
          </div>
        </div>
      </section>

      {/* High-Impact Ceylon Emerald Promotional Banner (Figma Signature Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#192d2a] via-[#122624] to-[#1a3833] p-8 sm:p-12 text-white shadow-xl overflow-hidden border border-[#23423d]">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#017d6e]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-[#e0f2eb]/20 text-[#e0f2eb] text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">{t("fab32a6fabf0", "Exclusive Direct Deal")}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">{t("014c127b8656", "Order directly via WhatsApp for quick delivery & Cash on Delivery.")}</h2>
            <p className="text-sm text-[#c7d5cf] mb-6 leading-relaxed">{t("7d1325a12044", "No complicated signups. Browse items, add to cart, and send your order straight to our WhatsApp business line.")}</p>
            <a
              href={`https://wa.me/${cleanWaNumber}?text=Hello!%20I%20am%20browsing%20your%20Kadeo%20store%20and%20would%20like%20to%20inquire.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white text-xs font-bold transition shadow-md"
            >
              <StoreIcon name="MessageCircle" className="w-4 h-4" />
              <span>{t("da0bf4f5c15f", "Ask a Question on WhatsApp")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
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
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#e8e4dc] p-8">
            <StoreIcon name="ShoppingBag" className="w-12 h-12 text-[#b0beba] mx-auto mb-3" />
            <p className="text-base font-bold text-[#192d2a]">{t("2ab447eb84f5", "No items found")}</p>
            <p className="text-xs text-[#6a7872] mt-1">{t("0ac2dba00b26", "Check back soon for new arrivals in this collection.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((p) => {
              const imageSrc = p.images?.[0]?.storage_path;
              const isOut = p.stock_quantity <= 0;
              const isAdded = addedId === p.id;

              return (
                <div
                  key={p.id}
                  className="group flex flex-col bg-white rounded-3xl border border-[#e8e4dc] overflow-hidden hover:shadow-xl hover:border-[#cfc7ba] transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-[#f4eedf] overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#8e9c96] p-4 text-center bg-gradient-to-b from-[#f7f2e8] to-[#ede4d4]">
                        <StoreIcon name="ShoppingBag" className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-[11px] font-semibold tracking-wider uppercase">{t("e0d3490c7810", "Authentic Craft")}</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isOut ? (
                        <span className="px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">{t("76fd56000e68", "Sold Out")}</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#192d2a]/85 backdrop-blur-xs text-[#e0f2eb] text-[10px] font-bold uppercase tracking-wider shadow-xs">{t("784f6e566a23", "In Stock (")}{p.stock_quantity})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {p.category?.name && (
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#017d6e] mb-1.5 block">
                          {p.category.name}
                        </span>
                      )}
                      <h3 className="font-extrabold text-base text-[#192d2a] group-hover:text-[#017d6e] transition-colors leading-snug">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-[#6a7872] line-clamp-2 mt-2 leading-relaxed font-normal">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#f0ebe1] flex items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-[#192d2a]">
                          {formatCurrency(p.price)}
                        </div>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <div className="text-xs text-[#9aa6a1] line-through">
                            {formatCurrency(p.compare_at_price)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isOut}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isOut
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : isAdded
                            ? "bg-[#017d6e] text-white"
                            : "bg-[#192d2a] text-[#faf8f2] hover:bg-[#122624]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <StoreIcon name="Check" className="w-3.5 h-3.5" />
                            <span>{t("b68734c25910", "Added")}</span>
                          </>
                        ) : (
                          <>
                            <StoreIcon name="Plus" className="w-3.5 h-3.5 text-[#e0f2eb]" />
                            <span>{t("61cc55aa0453", "Add")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Dock (Mobile Friendly Figma Component) */}
      <div className="fixed bottom-5 inset-x-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-[#192d2a]/95 backdrop-blur-lg border border-[#2a4540] text-white px-5 py-3 rounded-3xl shadow-2xl flex items-center gap-4">
          <a
            href={`https://wa.me/${cleanWaNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-[#e0f2eb] hover:text-white transition"
          >
            <StoreIcon name="MessageCircle" className="w-4 h-4 text-[#017d6e]" />
            <span>{t("4cd102e07ebf", "Chat Seller")}</span>
          </a>

          <div className="w-px h-5 bg-[#314f4a]" />

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-white hover:text-[#e0f2eb] transition cursor-pointer"
          >
            <StoreIcon name="ShoppingBag" className="w-4 h-4 text-[#e0f2eb]" />
            <span>{t("7abd6c34e1d0", "View Cart")}</span>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#017d6e] text-white text-[10px] font-black">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
