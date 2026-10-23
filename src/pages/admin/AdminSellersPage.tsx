import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Shop, User } from '../../types';
import { Search, Store, Shield, ShieldAlert, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSellersPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>(() => StorageService.getShops());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setShops(StorageService.getShops());
    setUsers(StorageService.getUsers());
  };

  const handleToggleShopStatus = (shop: Shop) => {
    const newStatus = shop.status === 'active' ? 'suspended' : 'active';
    StorageService.updateShop(shop.id, { status: newStatus });
    refreshData();
  };

  const filteredShops = shops.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCity = s.contactDetails.city.toLowerCase().includes(q);
      const matchPhone = s.displayPhone.includes(q);
      return matchName || matchCity || matchPhone;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Sellers & Storefronts ({shops.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Audit registered independent merchants, manage shop status, and verify contacts.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search shops by name, city, or phone..."
            className="w-full rounded-md border border-neutral-300 py-1.5 pl-9 pr-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
              <tr>
                <th className="py-3 px-4">Storefront</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">WhatsApp Contact</th>
                <th className="py-3 px-4">Theme</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredShops.map(shop => {
                const owner = users.find(u => u.id === shop.ownerId);
                const isSuspended = shop.status === 'suspended';

                return (
                  <tr key={shop.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded object-cover border border-neutral-200 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-950 truncate">{shop.name}</p>
                          <Link
                            to={`/shop/${shop.slug}`}
                            target="_blank"
                            className="text-[11px] text-neutral-400 hover:text-neutral-900 underline inline-flex items-center gap-0.5"
                          >
                            <span>/shop/{shop.slug}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-900">{owner?.name || 'Owner'}</p>
                      <p className="text-[11px] text-neutral-500">{owner?.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono text-neutral-900">{shop.displayPhone}</p>
                      <p className="text-[11px] text-neutral-400">{shop.contactDetails.city}</p>
                    </td>

                    <td className="py-3 px-4 capitalize font-mono text-[11px] text-neutral-600">
                      {shop.themeId}
                    </td>

                    <td className="py-3 px-4 uppercase font-bold text-neutral-950 text-[11px]">
                      {shop.subscriptionPlanId}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isSuspended
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {shop.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleShopStatus(shop)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isSuspended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {isSuspended ? 'Reactivate' : 'Suspend Shop'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
