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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { deleteProductAction, archiveProductAction } from "@/features/products/actions";

interface ProductItem {
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

interface ProductListClientProps {
  products: ProductItem[];
  categories: Array<{ id: string; name: string }>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
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
}: ProductListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search state
  const [searchInput, setSearchInput] = useState(searchQuery);

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
    try {
      await archiveProductAction(product.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setArchiveBusyId(null);
    }
  }

  const hasActiveFilters = Boolean(searchQuery || categoryFilter || (statusFilter && statusFilter !== "all"));

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <label htmlFor="product-search-input" className="sr-only">
              Search products by name or SKU
            </label>
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateQuery({ q: null });
                }}
                aria-label="Clear search text"
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <div>
              <label htmlFor="product-category-filter" className="sr-only">
                Filter by Category
              </label>
              <select
                id="product-category-filter"
                value={categoryFilter}
                onChange={(e) => updateQuery({ category: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-status-filter" className="sr-only">
                Filter by Status
              </label>
              <select
                id="product-status-filter"
                value={statusFilter}
                onChange={(e) => updateQuery({ status: e.target.value })}
                className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            <Filter className="w-3 h-3 text-zinc-400" />
            <span>
              Showing {products.length} of {totalCount} filtered results
            </span>
          </div>
        )}
      </div>

      {/* Product Content Container */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">
              {hasActiveFilters ? "No matching products found" : "No products added yet"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-5">
              {hasActiveFilters
                ? "Try adjusting your search keywords or clear filters to view your catalog."
                : "Add your first product to display it on your public storefront and receive customer orders."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-sm hover:bg-zinc-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (Visible only on small screens < 640px, NO horizontal scroll) */}
            <div className="block sm:hidden divide-y divide-zinc-100">
              {products.map((p) => {
                const imageSrc = p.images?.[0]?.storage_path;
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              p.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "out_of_stock"
                                ? "bg-red-50 text-red-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {p.status.replace("_", " ")}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              p.stock_quantity === 0
                                ? "text-red-600"
                                : p.stock_quantity < 5
                                ? "text-amber-600"
                                : "text-zinc-600"
                            }`}
                          >
                            {p.stock_quantity} in stock
                          </span>
                        </div>
                        <h4 className="font-semibold text-zinc-900 text-sm truncate mt-1">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <span>{p.sku || "No SKU"}</span>
                          <span>?</span>
                          <span className="text-zinc-500 font-sans">
                            {p.category?.name || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                      <div>
                        <span className="font-bold text-zinc-900 text-sm">
                          {formatCurrency(Number(p.price))}
                        </span>
                        {p.compare_at_price && (
                          <span className="text-[11px] text-zinc-400 line-through ml-1.5">
                            {formatCurrency(Number(p.compare_at_price))}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold inline-flex items-center gap-1"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                          aria-label={`Delete ${p.name}`}
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout (Visible >= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {products.map((p) => {
                    const imageSrc = p.images?.[0]?.storage_path;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/60 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-zinc-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900 text-sm">{p.name}</p>
                              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {p.sku || "No SKU"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-zinc-600">
                          {p.category?.name || "Uncategorized"}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-zinc-900">
                            {formatCurrency(Number(p.price))}
                          </span>
                          {p.compare_at_price && (
                            <span className="text-[11px] text-zinc-400 line-through ml-2">
                              {formatCurrency(Number(p.compare_at_price))}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`font-semibold ${
                              p.stock_quantity === 0
                                ? "text-red-600"
                                : p.stock_quantity < 5
                                ? "text-amber-600"
                                : "text-zinc-800"
                            }`}
                          >
                            {p.stock_quantity} units
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                              p.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "out_of_stock"
                                ? "bg-red-50 text-red-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {p.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/dashboard/products/${p.id}/edit`}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                              aria-label={`Edit ${p.name}`}
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              aria-label={`Delete ${p.name}`}
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                  Showing {(currentPage - 1) * 10 + 1}?"{Math.min(currentPage * 10, totalCount)} of {totalCount} products
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateQuery({ page: String(currentPage - 1) })}
                    aria-label="Previous page"
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
                    aria-label="Next page"
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 id="delete-product-title" className="text-base font-bold text-zinc-900">
                  Delete Product
                </h3>
                <p className="text-xs text-zinc-500">Permanent removal from store catalog</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-900">{productToDelete.name}</strong>?
              This product will be permanently removed from your catalog and storefront.
              Previous orders and customer sales receipts will remain intact with historical snapshots.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError("");
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
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
