import { categorySchema } from "../../lib/validations/catalog.ts";

export interface CategoryServiceContext {
  supabase: any;
  shopId: string;
  shopSlug?: string;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCategoryData(data: FormData | Record<string, any>) {
  if (data instanceof FormData) {
    const desc = data.get("description") as string;
    const slug = data.get("slug") as string;
    return {
      name: (data.get("name") as string) || "",
      slug: slug || undefined,
      description: desc === "" ? null : desc,
      sortOrder: data.get("sortOrder") !== null ? Number(data.get("sortOrder")) : 0,
    };
  }
  return {
    ...data,
    description: data.description === "" ? null : data.description,
  };
}

export async function createCategoryService(
  ctx: CategoryServiceContext,
  data: FormData | Record<string, any>
) {
  const { supabase, shopId } = ctx;
  const raw = parseCategoryData(data);
  const slug = generateSlug(raw.slug || raw.name || "");

  const validated = categorySchema.safeParse({ ...raw, slug });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { data: newCat, error } = await supabase
    .from("categories")
    .insert({
      shop_id: shopId,
      name: validated.data.name,
      slug: validated.data.slug || slug,
      description: validated.data.description || null,
      sort_order: validated.data.sortOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" || error.message?.includes("slug")) {
      return { error: "A category with this slug already exists in your shop." };
    }
    return { error: error.message };
  }

  return { success: true, category: newCat };
}

export async function updateCategoryService(
  ctx: CategoryServiceContext,
  categoryId: string,
  data: FormData | Record<string, any>
) {
  const { supabase, shopId } = ctx;

  // Verify ownership
  const { data: existing, error: existErr } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .eq("shop_id", shopId)
    .single();

  if (existErr || !existing) {
    return { error: "Category not found in your shop." };
  }

  const raw = parseCategoryData(data);
  const slug = raw.slug ? generateSlug(raw.slug) : existing.slug;

  const validated = categorySchema.safeParse({ ...raw, slug });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error: updateErr } = await supabase
    .from("categories")
    .update({
      name: validated.data.name,
      slug: validated.data.slug || slug,
      description: validated.data.description || null,
      sort_order: validated.data.sortOrder,
    })
    .eq("id", categoryId)
    .eq("shop_id", shopId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  return { success: true };
}

export async function reorderCategoriesService(
  ctx: CategoryServiceContext,
  items: Array<{ id: string; sortOrder: number }>
) {
  const { supabase, shopId } = ctx;

  for (const item of items) {
    const { error: updErr } = await supabase
      .from("categories")
      .update({ sort_order: item.sortOrder })
      .eq("id", item.id)
      .eq("shop_id", shopId);

    if (updErr) {
      return { error: `Failed to reorder category ${item.id}: ${updErr.message}` };
    }
  }

  return { success: true };
}

export async function deleteCategoryService(ctx: CategoryServiceContext, categoryId: string) {
  const { supabase, shopId } = ctx;

  // Verify ownership
  const { data: existing, error: existErr } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", categoryId)
    .eq("shop_id", shopId)
    .single();

  if (existErr || !existing) {
    return { error: "Category not found or already deleted." };
  }

  // Set products with this category to uncategorized (null)
  const { error: disassociateErr } = await supabase
    .from("products")
    .update({ category_id: null })
    .eq("category_id", categoryId)
    .eq("shop_id", shopId);

  if (disassociateErr) {
    return {
      error: `Failed to disassociate products from category: ${disassociateErr.message}. Deletion aborted.`,
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("shop_id", shopId);

  if (error) return { error: error.message };

  return { success: true, deletedName: existing.name };
}
