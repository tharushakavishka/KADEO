"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Check, Loader2, ExternalLink } from "lucide-react";
import { updateOrderStatusAction } from "@/features/orders/seller-actions";
import { formatCurrency } from "@/lib/utils";
import { formatPhoneDisplay, buildWhatsAppUrl } from "@/lib/phone";
import { getCourierTrackingUrl } from "@/lib/couriers";
import s from "./DashboardShell.module.css";

export interface OrderItemRow {
  id: string;
  order_code: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  total: number;
  status: string;
  created_at: string;
  order_note?: string | null;
  courier_name?: string | null;
  tracking_number?: string | null;
}

interface RecentOrdersTableProps {
  orders: OrderItemRow[];
  shopName: string;
}

export function RecentOrdersTable({ orders, shopName }: RecentOrdersTableProps) {
  const [orderList, setOrderList] = useState<OrderItemRow[]>(orders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleQuickStatus = async (orderId: string, nextStatus: string) => {
    setLoadingId(orderId);
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        setOrderList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={s.ordersTableWrap}>
      {orderList && orderList.length > 0 ? (
        <table className={s.ordersTable}>
          <thead>
            <tr>
              <th>Order Code</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => {
              const statusClass =
                order.status === "pending"
                  ? s.badgePending
                  : order.status === "confirmed"
                  ? s.badgeConfirmed
                  : order.status === "shipped"
                  ? s.badgeShipped
                  : order.status === "completed"
                  ? s.badgeCompleted
                  : s.badgeCancelled;

              const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              const isBankTransfer =
                order.order_note && order.order_note.toLowerCase().includes("bank");

              const customerPhone = order.customer_phone_snapshot || "";
              const customerName = order.customer_name_snapshot || "Buyer";
              const waMessage = `Hello ${customerName}! Thank you for your order #${order.order_code} on ${shopName}. We are currently processing your order.`;
              const waUrl = buildWhatsAppUrl(customerPhone, waMessage);

              const courierUrl = getCourierTrackingUrl(order.courier_name, order.tracking_number);
              const isLoading = loadingId === order.id;

              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>
                    #{order.order_code || order.id.slice(0, 8)}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {customerName}
                      </span>
                      {customerPhone && (
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {formatPhoneDisplay(customerPhone)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: "#64748b" }}>{orderDate}</td>
                  <td>
                    <span
                      className={
                        isBankTransfer
                          ? s.badgePaymentBank
                          : s.badgePaymentCod
                      }
                    >
                      {isBankTransfer ? "Bank Transfer" : "Cash on Delivery"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#047857" }}>
                    {formatCurrency(Number(order.total) || 0)}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className={`${s.badgeStatus} ${statusClass}`}>
                        {order.status}
                      </span>
                      {order.courier_name && (
                        <div style={{ fontSize: "10.5px", color: "#6d28d9", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <span>{order.courier_name}</span>
                          {courierUrl && (
                            <a
                              href={courierUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#6d28d9", textDecoration: "underline" }}
                              title="Open live courier tracking"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {/* 1-Click Status Quick Confirm */}
                      {order.status === "pending" && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickStatus(order.id, "confirmed")}
                          className={s.btnConfirmQuick}
                          title="Confirm order with 1-click"
                        >
                          {isLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Check size={12} /> Confirm
                            </>
                          )}
                        </button>
                      )}

                      {/* WhatsApp 1-Click direct chat */}
                      {customerPhone ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.whatsappActionBtn}
                          title="Chat directly with customer on WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      ) : null}

                      {/* Full Details link */}
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#047857",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Details →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
          <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
            No orders received yet
          </p>
          <p style={{ margin: 0, fontSize: "12.5px" }}>
            When customers order products through WhatsApp, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
