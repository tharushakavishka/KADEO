"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Check, Loader2, CheckCircle2, X, Package } from "lucide-react";
import { quickUpdateStockAction } from "@/features/products/actions";
import s from "./DashboardShell.module.css";

interface LowStockItem {
  id: string;
  name: string;
  stock_quantity: number;
}

interface StockToast {
  id: string;
  productName: string;
  addedAmount: number;
  newStock: number;
}

export function QuickStockAlert({ items }: { items: LowStockItem[] }) {
  const [stockMap, setStockMap] = useState<Record<string, number>>(() =>
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.stock_quantity }), {})
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [toast, setToast] = useState<StockToast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleQuickAdd = async (productId: string, addAmount: number) => {
    setLoadingId(productId);
    try {
      const res = await quickUpdateStockAction(productId, addAmount);
      if (res.success && typeof res.newStock === "number") {
        setStockMap((prev) => ({ ...prev, [productId]: res.newStock }));
        setSuccessId(productId);
        const itemObj = items.find((it) => it.id === productId);
        setToast({
          id: `${productId}-${Date.now()}`,
          productName: itemObj?.name || "Product",
          addedAmount: addAmount,
          newStock: res.newStock,
        });
        setTimeout(() => setSuccessId(null), 2000);
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <>
      <div className={s.lowStockCard}>
        <div className={s.lowStockHeader}>
          <div className={s.lowStockIcon}>
            <Package size={20} className="text-amber-800" />
          </div>
          <div>
            <strong style={{ fontSize: "14px", color: "#92400e" }}>
              Low Inventory Alert ({items.length} {items.length === 1 ? "item" : "items"})
            </strong>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#b45309" }}>
              Items with 3 or fewer left. Use the 1-click <strong>+5 / +10</strong> buttons to restock instantly without opening product forms.
            </p>
          </div>
        </div>

        <div className={s.lowStockList}>
          {items.map((item) => {
            const currentQty = stockMap[item.id] ?? item.stock_quantity;
            const isLoading = loadingId === item.id;
            const isDone = successId === item.id;

            return (
              <div key={item.id} className={s.lowStockItemRow}>
                <Link
                  href={`/dashboard/products/${item.id}/edit`}
                  className={s.lowStockItemLink}
                  title="Edit product full details"
                >
                  <span>{item.name}</span>
                  <span
                    style={{
                      background: currentQty === 0 ? "#ef4444" : "#f59e0b",
                      color: "#ffffff",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {currentQty === 0 ? "Out of Stock" : `${currentQty} left`}
                  </span>
                </Link>

                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {isDone ? (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Check size={13} /> Updated
                    </span>
                  ) : isLoading ? (
                    <Loader2 size={13} className="animate-spin text-amber-700" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item.id, 5)}
                        className={s.btnRestockPill}
                        title="Add 5 to stock instantly"
                      >
                        <Plus size={10} /> 5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item.id, 10)}
                        className={s.btnRestockPill}
                        title="Add 10 to stock instantly"
                      >
                        <Plus size={10} /> 10
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Green Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-500/80 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-sm"
          style={{
            boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4), 0 8px 10px -6px rgba(5, 150, 105, 0.2)",
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs uppercase tracking-wide text-emerald-100">
                Stock Replenished!
              </span>
              <span className="bg-emerald-700/80 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                +{toast.addedAmount}
              </span>
            </div>
            <p className="text-xs font-medium text-emerald-50 truncate mt-0.5">
              <strong className="text-white">{toast.productName}</strong> restocked to{" "}
              <span className="underline decoration-white/40 font-bold">{toast.newStock} units</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-700/60 transition text-emerald-100 hover:text-white cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
