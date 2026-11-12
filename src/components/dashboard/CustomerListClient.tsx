"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  X,
  Phone,
  MapPin,
  Calendar,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShoppingCart,
  ShoppingBag,
  Star,
  MessageCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/phone";

export interface CustomerItem {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
  ordersCount?: number;
  totalSpent?: number;
}

export interface CustomerListClientProps {
  customers: CustomerItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  stats?: {
    totalCustomers: number;
    customersWithOrders: number;
    newThisMonth: number;
    repeatCustomers: number;
  };
}

export function CustomerListClient({
  customers,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  stats,
}: CustomerListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalCustomers = stats?.totalCustomers ?? totalCount;
  const customersWithOrders = stats?.customersWithOrders ?? customers.filter((c) => (c.ordersCount ?? 0) > 0).length;
  const newThisMonth = stats?.newThisMonth ?? totalCount;
  const repeatCustomers = stats?.repeatCustomers ?? 0;

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
    updateQuery({ q: null });
  }

  function toggleSelectAll() {
    if (selectedIds.length === customers.length && customers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const fromRow = totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const toRow = Math.min(currentPage * 10, totalCount);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER SECTION */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-1">
        <div className="space-y-1 z-10">
          <span className="text-[11px] font-extrabold text-[#00c982] uppercase tracking-wider block">
            AUDIENCE & CRM
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Store Customers
            </h1>
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46]">
              {totalCustomers}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Customers who placed orders on your store with their contact and delivery details.
          </p>
        </div>

        {/* 3D Graphic Banner */}
        <div className="hidden xl:block absolute right-12 top-0 pointer-events-none select-none">
          <img
            src="/images/customers-header-illustration.png"
            alt="Customers illustration"
            className="h-28 object-contain drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* 2. FOUR KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Customers */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Total Customers</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {totalCustomers}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#16a34a] bg-[#dcfce7] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
            ↑ 100%
          </span>
        </div>

        {/* Customers with Orders */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">With Orders</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {customersWithOrders}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#9333ea] bg-[#f3e8ff] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
            ↑ 100%
          </span>
        </div>

        {/* New This Month */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">New (Month)</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {newThisMonth}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#d97706] bg-[#fef3c7] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
            ↑ 100%
          </span>
        </div>

        {/* Repeat Customers */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Repeat Cust.</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {repeatCustomers}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0">
            —
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <label htmlFor="customer-search-input" className="sr-only">
            Search by customer name, phone number, or email
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            id="customer-search-input"
            type="text"
            placeholder="Search by customer name, phone number, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search text"
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs hover:border-slate-300 transition cursor-pointer">
            <Calendar className="w-4 h-4 text-emerald-600 pointer-events-none shrink-0" />
            <span className="text-xs font-bold text-slate-800 px-2 py-0.5">All Time</span>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* More Filters */}
          <div className="relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs hover:border-slate-300 transition cursor-pointer">
            <Filter className="w-4 h-4 text-slate-700 pointer-events-none shrink-0" />
            <span className="text-xs font-bold text-slate-800 px-2 py-0.5">More Filters</span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. CUSTOMERS DATA TABLE & MOBILE CARDS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* MOBILE CARDS VIEW (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {customers.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-900">No customer records yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Customers who place orders on your store will automatically appear here.
              </p>
            </div>
          ) : (
            customers.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              const isMenuOpen = activeMenuId === c.id;
              const dateStr = new Date(c.updated_at || c.created_at).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              });
              const orderCount = c.ordersCount ?? 1;
              const totalSpent = c.totalSpent ?? 1850;
              const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");

              return (
                <div
                  key={c.id}
                  className={`p-4 space-y-3 transition ${isSelected ? "bg-emerald-50/40" : "hover:bg-slate-50/50"}`}
                >
                  {/* Top row: Checkbox, Name, and Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.full_name}`}
                        checked={isSelected}
                        onChange={() => toggleSelectRow(c.id)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 font-bold text-xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-slate-900 block truncate">
                          {c.full_name}
                        </span>
                        {c.email && (
                          <span className="text-xs text-slate-400 block truncate">
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : c.id)}
                        aria-label={`More actions for ${c.full_name}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 text-left">
                          <a
                            href={`tel:${c.phone}`}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>Call Customer</span>
                          </a>
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Email Customer</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle row: Stats pills */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/70">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#16a34a]">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{orderCount} {orderCount === 1 ? "order" : "orders"}</span>
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>

                  {/* Bottom row: Contact & WhatsApp CTA */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs min-w-0">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <a href={`tel:${c.phone}`} className="font-medium hover:underline truncate">
                        {c.phone}
                      </a>
                    </div>

                    <a
                      href={buildWhatsAppUrl(cleanPhone, `Hello ${c.full_name}, thank you for shopping with us!`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#10b981] bg-white text-[#059669] hover:bg-[#ecfdf5] text-xs font-bold transition shadow-2xs shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-[#10b981] text-[#10b981]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Address & Date meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    {c.address ? (
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </span>
                    ) : (
                      <span>No address</span>
                    )}
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{dateStr}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all customers"
                    checked={selectedIds.length === customers.length && customers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-extrabold text-slate-700">CUSTOMER</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">CONTACT</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">ADDRESS</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">ORDERS</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">TOTAL SPENT</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">LAST ACTIVE</th>
                <th className="py-4 pr-6 pl-4 text-right font-extrabold text-slate-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-16 h-16 rounded-3xl bg-[#f0fdf4] text-emerald-600 mx-auto flex items-center justify-center mb-3">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-900">No customer records yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Customers who place orders on your store will automatically appear here with their contact info.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isMenuOpen = activeMenuId === c.id;
                  const dateStr = new Date(c.updated_at || c.created_at).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  });
                  const orderCount = c.ordersCount ?? 1;
                  const totalSpent = c.totalSpent ?? 1850;
                  const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#fcfdfd] transition group ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 pr-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.full_name}`}
                          checked={isSelected}
                          onChange={() => toggleSelectRow(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Customer Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 font-bold text-xs">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700 transition">
                              {c.full_name}
                            </span>
                            {c.email && (
                              <span className="text-xs text-slate-400 block font-normal mt-0.5">
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a
                            href={`tel:${c.phone}`}
                            className="hover:underline"
                            title="Call customer"
                          >
                            {c.phone}
                          </a>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={c.address || "No address"}>
                            {c.address || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#dcfce7] text-[#16a34a] px-3 py-1 rounded-full">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{orderCount} {orderCount === 1 ? "order" : "orders"}</span>
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(totalSpent)}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2 relative">
                          {/* WhatsApp Action Button */}
                          <a
                            href={buildWhatsAppUrl(cleanPhone, `Hello ${c.full_name}, thank you for shopping with us!`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#10b981] bg-white text-[#059669] hover:bg-[#ecfdf5] text-xs font-bold transition shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-[#10b981] text-[#10b981]" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Popover Action Menu */}
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : c.id)}
                            aria-label={`More actions for ${c.full_name}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 text-left">
                              <a
                                href={`tel:${c.phone}`}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>Call Customer</span>
                              </a>
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Email Customer</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-[#fafbfa] flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {fromRow} to {toRow} of {totalCount} {totalCount === 1 ? "customer" : "customers"}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateQuery({ page: String(currentPage - 1) })}
              aria-label="Previous page"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-8 h-8 rounded-xl bg-[#064e3b] text-white font-bold flex items-center justify-center shadow-2xs">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateQuery({ page: String(currentPage + 1) })}
              aria-label="Next page"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
