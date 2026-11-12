"use client";

import { useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber, buildWhatsAppUrl } from "@/lib/phone";
import {
  Printer,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Download,
  Loader2,
  FileImage,
} from "lucide-react";

export interface OrderReceiptItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  lineTotal: number;
}

export interface OrderThermalReceiptProps {
  orderCode: string;
  createdAt?: string | Date;
  shopName: string;
  shopSlug?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  orderNote?: string;
  orderType?: string;
  items: OrderReceiptItem[];
  subtotal: number;
  deliveryFee?: number;
  deliveryZone?: string;
  total: number;
  currency?: string;
  status?: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  operatorName?: string;
  sellerPhone?: string;
  showActions?: boolean;
  recipientType?: "customer" | "seller"; // who the WhatsApp button targets
}

export function OrderThermalReceipt({
  orderCode,
  createdAt,
  shopName,
  shopSlug,
  customerName,
  customerPhone = "",
  customerAddress = "",
  orderNote = "",
  orderType = "Cash on Delivery",
  items = [],
  subtotal,
  deliveryFee = 0,
  deliveryZone,
  total,
  currency = "LKR",
  status,
  courierName,
  trackingNumber,
  operatorName,
  sellerPhone = "",
  showActions = true,
  recipientType = "customer",
}: OrderThermalReceiptProps) {
  const receiptCardRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formatted date matching receipt format: "Wed, May 27, 2020 • 9:27:53 AM"
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const formattedDate =
    dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " • " +
    dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  // Online slip URL that the customer or seller can view anywhere
  const slipUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop/${shopSlug || "store"}/order-success?code=${orderCode}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/shop/${shopSlug || "store"}/order-success?code=${orderCode}`;

  // Itemized text breakdown for WhatsApp message
  const itemsText =
    items.length > 0
      ? items
          .map((it) => {
            const lineTot = it.lineTotal || (it.unitPrice || 0) * it.quantity;
            return `• ${it.name} × ${it.quantity} = ${formatCurrency(lineTot)}`;
          })
          .join("\n")
      : `• Standard Order = ${formatCurrency(subtotal)}`;

  // WhatsApp sharing message formatted cleanly with slip link and items
  const waLines = [
    `🧾 *Official Order Receipt - ${shopName || "Kadeo Store"}*`,
    `----------------------------------------`,
    `*Order Token:* ${orderCode}`,
    `*Date:* ${formattedDate}`,
    `*Customer:* ${customerName}`,
    customerPhone ? `*Phone:* ${customerPhone}` : "",
    customerAddress ? `*Delivery Address:* ${customerAddress}` : "",
    deliveryFee > 0
      ? `*Delivery Fee:* ${formatCurrency(deliveryFee)} (${deliveryZone || "Standard"})`
      : "",
    courierName ? `*Courier Partner:* ${courierName}` : "",
    trackingNumber ? `*Waybill Tracking:* ${trackingNumber}` : "",
    orderNote ? `*Customer Note:* ${orderNote}` : "",
    ``,
    `📦 *Items Purchased / මිලදී ගත් භාණ්ඩ:*`,
    itemsText,
    ``,
    `*Subtotal:* ${formatCurrency(subtotal)}`,
    deliveryFee > 0 ? `*Delivery:* ${formatCurrency(deliveryFee)}` : "",
    `*Total Payable:* ${formatCurrency(total)}`,
    ``,
    `🔗 *View / Download Digital Slip:*`,
    slipUrl,
    `----------------------------------------`,
    recipientType === "seller"
      ? `Hello! Here is the order confirmation with purchased items.`
      : `Thank you for your order with ${shopName || "us"}!`,
  ].filter(Boolean);

  const targetPhone = recipientType === "customer" ? customerPhone : sellerPhone;
  const waShareUrl = buildWhatsAppUrl(normalizePhoneNumber(targetPhone), waLines.join("\n"));

  function showToast(msg: string, durationMs = 4000) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), durationMs);
  }

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(slipUrl);
        setCopiedLink(true);
        showToast("Order slip link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      showToast("Could not copy link.");
    }
  }

  // Generate Image Blob from Receipt DOM element with HTML5 canvas fallback
  async function generateReceiptBlob(): Promise<Blob | null> {
    if (typeof window === "undefined") return null;

    // 1. Try html-to-image dynamically
    try {
      const htmlToImage = await import("html-to-image");
      if (receiptCardRef.current) {
        const blob = await htmlToImage.toBlob(receiptCardRef.current, {
          quality: 1,
          pixelRatio: 2, // High resolution retina capture
          backgroundColor: "#ffffff",
          cacheBust: true,
        });
        if (blob) return blob;
      }
    } catch (err) {
      console.warn("html-to-image capture fallback triggered:", err);
    }

    // 2. Fallback: Pure HTML5 Canvas 2D Renderer
    return renderFallbackCanvasBlob();
  }

  // Resilient Canvas 2D fallback that draws the receipt matching reference image
  function renderFallbackCanvasBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        const width = 460;
        const scale = 2;
        // Estimate height based on items
        const baseHeight = 440;
        const itemsHeight = Math.max(1, items.length) * 36;
        const totalHeight = baseHeight + itemsHeight;

        canvas.width = width * scale;
        canvas.height = totalHeight * scale;
        ctx.scale(scale, scale);

        // White paper background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, totalHeight);

        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";

        // Store Header
        ctx.font = "bold 18px 'Courier New', monospace";
        ctx.fillText((shopName || "KADEO").toUpperCase(), width / 2, 34);

        ctx.font = "11px 'Courier New', monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText(formattedDate, width / 2, 54);

        // Dashed Token Box
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(30, 72, width - 60, 48);
        ctx.setLineDash([]);

        // Token badge title
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(width / 2 - 32, 64, 64, 16);
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.fillText("Token", width / 2, 76);

        // Token Code
        ctx.fillStyle = "#090d16";
        ctx.font = "bold 17px 'Courier New', monospace";
        ctx.fillText(orderCode, width / 2, 102);

        // Metadata rows
        ctx.textAlign = "left";
        let y = 142;
        const drawRow = (label: string, val: string, isBold = false) => {
          ctx.fillStyle = "#64748b";
          ctx.font = "11px 'Courier New', monospace";
          ctx.fillText(label, 30, y);

          ctx.fillStyle = isBold ? "#0f172a" : "#1e293b";
          ctx.font = isBold ? "bold 11px 'Courier New', monospace" : "11px 'Courier New', monospace";
          ctx.textAlign = "right";
          ctx.fillText(val, width - 30, y);
          ctx.textAlign = "left";
          y += 20;
        };

        const drawDivider = () => {
          ctx.strokeStyle = "#cbd5e1";
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(30, y - 6);
          ctx.lineTo(width - 30, y - 6);
          ctx.stroke();
          ctx.setLineDash([]);
          y += 10;
        };

        drawRow("Token Type", orderType);
        drawDivider();
        drawRow("Customer Name", customerName, true);
        if (customerPhone) drawRow("Phone", customerPhone);
        if (customerAddress) drawRow("Address", customerAddress.slice(0, 32));
        if (courierName) drawRow("Courier", courierName, true);
        if (trackingNumber) drawRow("Waybill #", trackingNumber);

        drawDivider();
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.fillText("ITEMS PURCHASED", 30, y);
        y += 18;

        if (items.length > 0) {
          for (const it of items) {
            const lineTot = it.lineTotal || (it.unitPrice || 0) * it.quantity;
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 11px 'Courier New', monospace";
            ctx.fillText(`${it.name.slice(0, 26)} × ${it.quantity}`, 30, y);

            ctx.textAlign = "right";
            ctx.fillText(formatCurrency(lineTot), width - 30, y);
            ctx.textAlign = "left";
            y += 18;
          }
        } else {
          drawRow("Standard Order", formatCurrency(subtotal));
        }

        drawDivider();
        drawRow("Subtotal", formatCurrency(subtotal));
        drawRow("Delivery Fee", deliveryFee > 0 ? formatCurrency(deliveryFee) : "FREE");

        y += 4;
        ctx.fillStyle = "#090d16";
        ctx.font = "bold 14px 'Courier New', monospace";
        ctx.fillText("Total Payable", 30, y);
        ctx.textAlign = "right";
        ctx.fillText(formatCurrency(total), width - 30, y);
        ctx.textAlign = "left";
        y += 22;

        drawDivider();
        drawRow("Operator", operatorName || shopName || "Kadeo Store");

        // Bottom KADEO Brand
        y += 18;
        ctx.textAlign = "center";
        ctx.font = "bold italic 22px sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("KADEO", width / 2, y);

        // Torn Zig-zag teeth at the bottom
        const teeth = 24;
        const toothWidth = width / teeth;
        const toothHeight = 12;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, totalHeight - toothHeight);
        for (let i = 0; i < teeth; i++) {
          ctx.lineTo((i + 0.5) * toothWidth, totalHeight);
          ctx.lineTo((i + 1) * toothWidth, totalHeight - toothHeight);
        }
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        canvas.toBlob((blob) => resolve(blob), "image/png");
      } catch {
        resolve(null);
      }
    });
  }

  // Share Slip as Image (Web Share API with file -> Direct WhatsApp share on mobile, or clipboard copy + download on desktop)
  
  // Dedicated 1-Click Copy Receipt Image directly to system clipboard (for WhatsApp Web / desktop paste)
  async function handleCopyImageToClipboard() {
    if (isProcessingImage) return;
    setIsProcessingImage(true);
    try {
      const blob = await generateReceiptBlob();
      if (!blob) throw new Error("Could not generate image.");

      if (typeof navigator !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        showToast("Slip image copied to clipboard! Paste directly (Ctrl+V) into WhatsApp Web.");
        setTimeout(() => setCopiedImage(false), 3000);
        return;
      }
      throw new Error("ClipboardItem not supported in this browser.");
    } catch (err: any) {
      console.warn("Direct clipboard copy failed, downloading fallback:", err);
      // Fallback: download the image so the user still has it
      await handleDownloadImage();
      showToast("Direct clipboard write not supported; image downloaded instead!");
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleShareImage() {
    if (isProcessingImage) return;
    setIsProcessingImage(true);
    try {
      const blob = await generateReceiptBlob();
      if (!blob) throw new Error("Could not generate image.");

      const fileName = `order-receipt-${orderCode}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // 1. Try native Web Share API with image file (Supported on Mobile WhatsApp / Safari / Android / Windows Share)
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Order Receipt - ${orderCode}`,
          text: `Official order receipt for ${orderCode} from ${shopName}.`,
          files: [file],
        });
        showToast("Receipt image shared successfully!");
        return;
      }

      // 2. Desktop fallback: Copy image directly to Clipboard so user can Ctrl+V into WhatsApp Web
      let copiedToClipboard = false;
      if (typeof navigator !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        try {
          const item = new (window as any).ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          copiedToClipboard = true;
        } catch (clipErr) {
          console.warn("ClipboardItem write failed:", clipErr);
        }
      }

      // 3. Download the PNG image file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (copiedToClipboard) {
        showToast("Image copied to clipboard & downloaded! Paste directly (Ctrl+V) into WhatsApp.");
      } else {
        showToast("Receipt image downloaded! You can attach or send it on WhatsApp.");
      }
    } catch (err: any) {
      console.error("Error sharing receipt image:", err);
      showToast("Could not share image directly. Please use Download Image.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  // Direct Download Image (PNG) button
  async function handleDownloadImage() {
    if (isProcessingImage) return;
    setIsProcessingImage(true);
    try {
      const blob = await generateReceiptBlob();
      if (!blob) throw new Error("Could not generate image.");

      const fileName = `order-receipt-${orderCode}.png`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast("Receipt image downloaded successfully!");
    } catch (err) {
      console.error("Error downloading receipt image:", err);
      showToast("Failed to download image.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="w-full mb-3 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center shadow-lg transition animate-in fade-in slide-in-from-top-1">
          {toastMessage}
        </div>
      )}

      {/* Captured Thermal Receipt Paper Container (Rendered to PNG Image / Print) */}
      <div
        ref={receiptCardRef}
        id="thermal-slip-print"
        className="w-full bg-white text-slate-900 rounded-t-xl shadow-xl border border-slate-200/90 pt-6 px-6 pb-0 relative select-text"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {/* Store Header */}
        <div className="text-center space-y-1 mb-3">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-lg font-black tracking-wider uppercase text-slate-950 font-sans">
              {shopName || "KADEO"}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500">{formattedDate}</p>
        </div>

        {/* Dashed Border Token Box (Exact visual match to reference image) */}
        <div className="relative my-4">
          <div className="border border-dashed border-slate-400/90 rounded-lg py-3 px-3 text-center bg-slate-50/50">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Token
            </span>
            <span className="font-mono text-base sm:text-lg font-black tracking-wider text-slate-950 select-all block">
              {orderCode}
            </span>
          </div>
        </div>

        {/* Receipt Key-Value Rows */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Token Type</span>
            <span className="font-bold text-slate-900">{orderType}</span>
          </div>

          <div className="border-b border-dashed border-slate-300 my-2" />

          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 shrink-0">Customer Name</span>
            <span className="font-bold text-slate-900 text-right">{customerName}</span>
          </div>

          {customerPhone && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phone</span>
              <span className="font-semibold text-slate-800">{customerPhone}</span>
            </div>
          )}

          {customerAddress && (
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 shrink-0">Address</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] leading-tight text-[11px]">
                {customerAddress}
              </span>
            </div>
          )}

          {/* Courier & Tracking Waybill when available */}
          {(courierName || trackingNumber) && (
            <>
              <div className="border-b border-dashed border-slate-300 my-2" />
              {courierName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Courier</span>
                  <span className="font-bold text-slate-900">{courierName}</span>
                </div>
              )}
              {trackingNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Waybill #</span>
                  <span className="font-mono font-bold text-slate-900 select-all">
                    {trackingNumber}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Itemized Order Breakdown (Items Purchased) */}
          <div className="border-b border-dashed border-slate-300 my-2" />
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Items Purchased</span>
            <span>Line Total</span>
          </div>

          {items && items.length > 0 ? (
            <div className="space-y-1.5 py-0.5">
              {items.map((it, idx) => {
                const lineTot = it.lineTotal || (it.unitPrice || 0) * it.quantity;
                const unitPrice =
                  it.unitPrice || (it.quantity > 0 ? lineTot / it.quantity : lineTot);
                return (
                  <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="font-bold text-slate-900 leading-snug break-words">
                        {it.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {it.quantity} × {formatCurrency(unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0 text-right">
                      {formatCurrency(lineTot)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-slate-700">Standard Order</span>
              <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="border-b border-dashed border-slate-300 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Amount</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Delivery Fee</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {deliveryFee > 0
                ? `${formatCurrency(deliveryFee)}${deliveryZone ? ` (${deliveryZone})` : ""}`
                : "FREE"}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 font-bold text-sm text-slate-950">
            <span>Total</span>
            <span className="tabular-nums font-black text-base">{formatCurrency(total)}</span>
          </div>

          {/* Operator Footer */}
          <div className="border-b border-dashed border-slate-300 my-2.5" />

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Operator</span>
            <span className="font-semibold text-slate-800">
              {operatorName || shopName || "Ade"}
            </span>
          </div>

          {/* Bottom Brand Mark (Like "ACME" in reference image) */}
          <div className="pt-3 pb-2 text-center">
            <span className="text-2xl font-black italic tracking-tighter uppercase font-sans text-slate-950">
              KADEO
            </span>
          </div>
        </div>

        {/* Realistic Torn Zig-zag Paper Edge (Exact visual match to attached reference image) */}
        <div className="w-full overflow-hidden leading-none mt-2 -mb-0.5 relative z-10 -mx-6 px-0" style={{ width: "calc(100% + 48px)", marginLeft: "-24px" }}>
          <svg
            className="w-full text-white fill-current filter drop-shadow-sm"
            height="14"
            viewBox="0 0 400 14"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,0 L10,14 L20,0 L30,14 L40,0 L50,14 L60,0 L70,14 L80,0 L90,14 L100,0 L110,14 L120,0 L130,14 L140,0 L150,14 L160,0 L170,14 L180,0 L190,14 L200,0 L210,14 L220,0 L230,14 L240,0 L250,14 L260,0 L270,14 L280,0 L290,14 L300,0 L310,14 L320,0 L330,14 L340,0 L350,14 L360,0 L370,14 L380,0 L390,14 L400,0 Z" />
          </svg>
        </div>
      </div>

      {/* Actions (Image Share, Image Download, WhatsApp Text, Print, Copy Link) */}
      {showActions && (
        <div className="w-full mt-4 space-y-2.5 no-print">
          {/* Primary Action 1: Share Slip as Image (Direct Image Share to WhatsApp / Mobile Share / Clipboard) */}
          {/* Dedicated Action: Copy Image to Clipboard */}
          <button
            type="button"
            onClick={handleCopyImageToClipboard}
            disabled={isProcessingImage}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 font-bold text-xs transition shadow-xs cursor-pointer disabled:opacity-60"
          >
            {copiedImage ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Image Copied to Clipboard! (Paste in WhatsApp)</span>
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4 text-indigo-600" />
                <span>Copy Image to Clipboard</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareImage}
            disabled={isProcessingImage}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-60 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
          >
            {isProcessingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span>
              {isProcessingImage ? "Generating Image..." : "Share Slip as Image (WhatsApp)"}
            </span>
          </button>

          {/* Secondary Action 2: Download Slip as Image (PNG) */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isProcessingImage}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Image (PNG)</span>
            </button>

            {/* WhatsApp Text & Link Share Button */}
            {waShareUrl && (
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#25D366]/40 bg-[#eefaf2] hover:bg-[#e1f7e8] text-[#128C7E] text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>
                  {recipientType === "customer" ? "Send via WhatsApp" : "Message Seller"}
                </span>
              </a>
            )}
          </div>

          {/* Print Slip and Copy Link Buttons */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Print CSS to isolate thermal slip cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-slip-print, #thermal-slip-print * {
            visibility: visible !important;
          }
          #thermal-slip-print {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 20px !important;
            width: 80mm !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px dashed #64748b !important;
            padding: 12px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
