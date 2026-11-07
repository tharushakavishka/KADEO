"use client";

import { useState, useTransition, useEffect } from "react";
import { updateShopSubscriptionAction } from "@/features/subscriptions/admin-actions";
import type { ShopQuotaDetails } from "@/features/subscriptions/quota-service";
import {
  X,
  HardDrive,
  Calendar,
  Sparkles,
  CheckCircle2,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Store,
  Mail,
  Crown,
} from "lucide-react";

export interface PlanQuotaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shop: {
    id: string;
    name: string;
    slug: string;
    custom_storage_quota_mb?: number | null;
    owner?: { email?: string; full_name?: string } | null;
  } | null;
  quotaDetails?: ShopQuotaDetails | null;
  onSuccess?: () => void;
}

export function PlanQuotaDrawer({
  isOpen,
  onClose,
  shop,
  quotaDetails,
  onSuccess,
}: PlanQuotaDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [planId, setPlanId] = useState<string>("free");
  const [status, setStatus] = useState<"active" | "cancelled" | "expired" | "past_due">("active");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [enableGrace, setEnableGrace] = useState<boolean>(true);
  const [gracePeriodEndsAt, setGracePeriodEndsAt] = useState<string>("");
  const [customQuotaMb, setCustomQuotaMb] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Sync state whenever shop or quotaDetails changes
  useEffect(() => {
    if (!shop) return;

    const sub = quotaDetails?.subscription;
    setPlanId(sub?.planId || "free");
    setStatus((sub?.status as any) || "active");

    if (sub?.expiresAt) {
      const d = new Date(sub.expiresAt);
      if (!isNaN(d.getTime())) {
        setExpiresAt(d.toISOString().slice(0, 10));
      } else {
        setExpiresAt("");
      }
    } else {
      setExpiresAt("");
    }

    if (sub?.gracePeriodEndsAt) {
      const gd = new Date(sub.gracePeriodEndsAt);
      if (!isNaN(gd.getTime())) {
        setGracePeriodEndsAt(gd.toISOString().slice(0, 10));
        setEnableGrace(true);
      } else {
        setGracePeriodEndsAt("");
        setEnableGrace(false);
      }
    } else {
      setGracePeriodEndsAt("");
      setEnableGrace(false);
    }

    if (shop.custom_storage_quota_mb && shop.custom_storage_quota_mb > 0) {
      setCustomQuotaMb(String(shop.custom_storage_quota_mb));
    } else {
      setCustomQuotaMb("");
    }

    setAdminNotes("");
    setToast(null);
  }, [shop, quotaDetails]);

  // Duration Presets Helper
  function applyDurationPreset(days: number | null) {
    if (days === null) {
      // Lifetime / No Expiry
      setExpiresAt("");
      setGracePeriodEndsAt("");
      setEnableGrace(false);
      return;
    }

    const base = expiresAt ? new Date(expiresAt) : new Date();
    const target = new Date(base.getTime() > Date.now() ? base.getTime() : Date.now());
    target.setDate(target.getDate() + days);

    const dateStr = target.toISOString().slice(0, 10);
    setExpiresAt(dateStr);

    if (enableGrace) {
      const graceTarget = new Date(target);
      graceTarget.setDate(graceTarget.getDate() + 7);
      setGracePeriodEndsAt(graceTarget.toISOString().slice(0, 10));
    }
  }

  function handleDateChange(val: string) {
    setExpiresAt(val);
    if (!val) {
      setGracePeriodEndsAt("");
      return;
    }
    if (enableGrace) {
      const expDate = new Date(val);
      expDate.setDate(expDate.getDate() + 7);
      setGracePeriodEndsAt(expDate.toISOString().slice(0, 10));
    }
  }

  function handleGraceToggle(checked: boolean) {
    setEnableGrace(checked);
    if (checked && expiresAt) {
      const expDate = new Date(expiresAt);
      expDate.setDate(expDate.getDate() + 7);
      setGracePeriodEndsAt(expDate.toISOString().slice(0, 10));
    } else if (!checked) {
      setGracePeriodEndsAt("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shop) return;

    setToast(null);
    startTransition(async () => {
      const res = await updateShopSubscriptionAction({
        shopId: shop.id,
        planId,
        status,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        gracePeriodEndsAt: enableGrace && gracePeriodEndsAt ? new Date(gracePeriodEndsAt).toISOString() : null,
        customStorageQuotaMb: customQuotaMb ? Number(customQuotaMb) : null,
        adminNotes,
      });

      if (res?.error) {
        setToast({ type: "error", text: res.error });
      } else {
        setToast({ type: "success", text: "Store plan and quota updated successfully!" });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      }
    });
  }

  if (!isOpen || !shop) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden font-sans border-l border-zinc-200">
        {/* Curved Emerald Decorative Header Backdrop matching mockup */}
        <div className="relative bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white px-6 sm:px-8 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600/10 text-emerald-800 border border-emerald-600/20">
                <Crown className="w-3 h-3 text-amber-500" />
                SUPER ADMIN QUOTA & PLAN MANAGEMENT
              </span>

              <div className="flex items-center gap-2 pt-1">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  {shop.name}
                </h2>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-zinc-400" />
                  /shop/{shop.slug}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {shop.owner?.email || "merchant@kadeo.lk"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition shrink-0"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {toast && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-bold ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toast.text}</span>
            </div>
          )}

          {/* Section 1: Subscription Plan Tier */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                SUBSCRIPTION PLAN TIER
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Starter Free */}
              <button
                type="button"
                onClick={() => setPlanId("free")}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  planId === "free"
                    ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-zinc-900">Starter Free</div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Default 250 MB storage & 25 products limit.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {planId === "free" ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-300" />
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100/80">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-zinc-100 text-zinc-800">
                    LKR 0 / mo
                  </span>
                </div>
              </button>

              {/* Pro Business */}
              <button
                type="button"
                onClick={() => setPlanId("pro")}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  planId === "pro"
                    ? "border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-zinc-900">Pro Business</div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Full 5,120 MB (5 GB) storage & 1,000 products.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {planId === "pro" ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-300" />
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100/80">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 text-indigo-900">
                    LKR 2,500 / mo
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Plan Duration & Expiry Date */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  PLAN DURATION & EXPIRY DATE
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyDurationPreset(null)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    !expiresAt
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lifetime (No Expiry)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!expiresAt) applyDurationPreset(30);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    expiresAt
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Custom Duration</span>
                </button>
              </div>
            </div>

            {/* Duration Quick Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "+1 Month", days: 30 },
                { label: "+3 Months", days: 90 },
                { label: "+6 Months", days: 180 },
                { label: "+1 Year", days: 365 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyDurationPreset(p.days)}
                  className="py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 text-center transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date Input with Calendar Icon */}
            <div className="relative">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="mm / dd / yyyy"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section 3: Grace Period Policy */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  GRACE PERIOD POLICY
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableGrace}
                  onChange={(e) => handleGraceToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span className="text-xs font-bold text-zinc-700">Enable +7 Days Grace</span>
              </label>
            </div>

            {enableGrace && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <p className="text-[11px] text-amber-900 leading-snug">
                  If the subscription expires, the merchant retains full upload capability until the grace period cutoff.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-900 shrink-0">Cutoff Date:</span>
                  <input
                    type="date"
                    value={gracePeriodEndsAt}
                    onChange={(e) => setGracePeriodEndsAt(e.target.value)}
                    className="px-2.5 py-1 text-xs font-mono rounded-lg border border-amber-300 bg-white text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Custom Storage Quota (Override) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                  4
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  CUSTOM STORAGE QUOTA (OVERRIDE)
                </label>
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                Optional override
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Leave blank to adhere to the plan default (Free: 250 MB, Pro: 5,120 MB). Enter a custom override in Megabytes (MB).
            </p>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                step="50"
                placeholder={planId === "pro" ? "5120" : "250"}
                value={customQuotaMb}
                onChange={(e) => setCustomQuotaMb(e.target.value)}
                className="w-36 px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <span className="text-xs font-bold text-zinc-600">MB</span>

              {customQuotaMb && (
                <button
                  type="button"
                  onClick={() => setCustomQuotaMb("")}
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline ml-2"
                >
                  Reset to Default
                </button>
              )}
            </div>

            {/* Storage Preset Pills matching mockup */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "Default Plan", val: "" },
                { label: "500 MB", val: "500" },
                { label: "1 GB (1,024 MB)", val: "1024" },
                { label: "2 GB (2,048 MB)", val: "2048" },
                { label: "5 GB (5,120 MB)", val: "5120" },
                { label: "10 GB (10,240 MB)", val: "10240" },
              ].map((pill) => {
                const isSelected = customQuotaMb === pill.val;
                return (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => setCustomQuotaMb(pill.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Subscription Status */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                5
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                SUBSCRIPTION STATUS
              </label>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="active">🟢 Active (Normal operation)</option>
              <option value="past_due">🟡 Past Due (Payment pending)</option>
              <option value="expired">🔴 Expired (Uploads restricted)</option>
              <option value="cancelled">⚪ Cancelled (Disabled)</option>
            </select>
          </div>

          {/* Section 6: Admin Notes / Payment Reference */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                6
              </span>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900">
                ADMIN NOTES / PAYMENT REFERENCE
              </label>
            </div>

            <textarea
              rows={2}
              placeholder="e.g. Bank slip #DTN-9843 verified for 1-year Pro upgrade; VIP merchant quota override."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Live Storage Usage Status Strip matching mockup */}
          {quotaDetails && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs font-bold text-emerald-950">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>Current Storage Usage</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Used: {(quotaDetails.storageUsedBytes / (1024 * 1024)).toFixed(2)} MB</span>
                <span className="text-emerald-300">|</span>
                <span>Quota: {quotaDetails.effectiveQuotaMb} MB</span>
                <span className="text-emerald-300">|</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                  {quotaDetails.usagePercent}% used
                </span>
              </div>
            </div>
          )}

          {/* Drawer Actions Footer */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-2.5 px-6 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="py-2.5 px-6 rounded-xl bg-[#00c975] hover:bg-[#00b067] disabled:opacity-60 text-xs font-bold text-[#02281e] transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#02281e]" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#02281e]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
