import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  // Fetch shop categories for filter dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  // Fetch all shop products to compute high-level catalog stats (Total, In Stock, Out of Stock)
  const { data: allShopProducts } = await supabase
    .from("products")
    .select("id, stock_quantity, status")
    .eq("shop_id", shop.id);

  const totalProducts = (allShopProducts || []).length;
  const inStockCount = (allShopProducts || []).filter(
    (p: any) => Number(p.stock_quantity) > 0 && p.status !== "out_of_stock"
  ).length;
  const outOfStockCount = (allShopProducts || []).filter(
    (p: any) => Number(p.stock_quantity) <= 0 || p.status === "out_of_stock"
  ).length;
  const totalCategories = (categories || []).length;

  const PAGE_SIZE = 10;
  const parsedPage = parseInt(page, 10);
  const requestedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Build query with filters
  function buildQuery(columns: string, head = false) {
    let baseQuery = supabase
      .from("products")
      .select(columns, { count: "exact", head })
      .eq("shop_id", shop.id);

    if (category) {
      baseQuery = baseQuery.eq("category_id", category);
    }
    if (status && status !== "all") {
      baseQuery = baseQuery.eq("status", status);
    }
    if (q) {
      baseQuery = baseQuery.or(
        `name.ilike.%${q
          .trim()
          .slice(0, 80)
          .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF@+_-]/g, "")
          .replace(/_/g, "")}%,sku.ilike.%${q
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
  const { data: pageProducts, error: listError } = await buildQuery(
    "*, category:categories(name), images:product_images(storage_path)"
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

  const paginated = pageProducts || [];

  return (
    <ProductListClient
      products={paginated}
      categories={categories || []}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      searchQuery={q}
      categoryFilter={category}
      statusFilter={status}
      totalProducts={totalProducts}
      totalCategories={totalCategories}
      inStockCount={inStockCount}
      outOfStockCount={outOfStockCount}
      shopName={shop.name}
      shopSlug={shop.slug}
    />
  );
}
