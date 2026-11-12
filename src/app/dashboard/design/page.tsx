import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  Palette,
  ExternalLink,
  Eye,
  Sliders,
  Sparkles,
  Layout,
  ArrowRight,
} from "lucide-react";
import { ThemeCustomizer } from "@/components/dashboard/ThemeCustomizer";

export const ALLOWED_THEME_IDS = new Set([
  "elite_commerce",
  "modern_retail",
  "minimal",
  "modern_boutique",
  "classic",
  "viva_glass",
  "bold_editorial",
  "shop_app",
  "custom",
]);

export default async function StoreDesignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, description, logo_url, banner_url, theme_id, storefront_content")
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
      .select("id, name, price, compare_at_price, category:categories(name)")
      .eq("shop_id", shop.id)
      .limit(4);
    products = prods || [];
  } catch {
    categories = [];
    products = [];
  }

  async function updateThemeAction(formDataOrThemeId?: any): Promise<void> {
    "use server";
    const db = await createClient();
    const {
      data: { user: currentUser },
    } = await db.auth.getUser();

    if (!currentUser) {
      redirect("/login");
    }

    let themeId = "modern_retail";
    if (typeof formDataOrThemeId === "string") {
      themeId = formDataOrThemeId;
    } else if (formDataOrThemeId && typeof formDataOrThemeId.get === "function") {
      themeId = String(formDataOrThemeId.get("theme_id") || "modern_retail");
    }

    if (!ALLOWED_THEME_IDS.has(themeId)) {
      throw new Error("Invalid theme selected: " + themeId);
    }

    const { data: currentShop } = await db
      .from("shops")
      .select("id, slug")
      .eq("owner_id", currentUser.id)
      .single();

    if (!currentShop) {
      redirect("/login");
    }

    const { error } = await db
      .from("shops")
      .update({
        theme_id: themeId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentShop.id)
      .eq("owner_id", currentUser.id);

    if (error) {
      throw new Error("Unable to save the store theme: " + error.message);
    }

    revalidatePath("/dashboard/design");
    revalidatePath(`/shop/${currentShop.slug}`);
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16 font-sans">
      <form action={updateThemeAction} className="hidden" aria-hidden="true">
        <input type="hidden" name="theme_id" value={shop.theme_id} />
        <button type="submit">Update Theme</button>
      </form>

      {/* Top Header - Icon First, Minimal Text */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e8e4dc] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#017d6e] text-white flex items-center justify-center shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#192d2a]">
                Theme Studio
              </h1>
              <span className="text-[10px] font-bold text-[#017d6e] px-2 py-0.5 rounded-full bg-[#e0f2eb]">
                Visual
              </span>
            </div>
            <p className="text-xs text-[#5a6861] mt-0.5 flex items-center gap-1.5">
              <span>Themes</span>
              <span className="text-zinc-300">•</span>
              <span>Palettes</span>
              <span className="text-zinc-300">•</span>
              <span>Visual Customizer</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e4dc] text-[#192d2a] hover:bg-[#faf8f2] text-xs font-bold shadow-2xs transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>Storefront</span>
            <ExternalLink className="w-3 h-3 text-[#6a7872]" />
          </Link>
        </div>
      </div>

      {/* Unified Theme Customizer Studio */}
      <section aria-label="Theme Customizer Studio">
        <ThemeCustomizer
          shop={shop}
          categories={categories}
          products={products}
        />
      </section>
    </div>
  );
}
