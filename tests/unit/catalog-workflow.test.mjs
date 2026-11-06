import { test, describe } from "node:test";
import assert from "node:assert/strict";

// 1. Direct imports of production schemas
import {
  productSchema,
  categorySchema,
  imageSchema,
} from "../../src/lib/validations/catalog.ts";

// 2. Direct imports of production services
import {
  createProductService,
  updateProductService,
  archiveProductService,
  deleteProductService,
} from "../../src/features/products/service.ts";

import {
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  reorderCategoriesService,
} from "../../src/features/categories/service.ts";

/**
 * Creates an isolated in-memory test database harness and mock client.
 * Completely avoids touching real seller data or modifying kadeo-local-db.json on disk.
 */
function createMockClient(initialState = {}) {
  const store = {
    shops: [
      { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", owner_id: "user-alpha", slug: "shop-alpha" },
      { id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", owner_id: "user-beta", slug: "shop-beta" },
      ...(initialState.shops || []),
    ],
    categories: [
      { id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31", shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", name: "Alpha Linen", slug: "alpha-linen", sort_order: 1 },
      { id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42", shop_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", name: "Beta Silk", slug: "beta-silk", sort_order: 1 },
      ...(initialState.categories || []),
    ],
    products: [
      {
        id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        category_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31",
        name: "Linen Shirt Alpha",
        slug: "linen-shirt-alpha",
        sku: "AL-01",
        price: 5000,
        stock_quantity: 20,
        status: "active",
      },
      ...(initialState.products || []),
    ],
    product_images: [
      {
        id: "img-alpha-1",
        product_id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        storage_path: "/uploads/shirt-alpha.png",
        sort_order: 0,
      },
      ...(initialState.product_images || []),
    ],
    orders: [...(initialState.orders || [])],
    customers: [...(initialState.customers || [])],
  };

  // Hooks to simulate runtime errors for testing resilience
  let readImageError = null;
  let insertImageError = null;
  let insertImageCount = 0;
  let insertImageFailAfter = -1;
  let deleteProductError = null;
  let deleteImageError = null;

  const mock = {
    _store: store,
    setReadImageError(err) {
      readImageError = err;
    },
    setInsertImageError(err, failAfter = -1) {
      insertImageError = err;
      insertImageFailAfter = failAfter;
      insertImageCount = 0;
    },
    setDeleteProductError(err) {
      deleteProductError = err;
    },
    setDeleteImageError(err) {
      deleteImageError = err;
    },
    auth: {
      async getUser() {
        return { data: { user: { id: "user-alpha", email: "alpha@example.com" } } };
      },
    },
    from(table) {
      const filters = [];
      let orderCol = null;
      let orderAsc = true;
      let rangeFrom = undefined;
      let rangeTo = undefined;
      let isHead = false;
      let isCount = false;
      let isSingle = false;

      const builder = {
        select(cols = "*", opts) {
          if (opts?.count === "exact") isCount = true;
          if (opts?.head) isHead = true;
          return builder;
        },
        eq(col, val) {
          filters.push({ type: "eq", col, val });
          return builder;
        },
        or(filterStr) {
          filters.push({ type: "or", str: filterStr });
          return builder;
        },
        order(col, opts) {
          orderCol = col;
          orderAsc = opts?.ascending ?? true;
          return builder;
        },
        range(from, to) {
          rangeFrom = from;
          rangeTo = to;
          return builder;
        },
        single() {
          isSingle = true;
          return builder;
        },
        async then(resolve, reject) {
          try {
            if (table === "product_images" && readImageError) {
              return resolve({ data: null, error: { message: readImageError } });
            }

            let rows = [...(store[table] || [])];
            for (const f of filters) {
              if (f.type === "eq") {
                rows = rows.filter((r) => r[f.col] === f.val);
              } else if (f.type === "or") {
                const parts = f.str.split(",").map((s) => s.trim());
                rows = rows.filter((r) => {
                  return parts.some((p) => {
                    const segs = p.split(".");
                    if (segs.length >= 3) {
                      const col = segs[0];
                      const op = segs[1];
                      const val = segs.slice(2).join(".");
                      const rowVal = String(r[col] || "").toLowerCase();
                      if (op === "ilike" || op === "like") {
                        const clean = val.replace(/^%|%$/g, "").toLowerCase();
                        return rowVal.includes(clean);
                      }
                      if (op === "eq") return rowVal === val.toLowerCase();
                    }
                    return false;
                  });
                });
              }
            }

            if (orderCol) {
              rows.sort((a, b) => {
                if (a[orderCol] < b[orderCol]) return orderAsc ? -1 : 1;
                if (a[orderCol] > b[orderCol]) return orderAsc ? 1 : -1;
                return 0;
              });
            }

            const totalCount = rows.length;
            if (rangeFrom !== undefined && rangeTo !== undefined) {
              rows = rows.slice(rangeFrom, rangeTo + 1);
            }

            if (isHead) {
              return resolve({ count: totalCount, data: null, error: null });
            }
            if (isSingle) {
              return resolve({
                data: rows[0] || null,
                count: isCount ? totalCount : null,
                error: rows[0] ? null : { message: "Row not found" },
              });
            }
            return resolve({
              data: rows,
              count: isCount ? totalCount : null,
              error: null,
            });
          } catch (e) {
            resolve({ data: null, error: e });
          }
        },
        insert(recordOrRecords) {
          if (table === "product_images" && insertImageError) {
            insertImageCount++;
            if (insertImageFailAfter < 0 || insertImageCount > insertImageFailAfter) {
              return {
                select: () => ({
                  single: async () => ({ data: null, error: { message: insertImageError } }),
                  then: (res) => res({ data: null, error: { message: insertImageError } }),
                }),
                single: async () => ({ data: null, error: { message: insertImageError } }),
                then: (res) => res({ data: null, error: { message: insertImageError } }),
              };
            }
          }

          const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
          const inserted = [];
          for (const r of records) {
            const row = { id: r.id || "gen-" + Math.random().toString(36).slice(2, 9), ...r };
            if (!store[table]) store[table] = [];
            store[table].push(row);
            inserted.push(row);
          }
          return {
            select: () => ({
              single: async () => ({ data: inserted[0], error: null }),
              then: (res) => res({ data: inserted, error: null }),
            }),
            single: async () => ({ data: inserted[0], error: null }),
            then: (res) => res({ data: inserted, error: null }),
          };
        },
        update(updates) {
          return {
            eq(col, val) {
              filters.push({ type: "eq", col, val });
              return {
                eq(c2, v2) {
                  filters.push({ type: "eq", col: c2, val: v2 });
                  return this;
                },
                async then(res) {
                  let count = 0;
                  const tbl = store[table] || [];
                  for (let i = 0; i < tbl.length; i++) {
                    const match = filters.every((f) => tbl[i][f.col] === f.val);
                    if (match) {
                      tbl[i] = { ...tbl[i], ...updates };
                      count++;
                    }
                  }
                  res({ data: null, error: null, count });
                },
              };
            },
          };
        },
        delete() {
          return {
            eq(col, val) {
              filters.push({ type: "eq", col, val });
              return {
                eq(c2, v2) {
                  filters.push({ type: "eq", col: c2, val: v2 });
                  return this;
                },
                async then(res) {
                  if (table === "products" && deleteProductError) {
                    return res({ data: null, error: { message: deleteProductError } });
                  }
                  if (table === "product_images" && deleteImageError) {
                    return res({ data: null, error: { message: deleteImageError } });
                  }
                  const tbl = store[table] || [];
                  store[table] = tbl.filter((row) => {
                    const match = filters.every((f) => row[f.col] === f.val);
                    return !match;
                  });
                  res({ data: null, error: null });
                },
              };
            },
          };
        },
      };

      return builder;
    },
  };

  return mock;
}

describe("KADEO Production Catalog, Action & Database Suite", () => {
  describe("1. Schema Validations (Production Zod Schemas)", () => {
    test("productSchema rejects invalid payloads (<2 chars name, negative price/stock)", () => {
      const shortName = productSchema.safeParse({
        name: "X",
        price: 1500,
        stockQuantity: 10,
      });
      assert.equal(shortName.success, false);
      assert.match(shortName.error.issues[0].message, /at least 2 characters/i);

      const negativePrice = productSchema.safeParse({
        name: "Valid Shirt",
        price: -50,
        stockQuantity: 5,
      });
      assert.equal(negativePrice.success, false);

      const negativeStock = productSchema.safeParse({
        name: "Valid Shirt",
        price: 100,
        stockQuantity: -1,
      });
      assert.equal(negativeStock.success, false);
    });

    test("productSchema accepts complete product editing payload", () => {
      const valid = productSchema.safeParse({
        name: "Organic Flax Shirt",
        slug: "organic-flax-shirt",
        description: "Finest Sri Lankan linen",
        sku: "LIN-001",
        price: 5800,
        compareAtPrice: 6500,
        stockQuantity: 30,
        categoryId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31",
        status: "active",
        imageUrl: "https://example.com/cover.jpg",
        images: ["https://example.com/cover.jpg", "/uploads/detail.png"],
      });
      assert.equal(valid.success, true);
    });

    test("categorySchema validates category name and description length", () => {
      const invalid = categorySchema.safeParse({ name: " " });
      assert.equal(invalid.success, false);

      const valid = categorySchema.safeParse({
        name: "Men's Trousers",
        slug: "mens-trousers",
        description: "Casual fits",
        sortOrder: 2,
      });
      assert.equal(valid.success, true);
    });

    test("imageSchema enforces valid storage upload paths or HTTPS/HTTP URLs", () => {
      assert.equal(imageSchema.safeParse("/uploads/valid_photo-1.png").success, true);
      assert.equal(imageSchema.safeParse("https://images.unsplash.com/sample.jpg").success, true);
      assert.equal(imageSchema.safeParse("ftp://invalidsite.com/evil.png").success, false);
      assert.equal(imageSchema.safeParse("javascript:alert(1)").success, false);
    });
  });

  describe("2. Cross-Shop Ownership & Access Controls (Services)", () => {
    test("createProductService rejects category belonging to a different shop", async () => {
      const mockSupabase = createMockClient();
      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      // Attempt to assign d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42 (which belongs to shop-beta)
      const res = await createProductService(context, {
        name: "Cross Shop Linen Product",
        price: 4500,
        stockQuantity: 10,
        categoryId: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42",
      });

      assert.equal(res.success, undefined);
      assert.match(res.error, /does not exist or does not belong to your shop/i);
    });

    test("updateProductService rejects category belonging to a different shop", async () => {
      const mockSupabase = createMockClient();
      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await updateProductService(
        context,
        "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        {
          name: "Updated Name",
          price: 5200,
          stockQuantity: 15,
          categoryId: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42",
        }
      );

      assert.equal(res.success, undefined);
      assert.match(res.error, /does not exist or does not belong to your shop/i);
    });
  });

  describe("3. Truthful Image Handling, Rollback & Failure Recovery (Services)", () => {
    test("createProductService reports partialSuccess when image insertion fails", async () => {
      const mockSupabase = createMockClient();
      mockSupabase.setInsertImageError("Simulated Storage Error");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await createProductService(context, {
        name: "Faulty Upload Shirt",
        price: 3500,
        stockQuantity: 5,
        images: ["/uploads/photo1.png"],
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("image attachment failed"));
      assert.equal(res.partialSuccess, true);
      assert.ok(res.productId);
    });

    test("updateProductService truthfully aborts when inspecting existing gallery fails", async () => {
      const mockSupabase = createMockClient();
      mockSupabase.setReadImageError("Database connection lost");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await updateProductService(
        context,
        "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        {
          name: "Linen Shirt Alpha",
          price: 5000,
          stockQuantity: 20,
          images: ["/uploads/new-photo.png"],
        }
      );

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("Failed to inspect existing gallery"));
      assert.ok(res.error.includes("Update aborted"));

      // Existing image remains untouched
      const remainingImages = mockSupabase._store.product_images.filter(
        (img) => img.product_id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51"
      );
      assert.equal(remainingImages.length, 1);
    });

    test("updateProductService rolls back newly inserted images and preserves existing gallery on failure", async () => {
      const mockSupabase = createMockClient();
      assert.equal(mockSupabase._store.product_images.length, 1);

      mockSupabase.setInsertImageError("Simulated Network Timeout");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await updateProductService(
        context,
        "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        {
          name: "Linen Shirt Alpha",
          price: 5000,
          stockQuantity: 20,
          images: ["/uploads/new-attempt.png"],
        }
      );

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("Existing gallery was preserved"));

      // Existing gallery was NOT wiped
      const remainingImages = mockSupabase._store.product_images.filter(
        (img) => img.product_id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51"
      );
      assert.equal(remainingImages.length, 1);
      assert.equal(remainingImages[0].id, "img-alpha-1");
    });

    test("updateProductService truthfully reports incomplete rollback when cleanup of new images fails", async () => {
      const mockSupabase = createMockClient();
      // Allow 1st image to succeed, fail on 2nd image insert
      mockSupabase.setInsertImageError("Simulated Network Timeout", 1);
      // And when rolling back newly inserted image, deletion fails
      mockSupabase.setDeleteImageError("Delete permission denied");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await updateProductService(
        context,
        "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        {
          name: "Linen Shirt Alpha",
          price: 5000,
          stockQuantity: 20,
          images: ["/uploads/img-1.png", "/uploads/img-2.png"],
        }
      );

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("Rollback incomplete"));
      assert.ok(res.error.includes("Please verify gallery photos"));
    });

    test("updateProductService truthfully reports old photo cleanup failure", async () => {
      const mockSupabase = createMockClient();
      // Let insertion succeed, but fail old image cleanup
      mockSupabase.setDeleteImageError("Storage cleanup disk error");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await updateProductService(
        context,
        "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
        {
          name: "Linen Shirt Alpha",
          price: 5000,
          stockQuantity: 20,
          images: ["/uploads/fresh-photo.png"],
        }
      );

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("old photo cleanup failed"));
    });
  });

  describe("4. Product Deletion Safety & Reversible Archive (Services)", () => {
    test("deleteProductService preserves images if product deletion fails", async () => {
      const mockSupabase = createMockClient();
      mockSupabase.setDeleteProductError("Foreign Key Conflict Simulated");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await deleteProductService(context, "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("Associated images were preserved"));

      // Verify associated images still exist in DB
      const images = mockSupabase._store.product_images.filter(
        (img) => img.product_id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51"
      );
      assert.equal(images.length, 1);
    });

    test("deleteProductService truthfully reports if image cleanup fails after product deletion", async () => {
      const mockSupabase = createMockClient();
      mockSupabase.setDeleteImageError("Storage sync failed");

      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await deleteProductService(context, "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");

      assert.equal(res.success, undefined);
      assert.ok(res.error.includes("Product deleted, but associated images cleanup failed"));
      assert.equal(res.deletedName, "Linen Shirt Alpha");

      // Verify product was indeed removed
      const prod = mockSupabase._store.products.find((p) => p.id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");
      assert.equal(prod, undefined);
    });

    test("archiveProductService switches status to draft instead of deleting", async () => {
      const mockSupabase = createMockClient();
      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await archiveProductService(context, "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");
      assert.equal(res.success, true);

      const prod = mockSupabase._store.products.find((p) => p.id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");
      assert.equal(prod.status, "draft");
    });

    test("deleteCategoryService disassociates products to uncategorized (null) safely", async () => {
      const mockSupabase = createMockClient();
      const context = {
        supabase: mockSupabase,
        shopId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        shopSlug: "shop-alpha",
      };

      const res = await deleteCategoryService(context, "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31");
      assert.equal(res.success, true);

      const prod = mockSupabase._store.products.find((p) => p.id === "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");
      assert.equal(prod.category_id, null, "Product category_id must be disassociated to null");

      const cat = mockSupabase._store.categories.find((c) => c.id === "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31");
      assert.equal(cat, undefined, "Category must be deleted");
    });
  });

  describe("5. Query Builder Bounded Pagination & Text Search", () => {
    test("range(from, to) slices bounded rows while computing exact count", async () => {
      const mockSupabase = createMockClient({
        products: Array.from({ length: 25 }, (_, i) => ({
          id: `prod-${i + 1}`,
          shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          name: `Product ${i + 1}`,
          price: 1000 + i * 100,
          stock_quantity: 10,
          status: "active",
        })),
      });

      // Page 1: range(0, 9)
      const page1 = await mockSupabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("shop_id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        .range(0, 9);

      assert.equal(page1.count, 26); // 25 + 1 initial
      assert.equal(page1.data.length, 10);
      assert.equal(page1.data[0].id, "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51");

      // Page 2: range(10, 19)
      const page2 = await mockSupabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("shop_id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        .range(10, 19);

      assert.equal(page2.count, 26);
      assert.equal(page2.data.length, 10);
      assert.equal(page2.data[0].id, "prod-10");
    });

    test("head: true returns exact total count with data null", async () => {
      const mockSupabase = createMockClient();
      const res = await mockSupabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");

      assert.equal(res.count, 1);
      assert.equal(res.data, null);
    });

    test("or clause with ilike performs multi-column search correctly", async () => {
      const mockSupabase = createMockClient({
        products: [
          { id: "p-a", shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", name: "Ceylon Linen Tunic", sku: "TNC-01" },
          { id: "p-b", shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", name: "Cotton Sarong", sku: "LIN-99" },
          { id: "p-c", shop_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", name: "Silk Tie", sku: "TIE-01" },
        ],
      });

      const res = await mockSupabase
        .from("products")
        .select("*")
        .eq("shop_id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
        .or("name.ilike.%linen%,sku.ilike.%lin%");

      const ids = res.data.map((r) => r.id);
      assert.ok(ids.includes("p-a"), "Matches name linen");
      assert.ok(ids.includes("p-b"), "Matches sku lin");
      assert.equal(ids.includes("p-c"), false);
    });
  });
});
