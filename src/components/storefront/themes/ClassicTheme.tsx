"use client";
import { StoreIcon } from "../StoreIcon";

import { useStoreText } from "../StoreContent";

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
  const { addItem } = useCart();
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Banner / Store Header */}
      {shop.banner_url && <img src={shop.banner_url} alt={shop.name} className="w-full max-h-96 object-cover" />}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            {shop.name}
          </h1>
          {shop.description && (
            <p className="text-sm text-zinc-500 mt-2 max-w-2xl">{shop.description}</p>
          )}
          {shop.address && (
            <p className="text-xs text-zinc-400 mt-1">📍 {shop.address}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <aside className="md:col-span-1 space-y-2">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">{t("6ccb60071be8", "Categories")}</h2>
            <div className="bg-white border border-zinc-200 rounded-xl p-2 space-y-1 shadow-2xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => {
                const imageSrc = p.images?.[0]?.storage_path;
                const isOut = p.stock_quantity <= 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition"
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

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-xs font-bold text-zinc-900 mt-1">
                          {formatCurrency(Number(p.price))}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isOut}
                        className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          isOut
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : addedId === p.id
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-900 text-white hover:bg-zinc-800"
                        }`}
                      >
                        {addedId === p.id ? (
                          <>
                            <StoreIcon name="Check" className="w-3.5 h-3.5" />{t("b68734c25910", "Added")}</>
                        ) : (
                          <>
                            <StoreIcon name="Plus" className="w-3.5 h-3.5" />{t("61cc55aa0453", "Add")}</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 text-center text-xs text-zinc-400">
        <p>© {new Date().getFullYear()} {shop.name}{t("4a4be9026c97", ". Powered by KADEO.")}</p>
      </footer>
    </div>
  );
}
