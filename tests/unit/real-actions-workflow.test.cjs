const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");

function loadActionsModule(filePath, mockDb, user = { id: "seller-123" }, shop = { id: "shop-123", slug: "my-shop" }) {
  const tsCode = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const catalogValCode = fs.readFileSync("src/lib/validations/catalog.ts", "utf8");
  const catalogValTranspiled = ts.transpileModule(catalogValCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const catalogModule = { exports: {} };
  vm.runInNewContext(catalogValTranspiled, { exports: catalogModule.exports, require, URL, Set, RegExp });

  const customRequire = (name) => {
    if (name === "./service" || name === "./service.ts") {
      const pathMod = require("node:path");
      const sPath = pathMod.join(pathMod.dirname(filePath), "service.ts");
      const sCode = fs.readFileSync(sPath, "utf8");
      const sTranspiled = ts.transpileModule(sCode, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      }).outputText;
      const sMod = { exports: {} };
      vm.runInNewContext(sTranspiled, {
        exports: sMod.exports,
        require: customRequire,
        console,
        URL,
        Set,
        Date,
        JSON,
        FormData: globalThis.FormData,
        Error,
      });
      return sMod.exports;
    }
    if (name === "@/lib/supabase/server" || name === "../../lib/supabase/server.ts" || name === "../../lib/supabase/server") {
      return {
        createClient: async () => ({
          auth: {
            getUser: async () => ({ data: { user } }),
          },
          from: (table) => mockDb.from(table, user, shop),
        }),
      };
    }
    if (name === "@/lib/utils" || name === "../../lib/utils.ts") {
      return {
        generateSlug: (str) =>
          (str || "")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, ""),
      };
    }
    if (name === "@/lib/validations/catalog" || name === "../../lib/validations/catalog.ts" || name === "../../lib/validations/catalog") {
      return catalogModule.exports;
    }
    if (name === "next/cache") {
      return { revalidatePath: () => {} };
    }
    if (name === "next/navigation") {
      return { redirect: (url) => { throw new Error("REDIRECT:" + url); } };
    }
    return require(name);
  };

  const mod = { exports: {} };
  vm.runInNewContext(transpiled, {
    exports: mod.exports,
    require: customRequire,
    console,
    URL,
    Set,
    Date,
    JSON,
    FormData: globalThis.FormData,
    Error,
  });
  return mod.exports;
}

describe("KADEO Real Server Action Test Suite (QA Action Coverage)", () => {
  test("createProductAction rejects invalid input (<2 characters) without touching database", async () => {
    let insertCalled = false;
    const mockDb = {
      from(table, user, shop) {
        return {
          select() { return this; },
          eq() { return this; },
          async single() {
            return { data: shop, error: null };
          },
          insert() {
            insertCalled = true;
            return { select: () => ({ single: async () => ({ data: { id: "p1" } }) }) };
          },
        };
      },
    };

    const actions = loadActionsModule("src/features/products/actions.ts", mockDb);
    const result = await actions.createProductAction({
      name: "X", // Invalid: 1 char
      price: 1500,
      stockQuantity: 10,
    });

    assert.ok(result.error, "Should return validation error");
    assert.match(result.error, /at least 2 characters/i);
    assert.equal(insertCalled, false, "Database insert should not be called on validation failure");
  });

  test("createProductAction accepts valid product payload and inserts into products table", async () => {
    let insertedPayload = null;
    const mockDb = {
      from(table, user, shop) {
        return {
          select() { return this; },
          eq() { return this; },
          async single() {
            return { data: shop, error: null };
          },
          insert(data) {
            insertedPayload = data;
            return {
              select: () => ({
                single: async () => ({ data: { id: "prod-new-1", slug: data.slug, ...data } }),
              }),
            };
          },
        };
      },
    };

    const actions = loadActionsModule("src/features/products/actions.ts", mockDb);
    try {
      await actions.createProductAction({
        name: "Linen Shirt",
        price: 4500,
        stockQuantity: 15,
        sku: "LS-001",
        status: "active",
      });
    } catch (err) {
      assert.match(err.message, /REDIRECT/);
    }

    assert.ok(insertedPayload, "Payload should be inserted");
    assert.equal(insertedPayload.name, "Linen Shirt");
    assert.equal(insertedPayload.price, 4500);
    assert.equal(insertedPayload.stock_quantity, 15);
    assert.equal(insertedPayload.sku, "LS-001");
  });

  test("createCategoryAction validates category name and persists category to shop", async () => {
    let insertedCat = null;
    const mockDb = {
      from(table, user, shop) {
        return {
          select() { return this; },
          eq() { return this; },
          async single() {
            return { data: shop, error: null };
          },
          insert(data) {
            insertedCat = data;
            return {
              select: () => ({
                single: async () => ({ data: { id: "cat-1", ...data }, error: null }),
              }),
            };
          },
        };
      },
    };

    const actions = loadActionsModule("src/features/categories/actions.ts", mockDb);

    // 1. Validation failure
    const bad = await actions.createCategoryAction({ name: "A" });
    assert.ok(bad.error, "Should fail for 1 character name");
    assert.equal(insertedCat, null);

    // 2. Success
    const good = await actions.createCategoryAction({ name: "Handmade Crafts", sortOrder: 1 });
    assert.equal(good.success, true);
    assert.equal(insertedCat.name, "Handmade Crafts");
    assert.equal(insertedCat.sort_order, 1);
  });

  test("deleteCategoryAction unlinks products to null before deleting the category", async () => {
    const operations = [];
    const mockDb = {
      from(table, user, shop) {
        return {
          select() { return this; },
          eq(k, v) { return this; },
          async single() {
            return { data: { id: "cat-del", name: "Old Category" }, error: null };
          },
          update(data) {
            operations.push({ op: "update", table, data });
            return { eq: () => ({ eq: async () => ({ error: null }) }) };
          },
          delete() {
            operations.push({ op: "delete", table });
            return { eq: () => ({ eq: async () => ({ error: null }) }) };
          },
        };
      },
    };

    const actions = loadActionsModule("src/features/categories/actions.ts", mockDb);
    const result = await actions.deleteCategoryAction("cat-del");
    assert.equal(result.success, true);
    assert.equal(result.deletedName, "Old Category");

    // First operation should set category_id to null on products
    assert.equal(operations[0].op, "update");
    assert.equal(operations[0].table, "products");
    assert.equal(operations[0].data.category_id, null);

    // Second operation should delete category
    assert.equal(operations[1].op, "delete");
    assert.equal(operations[1].table, "categories");
  });
});
