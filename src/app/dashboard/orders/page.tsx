import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrderListClient } from "@/components/dashboard/OrderListClient";

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
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const PAGE_SIZE = 10;
  const parsedPage = parseInt(page, 10);
  const requestedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  function buildQuery(columns: string, head = false) {
    let baseQuery = supabase
      .from("orders")
      .select(columns, { count: "exact", head })
      .eq("shop_id", shop.id);

    if (status && status !== "all") {
      baseQuery = baseQuery.eq("status", status);
    }
    if (q && q !== "...") {
      baseQuery = baseQuery.or(
        `order_code.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%,customer_name_snapshot.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%,customer_phone_snapshot.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%`
      );
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
  const { data: pageOrders, error: listError } = await buildQuery(
    "id, order_code, customer_name_snapshot, customer_phone_snapshot, total, status, created_at, updated_at"
  )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (countError || listError) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
        Unable to load this list. Please refresh to try again.
      </p>
    );
  }

  const paginated = pageOrders || [];

  // Stage counts for KPI cards
  const stages = await Promise.all(
    ["pending", "processing", "shipped", "completed"].map(async (stage) => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shop.id)
        .eq("status", stage);
      return { stage, count: error ? 0 : count ?? 0 };
    })
  );

  const stageCounts = {
    pending: stages.find((s) => s.stage === "pending")?.count ?? 0,
    processing: stages.find((s) => s.stage === "processing")?.count ?? 0,
    shipped: stages.find((s) => s.stage === "shipped")?.count ?? 0,
    completed: stages.find((s) => s.stage === "completed")?.count ?? 0,
  };

  return (
    <div className="space-y-6">
      <OrderListClient
        orders={paginated}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q === "..." ? "" : q}
        currentStatus={status}
        stageCounts={stageCounts}
      />
    </div>
  );
}
