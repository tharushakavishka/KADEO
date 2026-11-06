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

const image = z.string().max(2048).refine(value => !value || /^\/uploads\/[a-zA-Z0-9/_-]+\.(png|jpg|webp)$/.test(value) || (() => { try { return new URL(value).protocol === "https:"; } catch { return false; } })(), "Images must use an HTTPS URL or an uploaded image.");
const schema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().max(2000), logo_url: image, banner_url: image, storefront_content: z.record(z.string(), z.string().max(2000)) });
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
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => key.startsWith("icon-image:") && !image.safeParse(value).success)) return { error: "Use a direct HTTPS image link or upload your icon." };
  if (Object.entries(parsed.data.storefront_content).some(([key,value]) => key.startsWith("icon:") && !icons.includes(value))) return { error: "Please choose an icon from the list." };
  if (Object.keys(parsed.data.storefront_content).some(key => !allowed.has(key))) return { error: "Unknown content field." };
  if (JSON.stringify(parsed.data.storefront_content).length > 100000) return { error: "Store text is too long." };
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Sign in to edit your store." };
  const { data: shop } = await db.from("shops").select("id, slug").eq("owner_id", user.id).single();
  if (!shop) return { error: "Your store could not be found." };
  const { error } = await db.from("shops").update({ ...parsed.data, logo_url: parsed.data.logo_url || null, banner_url: parsed.data.banner_url || null, updated_at: new Date().toISOString() }).eq("id", shop.id).eq("owner_id", user.id);
  if (error) return { error: "Could not save your store. Please try again." };
  revalidatePath(`/shop/${shop.slug}`);
  revalidatePath("/dashboard/design/content");
  revalidatePath("/dashboard/settings");
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
