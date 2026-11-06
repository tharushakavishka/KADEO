"use client";

import { useState } from "react";
import { updateStoreSettingsAction } from "@/features/shops/settings-actions";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

interface SettingsFormProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string;
    contact_email?: string | null;
    address?: string | null;
    description?: string | null;
  };
  settings: {
    delivery_information?: string | null;
    store_visibility?: boolean;
  };
}

export function SettingsForm({ shop, settings }: SettingsFormProps) {
  const [name, setName] = useState(shop.name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(shop.whatsapp_number || "");
  const [contactEmail, setContactEmail] = useState(shop.contact_email || "");
  const [address, setAddress] = useState(shop.address || "");
  const [description, setDescription] = useState(shop.description || "");
  const [deliveryInfo, setDeliveryInfo] = useState(settings.delivery_information || "");
  const [storeVisibility, setStoreVisibility] = useState(settings.store_visibility !== false);

  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatusMessage(null);

    const payload = {
      shopId: shop.id,
      name,
      whatsappNumber,
      contactEmail: contactEmail.trim() || "",
      address: address.trim() || "",
      description: description.trim() || "",
      deliveryInfo: deliveryInfo.trim() || "",
      storeVisibility,
    };

    try {
      const res = await updateStoreSettingsAction(payload);

      if (res.error) {
        if (res.partialSuccess) {
          setStatusMessage({
            type: "warning",
            text: res.error,
          });
        } else {
          setStatusMessage({
            type: "error",
            text: res.error,
          });
        }
      } else if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Store settings saved successfully.",
        });
        if (res.data) {
          setName(res.data.name);
          setWhatsappNumber(res.data.whatsappNumber);
          setContactEmail(res.data.contactEmail || "");
          setAddress(res.data.address || "");
          setDescription(res.data.description || "");
          setDeliveryInfo(res.data.deliveryInfo || "");
          setStoreVisibility(res.data.storeVisibility);
        }
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not confirm the save. Your inputs are preserved; refresh to check saved settings before retrying.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
      {statusMessage && (
        <div
          role={statusMessage.type === "error" ? "alert" : "status"}
          aria-live={statusMessage.type === "error" ? "assertive" : "polite"}
          className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-3 ${
            statusMessage.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : statusMessage.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {statusMessage.type === "error" && (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          )}
          {statusMessage.type === "warning" && (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          )}
          {statusMessage.type === "success" && (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="shop-name-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Shop Name *
            </label>
            <input
              id="shop-name-input"
              type="text"
              name="name"
              required
              disabled={pending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="shop-slug-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Storefront URL Slug
            </label>
            <input
              id="shop-slug-input"
              type="text"
              disabled
              value={`kadeo.lk/shop/${shop.slug}`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-mono cursor-not-allowed min-h-[44px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="shop-whatsapp-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              WhatsApp Dispatch Number * (e.g. 0771234567 or +94771234567)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                id="shop-whatsapp-input"
                type="text"
                name="whatsappNumber"
                required
                disabled={pending}
                placeholder="0771234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition min-h-[44px]"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Local Sri Lankan mobile numbers are automatically normalized to international format (+94) for WhatsApp links.
            </p>
          </div>

          <div>
            <label
              htmlFor="shop-email-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Contact Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                id="shop-email-input"
                type="email"
                name="contactEmail"
                disabled={pending}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="shop-address-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Business Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                id="shop-address-input"
                type="text"
                name="address"
                disabled={pending}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition min-h-[44px]"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="shop-description-input"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Shop Description
            </label>
            <textarea
              id="shop-description-input"
              name="description"
              rows={3}
              disabled={pending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="shop-delivery-input"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider"
              >
                Delivery Policy & Islandwide Shipping Info
              </label>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Truck className="w-3 h-3" /> Visible on public storefront
              </span>
            </div>
            <textarea
              id="shop-delivery-input"
              name="deliveryInfo"
              rows={3}
              disabled={pending}
              placeholder="e.g. Standard island-wide courier delivery within 2-4 business days. Cash on delivery available. Returns accepted within 7 days in original condition."
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960df] disabled:opacity-60 disabled:bg-zinc-50 transition"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
          <label
            htmlFor="shop-visibility-input"
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <input
              id="shop-visibility-input"
              type="checkbox"
              name="storeVisibility"
              disabled={pending}
              checked={storeVisibility}
              onChange={(e) => setStoreVisibility(e.target.checked)}
              className="rounded border-zinc-300 text-[#7959d4] focus:ring-[#7960df] w-4 h-4 cursor-pointer disabled:opacity-60"
            />
            <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              Storefront is Publicly Visible
            </span>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="min-h-[44px] flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#7959d4] hover:bg-[#6547be] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7960df]"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
