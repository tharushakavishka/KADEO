import { createClient } from "@/lib/supabase/server";

export interface DeleteShopResult {
  success: boolean;
  error?: string;
  shopId?: string;
  shopName?: string;
}

/**
 * Permanently deletes a store and all associated entities cleanly:
 * 1. order_payments
 * 2. order_items
 * 3. orders
 * 4. customers
 * 5. product_images
 * 6. products
 * 7. categories
 * 8. subscriptions
 * 9. shop_settings
 * 10. shops
 * 11. Optionally removes or cascades seller profile (if requested)
 */
export async function deleteShopCascade(
  shopId: string,
  clientOverride?: any
): Promise<DeleteShopResult> {
  const supabase = clientOverride || (await createClient());

  try {
    // 1. Fetch shop record
    const { data: shop, error: shopErr } = await supabase
      .from("shops")
      .select("id, name, slug, owner_id")
      .eq("id", shopId)
      .single();

    if (shopErr || !shop) {
      return { success: false, error: "Store not found" };
    }

    // 2. Cascade delete dependent child tables in proper foreign key order
    // Order payments
    await supabase.from("order_payments").delete().eq("shop_id", shopId);

    // Order items
    await supabase.from("order_items").delete().eq("shop_id", shopId);

    // Orders
    await supabase.from("orders").delete().eq("shop_id", shopId);

    // Customers
    await supabase.from("customers").delete().eq("shop_id", shopId);

    // Product images
    await supabase.from("product_images").delete().eq("shop_id", shopId);

    // Products
    await supabase.from("products").delete().eq("shop_id", shopId);

    // Categories
    await supabase.from("categories").delete().eq("shop_id", shopId);

    // Subscriptions
    await supabase.from("subscriptions").delete().eq("shop_id", shopId);

    // Shop settings
    await supabase.from("shop_settings").delete().eq("shop_id", shopId);

    // 3. Delete the shop itself
    const { error: delErr } = await supabase.from("shops").delete().eq("id", shopId);

    if (delErr) {
      return { success: false, error: delErr.message || "Failed to delete store" };
    }

    return {
      success: true,
      shopId: shop.id,
      shopName: shop.name,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred during store deletion",
    };
  }
}

/**
 * Super Admin Action: Permanently delete any merchant's store
 */
export async function adminDeleteShopAction(
  shopId: string,
  clientOverride?: any
): Promise<DeleteShopResult> {
  const supabase = clientOverride || (await createClient());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized: Sign in required" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Super Admin access required" };
  }

  if (!shopId) {
    return { success: false, error: "Store ID is required" };
  }

  return await deleteShopCascade(shopId, supabase);
}

/**
 * Seller Action: Permanently delete their own store and profile
 */
export async function sellerDeleteAccountAction(
  clientOverride?: any
): Promise<DeleteShopResult> {
  const supabase = clientOverride || (await createClient());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized: Sign in required" };
  }

  // Find the seller's shop
  const { data: shop } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (shop) {
    const delRes = await deleteShopCascade(shop.id, supabase);
    if (!delRes.success) {
      return delRes;
    }
  }

  // Delete seller profile
  await supabase.from("profiles").delete().eq("id", user.id);

  // Sign out user session
  try {
    await supabase.auth.signOut();
  } catch {
    // Non-fatal if session signOut is local
  }

  return { success: true };
}
