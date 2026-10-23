import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { Check, Sparkles, CreditCard, AlertCircle, ArrowUpRight, Zap } from 'lucide-react';
import { SubscriptionPlan } from '../../types';

export const SellerSubscriptionPage: React.FC = () => {
  const { currentShop, refreshShop } = useAuth();
  const { isDark } = useTheme();
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [successNote, setSuccessNote] = useState('');

  if (!currentShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  const plans = StorageService.getSubscriptionPlans();
  const products = StorageService.getProductsByShop(currentShop.id);
  const currentPlan = plans.find(p => p.id === currentShop.subscriptionPlanId) || plans[0];

  const productCount = products.length;
  const productLimit = currentPlan.productLimit;
  const usagePercent = Math.min(100, Math.round((productCount / productLimit) * 100));

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForModal) return;

    StorageService.updateShopPlan(currentShop.id, selectedPlanForModal.id);
    refreshShop();
    setSuccessNote(`Successfully switched to ${selectedPlanForModal.name} Plan (Demo Mode).`);
    setSelectedPlanForModal(null);
    setTimeout(() => setSuccessNote(''), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? 'border-white/10' : 'border-[#E4E4E7]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full font-bold ${
                isDark
                  ? 'bg-white/10 text-neutral-300 border border-white/10'
                  : 'bg-neutral-100 text-[#0F0F11] border border-neutral-200'
              }`}
            >
              Billing & Tiers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Subscription Plans & Quotas
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Transparent, zero-commission pricing tailored for independent Sri Lankan boutiques.
          </p>
        </div>
      </div>

      {successNote && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2.5 anim-slide-top">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Current Plan & Usage Widget */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] uppercase font-mono font-bold tracking-wider ${
                  isDark ? 'text-neutral-400' : 'text-[#71717A]'
                }`}
              >
                Active Membership
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#0F0F11] text-white'
                }`}
              >
                {currentPlan.name} (Rs. {currentPlan.monthlyPrice} / mo)
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Boutique Limits & Quota Health
            </h2>
          </div>

          <div className="sm:text-right">
            <span
              className={`text-xs block ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}
            >
              Catalog Utilization
            </span>
            <span className="text-2xl font-extrabold tabular-nums">
              {productCount} <span className="text-sm font-normal text-neutral-500">/ {productLimit} items</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div
            className={`h-2.5 w-full rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-neutral-100'
            }`}
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                usagePercent >= 90
                  ? 'bg-rose-500'
                  : usagePercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div
            className={`flex justify-between text-xs ${
              isDark ? 'text-neutral-400' : 'text-[#71717A]'
            }`}
          >
            <span>{usagePercent}% of product quota used</span>
            <span>Photos per product: {currentPlan.imagesPerProductLimit}</span>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrent = plan.id === currentShop.subscriptionPlanId;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.recommended
                  ? isDark
                    ? 'border-emerald-500/50 bg-[#161622] shadow-2xl ring-1 ring-emerald-500/30'
                    : 'border-[#0F0F11] bg-white ring-2 ring-[#0F0F11]/10 shadow-luxury-md'
                  : isDark
                  ? 'border-white/10 bg-[#121217]/90 hover:border-white/20'
                  : 'border-[#E4E4E7] bg-white hover:border-neutral-400 shadow-luxury-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold tracking-tight">{plan.name}</h3>
                  {plan.recommended && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#0F0F11] text-white'
                      }`}
                    >
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold tabular-nums tracking-tight">
                    {StorageService.formatLKR(plan.monthlyPrice)}
                  </span>
                  <span
                    className={`ml-1.5 text-xs ${
                      isDark ? 'text-neutral-400' : 'text-[#71717A]'
                    }`}
                  >
                    / month
                  </span>
                </div>

                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isDark ? 'text-neutral-400' : 'text-[#71717A]'
                  }`}
                >
                  {plan.id === 'free'
                    ? 'Perfect for starting out with zero risk and direct WhatsApp orders.'
                    : plan.id === 'starter'
                    ? 'Ideal for growing independent boutiques with regular customer demand.'
                    : 'For established ateliers requiring prominent lookbooks and priority cataloging.'}
                </p>

                <div
                  className={`mt-6 pt-5 border-t space-y-3 ${
                    isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                      isDark ? 'text-neutral-400' : 'text-[#71717A]'
                    }`}
                  >
                    Plan Benefits:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 text-xs ${
                        isDark ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`mt-8 pt-5 border-t ${
                  isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                }`}
              >
                {isCurrent ? (
                  <button
                    disabled
                    className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-default ${
                      isDark
                        ? 'bg-white/10 text-neutral-400'
                        : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlanForModal(plan)}
                    className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-luxury-xs cursor-pointer ${
                      plan.recommended
                        ? isDark
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                          : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
                        : isDark
                        ? 'border border-white/15 bg-white/5 hover:bg-white/10 text-white'
                        : 'border border-[#E4E4E7] bg-white hover:bg-[#FAFAF9] text-[#0F0F11]'
                    }`}
                  >
                    Switch to {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Upgrade Confirmation Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 space-y-5 anim-slide-bottom shadow-2xl ${
              isDark
                ? 'bg-[#15151D] border-white/15 text-white'
                : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
            }`}
          >
            <h3 className="text-lg font-extrabold tracking-tight">
              Confirm Plan Tier: {selectedPlanForModal.name}
            </h3>

            <div
              className={`rounded-2xl border p-4 text-xs space-y-2 ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-[#FAFAF9] border-[#E4E4E7]'
              }`}
            >
              <div className="flex justify-between">
                <span className={isDark ? 'text-neutral-400' : 'text-[#71717A]'}>Monthly Rate:</span>
                <strong className="font-mono">{StorageService.formatLKR(selectedPlanForModal.monthlyPrice)} / mo</strong>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-neutral-400' : 'text-[#71717A]'}>Catalog Capacity:</span>
                <strong>Up to {selectedPlanForModal.productLimit} listings</strong>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-neutral-400' : 'text-[#71717A]'}>Images per Listing:</span>
                <strong>{selectedPlanForModal.imagesPerProductLimit} images</strong>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-3.5 text-xs flex items-start gap-2.5 ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Evaluation Mode:</strong> Tier switching is instantaneous with zero payment gateway interruption.
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPlanForModal(null)}
                className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                  isDark
                    ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                    : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer ${
                  isDark
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                    : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
                }`}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
