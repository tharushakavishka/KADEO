import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/dashboard/CategoryManager";

export default async function CategoriesPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products:products(count)")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Catalog Management
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Product Categories
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Organize your shop products into clean, browsable categories for your customers.
        </p>
      </div>

      <CategoryManager initialCategories={categories || []} />
    </div>
  );
}
