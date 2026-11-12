"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Check, Loader2, ExternalLink, Clock, User, Phone } from "lucide-react";
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

  if (!orderList || orderList.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
          No orders received yet
        </p>
        <p style={{ margin: 0, fontSize: "12.5px" }}>
          When customers order products through WhatsApp, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={s.ordersTableWrap}>
      {/* Mobile Card Layout (Visible on phones, hidden on desktop/tablet) */}
      <div className="md:hidden divide-y divide-slate-100">
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
            <div key={order.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition">
              {/* Order code, Status, Date */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  #{order.order_code || order.id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`${s.badgeStatus} ${statusClass}`}>
                    {order.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{orderDate}</span>
                </div>
              </div>

              {/* Customer Info & Total */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-800 truncate">
                    {customerName}
                  </div>
                  {customerPhone && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      {formatPhoneDisplay(customerPhone)}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm text-emerald-700">
                    {formatCurrency(Number(order.total) || 0)}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      isBankTransfer ? s.badgePaymentBank : s.badgePaymentCod
                    }`}
                  >
                    {isBankTransfer ? "Bank Transfer" : "COD"}
                  </span>
                </div>
              </div>

              {/* Courier info if present */}
              {order.courier_name && (
                <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-xl flex items-center justify-between gap-2">
                  <span>Courier: <strong>{order.courier_name}</strong></span>
                  {courierUrl && (
                    <a
                      href={courierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline flex items-center gap-1 font-bold"
                    >
                      Track <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {order.status === "pending" && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickStatus(order.id, "confirmed")}
                      className={s.btnConfirmQuick}
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
                  {customerPhone && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.whatsappActionBtn}
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
                >
                  Manage →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout (Visible on tablet & desktop, hidden on mobile) */}
      <table className={`${s.ordersTable} hidden md:table`}>
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
    </div>
  );
}
