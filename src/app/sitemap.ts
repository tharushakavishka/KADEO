import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kadeo.vercel.app";

  // Static Platform routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: shops } = await supabase
      .from("shops")
      .select("slug, updated_at")
      .eq("status", "active");

    const storeRoutes: MetadataRoute.Sitemap = (shops || []).map((shop: { slug: string; updated_at?: string }) => ({
      url: `${baseUrl}/shop/${shop.slug}`,
      lastModified: shop.updated_at ? new Date(shop.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    return [...staticRoutes, ...storeRoutes];
  } catch {
    return staticRoutes;
  }
}
