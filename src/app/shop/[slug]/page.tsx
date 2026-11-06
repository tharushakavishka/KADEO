import { StoreContent } from "@/components/storefront/StoreContent";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/components/storefront/CartDrawer";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontMobileBar } from "@/components/storefront/StorefrontMobileBar";
import { MinimalTheme } from "@/components/storefront/themes/MinimalTheme";
import { BoutiqueTheme } from "@/components/storefront/themes/BoutiqueTheme";
import { ClassicTheme } from "@/components/storefront/themes/ClassicTheme";
import { ModernRetailTheme } from "@/components/storefront/themes/ModernRetailTheme";
import { Eye, Lock, ArrowLeft, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, owner_id, name, description, settings:shop_settings(store_visibility)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!shop) {
    return { title: "Store Not Found · KADEO" };
  }

  const settings = Array.isArray(shop.settings) ? shop.settings[0] : shop.settings;
  const isVisible = settings?.store_visibility !== false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = Boolean(user && user.id === shop.owner_id);

  if (!isVisible && !isOwner) {
    return {
      title: "Store Unavailable · KADEO",
      description: "This store is currently private or not accepting public visitors.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${shop.name} · Official Online Store`,
    description: shop.description || `Browse products and order directly from ${shop.name} via WhatsApp.`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Shop & Settings
  const { data: shop } = await supabase
    .from("shops")
    .select(
      "id, owner_id, name, slug, description, logo_url, banner_url, whatsapp_number, address, theme_id, status, storefront_content, settings:shop_settings(store_visibility, delivery_information)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!shop) {
    notFound();
  }

  const settings = Array.isArray(shop.settings) ? shop.settings[0] : shop.settings;
  const isVisible = settings?.store_visibility !== false;
  const deliveryInfo = settings?.delivery_information || null;

  // Check authentication for owner preview
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = Boolean(user && user.id === shop.owner_id);

  // If store is hidden from public and current viewer is NOT owner, block access
  if (!isVisible && !isOwner) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-4 selection:bg-[#192d2a] selection:text-white">
        <div className="max-w-md w-full bg-white border border-[#e8e4dc] rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#f0ebe1] text-[#192d2a] flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8 opacity-75" />
          </div>
          <h1 className="text-2xl font-black text-[#192d2a] tracking-tight">
            Storefront Offline
          </h1>
          <p className="text-xs text-[#6a7872] leading-relaxed">
            <strong>{shop.name}</strong> is currently private or in maintenance mode. Please check back later or contact the seller directly.
          </p>
          <div className="pt-4 border-t border-[#f0ebe1]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#192d2a] hover:text-[#017d6e] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Kadeo Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("shop_id", shop.id)
    .order("sort_order", { ascending: true });

  // 3. Fetch Active Products
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, compare_at_price, stock_quantity, status, category:categories(name), images:product_images(storage_path)"
    )
    .eq("shop_id", shop.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const shopData = {
    name: shop.name,
    description: shop.description,
    banner_url: shop.banner_url,
    whatsapp_number: shop.whatsapp_number,
    address: shop.address,
    slug: shop.slug,
    logo_url: shop.logo_url,
  };

  const isRetailTheme = shop.theme_id === "modern_retail";

  // Render matching theme
  function renderTheme() {
    switch (shop?.theme_id) {
      case "modern_retail":
        return (
          <ModernRetailTheme
            shop={shopData}
            categories={categories || []}
            products={(products as any) || []}
          />
        );
      case "modern_boutique":
        return (
          <BoutiqueTheme
            shop={shopData}
            categories={categories || []}
            products={(products as any) || []}
          />
        );
      case "classic":
        return (
          <ClassicTheme
            shop={shopData}
            categories={categories || []}
            products={(products as any) || []}
          />
        );
      case "minimal":
      default:
        return (
          <MinimalTheme
            shop={shopData}
            categories={categories || []}
            products={(products as any) || []}
          />
        );
    }
  }

  return (
    <StoreContent values={shop.storefront_content}>
      <CartProvider shopSlug={shop.slug}>
        {/* Owner Authenticated Preview Banner */}
        {!isVisible && isOwner && (
          <div className="bg-amber-400 text-zinc-950 px-4 py-2 text-center text-xs font-bold sticky top-0 z-50 flex items-center justify-center gap-2 shadow-sm border-b border-amber-500">
            <Eye className="w-4 h-4 text-zinc-900" />
            <span>
              Store Preview Mode: Your storefront visibility is currently toggled OFF in settings. Only you can view this page.
            </span>
            <Link
              href="/dashboard/settings"
              className="underline font-extrabold hover:text-white transition ml-1"
            >
              Settings
            </Link>
          </div>
        )}

        {!isRetailTheme && (
          <StorefrontHeader
            shopName={shop.name}
            shopSlug={shop.slug}
            whatsappNumber={shop.whatsapp_number}
            logoUrl={shop.logo_url}
            deliveryInformation={deliveryInfo}
          />
        )}
        <main className="pb-16 sm:pb-0">{renderTheme()}</main>

        {/* Mobile Sticky Quick-Action Bar */}
        <StorefrontMobileBar
          shopName={shop.name}
          whatsappNumber={shop.whatsapp_number}
        />
      </CartProvider>
    </StoreContent>
  );
}
