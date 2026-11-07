import { createClient } from "@/lib/supabase/server";
import { HardDrive, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Database, ArrowUpRight } from "lucide-react";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("storage_used_bytes", { ascending: false });

  const shopsWithQuotas = await Promise.all(
    (shops || []).map(async (s: any) => {
      const quota = await getShopStorageQuota(s.id);
      return {
        ...s,
        quota: quota || {
          shopId: s.id,
          storageUsedBytes: Number(s.storage_used_bytes || 0),
          effectiveQuotaMb: s.custom_storage_quota_mb || 250,
          effectiveQuotaBytes: (s.custom_storage_quota_mb || 250) * 1024 * 1024,
          usagePercent: 0,
          isCustomQuota: Boolean(s.custom_storage_quota_mb),
          maxProducts: 25,
          subscription: {
            status: "active",
            planId: "free",
            planName: "Starter Free",
            startedAt: s.created_at,
            expiresAt: null,
            gracePeriodEndsAt: null,
            isExpired: false,
            isInGracePeriod: false,
            canUpload: s.status === "active",
          },
        },
      };
    })
  );

  const totalBytesUsed = shopsWithQuotas.reduce(
    (acc, s) => acc + (s.quota.storageUsedBytes || 0),
    0
  );
  const totalMbUsed = (totalBytesUsed / (1024 * 1024)).toFixed(1);

  const totalQuotaMb = shopsWithQuotas.reduce(
    (acc, s) => acc + (s.quota.effectiveQuotaMb || 0),
    0
  );

  const highUsageShops = shopsWithQuotas.filter((s) => s.quota.usagePercent >= 80);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Storage & System Resources
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Monitor tenant storage footprint, cloud asset allocations, quota saturation, and disk growth trends.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Storage Consumed
            </span>
            <HardDrive className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2">
            {Number(totalMbUsed) >= 1024
              ? `${(Number(totalMbUsed) / 1024).toFixed(2)} GB`
              : `${totalMbUsed} MB`}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Across {shops?.length || 0} multi-tenant stores
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Provisioned Quota
            </span>
            <Database className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2">
            {totalQuotaMb >= 1024
              ? `${(totalQuotaMb / 1024).toFixed(1)} GB`
              : `${totalQuotaMb} MB`}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Effective ceiling with custom overrides
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              High Saturation Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {highUsageShops.length} Stores
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {highUsageShops.length > 0
              ? "Reaching quota threshold (>80%)"
              : "All stores comfortably below limits"}
          </p>
        </div>
      </div>

      {/* Storage Utilization by Store */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Tenant Storage Saturation Ranking
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ranked from highest disk footprint to lowest.
            </p>
          </div>
          <Link
            href="/admin/stores"
            className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
          >
            Manage Stores
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Plan Tier</th>
                <th className="px-5 py-3">Storage Used</th>
                <th className="px-5 py-3">Quota Ceiling</th>
                <th className="px-5 py-3">Saturation Gauge</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {shopsWithQuotas.map((s) => {
                const q = s.quota;
                const usedMb = (q.storageUsedBytes / (1024 * 1024)).toFixed(1);
                const quotaDisplay =
                  q.effectiveQuotaMb >= 1024
                    ? `${(q.effectiveQuotaMb / 1024).toFixed(0)} GB`
                    : `${q.effectiveQuotaMb} MB`;

                return (
                  <tr key={s.id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-zinc-900">{s.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        /shop/{s.slug}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold text-zinc-800">
                        {q.subscription.planName}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-zinc-900 text-[11px]">
                        {usedMb} MB
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-zinc-600 text-[11px]">
                        {quotaDisplay}
                      </span>
                      {q.isCustomQuota && (
                        <span className="block text-[9px] text-amber-700 font-bold">
                          Custom Override
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 min-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-zinc-700">{q.usagePercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
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

                    <td className="px-5 py-3.5 text-right">
                      {q.usagePercent >= 90 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Critical
                        </span>
                      ) : q.usagePercent >= 75 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
