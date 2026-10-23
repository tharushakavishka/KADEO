import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Order, Shop } from '../../types';
import { setActiveStorefrontSlug } from '../../hooks/useActiveStorefront';
import {
  CheckCircle,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  Phone,
  User,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  RefreshCw,
  X,
} from 'lucide-react';

/**
 * Client-side optimizer for payment slips (bank transfer receipts, mobile banking screenshots).
 * Resizes down to 1600px max dimension and compresses to fast JPEG data URL.
 */
const processSlipImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      if (file.type === 'application/pdf' || file.type === 'image/svg+xml') {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface OrderCardProps {
  order: Order;
  shop?: Shop;
  isMulti?: boolean;
}

const SingleOrderCard: React.FC<OrderCardProps> = ({ order, shop, isMulti }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showWaPreview, setShowWaPreview] = useState(false);

  // Payment Slip state
  const [paymentSlip, setPaymentSlip] = useState<string | undefined>(order.paymentSlipUrl);
  const [slipUploadedAt, setSlipUploadedAt] = useState<string | undefined>(order.paymentSlipUploadedAt);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const shopName = shop?.name || 'Artisan Boutique';
  const cleanWaNumber = StorageService.formatWhatsAppNumber(shop?.whatsappNumber);

  const itemsText = order.items
    .map(i => `• ${i.productNameSnapshot} x ${i.quantity} — ${StorageService.formatLKR(i.lineTotal)}`)
    .join('\n');

  const preparedMessage = `Hello ${shopName}! 👋
I placed an order on the Kadeo website.

*Order Reference:* ${order.orderCode}
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Delivery Address:* ${order.deliveryAddress}, ${order.customerCity}
${order.customerNote ? `*Note:* ${order.customerNote}\n` : ''}
*Ordered Items:*
${itemsText}

*Items Subtotal:* ${StorageService.formatLKR(order.subtotal)}
*Delivery Courier:* ${StorageService.formatLKR(order.deliveryFee)}
*Total Payable:* ${StorageService.formatLKR(order.total)}

My order is already recorded on your Kadeo seller dashboard.${paymentSlip ? ' (Payment slip attached on website)' : ''} Please confirm dispatch timeline when ready. Thank you!`;

  const whatsappUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(preparedMessage)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(preparedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleSlipFileUpload = async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    setIsUploadingSlip(true);
    try {
      const dataUrl = await processSlipImage(file);
      if (dataUrl) {
        StorageService.uploadOrderPaymentSlip(order.orderCode, dataUrl);
        setPaymentSlip(dataUrl);
        setSlipUploadedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to upload slip', err);
      alert('Could not process this file. Please choose a JPG or PNG receipt photo.');
    } finally {
      setIsUploadingSlip(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveSlip = () => {
    StorageService.removeOrderPaymentSlip(order.orderCode);
    setPaymentSlip(undefined);
    setSlipUploadedAt(undefined);
  };

  return (
    <div className="rounded-3xl border border-[#E4E4E7] bg-white p-6 sm:p-8 shadow-luxury-md space-y-6">
      {/* Boutique and Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F4F5] pb-5">
        <div className="flex items-center gap-3.5">
          {shop?.logo ? (
            <img
              src={shop.logo}
              alt={shopName}
              className="h-12 w-12 rounded-2xl object-cover border border-[#E4E4E7] shadow-luxury-xs"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-[#0F0F11]">
              <Store className="h-6 w-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F0F11]">{shopName}</h2>
              {shop?.contactDetails?.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#71717A]">
                  <MapPin className="h-2.5 w-2.5" />
                  {shop.contactDetails.city}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#71717A]">Order Code:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs bg-neutral-100 text-[#0F0F11] hover:bg-neutral-200 transition-colors cursor-pointer"
                title="Click to copy order code"
              >
                <span>{order.orderCode}</span>
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-neutral-400 group-hover:text-black" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Website Direct Transmission Status Badge */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Received by Seller on Website</span>
        </div>
      </div>

      {/* Live Order Timeline Progress */}
      <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-neutral-200/70">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Order Status & Fulfillment
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-neutral-900">Order Placed</span>
            <span className="text-[10px] text-neutral-400">Via Website</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <span className="font-bold text-amber-700">Seller Processing</span>
            <span className="text-[10px] text-neutral-400">Packaging Items</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-medium text-neutral-600">Courier Handover</span>
            <span className="text-[10px] text-neutral-400">Pending</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-medium text-neutral-600">Delivered</span>
            <span className="text-[10px] text-neutral-400">To Doorstep</span>
          </div>
        </div>
      </div>

      {/* Recipient & Delivery Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Recipient Info
          </span>
          <p className="font-bold text-neutral-900">{order.customerName}</p>
          <p className="text-neutral-600">{order.customerPhone}</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Delivery Destination
          </span>
          <p className="font-bold text-neutral-900">{order.customerCity}</p>
          <p className="text-neutral-600 truncate">{order.deliveryAddress}</p>
          {order.customerNote && (
            <p className="text-[11px] text-neutral-500 italic mt-0.5">Note: "{order.customerNote}"</p>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          PAYMENT SLIP / BANK TRANSFER RECEIPT UPLOAD SECTION
         ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-5 space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Payment Slip / Bank Transfer Receipt (Optional)
              </h4>
              <p className="text-[11px] text-neutral-500">
                Paid via Online Banking, Deposit, or LankaQR? Upload your receipt here for instant merchant verification.
              </p>
            </div>
          </div>

          {paymentSlip && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Slip Attached & Sent</span>
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleSlipFileUpload(e.target.files);
            }
          }}
          className="hidden"
        />

        {paymentSlip ? (
          /* Uploaded Slip Preview Card */
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div
              onClick={() => setIsSlipModalOpen(true)}
              className="relative group w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-neutral-200 shrink-0 cursor-pointer shadow-xs"
            >
              <img
                src={paymentSlip}
                alt="Payment slip"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Receipt Attached</span>
              </div>
              <p className="text-xs text-neutral-700">
                Transmitted directly to {shopName}'s seller dashboard.
              </p>
              {slipUploadedAt && (
                <p className="text-[11px] text-neutral-400">
                  Uploaded on {new Date(slipUploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(slipUploadedAt).toLocaleDateString()})
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>View Full</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveSlip}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove slip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload Dropzone Container */
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleSlipFileUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                : 'border-neutral-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/20'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-2xs">
                {isUploadingSlip ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-6 h-6 stroke-[2]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {isUploadingSlip
                    ? 'Attaching slip to your order...'
                    : 'Click to upload payment slip, or drag & drop file here'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Screenshot or photo of bank receipt (PNG, JPG, WEBP up to 5MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchased Items List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
          Purchased Items ({order.items.length})
        </h3>
        <div className="divide-y divide-[#F4F4F5] rounded-2xl border border-[#F4F4F5] bg-[#FAFAF9]/60 p-4">
          {order.items.map(item => (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {item.imageSnapshot && (
                  <img
                    src={item.imageSnapshot}
                    alt={item.productNameSnapshot}
                    referrerPolicy="no-referrer"
                    className="h-11 w-11 rounded-xl object-cover border border-[#E4E4E7] bg-white shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F0F11] truncate">{item.productNameSnapshot}</p>
                  <p className="text-[11px] text-[#71717A]">
                    Qty: {item.quantity} × {StorageService.formatLKR(item.unitPriceSnapshot)}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-[#0F0F11] tabular-nums shrink-0">
                {StorageService.formatLKR(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="rounded-2xl bg-[#F7F6F2] p-4 text-xs space-y-2 border border-[#E4E4E7]/70">
        <div className="flex justify-between text-[#71717A]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#0F0F11] tabular-nums">
            {StorageService.formatLKR(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-[#71717A]">
          <span>Courier Delivery Fee</span>
          <span className="font-semibold text-[#0F0F11] tabular-nums">
            {StorageService.formatLKR(order.deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-[#0F0F11] pt-1.5 border-t border-[#E4E4E7]">
          <span>Total Amount</span>
          <span className="tabular-nums text-emerald-700">{StorageService.formatLKR(order.total)}</span>
        </div>
      </div>

      {/* Action Buttons: Primary is Website Order Tracking, WhatsApp is strictly optional */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/track-order?code=${order.orderCode}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#0F0F11] hover:bg-neutral-800 py-3.5 px-5 text-xs font-bold text-white transition-all shadow-luxury-xs active:scale-[0.98]"
          >
            <Truck className="h-4 w-4" />
            <span>Track Order Status on Website</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100/90 py-3.5 px-5 text-xs font-bold text-emerald-800 transition-all shadow-luxury-xs active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Chat with {shopName} (Optional)</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>

        {/* Info note */}
        <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
          ✓ Your order has been transmitted directly into the merchant's dashboard. You do not need to send a WhatsApp message to finalize your order.
        </p>
      </div>

      {/* Optional WhatsApp Message Preview Collapse */}
      <div className="border-t border-[#F4F4F5] pt-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowWaPreview(!showWaPreview)}
            className="text-[11px] font-semibold text-[#71717A] hover:text-[#0F0F11] transition-colors cursor-pointer"
          >
            {showWaPreview ? '▼ Hide WhatsApp text copy' : '▶ Need to copy order message?'}
          </button>
          {showWaPreview && (
            <button
              onClick={handleCopyMessage}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {showWaPreview && (
          <pre className="mt-3 font-mono text-[11px] bg-[#F7F6F2] p-4 rounded-xl border border-[#E4E4E7] whitespace-pre-wrap text-[#0F0F11] leading-relaxed overflow-x-auto">
            {preparedMessage}
          </pre>
        )}
      </div>

      {/* Full-screen Payment Slip Lightbox Modal */}
      {isSlipModalOpen && paymentSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md anim-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsSlipModalOpen(false)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl anim-slide-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Payment Slip Receipt • Order #{order.orderCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-neutral-200 bg-neutral-900 flex items-center justify-center">
              <img
                src={paymentSlip}
                alt="Full payment slip"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-neutral-500">
                {slipUploadedAt ? `Uploaded ${new Date(slipUploadedAt).toLocaleString()}` : ''}
              </span>
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OrderSuccessPage: React.FC = () => {
  const { orderCode } = useParams<{ orderCode: string }>();

  if (!orderCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#FAFAF9]">
        <p className="text-xs text-[#71717A]">Order reference missing.</p>
      </div>
    );
  }

  // Parse comma-separated codes for multi-boutique orders
  const rawCodes = orderCode.split(',').map(c => c.trim()).filter(Boolean);
  const orders = rawCodes
    .map(code => StorageService.getOrderByCode(code))
    .filter((o): o is Order => !!o);

  useEffect(() => {
    if (orders[0]?.shopId) {
      const shop = StorageService.getShopById(orders[0].shopId);
      if (shop?.slug) {
        setActiveStorefrontSlug(shop.slug);
      }
    }
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h1 className="text-xl font-bold text-[#0F0F11]">Order Not Found</h1>
        <p className="mt-2 text-xs text-[#71717A] max-w-sm">
          No order was found matching reference "{orderCode}".
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0F0F11] px-5 py-2.5 text-xs font-semibold text-white shadow-luxury-xs"
        >
          <span>Return to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isMulti = orders.length > 1;

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Celebration Banner */}
        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-8 sm:p-10 shadow-luxury-lg text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-luxury-xs">
            <CheckCircle className="h-9 w-9 stroke-[2.25]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F0F11] tracking-tight">
              {isMulti
                ? `${orders.length} Boutique Orders Placed Successfully!`
                : 'Order Placed Directly via Website!'}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-lg mx-auto leading-relaxed">
              {isMulti
                ? 'Your orders have been transmitted directly to each boutique seller via the website platform. Sellers have received your order details in their dashboard and will dispatch your parcels.'
                : 'Your order has been directly submitted to the seller\'s store dashboard on the website. The boutique merchant has received your order and delivery details, and is now preparing your parcel.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-900 border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Automatic website order notification • Direct merchant dispatch</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map(order => {
            const shop = StorageService.getShopById(order.shopId);
            return (
              <SingleOrderCard
                key={order.id}
                order={order}
                shop={shop}
                isMulti={isMulti}
              />
            );
          })}
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E4E4E7]">
          <Link
            to="/"
            className="text-xs font-bold text-[#0F0F11] hover:underline flex items-center gap-1.5"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            <span>Back to Marketplace Home</span>
          </Link>

          <Link
            to="/search"
            className="text-xs font-semibold text-[#71717A] hover:text-[#0F0F11]"
          >
            Discover More Sri Lankan Boutiques →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
