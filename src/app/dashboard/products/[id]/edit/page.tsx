import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ProductEditor } from "@/components/dashboard/ProductEditor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await db
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) notFound();

  const { data: product } = await db
    .from("products")
    .select("id, name, slug, description, sku, price, compare_at_price, stock_quantity, status, category_id")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .single();

  if (!product) notFound();

  const { data: categories } = await db
    .from("categories")
    .select("id, name")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  const { data: images } = await db
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const imagePaths = images?.map((img: any) => img.storage_path) || [];

  return (
    <ProductEditor
      mode="edit"
      initialProduct={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        stockQuantity: product.stock_quantity,
        categoryId: product.category_id,
        status: product.status,
        imageUrl: imagePaths[0] || "",
        images: imagePaths,
      }}
      categories={categories || []}
    />
  );
}
