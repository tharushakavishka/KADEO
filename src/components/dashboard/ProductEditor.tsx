"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Star,
  Archive,
  Loader2,
  Palette,
  Ruler,
  X,
} from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  archiveProductAction,
  deleteProductAction,
} from "@/features/products/actions";
import {
  parseProductDescription,
  serializeProductDescription,
  ProductColorVariant,
} from "@/lib/product-variants";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  sku?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  stockQuantity: number | string;
  categoryId?: string | null;
  status: "active" | "draft" | "out_of_stock";
  imageUrl?: string;
  images?: string[];
}

interface ProductEditorProps {
  mode: "create" | "edit";
  initialProduct?: ProductFormData;
  categories: CategoryOption[];
}

export function ProductEditor({
  mode,
  initialProduct,
  categories,
}: ProductEditorProps) {
  const router = useRouter();

  // Parse existing variants from description if present
  const initialParsed = parseProductDescription(initialProduct?.description);

  // Initialize draft values
  const [draft, setDraft] = useState<ProductFormData>({
    id: initialProduct?.id,
    name: initialProduct?.name || "",
    slug: initialProduct?.slug || "",
    description: initialParsed.cleanDescription || initialProduct?.description || "",
    sku: initialProduct?.sku || "",
    price: initialProduct?.price !== undefined ? initialProduct.price : "",
    compareAtPrice:
      initialProduct?.compareAtPrice !== undefined && initialProduct?.compareAtPrice !== null
        ? initialProduct.compareAtPrice
        : "",
    stockQuantity: initialProduct?.stockQuantity !== undefined ? initialProduct.stockQuantity : 10,
    categoryId: initialProduct?.categoryId || "",
    status: initialProduct?.status || "active",
    imageUrl: initialProduct?.imageUrl || "",
    images: initialProduct?.images || (initialProduct?.imageUrl ? [initialProduct.imageUrl] : []),
  });

  // Variant States (Optional Color & Size options)
  const [enableColors, setEnableColors] = useState<boolean>(
    Boolean(initialParsed.variants?.colors && initialParsed.variants.colors.length > 0)
  );
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>(
    initialParsed.variants?.colors || []
  );
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#00A859");

  const [enableSizes, setEnableSizes] = useState<boolean>(
    Boolean(initialParsed.variants?.sizes && initialParsed.variants.sizes.length > 0)
  );
  const [sizeVariants, setSizeVariants] = useState<string[]>(
    initialParsed.variants?.sizes || []
  );
  const [newSizeInput, setNewSizeInput] = useState("");

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [partialCreatedId, setPartialCreatedId] = useState<string | null>(null);

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Handle image upload through /api/store-images
  async function handleImageUpload(file?: File) {
    if (!file) return;
    setUploadBusy(true);
    setError("");
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

      const newUrl = result.url;
      setDraft((prev) => {
        const currentImages = prev.images || [];
        const nextImages = [...currentImages, newUrl];
        return {
          ...prev,
          images: nextImages,
          imageUrl: nextImages[0] || "",
        };
      });
      setSuccessMessage("Image uploaded successfully.");
    } catch (e: any) {
      setError(e.message || "Failed to upload image.");
    } finally {
      setUploadBusy(false);
    }
  }

  function handleAddImageUrl() {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    const isRelative = trimmed.startsWith("/");
    if (!isRelative) {
      try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          setError("Image URL must use http or https.");
          return;
        }
      } catch {
        setError("Please enter a valid HTTP/HTTPS image URL or uploaded path.");
        return;
      }
    }

    setDraft((prev) => {
      const currentImages = prev.images || [];
      if (currentImages.includes(trimmed)) return prev;
      const nextImages = [...currentImages, trimmed];
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextImages[0] || "",
      };
    });
    setImageUrlInput("");
    setError("");
  }

  function handleRemoveImage(index: number) {
    setDraft((prev) => {
      const currentImages = prev.images || [];
      const nextImages = currentImages.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextImages[0] || "",
      };
    });
  }

  function handleMoveImage(index: number, direction: "left" | "right") {
    setDraft((prev) => {
      const current = [...(prev.images || [])];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return prev;
      const temp = current[index];
      current[index] = current[targetIndex];
      current[targetIndex] = temp;
      return {
        ...prev,
        images: current,
        imageUrl: current[0] || "",
      };
    });
  }

  function handleAddColor() {
    const trimmed = newColorName.trim();
    if (!trimmed) return;
    if (colorVariants.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("This color name already exists.");
      return;
    }
    setColorVariants([...colorVariants, { name: trimmed, hex: newColorHex }]);
    setNewColorName("");
    setError("");
  }

  function handleRemoveColor(index: number) {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  }

  function handleAddSize() {
    const trimmed = newSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (sizeVariants.includes(trimmed)) {
      setError("This size already exists.");
      return;
    }
    setSizeVariants([...sizeVariants, trimmed]);
    setNewSizeInput("");
    setError("");
  }

  function handleRemoveSize(index: number) {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMessage("");

    try {
      // Validate client fields
      if (!draft.name || draft.name.trim().length < 2) {
        setError("Product name must be at least 2 characters.");
        setBusy(false);
        return;
      }

      const numPrice = Number(draft.price);
      if (isNaN(numPrice) || numPrice < 0) {
        setError("Price must be a valid positive number.");
        setBusy(false);
        return;
      }

      const numStock = Number(draft.stockQuantity);
      if (isNaN(numStock) || numStock < 0) {
        setError("Stock quantity cannot be negative.");
        setBusy(false);
        return;
      }

      // Automatically incorporate any pending image URL in the input field
      let updatedImages = [...(draft.images || [])];
      const pendingUrl = imageUrlInput.trim();
      if (pendingUrl) {
        const isRel = pendingUrl.startsWith("/");
        let valid = false;
        if (isRel) {
          valid = true;
        } else {
          try {
            const u = new URL(pendingUrl);
            if (u.protocol === "https:" || u.protocol === "http:") valid = true;
          } catch {}
        }
        if (valid && !updatedImages.includes(pendingUrl)) {
          updatedImages.push(pendingUrl);
        }
      }

      // Serialize optional variants with clean description
      const variantsConfig = {
        colors: enableColors && colorVariants.length > 0 ? colorVariants : undefined,
        sizes: enableSizes && sizeVariants.length > 0 ? sizeVariants : undefined,
      };
      const finalDescription = serializeProductDescription(
        draft.description || "",
        variantsConfig
      );

      const payload = {
        name: draft.name.trim(),
        slug: draft.slug?.trim() || undefined,
        description: finalDescription,
        sku: draft.sku?.trim() || "",
        price: numPrice,
        compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
        stockQuantity: Math.floor(numStock),
        categoryId: draft.categoryId || null,
        status: draft.status,
        imageUrl: updatedImages[0] || draft.imageUrl || "",
        images: updatedImages,
      };

      if (mode === "create") {
        const res = await createProductAction(payload);
        if (res?.error) {
          setError(res.error);
          if (res.partialSuccess && res.productId) {
            setPartialCreatedId(res.productId);
          }
          setBusy(false);
          return;
        }
      } else {
        if (!initialProduct?.id) throw new Error("Missing product ID");
        const res = await updateProductAction(initialProduct.id, payload);
        if (res?.error) {
          setError(res.error);
          setBusy(false);
          return;
        }
        setSuccessMessage("Product updated successfully.");
        setDraft((prev) => ({
          ...prev,
          images: updatedImages,
          imageUrl: updatedImages[0] || "",
        }));
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!initialProduct?.id) return;
    setBusy(true);
    setError("");
    try {
      const res = await archiveProductAction(initialProduct.id);
      if (res?.error) {
        setError(res.error);
      } else {
        setDraft({ ...draft, status: "draft" });
        setSuccessMessage("Product archived and hidden from storefront.");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Could not archive product.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!initialProduct?.id) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const result = await deleteProductAction(initialProduct.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setShowDeleteModal(false);
        router.push("/dashboard/products");
        router.refresh();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete product.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
        {mode === "edit" && (
          <div className="flex items-center gap-2">
            {draft.status !== "draft" && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                title="Set status to Draft (hide from store)"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">
          {mode === "create" ? "Add New Product" : `Edit Product: ${initialProduct?.name || draft.name}`}
        </h1>
        <p className="text-xs text-zinc-500 mb-6">
          {mode === "create"
            ? "Provide your product details, pricing, inventory, photos, and optional variants."
            : "Update your product details, pricing, stock levels, category, images, and variants."}
        </p>

        {/* Global Feedback Banners */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Submission Error</p>
              <p className="mt-0.5">{error}</p>
              {partialCreatedId && (
                <div className="mt-2.5 flex items-center gap-2">
                  <Link
                    href={`/dashboard/products/${partialCreatedId}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900 text-white text-xs font-semibold hover:bg-red-800 transition"
                  >
                    <span>Open Existing Product in Editor</span>
                  </Link>
                  <span className="text-[11px] text-red-700">(Avoids duplicate product creation)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Success</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="product-name"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={200}
                aria-required="true"
                value={draft.name}
                onChange={(e) => {
                  setDraft({ ...draft, name: e.target.value });
                  setError("");
                }}
                placeholder="e.g. Hair Growth Serum 50ml"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* Custom Slug */}
            <div>
              <label
                htmlFor="product-slug"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Slug (Optional)
              </label>
              <input
                id="product-slug"
                type="text"
                name="slug"
                value={draft.slug || ""}
                onChange={(e) => {
                  setDraft({ ...draft, slug: e.target.value });
                  setError("");
                }}
                placeholder="hair-growth-serum-50ml"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label
                htmlFor="product-category"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Category
              </label>
              <select
                id="product-category"
                name="categoryId"
                value={draft.categoryId || ""}
                onChange={(e) => {
                  setDraft({ ...draft, categoryId: e.target.value });
                  setError("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Price (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                aria-required="true"
                value={draft.price}
                onChange={(e) => {
                  setDraft({ ...draft, price: e.target.value });
                  setError("");
                }}
                placeholder="3750.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* Compare-at Price */}
            <div>
              <label
                htmlFor="product-compare-at-price"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Compare-at Price (LKR, Optional)
              </label>
              <input
                id="product-compare-at-price"
                type="number"
                name="compareAtPrice"
                step="0.01"
                min="0"
                value={draft.compareAtPrice ?? ""}
                onChange={(e) => {
                  setDraft({ ...draft, compareAtPrice: e.target.value });
                  setError("");
                }}
                placeholder="4200.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label
                htmlFor="product-stock"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                name="stockQuantity"
                required
                min={0}
                aria-required="true"
                value={draft.stockQuantity}
                onChange={(e) => {
                  setDraft({ ...draft, stockQuantity: e.target.value });
                  setError("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* SKU */}
            <div>
              <label
                htmlFor="product-sku"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                SKU (Stock Keeping Unit)
              </label>
              <input
                id="product-sku"
                type="text"
                name="sku"
                value={draft.sku || ""}
                onChange={(e) => {
                  setDraft({ ...draft, sku: e.target.value });
                  setError("");
                }}
                placeholder="e.g. SRM-001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label
                htmlFor="product-status"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Catalog Status
              </label>
              <select
                id="product-status"
                name="status"
                value={draft.status}
                onChange={(e) => {
                  setDraft({ ...draft, status: e.target.value as any });
                  setError("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              >
                <option value="active">Active (Visible in storefront and ready to sell)</option>
                <option value="draft">Draft (Hidden from storefront)</option>
                <option value="out_of_stock">Out of Stock (Shows sold out badge)</option>
              </select>
            </div>

            {/* Image Gallery & Upload Section */}
            <div className="sm:col-span-2 space-y-4 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Product Images & Gallery (Multiple Photos)
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Upload multiple photos or add image links. The first image is the primary cover displayed in catalogs.
                  </p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:border-zinc-400 transition bg-zinc-50/50">
                  <input
                    id="product-file-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy || uploadBusy}
                    onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                    className="sr-only"
                  />
                  <label
                    htmlFor="product-file-upload"
                    className="cursor-pointer inline-flex flex-col items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    {uploadBusy ? (
                      <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-zinc-500" />
                    )}
                    <span className="font-semibold text-zinc-900">
                      {uploadBusy ? "Uploading photo..." : "Upload Photo from Computer"}
                    </span>
                    <span className="text-[10px] text-zinc-400">PNG, JPEG, WebP up to 4 MB</span>
                  </label>
                </div>

                <div className="flex flex-col justify-between p-3 border border-zinc-200 rounded-xl bg-white space-y-2">
                  <label
                    htmlFor="product-image-url-input"
                    className="block text-[11px] font-semibold text-zinc-600"
                  >
                    Or Add Image via HTTPS / Local Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="product-image-url-input"
                      type="url"
                      placeholder="https://... or /images/..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white disabled:opacity-40 hover:bg-zinc-800 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails List */}
              {draft.images && draft.images.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Gallery photos ({draft.images.length}) — click arrows to reorder or trash to remove:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {draft.images.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="relative group border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 flex flex-col"
                      >
                        <div className="aspect-square relative w-full overflow-hidden flex items-center justify-center bg-zinc-100">
                          <img
                            src={imgUrl}
                            alt={`Product gallery photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-900/80 text-white text-[10px] font-semibold flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-white text-white" />
                              Cover
                            </span>
                          )}
                        </div>

                        <div className="p-1.5 bg-white border-t border-zinc-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, "left")}
                              aria-label={`Move image ${idx + 1} left`}
                              className="p-1 rounded text-zinc-500 hover:text-zinc-900 disabled:opacity-30 hover:bg-zinc-100"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (draft.images?.length || 1) - 1}
                              onClick={() => handleMoveImage(idx, "right")}
                              aria-label={`Move image ${idx + 1} right`}
                              className="p-1 rounded text-zinc-500 hover:text-zinc-900 disabled:opacity-30 hover:bg-zinc-100"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            aria-label={`Remove image ${idx + 1}`}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-zinc-200 rounded-xl text-center bg-zinc-50/50">
                  <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-500">No images added yet.</p>
                </div>
              )}
            </div>

            {/* Optional Color & Variant Selection Section */}
            <div className="sm:col-span-2 pt-4 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                      Color / Variant Options (Optional)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Enable if this product comes in different colors, shades, or variants (e.g. Original, Green Tea, Lavender).
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableColors}
                    onChange={(e) => setEnableColors(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {enableColors && (
                <div className="bg-zinc-50/70 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white"
                      title="Choose color shade"
                    />
                    <input
                      type="text"
                      placeholder="Variant / Color Name (e.g. Rose, Lavender, Green Tea)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      disabled={!newColorName.trim()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition"
                    >
                      + Add Color
                    </button>
                  </div>

                  {colorVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {colorVariants.map((c, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-800 shadow-2xs"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex || "#e5e7eb" }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(i)}
                            className="text-zinc-400 hover:text-red-500 ml-1"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">No color variants added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Optional Clothing Sizes Section */}
            <div className="sm:col-span-2 pt-4 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                      Sizes (Clothing & Apparel, Optional)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Enable if you sell clothes or sized products (e.g. XS, S, M, L, XL, XXL or shoe sizes).
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSizes}
                    onChange={(e) => setEnableSizes(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {enableSizes && (
                <div className="bg-zinc-50/70 border border-zinc-200 rounded-xl p-4 space-y-3">
                  {/* Preset Quick Add Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-zinc-500 mr-1">Quick Add:</span>
                    {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!sizeVariants.includes(preset)) {
                            setSizeVariants([...sizeVariants, preset]);
                          }
                        }}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition ${
                          sizeVariants.includes(preset)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Custom Size (e.g. 32, 34, 38, or 6-12M)"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      disabled={!newSizeInput.trim()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition"
                    >
                      + Add Size
                    </button>
                  </div>

                  {sizeVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {sizeVariants.map((s, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-800 shadow-2xs"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(i)}
                            className="text-zinc-400 hover:text-red-500 ml-1"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">No sizes added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2 pt-2 border-t border-zinc-100">
              <label
                htmlFor="product-description"
                className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
              >
                Product Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={4}
                maxLength={5000}
                value={draft.description || ""}
                onChange={(e) => {
                  setDraft({ ...draft, description: e.target.value });
                  setError("");
                }}
                placeholder="Product highlights, benefits, formula, fabric details, sizing or care instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/products"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={busy || uploadBusy}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            >
              {busy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{mode === "create" ? "Save Product" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-bold text-zinc-900">
                  Delete Product
                </h3>
                <p className="text-xs text-zinc-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-zinc-900">{initialProduct?.name || draft.name}</strong>?
              This product will be removed from your catalog and storefront. Existing customer orders
              and sales history will safely retain their historical item snapshots.
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
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold transition"
              >
                {deleteBusy ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
