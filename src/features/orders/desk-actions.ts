"use server";

import { createClient } from "@/lib/supabase/server";
import { submitOrderAction } from "./actions";
import { revalidatePath } from "next/cache";

// Seller identity and store are always resolved on the server.
export async function createDeskOrderAction(payload: unknown) {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return { error: "Please sign in to create an order." };
  const { data: shop, error: shopError } = await db.from("shops")
    .select("id, slug").eq("owner_id", user.id).single();
  if (shopError || !shop) return { error: "Your store could not be loaded." };
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { error: "Invalid order details." };
  const result = await submitOrderAction({ ...payload, shopSlug: shop.slug });
  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/pos");
  }
  return result;
}
