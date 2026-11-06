"use client";

import { ProductEditor, ProductFormData, CategoryOption } from "./ProductEditor";

export function ProductContentEditor({
  product,
  categories = [],
}: {
  product: ProductFormData;
  categories?: CategoryOption[];
}) {
  return (
    <ProductEditor
      mode="edit"
      initialProduct={product}
      categories={categories}
    />
  );
}
