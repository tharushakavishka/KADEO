"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProductService,
  updateProductService,
  archiveProductService,
  deleteProductService,
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

  if (error || !shop) throw new Error("Shop not found");
  return { supabase, shopId: shop.id, shopSlug: shop.slug, user };
}

export async function createProductAction(formData: FormData | Record<string, any>) {
  let shopSlugToRevalidate: string | null = null;
  let serviceResult: any = null;

  try {
    const auth = await getAuthorizedShop();
    shopSlugToRevalidate = auth.shopSlug;

    serviceResult = await createProductService(auth, formData);
    if (serviceResult.error && !serviceResult.partialSuccess) {
      return { error: serviceResult.error };
    }
  } catch (err: any) {
    return { error: err.message || "Failed to create product" };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  if (shopSlugToRevalidate) {
    revalidatePath(`/shop/${shopSlugToRevalidate}`);
  }

  if (serviceResult?.partialSuccess) {
    return {
      partialSuccess: true,
      error: serviceResult.error,
      productId: serviceResult.productId,
    };
  }

  redirect("/dashboard/products");
}

export async function updateProductAction(
  productId: string,
  formData: FormData | Record<string, any>
) {
  try {
    const auth = await getAuthorizedShop();
    const result = await updateProductService(auth, productId, formData);
    if (result.error && !result.partialSuccess) {
      return { error: result.error };
    }

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}/edit`);
    revalidatePath("/dashboard");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update product" };
  }
}

export async function archiveProductAction(productId: string) {
  try {
    const auth = await getAuthorizedShop();
    const result = await archiveProductService(auth, productId);
    if (result.error) return { error: result.error };

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to archive product" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const auth = await getAuthorizedShop();
    const result = await deleteProductService(auth, productId);
    if (result.error && !result.deletedName) {
      return { error: result.error };
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to delete product" };
  }
}

export async function quickUpdateStockAction(productId: string, addQuantity: number) {
  try {
    const auth = await getAuthorizedShop();
    const { data: product, error: fetchErr } = await auth.supabase
      .from("products")
      .select("id, stock_quantity, status")
      .eq("id", productId)
      .eq("shop_id", auth.shopId)
      .single();

    if (fetchErr || !product) {
      return { error: "Product not found or access denied." };
    }

    const currentStock = Number(product.stock_quantity) || 0;
    const newStock = Math.max(0, currentStock + addQuantity);
    const newStatus = newStock > 0 && product.status === "draft" ? "active" : product.status;

    const { error: updateErr } = await auth.supabase
      .from("products")
      .update({ stock_quantity: newStock, status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("shop_id", auth.shopId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    if (auth.shopSlug) {
      revalidatePath(`/shop/${auth.shopSlug}`);
    }
    return { success: true, newStock };
  } catch (err: any) {
    return { error: err.message || "Failed to update stock." };
  }
}
