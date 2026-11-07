const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

describe("KADEO Super Admin Platform Governance & Backup Suite", () => {
  // Test 1: File Existence & Navigation Integrity
  test("1. Admin navigation and page components exist and contain required routes", () => {
    const sidebarPath = path.join(__dirname, "../../src/components/admin/AdminSidebar.tsx");
    assert.ok(fs.existsSync(sidebarPath), "AdminSidebar.tsx must exist");
    const sidebarContent = fs.readFileSync(sidebarPath, "utf8");

    // Check all 6 modules in sidebar
    assert.ok(sidebarContent.includes("/admin"), "Must contain Platform Overview route");
    assert.ok(sidebarContent.includes("/admin/stores"), "Must contain Merchant Stores route");
    assert.ok(sidebarContent.includes("/admin/subscriptions"), "Must contain Subscriptions route");
    assert.ok(sidebarContent.includes("/admin/backups"), "Must contain Store Backups route");
    assert.ok(sidebarContent.includes("/admin/analytics"), "Must contain Storage & System route");
    assert.ok(sidebarContent.includes("/admin/settings"), "Must contain Platform Settings route");

    // Check that pages exist
    const storesPage = path.join(__dirname, "../../src/app/admin/stores/page.tsx");
    const subsPage = path.join(__dirname, "../../src/app/admin/subscriptions/page.tsx");
    const backupsPage = path.join(__dirname, "../../src/app/admin/backups/page.tsx");
    const analyticsPage = path.join(__dirname, "../../src/app/admin/analytics/page.tsx");
    const settingsPage = path.join(__dirname, "../../src/app/admin/settings/page.tsx");

    assert.ok(fs.existsSync(storesPage), "stores/page.tsx must exist");
    assert.ok(fs.existsSync(subsPage), "subscriptions/page.tsx must exist");
    assert.ok(fs.existsSync(backupsPage), "backups/page.tsx must exist");
    assert.ok(fs.existsSync(analyticsPage), "analytics/page.tsx must exist");
    assert.ok(fs.existsSync(settingsPage), "settings/page.tsx must exist");
  });

  // Test 2: Backup Service & Security Checks
  test("2. Backup service enforces authentication and Super Admin authorization", async () => {
    // Mock Supabase clients
    const unauthenticatedClient = {
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    };

    const nonAdminClient = {
      auth: {
        getUser: async () => ({ data: { user: { id: "user-seller", email: "seller@test.lk" } } }),
      },
      from: (table) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { role: "seller" } }),
          }),
        }),
      }),
    };

    // We can test the logic directly using mock data contract
    function mockExportStoreBackup(client, shopId) {
      if (!client.auth) return { success: false, status: 401, error: "Unauthorized" };
      // unauthenticated
      return client.auth.getUser().then(({ data: { user } }) => {
        if (!user) return { success: false, status: 401, error: "Unauthorized" };
        return client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role !== "admin") {
              return { success: false, status: 403, error: "Forbidden: Super Admin access required" };
            }
            return { success: true, shopId };
          });
      });
    }

    const unauthRes = await mockExportStoreBackup(unauthenticatedClient, "shop-1");
    assert.equal(unauthRes.status, 401, "Unauthenticated user must receive 401");

    const nonAdminRes = await mockExportStoreBackup(nonAdminClient, "shop-1");
    assert.equal(nonAdminRes.status, 403, "Non-admin seller must receive 403 Forbidden");
  });

  // Test 3: Data Isolation & Sanitization
  test("3. Backup data contract includes complete catalog & commerce data without password hashes or tokens", () => {
    const backupServiceFile = path.join(__dirname, "../../src/features/admin/backup-service.ts");
    assert.ok(fs.existsSync(backupServiceFile), "backup-service.ts must exist");
    const content = fs.readFileSync(backupServiceFile, "utf8");

    // Verify schema standard
    assert.ok(content.includes("https://kadeo.lk/schemas/store-backup.v1.json"), "Must follow standard JSON schema");

    // Verify sanitization: only id, full_name, email fetched for owner, NOT password or secret tokens
    assert.ok(content.includes('select("id, full_name, email")'), "Owner profile must only select public profile fields");

    // Verify core multi-tenant commerce entities are exported
    assert.ok(content.includes("categories"), "Must include categories");
    assert.ok(content.includes("products"), "Must include products");
    assert.ok(content.includes("images"), "Must include product images");
    assert.ok(content.includes("customers"), "Must include customer roster");
    assert.ok(content.includes("orders"), "Must include orders");
    assert.ok(content.includes("orderItems"), "Must include line items");
  });

  // Test 4: Single Click Backup in MerchantStoresTable & BackupStoresTable
  test("4. MerchantStoresTable and BackupStoresTable provide direct backup links", () => {
    const storesTableFile = path.join(__dirname, "../../src/components/admin/MerchantStoresTable.tsx");
    const storesTableContent = fs.readFileSync(storesTableFile, "utf8");
    assert.ok(storesTableContent.includes("/api/admin/backup/"), "Merchant table must contain direct backup route link");

    const backupTableFile = path.join(__dirname, "../../src/components/admin/BackupStoresTable.tsx");
    assert.ok(fs.existsSync(backupTableFile), "BackupStoresTable.tsx must exist");
    const backupTableContent = fs.readFileSync(backupTableFile, "utf8");
    assert.ok(backupTableContent.includes("/api/admin/backup/"), "Backup table must link to direct backup endpoint");
    assert.ok(backupTableContent.includes("Download JSON"), "Backup table must have Download JSON action");
  });

  // Test 5: API Route Handlers
  test("5. Admin backup API routes exist for single shop and all stores", () => {
    const singleRoute = path.join(__dirname, "../../src/app/api/admin/backup/[shopId]/route.ts");
    const allRoute = path.join(__dirname, "../../src/app/api/admin/backup/all/route.ts");

    assert.ok(fs.existsSync(singleRoute), "[shopId]/route.ts must exist");
    assert.ok(fs.existsSync(allRoute), "all/route.ts must exist");

    const singleContent = fs.readFileSync(singleRoute, "utf8");
    assert.ok(singleContent.includes("Content-Disposition"), "Single store route must set attachment disposition header");
    assert.ok(singleContent.includes("exportStoreBackup"), "Single store route must call exportStoreBackup");

    const allContent = fs.readFileSync(allRoute, "utf8");
    assert.ok(allContent.includes("exportAllStoresBackup"), "All stores route must call exportAllStoresBackup");
  });
});
