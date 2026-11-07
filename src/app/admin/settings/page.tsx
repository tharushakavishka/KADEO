import { createClient } from "@/lib/supabase/server";
import { Settings, ShieldCheck, Database, HardDrive, Lock, CheckCircle2, Server, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Platform Configuration & Rules
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review system defaults, storage quota thresholds, subscription grace policies, and infrastructure guardrails.
        </p>
      </div>

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Defaults */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Plan Tier Guardrails</h2>
              <p className="text-[11px] text-zinc-400">Default quotas applied to new merchants</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900">Starter Free Tier</div>
                <div className="text-[11px] text-zinc-500">Auto-assigned upon seller onboarding</div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="font-bold text-zinc-800">250 MB</span> / 25 Products
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-indigo-950">Pro Business Tier</div>
                <div className="text-[11px] text-indigo-700/80">Monthly / Yearly subscription</div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="font-bold text-indigo-900">5,120 MB (5 GB)</span> / 1,000 Products
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900">Custom Storage Override</div>
                <div className="text-[11px] text-zinc-500">Super Admin grant via drawer</div>
              </div>
              <div className="text-right text-[11px] text-emerald-600 font-bold">
                Up to 10 GB+ on-demand
              </div>
            </div>
          </div>
        </div>

        {/* Expiry & Grace Period Policies */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Subscription Grace Policy</h2>
              <p className="text-[11px] text-zinc-400">Merchant protection & enforcement lifecycle</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">7-Day Automatic Grace Window</span>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  When a paid plan hits its expiration date, merchants enter a 7-day grace period. Storefronts remain active and photo uploads continue to function with an amber banner warning.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-200/60">
              <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950">Upload Restriction on Final Expiry</span>
                <p className="text-[11px] text-rose-900/80 mt-0.5">
                  Following the 7-day grace period, HTTP 403 blocks new uploads while keeping the seller's catalog read-only and orders unhindered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Tenant Security & Infrastructure */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Platform Infrastructure & Environment</h2>
              <p className="text-[11px] text-zinc-400">Multi-tenant isolation and cloud storage bindings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Currency Standard</div>
              <div className="font-bold text-zinc-900 text-sm mt-0.5">LKR (Rs.)</div>
              <div className="text-[10px] text-zinc-500 mt-1">Sri Lankan Rupee default for all stores</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Media Storage Bucket</div>
              <div className="font-bold text-zinc-900 text-sm mt-0.5">storefront-assets</div>
              <div className="text-[10px] text-zinc-500 mt-1">Atomic byte-quota enforced per shop</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Active Super Admin</div>
              <div className="font-bold text-zinc-900 font-mono text-xs mt-0.5 truncate">{user?.email}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">Authenticated with Role: Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
