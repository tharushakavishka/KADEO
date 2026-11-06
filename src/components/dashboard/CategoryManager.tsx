"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
  deleteCategoryAction,
} from "@/features/categories/actions";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  products?: Array<{ count: number }>;
}

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();

  // Create form state
  const [createDraft, setCreateDraft] = useState({
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
  });
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
  });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Reordering busy state
  const [reorderBusy, setReorderBusy] = useState(false);

  // Handle Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateBusy(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      if (!createDraft.name || createDraft.name.trim().length < 2) {
        setCreateError("Category name must be at least 2 characters.");
        setCreateBusy(false);
        return;
      }

      const res = await createCategoryAction({
        name: createDraft.name.trim(),
        slug: createDraft.slug.trim() || undefined,
        description: createDraft.description.trim() || null,
        sortOrder: Number(createDraft.sortOrder) || 0,
      });

      if (res.error) {
        setCreateError(res.error);
      } else {
        setCreateSuccess("Category created successfully!");
        setCreateDraft({ name: "", slug: "", description: "", sortOrder: 0 });
        router.refresh();
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create category.");
    } finally {
      setCreateBusy(false);
    }
  }

  // Handle Edit Open
  function openEditModal(cat: CategoryItem) {
    setEditingCategory(cat);
    setEditDraft({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      sortOrder: cat.sort_order,
    });
    setEditError("");
  }

  // Handle Edit Submit
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setEditBusy(true);
    setEditError("");

    try {
      if (!editDraft.name || editDraft.name.trim().length < 2) {
        setEditError("Category name must be at least 2 characters.");
        setEditBusy(false);
        return;
      }

      const res = await updateCategoryAction(editingCategory.id, {
        name: editDraft.name.trim(),
        slug: editDraft.slug.trim() || undefined,
        description: editDraft.description.trim() || null,
        sortOrder: Number(editDraft.sortOrder) || 0,
      });

      if (res.error) {
        setEditError(res.error);
      } else {
        setEditingCategory(null);
        router.refresh();
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update category.");
    } finally {
      setEditBusy(false);
    }
  }

  // Handle Delete Confirm
  async function handleDeleteConfirm() {
    if (!categoryToDelete) return;
    setDeleteBusy(true);
    setDeleteError("");

    try {
      const res = await deleteCategoryAction(categoryToDelete.id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        setCategoryToDelete(null);
        router.refresh();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete category.");
    } finally {
      setDeleteBusy(false);
    }
  }

  // Handle Quick Reorder (Move Up/Down)
  async function handleMove(index: number, direction: "up" | "down") {
    if (reorderBusy) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= initialCategories.length) return;

    setReorderBusy(true);
    try {
      const current = [...initialCategories];
      const itemA = current[index];
      const itemB = current[targetIndex];

      const updates = [
        { id: itemA.id, sortOrder: itemB.sort_order },
        { id: itemB.id, sortOrder: itemA.sort_order === itemB.sort_order ? itemA.sort_order + 1 : itemA.sort_order },
      ];

      await reorderCategoriesAction(updates);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setReorderBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Category Form */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4">
          <FolderPlus className="w-5 h-5 text-zinc-900" />
          <h2 className="text-base font-bold text-zinc-900">Add Category</h2>
        </div>

        {createError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Creation Error</p>
              <p className="mt-0.5">{createError}</p>
            </div>
          </div>
        )}

        {createSuccess && (
          <div
            role="status"
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="mt-0.5">{createSuccess}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label
              htmlFor="new-category-name"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="new-category-name"
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={100}
              aria-required="true"
              value={createDraft.name}
              onChange={(e) => {
                setCreateDraft({ ...createDraft, name: e.target.value });
                setCreateError("");
              }}
              placeholder="e.g. Linen Shirts"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-slug"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Slug (Optional)
            </label>
            <input
              id="new-category-slug"
              type="text"
              name="slug"
              value={createDraft.slug}
              onChange={(e) => {
                setCreateDraft({ ...createDraft, slug: e.target.value });
                setCreateError("");
              }}
              placeholder="linen-shirts"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-description"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Description
            </label>
            <textarea
              id="new-category-description"
              name="description"
              rows={2}
              maxLength={1000}
              value={createDraft.description}
              onChange={(e) => {
                setCreateDraft({ ...createDraft, description: e.target.value });
                setCreateError("");
              }}
              placeholder="Brief description for storefront display..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-sort-order"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Display Order
            </label>
            <input
              id="new-category-sort-order"
              type="number"
              name="sortOrder"
              value={createDraft.sortOrder}
              onChange={(e) => {
                setCreateDraft({ ...createDraft, sortOrder: Number(e.target.value) });
                setCreateError("");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={createBusy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-xs transition shadow-sm"
          >
            {createBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save Category</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Categories List */}
      <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">
            Active Categories ({initialCategories.length})
          </h2>
          <span className="text-xs text-zinc-400">Drag or use arrows to sort storefront layout</span>
        </div>

        {initialCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-900">No categories created</p>
            <p className="text-xs text-zinc-500 mt-1">
              Add your first category on the left to start organizing your catalog.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {initialCategories.map((cat, index) => {
              const prodCount = cat.products?.[0]?.count ?? 0;
              return (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-50/50 transition gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 truncate">{cat.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                        {prodCount} {prodCount === 1 ? "product" : "products"}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        order: {cat.sort_order}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      /category/{cat.slug}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        disabled={index === 0 || reorderBusy}
                        onClick={() => handleMove(index, "up")}
                        aria-label={`Move category ${cat.name} up`}
                        title="Move up"
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === initialCategories.length - 1 || reorderBusy}
                        onClick={() => handleMove(index, "down")}
                        aria-label={`Move category ${cat.name} down`}
                        title="Move down"
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 transition border-l border-zinc-200"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      aria-label={`Edit category ${cat.name}`}
                      title="Edit category"
                      className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(cat)}
                      aria-label={`Delete category ${cat.name}`}
                      title="Delete category"
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-category-modal-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 id="edit-category-modal-title" className="text-base font-bold text-zinc-900">
                Edit Category: {editingCategory.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                aria-label="Close edit category dialog"
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-category-name"
                  className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-category-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  aria-required="true"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category-slug"
                  className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1"
                >
                  Slug
                </label>
                <input
                  id="edit-category-slug"
                  type="text"
                  value={editDraft.slug}
                  onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category-description"
                  className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1"
                >
                  Description
                </label>
                <textarea
                  id="edit-category-description"
                  rows={2}
                  maxLength={1000}
                  value={editDraft.description}
                  onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category-sort-order"
                  className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1"
                >
                  Display Order
                </label>
                <input
                  id="edit-category-sort-order"
                  type="number"
                  value={editDraft.sortOrder}
                  onChange={(e) => setEditDraft({ ...editDraft, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={editBusy}
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editBusy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                >
                  {editBusy ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-modal-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 id="delete-category-modal-title" className="text-base font-bold text-zinc-900">
                  Delete Category
                </h3>
                <p className="text-xs text-zinc-500">Confirm removal of category</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-900">{categoryToDelete.name}</strong>?
              Any products currently belonging to this category will automatically become{" "}
              <span className="font-semibold text-zinc-900">Uncategorized</span>. Your products will{" "}
              <span className="font-semibold text-emerald-700">NOT</span> be deleted.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteError("");
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
