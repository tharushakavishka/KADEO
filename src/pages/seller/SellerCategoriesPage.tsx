import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { ApiService } from '../../services/apiService';
import { Category } from '../../types';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Shirt,
  Smartphone,
  Home,
  Coffee,
  Heart,
  Gem,
  Tag,
  Package,
  Scissors,
  ShoppingBag,
  Check,
} from 'lucide-react';

const PRESET_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: 'Beauty & Luxury' },
  { name: 'Shirt', icon: Shirt, label: 'Apparel & Linen' },
  { name: 'Smartphone', icon: Smartphone, label: 'Tech & Gadgets' },
  { name: 'Home', icon: Home, label: 'Living & Decor' },
  { name: 'Coffee', icon: Coffee, label: 'Pantry & Artisanal' },
  { name: 'Heart', icon: Heart, label: 'Wellness & Care' },
  { name: 'Gem', icon: Gem, label: 'Jewelry & Crafts' },
  { name: 'Tag', icon: Tag, label: 'Collections' },
  { name: 'Package', icon: Package, label: 'Goods & Cargo' },
  { name: 'Scissors', icon: Scissors, label: 'Bespoke Tailoring' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Boutique' },
  { name: 'Layers', icon: Layers, label: 'Categories' },
];

export const SellerCategoriesPage: React.FC = () => {
  const { currentShop, currentUser } = useAuth();
  const { isDark } = useTheme();

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

  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [products, setProducts] = useState(() =>
    activeShop ? StorageService.getProductsByShop(activeShop.id) : []
  );

  // Synchronize category list whenever categories are updated anywhere
  useEffect(() => {
    const handleUpdate = () => {
      setCategories(StorageService.getCategories());
      if (activeShop) {
        setProducts(StorageService.getProductsByShop(activeShop.id));
      }
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, [activeShop]);

  useEffect(() => {
    if (activeShop) {
      setProducts(StorageService.getProductsByShop(activeShop.id));
    }
  }, [activeShop]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [iconName, setIconName] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'upload' | 'url' | 'icon'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeShop) {
    return <div className="text-center py-16 text-xs text-neutral-400">Shop not found.</div>;
  }

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIconName('Sparkles');
    setActiveMediaTab('upload');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setImageUrl(c.imageUrl || '');
    setIconName(c.iconName || 'Sparkles');
    setActiveMediaTab(c.imageUrl ? (c.imageUrl.startsWith('data:') ? 'upload' : 'url') : 'icon');
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB. Please choose a smaller icon or image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const payload = {
      name: name.trim(),
      slug,
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      iconName: iconName.trim() || undefined,
    };

    if (editingCategory) {
      StorageService.updateCategory(editingCategory.id, payload);
      try {
        await ApiService.updateCategory(editingCategory.id, payload).catch(() => {});
      } catch {}
    } else {
      const created = StorageService.addCategory(payload);
      try {
        await ApiService.createCategory(created).catch(() => {});
      } catch {}
    }

    setCategories(StorageService.getCategories());
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? It will immediately be removed from your boutique and website storefront.')) {
      StorageService.deleteCategory(id);
      setCategories(StorageService.getCategories());
      try {
        await ApiService.deleteCategory(id).catch(() => {});
      } catch {}
    }
  };

  const renderCategoryIcon = (cat: Category) => {
    if (cat.imageUrl) {
      return (
        <div className="h-10 w-10 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
          <img
            src={cat.imageUrl}
            alt={cat.name}
            className="h-full w-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80';
            }}
          />
        </div>
      );
    }

    const matchedPreset = PRESET_ICONS.find(p => p.name === cat.iconName) || PRESET_ICONS[0];
    const IconComponent = matchedPreset.icon;

    return (
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
          isDark
            ? 'bg-white/5 border-white/10 text-emerald-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block mb-1.5 shadow-2xs">
            COLLECTIONS & TAXONOMY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Categories & Curations
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Organize products into curated lookbooks, category shelves, and navigation filters for your boutique.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold bg-[#00B074] hover:bg-[#009E67] text-white shadow-md shadow-[#00B074]/25 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div
        className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden`}
      >
        <table className="w-full text-left text-xs">
          <thead
            className={`border-b border-slate-100 bg-[#FAFBFD] text-slate-500 font-semibold select-none`}
          >
            <tr>
              <th className="py-4 px-6">Icon / Image</th>
              <th className="py-4 px-6">Category Name</th>
              <th className="py-4 px-6">Slug</th>
              <th className="py-4 px-6">Description</th>
              <th className="py-4 px-6">Active Boutique Items</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark ? 'divide-white/5' : 'divide-[#F4F4F5]'
            }`}
          >
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                  No categories found. Click "Add Category" above to create your first collection.
                </td>
              </tr>
            ) : (
              categories.map(cat => {
                const shopItemCount = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <tr
                    key={cat.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <td className="py-4 px-6">
                      {renderCategoryIcon(cat)}
                    </td>
                    <td className="py-4 px-6 font-bold">{cat.name}</td>
                    <td className="py-4 px-6 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          isDark ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-[#71717A]'
                        }`}
                      >
                        {cat.slug}
                      </span>
                    </td>
                    <td
                      className={`py-4 px-6 max-w-sm truncate ${
                        isDark ? 'text-neutral-400' : 'text-[#71717A]'
                      }`}
                    >
                      {cat.description || '—'}
                    </td>
                    <td className="py-4 px-6 font-bold tabular-nums">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                          shopItemCount > 0
                            ? isDark
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isDark
                            ? 'bg-white/5 text-neutral-500'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {shopItemCount} {shopItemCount === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                              : 'text-[#71717A] hover:text-[#0F0F11] hover:bg-neutral-100'
                          }`}
                          title="Edit category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isDark
                              ? 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
                              : 'text-[#71717A] hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Category Create/Edit Modal with Icon / Image Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 space-y-5 anim-slide-bottom shadow-2xl max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#15151D] border-white/15 text-white'
                : 'bg-white border-[#E4E4E7] text-[#0F0F11]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Add a title, description, and upload an icon or link for your storefront.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isDark ? 'text-neutral-400 hover:text-white' : 'text-[#71717A] hover:text-[#0F0F11]'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Category Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Linen Kimonos, Aromatherapy, Botanicals"
                  className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                      : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                  }`}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Editorial overview of this collection for buyers..."
                  className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                      : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                  }`}
                />
              </div>

              {/* Icon / Image Upload & Link Section */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold block">Category Icon / Image</label>

                {/* Sub-tabs: Upload File | Paste URL | Pick Preset Icon */}
                <div
                  className={`flex rounded-xl p-1 border gap-1 text-[11px] font-semibold ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('upload')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeMediaTab === 'upload'
                        ? isDark
                          ? 'bg-white/15 text-white shadow-xs font-bold'
                          : 'bg-white text-neutral-900 shadow-xs font-bold'
                        : isDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('url')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeMediaTab === 'url'
                        ? isDark
                          ? 'bg-white/15 text-white shadow-xs font-bold'
                          : 'bg-white text-neutral-900 shadow-xs font-bold'
                        : isDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Image / Icon URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('icon')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeMediaTab === 'icon'
                        ? isDark
                          ? 'bg-white/15 text-white shadow-xs font-bold'
                          : 'bg-white text-neutral-900 shadow-xs font-bold'
                        : isDark
                        ? 'text-neutral-400 hover:text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Preset Icon</span>
                  </button>
                </div>

                {/* Tab 1: Upload File */}
                {activeMediaTab === 'upload' && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        isDark
                          ? 'border-white/15 hover:border-emerald-400 hover:bg-white/5'
                          : 'border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-semibold block text-emerald-500">
                          Click to browse and upload icon or image
                        </span>
                        <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          PNG, JPG, SVG, WebP (Max 2MB)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: URL Link */}
                {activeMediaTab === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or icon link"
                      className={`w-full rounded-2xl border py-2.5 px-3.5 text-xs transition-colors ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none'
                          : 'bg-[#FAFAF9] border-[#E4E4E7] text-[#0F0F11] focus:border-[#0F0F11] focus:bg-white focus:outline-none'
                      }`}
                    />
                    <p className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Paste a direct image or icon link (Unsplash, Cloudinary, AWS S3, or web URL).
                    </p>
                  </div>
                )}

                {/* Tab 3: Preset Icon */}
                {activeMediaTab === 'icon' && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {PRESET_ICONS.map(item => {
                      const IconComp = item.icon;
                      const isSelected = iconName === item.name && !imageUrl;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setIconName(item.name);
                            setImageUrl('');
                          }}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? isDark
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                          <span className="text-[10px] truncate max-w-full">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Live Preview Bar */}
                {(imageUrl || iconName) && (
                  <div
                    className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                          <img
                            src={imageUrl}
                            alt="Category preview"
                            className="h-full w-full object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          {(() => {
                            const found = PRESET_ICONS.find(p => p.name === iconName) || PRESET_ICONS[0];
                            const IconComp = found.icon;
                            return <IconComp className="h-6 w-6" />;
                          })()}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold block">{name || 'Category Preview'}</span>
                        <span className={`text-[10px] block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {imageUrl ? (imageUrl.startsWith('data:') ? 'Custom uploaded image' : 'Image URL linked') : `Preset icon: ${iconName}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setIconName('Sparkles');
                      }}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                      : 'border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAF9]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-luxury-xs cursor-pointer ${
                    isDark
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold'
                      : 'bg-[#0F0F11] hover:bg-neutral-800 text-white'
                  }`}
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};