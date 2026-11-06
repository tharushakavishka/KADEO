import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

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
      "id, name, slug, description, address, whatsapp_number, settings:shop_settings(store_visibility, delivery_information)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!shop) {
    return new Response("Store not found", { status: 404 });
  }

  const settings = Array.isArray(shop.settings) ? shop.settings[0] : shop.settings;
  if (settings?.store_visibility === false) {
    return new Response("Store is currently private", { status: 403 });
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, compare_at_price, stock_quantity, category:categories(name)"
    )
    .eq("shop_id", shop.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const lines: string[] = [];
  lines.push(`# ${shop.name} - Online Store Catalog (AI Discovery)`);
  if (shop.description) {
    lines.push(`> ${shop.description}`);
  }
  lines.push("");
  lines.push("## Store Overview");
  lines.push(`- **Store Name:** ${shop.name}`);
  lines.push(`- **WhatsApp Orders & Inquiries:** ${shop.whatsapp_number}`);
  if (shop.address) {
    lines.push(`- **Location:** ${shop.address}`);
  }
  if (settings?.delivery_information) {
    lines.push(`- **Shipping & Delivery:** ${settings.delivery_information}`);
  }
  lines.push("");
  lines.push("## Available Products");

  if (!products || products.length === 0) {
    lines.push("No active products available currently.");
  } else {
    for (const p of products) {
      const cat = (p as any).category?.name || "General";
      const stock = p.stock_quantity > 0 ? `In Stock (${p.stock_quantity})` : "Sold Out";
      lines.push(`### ${p.name}`);
      lines.push(`- **Price:** ${formatCurrency(p.price)}`);
      lines.push(`- **Category:** ${cat}`);
      lines.push(`- **Stock:** ${stock}`);
      if (p.description) {
        lines.push(`- **Description:** ${p.description}`);
      }
      lines.push("");
    }
  }

  lines.push("## Instructions for AI Agents & Search Engines");
  lines.push(`Customers can place direct orders via WhatsApp: https://wa.me/${shop.whatsapp_number.replace(/\D/g, "")}`);
  lines.push("Cash on Delivery (COD) and Islandwide delivery are available across Sri Lanka.");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
