import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Category } from '../../types';
import { Layers, Plus, Trash2, Edit2, X } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [products, setProducts] = useState(() => StorageService.getProducts());

  useEffect(() => {
    const handleUpdate = () => {
      setCategories(StorageService.getCategories());
      setProducts(StorageService.getProducts());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const refreshData = () => {
    setCategories(StorageService.getCategories());
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingCategory) {
      StorageService.updateCategory(editingCategory.id, {
        name: name.trim(),
        slug,
        description: description.trim(),
      });
    } else {
      StorageService.addCategory({
        name: name.trim(),
        slug,
        description: description.trim(),
      });
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this marketplace category?')) {
      StorageService.deleteCategory(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Platform Taxonomy
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 mt-0.5">
            Marketplace Categories ({categories.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure global category taxonomy shown across Kadeo marketplace.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Global Category</span>
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
            <tr>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Total Listed Products</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <tr key={cat.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-neutral-950">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">{cat.slug}</td>
                  <td className="py-3 px-4 text-neutral-600 max-w-sm truncate">{cat.description || '—'}</td>
                  <td className="py-3 px-4 font-bold tabular-nums text-neutral-900">{count} products</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-950">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Handmade Ceramics"
                  className="w-full rounded-md border border-neutral-300 py-2 px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description for marketplace browsing..."
                  className="w-full rounded-md border border-neutral-300 py-2 px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  {editingCategory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
