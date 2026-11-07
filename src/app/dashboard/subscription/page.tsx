import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getShopStorageQuota } from "@/features/subscriptions/quota-service";
import { StorageQuotaMeter } from "@/components/dashboard/StorageQuotaMeter";
import { SubscriptionExpiryBanner } from "@/components/dashboard/SubscriptionExpiryBanner";
import {
  Check,
  ShieldCheck,
  Info,
  AlertTriangle,
} from "lucide-react";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Query shop and joined relations where available
  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, subscriptions(*, plans(*))")
    .eq("owner_id", user.id)
    .single();

  if (!shop) redirect("/dashboard/new-store");

  // Fetch live storage quota and plan details
  const quota = await getShopStorageQuota(shop.id);

  // Derive subscription safely for both local adapter and Supabase SSR
  let currentSub = shop.subscriptions?.[0];
  if (!currentSub) {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("id, plan_id, status, billing_period, started_at, expires_at")
      .eq("shop_id", shop.id);
    if (subs && subs.length > 0) {
      currentSub = subs[0];
    }
  }

  // Derive active plan from real database status; fallback to Starter Free for missing or expired
  const activePlanId =
    currentSub && currentSub.status === "active" && currentSub.plan_id
      ? currentSub.plan_id
      : "free";

  // Truthful plans reflecting only actual system capabilities without unbuilt claims or fabricated pricing
  const availablePlans = [
    {
      id: "free",
      name: "Starter Free",
      price: 0,
      description: "Everything you need to launch and operate your WhatsApp storefront.",
      features: [
        "WhatsApp direct checkout & customer inquiries",
        "Multiple storefront themes & layout customization",
        "Mobile-first seller management dashboard",
        "Delivery and return policy configuration",
        "0% sales commission",
        "250 MB media storage quota",
        "Up to 25 catalog products",
      ],
      current: activePlanId === "free",
      isUpgrade: false,
    },
    {
      id: "pro",
      name: "Pro Business",
      price: null,
      description: "Additional merchant capabilities currently in development for Sri Lankan businesses.",
      features: [
        "Expanded 5 GB (5,120 MB) storage quota",
        "Up to 1,000 catalog products",
        "Advanced storefront customization controls",
        "Merchant support channels",
      ],
      current: activePlanId === "pro",
      isUpgrade: true,
      upgradeUnavailableNotice:
        "Online upgrades and payment gateway processing are not available yet in this release.",
    },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Expiry Banner if in Grace Period or Expired */}
      {quota?.subscription && (
        <SubscriptionExpiryBanner subscription={quota.subscription} />
      )}

      <div>
        <span className="text-xs font-semibold text-[#7960df] uppercase tracking-wider">
          Billing & Plans
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191b30] mt-1">
          Subscription Plan & Storage
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Kadeo operates on a 0% commission SaaS model with flat-rate pricing.
        </p>
      </div>

      {/* Storage Quota & Capacity Overview Meter */}
      {quota && (
        <StorageQuotaMeter quota={quota} />
      )}

      {/* Transparency Notice */}
      <div className="rounded-2xl border border-[#ded5ef] bg-[#f6f3ff] p-5 flex items-start gap-3.5 shadow-sm">
        <Info className="w-5 h-5 text-[#7960df] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-[#191b30] uppercase tracking-wider">
            Subscription & Payment Status
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All registered shops are granted full access to the Starter Free tier with 0% sales commission. Paid plan billing and online payment processing are not yet configured in this version.
          </p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-6 flex flex-col justify-between bg-white transition ${
              plan.current
                ? "border-[#7959d4] ring-2 ring-[#7959d4]/30 shadow-sm"
                : "border-[#e8e8f1]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#f0ebff] text-[#5f4a80]">
                  {plan.name}
                </span>
                {plan.current ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active Plan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="mb-4">
                {plan.price !== null ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#191b30]">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium ml-1">/ month</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-zinc-500">
                    Pricing to be announced
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                {plan.description}
              </p>

              {/* Truthful Notice for upgrade tier */}
              {!plan.current && plan.isUpgrade && (
                <div className="mb-6 text-[11.5px] text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="block font-semibold text-zinc-900">Upgrades Not Available Yet</strong>
                    <span>
                      {plan.upgradeUnavailableNotice}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 pt-4 border-t border-zinc-100 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-700">
                    <Check className="w-4 h-4 text-[#7960df] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plain Action Area */}
            {plan.current ? (
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-400 cursor-default border border-zinc-200/60"
              >
                Current Plan
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/60"
              >
                Upgrades not available yet
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Feature & Policy Information */}
      <div className="rounded-2xl border border-[#e8e8f1] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#191b30] mb-3">
          Pricing & Storefront Policy
        </h3>
        <div className="text-xs text-zinc-600 space-y-2 leading-relaxed">
          <p>
            • <strong>0% Sales Commission:</strong> Kadeo does not deduct commission fees on storefront orders. Payments are settled directly with your customers via Cash on Delivery (COD) or direct bank transfer.
          </p>
          <p>
            • <strong>WhatsApp Ordering:</strong> Customer order details, items, quantities, and delivery addresses are compiled directly into your designated WhatsApp number.
          </p>
        </div>
      </div>
    </div>
  );
}
