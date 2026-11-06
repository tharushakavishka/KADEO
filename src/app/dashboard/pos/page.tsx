import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SalesDesk } from "@/components/dashboard/SalesDesk";

export default async function SalesDeskPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 80);
  const requestedPage = Math.max(1, Math.min(10000, Number.parseInt(params.page || "1", 10) || 1));
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: shop } = await db.from("shops").select("id, name").eq("owner_id", user.id).single();
  if (!shop) redirect("/dashboard/new-store");
  function catalogQuery(head = false) {
    let query = db.from("products").select("id, name, sku, price, stock_quantity", { count: "exact", head })
      .eq("shop_id", shop.id).eq("status", "active");
    if (q) query = query.ilike("name", `%${q.replace(/[%_]/g, "")}%`);
    return query;
  }
  const { count, error: countError } = await catalogQuery(true);
  const totalPages = Math.max(1, Math.ceil((count || 0) / 24));
  const page = Math.min(requestedPage, totalPages);
  const { data, error } = await catalogQuery().order("name").range((page - 1) * 24, page * 24 - 1);
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#7960df]">Seller workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#30234e]">Sales desk</h1>
        <p className="mt-2 text-sm text-slate-500">Build an order, review the total, then manage fulfillment in Orders.</p>
      </div>
      <Link href="/dashboard/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs">Manage orders →</Link>
    </header>
    {error || countError ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Products could not be loaded. Refresh to try again.</p>
      : <SalesDesk products={data || []} query={q} page={page} totalPages={totalPages} shopId={shop.id} />}
  </div>;
}
