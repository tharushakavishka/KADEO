"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizePhoneNumber, isValidPhoneNumber, buildWhatsAppUrl } from "@/lib/phone";
import { z } from "zod";

const trackSchema = z.object({
  shopSlug: z.string().min(1, "Shop slug is required.").max(100),
  orderCode: z.string().min(4, "Please enter your order code (e.g. KAD-2026-123456).").max(50),
  phone: z
    .string()
    .min(8, "Please enter the phone number used when placing the order.")
    .max(30)
    .refine((val) => isValidPhoneNumber(val), "Please enter a valid phone number."),
});

export interface TrackedOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TrackedOrderResult {
  orderCode: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  deliveryFee: number;
  deliveryZone?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  total: number;
  currency: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  items: TrackedOrderItem[];
  whatsappInquiryUrl: string;
  shopName: string;
}

// In-memory sliding window rate limiter: maximum 8 tracking attempts per 60 seconds per key
const trackingAttemptLog = new Map<string, { count: number; resetAt: number }>();

function checkTrackingRateLimit(rateKey: string): boolean {
  const now = Date.now();
  const entry = trackingAttemptLog.get(rateKey);
  if (!entry || now > entry.resetAt) {
    trackingAttemptLog.set(rateKey, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 8) {
    return false;
  }
  entry.count++;
  return true;
}

export async function trackOrderAction(rawPayload: unknown): Promise<{
  success?: boolean;
  order?: TrackedOrderResult;
  error?: string;
}> {
  const validated = trackSchema.safeParse(rawPayload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { shopSlug, orderCode, phone } = validated.data;
  const cleanCode = orderCode.trim().toUpperCase();
  const normalizedPhone = normalizePhoneNumber(phone);

  // Rate limiting key scoped by clean order code and store slug to prevent enumeration
  const rateLimitKey = `${shopSlug.trim().toLowerCase()}:${cleanCode}`;
  if (!checkTrackingRateLimit(rateLimitKey)) {
    return {
      error: "Too many tracking attempts for this order. Please wait a moment before trying again.",
    };
  }

  const supabase = await createClient();

  // Call owner-independent, RLS-preserving tracking RPC
  // This verifies exact shop slug, order code, and full normalized customer phone number in database
  const { data: rpcData, error: rpcError } = await supabase.rpc("track_customer_order", {
    p_shop_slug: shopSlug,
    p_order_code: cleanCode,
    p_normalized_phone: normalizedPhone,
  });

  if (rpcError) {
    return { error: rpcError.message };
  }

  if (!rpcData || !rpcData.success || !rpcData.order) {
    return {
      error:
        rpcData?.error ||
        "No order found matching this order code and phone number. Please verify your details.",
    };
  }

  const orderData = rpcData.order;
  const waInquiryUrl = buildWhatsAppUrl(
    orderData.whatsappNumber,
    `Hi ${orderData.shopName}! I would like to inquire about my order ${orderData.orderCode}.`
  );

  return {
    success: true,
    order: {
      orderCode: orderData.orderCode,
      status: orderData.status,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      subtotal: Number(orderData.subtotal || 0),
      deliveryFee: Number(orderData.deliveryFee || 0),
      deliveryZone: orderData.deliveryZone || null,
      courierName: orderData.courierName || null,
      trackingNumber: orderData.trackingNumber || null,
      total: Number(orderData.total || 0),
      currency: orderData.currency || "LKR",
      customerName: orderData.customerName || "Customer",
      customerPhone: normalizedPhone,
      deliveryAddress: orderData.deliveryAddress || "Provided on order",
      items: orderData.items || [],
      whatsappInquiryUrl: waInquiryUrl,
      shopName: orderData.shopName,
    },
  };
}
