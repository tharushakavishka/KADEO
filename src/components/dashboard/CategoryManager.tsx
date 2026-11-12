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
  Upload,
  Image as ImageIcon,
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
  image_url?: string | null;
  imageUrl?: string | null;
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
    imageUrl: "",
    sortOrder: 0,
  });
  const [createImageUrlInput, setCreateImageUrlInput] = useState("");
  const [createUploadBusy, setCreateUploadBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: 0,
  });
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editUploadBusy, setEditUploadBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Reordering busy state
  const [reorderBusy, setReorderBusy] = useState(false);

  // File Upload Helper
  async function handleUpload(file: File | undefined, isEdit: boolean) {
    if (!file) return;
    if (isEdit) {
      setEditUploadBusy(true);
      setEditError("");
    } else {
      setCreateUploadBusy(true);
      setCreateError("");
    }

    try {
      if (file.size > 4 * 1024 * 1024) {
        throw new Error("Image must be smaller than 4 MB.");
      }
      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (!allowed.includes(file.type)) {
        throw new Error("Please upload a PNG, JPEG, or WebP image.");
      }

      const form = new FormData();
      form.set("image", file);
      const r = await fetch("/api/store-images", {
        method: "POST",
        body: form,
      });
      const result = await r.json();
      if (!r.ok) {
        throw new Error(result.error || "Image upload failed.");
      }

      if (isEdit) {
        setEditDraft((prev) => ({ ...prev, imageUrl: result.url }));
        setEditImageUrlInput("");
      } else {
        setCreateDraft((prev) => ({ ...prev, imageUrl: result.url }));
        setCreateImageUrlInput("");
      }
    } catch (e: any) {
      if (isEdit) {
        setEditError(e.message || "Failed to upload image.");
      } else {
        setCreateError(e.message || "Failed to upload image.");
      }
    } finally {
      if (isEdit) {
        setEditUploadBusy(false);
      } else {
        setCreateUploadBusy(false);
      }
    }
  }

  // Handle URL Link addition
  function handleAddImageUrl(urlStr: string, isEdit: boolean) {
    const trimmed = urlStr.trim();
    if (!trimmed) return;
    const isRel = trimmed.startsWith("/");
    if (!isRel) {
      try {
        const u = new URL(trimmed);
        if (u.protocol !== "https:" && u.protocol !== "http:") {
          const err = "Image URL must use http or https.";
          if (isEdit) setEditError(err); else setCreateError(err);
          return;
        }
      } catch {
        const err = "Please enter a valid HTTP/HTTPS image URL or uploaded path.";
        if (isEdit) setEditError(err); else setCreateError(err);
        return;
      }
    }

    if (isEdit) {
      setEditDraft((prev) => ({ ...prev, imageUrl: trimmed }));
      setEditImageUrlInput("");
      setEditError("");
    } else {
      setCreateDraft((prev) => ({ ...prev, imageUrl: trimmed }));
      setCreateImageUrlInput("");
      setCreateError("");
    }
  }

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

      let finalImg = createDraft.imageUrl;
      if (!finalImg && createImageUrlInput.trim()) {
        finalImg = createImageUrlInput.trim();
      }

      const res = await createCategoryAction({
        name: createDraft.name.trim(),
        slug: createDraft.slug.trim() || undefined,
        description: createDraft.description.trim() || null,
        imageUrl: finalImg || null,
        sortOrder: Number(createDraft.sortOrder) || 0,
      });

      if (res.error) {
        setCreateError(res.error);
      } else {
        setCreateSuccess("Category created successfully!");
        setCreateDraft({ name: "", slug: "", description: "", imageUrl: "", sortOrder: 0 });
        setCreateImageUrlInput("");
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
      imageUrl: cat.image_url || cat.imageUrl || "",
      sortOrder: cat.sort_order,
    });
    setEditImageUrlInput("");
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

      let finalImg = editDraft.imageUrl;
      if (!finalImg && editImageUrlInput.trim()) {
        finalImg = editImageUrlInput.trim();
      }

      const res = await updateCategoryAction(editingCategory.id, {
        name: editDraft.name.trim(),
        slug: editDraft.slug.trim() || undefined,
        description: editDraft.description.trim() || null,
        imageUrl: finalImg || null,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Create Category Form */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Add Category</h2>
        </div>

        {createError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
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
            className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2"
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
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
              placeholder="e.g. Hair Care, Skincare..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-slug"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
              placeholder="hair-care"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
            />
          </div>

          {/* Category Image Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Image (Optional)
            </label>
            {createDraft.imageUrl ? (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    src={createDraft.imageUrl}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Image Attached</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{createDraft.imageUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateDraft({ ...createDraft, imageUrl: "" });
                    setCreateImageUrlInput("");
                  }}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="create-category-image-upload"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={createUploadBusy}
                    onChange={(e) => void handleUpload(e.target.files?.[0], false)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="create-category-image-upload"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
                  >
                    {createUploadBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{createUploadBusy ? "Uploading..." : "Upload Image"}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste HTTPS image URL..."
                    value={createImageUrlInput}
                    onChange={(e) => setCreateImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl(createImageUrlInput, false);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#00c982] transition"
                  />
                  <button
                    type="button"
                    disabled={!createImageUrlInput.trim()}
                    onClick={() => handleAddImageUrl(createImageUrlInput, false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="new-category-description"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-sort-order"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
            />
          </div>

          <button
            type="submit"
            disabled={createBusy || createUploadBusy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#064e3b] hover:bg-[#032e23] disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 cursor-pointer"
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
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            Active Categories ({initialCategories.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">Drag or use arrows to sort storefront layout</span>
        </div>

        {initialCategories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#f0fdf4] text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <Layers className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900">No categories created</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your first category on the left to start organizing your catalog into clean sections.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {initialCategories.map((cat, index) => {
              const prodCount = cat.products?.[0]?.count ?? 0;
              const catImg = cat.image_url || cat.imageUrl;
              return (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#fcfdfd] transition gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Category Image or Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                      {catImg ? (
                        <img
                          src={catImg}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate">{cat.name}</h3>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] font-bold shrink-0">
                          {prodCount} {prodCount === 1 ? "product" : "products"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          order: {cat.sort_order}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        /category/{cat.slug}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        disabled={index === 0 || reorderBusy}
                        onClick={() => handleMove(index, "up")}
                        aria-label={`Move category ${cat.name} up`}
                        title="Move up"
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === initialCategories.length - 1 || reorderBusy}
                        onClick={() => handleMove(index, "down")}
                        aria-label={`Move category ${cat.name} down`}
                        title="Move down"
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition border-l border-slate-200"
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
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(cat)}
                      aria-label={`Delete category ${cat.name}`}
                      title="Delete category"
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition border border-slate-200"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="edit-category-modal-title" className="text-base font-extrabold text-slate-900">
                Edit Category: {editingCategory.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                aria-label="Close edit category dialog"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-category-name"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-category-name"
                  type="text"
                  name="name"
                  required
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category-slug"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Slug
                </label>
                <input
                  id="edit-category-slug"
                  type="text"
                  name="slug"
                  value={editDraft.slug}
                  onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
                />
              </div>

              {/* Edit Category Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Image (Optional)
                </label>
                {editDraft.imageUrl ? (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={editDraft.imageUrl}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Image Attached</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{editDraft.imageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDraft({ ...editDraft, imageUrl: "" });
                        setEditImageUrlInput("");
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="edit-category-image-upload"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={editUploadBusy}
                        onChange={(e) => void handleUpload(e.target.files?.[0], true)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="edit-category-image-upload"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
                      >
                        {editUploadBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{editUploadBusy ? "Uploading..." : "Upload Image"}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Or paste HTTPS image URL..."
                        value={editImageUrlInput}
                        onChange={(e) => setEditImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl(editImageUrlInput, true);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#00c982] transition"
                      />
                      <button
                        type="button"
                        disabled={!editImageUrlInput.trim()}
                        onClick={() => handleAddImageUrl(editImageUrlInput, true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-category-description"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Description
                </label>
                <textarea
                  id="edit-category-description"
                  name="description"
                  rows={2}
                  value={editDraft.description}
                  onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category-sort-order"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Display Order
                </label>
                <input
                  id="edit-category-sort-order"
                  type="number"
                  name="sortOrder"
                  value={editDraft.sortOrder}
                  onChange={(e) => setEditDraft({ ...editDraft, sortOrder: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c982] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editBusy || editUploadBusy}
                  className="px-5 py-2.5 rounded-2xl bg-[#064e3b] hover:bg-[#032e23] disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  {editBusy ? "Saving..." : "Save Changes"}
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 id="delete-category-modal-title" className="text-base font-extrabold text-slate-900">
                Delete Category
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>{categoryToDelete.name}</strong>? Any products in this category will become uncategorized.
              </p>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
              >
                {deleteBusy ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
