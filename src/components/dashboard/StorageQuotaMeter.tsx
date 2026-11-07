"use client";

import Link from "next/link";
import type { ShopQuotaDetails } from "@/features/subscriptions/quota-service";
import {
  HardDrive,
  Sparkles,
  Calendar,
  ArrowRight,
  Package,
} from "lucide-react";

interface StorageQuotaMeterProps {
  quota: ShopQuotaDetails;
}

export function StorageQuotaMeter({ quota }: StorageQuotaMeterProps) {
  if (!quota) return null;

  const usedMb = (quota.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const quotaStr =
    quota.effectiveQuotaMb >= 1024
      ? `${(quota.effectiveQuotaMb / 1024).toFixed(0)} GB`
      : `${quota.effectiveQuotaMb} MB`;

  const percent = Math.min(100, Math.max(0, quota.usagePercent));
  const isHighUsage = percent > 90;
  const isMediumUsage = percent > 75 && percent <= 90;

  const barColor = isHighUsage
    ? "bg-rose-500"
    : isMediumUsage
    ? "bg-amber-500"
    : "bg-emerald-500";

  const sub = quota.subscription;
  const isPro = sub.planId === "pro";

  const formatExpiry = () => {
    if (sub.isExpired) return "Expired";
    if (sub.isInGracePeriod)
      return `Grace period ends ${new Date(sub.gracePeriodEndsAt!).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
      })}`;
    if (!sub.expiresAt) return "Lifetime Active Access";
    const daysLeft = Math.ceil(
      (new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0
      ? `${daysLeft} days remaining (Expires ${new Date(sub.expiresAt).toLocaleDateString("en-LK", {
          month: "short",
          day: "numeric",
        })})`
      : "Expires today";
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">
                Store Storage & Quota
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                  isPro
                    ? "bg-indigo-50 text-[#5a31f4] border border-indigo-200/70"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                }`}
              >
                {isPro && <Sparkles className="w-3 h-3 text-[#5a31f4]" />}
                {sub.planName}
              </span>
              {quota.isCustomQuota && (
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Custom Quota
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              High-resolution product photos & marketing media
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/subscription"
          className="text-xs font-bold text-[#5a31f4] hover:text-[#4a26d1] flex items-center gap-1 transition self-start sm:self-auto"
        >
          <span>{isPro ? "Manage Plan" : "Upgrade to Pro"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Storage Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-zinc-800">
            <strong>{usedMb} MB</strong> used of <strong>{quotaStr}</strong>
          </span>
          <span
            className={`font-mono font-extrabold ${
              isHighUsage
                ? "text-rose-600"
                : isMediumUsage
                ? "text-amber-600"
                : "text-emerald-700"
            }`}
          >
            {percent}%
          </span>
        </div>

        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>
      </div>

      {/* Sub-details row: Product Limit & Plan Validity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>
            Catalog Limit: <strong>Up to {quota.maxProducts} products</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{formatExpiry()}</span>
        </div>
      </div>
    </div>
  );
}
