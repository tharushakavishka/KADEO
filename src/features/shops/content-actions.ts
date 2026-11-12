"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import heroVisibility from "@/lib/store-hero-visibility.json";
import fields from "@/lib/store-content-fields.json";
import { customStyleKeys, validCustomStyle } from "@/lib/store-custom-styles";
import layouts from "@/lib/store-layout-options.json";
import styleOptions from "@/lib/store-style-options.json";
import icons from "@/lib/store-icons.json";

const image = z.string().max(2048).refine(value => !value || /^(\/uploads\/|\/images\/)[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/.test(value) || (() => { try { return new URL(value).protocol === "https:"; } catch { return false; } })(), "Images must use an HTTPS URL or an uploaded image.");
const schema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().max(2000), logo_url: image.optional().nullable(), banner_url: image.optional().nullable(), storefront_content: z.record(z.string(), z.string().max(2000)) });

const ALLOWED_THEME_IDS = new Set([
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

export async function saveStoreContent(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  for (const field of [...styleOptions, ...layouts]) {
    const value = parsed.data.storefront_content[field.key];
    if (value !== undefined && !field.options.some(option => option.value === value)) return { error: "Please choose a supported style." };
  }
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => key.startsWith("custom:") && !validCustomStyle(key,value))) return { error: "Please use valid colours and style values within the allowed range." };
  if (Object.entries(parsed.data.storefront_content).some(([key,value])=>key.startsWith("visibility:") && (!heroVisibility.some(field=>field.key===key) || !["shown","hidden"].includes(value)))) return {error:"Choose a valid visibility setting."};
  const allowed = new Set(fields.map(f => f.key));
  for (const field of [...styleOptions, ...layouts]) allowed.add(field.key);
  for (const field of heroVisibility) allowed.add(field.key);
  for (const key of customStyleKeys) allowed.add(key);
  for (const name of icons) { allowed.add(`icon:${name}`); allowed.add(`icon-image:${name}`); }
  for (let i = 1; i <= 10; i++) {
    allowed.add(`slider:slide:${i}`);
    allowed.add(`shopapp:slide:${i}`);
  }
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => (key.startsWith("slider:slide:") || key.startsWith("shopapp:slide:")) && !image.safeParse(value).success)) return { error: "Slider images must use an HTTPS URL or an uploaded image." };
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => key.startsWith("icon-image:") && !image.safeParse(value).success)) return { error: "Use a direct HTTPS image link or upload your icon." };
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => key.startsWith("icon:") && !icons.includes(value))) return { error: "Please choose an icon from the list." };
  if (Object.keys(parsed.data.storefront_content).some(key => !allowed.has(key))) return { error: "Unknown content field." };
  if (JSON.stringify(parsed.data.storefront_content).length > 100000) return { error: "Store text is too long." };
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Sign in to edit your store." };
  const { data: shop } = await db.from("shops").select("id, slug, logo_url, banner_url, storefront_content").eq("owner_id", user.id).single();
  if (!shop) return { error: "Your store could not be found." };

  const currentContent = (shop.storefront_content && typeof shop.storefront_content === "object") ? shop.storefront_content : {};
  const mergedContent = { ...currentContent, ...parsed.data.storefront_content };

  // Retain existing images if not explicitly modified
  const newLogoUrl = parsed.data.logo_url !== undefined && parsed.data.logo_url !== ""
    ? parsed.data.logo_url
    : (parsed.data.logo_url === "" ? null : (shop.logo_url || null));

  const newBannerUrl = parsed.data.banner_url !== undefined && parsed.data.banner_url !== ""
    ? parsed.data.banner_url
    : (parsed.data.banner_url === "" ? null : (shop.banner_url || null));

  const { error } = await db.from("shops").update({
    ...parsed.data,
    logo_url: newLogoUrl,
    banner_url: newBannerUrl,
    storefront_content: mergedContent,
    updated_at: new Date().toISOString()
  }).eq("id", shop.id).eq("owner_id", user.id);

  if (error) return { error: "Could not save your store. Please try again." };
  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/dashboard/design/content");
  revalidatePath("/dashboard/design");
  revalidatePath("/dashboard/themes");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function saveThemeStylesAction(styleContent: Record<string, string>) {
  if (!styleContent || typeof styleContent !== "object" || Array.isArray(styleContent)) {
    return { error: "Invalid styles payload." };
  }

  // Bounded payload validation (Phase 11 - Database Safety)
  const serialized = JSON.stringify(styleContent);
  if (serialized.length > 150000) {
    return { error: "Theme styles payload exceeds 150KB limit." };
  }

  for (const [key, value] of Object.entries(styleContent)) {
    if (typeof key !== "string" || !/^[a-zA-Z0-9_:.-]+$/.test(key)) {
      return { error: `Invalid content key format: ${key}` };
    }
    if (typeof value !== "string" || value.length > 3000) {
      return { error: `Content value for key "${key}" exceeds character limit.` };
    }
    if (key.startsWith("custom:") && !validCustomStyle(key, value)) {
      return { error: "Please use valid colours and style values within the allowed range." };
    }
  }

  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Sign in to edit your store." };
  const { data: shop } = await db.from("shops").select("id, slug, storefront_content").eq("owner_id", user.id).single();
  if (!shop) return { error: "Your store could not be found." };

  const currentContent = (shop.storefront_content && typeof shop.storefront_content === "object") ? shop.storefront_content : {};
  const mergedContent = { ...currentContent, ...styleContent };

  const updateData: Record<string, any> = {
    storefront_content: mergedContent,
    updated_at: new Date().toISOString(),
  };
  const slide1 = styleContent["slider:slide:1"] || styleContent["element:hero:image"] || styleContent["hero:image_url"];
  if (slide1 && typeof slide1 === "string" && slide1.trim()) {
    updateData.banner_url = slide1.trim();
  }

  const { error } = await db.from("shops").update(updateData).eq("id", shop.id).eq("owner_id", user.id);

  if (error) return { error: "Could not save your theme styles." };
  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/dashboard/design");
  revalidatePath("/dashboard/themes");
  revalidatePath("/dashboard/design/content");
  return { success: true };
}

