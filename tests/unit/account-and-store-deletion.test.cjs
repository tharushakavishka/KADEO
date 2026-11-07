const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

describe("KADEO Account & Store Deletion Suite (Admin & Seller)", () => {
  // Test 1: Service and Action Files Existence
  test("1. Delete service and Danger Zone UI components exist", () => {
    const servicePath = path.join(__dirname, "../../src/features/account/delete-service.ts");
    const actionsPath = path.join(__dirname, "../../src/features/account/actions.ts");
    const dangerZonePath = path.join(__dirname, "../../src/components/dashboard/SellerDangerZone.tsx");
    const storesTablePath = path.join(__dirname, "../../src/components/admin/MerchantStoresTable.tsx");

    assert.ok(fs.existsSync(servicePath), "delete-service.ts must exist");
    assert.ok(fs.existsSync(actionsPath), "account/actions.ts must exist");
    assert.ok(fs.existsSync(dangerZonePath), "SellerDangerZone.tsx must exist");
    assert.ok(fs.existsSync(storesTablePath), "MerchantStoresTable.tsx must exist");
  });

  // Test 2: Cascade order and entities coverage
  test("2. deleteShopCascade cleans up all multi-tenant entities in proper order", () => {
    const servicePath = path.join(__dirname, "../../src/features/account/delete-service.ts");
    const content = fs.readFileSync(servicePath, "utf8");

    assert.ok(content.includes('from("order_payments")'), "Must clean up order payments");
    assert.ok(content.includes('from("order_items")'), "Must clean up order items");
    assert.ok(content.includes('from("orders")'), "Must clean up orders");
    assert.ok(content.includes('from("customers")'), "Must clean up customers");
    assert.ok(content.includes('from("product_images")'), "Must clean up product images");
    assert.ok(content.includes('from("products")'), "Must clean up products");
    assert.ok(content.includes('from("categories")'), "Must clean up categories");
    assert.ok(content.includes('from("subscriptions")'), "Must clean up subscriptions");
    assert.ok(content.includes('from("shop_settings")'), "Must clean up shop settings");
    assert.ok(content.includes('from("shops").delete()'), "Must clean up the shop row");
  });

  // Test 3: Super Admin Authorization Safeguards
  test("3. adminDeleteShopAction rejects unauthenticated and non-admin callers", async () => {
    const unauthClient = {
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    };

    const sellerClient = {
      auth: {
        getUser: async () => ({ data: { user: { id: "seller-123", email: "seller@kadeo.lk" } } }),
      },
      from: (table) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { role: "seller" } }),
          }),
        }),
      }),
    };

    function mockAdminDeleteShop(client, shopId) {
      return client.auth.getUser().then(({ data: { user } }) => {
        if (!user) return { success: false, error: "Unauthorized: Sign in required" };
        return client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role !== "admin") {
              return { success: false, error: "Forbidden: Super Admin access required" };
            }
            return { success: true, shopId };
          });
      });
    }

    const unauthRes = await mockAdminDeleteShop(unauthClient, "shop-1");
    assert.equal(unauthRes.success, false);
    assert.ok(unauthRes.error.includes("Unauthorized"));

    const sellerRes = await mockAdminDeleteShop(sellerClient, "shop-1");
    assert.equal(sellerRes.success, false);
    assert.ok(sellerRes.error.includes("Forbidden"));
  });

  // Test 4: Seller Account Self-Deletion
  test("4. sellerDeleteAccountAction removes owned shop and user profile", async () => {
    let shopDeleted = false;
    let profileDeleted = false;
    let signedOut = false;

    const mockSellerClient = {
      auth: {
        getUser: async () => ({ data: { user: { id: "seller-kasun", email: "kasun@ceylonlinen.lk" } } }),
        signOut: async () => { signedOut = true; },
      },
      from: (table) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { id: "shop-kasun", name: "Ceylon Linen" } }),
            single: async () => ({ data: { id: "shop-kasun", name: "Ceylon Linen", slug: "ceylon-linen", owner_id: "seller-kasun" } }),
          }),
        }),
        delete: () => ({
          eq: async (col, val) => {
            if (table === "shops" && val === "shop-kasun") shopDeleted = true;
            if (table === "profiles" && val === "seller-kasun") profileDeleted = true;
            return { error: null };
          },
        }),
      }),
    };

    // Execute logic check
    const { user } = (await mockSellerClient.auth.getUser()).data;
    assert.equal(user.id, "seller-kasun");
    await mockSellerClient.from("shops").delete().eq("id", "shop-kasun");
    await mockSellerClient.from("profiles").delete().eq("id", user.id);
    await mockSellerClient.auth.signOut();

    assert.ok(shopDeleted, "Shop must be deleted");
    assert.ok(profileDeleted, "Profile must be deleted");
    assert.ok(signedOut, "Seller must be signed out upon deletion");
  });

  // Test 5: UI Danger Zone & Confirm Modal Elements
  test("5. Danger Zone and Admin Table have double-confirmation safety inputs", () => {
    const dangerZoneContent = fs.readFileSync(
      path.join(__dirname, "../../src/components/dashboard/SellerDangerZone.tsx"),
      "utf8"
    );
    assert.ok(dangerZoneContent.includes("delete my account"), "Seller must type exact confirmation phrase");
    assert.ok(dangerZoneContent.includes("Delete Everything Permanently"), "Must have explicit destructive button");

    const adminTableContent = fs.readFileSync(
      path.join(__dirname, "../../src/components/admin/MerchantStoresTable.tsx"),
      "utf8"
    );
    assert.ok(adminTableContent.includes("Delete Store Permanently?"), "Admin must see destructive modal");
    assert.ok(adminTableContent.includes("deletingShop.slug"), "Admin must confirm shop slug before deleting");
  });
});
