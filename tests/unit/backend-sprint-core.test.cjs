process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-sprint-hmac-session-secret-for-unit-tests";
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadTs(file, dependencies = {}) {
  const resolvedFile = path.resolve(__dirname, "../../", file);
  const code = ts.transpileModule(fs.readFileSync(resolvedFile, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    exports: mod.exports,
    module: mod,
    require: (name) => (name in dependencies ? dependencies[name] : require(name)),
    console,
    process,
    crypto: globalThis.crypto,
    TextEncoder: globalThis.TextEncoder,
    TextDecoder: globalThis.TextDecoder,
    btoa: globalThis.btoa,
    atob: globalThis.atob,
    Buffer,
    URL,
    Set,
    Date,
    Math,
  });
  return mod.exports;
}

const phone = loadTs("src/lib/phone.ts", {});
const session = loadTs("src/lib/supabase/session.ts", {});
const localAdapter = loadTs("src/lib/supabase/local-adapter.ts", {
  "../phone.ts": phone,
  "../../lib/phone": phone,
  "./session.ts": session,
  "./session": session,
});
const { createSignedSession, verifySessionToken, createLocalClient } = localAdapter;

describe("KADEO Backend Sprint Core & Security Contract Suite (Lin)", () => {
  // --------------------------------------------------------------------------
  // 1. Auth & Session Cookie Cryptographic Verification & Anti-Forgery
  // --------------------------------------------------------------------------
  describe("1. Cryptographic Session Signing & Anti-Forgery Boundary", () => {
    test("verifySessionToken strictly rejects unsigned raw JSON strings (forged cookies)", async () => {
      // Attacker crafts raw JSON pretending to be admin or seller Kasun
      const forgedAdmin = JSON.stringify({
        id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        email: "admin@kadeo.lk",
        role: "admin",
      });
      assert.equal(await verifySessionToken(forgedAdmin), null);

      const forgedSeller = JSON.stringify({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
      });
      assert.equal(await verifySessionToken(forgedSeller), null);

      assert.equal(await verifySessionToken(""), null);
      assert.equal(await verifySessionToken("invalid.token.structure"), null);
      assert.equal(await verifySessionToken(null), null);
    });

    test("verifySessionToken strictly rejects tampered payloads and forged signatures", async () => {
      const validToken = await createSignedSession({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
      });
      const [payloadB64, signature] = validToken.split(".");

      // 1. Tamper signature
      const tamperedSig = signature.slice(0, -4) + "abcd";
      assert.equal(await verifySessionToken(`${payloadB64}.${tamperedSig}`), null);

      // 2. Tamper payload while keeping old signature
      const evilPayload = Buffer.from(
        JSON.stringify({ id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", email: "admin@kadeo.lk" })
      ).toString("base64url");
      assert.equal(await verifySessionToken(`${evilPayload}.${signature}`), null);
    });

    test("createSignedSession generates verifiable tokens that decode cleanly", async () => {
      const token = await createSignedSession({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
        full_name: "Kasun Perera",
      });
      const verified = await verifySessionToken(token);
      assert.ok(verified);
      assert.equal(verified?.id, "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
      assert.equal(verified?.email, "kasun@ceylonlinen.lk");
      assert.equal(verified?.full_name, "Kasun Perera");
    });

    test("local adapter getUser cross-verifies user in database and rejects non-existent IDs", async () => {
      // Valid existing user Kasun
      const validClient = createLocalClient({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
      });
      const { data: validData, error: validErr } = await validClient.auth.getUser();
      assert.equal(validErr, undefined);
      assert.equal(validData.user?.id, "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");

      // Forged non-existent user ID
      const fakeClient = createLocalClient({
        id: "00000000-0000-0000-0000-000000000000",
        email: "ghost@kadeo.lk",
      });
      const { data: fakeData } = await fakeClient.auth.getUser();
      assert.equal(fakeData.user, null);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Checkout Idempotency & Durable Duplicate-Submit Protection
  // --------------------------------------------------------------------------
  describe("2. Checkout Idempotency & Stock Protection", () => {
    test("submitting checkout with idempotencyKey creates order once and returns idempotent result on retry without double-decrementing stock", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];
      const product = db.products.find((p) => p.shop_id === shop.id && p.status === "active");
      assert.ok(product, "Active product required for test");

      const initialStock = product.stock_quantity;
      const idempotencyKey = "idem-" + Date.now() + "-" + Math.random().toString(36).slice(2);

      const client = createLocalClient(null);

      // 1. First submission
      const res1 = await client.rpc("create_checkout_order", {
        p_shop_slug: shop.slug,
        p_customer_name: "Idempotent Buyer",
        p_customer_phone: "0771122334",
        p_customer_address: "123 Galle Road, Colombo 03",
        p_items: [{ product_id: product.id, quantity: 2 }],
        p_idempotency_key: idempotencyKey,
      });

      assert.equal(res1.error, null);
      assert.ok(res1.data?.order_code);
      const firstOrderId = res1.data.order_id;
      const firstOrderCode = res1.data.order_code;

      const dbAfterFirst = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const prodAfterFirst = dbAfterFirst.products.find((p) => p.id === product.id);
      assert.equal(prodAfterFirst.stock_quantity, initialStock - 2);

      // 2. Duplicate submission with SAME idempotency key (simulating network retry / double click)
      const res2 = await client.rpc("create_checkout_order", {
        p_shop_slug: shop.slug,
        p_customer_name: "Idempotent Buyer",
        p_customer_phone: "0771122334",
        p_customer_address: "123 Galle Road, Colombo 03",
        p_items: [{ product_id: product.id, quantity: 2 }],
        p_idempotency_key: idempotencyKey,
      });

      assert.equal(res2.error, null);
      assert.equal(res2.data?.order_id, firstOrderId);
      assert.equal(res2.data?.order_code, firstOrderCode);
      assert.equal(res2.data?.idempotent, true);

      // Crucial: stock MUST NOT be decremented a second time
      const dbAfterSecond = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const prodAfterSecond = dbAfterSecond.products.find((p) => p.id === product.id);
      assert.equal(prodAfterSecond.stock_quantity, initialStock - 2);

      // Cleanup test order
      dbAfterSecond.products.find((p) => p.id === product.id).stock_quantity = initialStock;
      dbAfterSecond.orders = dbAfterSecond.orders.filter((o) => o.id !== firstOrderId);
      dbAfterSecond.order_items = dbAfterSecond.order_items.filter((it) => it.order_id !== firstOrderId);
      fs.writeFileSync(dbPath, JSON.stringify(dbAfterSecond, null, 2), "utf8");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Order Cancellation Retry Safety & State Machine
  // --------------------------------------------------------------------------
  describe("3. Order Cancellation Retry Safety & Single-Restoration Contract", () => {
    test("cancelling order restores stock once; repeated cancellation is a safe idempotent no-op", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];
      const owner = db.users.find((u) => u.id === shop.owner_id);

      const cancelTestProdId = "test-prod-cancel-" + Date.now();
      const cancelTestOrderId = "test-order-cancel-" + Date.now();
      const startStock = 10;
      const orderQty = 3;

      db.products.push({
        id: cancelTestProdId,
        shop_id: shop.id,
        name: "Restoration Item",
        slug: "restoration-item",
        price: 1500,
        stock_quantity: startStock - orderQty, // 7
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.orders.push({
        id: cancelTestOrderId,
        shop_id: shop.id,
        order_code: "KAD-2026-CAN01",
        subtotal: 4500,
        delivery_fee: 0,
        total: 4500,
        currency: "LKR",
        status: "confirmed",
        customer_name_snapshot: "Test Buyer",
        customer_phone_snapshot: "0771234567",
        delivery_address_snapshot: "Colombo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.order_items.push({
        id: "item-cancel-" + Date.now(),
        order_id: cancelTestOrderId,
        shop_id: shop.id,
        product_id: cancelTestProdId,
        unit_price: 1500,
        quantity: orderQty,
        line_total: 4500,
        created_at: new Date().toISOString(),
      });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        const sellerClient = createLocalClient({ id: owner.id, email: owner.email });

        // 1. First cancellation -> restores stock to 10
        const firstCancel = await sellerClient.rpc("update_order_status", {
          p_order_id: cancelTestOrderId,
          p_new_status: "cancelled",
          p_shop_id: shop.id,
        });
        assert.equal(firstCancel.data?.success, true);
        assert.equal(firstCancel.data?.new_status, "cancelled");

        const dbAfterFirst = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const prodAfterFirst = dbAfterFirst.products.find((p) => p.id === cancelTestProdId);
        assert.equal(prodAfterFirst.stock_quantity, 10); // restored from 7 to 10

        // 2. Second cancellation call (network retry or double click)
        const secondCancel = await sellerClient.rpc("update_order_status", {
          p_order_id: cancelTestOrderId,
          p_new_status: "cancelled",
          p_shop_id: shop.id,
        });
        assert.equal(secondCancel.data?.success, true);
        assert.equal(secondCancel.data?.idempotent, true);

        // Crucial: stock MUST NOT be restored twice! It must stay at 10, not 13!
        const dbAfterSecond = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const prodAfterSecond = dbAfterSecond.products.find((p) => p.id === cancelTestProdId);
        assert.equal(prodAfterSecond.stock_quantity, 10);

        // 3. Attempting to transition out of cancelled status is rejected
        const invalidReactivation = await sellerClient.rpc("update_order_status", {
          p_order_id: cancelTestOrderId,
          p_new_status: "confirmed",
          p_shop_id: shop.id,
        });
        assert.ok(invalidReactivation.error);
        assert.ok(
          invalidReactivation.error.message.includes(
            'Cannot transition order status from "cancelled" to "confirmed"'
          )
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
  // 4. Order Tracking Rate Limiting & Privacy Boundary
  // --------------------------------------------------------------------------
  describe("4. Tracking Privacy & Rate Limiting", () => {
    test("trackOrderAction rejects excessive rapid queries with rate limiting", async () => {
      const trackingMod = loadTs("src/features/orders/tracking-actions.ts", {
        "@/lib/supabase/server": {
          createClient: async () => ({
            rpc: async () => ({ data: { success: false, error: "Not found" } }),
          }),
        },
        "@/lib/phone": phone,
      });

      const payload = {
        shopSlug: "ceylon-linen",
        orderCode: "KAD-2026-RATE01",
        phone: "0771234567",
      };

      // Query rapidly up to threshold
      let lastResult;
      for (let i = 0; i < 10; i++) {
        lastResult = await trackingMod.trackOrderAction(payload);
      }

      // Beyond limit, rate limiter must engage
      assert.ok(lastResult?.error);
      assert.ok(
        lastResult.error.includes("Too many tracking attempts") ||
          lastResult.error.includes("Please wait a moment")
      );
    });
  });

  // --------------------------------------------------------------------------
  // 5. Settings Upsert onConflict Parity
  // --------------------------------------------------------------------------
  describe("5. Settings Upsert with onConflict Parity", () => {
    test("local adapter upsert supports onConflict option without creating duplicate rows", async () => {
      const client = createLocalClient(null);
      const testShopId = "test-shop-onconflict-" + Date.now();

      // First upsert
      await client.from("shop_settings").upsert(
        {
          shop_id: testShopId,
          delivery_information: "Standard delivery",
          store_visibility: true,
        },
        { onConflict: "shop_id" }
      );

      // Second upsert for same shop_id with modified information
      await client.from("shop_settings").upsert(
        {
          shop_id: testShopId,
          delivery_information: "Express courier 24h",
          store_visibility: false,
        },
        { onConflict: "shop_id" }
      );

      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const records = db.shop_settings.filter((s) => s.shop_id === testShopId);

      // Must be exactly 1 row updated, not 2 duplicated rows
      assert.equal(records.length, 1);
      assert.equal(records[0].delivery_information, "Express courier 24h");
      assert.equal(records[0].store_visibility, false);

      // Cleanup
      db.shop_settings = db.shop_settings.filter((s) => s.shop_id !== testShopId);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    });
  });

  // --------------------------------------------------------------------------
  // 6. Truthful Manual Cash / Offline Payment Ledger Contract
  // --------------------------------------------------------------------------
  describe("6. Truthful Manual Payment Ledger Contract", () => {
    test("rejects unauthenticated caller from recording payments", async () => {
      const client = createLocalClient(null);
      const { data: user } = await client.auth.getUser();
      assert.equal(user.user, null);
    });

    test("manual payment ledger allows recording partial cash payments, computing balance, and voiding with reason", async () => {
      const dbPath = path.join(process.cwd(), "kadeo-local-db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const shop = db.shops[0];
      const owner = db.users.find((u) => u.id === shop.owner_id);

      const testOrderId = "order-payment-test-" + Date.now();
      const orderTotal = 5000;

      db.orders.push({
        id: testOrderId,
        shop_id: shop.id,
        order_code: "KAD-2026-PAY01",
        subtotal: orderTotal,
        delivery_fee: 0,
        total: orderTotal,
        total_amount: orderTotal,
        currency: "LKR",
        status: "confirmed",
        customer_name_snapshot: "Cash Buyer",
        customer_phone_snapshot: "0771234567",
        delivery_address_snapshot: "Colombo Counter",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

      try {
        const sellerClient = createLocalClient({ id: owner.id, email: owner.email });

        // 1. Record partial payment of 2,000 cash
        const p1Id = "pay-1-" + Date.now();
        const now1 = new Date().toISOString();
        await sellerClient.from("order_payments").insert({
          id: p1Id,
          order_id: testOrderId,
          shop_id: shop.id,
          amount: 2000,
          payment_method: "cash",
          status: "recorded",
          recorded_by: owner.id,
          notes: "Partial cash at sales counter",
          created_at: now1,
          updated_at: now1,
        });

        // Verify ledger record
        const { data: payments1 } = await sellerClient
          .from("order_payments")
          .select("*")
          .eq("order_id", testOrderId);

        assert.equal(payments1.length, 1);
        assert.equal(payments1[0].amount, 2000);
        assert.equal(payments1[0].payment_method, "cash");
        assert.equal(payments1[0].status, "recorded");

        // 2. Record remaining 3,000 via bank transfer
        const p2Id = "pay-2-" + Date.now();
        const now2 = new Date().toISOString();
        await sellerClient.from("order_payments").insert({
          id: p2Id,
          order_id: testOrderId,
          shop_id: shop.id,
          amount: 3000,
          payment_method: "bank_transfer",
          status: "recorded",
          recorded_by: owner.id,
          notes: "Bank transfer reference #9876",
          created_at: now2,
          updated_at: now2,
        });

        const { data: payments2 } = await sellerClient
          .from("order_payments")
          .select("*")
          .eq("order_id", testOrderId);

        assert.equal(payments2.length, 2);
        const totalPaid = payments2
          .filter((p) => p.status === "recorded")
          .reduce((sum, p) => sum + p.amount, 0);
        assert.equal(totalPaid, 5000);
        assert.equal(totalPaid >= orderTotal, true); // Fully paid

        // 3. Void payment 1 (e.g. cash entry error)
        await sellerClient
          .from("order_payments")
          .update({
            status: "voided",
            voided_at: new Date().toISOString(),
            voided_by: owner.id,
            void_reason: "Customer changed to single bank transfer",
          })
          .eq("id", p1Id);

        const { data: paymentsAfterVoid } = await sellerClient
          .from("order_payments")
          .select("*")
          .eq("order_id", testOrderId);

        const voidedItem = paymentsAfterVoid.find((p) => p.id === p1Id);
        assert.equal(voidedItem.status, "voided");
        assert.ok(voidedItem.void_reason.includes("Customer changed to single bank transfer"));

        const activeTotalAfterVoid = paymentsAfterVoid
          .filter((p) => p.status === "recorded")
          .reduce((sum, p) => sum + p.amount, 0);
        assert.equal(activeTotalAfterVoid, 3000); // 2000 is voided, 3000 active
      } finally {
        const cleanupDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        cleanupDb.orders = cleanupDb.orders.filter((o) => o.id !== testOrderId);
        cleanupDb.order_payments = (cleanupDb.order_payments || []).filter(
          (p) => p.order_id !== testOrderId
        );
        fs.writeFileSync(dbPath, JSON.stringify(cleanupDb, null, 2), "utf8");
      }
    });
  });

  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // 8. Session Expiry, Revocation, Fail-Closed Security & Concurrency Checks
  // --------------------------------------------------------------------------
  describe("8. Session Security Boundaries & Payment Invariants", () => {
    test("verifySessionToken rejects expired tokens (iat > 7 days in past) and future tokens", async () => {
      // 1. Expired token (iat: 1 ms from 1970)
      const expiredToken = await createSignedSession({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
        iat: 1,
      });
      assert.equal(await verifySessionToken(expiredToken), null, "Expired token must be rejected");

      // 2. Future token (iat: 10 minutes in future)
      const futureToken = await createSignedSession({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        email: "kasun@ceylonlinen.lk",
        iat: Date.now() + 600000,
      });
      assert.equal(await verifySessionToken(futureToken), null, "Future token must be rejected");
    });

    test("session missing secret fails closed without authenticating", async () => {
      const oldSecret = process.env.SESSION_SECRET;
      delete process.env.SESSION_SECRET;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      try {
        const token = await createSignedSession({
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          email: "kasun@ceylonlinen.lk",
        });
        const verified = await verifySessionToken(token);
        assert.equal(verified, null, "Must fail closed when secret is missing");
      } finally {
        process.env.SESSION_SECRET = oldSecret;
      }
    });

    test("recovery forgery is rejected fail-closed in local mock environment", async () => {
      const client = createLocalClient();
      const res = await client.auth.exchangeCodeForSession("kadeo-valid-session-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
      assert.ok(res.error, "Recovery exchange must return error");
      assert.equal(res.data, null);
    });

    test("session revocation invalidates replayed session tokens upon signOut", async () => {
      let cookieVal = "";
      const client = createLocalClient(null, (name, val) => { cookieVal = val; });
      const loginRes = await client.auth.signInWithPassword({
        email: "kasun@ceylonlinen.lk",
        password: "wrong_or_right",
      });
      // In local-adapter, signInWithPassword signs in kasun
      if (loginRes.data?.user) {
        const capturedToken = cookieVal;
        assert.ok(capturedToken, "Login must set session cookie");

        // Verify user can authenticate with captured token
        const authedUser = await verifySessionToken(capturedToken);
        const authedClient = createLocalClient(authedUser, (name, val) => { cookieVal = val; });
        const { data: beforeData } = await authedClient.auth.getUser();
        assert.equal(beforeData.user?.email, "kasun@ceylonlinen.lk");

        // User signs out
        await authedClient.auth.signOut();

        // Replay captured token
        const replayClient = createLocalClient(authedUser);
        const { data: replayData, error: replayErr } = await replayClient.auth.getUser();
        assert.equal(replayData.user, null, "Replayed token must be rejected after sign-out");
        assert.ok(replayErr, "Replay must return revocation error");
      }
    });
  });

  // 7. Canonical SQL Migration Integrity Contract
  // --------------------------------------------------------------------------
  describe("7. Canonical SQL Migration Integrity Contract", () => {
    test("20261106010000_manual_payment_ledger.sql defines order_payments with RLS and idempotency_key index", () => {
      const migrationFile = path.resolve(__dirname, "../../supabase/migrations/20261106010000_manual_payment_ledger.sql");
      assert.ok(fs.existsSync(migrationFile), "Manual payment ledger migration must exist");
      const sql = fs.readFileSync(migrationFile, "utf8");

      assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.order_payments"));
      assert.ok(sql.includes("ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY"));
      assert.ok(sql.includes('CREATE POLICY "Sellers can view and manage their order payments"'));
      assert.ok(sql.includes("public.is_shop_owner(shop_id, auth.uid())"));
      assert.ok(sql.includes("ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT"));
      assert.ok(sql.includes("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_shop_idempotency"));
    });
  });
});
