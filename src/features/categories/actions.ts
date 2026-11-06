"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createCategoryService,
  updateCategoryService,
  reorderCategoriesService,
  deleteCategoryService,
} from "./service";

async function getAuthorizedShop() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: shop, error } = await supabase
    .from("shops")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

  if (!shop) throw new Error("Shop not found");
  return { supabase, shopId: shop.id, shopSlug: shop.slug };
}

export async function createCategoryAction(data: FormData | Record<string, any>) {
  try {
    const auth = await getAuthorizedShop();
    const result = await createCategoryService(auth, data);
    if (result.error) return { error: result.error };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: FormData | Record<string, any>
) {
  try {
    const auth = await getAuthorizedShop();
    const result = await updateCategoryService(auth, categoryId, data);
    if (result.error) return { error: result.error };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update category" };
  }
}

export async function reorderCategoriesAction(
  items: Array<{ id: string; sortOrder: number }>
) {
  try {
    const auth = await getAuthorizedShop();
    const result = await reorderCategoriesService(auth, items);
    if (result.error) return { error: result.error };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to reorder categories" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const auth = await getAuthorizedShop();
    const result = await deleteCategoryService(auth, categoryId);
    if (result.error) return { error: result.error };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to delete category" };
  }
}
