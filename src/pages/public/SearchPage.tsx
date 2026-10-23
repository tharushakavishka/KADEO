import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Filter, X, SlidersHorizontal } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ProductCard } from '../../components/product/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialShop = searchParams.get('shop') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedShop, setSelectedShop] = useState(initialShop);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    const s = searchParams.get('shop') || 'all';
    setQuery(q);
    setSelectedCategory(cat);
    setSelectedShop(s);
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState(() => StorageService.getProducts());
  const [allShops, setAllShops] = useState(() => StorageService.getShops());
  const [allCategories, setAllCategories] = useState(() => StorageService.getCategories());

  useEffect(() => {
    const handleUpdate = () => {
      setAllProducts(StorageService.getProducts());
      setAllShops(StorageService.getShops());
      setAllCategories(StorageService.getCategories());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(p => {
        // 1. Text match (name, description, sku)
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesSku = p.sku.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesSku) return false;
        }

        // 2. Category match
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
          return false;
        }

        // 3. Shop match
        if (selectedShop !== 'all' && p.shopId !== selectedShop) {
          return false;
        }

        // 4. In-stock filter
        if (inStockOnly && p.stockQuantity <= 0) {
          return false;
        }

        // 5. Price filter
        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;
        if (min !== null && !isNaN(min) && p.price < min) return false;
        if (max !== null && !isNaN(max) && p.price > max) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [allProducts, query, selectedCategory, selectedShop, inStockOnly, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedShop('all');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(query) ||
    selectedCategory !== 'all' ||
    selectedShop !== 'all' ||
    inStockOnly ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#111113]">
      {/* Top Banner */}
      <div className="border-b border-[#E4E4E7] bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                Marketplace Catalog
              </p>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F0F11] mt-1">
                {query ? `Results for "${query}"` : 'Browse All Pieces'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#71717A] bg-[#FAFAF9] border border-[#E4E4E7] px-3 py-1.5 rounded-full font-medium">
                Showing <strong className="text-[#0F0F11]">{filteredProducts.length}</strong> of{' '}
                {allProducts.length} items
              </span>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white px-4 py-1.5 text-xs font-semibold text-[#0F0F11] shadow-luxury-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{mobileFilterOpen ? 'Hide Filters' : 'Filters'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className={`md:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-luxury-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#0F0F11]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F0F11]">
                    Refine
                  </span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#71717A] hover:text-[#0F0F11] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F0F11]">Search Query</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search name, SKU..."
                    className="w-full rounded-full border border-[#E4E4E7] bg-[#FAFAF9] py-2 pl-9 pr-8 text-xs text-[#0F0F11] placeholder:text-[#A1A1AA] focus:border-[#0F0F11] focus:bg-white focus:outline-none transition-colors"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#71717A] hover:text-[#0F0F11]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F0F11]">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] py-2 px-3 text-xs text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shop Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F0F11]">Boutique / Atelier</label>
                <select
                  value={selectedShop}
                  onChange={e => setSelectedShop(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] py-2 px-3 text-xs text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Boutiques</option>
                  {allShops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F0F11]">Price Range (LKR)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] py-2 px-3 text-xs text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none tabular-nums"
                  />
                  <span className="text-[#71717A] text-xs">–</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] py-2 px-3 text-xs text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="pt-2 border-t border-[#F4F4F5]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#0F0F11]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="rounded border-[#E4E4E7] text-[#0F0F11] focus:ring-0"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Results Column */}
          <main className="md:col-span-3 space-y-5">
            {/* Screen 2 Category Banner */}
            <div className="rounded-3xl bg-[#F6F3EC] border border-[#E9E4D8] p-5 sm:p-7 flex items-center justify-between overflow-hidden shadow-2xs">
              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                  Healthy Skin<br />
                  <span className="text-[#10B981]">Happy You</span>
                </h2>
                <p className="text-xs text-neutral-600">
                  Premium skincare for every skin type.
                </p>
              </div>
              <div className="w-24 sm:w-36 h-24 sm:h-32 rounded-2xl overflow-hidden border border-white/80 shrink-0 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80"
                  alt="Healthy Skin Products"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Screen 2 Horizontal Pill Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'cat-skincare', label: 'Face Care' },
                { id: 'cleansers', label: 'Cleansers' },
                { id: 'moisturizers', label: 'Moisturizers' },
                { id: 'serums', label: 'Serums' },
                { id: 'creams', label: 'Creams' },
              ].map(tab => {
                const isActive =
                  selectedCategory === tab.id || (tab.id === 'all' && selectedCategory === 'all');
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'all') {
                        setSelectedCategory('all');
                      } else if (tab.id === 'cat-skincare') {
                        setSelectedCategory('cat-skincare');
                      } else {
                        setQuery(tab.label);
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#10B981] text-white shadow-xs'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sorting bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
              <div className="text-xs text-[#71717A]">
                Showing <strong className="text-[#0F0F11]">{filteredProducts.length}</strong> pieces
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#71717A]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded-full border border-[#E4E4E7] bg-white py-1.5 px-3 text-xs font-semibold text-[#0F0F11] focus:border-[#0F0F11] focus:outline-none shadow-luxury-xs cursor-pointer"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E4E4E7] bg-white p-14 text-center space-y-3 shadow-luxury-xs">
                <p className="text-base font-bold text-[#0F0F11]">No products match your criteria</p>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                  Try clearing your search keyword, adjusting the price boundaries, or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0F0F11] px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-luxury-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map(product => {
                  const shop = allShops.find(s => s.id === product.shopId);
                  const cat = allCategories.find(c => c.id === product.categoryId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      shop={shop}
                      categoryName={cat?.name}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
