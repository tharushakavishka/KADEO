import { createClient } from "@/lib/supabase/server";
import type { Shop, Plan, Subscription } from "@/types/database";

export interface ShopQuotaDetails {
  shopId: string;
  storageUsedBytes: number;
  effectiveQuotaMb: number;
  effectiveQuotaBytes: number;
  usagePercent: number;
  isCustomQuota: boolean;
  maxProducts: number;
  subscription: {
    status: string;
    planId: string;
    planName: string;
    startedAt: string;
    expiresAt: string | null;
    gracePeriodEndsAt: string | null;
    isExpired: boolean;
    isInGracePeriod: boolean;
    canUpload: boolean;
  };
}

export const DEFAULT_STORAGE_QUOTA_MB = 250;
export const DEFAULT_MAX_PRODUCTS = 25;

/**
 * Calculates whether a subscription is active, in grace period, or fully expired.
 */
export function evaluateSubscriptionStatus(sub?: Partial<Subscription> | null): {
  isExpired: boolean;
  isInGracePeriod: boolean;
  canUpload: boolean;
} {
  if (!sub) {
    // If no explicit subscription, treat as active free tier default
    return { isExpired: false, isInGracePeriod: false, canUpload: true };
  }

  const now = new Date();

  // Explicit status check
  if (sub.status === "cancelled" || sub.status === "expired") {
    return { isExpired: true, isInGracePeriod: false, canUpload: false };
  }

  // Expiration check
  if (sub.expires_at) {
    const expiresAt = new Date(sub.expires_at);
    if (now > expiresAt) {
      // Past expiry date: check grace period
      if (sub.grace_period_ends_at) {
        const graceEnd = new Date(sub.grace_period_ends_at);
        if (now <= graceEnd) {
          return { isExpired: false, isInGracePeriod: true, canUpload: true };
        }
      }
      return { isExpired: true, isInGracePeriod: false, canUpload: false };
    }
  }

  return { isExpired: false, isInGracePeriod: false, canUpload: true };
}

/**
 * Retrieves the comprehensive storage quota, usage, and subscription health for a shop.
 */
export async function getShopStorageQuota(shopId: string): Promise<ShopQuotaDetails | null> {
  const supabase = await createClient();

  // 1. Fetch shop record
  const { data: shop } = await supabase
    .from("shops")
    .select("id, storage_used_bytes, custom_storage_quota_mb, status")
    .eq("id", shopId)
    .single();

  if (!shop) return null;

  // 2. Fetch subscription for this shop
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, shop_id, plan_id, status, billing_period, started_at, expires_at, grace_period_ends_at, assigned_by, admin_notes")
    .eq("shop_id", shopId)
    .single();

  const planId = subscription?.plan_id || "free";

  // 3. Fetch plan details
  const { data: plan } = await supabase
    .from("plans")
    .select("id, name, storage_quota_mb, max_products")
    .eq("id", planId)
    .single();

  const planQuotaMb = plan?.storage_quota_mb || DEFAULT_STORAGE_QUOTA_MB;
  const maxProducts = plan?.max_products || DEFAULT_MAX_PRODUCTS;

  // Effective quota determination: custom_storage_quota_mb override takes priority
  const isCustomQuota = typeof shop.custom_storage_quota_mb === "number" && shop.custom_storage_quota_mb > 0;
  const effectiveQuotaMb = isCustomQuota ? (shop.custom_storage_quota_mb as number) : planQuotaMb;
  const effectiveQuotaBytes = effectiveQuotaMb * 1024 * 1024;

  const storageUsedBytes = Number(shop.storage_used_bytes || 0);
  const usagePercent = effectiveQuotaBytes > 0
    ? Math.min(100, Math.round((storageUsedBytes / effectiveQuotaBytes) * 1000) / 10)
    : 100;

  const statusEval = evaluateSubscriptionStatus(subscription);

  return {
    shopId: shop.id,
    storageUsedBytes,
    effectiveQuotaMb,
    effectiveQuotaBytes,
    usagePercent,
    isCustomQuota,
    maxProducts,
    subscription: {
      status: subscription?.status || "active",
      planId,
      planName: plan?.name || (planId === "pro" ? "Pro Business" : "Starter Free"),
      startedAt: subscription?.started_at || new Date().toISOString(),
      expiresAt: subscription?.expires_at || null,
      gracePeriodEndsAt: subscription?.grace_period_ends_at || null,
      isExpired: statusEval.isExpired,
      isInGracePeriod: statusEval.isInGracePeriod,
      canUpload: statusEval.canUpload && shop.status === "active",
    },
  };
}

/**
 * Server action to fetch quota for the caller's active shop.
 */
export async function getMyStoreQuotaAction(): Promise<{ data: ShopQuotaDetails | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Unauthorized" };

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) return { data: null, error: "Shop not found" };

    const quota = await getShopStorageQuota(shop.id);
    return { data: quota, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Failed to load storage quota" };
  }
}
