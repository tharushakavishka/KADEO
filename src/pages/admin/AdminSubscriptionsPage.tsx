import React from 'react';
import { StorageService } from '../../services/storageService';
import { CreditCard, Check, Store } from 'lucide-react';

export const AdminSubscriptionsPage: React.FC = () => {
  const plans = StorageService.getSubscriptionPlans();
  const shops = StorageService.getShops();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Economics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Subscriptions & Tiers
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage merchant tiers, product catalog limits, and pricing.
          </p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => {
          const count = shops.filter(s => s.subscriptionPlanId === p.id).length;
          return (
            <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-neutral-950 text-base">{p.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                  {count} {count === 1 ? 'store' : 'stores'}
                </span>
              </div>

              <div className="text-2xl font-extrabold text-neutral-950 tabular-nums">
                {StorageService.formatLKR(p.monthlyPrice)} <span className="text-xs text-neutral-500 font-normal">/ mo</span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                <div className="flex justify-between">
                  <span>Product Limit:</span>
                  <strong className="text-neutral-900">{p.productLimit} listings</strong>
                </div>
                <div className="flex justify-between">
                  <span>Images per Product:</span>
                  <strong className="text-neutral-900">{p.imagesPerProductLimit} images</strong>
                </div>
                <div className="flex justify-between">
                  <span>Storefront Themes:</span>
                  <span className="text-neutral-900 uppercase font-mono text-[11px]">All 3</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seller Assignments Table */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            Seller Subscription Roster
          </h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
            <tr>
              <th className="py-3 px-4">Storefront</th>
              <th className="py-3 px-4">Current Plan</th>
              <th className="py-3 px-4">Monthly Rate</th>
              <th className="py-3 px-4">Catalog Capacity</th>
              <th className="py-3 px-4 text-right">Reassign Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {shops.map(shop => {
              const currentPlan = plans.find(p => p.id === shop.subscriptionPlanId) || plans[0];
              const products = StorageService.getProductsByShop(shop.id);

              return (
                <tr key={shop.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-neutral-950">{shop.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-neutral-900 text-white">
                      {currentPlan.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold tabular-nums text-neutral-900">
                    {StorageService.formatLKR(currentPlan.monthlyPrice)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">
                    {products.length} / {currentPlan.productLimit} listings
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={shop.subscriptionPlanId}
                      onChange={e => {
                        StorageService.updateShopPlan(shop.id, e.target.value as any);
                        window.location.reload();
                      }}
                      className="rounded border border-neutral-300 py-1 px-2 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none"
                    >
                      <option value="free">Free (Rs. 0)</option>
                      <option value="starter">Starter (Rs. 490)</option>
                      <option value="pro">Pro (Rs. 990)</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
