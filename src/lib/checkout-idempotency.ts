/**
 * Checkout Idempotency Utilities for Storefront Cart and POS Sales Desk.
 *
 * Generates bounded idempotency keys and stable payload digests to prevent
 * duplicate order placement on transient network retries, while ensuring keys
 * rotate when order items or customer inputs change.
 */

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutPayloadBase = {
  shopSlug?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string | null;
  orderNote?: string | null;
  items: CheckoutItem[];
};

/**
 * Computes a deterministic string representation of order intent.
 * Items are sorted by productId so variations in array order produce the same digest.
 */
export function computeCheckoutPayloadDigest(payload: CheckoutPayloadBase): string {
  const sortedItems = [...(payload.items || [])]
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((item) => `${item.productId}:${item.quantity}`)
    .join(",");

  return [
    (payload.shopSlug || "").trim(),
    (payload.customerName || "").trim(),
    (payload.customerPhone || "").trim(),
    (payload.customerAddress || "").trim(),
    (payload.customerEmail || "").trim(),
    (payload.orderNote || "").trim(),
    sortedItems,
  ].join("|");
}

/**
 * Generates a collision-resistant idempotency key within the 100-character backend constraint.
 * Standard format: "kadeo_<prefix>_<uuid>" (~47 characters total).
 */
export function generateCheckoutIdempotencyKey(prefix: "cart" | "pos" = "cart"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `kadeo_${prefix}_${crypto.randomUUID()}`;
  }
  const randomSuffix = Math.random().toString(36).substring(2, 12);
  return `kadeo_${prefix}_${Date.now()}_${randomSuffix}`;
}
