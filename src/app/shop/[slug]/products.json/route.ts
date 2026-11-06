import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select(
      "id, name, slug, description, address, whatsapp_number, logo_url, settings:shop_settings(store_visibility)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!shop) {
    return new Response(JSON.stringify({ error: "Store not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const settings = Array.isArray(shop.settings) ? shop.settings[0] : shop.settings;
  if (settings?.store_visibility === false) {
    return new Response(JSON.stringify({ error: "Store is currently private" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, compare_at_price, stock_quantity, category:categories(name), images:product_images(storage_path)"
    )
    .eq("shop_id", shop.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: shop.name,
    home_page_url: `https://kadeo.lk/shop/${shop.slug}`,
    feed_url: `https://kadeo.lk/shop/${shop.slug}/products.json`,
    description: shop.description || `${shop.name} product catalog`,
    items: (products || []).map((p: any) => ({
      id: p.id,
      title: p.name,
      url: `https://kadeo.lk/shop/${shop.slug}?product=${p.slug}`,
      summary: p.description,
      price: Number(p.price),
      currency: "LKR",
      in_stock: p.stock_quantity > 0,
      stock_quantity: p.stock_quantity,
      category: p.category?.name || "Uncategorized",
      image: p.images?.[0]?.storage_path || null,
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
