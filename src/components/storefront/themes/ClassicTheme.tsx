"use client";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";
import { customStyle } from "@/lib/store-custom-styles";

import { useCart } from "../CartDrawer";
import { formatCurrency } from "@/lib/utils";
import { Plus, Check, ShoppingBag } from "lucide-react";
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

export function ClassicTheme({ shop, categories, products }: ThemeProps) {
  const t = useStoreText();
  const { addItem, setIsOpen, totalCount } = useCart();
  const cardStyle = customStyle(t, "card");
  const buttonStyle = customStyle(t, "buttons");

  const heroVisible = (part: string) => t(`visibility:hero:${part}`, "shown") !== "hidden";
  const heroContentVisible = heroVisible("content") && ["title", "description"].some(heroVisible);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Banner / Store Header */}
      {heroBanner && (
        <img
          data-studio-element="hero_image"
          src={heroBanner}
          alt={shop.name}
          className="w-full max-h-96 2xl:max-h-[460px] object-cover"
        />
      )}
      {heroContentVisible && (
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {heroVisible("title") && (
          <h1 data-studio-element="hero_title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900">
            {shop.name}
          </h1>
          )}
          {shop.description && heroVisible("description") && (
            <p data-studio-element="hero_desc" className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-2xl leading-relaxed">{shop.description}</p>
          )}
          {shop.address && (
            <p className="text-xs text-zinc-400 mt-1">📍 {shop.address}</p>
          )}
        </div>
      </div>
      )}

      <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Categories Sidebar (Horizontal scroll on mobile, vertical card on desktop) */}
          <aside className="md:col-span-1 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-3 hidden md:block">
              {t("4beeb61e93ca", "Categories")}
            </h2>
            <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                style={selectedCategory === "all" ? buttonStyle : undefined}
                className={`whitespace-nowrap md:whitespace-normal shrink-0 text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === "all"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >{t("e0001a4cd5c6", "All Products (")}{products.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  style={selectedCategory === c.name ? buttonStyle : undefined}
                  className={`whitespace-nowrap md:whitespace-normal shrink-0 text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === c.name
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((p) => {
                const imageSrc = p.images?.[0]?.storage_path;
                const isOut = p.stock_quantity <= 0;

                return (
                  <div
                    key={p.id}
                    data-studio-element="product_card"
                    data-style-part="card" data-custom-text={Boolean(cardStyle.color)} style={cardStyle} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div className="aspect-square bg-zinc-100 relative">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <StoreIcon name="ShoppingBag" className="w-6 h-6" />
                        </div>
                      )}
                      {isOut && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{t("8b78c7aec415", "Out of stock")}</span>
                      )}
                    </div>

                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 line-clamp-2 leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs font-bold text-zinc-900 mt-1">
                          {formatCurrency(Number(p.price))}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isOut}
                        data-studio-element="hero_cta"
                        data-style-part="buttons" data-custom-text={Boolean(buttonStyle.color)} style={buttonStyle} className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isOut
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : "bg-zinc-900 text-white hover:bg-zinc-800"
                        }`}
                      >
                        <StoreIcon name="ShoppingBag" className="w-3.5 h-3.5" />
                        <span>{isOut ? t("75b42d13dae7", "Sold Out") : t("3a910ecfb364", "Add to Bag")}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
