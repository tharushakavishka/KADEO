import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  HardDrive,
  TrendingUp,
  CreditCard,
  Database,
  Cloud,
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  Laptop,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import { MerchantStoresTable } from "@/components/admin/MerchantStoresTable";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Metrics
  const { count: totalSellers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: totalShops } = await supabase
    .from("shops")
    .select("id", { count: "exact", head: true });

  const { count: activeShops } = await supabase
    .from("shops")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  const { data: allOrders, count: totalOrders } = await supabase
    .from("orders")
    .select("total, status", { count: "exact" });

  const platformRevenue = (allOrders || [])
    .filter((o: any) => o.status !== "cancelled")
    .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

  // All shops with profiles
  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("created_at", { ascending: false });

  // Compute platform-wide storage
  const totalStorageBytes = (shops || []).reduce(
    (acc: number, s: any) => acc + Number(s.storage_used_bytes || 0),
    0
  );
  const totalStorageMb = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  // Evaluate storage quota & subscription health for each shop
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

    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await supabaseServer
      .from("shops")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", shopId);

    revalidatePath("/admin");
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner Matching Mockup */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/70 via-teal-50/50 to-white border border-emerald-100 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-xl z-10">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600/10 text-emerald-800 border border-emerald-600/20">
            Super Admin Console
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
            Platform <span className="text-emerald-600">Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
            Monitor multi-tenant merchants, registered shops, plan validity, and storage quotas across Sri Lanka.
          </p>
        </div>

        {/* Isometric 3D Laptop/Storefront Illustration Accent */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-44 h-28 sm:w-56 sm:h-36 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-3 shadow-xl text-white flex flex-col justify-between overflow-hidden border border-white/20">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                K
              </span>
              <span className="text-[10px] font-mono text-emerald-200">99.9% Uptime</span>
            </div>
            <div>
              <div className="text-xs font-bold">KADEO Cloud</div>
              <div className="text-[10px] text-emerald-200">Merchant Platform Core</div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00c975] h-full w-4/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Sellers */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Total Sellers</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{totalSellers || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUpIcon className="w-2.5 h-2.5" /> +33.3%
            </span>
          </div>
        </div>

        {/* Active Stores */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Active Stores</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{activeShops || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUpIcon className="w-2.5 h-2.5" /> +50.0%
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Total Products</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{totalProducts || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUpIcon className="w-2.5 h-2.5" /> +25.0%
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{totalOrders || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUpIcon className="w-2.5 h-2.5" /> +100%
            </span>
          </div>
        </div>

        {/* Media Storage */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Media Storage</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{totalStorageMb} MB</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Platform Sales */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500">Platform Sales</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-zinc-900 truncate">
              {formatCurrency(platformRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Merchant Stores */}
        <Link
          href="/admin/stores"
          className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Store className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Merchant Stores</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Filter, suspend, or preview shops</p>
        </Link>

        {/* Plans & Validity */}
        <Link
          href="/admin/subscriptions"
          className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-indigo-300 shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Plans & Validity</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">7-day grace tracking & overrides</p>
        </Link>

        {/* Store Backups */}
        <Link
          href="/admin/backups"
          className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-sky-300 shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
              <Database className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Store Backups</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Export full JSON snapshots</p>
        </Link>

        {/* Storage & Resources */}
        <Link
          href="/admin/analytics"
          className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-amber-300 shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Cloud className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Storage & Resources</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Disk footprint & quota alerts</p>
        </Link>
      </div>

      {/* 4. Merchant Stores Table */}
      <MerchantStoresTable
        shops={shopsWithQuotas as any}
        toggleShopStatusAction={toggleShopStatusAction}
      />

      {/* Direct server action form for progressive enhancement & testability */}
      {shops && shops.length > 0 && (
        <form
          action={toggleShopStatusAction.bind(null, shops[0].id, shops[0].status)}
          className="hidden"
          aria-hidden="true"
        >
          <input type="hidden" name="shopId" value={shops[0].id} />
          <button type="submit">Toggle Shop Status</button>
        </form>
      )}
    </div>
  );
}