export async function updateStoreThemeAction(themeId: string) {
  if (!ALLOWED_THEME_IDS.has(themeId)) {
    return { error: `Invalid theme selected: ${themeId}` };
  }
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Sign in first." };
  const { data: shop } = await db.from("shops").select("id, slug").eq("owner_id", user.id).single();
  if (!shop) return { error: "Store not found." };

  const { error } = await db.from("shops").update({
    theme_id: themeId,
    updated_at: new Date().toISOString()
  }).eq("id", shop.id).eq("owner_id", user.id);

  if (error) return { error: "Failed to update store theme." };
  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/dashboard/design");
  revalidatePath("/dashboard/themes");
  return { success: true };
}

export async function saveProductContent(id: string, input: unknown) {
  const parsed = z.object({ name: z.string().trim().min(2).max(200), description: z.string().max(5000), imageUrl: image }).safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Sign in first." };
  const { data: shop } = await db.from("shops").select("id,slug").eq("owner_id",user.id).single();
  if (!shop) return { error: "Store not found." };
  const { data: product } = await db.from("products").select("id").eq("id",id).eq("shop_id",shop.id).single();
  if (!product) return { error: "Product not found in your store." };
  const { error } = await db.from("products").update({name:parsed.data.name,description:parsed.data.description}).eq("id",id).eq("shop_id",shop.id);
  if (error) return { error: "Product text could not be saved." };
  const { data: images } = await db.from("product_images").select("id").eq("product_id",id).eq("shop_id",shop.id).order("sort_order",{ascending:true});
  const current = images?.[0];
  const imageResult = current
    ? parsed.data.imageUrl ? await db.from("product_images").update({storage_path:parsed.data.imageUrl}).eq("id",current.id).eq("shop_id",shop.id) : await db.from("product_images").delete().eq("id",current.id).eq("shop_id",shop.id)
    : parsed.data.imageUrl ? await db.from("product_images").insert({product_id:id,shop_id:shop.id,storage_path:parsed.data.imageUrl,sort_order:0}) : {error:null};
  revalidatePath(`/shop/${shop.slug}`); revalidatePath("/dashboard/products"); revalidatePath(`/dashboard/products/${id}/edit`); revalidatePath("/dashboard/design/content");
  if (imageResult.error) return {error:"Product text saved, but the image could not be saved. Please retry the image."};
  return {success:true};
}

