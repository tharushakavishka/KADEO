import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductListClient } from "@/components/dashboard/ProductListClient";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q = "", category = "", status = "all", page = "1" } = await searchParams;

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

  // Fetch shop categories for filter dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  const PAGE_SIZE = 10;
  const parsedPage = parseInt(page, 10);
  const requestedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Build query with filters
  function buildQuery(columns: string, head = false) {
  let baseQuery = supabase.from("products").select(columns, { count: "exact", head }).eq("shop_id", shop.id);
  if (category) {
    baseQuery = baseQuery.eq("category_id", category);
  }
  if (status && status !== "all") {
    baseQuery = baseQuery.eq("status", status);
  }
  if (q) {
    baseQuery = baseQuery.or(`name.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%,sku.ilike.%${q.trim().slice(0, 80).replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "").replace(/_/g, "")}%`);
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
  const { data: pageProducts, error: listError } = await buildQuery("*, category:categories(name), images:product_images(storage_path)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (countError || listError) return <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">Unable to load this list. Please refresh to try again.</p>;

  const paginated = pageProducts || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Inventory & Catalog
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Products ({totalCount})
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your items, pricing, stock levels, and store visibility.
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      <ProductListClient
        products={paginated}
        categories={categories || []}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q}
        categoryFilter={category}
        statusFilter={status}
      />
    </div>
  );
}
