import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusForm } from "@/components/dashboard/OrderStatusForm";
import { OrderThermalReceipt } from "@/components/shared/OrderThermalReceipt";
import { buildWhatsAppUrl } from "@/lib/phone";
import { ArrowLeft, MessageCircle, MapPin, User, Phone, Receipt, Truck } from "lucide-react";

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, whatsapp_number")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .single();

  if (!order) {
    notFound();
  }

  const receiptItems = (order.items || []).map((it: any) => ({
    id: it.id,
    name: it.product_name_snapshot || it.product_name || "Item",
    quantity: Number(it.quantity || 1),
    unitPrice: Number(it.unit_price || 0),
    lineTotal: Number(it.line_total || (it.unit_price || 0) * (it.quantity || 1)),
  }));

  const customerPhone = order.customer_phone_snapshot || order.customer_phone || "";
  const waChatUrl = buildWhatsAppUrl(
    customerPhone,
    `Hello ${order.customer_name_snapshot || "Customer"}! Regarding your order ${order.order_code}...`
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all orders
      </Link>

      {/* Header */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Order Details
          </span>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-900 mt-1">
            {order.order_code}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Placed on {new Date(order.created_at).toLocaleString("en-LK")}
          </p>
          {order.courier_name && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-[#7959d4] text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>
                Shipped via {order.courier_name} {order.tracking_number ? `(${order.tracking_number})` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Client Status Form with Courier fields and WhatsApp quick notify */}
        <OrderStatusForm
          orderId={order.id}
          initialStatus={order.status}
          initialCourierName={order.courier_name}
          initialTrackingNumber={order.tracking_number}
          customerPhone={customerPhone}
          customerName={order.customer_name_snapshot}
          orderCode={order.order_code}
          shopSlug={shop.slug}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Customer Information
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-zinc-700">
              <User className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="font-semibold">{order.customer_name_snapshot}</span>
            </div>

            <div className="flex items-center gap-2.5 text-zinc-700">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>{order.customer_phone_snapshot}</span>
            </div>

            <div className="flex items-start gap-2.5 text-zinc-700">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{order.delivery_address_snapshot}</span>
            </div>

            {order.order_note && (
              <div className="pt-2 border-t border-zinc-100">
                <span className="font-semibold text-zinc-500 block mb-1">Customer Note:</span>
                <p className="bg-zinc-50 p-2.5 rounded-lg text-zinc-600 italic">
                  &ldquo;{order.order_note}&rdquo;
                </p>
              </div>
            )}
          </div>

          <a
            href={waChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Customer</span>
          </a>
        </div>

        {/* Ordered Items Table */}
        <div className="md:col-span-2 bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Ordered Products
              </h2>
            </div>

            <div className="divide-y divide-zinc-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-zinc-500 mt-0.5">
                      {formatCurrency(Number(item.unit_price))} × {item.quantity} units
                    </p>
                  </div>
                  <span className="font-bold text-zinc-900 text-sm">
                    {formatCurrency(Number(item.line_total))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-zinc-50/70 border-t border-zinc-100 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">
                {formatCurrency(Number(order.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee ({order.delivery_zone || "Standard"})</span>
              <span className="font-medium text-zinc-900">
                {Number(order.delivery_fee) > 0 ? formatCurrency(Number(order.delivery_fee)) : "FREE"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total Amount</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Thermal Receipt Section */}
      <div className="pt-6 border-t border-zinc-200">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-[#7959d4]" />
          <h2 className="text-base font-bold text-zinc-900">Official Thermal Receipt Slip</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-6">
          This digital slip is automatically generated and can be printed on thermal rolls or shared with the customer on WhatsApp.
        </p>
        <OrderThermalReceipt
          orderCode={order.order_code}
          createdAt={order.created_at}
          shopName={shop.name}
          shopSlug={shop.slug}
          customerName={order.customer_name_snapshot || "Customer"}
          customerPhone={customerPhone}
          customerAddress={order.delivery_address_snapshot || ""}
          orderNote={order.order_note || ""}
          items={receiptItems}
          subtotal={Number(order.subtotal || 0)}
          deliveryFee={Number(order.delivery_fee || 0)}
          deliveryZone={order.delivery_zone}
          total={Number(order.total || 0)}
          courierName={order.courier_name}
          trackingNumber={order.tracking_number}
          operatorName={shop.name}
          recipientType="customer"
          showActions={true}
        />
      </div>
    </div>
  );
}
