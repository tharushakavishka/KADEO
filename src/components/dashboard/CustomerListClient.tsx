"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users, Search, X, MessageCircle, ChevronLeft, ChevronRight, Phone, MapPin } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/phone";

interface CustomerItem {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
  orders?: Array<{ count: number }>;
}

interface CustomerListClientProps {
  customers: CustomerItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

export function CustomerListClient({
  customers,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
}: CustomerListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchQuery);

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "") {
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
    router.push(pathname);
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <label htmlFor="customer-search-input" className="sr-only">
            Search customers by name, phone number, or email
          </label>
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            id="customer-search-input"
            type="text"
            placeholder="Search by customer name, phone number, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#7960df] transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear customer search text"
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
            className="px-3.5 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition shrink-0"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Customer List Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">
              {searchQuery ? "No matching customers found" : "No customer records yet"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
              {searchQuery
                ? "Try searching with a different name, phone number, or email."
                : "Customer records are automatically captured when customers checkout on your WhatsApp storefront."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (< md, 360px/390px/768px, NO horizontal scrolling) */}
            <div className="divide-y divide-slate-100 md:hidden">
              {customers.map((c) => {
                const waUrl = buildWhatsAppUrl(c.phone);
                const orderCount = c.orders?.[0]?.count ?? 0;
                return (
                  <article key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{c.full_name}</h4>
                        <p className="text-xs text-slate-500">{c.email || "No email provided"}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-purple-50 text-[#7960df] border border-purple-100 px-2.5 py-0.5 text-xs font-semibold">
                        {orderCount} {orderCount === 1 ? "order" : "orders"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <a href={`tel:${c.phone}`} className="font-medium text-slate-800 hover:underline">
                          {c.phone}
                        </a>
                      </div>
                      {c.address ? (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed line-clamp-2">{c.address}</span>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No address on file</p>
                      )}
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Active {new Date(c.updated_at).toLocaleDateString("en-LK")}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open WhatsApp chat with ${c.full_name}`}
                        className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-700 transition"
                      >
                        <MessageCircle size={15} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${c.phone}`}
                        aria-label={`Call ${c.full_name}`}
                        className="min-h-[40px] px-3.5 py-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Table View (hidden on small screens, visible md:block) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Address</th>
                    <th className="px-5 py-3">Orders Placed</th>
                    <th className="px-5 py-3">Last Active</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {customers.map((c) => {
                    const waUrl = buildWhatsAppUrl(c.phone);
                    const orderCount = c.orders?.[0]?.count ?? 0;
                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-zinc-900 text-sm">{c.full_name}</p>
                          <p className="text-[11px] text-zinc-400">{c.email || "No email provided"}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-zinc-700">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{c.phone}</span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {c.address ? (
                            <div className="flex items-start gap-1.5 text-zinc-600 max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{c.address}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic">None recorded</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          {orderCount} {orderCount === 1 ? "order" : "orders"}
                        </td>

                        <td className="px-5 py-3.5 text-zinc-500">
                          {new Date(c.updated_at).toLocaleDateString("en-LK")}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open WhatsApp chat with ${c.full_name}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
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
                  Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount} customers
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateQuery({ page: String(currentPage - 1) })}
                    aria-label="Previous customer page"
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 font-semibold disabled:opacity-40 hover:bg-zinc-50 transition"
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
                    aria-label="Next customer page"
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 font-semibold disabled:opacity-40 hover:bg-zinc-50 transition"
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
