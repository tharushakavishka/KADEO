"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Layers,
  Eye,
  MoreHorizontal,
  LayoutGrid,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { deleteProductAction, archiveProductAction } from "@/features/products/actions";

export interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  status: "active" | "draft" | "out_of_stock";
  category_id?: string | null;
  category?: { name: string } | null;
  images?: Array<{ storage_path: string }>;
  created_at: string;
}

export interface ProductListClientProps {
  products: ProductItem[];
  categories: Array<{ id: string; name: string }>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  totalProducts?: number;
  totalCategories?: number;
  inStockCount?: number;
  outOfStockCount?: number;
  shopName?: string;
  shopSlug?: string;
}

export function ProductListClient({
  products,
  categories,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  categoryFilter,
  statusFilter,
  totalProducts = products.length,
  totalCategories = categories.length,
  inStockCount = products.filter((p) => p.stock_quantity > 0).length,
  outOfStockCount = products.filter((p) => p.stock_quantity <= 0).length,
  shopName,
  shopSlug,
}: ProductListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search state
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Row selection checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Popover menu for row actions
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Archive state
  const [archiveBusyId, setArchiveBusyId] = useState<string | null>(null);

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    // Reset to page 1 whenever search or filters change (unless page is explicitly updated)
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ q: searchInput.trim() });
  }

  function handleClearFilters() {
    setSearchInput("");
    router.push(pathname);
  }

  function toggleSelectAll() {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const res = await deleteProductAction(productToDelete.id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        setProductToDelete(null);
        setSelectedIds((prev) => prev.filter((id) => id !== productToDelete.id));
        router.refresh();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete product.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleArchiveQuick(product: ProductItem) {
    setArchiveBusyId(product.id);
    setActionMenuOpenId(null);
    try {
      await archiveProductAction(product.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setArchiveBusyId(null);
    }
  }

  const hasActiveFilters = Boolean(
    searchQuery || categoryFilter || (statusFilter && statusFilter !== "all")
  );

  const fromRow = totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const toRow = Math.min(currentPage * 10, totalCount);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER SECTION */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-1">
        <div className="space-y-1 z-10">
          <span className="text-[11px] font-extrabold text-[#00c982] uppercase tracking-wider block">
            INVENTORY & CATALOG
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Products
            </h1>
            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46]">
              {totalProducts}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your items, pricing, stock levels, and store visibility.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 self-start md:self-center">
          {/* 3D Bags & Plant Illustration Graphic */}
          <div className="hidden xl:block absolute right-52 top-0 pointer-events-none select-none">
            <img
              src="/images/products-header-illustration.png"
              alt="Catalog illustration"
              className="h-28 object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl bg-[#064e3b] hover:bg-[#032e23] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR KPI STAT CARDS (Responsive 2x2 on mobile, 4 in row on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 transition hover:shadow-md">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Total Products</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {totalProducts}
            </span>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 transition hover:shadow-md">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Total Categories</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {totalCategories}
            </span>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 transition hover:shadow-md">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">In Stock</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {inStockCount}
            </span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 transition hover:shadow-md">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 block truncate">Out of Stock</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block mt-0.5">
              {outOfStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <label htmlFor="product-search-input" className="sr-only">
            Search by product name, SKU, or description
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Search by product name, SKU, or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateQuery({ q: null });
              }}
              aria-label="Clear search text"
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filter Dropdowns (Responsive wrap on mobile) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Categories Dropdown */}
          <div className="flex-1 sm:flex-initial min-w-[130px] relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-2xs hover:border-slate-300 transition">
            <LayoutGrid className="w-4 h-4 text-slate-700 pointer-events-none shrink-0" />
            <select
              id="product-category-filter"
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => updateQuery({ category: e.target.value })}
              className="appearance-none bg-transparent text-xs font-bold text-slate-800 pr-7 pl-2 py-0.5 outline-none cursor-pointer w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>

          {/* Statuses Dropdown */}
          <div className="flex-1 sm:flex-initial min-w-[130px] relative inline-flex items-center bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-2xs hover:border-slate-300 transition">
            <Filter className="w-4 h-4 text-slate-700 pointer-events-none shrink-0" />
            <select
              id="product-status-filter"
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => updateQuery({ status: e.target.value })}
              className="appearance-none bg-transparent text-xs font-bold text-slate-800 pr-7 pl-2 py-0.5 outline-none cursor-pointer w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-2xl transition shadow-2xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. PRODUCTS TABLE & MOBILE CARDS CONTAINER */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              {hasActiveFilters ? "No matching products found" : "No products added yet"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
              {hasActiveFilters
                ? "Try adjusting your search keywords or clear filters to view your catalog."
                : "Add your first product to display it on your public storefront and receive customer orders."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#064e3b] text-white text-xs font-bold shadow-sm hover:bg-[#032e23] transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card List View (Phones only) */}
            <div className="md:hidden divide-y divide-slate-100">
              {products.map((p) => {
                const imageSrc =
                  p.images?.[0]?.storage_path || "/images/herbal-oil-mockup-thumb.png";
                const isChecked = selectedIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className={`p-4 space-y-3 transition ${
                      isChecked ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    {/* Header Row: Checkbox, Thumbnail, Title, SKU */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={isChecked}
                        onChange={() => toggleSelectRow(p.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#00c982] focus:ring-[#00c982] cursor-pointer mt-1"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.sku || "No SKU"}
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row: Price, Stock, Status */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">
                            {formatCurrency(Number(p.price))}
                          </span>
                          {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                            <del className="text-xs text-slate-400 font-normal">
                              {formatCurrency(Number(p.compare_at_price))}
                            </del>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">
                          {p.stock_quantity > 0 ? (
                            <span className="text-emerald-700 font-bold">{p.stock_quantity} in stock</span>
                          ) : (
                            <span className="text-rose-600 font-bold">Out of stock</span>
                          )}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <div>
                        {p.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                            <span>Active</span>
                          </span>
                        ) : p.status === "out_of_stock" || p.stock_quantity <= 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fee2e2] text-[#b91c1c]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                            <span>Out of Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Draft</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setProductToDelete(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        disabled={archiveBusyId === p.id}
                        onClick={() => handleArchiveQuick(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{p.status === "draft" ? "Publish" : "Draft"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout (Tablets & Desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="w-12 px-5 py-4 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select all products"
                        checked={selectedIds.length > 0 && selectedIds.length === products.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-[#00c982] focus:ring-[#00c982] cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4">PRODUCT</th>
                    <th className="px-5 py-4">CATEGORY</th>
                    <th className="px-5 py-4">PRICE</th>
                    <th className="px-5 py-4">STOCK</th>
                    <th className="px-5 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 font-medium text-slate-700">
                  {products.map((p) => {
                    const imageSrc =
                      p.images?.[0]?.storage_path || "/images/herbal-oil-mockup-thumb.png";
                    const isChecked = selectedIds.includes(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/60 transition ${
                          isChecked ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="w-12 px-5 py-3.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select ${p.name}`}
                            checked={isChecked}
                            onChange={() => toggleSelectRow(p.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#00c982] focus:ring-[#00c982] cursor-pointer"
                          />
                        </td>

                        {/* Product Thumbnail & Title */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {p.sku || "No SKU"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category Pill */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {p.category?.name || "Uncategorized"}
                          </span>
                        </td>

                        {/* Price & Compare Price */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">
                              {formatCurrency(Number(p.price))}
                            </span>
                            {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                              <del className="text-xs text-slate-400 font-normal">
                                {formatCurrency(Number(p.compare_at_price))}
                              </del>
                            )}
                          </div>
                        </td>

                        {/* Stock Quantity */}
                        <td className="px-5 py-3.5">
                          <span className="font-black text-slate-900 text-sm">
                            {p.stock_quantity} units
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          {p.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                              <span>Active</span>
                            </span>
                          ) : p.status === "out_of_stock" || p.stock_quantity <= 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fee2e2] text-[#b91c1c]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                              <span>Out of Stock</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Draft</span>
                            </span>
                          )}
                        </td>

                        {/* Actions: Edit, Delete, More */}
                        <td className="px-6 py-3.5 text-right relative">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <Link
                              href={`/dashboard/products/${p.id}/edit`}
                              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-2xs"
                              title="Edit product"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Delete product"
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* More Options Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuOpenId(actionMenuOpenId === p.id ? null : p.id)
                                }
                                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                                title="More options"
                                aria-label={`More options for ${p.name}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Dropdown Popover */}
                              {actionMenuOpenId === p.id && (
                                <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                                  {shopSlug && (
                                    <Link
                                      href={`/shop/${shopSlug}`}
                                      target="_blank"
                                      onClick={() => setActionMenuOpenId(null)}
                                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                      <span>View on Store</span>
                                    </Link>
                                  )}
                                  <button
                                    type="button"
                                    disabled={archiveBusyId === p.id}
                                    onClick={() => handleArchiveQuick(p)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{p.status === "draft" ? "Publish Active" : "Set as Draft"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 5. PAGINATION & SHOWING COUNT FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <span className="text-xs font-medium text-slate-500">
          Showing {fromRow} to {toRow} of {totalCount} product{totalCount === 1 ? "" : "s"}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => updateQuery({ page: String(currentPage - 1) })}
            aria-label="Previous page"
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
            const isActive = pNum === currentPage;
            return (
              <button
                key={pNum}
                type="button"
                onClick={() => updateQuery({ page: String(pNum) })}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                  isActive
                    ? "bg-[#008a45] text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                {pNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => updateQuery({ page: String(currentPage + 1) })}
            aria-label="Next page"
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="delete-product-title" className="text-base font-bold text-slate-900">
                  Delete Product
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete this item?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently remove <strong>{productToDelete.name}</strong> from your catalog. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
