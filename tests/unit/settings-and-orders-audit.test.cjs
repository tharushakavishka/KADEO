const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

// Helper to load TypeScript server actions with injected mock Supabase client
function loadModuleWithMockClient(relPath, { user, shop, dbMock }) {
  const fullPath = path.resolve(relPath);
  const tsCode = fs.readFileSync(fullPath, "utf8");
  const transpiled = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const phoneCode = fs.readFileSync("src/lib/phone.ts", "utf8");
  const phoneTranspiled = ts.transpileModule(phoneCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const phoneMod = { exports: {} };
  vm.runInNewContext(phoneTranspiled, { exports: phoneMod.exports, require, console });

  const customRequire = (name) => {
    if (name === "@/lib/supabase/server" || name.includes("supabase/server")) {
      return {
        createClient: async () => ({
          auth: {
            getUser: async () => ({
              data: { user: user ?? null },
              error: user ? null : { message: "Not logged in" },
            }),
          },
          from: (table) => dbMock.from(table),
          rpc: (fn, params) => dbMock.rpc(fn, params),
        }),
      };
    }
    if (name === "@/lib/phone" || name.includes("phone")) {
      return phoneMod.exports;
    }
    if (name === "next/cache") {
      return { revalidatePath: () => {} };
    }
    if (name === "next/navigation") {
      return { redirect: (url) => { throw new Error("REDIRECT:" + url); } };
    }
    if (name === "zod") {
      return require("zod");
    }
    return require(name);
  };

  const moduleObj = { exports: {} };
  const context = {
    exports: moduleObj.exports,
    require: customRequire,
    console,
    Date,
    JSON,
    Error,
    FormData: globalThis.FormData,
    process,
  };

  vm.runInNewContext(transpiled, context);
  return moduleObj.exports;
}

describe("KADEO Settings & Order Status Server Action Audit (Lin)", () => {
  // --------------------------------------------------------------------------
  // 1. Settings Action: Validation & Access Control
  // --------------------------------------------------------------------------
  describe("1. updateStoreSettingsAction Validation & Access Control", () => {
    test("rejects input with name shorter than 2 characters", async () => {
      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: {},
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "00000000-0000-0000-0000-000000000001",
        name: "A", // too short
        whatsappNumber: "0771234567",
        storeVisibility: true,
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Shop name must be at least 2 characters"));
    });

    test("rejects invalid Sri Lankan mobile number", async () => {
      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: {},
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "00000000-0000-0000-0000-000000000001",
        name: "Valid Shop Name",
        whatsappNumber: "12345", // invalid format
        storeVisibility: true,
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Please enter a valid Sri Lankan mobile number"));
    });

    test("rejects invalid contact email format", async () => {
      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: {},
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "00000000-0000-0000-0000-000000000001",
        name: "Valid Shop Name",
        whatsappNumber: "0771234567",
        contactEmail: "invalid-email-address",
        storeVisibility: true,
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Please enter a valid contact email address"));
    });

    test("rejects unauthenticated caller", async () => {
      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: null, // Unauthenticated
        dbMock: {},
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "00000000-0000-0000-0000-000000000001",
        name: "Valid Shop",
        whatsappNumber: "0771234567",
        storeVisibility: true,
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Authentication required"));
    });

    test("rejects caller who is not the owner of the shop", async () => {
      const mockDb = {
        from: (table) => {
          assert.equal(table, "shops");
          return {
            select: () => ({
              eq: (col, val) => ({
                single: async () => ({
                  data: { id: "shop-1", owner_id: "legit-owner-id", slug: "shop-one" },
                  error: null,
                }),
              }),
            }),
          };
        },
      };

      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "attacker-user-id" }, // Different user
        dbMock: mockDb,
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "shop-1",
        name: "Hacked Shop",
        whatsappNumber: "0771234567",
        storeVisibility: true,
      });

      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Permission denied: you are not the owner of this shop"));
    });
  });

  // --------------------------------------------------------------------------
  // 2. Settings Action: Injected DB Errors & Honest Partial Save Reporting
  // --------------------------------------------------------------------------
  describe("2. updateStoreSettingsAction Injected DB Errors & Partial Save Reporting", () => {
    test("truthfully reports partial failure when shops table update fails but shop_settings succeeds", async () => {
      const mockDb = {
        from: (table) => {
          if (table === "shops") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { id: "shop-1", owner_id: "user-1", slug: "my-shop" },
                    error: null,
                  }),
                }),
              }),
              update: (payload) => ({
                eq: async () => ({
                  data: null,
                  error: { message: "Database connection timeout while updating shops." },
                }),
              }),
            };
          }
          if (table === "shop_settings") {
            return {
              upsert: async () => ({
                data: null,
                error: null, // settings update succeeded
              }),
            };
          }
          throw new Error("Unexpected table: " + table);
        },
      };

      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "shop-1",
        name: "New Name",
        whatsappNumber: "0771234567",
        deliveryInfo: "2 days islandwide",
        storeVisibility: true,
      });

      assert.equal(res.partialSuccess, true);
      assert.ok(res.error);
      assert.ok(res.error.includes("Delivery and visibility settings saved, but shop details failed"));
      assert.ok(res.error.includes("Database connection timeout while updating shops"));
      assert.equal(res.data.name, "New Name");
    });

    test("truthfully reports partial failure when shops table succeeds but shop_settings upsert fails", async () => {
      const mockDb = {
        from: (table) => {
          if (table === "shops") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { id: "shop-1", owner_id: "user-1", slug: "my-shop" },
                    error: null,
                  }),
                }),
              }),
              update: () => ({
                eq: async () => ({
                  data: null,
                  error: null, // shop update succeeded
                }),
              }),
            };
          }
          if (table === "shop_settings") {
            return {
              upsert: async () => ({
                data: null,
                error: { message: "Constraint violation on shop_settings." },
              }),
            };
          }
          throw new Error("Unexpected table: " + table);
        },
      };

      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "shop-1",
        name: "New Name",
        whatsappNumber: "0771234567",
        deliveryInfo: "2 days islandwide",
        storeVisibility: true,
      });

      assert.equal(res.partialSuccess, true);
      assert.ok(res.error);
      assert.ok(res.error.includes("Shop details saved, but delivery and visibility settings failed"));
      assert.ok(res.error.includes("Constraint violation on shop_settings"));
    });

    test("truthfully reports complete failure when both shops and settings updates fail", async () => {
      const mockDb = {
        from: (table) => {
          if (table === "shops") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { id: "shop-1", owner_id: "user-1", slug: "my-shop" },
                    error: null,
                  }),
                }),
              }),
              update: () => ({
                eq: async () => ({
                  data: null,
                  error: { message: "Network error 503." },
                }),
              }),
            };
          }
          if (table === "shop_settings") {
            return {
              upsert: async () => ({
                data: null,
                error: { message: "Database write deadlock." },
              }),
            };
          }
          throw new Error("Unexpected table: " + table);
        },
      };

      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "shop-1",
        name: "New Name",
        whatsappNumber: "0771234567",
        storeVisibility: true,
      });

      assert.equal(res.partialSuccess, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes("Failed to save changes"));
      assert.ok(res.error.includes("Network error 503"));
      assert.ok(res.error.includes("Database write deadlock"));
    });

    test("reports complete success when both database operations succeed", async () => {
      let savedShopData = null;
      let savedSettingsData = null;

      const mockDb = {
        from: (table) => {
          if (table === "shops") {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({
                    data: { id: "shop-1", owner_id: "user-1", slug: "my-shop" },
                    error: null,
                  }),
                }),
              }),
              update: (payload) => ({
                eq: async (col, val) => {
                  savedShopData = payload;
                  return { data: null, error: null };
                },
              }),
            };
          }
          if (table === "shop_settings") {
            return {
              upsert: async (payload) => {
                savedSettingsData = payload;
                return { data: null, error: null };
              },
            };
          }
          throw new Error("Unexpected table: " + table);
        },
      };

      const actions = loadModuleWithMockClient("src/features/shops/settings-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateStoreSettingsAction({
        shopId: "shop-1",
        name: "Ceylon Silk & Linen",
        whatsappNumber: "0771234567",
        contactEmail: "info@ceylonsilk.lk",
        address: "Galle Road, Colombo 03",
        description: "Artisanal natural linen store.",
        deliveryInfo: "2-3 business days islandwide.",
        storeVisibility: true,
      });

      assert.equal(res.success, true);
      assert.equal(res.error, undefined);
      assert.equal(res.message, "Store settings saved successfully.");
      assert.equal(savedShopData.name, "Ceylon Silk & Linen");
      assert.equal(savedShopData.whatsapp_number, "94771234567"); // Normalized to E.164
      assert.equal(savedSettingsData.delivery_information, "2-3 business days islandwide.");
      assert.equal(savedSettingsData.store_visibility, true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Order Status Action: Injected DB RPC Errors & Transition Enforcement
  // --------------------------------------------------------------------------
  describe("3. updateOrderStatusAction Injected RPC Errors & Authorization", () => {
    test("rejects missing orderId or status", async () => {
      const actions = loadModuleWithMockClient("src/features/orders/seller-actions.ts", {
        user: { id: "user-1" },
        dbMock: {},
      });

      const res1 = await actions.updateOrderStatusAction("", "confirmed");
      assert.ok(res1.error);
      assert.ok(res1.error.includes("Order ID and target status are required"));

      const res2 = await actions.updateOrderStatusAction("order-1", "");
      assert.ok(res2.error);
      assert.ok(res2.error.includes("Order ID and target status are required"));
    });

    test("rejects unauthenticated user gracefully without unhandled throw", async () => {
      const actions = loadModuleWithMockClient("src/features/orders/seller-actions.ts", {
        user: null,
        dbMock: {},
      });

      const res = await actions.updateOrderStatusAction("order-1", "confirmed");
      assert.ok(res.error);
      assert.equal(res.error, "Unauthorized. Please sign in.");
    });

    test("handles injected RPC database errors cleanly and returns error message", async () => {
      const mockDb = {
        from: (table) => {
          assert.equal(table, "shops");
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: { id: "shop-1" },
                  error: null,
                }),
              }),
            }),
          };
        },
        rpc: async (fn, params) => {
          assert.equal(fn, "update_order_status");
          return {
            data: null,
            error: { message: 'Cannot transition order status from "shipped" to "pending"' },
          };
        },
      };

      const actions = loadModuleWithMockClient("src/features/orders/seller-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateOrderStatusAction("order-1", "pending");
      assert.equal(res.success, undefined);
      assert.ok(res.error);
      assert.ok(res.error.includes('Cannot transition order status from "shipped" to "pending"'));
    });

    test("returns success when RPC succeeds", async () => {
      const mockDb = {
        from: (table) => {
          assert.equal(table, "shops");
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: { id: "shop-1" },
                  error: null,
                }),
              }),
            }),
          };
        },
        rpc: async (fn, params) => {
          assert.equal(fn, "update_order_status");
          return {
            data: { success: true, new_status: "processing" },
            error: null,
          };
        },
      };

      const actions = loadModuleWithMockClient("src/features/orders/seller-actions.ts", {
        user: { id: "user-1" },
        dbMock: mockDb,
      });

      const res = await actions.updateOrderStatusAction("order-1", "processing");
      assert.equal(res.success, true);
      assert.equal(res.error, undefined);
      assert.equal(res.data.new_status, "processing");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Order Status Form: Allowed Sequential Transitions Logic
  // --------------------------------------------------------------------------
  describe("4. OrderStatusForm Allowed Sequential Transitions", () => {
    test("getAllowedNextStatuses strictly restricts transitions according to canonical state machine", () => {
      const tsCode = fs.readFileSync("src/features/orders/order-constants.ts", "utf8");
      const transpiled = ts.transpileModule(tsCode, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      }).outputText;
      const mod = { exports: {} };
      vm.runInNewContext(transpiled, { exports: mod.exports });
      const { getAllowedNextStatuses } = mod.exports;

      const toArray = (v) => JSON.parse(JSON.stringify(v));

      // Pending allows: pending (current), confirmed, cancelled
      assert.deepEqual(toArray(getAllowedNextStatuses("pending")), ["pending", "confirmed", "cancelled"]);

      // Confirmed allows: confirmed (current), processing, cancelled
      assert.deepEqual(toArray(getAllowedNextStatuses("confirmed")), ["confirmed", "processing", "cancelled"]);

      // Processing allows: processing (current), shipped, cancelled
      assert.deepEqual(toArray(getAllowedNextStatuses("processing")), ["processing", "shipped", "cancelled"]);

      // Shipped allows: shipped (current), completed, cancelled
      assert.deepEqual(toArray(getAllowedNextStatuses("shipped")), ["shipped", "completed", "cancelled"]);

      // Completed is terminal: only completed (current)
      assert.deepEqual(toArray(getAllowedNextStatuses("completed")), ["completed"]);

      // Cancelled is terminal: only cancelled (current)
      assert.deepEqual(toArray(getAllowedNextStatuses("cancelled")), ["cancelled"]);
    });
  });
});
