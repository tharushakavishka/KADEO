"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  X,
  MessageCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/phone";

interface OrderItem {
  id: string;
  order_code: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderListClientProps {
  orders: OrderItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  currentStatus: string;
}

export function OrderListClient({
  orders,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  currentStatus,
}: OrderListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchQuery);

  const statuses = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || (key === "status" && val === "all")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ q: searchInput.trim() });
  }

  function handleClearSearch() {
    setSearchInput("");
    updateQuery({ q: null });
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs (Preserves Search Query) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => {
          const isActive =
            (!currentStatus && s.value === "all") || currentStatus === s.value;
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => updateQuery({ status: s.value })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar (Retains Status Filter) */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <label htmlFor="order-search-input" className="sr-only">
            Search orders by order code, customer name, or phone number
          </label>
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            id="order-search-input"
            type="text"
            placeholder="Search by order ID (e.g. KAD-2026), customer name, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear order search text"
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition shrink-0"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">
              {searchQuery || (currentStatus && currentStatus !== "all")
                ? "No orders found matching criteria"
                : "No customer orders yet"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
              {searchQuery || (currentStatus && currentStatus !== "all")
                ? "Try searching with a different order code or switch to All Orders filter."
                : "Incoming customer orders from your storefront will be listed here."}
            </p>
            {(searchQuery || (currentStatus && currentStatus !== "all")) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  router.push(pathname);
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {orders.map((order) => (
                <article key={order.id} className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-mono text-sm font-bold text-emerald-700 hover:underline"
                    >
                      {order.order_code}
                    </Link>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold capitalize">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{order.customer_name_snapshot}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString("en-LK")}
                      </p>
                    </div>
                    <strong className="text-sm">{formatCurrency(Number(order.total))}</strong>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition"
                    >
                      Manage order
                    </Link>
                    <a
                      href={buildWhatsAppUrl(order.customer_phone_snapshot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Contact customer
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Order Code</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">WhatsApp / Phone</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {orders.map((o) => {
                    const customerWhatsApp = buildWhatsAppUrl(o.customer_phone_snapshot);
                    return (
                      <tr key={o.id} className="hover:bg-zinc-50/60 transition">
                        <td className="px-5 py-3.5 font-mono text-zinc-900 font-semibold">
                          {o.order_code}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-900">
                          {o.customer_name_snapshot}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-600">
                          <a
                            href={customerWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chat on WhatsApp with customer ${o.customer_name_snapshot}`}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{o.customer_phone_snapshot}</span>
                          </a>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          {formatCurrency(Number(o.total))}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                              o.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : o.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : o.status === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500">
                          {new Date(o.created_at).toLocaleDateString("en-LK")}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center justify-end gap-1"
                            aria-label={`Manage order ${o.order_code}`}
                          >
                            <span>Manage</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bounded Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-medium">
                  Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount} orders
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateQuery({ page: String(currentPage - 1) })}
                    aria-label="Previous orders page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 font-semibold disabled:opacity-40 hover:bg-zinc-50 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="font-semibold text-zinc-900 px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateQuery({ page: String(currentPage + 1) })}
                    aria-label="Next orders page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 font-semibold disabled:opacity-40 hover:bg-zinc-50 transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
