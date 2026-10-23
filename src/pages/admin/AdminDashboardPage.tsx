import React from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const users = StorageService.getUsers().filter(u => u.role === 'seller');
  const shops = StorageService.getShops();
  const products = StorageService.getProducts();
  const orders = StorageService.getOrders();
  const plans = StorageService.getSubscriptionPlans();

  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);

  // Subscription breakdown
  const freeCount = shops.filter(s => s.subscriptionPlanId === 'free').length;
  const starterCount = shops.filter(s => s.subscriptionPlanId === 'starter').length;
  const proCount = shops.filter(s => s.subscriptionPlanId === 'pro').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Kadeo Platform Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Global network telemetry, seller management, and marketplace health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/sellers"
            className="rounded-md bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Manage Sellers
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Total Registered Sellers</span>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-950 tabular-nums">
            {users.length}
          </p>
          <div className="text-[11px] text-emerald-700 font-medium">
            100% active verified status
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Active Storefronts</span>
            <Store className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-950 tabular-nums">
            {shops.length}
          </p>
          <div className="text-[11px] text-neutral-500">
            Islandwide merchant coverage
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Listed Products</span>
            <Package className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-950 tabular-nums">
            {products.length}
          </p>
          <div className="text-[11px] text-neutral-500">
            Across 5 curated categories
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">Platform Orders (GMV)</span>
            <ShoppingBag className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-950 tabular-nums">
            {StorageService.formatLKR(totalGMV)}
          </p>
          <div className="text-[11px] text-neutral-500">
            {orders.length} total orders routed
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-lg border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            Seller Subscription Mix
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">Free Tier (Rs. 0)</span>
              <span className="font-bold tabular-nums text-neutral-950">{freeCount} shops</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">Starter Tier (Rs. 490)</span>
              <span className="font-bold tabular-nums text-neutral-950">{starterCount} shops</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">Pro Tier (Rs. 990)</span>
              <span className="font-bold tabular-nums text-neutral-950">{proCount} shops</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-neutral-400 leading-relaxed">
            Sellers can upgrade between tiers anytime without losing order history or product catalog entries.
          </div>
        </div>

        {/* Recent Registered Sellers Table */}
        <div className="md:col-span-2 rounded-lg border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
              Recent Seller Registrations
            </h3>
            <Link
              to="/admin/sellers"
              className="text-xs font-semibold text-neutral-900 hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Shop</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {shops.map(s => {
                  const owner = users.find(u => u.id === s.ownerId);
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-semibold text-neutral-950">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        {owner?.name || 'Owner'}
                      </td>
                      <td className="py-2.5 px-3 uppercase font-mono text-[11px]">
                        {s.subscriptionPlanId}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        {s.contactDetails.city}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
