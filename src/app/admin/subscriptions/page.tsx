import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  CreditCard,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertTriangle,
  HardDrive,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import { MerchantStoresTable } from "@/components/admin/MerchantStoresTable";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("created_at", { ascending: false });

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

  let proCount = 0;
  let freeCount = 0;
  let graceCount = 0;
  let expiredCount = 0;
  let lifetimeCount = 0;

  for (const item of shopsWithQuotas) {
    const sub = item.quota.subscription;
    if (sub.planId === "pro") proCount++;
    else freeCount++;

    if (sub.isInGracePeriod) graceCount++;
    else if (sub.isExpired) expiredCount++;
    else if (!sub.expiresAt) lifetimeCount++;
  }

  async function toggleShopStatusAction(shopId: string, currentStatus: string) {
    "use server";
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Forbidden: Admin role required");
    }

    const nextStatus = currentStatus === "active" ? "suspended" : "active";

    const { error } = await supabaseServer
      .from("shops")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopId);

    if (error) {
      throw new Error(error.message || "Failed to update shop status");
    }

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/stores");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Subscriptions & Plan Governance
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review tenant tiers, manage plan expirations, enforce 7-day grace periods, and grant custom storage overrides.
        </p>
      </div>

      {/* Plan KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pro Business</span>
          </div>
          <div className="text-2xl font-black text-indigo-600">{proCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1">5 GB & 1000 items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
            <span>Starter Free</span>
          </div>
          <div className="text-2xl font-black text-zinc-800">{freeCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1">250 MB & 25 items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lifetime</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{lifetimeCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1">No expiry limits</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>In Grace Period</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{graceCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1">7-day notice active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Expired</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{expiredCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Uploads restricted</div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <MerchantStoresTable
        shops={shopsWithQuotas as any}
        toggleShopStatusAction={toggleShopStatusAction}
      />
    </div>
  );
}
