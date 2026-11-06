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
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const PAGE_SIZE = 10;
  const parsedPage = parseInt(page, 10);
  const requestedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  function buildQuery(columns: string, head = false) {
  let baseQuery = supabase.from("customers").select(columns, { count: "exact", head }).eq("shop_id", shop.id);
  if (q) {
    baseQuery = baseQuery.or(`full_name.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%,phone.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%,email.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%`);
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
  const { data: pageCustomers, error: listError } = await buildQuery("*, orders:orders(count)")
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (countError || listError) return <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">Unable to load this list. Please refresh to try again.</p>;

  const paginated = pageCustomers || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Audience & CRM
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Store Customers ({totalCount})
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Customers who placed orders on your store with their contact and delivery details.
        </p>
      </div>

      <CustomerListClient
        customers={paginated}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q}
      />
    </div>
  );
}
