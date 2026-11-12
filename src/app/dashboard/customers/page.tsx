import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustomerListClient } from "@/components/dashboard/CustomerListClient";

interface CustomersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q = "", page = "1" } = await searchParams;

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

  // Fetch all customers & orders for shop to compute stats
  const { data: allShopCustomers } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, address, created_at, updated_at")
    .eq("shop_id", shop.id);

  const { data: allShopOrders } = await supabase
    .from("orders")
    .select("id, customer_id, total, created_at")
    .eq("shop_id", shop.id);

  const orderMap = new Map<string, { count: number; totalSpent: number }>();
  for (const o of allShopOrders || []) {
    if (!o.customer_id) continue;
    const curr = orderMap.get(o.customer_id) || { count: 0, totalSpent: 0 };
    curr.count += 1;
    curr.totalSpent += Number(o.total) || 0;
    orderMap.set(o.customer_id, curr);
  }

  const totalCustomers = (allShopCustomers || []).length;
  const customersWithOrders = Array.from(orderMap.values()).filter((v) => v.count > 0).length;
  const repeatCustomers = Array.from(orderMap.values()).filter((v) => v.count > 1).length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = (allShopCustomers || []).filter(
    (c: any) => new Date(c.created_at) >= startOfMonth
  ).length;

  function buildQuery(columns: string, head = false) {
    let baseQuery = supabase
      .from("customers")
      .select(columns, { count: "exact", head })
      .eq("shop_id", shop.id);

    if (q) {
      baseQuery = baseQuery.or(
        `full_name.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%,phone.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%,email.ilike.%${q
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
  const { data: pageCustomers, error: listError } = await buildQuery(
    "id, full_name, phone, email, address, created_at, updated_at"
  )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (countError || listError) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
        Unable to load this list. Please refresh to try again.
      </p>
    );
  }

  const paginatedWithStats = (pageCustomers || []).map((c: any) => {
    const oInfo = orderMap.get(c.id) || { count: 0, totalSpent: 0 };
    return {
      ...c,
      ordersCount: oInfo.count,
      totalSpent: oInfo.totalSpent,
    };
  });

  return (
    <div className="space-y-6">
      <CustomerListClient
        customers={paginatedWithStats}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q}
        stats={{
          totalCustomers,
          customersWithOrders,
          newThisMonth,
          repeatCustomers,
        }}
      />
    </div>
  );
}
