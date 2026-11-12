"use client";

import { useState } from "react";
import { createShopAction } from "@/features/shops/actions";
import { generateSlug } from "@/lib/utils";
import { ArrowRight, Loader2, Store, Sparkles, Phone, MapPin, Mail } from "lucide-react";

export function NewStoreForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("minimal");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setShopName(name);
    setSlug(generateSlug(name));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("themeId", selectedTheme);
    const res = await createShopAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 p-1.5 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/KADEO.png" alt="KADEO" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Step 1 of 1 • Shop Setup
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Create your online storefront
            </h1>
          </div>
        </div>

        <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
          Set up your shop name and WhatsApp number. Customers will be able to visit your personal link and send orders directly to your WhatsApp.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={shopName}
                onChange={handleNameChange}
                placeholder="e.g. Ceylon Linen"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Storefront Slug / URL *
              </label>
              <div className="flex rounded-xl border border-zinc-200 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900">
                <span className="bg-zinc-100 text-zinc-500 text-xs px-3 py-2.5 flex items-center border-r border-zinc-200">
                  kadeo.lk/shop/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="ceylon-linen"
                  className="w-full px-3 py-2.5 bg-white text-zinc-900 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              WhatsApp Order Number * (with Country code 94)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="whatsappNumber"
                required
                placeholder="e.g. 94771234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">
              Customer orders and order summaries will be submitted directly to this WhatsApp number.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Shop Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Tell your customers about what you sell, your quality, and your delivery areas..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Contact Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="contact@ceylonlinen.lk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Business Address (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="address"
                  placeholder="Colombo, Sri Lanka"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              Select Starting Design Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "minimal", name: "Minimal Store", desc: "Clean & modern, focused on photography" },
                { id: "modern_boutique", name: "Modern Boutique", desc: "Editorial serif style for fashion" },
                { id: "classic", name: "Classic Shop", desc: "Traditional catalog with compact grid" },
              ].map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`text-left p-4 rounded-2xl border transition ${
                    selectedTheme === theme.id
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">{theme.name}</p>
                  <p className={`text-xs ${selectedTheme === theme.id ? "text-zinc-300" : "text-zinc-500"}`}>
                    {theme.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              0% commission on orders • Free starter plan included
            </span>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Launch Storefront
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