export async function saveThemeStudioDraftAction(draftPayload: Record<string, any>) {
  if (!draftPayload || typeof draftPayload !== 'object') {
    return { error: 'Invalid draft payload.' };
  }
  const serialized = JSON.stringify(draftPayload);
  if (serialized.length > 150000) {
    return { error: 'Draft payload exceeds 150KB limit.' };
  }
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Sign in first.' };
  const { data: shop } = await db.from('shops').select('id, slug, storefront_content').eq('owner_id', user.id).single();
  if (!shop) return { error: 'Store not found.' };

  const currentContent = (shop.storefront_content && typeof shop.storefront_content === 'object') ? shop.storefront_content : {};
  // Drafts persist to _theme_studio_draft without touching live published fields
  const updatedContent = {
    ...currentContent,
    _theme_studio_draft: JSON.stringify(draftPayload),
  };

  const { error } = await db.from('shops').update({
    storefront_content: updatedContent,
    updated_at: new Date().toISOString(),
  }).eq('id', shop.id).eq('owner_id', user.id);

  if (error) return { error: 'Could not save draft.' };
  revalidatePath('/dashboard/design');
  revalidatePath('/dashboard/themes');
  return { success: true };
}

export async function publishThemeStudioAction(payload: {
  themeId: string;
  storefront_content: Record<string, string>;
  logo_url?: string | null;
  banner_url?: string | null;
}) {
  if (!payload || !payload.themeId || !payload.storefront_content) {
    return { error: 'Theme ID and content are required to publish.' };
  }
  if (!ALLOWED_THEME_IDS.has(payload.themeId)) {
    return { error: 'Invalid theme selected: ' + payload.themeId };
  }
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Sign in first.' };
  const { data: shop } = await db.from('shops').select('id, slug, logo_url, banner_url, storefront_content').eq('owner_id', user.id).single();
  if (!shop) return { error: 'Store not found.' };

  const cleanContent = { ...payload.storefront_content };
  delete cleanContent._theme_studio_draft;

  const updateData: any = {
    theme_id: payload.themeId,
    storefront_content: cleanContent,
    updated_at: new Date().toISOString(),
  };

  if (payload.logo_url !== undefined) updateData.logo_url = payload.logo_url;
  if (payload.banner_url !== undefined) updateData.banner_url = payload.banner_url;

  const { error } = await db.from('shops').update(updateData).eq('id', shop.id).eq('owner_id', user.id);
  if (error) return { error: 'Failed to publish storefront design.' };

  revalidatePath('/shop/' + shop.slug);
  revalidatePath('/dashboard/design');
  revalidatePath('/dashboard/themes');
  revalidatePath('/dashboard/design/content');
  return { success: true };
}

export async function discardThemeStudioDraftAction() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Sign in first.' };
  const { data: shop } = await db.from('shops').select('id, slug, storefront_content').eq('owner_id', user.id).single();
  if (!shop) return { error: 'Store not found.' };

  const currentContent = (shop.storefront_content && typeof shop.storefront_content === 'object') ? { ...shop.storefront_content } : {};
  delete currentContent._theme_studio_draft;

  const { error } = await db.from('shops').update({
    storefront_content: currentContent,
    updated_at: new Date().toISOString(),
  }).eq('id', shop.id).eq('owner_id', user.id);

  if (error) return { error: 'Could not discard draft.' };
  revalidatePath('/dashboard/design');
  revalidatePath('/dashboard/themes');
  return { success: true };
}
