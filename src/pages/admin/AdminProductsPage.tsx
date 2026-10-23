import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Product, Shop } from '../../types';
import { Search, Package, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const shops = StorageService.getShops();
  const categories = StorageService.getCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [shopFilter, setShopFilter] = useState('all');

  const refreshProducts = () => {
    setProducts(StorageService.getProducts());
  };

  const handleToggleProductStatus = (p: Product) => {
    const nextStatus = p.status === 'active' ? 'archived' : 'active';
    StorageService.updateProduct(p.id, { status: nextStatus });
    refreshProducts();
  };

  const filtered = products.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (shopFilter !== 'all' && p.shopId !== shopFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Product Catalog Moderation ({products.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Global listing review across all Sri Lankan seller stores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU across platform..."
            className="w-full rounded-md border border-neutral-300 py-1.5 pl-9 pr-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={shopFilter}
            onChange={e => setShopFilter(e.target.value)}
            className="w-full rounded-md border border-neutral-300 py-1.5 px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
          >
            <option value="all">All Shops</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Shop</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map(p => {
                const s = shops.find(shop => shop.id === p.shopId);
                const c = categories.find(cat => cat.id === p.categoryId);
                const isArchived = p.status === 'archived';

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-950 truncate max-w-xs">{p.name}</p>
                          <span className="font-mono text-[10px] text-neutral-400">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-neutral-800">
                      {s?.name || '—'}
                    </td>

                    <td className="py-3 px-4 text-neutral-600">
                      {c?.name || '—'}
                    </td>

                    <td className="py-3 px-4 font-semibold text-neutral-950 tabular-nums">
                      {StorageService.formatLKR(p.price)}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums">
                      {p.stockQuantity}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isArchived
                            ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleProductStatus(p)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isArchived
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {isArchived ? 'Enable Listing' : 'Disable'}
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
