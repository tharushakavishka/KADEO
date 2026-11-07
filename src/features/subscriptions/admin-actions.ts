"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

export interface UpdateSubscriptionInput {
  shopId: string;
  planId: "free" | "pro" | string;
  status?: "active" | "cancelled" | "expired" | "past_due";
  billingPeriod?: "monthly" | "yearly";
  expiresAt: string | null;
  gracePeriodEndsAt: string | null;
  customStorageQuotaMb: number | null;
  adminNotes?: string | null;
}

export async function updateShopSubscriptionAction(input: UpdateSubscriptionInput): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized: Sign in required" };
    }

    // Role verification
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Forbidden: Super Admin access required" };
    }

    const {
      shopId,
      planId,
      status = "active",
      billingPeriod = "monthly",
      expiresAt,
      gracePeriodEndsAt,
      customStorageQuotaMb,
      adminNotes,
    } = input;

    if (!shopId) {
      return { error: "Invalid store identifier" };
    }

    const now = new Date().toISOString();

    // 1. Check if subscription row already exists for this shop
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("shop_id", shopId)
      .single();

    if (existingSub) {
      const { error: updateSubErr } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          status,
          billing_period: billingPeriod,
          expires_at: expiresAt || null,
          grace_period_ends_at: gracePeriodEndsAt || null,
          assigned_by: user.id,
          admin_notes: adminNotes || null,
          updated_at: now,
        })
        .eq("id", existingSub.id);

      if (updateSubErr) {
        return { error: updateSubErr.message || "Failed to update subscription" };
      }
    } else {
      const { error: insertSubErr } = await supabase
        .from("subscriptions")
        .insert({
          id: randomUUID(),
          shop_id: shopId,
          plan_id: planId,
          status,
          billing_period: billingPeriod,
          started_at: now,
          expires_at: expiresAt || null,
          grace_period_ends_at: gracePeriodEndsAt || null,
          assigned_by: user.id,
          admin_notes: adminNotes || null,
          created_at: now,
          updated_at: now,
        });

      if (insertSubErr) {
        return { error: insertSubErr.message || "Failed to create subscription" };
      }
    }

    // 2. Update shop's custom_storage_quota_mb
    const quotaVal =
      customStorageQuotaMb && Number(customStorageQuotaMb) > 0
        ? Number(customStorageQuotaMb)
        : null;

    const { error: updateShopErr } = await supabase
      .from("shops")
      .update({
        custom_storage_quota_mb: quotaVal,
        updated_at: now,
      })
      .eq("id", shopId);

    if (updateShopErr) {
      return { error: updateShopErr.message || "Failed to update custom storage quota" };
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/subscription");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred while saving plan details" };
  }
}
