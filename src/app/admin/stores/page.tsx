import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Store, ShoppingBag, ShieldCheck, HardDrive, Plus, ArrowRight } from "lucide-react";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import { MerchantStoresTable } from "@/components/admin/MerchantStoresTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("created_at", { ascending: false });

  const activeCount = (shops || []).filter((s: any) => s.status === "active").length;
  const suspendedCount = (shops || []).filter((s: any) => s.status === "suspended").length;

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

    revalidatePath("/admin/stores");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Merchant Stores Governance
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor, inspect, backup, and control merchant storefront lifecycle and quota overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/backups"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs transition"
          >
            <span>Backups Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
              Total Registered
            </div>
            <div className="text-xl font-black text-zinc-900">{shops?.length || 0}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
              Active Storefronts
            </div>
            <div className="text-xl font-black text-emerald-600">{activeCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
              Suspended
            </div>
            <div className="text-xl font-black text-rose-600">{suspendedCount}</div>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <MerchantStoresTable
        shops={shopsWithQuotas as any}
        toggleShopStatusAction={toggleShopStatusAction}
      />
    </div>
  );
}
