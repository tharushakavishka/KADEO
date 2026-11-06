import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { z } from "zod";

// Import actual production implementations and adapter
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneDisplay,
  buildWhatsAppUrl,
} from "../../src/lib/phone.ts";
import { createLocalClient } from "../../src/lib/supabase/local-adapter.ts";

describe("KADEO Backend Production Architecture & Contract Tests (Lin)", () => {
  // --------------------------------------------------------------------------
  // 1. Production Phone Utilities & Normalization (Issue 3)
  // --------------------------------------------------------------------------
  describe("1. Production Phone Utilities & WhatsApp wa.me Link Generation", () => {
    test("normalizes local 10-digit 07X numbers to 94 format", () => {
      assert.equal(normalizePhoneNumber("0771234567"), "94771234567");
      assert.equal(normalizePhoneNumber("0712345678"), "94712345678");
      assert.equal(normalizePhoneNumber("0769876543"), "94769876543");
      assert.equal(normalizePhoneNumber("0781122334"), "94781122334");
    });

    test("normalizes formatted local numbers with spaces, brackets, dashes, and international prefixes", () => {
      assert.equal(normalizePhoneNumber("077-123 4567"), "94771234567");
      assert.equal(normalizePhoneNumber("(077) 123-4567"), "94771234567");
      assert.equal(normalizePhoneNumber("+94771234567"), "94771234567");
      assert.equal(normalizePhoneNumber("+94 77 123 4567"), "94771234567");
      assert.equal(normalizePhoneNumber("94771234567"), "94771234567");
      assert.equal(normalizePhoneNumber("771234567"), "94771234567");
    });

    test("validates valid Sri Lankan phone numbers and rejects malformed inputs", () => {
      assert.equal(isValidPhoneNumber("0771234567"), true);
      assert.equal(isValidPhoneNumber("+94771234567"), true);
      assert.equal(isValidPhoneNumber("94771234567"), true);
      assert.equal(isValidPhoneNumber("0112345678"), true); // Colombo landline

      assert.equal(isValidPhoneNumber(""), false);
      assert.equal(isValidPhoneNumber("123"), false);
      assert.equal(isValidPhoneNumber("abcdefghij"), false);
      assert.equal(isValidPhoneNumber("077123"), false);
    });

    test("formats phone numbers cleanly for user-facing UI", () => {
      assert.equal(formatPhoneDisplay("94771234567"), "+94 77 123 4567");
      assert.equal(formatPhoneDisplay("0771234567"), "+94 77 123 4567");
    });

    test("builds official WhatsApp wa.me URLs normalized with country code 94", () => {
      const url = buildWhatsAppUrl("0771234567", "Hello store!");
      assert.ok(url.startsWith("https://wa.me/94771234567?text="));
      assert.ok(!url.includes("https://wa.me/077"));
      assert.ok(url.includes("Hello%20store!"));
    });
  });

  // --------------------------------------------------------------------------
  // 2. Canonical Database Migration Schema Contract Checks
  // --------------------------------------------------------------------------
  describe("2. Canonical SQL Migrations Schema & Privilege Contracts", () => {
    test("initial_schema.sql orders table has canonical columns and CHECK constraint with 'completed'", () => {
      const initialSchemaPath = path.join(
        process.cwd(),
        "supabase/migrations/20261105000000_initial_schema.sql"
      );
      assert.ok(fs.existsSync(initialSchemaPath), "initial_schema.sql must exist");
      const sql = fs.readFileSync(initialSchemaPath, "utf8");

      // Verify canonical orders CHECK constraint uses 'completed'
      assert.ok(
        sql.includes(
          "CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'))"
        ),
        "orders.status CHECK constraint must contain 'completed'"
      );
      assert.ok(
        !sql.includes("'delivered'"),
        "initial_schema.sql must never contain non-canonical 'delivered' status"
      );

      // Verify canonical snapshot columns
      assert.ok(sql.includes("customer_name_snapshot TEXT NOT NULL"));
      assert.ok(sql.includes("customer_phone_snapshot TEXT NOT NULL"));
      assert.ok(sql.includes("delivery_address_snapshot TEXT NOT NULL"));
      assert.ok(sql.includes("order_note TEXT"));

      // Verify orders RLS restricts access to shop owner and admin
      assert.ok(sql.includes('CREATE POLICY "Sellers can view and manage their orders" ON public.orders'));
      assert.ok(sql.includes("public.is_shop_owner(shop_id, auth.uid())"));
    });

    test("backend audit migration defines update_order_status and track_customer_order with SECURITY DEFINER and search_path", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/20261105030000_backend_audit_fixes.sql"
      );
      assert.ok(fs.existsSync(migrationPath), "20261105030000_backend_audit_fixes.sql must exist");
      const sql = fs.readFileSync(migrationPath, "utf8");

      // Check update_order_status
      assert.ok(sql.includes("CREATE OR REPLACE FUNCTION public.update_order_status"));
      assert.ok(sql.includes("public.is_shop_owner(p_shop_id, auth.uid())"));
      assert.ok(sql.includes("SECURITY DEFINER SET search_path = public, pg_temp;"));
      assert.ok(sql.includes("REVOKE ALL ON FUNCTION public.update_order_status(UUID, TEXT, UUID) FROM PUBLIC;"));
      assert.ok(sql.includes("GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, UUID) TO authenticated;"));

      // Check track_customer_order
      assert.ok(sql.includes("CREATE OR REPLACE FUNCTION public.track_customer_order"));
      assert.ok(sql.includes("REVOKE ALL ON FUNCTION public.track_customer_order(TEXT, TEXT, TEXT) FROM PUBLIC;"));
      assert.ok(sql.includes("GRANT EXECUTE ON FUNCTION public.track_customer_order(TEXT, TEXT, TEXT) TO anon, authenticated;"));
    });
  });

  // --------------------------------------------------------------------------
  // 3. Multi-Tenant Authorization & Status State Machine via Actual Adapter
  // --------------------------------------------------------------------------
  describe("3. Multi-Tenant Access Control & Status Transitions via Production Local Adapter", () => {
    test("update_order_status RPC enforces authentication and rejects anonymous callers", async () => {
      const anonClient = createLocalClient(null);
      const res = await anonClient.rpc("update_order_status", {
        p_order_id: "any-order",
        p_new_status: "confirmed",
        p_shop_id: "any-shop",
      });

      assert.equal(res.data, null);
      assert.ok(res.error);
      assert.equal(res.error.message, "Authentication required.");
    });

    test("update_order_status RPC rejects foreign owner attempting cross-tenant order modification", async () => {
      // Simulate two distinct shop owners: Owner A (owns shop-1) and Foreign Attacker B (owns shop-2)
      const foreignOwner = { id: "foreign-attacker-id", email: "attacker@kadeo.lk" };
      const foreignClient = createLocalClient(foreignOwner);

      // Attempt to modify an order in shop-1 (which belongs to user-1, not foreign-attacker-id)
      const res = await foreignClient.rpc("update_order_status", {
        p_order_id: "test-order-id",
        p_new_status: "confirmed",
        p_shop_id: "00000000-0000-0000-0000-000000000001", // Ceylon Linen shop
      });

      assert.equal(res.data, null);
      assert.ok(res.error);
      assert.ok(
        res.error.message.includes("Permission denied: caller is not the owner of this shop.")
      );
    });

    test("update_order_status RPC enforces canonical state transitions: shipped -> completed and rejects illegal moves", async () => {
      // Read current owner from DB
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const owner = db.users[0];
      const shop = db.shops.find((s) => s.owner_id === owner.id);
      assert.ok(shop, "Owner must have a shop in local db");

      const ownerClient = createLocalClient(owner);

      // Create a test order in DB
      const testOrderId = "order-status-test-" + Date.now();
      db.orders.push({
        id: testOrderId,
        shop_id: shop.id,
        order_code: "KAD-2026-TEST01",
        subtotal: 5000,
        delivery_fee: 0,
        total: 5000,
        currency: "LKR",
        status: "pending",
        customer_name_snapshot: "Test Buyer",
        customer_phone_snapshot: "0771234567",
        delivery_address_snapshot: "Test Address",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        // 1. Transition pending -> confirmed
        const step1 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "confirmed",
          p_shop_id: shop.id,
        });
        assert.equal(step1.data?.new_status, "confirmed");

        // 2. Transition confirmed -> processing
        const step2 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "processing",
          p_shop_id: shop.id,
        });
        assert.equal(step2.data?.new_status, "processing");

        // 3. Transition processing -> shipped
        const step3 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "shipped",
          p_shop_id: shop.id,
        });
        assert.equal(step3.data?.new_status, "shipped");

        // 4. Transition shipped -> completed (Canonical parity)
        const step4 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "completed",
          p_shop_id: shop.id,
        });
        assert.equal(step4.data?.new_status, "completed");

        // 5. Attempt illegal backward transition: completed -> pending must fail
        const step5 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "pending",
          p_shop_id: shop.id,
        });
        assert.equal(step5.data, null);
        assert.ok(step5.error?.message.includes('Cannot transition order status from "completed" to "pending"'));

        // 6. Attempt non-canonical "delivered" must fail
        const step6 = await ownerClient.rpc("update_order_status", {
          p_order_id: testOrderId,
          p_new_status: "delivered",
          p_shop_id: shop.id,
        });
        assert.equal(step6.data, null);
        assert.ok(step6.error?.message.includes("Cannot transition order status"));
      } finally {
        // Clean up test order
        const freshDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        freshDb.orders = freshDb.orders.filter((o) => o.id !== testOrderId);
        fs.writeFileSync(dbPath, JSON.stringify(freshDb, null, 2), "utf8");
      }
    });

    test("order cancellation restores inventory exactly once and repeated cancellation is idempotent", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const owner = db.users[0];
      const shop = db.shops.find((s) => s.owner_id === owner.id);
      const ownerClient = createLocalClient(owner);

      const cancelTestProdId = "prod-stock-test-" + Date.now();
      const cancelTestOrderId = "order-cancel-test-" + Date.now();

      db.products.push({
        id: cancelTestProdId,
        shop_id: shop.id,
        name: "Test Stock Product",
        slug: "test-stock-product",
        price: 1000,
        stock_quantity: 5,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.orders.push({
        id: cancelTestOrderId,
        shop_id: shop.id,
        order_code: "KAD-2026-CANCEL01",
        subtotal: 2000,
        delivery_fee: 0,
        total: 2000,
        currency: "LKR",
        status: "processing",
        customer_name_snapshot: "Test Customer",
        customer_phone_snapshot: "0771234567",
        delivery_address_snapshot: "Test Address",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.order_items.push({
        id: "item-cancel-test-" + Date.now(),
        order_id: cancelTestOrderId,
        shop_id: shop.id,
        product_id: cancelTestProdId,
        product_name_snapshot: "Test Stock Product",
        unit_price: 1000,
        quantity: 2,
        line_total: 2000,
        created_at: new Date().toISOString(),
      });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        // 1. First cancellation -> restores 2 units (stock: 5 -> 7)
        const firstCancel = await ownerClient.rpc("update_order_status", {
          p_order_id: cancelTestOrderId,
          p_new_status: "cancelled",
          p_shop_id: shop.id,
        });
        assert.equal(firstCancel.data?.new_status, "cancelled");

        const dbAfterFirst = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const prodAfterFirst = dbAfterFirst.products.find((p) => p.id === cancelTestProdId);
        assert.equal(prodAfterFirst.stock_quantity, 7, "Stock must increment from 5 to 7");

        // 2. Second cancellation attempt -> idempotent no-op, must NOT re-increment stock
        const secondCancel = await ownerClient.rpc("update_order_status", {
          p_order_id: cancelTestOrderId,
          p_new_status: "cancelled",
          p_shop_id: shop.id,
        });
        assert.equal(secondCancel.data?.idempotent, true);

        const dbAfterSecond = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const prodAfterSecond = dbAfterSecond.products.find((p) => p.id === cancelTestProdId);
        assert.equal(
          prodAfterSecond.stock_quantity,
          7,
          "Stock must remain 7 and not be inflated on repeated cancellation"
        );
      } finally {
        const cleanupDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        cleanupDb.products = cleanupDb.products.filter((p) => p.id !== cancelTestProdId);
        cleanupDb.orders = cleanupDb.orders.filter((o) => o.id !== cancelTestOrderId);
        cleanupDb.order_items = cleanupDb.order_items.filter((it) => it.order_id !== cancelTestOrderId);
        fs.writeFileSync(dbPath, JSON.stringify(cleanupDb, null, 2), "utf8");
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. Secure Public Tracking RPC via Production Local Adapter (Issue 11)
  // --------------------------------------------------------------------------
  describe("4. Owner-Independent Public Order Tracking RPC Contract", () => {
    test("track_customer_order RPC returns safe order details when code and full normalized phone match", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];

      const trackOrderId = "order-tracking-test-" + Date.now();
      const trackOrderCode = "KAD-2026-TRK001";
      const customerPhone = "0771234567";

      db.orders.push({
        id: trackOrderId,
        shop_id: shop.id,
        order_code: trackOrderCode,
        status: "processing",
        subtotal: 3500,
        delivery_fee: 250,
        total: 3750,
        currency: "LKR",
        customer_name_snapshot: "Nimalka Perera",
        customer_phone_snapshot: customerPhone,
        delivery_address_snapshot: "123 Kandy Road, Kiribathgoda",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.order_items.push({
        id: "item-trk-" + Date.now(),
        order_id: trackOrderId,
        shop_id: shop.id,
        product_name_snapshot: "Handloom Cotton Throw",
        unit_price: 3500,
        quantity: 1,
        line_total: 3500,
        created_at: new Date().toISOString(),
      });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        const publicClient = createLocalClient(null);

        // Tracking with matching order code and international +94 format
        const res = await publicClient.rpc("track_customer_order", {
          p_shop_slug: shop.slug,
          p_order_code: trackOrderCode,
          p_normalized_phone: "+94 77 123 4567",
        });

        assert.equal(res.data?.success, true);
        assert.equal(res.data?.order.orderCode, trackOrderCode);
        assert.equal(res.data?.order.status, "processing");
        assert.equal(res.data?.order.customerName, "Nimalka Perera");
        assert.equal(res.data?.order.total, 3750);
        assert.equal(res.data?.order.items.length, 1);
        assert.equal(res.data?.order.items[0].name, "Handloom Cotton Throw");
      } finally {
        const cleanupDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        cleanupDb.orders = cleanupDb.orders.filter((o) => o.id !== trackOrderId);
        cleanupDb.order_items = cleanupDb.order_items.filter((it) => it.order_id !== trackOrderId);
        fs.writeFileSync(dbPath, JSON.stringify(cleanupDb, null, 2), "utf8");
      }
    });

    test("track_customer_order RPC rejects wrong phone number preventing enumeration", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];

      const trackOrderId = "order-wrong-phone-test-" + Date.now();
      const trackOrderCode = "KAD-2026-ENUM01";

      db.orders.push({
        id: trackOrderId,
        shop_id: shop.id,
        order_code: trackOrderCode,
        status: "confirmed",
        subtotal: 1000,
        delivery_fee: 0,
        total: 1000,
        customer_name_snapshot: "Legit Customer",
        customer_phone_snapshot: "0771234567",
        delivery_address_snapshot: "Galle",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        const publicClient = createLocalClient(null);

        // Attacker querying with wrong phone number
        const res = await publicClient.rpc("track_customer_order", {
          p_shop_slug: shop.slug,
          p_order_code: trackOrderCode,
          p_normalized_phone: "0719999999",
        });

        assert.equal(res.data?.success, false);
        assert.equal(
          res.data?.error,
          "No order found matching this order code and phone number. Please verify your details."
        );
      } finally {
        const cleanupDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        cleanupDb.orders = cleanupDb.orders.filter((o) => o.id !== trackOrderId);
        fs.writeFileSync(dbPath, JSON.stringify(cleanupDb, null, 2), "utf8");
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Truthful Password Recovery & Authentication Rejection (Issue 6)
  // --------------------------------------------------------------------------
  describe("5. Truthful Password Recovery & Rejection of Fabricated Sessions", () => {
    test("local adapter resetPasswordForEmail truthfully informs user that email delivery is unconfigured", async () => {
      const client = createLocalClient(null);
      const res = await client.auth.resetPasswordForEmail("seller@kadeo.lk");

      assert.equal(res.data, null);
      assert.ok(res.error);
      assert.equal(res.error.name, "AuthApiError");
      assert.ok(
        res.error.message.includes("Email delivery is not supported in the local mock environment")
      );
    });

    test("local adapter exchangeCodeForSession rejects arbitrary codes and cannot hijack accounts", async () => {
      const client = createLocalClient(null);

      // Attempting to exchange an arbitrary unverified code
      const arbitraryRes = await client.auth.exchangeCodeForSession("arbitrary-attacker-token");
      assert.equal(arbitraryRes.data, null);
      assert.ok(arbitraryRes.error);
      assert.equal(
        arbitraryRes.error.message,
        "Invalid or unsupported recovery code in local environment. Cannot authenticate arbitrary code."
      );
    });
  });

  // --------------------------------------------------------------------------
  // 6. Store Visibility & Checkout Gating (Issue 4)
  // --------------------------------------------------------------------------
  describe("6. Store Visibility & Private Store Checkout Gating", () => {
    test("create_checkout_order rejects orders when store_visibility is false", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];

      // Temporarily mark store as private in settings
      let setting = db.shop_settings.find((s) => s.shop_id === shop.id);
      if (!setting) {
        setting = { shop_id: shop.id, store_visibility: false };
        db.shop_settings.push(setting);
      }
      const previousVisibility = setting.store_visibility;
      setting.store_visibility = false;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        const client = createLocalClient(null);
        await assert.rejects(
          async () => {
            await client.rpc("create_checkout_order", {
              p_shop_slug: shop.slug,
              p_customer_name: "Buyer",
              p_customer_phone: "0771234567",
              p_customer_address: "Colombo",
              p_items: [],
            });
          },
          /This store is currently private and not accepting orders/
        );
      } finally {
        const cleanupDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const resetSetting = cleanupDb.shop_settings.find((s) => s.shop_id === shop.id);
        if (resetSetting) resetSetting.store_visibility = previousVisibility ?? true;
        fs.writeFileSync(dbPath, JSON.stringify(cleanupDb, null, 2), "utf8");
      }
    });
  });
});
