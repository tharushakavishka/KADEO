import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrderListClient } from "@/components/dashboard/OrderListClient";
import Link from "next/link";

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status = "all", q = "", page = "1" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const PAGE_SIZE = 10;
  const parsedPage = parseInt(page, 10);
  const requestedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  function buildQuery(columns: string, head = false) {
  let baseQuery = supabase.from("orders").select(columns, { count: "exact", head }).eq("shop_id", shop.id);
  if (status && status !== "all") {
    baseQuery = baseQuery.eq("status", status);
  }
  if (q) {
    baseQuery = baseQuery.or(`order_code.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%,customer_name_snapshot.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%,customer_phone_snapshot.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%`);
  }

  return baseQuery;
  }

  // Separate builders prevent HEAD count requests from leaking into list requests.
  const { count: totalRows, error: countError } = await buildQuery("*", true);
  const totalCount = totalRows ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.max(1, Math.min(requestedPage, totalPages));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Bounded database fetch
  const { data: pageOrders, error: listError } = await buildQuery("id, order_code, customer_name_snapshot, customer_phone_snapshot, total, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (countError || listError) return <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">Unable to load this list. Please refresh to try again.</p>;

  const paginated = pageOrders || [];
  const stages = await Promise.all(["pending", "processing", "shipped", "completed"].map(async stage => {
    const { count, error } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).eq("status", stage);
    return { stage, count: error ? null : count ?? 0 };
  }));

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Order Management
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Store Orders ({totalCount})
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          View, track, and update fulfillment for incoming customer WhatsApp orders.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Your fulfillment queue across all orders</p><Link href="/dashboard/pos" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white">+ New order</Link></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stages.map(({ stage, count }) => <Link key={stage} href={`/dashboard/orders?status=${stage}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-400"><span className="block text-xs font-semibold capitalize text-slate-500">{stage === "pending" ? "Needs confirmation" : stage === "processing" ? "To pack" : stage === "shipped" ? "On the way" : "Completed"}</span><span className="mt-2 block text-3xl font-bold text-slate-900">{count ?? "—"}</span></Link>)}</div>
      <OrderListClient
        orders={paginated}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q}
        currentStatus={status}
      />
    </div>
  );
}
