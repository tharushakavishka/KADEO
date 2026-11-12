"use server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber, isValidPhoneNumber, buildWhatsAppUrl } from "@/lib/phone";
import { z } from "zod";

const checkoutSchema = z.object({
  shopSlug: z.string().trim().min(1).max(100),
  customerName: z.string().trim().min(2, "Please enter your name.").max(120),
  customerPhone: z
    .string().max(30)
    .refine(
      (val) => isValidPhoneNumber(val),
      "Please enter a valid phone number (e.g. 0771234567 or +94771234567)."
    )
    .transform((val) => normalizePhoneNumber(val)),
  customerAddress: z.string().trim().min(5, "Please enter your delivery address.").max(1000),
  customerEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  orderNote: z.string().trim().max(1000).optional(),
  deliveryFee: z.number().min(0).max(100000).optional(),
  deliveryZone: z.string().trim().max(100).optional(),
  idempotencyKey: z.string().trim().max(100).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(9999),
      })
    )
    .min(1, "Your cart is empty.").max(100)
    .refine(items => new Set(items.map(item => item.productId)).size === items.length, "Please combine repeated products in your cart."),
});

export async function submitOrderAction(rawPayload: unknown) {
  const validated = checkoutSchema.safeParse(rawPayload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const {
    shopSlug,
    customerName,
    customerPhone,
    customerAddress,
    customerEmail,
    orderNote,
    deliveryFee,
    deliveryZone,
    idempotencyKey,
    items,
  } = validated.data;

  const supabase = await createClient();

  // Verify store existence and visibility before placing order
  const { data: shopRecord } = await supabase
    .from("shops")
    .select("id, status, settings:shop_settings(store_visibility)")
    .eq("slug", shopSlug)
    .single();

  if (!shopRecord || shopRecord.status !== "active") {
    return { error: "Store not found or currently inactive." };
  }

  const shopSettings = Array.isArray(shopRecord.settings)
    ? shopRecord.settings[0]
    : shopRecord.settings;

  if (shopSettings && shopSettings.store_visibility === false) {
    return { error: "This store is currently private and not accepting orders." };
  }

  // Call PostgreSQL atomic stored procedure
  const { data, error } = await supabase.rpc("create_checkout_order", {
    p_shop_slug: shopSlug,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_address: customerAddress,
    p_customer_email: customerEmail || null,
    p_order_note: orderNote || null,
    p_delivery_fee: deliveryFee ?? 0,
    p_delivery_zone: deliveryZone || "Standard Delivery",
    p_idempotency_key: idempotencyKey || null,
    p_items: items.map((it) => ({
      product_id: it.productId,
      quantity: it.quantity,
    })),
  }).catch((cause: unknown) => {
    const message = cause && typeof cause === "object" && "message" in cause ? String(cause.message) : "";
    return { data: null, error: { message: message.startsWith("Insufficient stock for ") || message === "Product not found" ? message : "Could not confirm this order. Check order tracking or contact the store before retrying." } };
  });

  if (error) {
    return { error: error.message };
  }

  // Resolve purchased item names and pricing for explicit inclusion in WhatsApp messages
  let orderItems: Array<{ name: string; quantity: number; unitPrice?: number; lineTotal?: number }> =
    data.items || [];

  if (orderItems.length === 0 && items && items.length > 0) {
    try {
      const query = supabase.from("products").select("id, name, price");
      const { data: dbProducts } =
        typeof (query as any)?.in === "function"
          ? await (query as any).in("id", items.map((i) => i.productId))
          : { data: [] };

      if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
        const prodMap = new Map((dbProducts as any[]).map((p: any) => [p.id, p]));
        orderItems = items.map((i) => {
          const p: any = prodMap.get(i.productId);
          const name = p?.name || "Product";
          const unitPrice = Number(p?.price || 0);
          return {
            name,
            quantity: i.quantity,
            unitPrice,
            lineTotal: unitPrice * i.quantity,
          };
        });
      }
    } catch {
      // Fallback if query or in filter is not supported by custom client mock
    }
  }

  const itemsListFormatted =
    orderItems.length > 0
      ? [
          `📦 *Items Purchased / මිලදී ගත් භාණ්ඩ:*`,
          ...orderItems.map((it) => {
            const totalStr = it.lineTotal ? ` = ${formatCurrency(it.lineTotal)}` : "";
            const unitStr = it.unitPrice ? ` (${formatCurrency(it.unitPrice)} each)` : "";
            return `• ${it.name} × ${it.quantity}${unitStr}${totalStr}`;
          }),
          ``,
        ]
      : [];

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  // Format WhatsApp Message to store owner (Seller)
  const whatsappNumber = normalizePhoneNumber(data.whatsapp_number);
  const orderCode = data.order_code;
  const totalFormatted = formatCurrency(Number(data.total));

  const messageLines = [
    `Hello! A new order has been placed through your Kadeo store.`,
    ``,
    `*Order ID / Token:* ${orderCode}`,
    `*Customer:* ${customerName}`,
    `*Phone:* ${customerPhone}`,
    `*Delivery Address:* ${customerAddress}`,
    Number(data.delivery_fee) > 0
      ? `*Delivery Fee:* ${formatCurrency(Number(data.delivery_fee))} (${data.delivery_zone || "Standard"})`
      : ``,
    orderNote ? `*Customer Note:* ${orderNote}` : ``,
    ``,
    ...itemsListFormatted,
    `*Total Payable:* ${totalFormatted}`,
    ``,
    `🔗 *View / Verify Official Digital Slip:*`,
    `${siteUrl}/shop/${shopSlug}/order-success?code=${orderCode}`,
    ``,
    `Please check your Kadeo dashboard for full order details and fulfillment.`,
  ].filter((line) => line !== undefined && line !== null);

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, messageLines.join("\n"));

  // Format WhatsApp Message to Customer with digital receipt slip link and full item list
  const customerWaLines = [
    `🧾 *Official Order Receipt - ${data.shop_name}*`,
    `----------------------------------------`,
    `*Order Token:* ${orderCode}`,
    `*Customer:* ${customerName}`,
    `*Delivery Address:* ${customerAddress}`,
    Number(data.delivery_fee) > 0
      ? `*Delivery Fee:* ${formatCurrency(Number(data.delivery_fee))} (${data.delivery_zone || "Standard"})`
      : ``,
    ``,
    ...itemsListFormatted,
    `*Total Amount:* ${totalFormatted}`,
    ``,
    `🔗 *View / Download Your Official Digital Slip:*`,
    `${siteUrl}/shop/${shopSlug}/order-success?code=${orderCode}`,
    `----------------------------------------`,
    `Thank you for shopping with ${data.shop_name}!`,
  ].filter((line) => line !== undefined && line !== null);

  const customerWhatsAppUrl = buildWhatsAppUrl(customerPhone, customerWaLines.join("\n"));

  return {
    success: true,
    orderId: data.order_id,
    orderCode: data.order_code,
    whatsappUrl,
    customerWhatsAppUrl,
    total: data.total,
    subtotal: data.subtotal,
    deliveryFee: data.delivery_fee ?? 0,
    deliveryZone: data.delivery_zone ?? "Standard Delivery",
    shopName: data.shop_name,
    shopSlug,
    customerName,
    customerPhone,
    customerAddress,
    orderNote,
    items: orderItems,
    createdAt: data.created_at || new Date().toISOString(),
  };
}
