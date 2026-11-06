import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreContentEditor } from "@/components/dashboard/StoreContentEditor";
export default async function ContentPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: shop } = await db.from("shops").select("*").eq("owner_id", user.id).single();
  if (!shop) redirect("/dashboard/new-store");
  const { data: categories } = await db.from("categories").select("id,name,slug").eq("shop_id", shop.id);
  const { data: products } = await db.from("products").select("id,name,slug,description,price,compare_at_price,stock_quantity,category:categories(name),images:product_images(storage_path)").eq("shop_id", shop.id).eq("status", "active");
  return <StoreContentEditor shop={shop} categories={categories || []} products={products || []} />;
}
