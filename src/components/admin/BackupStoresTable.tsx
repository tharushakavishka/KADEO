"use client";

import { useState } from "react";
import { Download, Search, Database, Layers, Package, ShoppingBag, Users, HardDrive, FileJson, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export interface BackupShopItem {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  owner_email: string;
  status: string;
  storage_used_bytes: number;
  products_count: number;
  categories_count: number;
  orders_count: number;
  customers_count: number;
  created_at: string;
}

export function BackupStoresTable({ shops }: { shops: BackupShopItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = shops.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.owner_email.toLowerCase().includes(q) ||
      s.whatsapp_number.includes(q)
    );
  });

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            Available Store Snapshots ({shops.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Export standalone JSON backups containing store configurations, catalog, media paths, customers, and orders.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores for backup..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500">
          {searchQuery
            ? `No stores match "${searchQuery}".`
            : "No merchant stores registered to back up."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Catalog Assets</th>
                <th className="px-5 py-3">Commerce Data</th>
                <th className="px-5 py-3">Storage Footprint</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filtered.map((s) => {
                const storageMb = (s.storage_used_bytes / (1024 * 1024)).toFixed(1);
                return (
                  <tr key={s.id} className="hover:bg-zinc-50/60 transition">
                    {/* Store */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-zinc-900">{s.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        /shop/{s.slug}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-3.5">
                      <div className="text-zinc-900 font-semibold">{s.owner_email}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {s.whatsapp_number}
                      </div>
                    </td>

                    {/* Catalog */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700">
                          <Package className="w-3.5 h-3.5 text-zinc-400" />
                          {s.products_count} Products
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          {s.categories_count} Categories
                        </span>
                      </div>
                    </td>

                    {/* Commerce */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700">
                          <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                          {s.orders_count} Orders
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          {s.customers_count} Customers
                        </span>
                      </div>
                    </td>

                    {/* Storage */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-zinc-800 font-semibold text-[11px]">
                        {storageMb} MB
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <a
                        href={`/api/admin/backup/${s.id}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-2xs transition"
                        title={`Export full backup for ${s.name}`}
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download JSON</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
