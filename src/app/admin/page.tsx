import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Store, Users, Package, ShoppingBag, ShieldAlert, ExternalLink } from "lucide-react";

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

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  // All shops
  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("created_at", { ascending: false });

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

  const metrics = [
    { label: "Total Sellers", value: totalSellers || 0, icon: Users },
    { label: "Active Shops", value: activeShops || 0, icon: Store },
    { label: "Total Products", value: totalProducts || 0, icon: Package },
    { label: "Total Orders", value: totalOrders || 0, icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Super Admin Console
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Platform Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor multi-tenant merchants, registered shops, and storefront health.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500">{m.label}</span>
                <Icon className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Merchant Shops Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">
            Registered Merchant Stores ({shops?.length || 0})
          </h2>
        </div>

        {(!shops || shops.length === 0) ? (          <div className="p-12 text-center text-xs text-zinc-500">
            No shops created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Store Name</th>
                  <th className="px-5 py-3">Owner Email</th>
                  <th className="px-5 py-3">WhatsApp Number</th>
                  <th className="px-5 py-3">Theme</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {shops.map((s: any) => (
                  <tr key={s.id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">{s.name}</span>
                        <Link
                          href={`/shop/${s.slug}`}
                          target="_blank"
                          className="text-zinc-400 hover:text-zinc-900"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        /shop/{s.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {s.owner?.email || "N/A"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-800">
                      {s.whatsapp_number}
                    </td>
                    <td className="px-5 py-3.5 capitalize text-zinc-600">
                      {s.theme_id?.replace("_", " ")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          s.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {new Date(s.created_at).toLocaleDateString("en-LK")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form
                        action={toggleShopStatusAction.bind(null, s.id, s.status)}
                      >
                        <button
                          type="submit"
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            s.status === "active"
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {s.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

