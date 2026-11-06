"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Loader2 } from "lucide-react";
import { quickUpdateStockAction } from "@/features/products/actions";
import s from "./DashboardShell.module.css";

interface LowStockItem {
  id: string;
  name: string;
  stock_quantity: number;
}

export function QuickStockAlert({ items }: { items: LowStockItem[] }) {
  const [stockMap, setStockMap] = useState<Record<string, number>>(() =>
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.stock_quantity }), {})
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleQuickAdd = async (productId: string, addAmount: number) => {
    setLoadingId(productId);
    try {
      const res = await quickUpdateStockAction(productId, addAmount);
      if (res.success && typeof res.newStock === "number") {
        setStockMap((prev) => ({ ...prev, [productId]: res.newStock }));
        setSuccessId(productId);
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
    <div className={s.lowStockCard}>
      <div className={s.lowStockHeader}>
        <div className={s.lowStockIcon}>
          <span style={{ fontSize: "18px" }}>⚠️</span>
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
  );
}
