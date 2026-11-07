import { createClient } from "@/lib/supabase/server";
import { Download, Database, ShieldCheck, FileJson, AlertCircle, Sparkles, CheckCircle2, Layers } from "lucide-react";
import { BackupStoresTable, type BackupShopItem } from "@/components/admin/BackupStoresTable";

export const dynamic = "force-dynamic";

export default async function AdminBackupsPage() {
  const supabase = await createClient();

  // Fetch shops with owner
  const { data: shops } = await supabase
    .from("shops")
    .select("*, owner:profiles(email, full_name)")
    .order("created_at", { ascending: false });

  // Get counts per shop
  const backupItems: BackupShopItem[] = await Promise.all(
    (shops || []).map(async (s: any) => {
      const { count: productsCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", s.id);

      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", s.id);

      const { count: ordersCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", s.id);

      const { count: customersCount } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", s.id);

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        whatsapp_number: s.whatsapp_number,
        owner_email: s.owner?.email || "N/A",
        status: s.status,
        storage_used_bytes: Number(s.storage_used_bytes || 0),
        products_count: productsCount || 0,
        categories_count: categoriesCount || 0,
        orders_count: ordersCount || 0,
        customers_count: customersCount || 0,
        created_at: s.created_at,
      };
    })
  );

  const totalProducts = backupItems.reduce((acc, i) => acc + i.products_count, 0);
  const totalOrders = backupItems.reduce((acc, i) => acc + i.orders_count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Store Backups & Data Governance
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Generate and download complete multi-tenant tenant snapshots, catalog inventories, customer registries, and sales ledgers.
          </p>
        </div>

        <div>
          <a
            href="/api/admin/backup/all"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Platform Bundle</span>
          </a>
        </div>
      </div>

      {/* Security & Reliability Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              Zero-Leak Multi-Tenant Backup Architecture
            </h3>
            <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
              Exported files strictly omit auth hashes, session credentials, and encrypted secrets. Each JSON payload includes version metadata, store configuration, theme IDs, product variants, media URLs, customer rosters, and historical receipts conforming to KADEO Spec v1.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200/80 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Total Catalog</div>
            <div className="text-xs font-black text-zinc-800">{totalProducts} Items</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200/80 text-center">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">Total Orders</div>
            <div className="text-xs font-black text-zinc-800">{totalOrders} Orders</div>
          </div>
        </div>
      </div>

      {/* Backup Table */}
      <BackupStoresTable shops={backupItems} />
    </div>
  );
}
