"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert, ArrowRight, MessageCircle } from "lucide-react";
import type { ShopQuotaDetails } from "@/features/subscriptions/quota-service";

interface SubscriptionExpiryBannerProps {
  subscription: ShopQuotaDetails["subscription"];
  adminContactWa?: string;
}

export function SubscriptionExpiryBanner({
  subscription,
  adminContactWa = "94771234567",
}: SubscriptionExpiryBannerProps) {
  if (!subscription) return null;

  const { isExpired, isInGracePeriod, expiresAt, gracePeriodEndsAt, planName } = subscription;

  if (!isExpired && !isInGracePeriod) {
    return null;
  }

  const formatD = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-LK", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  // 1. In Grace Period: Amber Alert Banner
  if (isInGracePeriod) {
    return (
      <aside
        aria-label="Subscription Grace Period Notice"
        className="w-full bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs transition mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-amber-950">
                  {planName} Subscription Expired • Grace Period Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                  7-Day Grace
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 leading-relaxed max-w-2xl">
                Your subscription expired on <strong>{formatD(expiresAt)}</strong>. You are currently in a grace period ending on{" "}
                <strong className="underline decoration-amber-600/40">{formatD(gracePeriodEndsAt)}</strong>. Please renew your plan now to keep new product additions and photo uploads active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/subscription"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Renew Subscription</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`https://wa.me/${adminContactWa}?text=${encodeURIComponent("Hello! I would like to renew my KADEO subscription for " + planName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 transition"
              title="Contact Support on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // 2. Fully Expired past grace: Red Alert Banner (Uploads locked)
  if (isExpired) {
    return (
      <aside
        aria-label="Subscription Expired Notice"
        className="w-full bg-linear-to-r from-rose-500/15 via-rose-500/10 to-rose-50 border border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs transition mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-rose-950">
                  Subscription Expired • Image Uploads Locked
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-900/90 mt-1 leading-relaxed max-w-2xl">
                Your store subscription has expired and the grace period has ended. Existing products and orders remain live, but new photo uploads and catalog expansions are restricted until renewed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/subscription"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Renew Plan Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`https://wa.me/${adminContactWa}?text=${encodeURIComponent("Hello! My KADEO subscription is expired and I would like to renew immediately.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-800 transition"
              title="Contact Support on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
