import { productSchema } from "../../lib/validations/catalog.ts";

export interface ServiceContext {
  supabase: any;
  shopId: string;
  shopSlug?: string;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseFormData(data: FormData | Record<string, any>) {
  if (data instanceof FormData) {
    const rawImages = data.getAll("images") as string[];
    const images = rawImages.length > 0 ? rawImages.filter(Boolean) : undefined;
    const compareAtRaw = data.get("compareAtPrice");
    const categoryRaw = data.get("categoryId") as string;
    const descRaw = data.get("description") as string;
    const skuRaw = data.get("sku") as string;
    const slugRaw = data.get("slug") as string;

    return {
      name: (data.get("name") as string) || "",
      slug: slugRaw || undefined,
      description: descRaw === "" ? null : descRaw,
      sku: skuRaw === "" ? null : skuRaw,
      price: data.get("price"),
      compareAtPrice: compareAtRaw ? Number(compareAtRaw) : null,
      stockQuantity: data.get("stockQuantity"),
      categoryId: categoryRaw === "" ? null : categoryRaw,
      status: (data.get("status") as any) || "active",
      imageUrl: (data.get("imageUrl") as string) || "",
      images,
    };
  }

  return {
    ...data,
    categoryId: data.categoryId === "" ? null : data.categoryId,
    description: data.description === "" ? null : data.description,
    sku: data.sku === "" ? null : data.sku,
  };
}

export async function createProductService(
  ctx: ServiceContext,
  formData: FormData | Record<string, any>
) {
  const { supabase, shopId } = ctx;
  const raw = parseFormData(formData);

  const generatedSlug = generateSlug(raw.slug || raw.name || "");
  const validated = productSchema.safeParse({
    ...raw,
    slug: generatedSlug,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Cross-shop category verification
  if (validated.data.categoryId) {
    const { data: category, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", validated.data.categoryId)
      .eq("shop_id", shopId)
      .single();

    if (catErr || !category) {
      return { error: "Selected category does not exist or does not belong to your shop." };
    }
  }

  const { data: newProduct, error } = await supabase
    .from("products")
    .insert({
      shop_id: shopId,
      category_id: validated.data.categoryId || null,
      name: validated.data.name,
      slug: validated.data.slug || generatedSlug,
      description: validated.data.description || null,
      sku: validated.data.sku || null,
      price: validated.data.price,
      compare_at_price: validated.data.compareAtPrice ?? null,
      stock_quantity: validated.data.stockQuantity,
      status: validated.data.status,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" || error.message?.includes("slug")) {
      return { error: "A product with this slug already exists in your shop." };
    }
    return { error: error.message };
  }

  // Collect images to insert
  const imagesToInsert: string[] = [];
  if (validated.data.images && validated.data.images.length > 0) {
    imagesToInsert.push(...validated.data.images.filter(Boolean));
  } else if (validated.data.imageUrl) {
    imagesToInsert.push(validated.data.imageUrl);
  }

  const imageErrors: string[] = [];
  if (imagesToInsert.length > 0) {
    for (let i = 0; i < imagesToInsert.length; i++) {
      const imgPath = imagesToInsert[i];
      // Conforms strictly to SQL schema: sort_order only
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: newProduct.id,
        shop_id: shopId,
        storage_path: imgPath,
        sort_order: i,
      });
      if (imgErr) {
        imageErrors.push(imgErr.message || `Image #${i + 1} insert failed`);
      }
    }
  }

  if (imageErrors.length > 0) {
    return {
      error: `Product created, but image attachment failed: ${imageErrors.join("; ")}`,
      productId: newProduct.id,
      partialSuccess: true,
    };
  }

  return { success: true, productId: newProduct.id };
}

export async function updateProductService(
  ctx: ServiceContext,
  productId: string,
  formData: FormData | Record<string, any>
) {
  const { supabase, shopId } = ctx;

  // Verify ownership of the product
  const { data: existing, error: existErr } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .single();

  if (existErr || !existing) {
    return { error: "Product not found in your shop." };
  }

  const raw = parseFormData(formData);
  const slug = raw.slug ? generateSlug(raw.slug) : existing.slug;

  const validated = productSchema.safeParse({
    ...raw,
    slug,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Cross-shop category verification
  if (validated.data.categoryId) {
    const { data: category, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", validated.data.categoryId)
      .eq("shop_id", shopId)
      .single();

    if (catErr || !category) {
      return { error: "Selected category does not exist or does not belong to your shop." };
    }
  }

  const { error: updateErr } = await supabase
    .from("products")
    .update({
      name: validated.data.name,
      slug: validated.data.slug || slug,
      description: validated.data.description || null,
      sku: validated.data.sku || null,
      price: validated.data.price,
      compare_at_price: validated.data.compareAtPrice ?? null,
      stock_quantity: validated.data.stockQuantity,
      category_id: validated.data.categoryId || null,
      status: validated.data.status,
    })
    .eq("id", productId)
    .eq("shop_id", shopId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Handle images if provided
  const imagesToSave: string[] = [];
  if (validated.data.images && validated.data.images.length > 0) {
    imagesToSave.push(...validated.data.images.filter(Boolean));
  } else if (validated.data.imageUrl) {
    imagesToSave.push(validated.data.imageUrl);
  }

  // Safe multi-step gallery replacement with verified cleanup and rollback
  if (imagesToSave.length > 0 || raw.imageUrl !== undefined || raw.images !== undefined) {
    // 1. Fetch existing image IDs before modifying
    const { data: oldImages, error: readOldErr } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("shop_id", shopId);

    if (readOldErr) {
      return { error: `Failed to inspect existing gallery: ${readOldErr.message}. Update aborted.` };
    }

    const oldImageIds: string[] = (oldImages || []).map((img: any) => img.id);

    // 2. Insert new image rows first
    const newlyInsertedIds: string[] = [];
    let insertFailed = false;
    let insertErrorMsg = "";

    for (let i = 0; i < imagesToSave.length; i++) {
      const { data: insertedImg, error: imgErr } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          shop_id: shopId,
          storage_path: imagesToSave[i],
          sort_order: i,
        })
        .select("id")
        .single();

      if (imgErr) {
        insertFailed = true;
        insertErrorMsg = imgErr.message || `Failed to insert image #${i + 1}`;
        break;
      }

      if (insertedImg?.id) {
        newlyInsertedIds.push(insertedImg.id);
      }
    }

    // 3. Rollback newly inserted images if any insertion failed
    if (insertFailed) {
      const rollbackFailures: string[] = [];
      for (const newId of newlyInsertedIds) {
        const { error: rollErr } = await supabase
          .from("product_images")
          .delete()
          .eq("id", newId)
          .eq("shop_id", shopId);

        if (rollErr) {
          rollbackFailures.push(rollErr.message);
        }
      }

      if (rollbackFailures.length > 0) {
        return {
          error: `Failed to update product gallery: ${insertErrorMsg}. Rollback incomplete: ${rollbackFailures.join("; ")}. Please verify gallery photos.`,
        };
      }

      return {
        error: `Failed to update product gallery: ${insertErrorMsg}. Existing gallery was preserved.`,
      };
    }

    // 4. Delete superseded old image records and verify cleanup
    const cleanupFailures: string[] = [];
    for (const oldId of oldImageIds) {
      const { error: cleanErr } = await supabase
        .from("product_images")
        .delete()
        .eq("id", oldId)
        .eq("shop_id", shopId);

      if (cleanErr) {
        cleanupFailures.push(cleanErr.message);
      }
    }

    if (cleanupFailures.length > 0) {
      return {
        error: `New gallery photos saved, but old photo cleanup failed: ${cleanupFailures.join("; ")}.`,
      };
    }
  }

  return { success: true };
}

export async function archiveProductService(ctx: ServiceContext, productId: string) {
  const { supabase, shopId } = ctx;

  const { error } = await supabase
    .from("products")
    .update({ status: "draft" })
    .eq("id", productId)
    .eq("shop_id", shopId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProductService(ctx: ServiceContext, productId: string) {
  const { supabase, shopId } = ctx;

  // Verify ownership
  const { data: existing, error: existErr } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .eq("shop_id", shopId)
    .single();

  if (existErr || !existing) {
    return { error: "Product not found or already deleted." };
  }

  // Delete product record FIRST. If this fails, image rows are never lost!
  const { error: deleteErr } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("shop_id", shopId);

  if (deleteErr) {
    return {
      error: `Failed to delete product: ${deleteErr.message}. Associated images were preserved.`,
    };
  }

  // Clean up associated images and verify cleanup
  const { error: imgDelErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .eq("shop_id", shopId);

  if (imgDelErr) {
    return {
      error: `Product deleted, but associated images cleanup failed: ${imgDelErr.message}.`,
      deletedName: existing.name,
    };
  }

  return { success: true, deletedName: existing.name };
}
