import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  ExternalLink,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { SimpleThemeCustomizer } from "@/components/dashboard/SimpleThemeCustomizer";

export const metadata = {
  title: "Store Themes - Kadeo",
  description: "Select and customize themes for your Kadeo online store.",
};

export default async function ThemesDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select(
      "id, name, slug, description, logo_url, banner_url, theme_id, storefront_content, whatsapp_number, address"
    )
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  let categories: any[] = [];
  let products: any[] = [];
  try {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("shop_id", shop.id);
    categories = cats || [];

    const { data: prods } = await supabase
      .from("products")
      .select(
        "id, name, price, compare_at_price, category:categories(name), images:product_images(storage_path)"
      )
      .eq("shop_id", shop.id)
      .limit(6);
    products = prods || [];
  } catch {
    categories = [];
    products = [];
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e8e4dc] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#017d6e] text-white flex items-center justify-center shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#192d2a]">
                Store Themes
              </h1>
              <span className="text-[10px] font-bold text-[#017d6e] px-2 py-0.5 rounded-full bg-[#e0f2eb]">
                Themes Catalog
              </span>
            </div>
            <p className="text-xs text-[#5a6861] mt-0.5 flex items-center gap-1.5">
              <span>Choose Theme</span>
              <span className="text-zinc-300">•</span>
              <span>Color Palette</span>
              <span className="text-zinc-300">•</span>
              <span>Customize</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#017d6e] text-white hover:bg-[#0e2a22] text-xs font-bold shadow-2xs transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Simple 3-Step Theme Customizer */}
      <SimpleThemeCustomizer
        shop={shop}
        categories={categories}
        products={products}
      />
    </div>
  );
}
