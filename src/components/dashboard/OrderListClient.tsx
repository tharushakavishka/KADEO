"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  X,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Settings,
  XCircle,
  Calendar,
  Filter,
  ChevronDown,
  ExternalLink,
  MoreVertical,
  User,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/phone";

export interface OrderItem {
  id: string;
  order_code: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  total: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderListClientProps {
  orders: OrderItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  currentStatus: string;
  stageCounts?: {
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
  };
}

export function OrderListClient({
  orders,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  currentStatus,
  stageCounts = { pending: 0, processing: 0, shipped: 0, completed: 0 },
}: OrderListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const statuses = [
    { label: "All Orders", value: "all", icon: Package },
    { label: "Pending", value: "pending", icon: Clock },
    { label: "Confirmed", value: "confirmed", icon: CheckCircle2 },
    { label: "Processing", value: "processing", icon: Settings },
    { label: "Shipped", value: "shipped", icon: Truck },
    { label: "Completed", value: "completed", icon: CheckCircle2 },
    { label: "Cancelled", value: "cancelled", icon: XCircle },
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

  function renderStatusBadge(status: string) {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#16a34a]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (status === "confirmed" || status === "shipped") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0284c7]">
          {status === "shipped" ? <Truck className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309]">
        <Clock className="w-3.5 h-3.5" />
        <span className="capitalize">{status}</span>
      </span>
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
            ORDER MANAGEMENT
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Store Orders
            </h1>
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46]">
              {totalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            View, track, and update fulfilment for incoming customer WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 self-start md:self-center">
          {/* 3D Bags & Cart Illustration Graphic */}
          <div className="hidden xl:block absolute right-48 top-0 pointer-events-none select-none">
            <img
              src="/images/orders-header-illustration.png"
              alt="Orders illustration"
              className="h-28 object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <Link
            href="/dashboard/pos"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#064e3b] hover:bg-[#032e23] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR FULFILLMENT STATUS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Needs Confirmation */}
        <button
          type="button"
          onClick={() => updateQuery({ status: "pending" })}
          className={`bg-white rounded-3xl border ${
            currentStatus === "pending" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-100"
          } shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md text-left w-full cursor-pointer`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Needs Confirm</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {stageCounts.pending}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
        </button>

        {/* To Pack */}
        <button
          type="button"
          onClick={() => updateQuery({ status: "processing" })}
          className={`bg-white rounded-3xl border ${
            currentStatus === "processing" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-100"
          } shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md text-left w-full cursor-pointer`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">To Pack</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {stageCounts.processing}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
        </button>

        {/* On The Way */}
        <button
          type="button"
          onClick={() => updateQuery({ status: "shipped" })}
          className={`bg-white rounded-3xl border ${
            currentStatus === "shipped" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-100"
          } shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md text-left w-full cursor-pointer`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">On The Way</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {stageCounts.shipped}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => updateQuery({ status: "completed" })}
          className={`bg-white rounded-3xl border ${
            currentStatus === "completed" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-100"
          } shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center justify-between transition hover:shadow-md text-left w-full cursor-pointer`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Completed</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
                {stageCounts.completed}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* 3. STATUS FILTER PILLS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => {
          const isActive =
            (!currentStatus && s.value === "all") || currentStatus === s.value;
          const Icon = s.icon;
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => updateQuery({ status: s.value })}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                isActive
                  ? "bg-[#064e3b] text-white shadow-sm"
                  : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <label htmlFor="order-search-input" className="sr-only">
            Search orders by order ID, customer name, or phone
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            id="order-search-input"
            type="text"
            placeholder="Search by order ID (e.g. KAD-2026), customer name, or phone..."
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
          {/* Date Range */}
          <div className="relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-2xs hover:border-slate-300 transition cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-700 pointer-events-none shrink-0" />
            <span className="text-xs font-bold text-slate-800 px-2 py-0.5">Select Date</span>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter */}
          <div className="relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-2xs hover:border-slate-300 transition cursor-pointer">
            <Filter className="w-4 h-4 text-slate-700 pointer-events-none shrink-0" />
            <span className="text-xs font-bold text-slate-800 px-2 py-0.5">Filter</span>
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

      {/* 5. ORDERS DATA TABLE & MOBILE CARDS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* MOBILE CARDS VIEW (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-900">No customer orders yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Orders placed via your storefront or created manually in Sales Desk will appear here.
              </p>
            </div>
          ) : (
            orders.map((o) => {
              const isMenuOpen = activeMenuId === o.id;
              const dateStr = new Date(o.created_at).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              });
              const cleanPhone = (o.customer_phone_snapshot || "").replace(/[^0-9]/g, "");

              return (
                <div key={o.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition">
                  {/* Top row: Order Code, Status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {o.order_code}
                      </span>
                    </div>
                    {renderStatusBadge(o.status)}
                  </div>

                  {/* Customer and phone info */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="font-bold text-slate-800 truncate">
                        {o.customer_name_snapshot}
                      </span>
                    </div>

                    <a
                      href={buildWhatsAppUrl(cleanPhone, `Hi ${o.customer_name_snapshot}, regarding your order ${o.order_code}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs hover:underline shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                      <span>{o.customer_phone_snapshot}</span>
                    </a>
                  </div>

                  {/* Amount, Date, Manage & Options */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/70">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{dateStr}</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(o.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#10b981] bg-white text-[#059669] hover:bg-[#ecfdf5] text-xs font-bold transition shadow-2xs"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : o.id)}
                        aria-label={`More options for order ${o.order_code}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 bottom-9 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 text-left">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Details</span>
                          </Link>
                          <a
                            href={buildWhatsAppUrl(cleanPhone, `Order update: ${o.order_code}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      )}
                    </div>
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
                <th className="py-4 pl-6 pr-4 font-extrabold text-slate-700">ORDER CODE</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">CUSTOMER</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">WHATSAPP / PHONE</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">TOTAL AMOUNT</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">STATUS</th>
                <th className="py-4 px-4 font-extrabold text-slate-700">DATE</th>
                <th className="py-4 pr-6 pl-4 text-right font-extrabold text-slate-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="w-16 h-16 rounded-3xl bg-[#f0fdf4] text-emerald-600 mx-auto flex items-center justify-center mb-3">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-900">No customer orders yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Orders placed via your storefront or created manually in Sales Desk will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isMenuOpen = activeMenuId === o.id;
                  const dateStr = new Date(o.created_at).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  });
                  const cleanPhone = (o.customer_phone_snapshot || "").replace(/[^0-9]/g, "");

                  return (
                    <tr key={o.id} className="hover:bg-[#fcfdfd] transition group">
                      {/* Order Code */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <span className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                            {o.order_code}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-900">
                            {o.customer_name_snapshot}
                          </span>
                        </div>
                      </td>

                      {/* WhatsApp / Phone */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                          <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366] shrink-0" />
                          <a
                            href={buildWhatsAppUrl(cleanPhone, `Hi ${o.customer_name_snapshot}, regarding your order ${o.order_code}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            title="Message on WhatsApp"
                          >
                            {o.customer_phone_snapshot}
                          </a>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(o.total)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{renderStatusBadge(o.status)}</td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2 relative">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#10b981] bg-white text-[#059669] hover:bg-[#ecfdf5] text-xs font-bold transition shadow-2xs"
                          >
                            <span>Manage</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : o.id)}
                            aria-label={`More options for order ${o.order_code}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 text-left">
                              <Link
                                href={`/dashboard/orders/${o.id}`}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </Link>
                              <a
                                href={buildWhatsAppUrl(cleanPhone, `Order update: ${o.order_code}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp Customer</span>
                              </a>
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
            Showing {fromRow} to {toRow} of {totalCount} {totalCount === 1 ? "order" : "orders"}
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
