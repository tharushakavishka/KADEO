"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  courierDetails?: { courierName?: string; trackingNumber?: string }
) {
  if (!orderId || typeof orderId !== "string" || !newStatus || typeof newStatus !== "string") {
    return { error: "Order ID and target status are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized. Please sign in." };
  }

  // Verify ownership
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shopError || !shop) {
    return { error: "Shop not found or permission denied." };
  }

  // Atomic & Idempotent status transition via RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_shop_id: shop.id,
    p_courier_name: courierDetails?.courierName?.trim() || null,
    p_tracking_number: courierDetails?.trackingNumber?.trim() || null,
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  revalidatePath(`/dashboard/orders`);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/dashboard`);
  return { success: true, data: rpcData };
}
