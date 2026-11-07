"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlanQuotaDrawer } from "./PlanQuotaDrawer";
import type { ShopQuotaDetails } from "@/features/subscriptions/quota-service";
import { serverAdminDeleteShop } from "@/features/account/actions";
import {
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertTriangle,
  HardDrive,
  Sliders,
  CheckCircle2,
  Search,
  Download,
  Filter,
  Store,
  Phone,
  Trash2,
  Loader2,
} from "lucide-react";

export interface MerchantShopRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  whatsapp_number: string;
  theme_id: string;
  status: string;
  created_at: string;
  custom_storage_quota_mb: number | null;
  owner?: { email?: string; full_name?: string } | null;
  quota: ShopQuotaDetails;
}

interface MerchantStoresTableProps {
  shops: MerchantShopRow[];
  toggleShopStatusAction: (shopId: string, currentStatus: string) => Promise<void>;
}

export function MerchantStoresTable({
  shops,
  toggleShopStatusAction,
}: MerchantStoresTableProps) {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState<MerchantShopRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingShop, setDeletingShop] = useState<MerchantShopRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleToggleStatus(shopId: string, currentStatus: string) {
    setTogglingId(shopId);
    try {
      await toggleShopStatusAction(shopId, currentStatus);
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingShop) return;
    if (deleteConfirmInput.trim().toLowerCase() !== deletingShop.slug.toLowerCase()) {
      setDeleteError(`Please type "${deletingShop.slug}" to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await serverAdminDeleteShop(deletingShop.id);
      if (res.success) {
        setDeletingShop(null);
        setDeleteConfirmInput("");
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete store");
      }
    } catch (err: any) {
      setDeleteError(err?.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  function formatQuotaDisplay(quota: ShopQuotaDetails) {
    const usedMb = (quota.storageUsedBytes / (1024 * 1024)).toFixed(1);
    const quotaStr =
      quota.effectiveQuotaMb >= 1024
        ? `${(quota.effectiveQuotaMb / 1024).toFixed(0)} GB`
        : `${quota.effectiveQuotaMb} MB`;
    return { usedMb, quotaStr };
  }

  const filteredShops = shops.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      (s.owner?.email || "").toLowerCase().includes(q) ||
      (s.owner?.full_name || "").toLowerCase().includes(q) ||
      (s.whatsapp_number || "").includes(q)
    );
  });

  return (
    <>
      <div className="bg-white border border-zinc-200/80 rounded-3xl shadow-xs overflow-hidden">
        {/* Table Header matching mockup */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                Registered Merchant Stores ({shops.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Manage plans, subscription validity, storage quota overrides, and store deletion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store, owner email, slug..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <button
              type="button"
              className="p-2 rounded-xl border border-zinc-200 bg-zinc-50/60 text-zinc-600 hover:bg-zinc-100 transition shrink-0"
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredShops.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            {searchQuery
              ? `No merchant stores match "${searchQuery}".`
              : "No merchant stores registered yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfdfd] border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Store Name</th>
                  <th className="px-4 py-3.5">Owner</th>
                  <th className="px-4 py-3.5">Plan & Validity</th>
                  <th className="px-4 py-3.5">Storage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right sticky right-0 bg-[#fcfdfd] z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {filteredShops.map((s, idx) => {
                  const q = s.quota;
                  const sub = q.subscription;
                  const { usedMb, quotaStr } = formatQuotaDisplay(q);
                  const isPro = sub.planId === "pro";
                  const isToggling = togglingId === s.id;

                  // Dynamic store icon colors to match mockup illustration
                  const storeBadgeThemes = [
                    "bg-emerald-50 text-emerald-600 border-emerald-100",
                    "bg-sky-50 text-sky-600 border-sky-100",
                    "bg-amber-50 text-amber-600 border-amber-100",
                    "bg-purple-50 text-purple-600 border-purple-100",
                  ];
                  const badgeTheme = storeBadgeThemes[idx % storeBadgeThemes.length];

                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/80 transition group">
                      {/* 1. Store Name + Icon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold shrink-0 ${badgeTheme}`}
                          >
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 text-xs truncate max-w-[140px]">
                                {s.name}
                              </span>
                              <Link
                                href={`/shop/${s.slug}`}
                                target="_blank"
                                className="text-zinc-400 hover:text-emerald-600 transition shrink-0"
                                title="Preview live store"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-[140px]">
                              /shop/{s.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Owner */}
                      <td className="px-4 py-3.5">
                        <div className="text-zinc-900 font-bold text-xs truncate max-w-[150px]">
                          {s.owner?.email || "N/A"}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-zinc-400" />
                          {s.whatsapp_number}
                        </div>
                      </td>

                      {/* 3. Plan & Validity */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                              isPro
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            }`}
                          >
                            {isPro && <Sparkles className="w-2.5 h-2.5 text-indigo-600" />}
                            {sub.planName}
                          </span>

                          {/* Validity Badge */}
                          <div>
                            {sub.isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                Expired
                              </span>
                            ) : sub.isInGracePeriod ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                <Clock className="w-3 h-3 shrink-0" />
                                Grace
                              </span>
                            ) : sub.expiresAt ? (
                              <span className="text-[10px] text-zinc-500 font-mono block">
                                {new Date(sub.expiresAt).toLocaleDateString("en-LK")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Lifetime
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Storage Used vs Quota */}
                      <td className="px-4 py-3.5 min-w-[130px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-mono text-zinc-800">
                            <strong>{usedMb} MB</strong> / {quotaStr}
                          </span>
                          <span className="font-extrabold text-zinc-500">
                            {q.usagePercent}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              q.usagePercent > 90
                                ? "bg-rose-500"
                                : q.usagePercent > 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(3, q.usagePercent)}%` }}
                          />
                        </div>
                      </td>

                      {/* 5. Status Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            s.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              s.status === "active" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {s.status}
                        </span>
                      </td>

                      {/* 6. Created Date */}
                      <td className="px-4 py-3.5 text-zinc-500 font-mono text-[10px]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("en-LK") : "—"}
                      </td>

                      {/* 7. Action Buttons (Sticky Right with Always-Visible Delete Button) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-zinc-50/90 z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.05)] transition">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Backup Download */}
                          <a
                            href={`/api/admin/backup/${s.id}`}
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-[11px] shadow-2xs transition hover:border-zinc-300"
                            title="Download complete JSON backup"
                          >
                            <Download className="w-3 h-3 text-zinc-500" />
                            <span>Backup</span>
                          </a>

                          {/* Manage Plan */}
                          <button
                            type="button"
                            onClick={() => setSelectedShop(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-[11px] shadow-2xs transition hover:border-zinc-300"
                          >
                            <Sliders className="w-3 h-3 text-zinc-500" />
                            <span>Manage Plan</span>
                          </button>

                          {/* Suspend / Activate */}
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                              s.status === "active"
                                ? "text-amber-700 hover:bg-amber-50 border border-amber-200"
                                : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                            }`}
                          >
                            {isToggling
                              ? "..."
                              : s.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </button>

                          {/* Prominent High-Contrast Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingShop(s);
                              setDeleteConfirmInput("");
                              setDeleteError(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-extrabold text-[11px] shadow-2xs transition cursor-pointer"
                            title={`Permanently delete ${s.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan & Quota Drawer Slide-Over */}
      <PlanQuotaDrawer
        isOpen={Boolean(selectedShop)}
        shop={selectedShop}
        quotaDetails={selectedShop?.quota}
        onClose={() => setSelectedShop(null)}
        onSuccess={() => {
          setSelectedShop(null);
          router.refresh();
        }}
      />

      {/* Super Admin Store Deletion Modal */}
      {deletingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeleting && setDeletingShop(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">
                  Delete Store Permanently?
                </h3>
                <p className="text-xs text-zinc-500">
                  This action is irreversible and cascades all data.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-xs text-rose-900 space-y-2">
              <p className="font-semibold">
                Deleting <span className="font-bold underline">{deletingShop.name}</span> will permanently erase:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800">
                <li>All products, categories, and catalog images</li>
                <li>Customer rosters, orders, and payment records</li>
                <li>Store configurations and subscriptions</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                To confirm, type <span className="font-mono text-rose-600 font-bold">{deletingShop.slug}</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={deletingShop.slug}
                disabled={isDeleting}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {deleteError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                {deleteError}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingShop(null)}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmInput.trim() !== deletingShop.slug}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Store Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
