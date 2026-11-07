import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  Palette,
  Check,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Eye,
  Store,
  Sliders,
} from "lucide-react";
import { ThemeCustomizer } from "@/components/dashboard/ThemeCustomizer";

export const ALLOWED_THEME_IDS = new Set([
  "modern_retail",
  "minimal",
  "modern_boutique",
  "classic",
  "viva_glass",
  "bold_editorial",
  "shop_app",
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

  const themes = [
    {
      id: "modern_retail",
      name: "Modern Retail (Viva)",
      description:
        "Flagship retail experience with top announcement bar, interactive search, circular category pills, promo trio banners, and trusted reviews.",
      badge: "Flagship Retail",
      bestFor: "Multi-category stores, lifestyle brands, electronics, fashion & supermarkets",
      preview: {
        bgColor: "bg-[#faf8f5]",
        headerColor: "bg-[#0e2a22] text-[#2ec49c]",
        accentColor: "bg-[#0e2a22]",
        heroText: "Elevate Your Everyday",
        heroSub: "Quality products across every category",
        fontStyle: "font-sans",
        cardBg: "bg-white border-zinc-200",
        cardTitle: "Wireless Audio / Linen",
        cardPrice: "LKR 4,800",
        badge: "Top Pick",
      },
    },
    {
      id: "minimal",
      name: "Minimal Store",
      description:
        "Warm ivory canvas, balanced clean layout, prominent product cards with modern rounded styling.",
      badge: "Most Popular",
      bestFor: "Homeware, lifestyle, gadgets & everyday items",
      preview: {
        bgColor: "bg-[#faf8f2]",
        headerColor: "bg-[#faf8f2] border-[#e8e4dc]",
        accentColor: "bg-[#017d6e]",
        heroText: "Clean & Modern",
        heroSub: "Handcrafted & curated collection",
        fontStyle: "font-sans",
        cardBg: "bg-white border-[#e8e4dc]",
        cardTitle: "Natural Craft Item",
        cardPrice: "LKR 3,500",
        badge: "In Stock",
      },
    },
    {
      id: "modern_boutique",
      name: "Modern Boutique",
      description:
        "Curated editorial layout with graceful serif typography, tailored for high-end craft, batik and jewelry.",
      badge: "Editorial",
      bestFor: "Boutiques, designer apparel, batik & fine jewelry",
      preview: {
        bgColor: "bg-[#faf8f2]",
        headerColor: "bg-[#faf8f2] border-[#e8e4dc]",
        accentColor: "bg-[#192d2a]",
        heroText: "The Curated Collection",
        heroSub: "Artisanal pieces made slowly",
        fontStyle: "font-serif",
        cardBg: "bg-[#f4eedf] border-[#e8e4dc]",
        cardTitle: "Pure Linen Batik",
        cardPrice: "LKR 6,400",
        badge: "Limited Edition",
      },
    },
    {
      id: "classic",
      name: "Classic Shop",
      description:
        "Traditional catalog storefront with structured category sidebar, detailed specifications and compact grid.",
      badge: "Retail",
      bestFor: "Groceries, cosmetics, hardware & large inventories",
      preview: {
        bgColor: "bg-white",
        headerColor: "bg-white border-zinc-200",
        accentColor: "bg-zinc-900",
        heroText: "All Department Store",
        heroSub: "Complete daily catalog",
        fontStyle: "font-sans",
        cardBg: "bg-zinc-50 border-zinc-200",
        cardTitle: "Everyday Essential",
        cardPrice: "LKR 1,850",
        badge: "Available",
      },
    },
    {
      id: "shop_app",
      name: "Shop.com Inspired (Shop App)",
      description:
        "Clean modern marketplace feed with pill search, rounded white cards, package tracking and purple accents",
      badge: "Shopify Style",
      bestFor: "Multi-category stores, trending products & lifestyle brands",
      preview: {
        bgColor: "bg-[#f8f7ff]",
        headerColor: "bg-[#5c24ff] text-white",
        accentColor: "bg-[#5c24ff]",
        heroText: "Discover & Track",
        heroSub: "Streamlined shopping with instant WhatsApp updates",
        fontStyle: "font-sans",
        cardBg: "bg-white border-purple-100",
        cardTitle: "Trending Release",
        cardPrice: "LKR 5,200",
        badge: "Shop App",
      },
    },
  ];

  async function updateThemeAction(
    themeInput: string | FormData,
    formData?: FormData | string
  ) {
    "use server";
    let themeId = "";
    if (typeof formData === "string") {
      themeId = formData;
    } else if (
      formData &&
      typeof (formData as FormData).get === "function" &&
      (formData as FormData).get("theme_id") !== null
    ) {
      themeId = (formData as FormData).get("theme_id")?.toString() || "";
    } else if (typeof themeInput === "string") {
      themeId = themeInput;
    } else if (
      themeInput &&
      typeof (themeInput as FormData).get === "function"
    ) {
      themeId = (themeInput as FormData).get("theme_id")?.toString() || "";
    }

    if (!ALLOWED_THEME_IDS.has(themeId)) {
      throw new Error(`Invalid theme selected: ${themeId}`);
    }

    const supabaseServer = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const { data: ownedShop, error: shopError } = await supabaseServer
      .from("shops")
      .select("id, slug")
      .eq("owner_id", user.id)
      .single();

    if (shopError || !ownedShop) {
      throw new Error("Store not found or unauthorized");
    }

    const { error: updateError } = await supabaseServer
      .from("shops")
      .update({ theme_id: themeId, updated_at: new Date().toISOString() })
      .eq("id", ownedShop.id)
      .eq("owner_id", user.id);

    if (updateError) {
      throw new Error("Unable to save the store theme. Please try again.");
    }

    revalidatePath("/dashboard/design");
    revalidatePath(`/shop/${ownedShop.slug}`);
  }

  return (
    <div className="space-y-10 max-w-7xl pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e8e4dc] pb-6">
        <div>
          <span className="text-[11px] font-extrabold text-[#017d6e] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e0f2eb]">
            Storefront Appearance &amp; Customizer
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#192d2a] mt-2">
            Storefront Themes &amp; Customizer
          </h1>
          <p className="text-xs sm:text-sm text-[#5a6861] mt-1">
            ඔබගේ වෙබ් අඩවියේ තේමාව, වර්ණ, අකුරු සහ පෙනුම මෙතැනින් පහසුවෙන්ම customize කරගන්න.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/design/content"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#173c32] hover:bg-[#0e2a22] text-white text-xs font-bold shadow-xs hover:shadow transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Visual Content Editor &rarr;</span>
          </Link>

          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#e8e4dc] text-[#192d2a] hover:bg-[#faf8f2] hover:border-[#cfc7ba] text-xs font-bold shadow-2xs transition group"
          >
            <Eye className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>View Live Store</span>
            <ExternalLink className="w-3 h-3 text-[#6a7872] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* SECTION 1: Interactive Theme Customizer Studio */}
      <section aria-label="Theme Customizer Studio" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#192d2a]">
              Theme Customizer (තේමා සැකසුම් ස්ටූඩියෝව)
            </h2>
            <p className="text-xs text-[#5a6861]">
              තේමා වර්ණ, බොත්තම් හැඩ, අකුරු විලාස සකසා Live Preview එක හරහා සජීවීව බලන්න.
            </p>
          </div>
        </div>

        <ThemeCustomizer shop={shop} />
      </section>

      {/* SECTION 2: Base Theme Selection Grid */}
      <section aria-label="Base Themes Catalog" className="space-y-6 pt-6 border-t border-[#e8e4dc]">
        <div>
          <h2 className="text-lg font-black text-[#192d2a]">
            Select Base Theme (මූලික තේමාව තෝරන්න)
          </h2>
          <p className="text-xs text-[#5a6861]">
            වෙළඳසැලට අවශ්‍ය මූලික layout එක තෝරන්න. ඕනෑම මොහොතක වෙනස් කළ හැක.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {themes.map((theme) => {
            const isSelected = shop.theme_id === theme.id;
            const p = theme.preview;

            return (
              <div
                key={theme.id}
                className={`rounded-3xl border flex flex-col justify-between transition-all duration-300 overflow-hidden bg-white shadow-2xs hover:shadow-lg ${
                  isSelected
                    ? "border-[#017d6e] ring-2 ring-[#017d6e]/80 shadow-md"
                    : "border-[#e8e4dc] hover:border-[#cfc7ba]"
                }`}
              >
                {/* Visual Interactive Preview Window */}
                <div className="border-b border-[#e8e4dc] bg-[#faf8f2] p-3.5">
                  <div className="flex items-center justify-between text-[10px] text-[#6a7872] pb-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ded9ce]" />
                      <span className="w-2 h-2 rounded-full bg-[#ded9ce]" />
                      <span className="w-2 h-2 rounded-full bg-[#ded9ce]" />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8a9992]">
                      Preview Mode
                    </span>
                  </div>

                  {/* Simulated Mini Webpage Screen */}
                  <div
                    className={`rounded-2xl border border-[#ded8cb] overflow-hidden p-3 shadow-inner ${p.bgColor} ${p.fontStyle}`}
                  >
                    {/* Simulated Header */}
                    <div
                      className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#e8e4dc]"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-[#192d2a] text-white flex items-center justify-center text-[10px] font-bold">
                          {shop.name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-extrabold text-[#192d2a] truncate max-w-[100px]">
                          {shop.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#017d6e]" />
                        <span className="text-[9px] font-bold text-[#017d6e] bg-[#e0f2eb] px-1.5 py-0.5 rounded-full">
                          Cart (1)
                        </span>
                      </div>
                    </div>

                    {/* Simulated Mini Hero */}
                    <div className="text-center py-2 px-1 mb-2 bg-[#f0ebe1]/50 rounded-xl">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#017d6e] block">
                        {p.heroText}
                      </span>
                      <p className="text-[10px] font-extrabold text-[#192d2a] leading-tight mt-0.5">
                        {p.heroSub}
                      </p>
                    </div>

                    {/* Simulated Mini Product Card */}
                    <div
                      className={`rounded-xl p-2 border ${p.cardBg} flex items-center justify-between shadow-2xs`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#e8e2d5] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-[#75847e]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-[#017d6e] block uppercase tracking-wider">
                            {p.badge}
                          </span>
                          <p className="text-[10px] font-bold text-[#192d2a] truncate">
                            {p.cardTitle}
                          </p>
                          <p className="text-[9px] font-extrabold text-[#192d2a]">
                            {p.cardPrice}
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-lg bg-[#192d2a] text-white flex items-center justify-center text-[10px] font-bold">
                        +
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Meta Info & Action */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-extrabold text-base text-[#192d2a]">
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2eb] text-[#017d6e]">
                        {theme.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#5a6861] leading-relaxed mb-3">
                      {theme.description}
                    </p>

                    <div className="pt-2 border-t border-[#f0ebe1] text-[11px] text-[#6c7771]">
                      <span className="font-bold text-[#192d2a]">Best suited for: </span>
                      {theme.bestFor}
                    </div>
                  </div>

                  {/* Activation Button */}
                  <form action={updateThemeAction.bind(null, theme.id)} className="pt-2">
                    <input type="hidden" name="theme_id" value={theme.id} />
                    <button
                      type="submit"
                      disabled={isSelected}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isSelected
                          ? "bg-[#e0f2eb] text-[#017d6e] cursor-default border border-[#bfe3d5]"
                          : "bg-[#192d2a] hover:bg-[#122624] text-white shadow-xs hover:shadow cursor-pointer"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 text-[#017d6e]" />
                          <span>Active Theme</span>
                        </>
                      ) : (
                        <span>Apply This Theme</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
