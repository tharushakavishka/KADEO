import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductEditor } from "@/components/dashboard/ProductEditor";

export default async function NewProductPage() {
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
    .select("id, name")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  return (
    <ProductEditor
      mode="create"
      categories={categories || []}
    />
  );
}
