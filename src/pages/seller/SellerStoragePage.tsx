import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  Cloud,
  Image as ImageIcon,
  FileText,
  Video,
  Database,
  ArrowUpRight,
  Search,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';

export const SellerStoragePage: React.FC = () => {
  const { currentShop, currentUser } = useAuth();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Product Media' | 'Boutique Asset' | 'System Report'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeShop = useMemo(() => {
    if (currentShop) return currentShop;
    if (currentUser?.shopId) {
      return StorageService.getShopById(currentUser.shopId) || null;
    }
    if (currentUser?.role === 'admin') {
      return StorageService.getShops()[0] || null;
    }
    return null;
  }, [currentShop, currentUser]);

  const storageData = useMemo(() => {
    if (!activeShop) return null;
    return StorageService.getShopStorageUsage(activeShop.id);
  }, [activeShop]);

  const filteredFiles = useMemo(() => {
    if (!storageData) return [];
    return storageData.files.filter(file => {
      const matchesCategory = filterCategory === 'All' || file.category === filterCategory;
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [storageData, filterCategory, searchQuery]);

  const handleCopyUrl = (id: string, url: string) => {
    if (url && url !== '#') {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!activeShop || !storageData) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-slate-200/80 shadow-2xs border-neutral-200">
        <HardDrive className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
        <h2 className="text-base font-bold text-neutral-800">No Store Data Found</h2>
        <p className="text-xs text-neutral-500 mt-1">Please sign in as a seller to monitor storage quota.</p>
      </div>
    );
  }

  // Calculate percentage segments for multi-colored bar
  const productPercent = Math.round((storageData.breakdown.productImagesBytes / storageData.maxBytes) * 100);
  const brandingPercent = Math.round((storageData.breakdown.boutiqueAssetsBytes / storageData.maxBytes) * 100);
  const docsPercent = Math.round((storageData.breakdown.documentsBytes / storageData.maxBytes) * 100);

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HEADER & UPGRADE ACTION
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block shadow-2xs">
              CLOUD INFRASTRUCTURE
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Plan: <span className="text-slate-900 font-bold">{storageData.planName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cloud Storage & Media Library
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Monitor your boutique's high-resolution product media, hero banners, and invoice storage quota.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/seller/subscription"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-md shadow-[#00B074]/25 transition-all cursor-pointer active:scale-95"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Upgrade Capacity</span>
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MAIN STORAGE USAGE HERO CARD
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HardDrive className="h-6 w-6 text-[#00B074]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">
                  {storageData.usedFormatted} of {storageData.maxFormatted} Used
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#00B074] border border-emerald-200">
                  {storageData.percentage}% Used
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {(storageData.maxBytes - storageData.totalBytes > 0)
                  ? `${((storageData.maxBytes - storageData.totalBytes) / (1024 * 1024)).toFixed(0)} MB available cloud capacity remaining on your ${storageData.planName} tier.`
                  : 'Storage limit reached. Please upgrade to add more media.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 shrink-0">
            <Cloud className="h-4 w-4 text-[#00B074]" />
            <span>Edge CDN: Active</span>
          </div>
        </div>

        {/* Multi-segmented Visual Storage Bar */}
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-neutral-100 rounded-full overflow-hidden flex p-0.5 border border-neutral-200">
            <div
              style={{ width: `${Math.max(productPercent, 4)}%` }}
              className="h-full bg-[#00B074] rounded-l-full transition-all duration-500"
              title={`Product Media: ${storageData.breakdown.productImagesFormatted}`}
            />
            <div
              style={{ width: `${Math.max(brandingPercent, 2)}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Boutique Assets: ${storageData.breakdown.boutiqueAssetsFormatted}`}
            />
            <div
              style={{ width: `${Math.max(docsPercent, 2)}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
              title={`Invoices & Reports: ${storageData.breakdown.documentsFormatted}`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00B074]" />
              <span className="font-medium">Product Media ({storageData.breakdown.productImagesFormatted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="font-medium">Storefront Branding ({storageData.breakdown.boutiqueAssetsFormatted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="font-medium">Invoices & Reports ({storageData.breakdown.documentsFormatted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span className="font-medium">Available Free Quota</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FOUR CATEGORY KPI STATS
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Product Images */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Catalog Images</span>
            <ImageIcon className="h-4 w-4 text-[#00B074]" />
          </div>
          <p className="text-xl font-extrabold text-neutral-900">
            {storageData.breakdown.productImagesFormatted}
          </p>
          <p className="text-[11px] text-neutral-400 font-medium">
            {storageData.breakdown.productImagesCount} high-res product photos
          </p>
        </div>

        {/* Stat 2: Boutique Branding */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Branding Assets</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-neutral-900">
            {storageData.breakdown.boutiqueAssetsFormatted}
          </p>
          <p className="text-[11px] text-neutral-400 font-medium">
            Logo, storefront banner & media
          </p>
        </div>

        {/* Stat 3: Invoices & Docs */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Order Invoices</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-neutral-900">
            {storageData.breakdown.documentsFormatted}
          </p>
          <p className="text-[11px] text-neutral-400 font-medium">
            Archived receipts & manifests
          </p>
        </div>

        {/* Stat 4: Database Metadata */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">DB & Index Cache</span>
            <Database className="h-4 w-4 text-neutral-600" />
          </div>
          <p className="text-xl font-extrabold text-neutral-900">
            {storageData.breakdown.databaseFormatted}
          </p>
          <p className="text-[11px] text-neutral-400 font-medium">
            Customer records & product index
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. MEDIA ASSETS EXPLORER (Search & Filter files)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs border-[#E5E7EB] shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Media Assets Explorer</h3>
            <p className="text-xs text-neutral-500">Manage all files uploaded to your boutique cloud storage</p>
          </div>

          {/* Search file input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by filename..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-[#00B074] focus:bg-white text-neutral-800 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {(['All', 'Product Media', 'Boutique Asset', 'System Report'] as const).map(cat => {
            const isActive = filterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-xs text-neutral-400">
            No media files match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {filteredFiles.map(file => {
              const isImage = file.type === 'image';
              const isDoc = file.type === 'document';
              const isVid = file.type === 'video';

              return (
                <div
                  key={file.id}
                  className="rounded-2xl border border-neutral-200 hover:border-neutral-300 bg-white p-3 hover:shadow-xs transition-all space-y-2.5 group"
                >
                  {/* Thumbnail / Icon container */}
                  <div className="h-32 w-full rounded-xl bg-neutral-100 overflow-hidden relative flex items-center justify-center border border-neutral-100">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : isVid ? (
                      <div className="flex flex-col items-center gap-1 text-neutral-400">
                        <Video className="h-8 w-8 text-neutral-500" />
                        <span className="text-[10px] font-bold">Video Stream</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-neutral-400">
                        <FileText className="h-8 w-8 text-indigo-400" />
                        <span className="text-[10px] font-bold">PDF Document</span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                      {file.sizeFormatted}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                      <span>{file.category}</span>
                      {file.dimensions && <span>{file.dimensions}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(file.id, file.url)}
                      disabled={file.url === '#'}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {copiedId === file.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    {file.url !== '#' && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100"
                        title="Open asset"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. INFRASTRUCTURE & SECURITY BADGES
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Kadeo Cloudflare R2 / AWS S3 Powered</span>
          </div>
          <h3 className="text-lg font-bold text-white pt-1">
            Enterprise Asset Optimization & WebP Delivery
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All merchant product images are automatically compressed into ultra-lightweight WebP format upon upload. This ensures your storefront loads in under 1.2 seconds across Sri Lankan mobile networks.
          </p>
        </div>

        <Link
          to="/seller/subscription"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>Upgrade to 25 GB Pro Storage</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
