import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { safeWhatsAppLink } from "@/lib/order-links";
import { createClient } from "@/lib/supabase/server";
import { OrderThermalReceipt } from "@/components/shared/OrderThermalReceipt";
import { CheckCircle2, MessageCircle, ArrowLeft, Sparkles, ShieldCheck, Search, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string; wa?: string; total?: string }>;
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = await params;
  const { code, wa, total } = await searchParams;
  const whatsappLink = safeWhatsAppLink(wa);

  const supabase = await createClient();
  let orderRecord: any = null;

  if (code) {
    const { data: result } = await supabase
      .from("orders")
      .select("*, items:order_items(*), shop:shops(name, slug, whatsapp_number)")
      .eq("order_code", code);

    orderRecord = Array.isArray(result) ? result[0] : result;
  }

  const receiptItems = orderRecord?.items?.map((it: any) => ({
    id: it.id,
    name: it.product_name_snapshot || it.product_name || "Item",
    quantity: Number(it.quantity || 1),
    unitPrice: Number(it.unit_price || 0),
    lineTotal: Number(it.line_total || (it.unit_price || 0) * (it.quantity || 1)),
  })) || [];

  const sellerPhone = orderRecord?.shop?.whatsapp_number || "";

  return (
    <div className="min-h-screen bg-[#faf8f2] py-10 px-4 selection:bg-[#192d2a] selection:text-white">
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#e0f2eb] text-[#017d6e] flex items-center justify-center mx-auto mb-4 shadow-2xs border border-[#c4e5d8]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0ebe1] text-[#192d2a] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>Order Reference</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#192d2a] mb-2">
            {code ? "Order Placed Successfully!" : "Check Your Order"}
          </h1>
          <p className="text-xs text-[#6a7872] mb-5">
            Your order has been recorded. Below is your official digital receipt slip with purchased items. You can share it as an image, message the seller on WhatsApp, or print it.
          </p>

          {code && (
            <div className="flex flex-col sm:flex-row gap-2.5 mb-2">
              <Link
                href={`/shop/${slug}/track?code=${encodeURIComponent(code)}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#faf8f2] hover:bg-[#f0ebe1] border border-[#e8e4dc] text-[#192d2a] font-bold text-xs transition shadow-2xs"
              >
                <Search className="w-4 h-4 text-[#017d6e]" />
                <span>Track Live Order Status</span>
              </Link>

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#017d6e] hover:bg-[#029584] text-white font-extrabold text-xs transition shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message Seller</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Digital Thermal Order Slip (Matches Attached Reference Image) */}
        {orderRecord ? (
          <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0ebe1]">
              <Receipt className="w-4 h-4 text-[#017d6e]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#192d2a]">
                Official Digital Order Slip
              </span>
            </div>
            <OrderThermalReceipt
              orderCode={orderRecord.order_code}
              createdAt={orderRecord.created_at}
              shopName={orderRecord.shop?.name || slug}
              shopSlug={slug}
              customerName={orderRecord.customer_name_snapshot || orderRecord.customer_name || "Customer"}
              customerPhone={orderRecord.customer_phone_snapshot || orderRecord.customer_phone || ""}
              customerAddress={orderRecord.delivery_address_snapshot || orderRecord.customer_address || ""}
              orderNote={orderRecord.order_note || ""}
              items={receiptItems}
              subtotal={Number(orderRecord.subtotal || 0)}
              deliveryFee={Number(orderRecord.delivery_fee || 0)}
              deliveryZone={orderRecord.delivery_zone}
              total={Number(orderRecord.total || total || 0)}
              courierName={orderRecord.courier_name}
              trackingNumber={orderRecord.tracking_number}
              operatorName={orderRecord.shop?.name || "Kadeo Store"}
              sellerPhone={sellerPhone}
              recipientType="seller"
              showActions={true}
            />
          </div>
        ) : code ? (
          <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
            <OrderThermalReceipt
              orderCode={code}
              shopName={slug.toUpperCase()}
              shopSlug={slug}
              customerName="Customer"
              items={[]}
              subtotal={Number(total || 0)}
              total={Number(total || 0)}
              sellerPhone={sellerPhone}
              recipientType="seller"
              showActions={true}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6c7771]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#017d6e]" />
            <span>Cash on delivery. No online payment collected.</span>
          </div>

          <Link
            href={`/shop/${slug}`}
            className="inline-flex items-center gap-1.5 font-bold text-[#192d2a] hover:text-[#017d6e] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
