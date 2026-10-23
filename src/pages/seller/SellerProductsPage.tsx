import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { Product, Category } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Package,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpRight,
  Upload,
  Image as ImageIcon,
  Copy,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';

/**
 * Resizes and compresses an image file on the client before converting to Data URL.
 * Prevents localStorage bloat and keeps performance instantaneous.
 */
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      // If SVG, return directly as data URL without rasterizing
      if (file.type === 'image/svg+xml') {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.85
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const SellerProductsPage: React.FC = () => {
  const { currentShop } = useAuth();
  const { isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>(() =>
    currentShop ? StorageService.getProductsByShop(currentShop.id) : []
  );

  const [categories, setCategories] = useState(() => StorageService.getCategories());

  useEffect(() => {
    const handleUpdate = () => setCategories(StorageService.getCategories());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, []);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock-asc' | 'name-asc'>('newest');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accessible keyboard listener for modal dialogs (Escape key dismiss)
  useEffect(() => {
    if (!isModalOpen && !deletingProductId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (deletingProductId) setDeletingProductId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, deletingProductId]);

  const refreshProducts = () => {
    if (currentShop) {
      setProducts(StorageService.getProductsByShop(currentShop.id));
    }
  };

  if (!currentShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  // Inventory Statistics
  const totalProductsCount = products.length;
  const inStockCount = products.filter(p => p.stockQuantity > 3).length;
  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 3).length;
  const outOfStockCount = products.filter(p => p.stockQuantity <= 0).length;
  const catalogValuation = products.reduce((acc, p) => acc + (p.price * (p.stockQuantity > 0 ? p.stockQuantity : 0)), 0);

  // Plan limits
  const planId = currentShop.subscriptionPlanId || 'free';
  const planLimit = planId === 'free' ? 15 : planId === 'starter' ? 50 : 250;
  const usagePercentage = Math.min(100, Math.round((totalProductsCount / planLimit) * 100));

  // Filtered & Sorted products list
  const filteredProducts = products
    .filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) {
        return false;
      }
      if (stockFilter === 'out-of-stock' && p.stockQuantity > 0) return false;
      if (stockFilter === 'low-stock' && (p.stockQuantity <= 0 || p.stockQuantity > 3)) return false;
      if (stockFilter === 'in-stock' && p.stockQuantity <= 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock-asc') return a.stockQuantity - b.stockQuantity;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'all' || stockFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  const handleCopySku = (skuText: string) => {
    navigator.clipboard.writeText(skuText);
    setCopiedSku(skuText);
    setTimeout(() => {
      setCopiedSku(null);
    }, 2000);
  };

  const handleOpenAddModal = () => {
    if (products.length >= planLimit) {
      alert(`You have reached the ${planLimit}-product limit for the ${planId.toUpperCase()} plan. Please upgrade your subscription to add more products.`);
      return;
    }

    setEditingProduct(null);
    setName('');
    setPrice('4500');
    setOriginalPrice('');
    setSku(`${currentShop.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'KAD')}-${Math.floor(100 + Math.random() * 900)}`);
    setCategoryId(categories[0]?.id || '');
    setStockQuantity('15');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']);
    setUrlInput('');
    setShowUrlField(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setStockQuantity(p.stockQuantity.toString());
    setDescription(p.description);
    setImages(p.images && p.images.length > 0 ? [...p.images] : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']);
    setUrlInput('');
    setShowUrlField(false);
    setFormError('');
    setIsModalOpen(true);
  };

  // Local Computer File Upload Handler
  const handleFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    if (images.length + imageFiles.length > 6) {
      alert('You can upload up to 6 photos per product listing.');
    }

    const availableSlots = Math.max(0, 6 - images.length);
    const toProcess = imageFiles.slice(0, availableSlots);

    setIsUploading(true);
    try {
      const processedDataUrls: string[] = [];
      for (const file of toProcess) {
        const dataUrl = await processImageFile(file);
        if (dataUrl) {
          processedDataUrls.push(dataUrl);
        }
      }
      setImages(prev => [...prev, ...processedDataUrls]);
    } catch (err) {
      console.error('Failed to process image files:', err);
      alert('Failed to process image upload. Please try a different image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.length >= 6) {
      alert('You can upload up to 6 photos per product listing.');
      return;
    }
    setImages(prev => [...prev, trimmed]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(indexToPrimary, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Price must be greater than Rs. 0.');
      return;
    }
    const numStock = Number(stockQuantity);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }

    const validImages = images.filter(img => Boolean(img && img.trim()));
    if (validImages.length === 0) {
      validImages.push('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80');
    }

    const numOriginalPrice = originalPrice ? Number(originalPrice) : undefined;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingProduct) {
      StorageService.updateProduct(editingProduct.id, {
        name: name.trim(),
        price: numPrice,
        originalPrice: numOriginalPrice && numOriginalPrice > numPrice ? numOriginalPrice : undefined,
        sku: sku.trim(),
        categoryId,
        stockQuantity: numStock,
        description: description.trim(),
        images: validImages,
      });
    } else {
      StorageService.addProduct({
        shopId: currentShop.id,
        categoryId,
        name: name.trim(),
        slug,
        description: description.trim(),
        price: numPrice,
        originalPrice: numOriginalPrice && numOriginalPrice > numPrice ? numOriginalPrice : undefined,
        sku: sku.trim(),
        stockQuantity: numStock,
        images: validImages,
        status: 'active',
        featured: false,
      });
    }

    setIsModalOpen(false);
    refreshProducts();
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      StorageService.deleteProduct(deletingProductId);
      setDeletingProductId(null);
      refreshProducts();
    }
  };

  const handleUpdateStockQuick = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    StorageService.updateProduct(productId, { stockQuantity: newStock });
    refreshProducts();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b transition-colors ${
          isDark ? 'border-white/10' : 'border-[#E4E4E7]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Live Catalog & Inventory
            </span>
            <div
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {totalProductsCount} of {planLimit} products used ({usagePercentage}%)
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Product Listings
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
            Manage your boutique inventory, upload high-resolution product photography, update live pricing, and track stock levels in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/shop/${currentShop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'border-white/10 text-neutral-300 hover:bg-white/5 hover:text-white'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Public Store</span>
          </a>

          <button
            onClick={handleOpenAddModal}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shadow-luxury-sm cursor-pointer ${
              isDark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold shadow-emerald-500/20'
                : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
            }`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Products */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Total Listings
            </span>
            <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-neutral-300' : 'bg-neutral-100 text-neutral-700'}`}>
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums">{totalProductsCount}</span>
            <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              / {planLimit} max
            </span>
          </div>
          <div className="mt-3 w-full bg-neutral-200/40 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* In Stock */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Healthy Stock
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500 tabular-nums">{inStockCount}</span>
            <span className={`text-[11px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              items ready
            </span>
          </div>
          <p className={`text-[11px] mt-2.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Stock &gt; 3 units available
          </p>
        </div>

        {/* Low & Out of Stock Alerts */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Stock Warnings
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500 tabular-nums">{lowStockCount}</span>
            <span className={`text-[11px] font-medium text-rose-500 tabular-nums`}>
              + {outOfStockCount} out
            </span>
          </div>
          <p className={`text-[11px] mt-2.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {lowStockCount + outOfStockCount === 0 ? 'All items in stock' : 'Requires restock soon'}
          </p>
        </div>

        {/* Catalog Valuation */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isDark
              ? 'bg-[#121217]/90 border-white/10 shadow-sm'
              : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Inventory Value
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tight">
              {StorageService.formatLKR(catalogValuation)}
            </span>
          </div>
          <p className={`text-[11px] mt-2.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Based on current retail prices
          </p>
        </div>
      </div>

      {/* Filter / Search & Sort Bar */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search product title, SKU code..."
              className={`w-full rounded-2xl border py-2.5 pl-10 pr-9 text-xs transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] placeholder-neutral-400 focus:border-[#0F0F11] focus:bg-white focus:outline-none'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
              }`}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="lg:col-span-2">
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
              }`}
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock (&gt;3)</option>
              <option value="low-stock">Low Stock (≤ 3)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#181820] border-white/10 text-white focus:border-emerald-500/50 focus:outline-none'
                  : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
              }`}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Lowest First</option>
              <option value="name-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Results summary & Active filter tags */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200/50 dark:border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>
              Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> of {products.length} products
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                Filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Table Card */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#121217]/90 border-white/10 shadow-2xl'
            : 'bg-white border-[#E4E4E7] shadow-luxury-xs'
        }`}
      >
        {filteredProducts.length === 0 ? (
          <div
            className={`py-24 text-center space-y-4 ${
              isDark ? 'text-neutral-400' : 'text-[#71717A]'
            }`}
          >
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
              <Package className="h-8 w-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">No products match your criteria</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">
                {hasActiveFilters
                  ? 'Try clearing or loosening your filters to view more catalog items.'
                  : 'Get started by creating your first luxury product listing.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold border cursor-pointer ${
                    isDark ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleOpenAddModal}
                className={`rounded-2xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400' : 'bg-neutral-900 text-white hover:bg-black'
                }`}
              >
                + Add Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b font-semibold tracking-wider text-[11px] uppercase ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-neutral-400'
                    : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#71717A]'
                }`}
              >
                <tr>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">SKU Code</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price (LKR)</th>
                  <th className="py-4 px-6">Live Inventory</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-white/5' : 'divide-[#F4F4F5]'
                }`}
              >
                {filteredProducts.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= 3;
                  const isOut = p.stockQuantity <= 0;
                  const primaryImg = p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';

                  return (
                    <tr
                      key={p.id}
                      className={`group transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-[#FAFAF9]'
                      }`}
                    >
                      {/* Product Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative group/img shrink-0">
                            <img
                              src={primaryImg}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className={`h-14 w-14 rounded-2xl object-cover shrink-0 border transition-transform duration-300 group-hover:scale-105 ${
                                isDark
                                  ? 'border-white/10 bg-neutral-900'
                                  : 'border-[#E4E4E7] bg-neutral-50'
                              }`}
                            />
                            {p.images && p.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/80 text-white backdrop-blur-xs">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-sm truncate group-hover:text-emerald-500 transition-colors">
                              {p.name}
                            </p>
                            <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                              {p.description ? p.description : 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU Column */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleCopySku(p.sku)}
                          title="Click to copy SKU"
                          className={`group/sku inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
                            copiedSku === p.sku
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : isDark
                              ? 'bg-white/5 text-neutral-300 border-white/10 hover:border-white/20'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <span>{p.sku}</span>
                          {copiedSku === p.sku ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-40 group-hover/sku:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>

                      {/* Category Column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isDark
                              ? 'bg-white/5 text-neutral-300 border-white/10'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {cat?.name || 'General'}
                        </span>
                      </td>

                      {/* Price Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-black text-sm tabular-nums">
                            {StorageService.formatLKR(p.price)}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-neutral-400 line-through tabular-nums">
                              {StorageService.formatLKR(p.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Live Inventory Stepper */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex items-center rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'}`}>
                            <button
                              onClick={() => handleUpdateStockQuick(p.id, Math.max(0, p.stockQuantity - 1))}
                              className="px-2 py-1 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-white/10 rounded-l-xl transition-colors cursor-pointer"
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={p.stockQuantity}
                              onChange={e => handleUpdateStockQuick(p.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-center text-xs font-bold tabular-nums bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateStockQuick(p.id, p.stockQuantity + 1)}
                              className="px-2 py-1 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-white/10 rounded-r-xl transition-colors cursor-pointer"
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>

                          {isOut ? (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                              Low Stock ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/shop/${currentShop.slug}/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="View Live Product in Storefront"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                            }`}
                            title="Edit Product Details & Photography"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isDark
                                ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
                                : 'text-neutral-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto anim-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-heading"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto anim-slide-bottom shadow-2xl ${
                isDark
                  ? 'bg-[#15151D] border-white/15 text-white'
                  : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
              }`}
              onClick={e => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between border-b pb-4 ${
                isDark ? 'border-white/10' : 'border-[#F4F4F5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                  {editingProduct ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 id="product-modal-heading" className="text-lg font-extrabold tracking-tight">
                    {editingProduct ? 'Edit Product Details' : 'Add New Product Listing'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                    Upload local photography, set inventory count, SKU, and retail pricing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-2xl transition-colors cursor-pointer ${
                  isDark ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-[#71717A] hover:text-[#0F0F11] hover:bg-neutral-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* SECTION 1: Product Photography (Local Upload + URLs) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider block">
                      Product Photography <span className="text-emerald-500">*</span>
                    </label>
                    <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Upload photos directly from your computer or add external image URLs (up to 6 photos).
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {images.length} / 6 photos
                  </span>
                </div>

                {/* Local Computer Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]'
                      : isDark
                      ? 'border-white/15 bg-white/5 hover:border-emerald-500/60 hover:bg-white/10'
                      : 'border-neutral-200 bg-[#FAFAF9] hover:border-emerald-600 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400">
                      {isUploading ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 stroke-[2]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold">
                        {isUploading ? 'Optimizing & uploading images...' : 'Click to upload from local computer, or drag & drop'}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        PNG, JPG, WEBP or SVG up to 5MB (auto-optimized for ultra-fast loading)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optional Web Link URL Input Toggle */}
                <div className="pt-1">
                  {!showUrlField ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlField(true)}
                      className={`text-[11px] font-semibold underline cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      + Or add image via Web Link / URL
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        placeholder="Paste image link (e.g. https://images.unsplash.com/...)"
                        className={`flex-1 rounded-2xl border py-2 px-3.5 text-xs transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                            : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        disabled={!urlInput.trim()}
                        className="rounded-2xl px-4 py-2 text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
                      >
                        Add URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUrlField(false)}
                        className="p-2 text-neutral-400 hover:text-neutral-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Uploaded Images Gallery Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-2xl border overflow-hidden transition-all ${
                          index === 0
                            ? 'ring-2 ring-emerald-500 border-transparent shadow-md'
                            : isDark
                            ? 'border-white/10 bg-neutral-900'
                            : 'border-neutral-200 bg-neutral-50'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          {index === 0 ? (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-neutral-950 shadow-xs">
                              ★ Main Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/75 hover:bg-emerald-600 text-white backdrop-blur-xs transition-colors cursor-pointer"
                              title="Set as primary cover image"
                            >
                              Make Cover
                            </button>
                          )}
                        </div>

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-neutral-300">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: Basic Details */}
              <div className="space-y-4 pt-4 border-t border-neutral-200/50 dark:border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Product Title <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ceylon Handcrafted Linen Kimono"
                    className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                        : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">
                      Selling Price (LKR) <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="4800"
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">
                      Original Price (Optional Strike-through)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      placeholder="6000"
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Category</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#1D1D26] border-white/10 text-white focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none'
                      }`}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">SKU Identifier</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      placeholder="CLN-102"
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(e.target.value)}
                      placeholder="15"
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe fabric craftsmanship, sizing guidelines, origin, and care tips..."
                    className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                        : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                    }`}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  isDark ? 'border-white/10' : 'border-[#F4F4F5]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`rounded-2xl px-5 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                      : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-2xl px-6 py-2.5 text-xs font-bold transition-all shadow-luxury-sm cursor-pointer ${
                    isDark
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold shadow-emerald-500/20'
                      : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
                  }`}
                >
                  {editingProduct ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md anim-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-heading"
            onClick={() => setDeletingProductId(null)}
          >
            <div
              className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 anim-slide-bottom shadow-2xl ${
                isDark
                  ? 'bg-[#15151D] border-white/15 text-white'
                  : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-modal-heading" className="text-base font-bold">Remove Product Listing</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#71717A]'}`}>
                Are you sure you want to remove this piece from your active boutique catalog? Historical customer orders containing this product will not be affected.
              </p>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setDeletingProductId(null)}
                  className={`rounded-2xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                      : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-2xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
