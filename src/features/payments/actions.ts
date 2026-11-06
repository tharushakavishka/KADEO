"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { OrderPaymentRecord, OrderPaymentSummary, ManualPaymentMethod } from "./types";

const recordPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID."),
  amount: z.number().positive("Payment amount must be greater than zero.").max(10000000),
  paymentMethod: z.enum(["cash", "bank_transfer", "other_manual"] as const, {
    message: "Invalid payment method. Only manual in-person cash or bank transfers are supported.",
  }),
  notes: z.string().trim().max(500).optional(),
});

const voidPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment record ID."),
  reason: z.string().trim().min(3, "Please provide a reason for voiding this payment.").max(500),
});

/**
 * Truthful manual offline payment ledger recording action.
 * Records received cash or manual direct transfers without charging credit cards or inventing an online payment gateway.
 * Enforces authentication, tenant ownership, order status compatibility, and non-negative balance checks.
 */
export async function recordManualPaymentAction(rawPayload: unknown): Promise<{
  success?: boolean;
  payment?: OrderPaymentRecord;
  summary?: OrderPaymentSummary;
  error?: string;
}> {
  const validated = recordPaymentSchema.safeParse(rawPayload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { orderId, amount, paymentMethod, notes } = validated.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required to record payments." };
  }

  // 1. Ownership check: retrieve seller's active shop
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shopError || !shop) {
    return { error: "Shop not found or permission denied." };
  }

  // 2. Load order and verify tenant boundary
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, shop_id, order_code, total, status, currency")
    .eq("id", orderId)
    .eq("shop_id", shop.id)
    .single();

  if (orderError || !order) {
    return { error: "Order not found or does not belong to your shop." };
  }

  // 3. Cancellation check: disallow recording payments on cancelled orders
  if (order.status === "cancelled") {
    return { error: "Cannot record payment on a cancelled order." };
  }

  // 4. Fetch existing payments for this order to check balance
  const { data: existingPayments, error: ledgerReadError } = await supabase
    .from("order_payments")
    .select("*")
    .eq("order_id", order.id);

  if (ledgerReadError) {
    return { error: ledgerReadError.message || "Failed to read payment ledger." };
  }

  const activePayments: OrderPaymentRecord[] = (existingPayments || []).filter(
    (p: any) => p.status === "recorded"
  );

  const orderTotal = Number(order.total ?? order.total_amount ?? 0);
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingBefore = Math.max(0, orderTotal - totalPaid);

  if (amount > remainingBefore) {
    return {
      error: `Payment amount (LKR ${amount.toLocaleString()}) exceeds remaining order balance (LKR ${remainingBefore.toLocaleString()}).`,
    };
  }

  // 5. Insert truthful payment ledger record
  const paymentId = crypto.randomUUID();
  const now = new Date().toISOString();
  const newPayment: OrderPaymentRecord = {
    id: paymentId,
    order_id: order.id,
    shop_id: shop.id,
    amount,
    payment_method: paymentMethod as ManualPaymentMethod,
    status: "recorded",
    recorded_by: user.id,
    notes: notes || null,
    created_at: now,
    updated_at: now,
  };

  const { error: insertError } = await supabase.from("order_payments").insert(newPayment);

  if (insertError) {
    return { error: insertError.message || "Failed to record payment in ledger." };
  }

  const updatedPayments = [...activePayments, newPayment];
  const updatedTotalPaid = totalPaid + amount;
  const updatedRemaining = Math.max(0, orderTotal - updatedTotalPaid);

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  revalidatePath("/dashboard/pos");

  return {
    success: true,
    payment: newPayment,
    summary: {
      orderId: order.id,
      orderCode: order.order_code,
      orderTotal,
      totalPaid: updatedTotalPaid,
      remainingBalance: updatedRemaining,
      isFullyPaid: updatedTotalPaid >= orderTotal,
      currency: order.currency || "LKR",
      payments: updatedPayments,
    },
  };
}

/**
 * Retrieves the truthful payment summary for a given order.
 */
export async function getOrderPaymentSummaryAction(orderId: string): Promise<{
  success?: boolean;
  summary?: OrderPaymentSummary;
  error?: string;
}> {
  if (!orderId || typeof orderId !== "string") {
    return { error: "Order ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required." };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return { error: "Shop not found or permission denied." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, shop_id, order_code, total, status, currency")
    .eq("id", orderId)
    .eq("shop_id", shop.id)
    .single();

  if (!order) {
    return { error: "Order not found." };
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("order_payments")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (paymentsError) {
    return { error: paymentsError.message || "Failed to load payment records." };
  }

  const allPayments: OrderPaymentRecord[] = payments || [];
  const recordedPayments = allPayments.filter((p) => p.status === "recorded");
  const orderTotal = Number(order.total ?? order.total_amount ?? 0);
  const totalPaid = recordedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingBalance = Math.max(0, orderTotal - totalPaid);

  return {
    success: true,
    summary: {
      orderId: order.id,
      orderCode: order.order_code,
      orderTotal,
      totalPaid,
      remainingBalance,
      isFullyPaid: totalPaid >= orderTotal,
      currency: order.currency || "LKR",
      payments: allPayments,
    },
  };
}

/**
 * Voids an existing payment record, maintaining complete audit trail with actor, timestamp, and reason.
 */
export async function voidManualPaymentAction(rawPayload: unknown): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
}> {
  const validated = voidPaymentSchema.safeParse(rawPayload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { paymentId, reason } = validated.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required." };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return { error: "Shop not found or permission denied." };
  }

  // Lookup payment record and verify tenant boundary
  const { data: payment } = await supabase
    .from("order_payments")
    .select("*")
    .eq("id", paymentId)
    .eq("shop_id", shop.id)
    .single();

  if (!payment) {
    return { error: "Payment record not found or permission denied." };
  }

  if (payment.status === "voided") {
    return { error: "This payment has already been voided." };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("order_payments")
    .update({
      status: "voided",
      voided_at: now,
      voided_by: user.id,
      void_reason: reason,
      updated_at: now,
    })
    .eq("id", payment.id);

  if (updateError) {
    return { error: updateError.message || "Failed to void payment." };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${payment.order_id}`);
  revalidatePath("/dashboard/pos");

  return { success: true, message: "Payment record voided successfully." };
}
