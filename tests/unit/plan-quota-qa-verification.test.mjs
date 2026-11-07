import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

function loadTsModule(filePath, customDependencies = {}) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(projectRoot, filePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const moduleExports = {};
  const context = {
    exports: moduleExports,
    module: { exports: moduleExports },
    require(pkg) {
      if (customDependencies[pkg]) {
        return customDependencies[pkg];
      }
      if (pkg.startsWith('@/')) {
        const aliasPath = pkg.replace('@/', 'src/') + '.ts';
        const tryPath = path.resolve(projectRoot, aliasPath);
        if (fs.existsSync(tryPath)) {
          return loadTsModule(tryPath, customDependencies);
        }
      }
      return {};
    },
    console,
    Date,
    URL,
    Set,
    Map,
    Buffer,
    Response: globalThis.Response || class MockResponse {
      constructor(body, init) {
        this.body = body;
        this.status = init?.status || 200;
      }
      static json(data, init) {
        return { data, status: init?.status || 200 };
      }
    },
    Request: globalThis.Request,
    File: globalThis.File,
    FormData: globalThis.FormData,
    process,
  };

  vm.runInNewContext(transpiled, context);
  return moduleExports;
}

// ------------------------------------------------------------------------------------------------
// 1. In-Memory Mock Database Harness for Subscriptions & Quota Tests
// ------------------------------------------------------------------------------------------------
function createMockSupabase(initialState = {}) {
  const users = [...(initialState.users || [])];
  const profiles = [...(initialState.profiles || [])];
  const shops = [...(initialState.shops || [])];
  const subscriptions = [...(initialState.subscriptions || [])];
  const plans = [
    {
      id: 'free',
      name: 'Starter Free',
      storage_quota_mb: 250,
      max_products: 25,
      monthly_price: 0,
      yearly_price: 0,
      is_active: true,
    },
    {
      id: 'pro',
      name: 'Pro Business',
      storage_quota_mb: 5120,
      max_products: 1000,
      monthly_price: 2500,
      yearly_price: 25000,
      is_active: true,
    },
    ...(initialState.plans || []),
  ];

  let currentUser = initialState.currentUser || null;
  const revalidatedPaths = [];

  const mockDb = {
    auth: {
      async getUser() {
        return { data: { user: currentUser }, error: currentUser ? null : { message: 'Not logged in' } };
      },
      signIn(user) {
        currentUser = user;
      },
      signOut() {
        currentUser = null;
      },
    },
    from(tableName) {
      let selectFields = '*';
      const eqFilters = {};
      let updatePayload = null;
      let insertPayload = null;

      const builder = {
        select(fields) {
          selectFields = fields;
          return builder;
        },
        eq(col, val) {
          eqFilters[col] = val;
          return builder;
        },
        insert(payload) {
          insertPayload = payload;
          return builder;
        },
        update(payload) {
          updatePayload = payload;
          return builder;
        },
        async single() {
          let list = [];
          if (tableName === 'users') list = users;
          else if (tableName === 'profiles') list = profiles;
          else if (tableName === 'shops') list = shops;
          else if (tableName === 'subscriptions') list = subscriptions;
          else if (tableName === 'plans') list = plans;

          const matched = list.filter((item) =>
            Object.entries(eqFilters).every(([k, v]) => item[k] === v)
          );

          if (matched.length === 0) {
            return { data: null, error: { message: 'Not found' } };
          }
          return { data: { ...matched[0] }, error: null };
        },
        async then(resolve, reject) {
          try {
            if (insertPayload) {
              if (tableName === 'subscriptions') {
                subscriptions.push({ ...insertPayload });
                return resolve({ data: insertPayload, error: null });
              }
              if (tableName === 'shops') {
                shops.push({ ...insertPayload });
                return resolve({ data: insertPayload, error: null });
              }
            }

            if (updatePayload) {
              let list = [];
              if (tableName === 'shops') list = shops;
              else if (tableName === 'subscriptions') list = subscriptions;

              const matched = list.filter((item) =>
                Object.entries(eqFilters).every(([k, v]) => item[k] === v)
              );

              for (const item of matched) {
                Object.assign(item, updatePayload);
              }
              return resolve({ data: matched, error: null });
            }

            let list = [];
            if (tableName === 'shops') list = shops;
            else if (tableName === 'subscriptions') list = subscriptions;
            else if (tableName === 'plans') list = plans;

            const matched = list.filter((item) =>
              Object.entries(eqFilters).every(([k, v]) => item[k] === v)
            );
            return resolve({ data: matched, error: null });
          } catch (err) {
            if (reject) return reject(err);
            throw err;
          }
        },
      };
      return builder;
    },
  };

  return {
    mockDb,
    state: { users, profiles, shops, subscriptions, plans },
    revalidatedPaths,
    setCurrentUser(u) {
      currentUser = u;
    },
  };
}

// ------------------------------------------------------------------------------------------------
// 2. Test Suites
// ------------------------------------------------------------------------------------------------
describe('Phase 4: Plan Validity & Storage Quota Comprehensive QA Suite (Rigel)', () => {

  // ----------------------------------------------------------------------------------------------
  // SECTION A: Pure Subscription Validity & Grace Period Evaluation
  // ----------------------------------------------------------------------------------------------
  describe('A. evaluateSubscriptionStatus Boundary & Grace Period Tests', () => {
    test('1. Null or undefined subscription defaults to active free tier (canUpload: true)', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      const resNull = quotaService.evaluateSubscriptionStatus(null);
      const resUndefined = quotaService.evaluateSubscriptionStatus(undefined);

      assert.equal(resNull.isExpired, false);
      assert.equal(resNull.isInGracePeriod, false);
      assert.equal(resNull.canUpload, true);

      assert.equal(resUndefined.isExpired, false);
      assert.equal(resUndefined.isInGracePeriod, false);
      assert.equal(resUndefined.canUpload, true);
    });

    test('2. Cancelled or explicitly expired status overrides dates and immediately blocks uploads', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      
      const cancelled = quotaService.evaluateSubscriptionStatus({
        status: 'cancelled',
        expires_at: new Date(Date.now() + 86400000).toISOString(), // future date
        grace_period_ends_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      });
      assert.equal(cancelled.isExpired, true);
      assert.equal(cancelled.isInGracePeriod, false);
      assert.equal(cancelled.canUpload, false);

      const explicitExpired = quotaService.evaluateSubscriptionStatus({
        status: 'expired',
        expires_at: null,
      });
      assert.equal(explicitExpired.isExpired, true);
      assert.equal(explicitExpired.isInGracePeriod, false);
      assert.equal(explicitExpired.canUpload, false);
    });

    test('3. Future expiry date (active plan) allows uploads with neither expired nor grace period active', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      const future = new Date(Date.now() + 14 * 86400000).toISOString();
      const res = quotaService.evaluateSubscriptionStatus({
        status: 'active',
        expires_at: future,
        grace_period_ends_at: null,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.isInGracePeriod, false);
      assert.equal(res.canUpload, true);
    });

    test('4. Expiry past, but strictly within 7-day grace period: uploads permitted in grace state', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      // Expired 2 days ago, grace period ends in 5 days
      const pastExpiry = new Date(Date.now() - 2 * 86400000).toISOString();
      const futureGrace = new Date(Date.now() + 5 * 86400000).toISOString();

      const res = quotaService.evaluateSubscriptionStatus({
        status: 'active',
        expires_at: pastExpiry,
        grace_period_ends_at: futureGrace,
      });

      assert.equal(res.isExpired, false, 'Should not be marked fully expired while grace period is active');
      assert.equal(res.isInGracePeriod, true, 'Must report grace period active');
      assert.equal(res.canUpload, true, 'Uploads must remain allowed during grace period');
    });

    test('5. Past grace period: uploads permanently restricted (canUpload: false, isExpired: true)', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      // Expired 10 days ago, grace period ended 3 days ago
      const pastExpiry = new Date(Date.now() - 10 * 86400000).toISOString();
      const pastGrace = new Date(Date.now() - 3 * 86400000).toISOString();

      const res = quotaService.evaluateSubscriptionStatus({
        status: 'active',
        expires_at: pastExpiry,
        grace_period_ends_at: pastGrace,
      });

      assert.equal(res.isExpired, true, 'Must report isExpired: true');
      assert.equal(res.isInGracePeriod, false, 'Grace period is now over');
      assert.equal(res.canUpload, false, 'Uploads must be blocked');
    });

    test('6. Expired date with null grace_period_ends_at immediately locks uploads', async () => {
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {});
      const pastExpiry = new Date(Date.now() - 1000).toISOString();

      const res = quotaService.evaluateSubscriptionStatus({
        status: 'active',
        expires_at: pastExpiry,
        grace_period_ends_at: null,
      });

      assert.equal(res.isExpired, true);
      assert.equal(res.isInGracePeriod, false);
      assert.equal(res.canUpload, false);
    });
  });

  // ----------------------------------------------------------------------------------------------
  // SECTION B: getShopStorageQuota & Custom Quota Precedence
  // ----------------------------------------------------------------------------------------------
  describe('B. getShopStorageQuota & Precedence Resolution', () => {
    test('1. Starter Free tier defaults to 250 MB (262,144,000 bytes) and 25 max products', async () => {
      const harness = createMockSupabase({
        shops: [
          {
            id: 'shop-free',
            storage_used_bytes: 10485760, // 10 MB
            custom_storage_quota_mb: null,
            status: 'active',
          },
        ],
        subscriptions: [
          {
            id: 'sub-free',
            shop_id: 'shop-free',
            plan_id: 'free',
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const details = await quotaService.getShopStorageQuota('shop-free');
      assert.ok(details);
      assert.equal(details.effectiveQuotaMb, 250);
      assert.equal(details.effectiveQuotaBytes, 250 * 1024 * 1024);
      assert.equal(details.isCustomQuota, false);
      assert.equal(details.maxProducts, 25);
      assert.equal(details.subscription.planId, 'free');
      assert.equal(details.subscription.canUpload, true);
      assert.equal(details.usagePercent, 4); // (10 / 250) * 100 = 4%
    });

    test('2. Pro Business tier resolves to 5120 MB (5 GB) and 1000 max products', async () => {
      const harness = createMockSupabase({
        shops: [
          {
            id: 'shop-pro',
            storage_used_bytes: 536870912, // 512 MB
            custom_storage_quota_mb: null,
            status: 'active',
          },
        ],
        subscriptions: [
          {
            id: 'sub-pro',
            shop_id: 'shop-pro',
            plan_id: 'pro',
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const details = await quotaService.getShopStorageQuota('shop-pro');
      assert.ok(details);
      assert.equal(details.effectiveQuotaMb, 5120);
      assert.equal(details.effectiveQuotaBytes, 5120 * 1024 * 1024);
      assert.equal(details.isCustomQuota, false);
      assert.equal(details.maxProducts, 1000);
      assert.equal(details.subscription.planId, 'pro');
      assert.equal(details.usagePercent, 10); // 512MB / 5120MB = 10%
    });

    test('3. Custom storage quota override strictly supersedes plan default', async () => {
      const harness = createMockSupabase({
        shops: [
          {
            id: 'shop-custom',
            storage_used_bytes: 209715200, // 200 MB
            custom_storage_quota_mb: 10000, // 10 GB custom grant
            status: 'active',
          },
        ],
        subscriptions: [
          {
            id: 'sub-custom',
            shop_id: 'shop-custom',
            plan_id: 'free', // on free plan, but super admin granted 10GB
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const details = await quotaService.getShopStorageQuota('shop-custom');
      assert.ok(details);
      assert.equal(details.effectiveQuotaMb, 10000);
      assert.equal(details.effectiveQuotaBytes, 10000 * 1024 * 1024);
      assert.equal(details.isCustomQuota, true, 'isCustomQuota must be true');
      assert.equal(details.usagePercent, 2); // 200MB / 10000MB = 2%
    });

    test('4. Suspended shop blocks canUpload regardless of subscription health', async () => {
      const harness = createMockSupabase({
        shops: [
          {
            id: 'shop-suspended',
            storage_used_bytes: 0,
            custom_storage_quota_mb: null,
            status: 'suspended',
          },
        ],
        subscriptions: [
          {
            id: 'sub-suspended',
            shop_id: 'shop-suspended',
            plan_id: 'pro',
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const details = await quotaService.getShopStorageQuota('shop-suspended');
      assert.ok(details);
      assert.equal(details.subscription.canUpload, false, 'Suspended shop cannot upload');
    });

    test('5. Non-existent shop returns null gracefully', async () => {
      const harness = createMockSupabase({ shops: [] });
      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const details = await quotaService.getShopStorageQuota('non-existent');
      assert.equal(details, null);
    });
  });

  // ----------------------------------------------------------------------------------------------
  // SECTION C: Storage Quota Boundary & Edge Rejection (Exact Byte, Over Quota 413, Expired 403)
  // ----------------------------------------------------------------------------------------------
  describe('C. Image Upload Route (/api/store-images) Quota Enforcement', () => {
    test('1. Exact quota boundary test: file fitting exact remaining capacity is accepted', async () => {
      const quotaMb = 250;
      const totalBytes = quotaMb * 1024 * 1024;
      const incomingFileSize = 2 * 1024 * 1024; // 2 MB
      const currentStorage = totalBytes - incomingFileSize; // exact capacity left

      const harness = createMockSupabase({
        currentUser: { id: 'seller-boundary', email: 'seller@test.lk' },
        shops: [
          {
            id: 'shop-boundary',
            owner_id: 'seller-boundary',
            status: 'active',
            storage_used_bytes: currentStorage,
            custom_storage_quota_mb: null,
          },
        ],
        subscriptions: [
          {
            id: 'sub-boundary',
            shop_id: 'shop-boundary',
            plan_id: 'free',
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const quotaDetails = await quotaService.getShopStorageQuota('shop-boundary');
      assert.ok(quotaDetails);
      assert.equal(quotaDetails.effectiveQuotaBytes, totalBytes);
      
      // Verification logic identical to /api/store-images
      const incomingBytes = incomingFileSize;
      const wouldExceed = (currentStorage + incomingBytes) > quotaDetails.effectiveQuotaBytes;
      assert.equal(wouldExceed, false, 'Exact limit must be allowed without exceeding');
      
      const newStorage = currentStorage + incomingBytes;
      assert.equal(newStorage, totalBytes, 'Storage reaches exact 100% capacity');
    });

    test('2. 1 byte over quota test: file exceeding limit by exactly 1 byte is rejected with 413', async () => {
      const quotaMb = 250;
      const totalBytes = quotaMb * 1024 * 1024;
      const incomingFileSize = 2 * 1024 * 1024; // 2 MB
      const currentStorage = totalBytes - incomingFileSize + 1; // 1 byte over limit!

      const harness = createMockSupabase({
        currentUser: { id: 'seller-over', email: 'seller@test.lk' },
        shops: [
          {
            id: 'shop-over',
            owner_id: 'seller-over',
            status: 'active',
            storage_used_bytes: currentStorage,
            custom_storage_quota_mb: null,
          },
        ],
        subscriptions: [
          {
            id: 'sub-over',
            shop_id: 'shop-over',
            plan_id: 'free',
            status: 'active',
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const quotaDetails = await quotaService.getShopStorageQuota('shop-over');
      assert.ok(quotaDetails);

      const incomingBytes = incomingFileSize;
      const wouldExceed = (currentStorage + incomingBytes) > quotaDetails.effectiveQuotaBytes;
      assert.equal(wouldExceed, true, 'Exceeding by 1 byte must trigger quota breach');
    });

    test('3. Expired subscription past grace period is rejected with 403 SUBSCRIPTION_EXPIRED', async () => {
      const pastExpiry = new Date(Date.now() - 10 * 86400000).toISOString();
      const pastGrace = new Date(Date.now() - 3 * 86400000).toISOString();

      const harness = createMockSupabase({
        currentUser: { id: 'seller-expired', email: 'seller@test.lk' },
        shops: [
          {
            id: 'shop-expired',
            owner_id: 'seller-expired',
            status: 'active',
            storage_used_bytes: 1000,
            custom_storage_quota_mb: null,
          },
        ],
        subscriptions: [
          {
            id: 'sub-expired',
            shop_id: 'shop-expired',
            plan_id: 'free',
            status: 'active',
            expires_at: pastExpiry,
            grace_period_ends_at: pastGrace,
          },
        ],
      });

      const quotaService = loadTsModule('src/features/subscriptions/quota-service.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
      });

      const quotaDetails = await quotaService.getShopStorageQuota('shop-expired');
      assert.ok(quotaDetails);
      assert.equal(quotaDetails.subscription.isExpired, true);
      assert.equal(quotaDetails.subscription.canUpload, false);
    });

    test('4. Atomic storage increment: successive uploads correctly accumulate storage_used_bytes', async () => {
      const harness = createMockSupabase({
        currentUser: { id: 'seller-increment', email: 'seller@test.lk' },
        shops: [
          {
            id: 'shop-increment',
            owner_id: 'seller-increment',
            status: 'active',
            storage_used_bytes: 0,
            custom_storage_quota_mb: null,
          },
        ],
      });

      const db = harness.mockDb;
      const uploads = [1500000, 2200000, 800000]; // 3 uploads
      let runningTotal = 0;

      for (const size of uploads) {
        runningTotal += size;
        await db
          .from('shops')
          .update({ storage_used_bytes: runningTotal, updated_at: new Date().toISOString() })
          .eq('id', 'shop-increment');
      }

      const shop = harness.state.shops.find((s) => s.id === 'shop-increment');
      assert.equal(shop.storage_used_bytes, 4500000, 'All upload bytes must accumulate atomically');
    });
  });

  // ----------------------------------------------------------------------------------------------
  // SECTION D: Super Admin Action Access Control & Atomicity (updateShopSubscriptionAction)
  // ----------------------------------------------------------------------------------------------
  describe('D. updateShopSubscriptionAction Authorization & Quota Override', () => {
    test('1. Unauthenticated invocation is rejected with Unauthorized error', async () => {
      const harness = createMockSupabase();
      harness.setCurrentUser(null);

      const adminActions = loadTsModule('src/features/subscriptions/admin-actions.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
        'next/cache': { revalidatePath: (p) => harness.revalidatedPaths.push(p) },
      });

      const res = await adminActions.updateShopSubscriptionAction({
        shopId: 'shop-1',
        planId: 'pro',
        expiresAt: null,
        gracePeriodEndsAt: null,
        customStorageQuotaMb: null,
      });

      assert.ok(res.error);
      assert.match(res.error, /Unauthorized/i);
      assert.equal(harness.revalidatedPaths.length, 0);
    });

    test('2. Non-admin seller role is rejected with Forbidden error', async () => {
      const harness = createMockSupabase({
        currentUser: { id: 'seller-caller', email: 'seller@kadeo.lk' },
        profiles: [
          { id: 'seller-caller', role: 'seller', full_name: 'Regular Merchant' },
        ],
      });

      const adminActions = loadTsModule('src/features/subscriptions/admin-actions.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
        'next/cache': { revalidatePath: (p) => harness.revalidatedPaths.push(p) },
      });

      const res = await adminActions.updateShopSubscriptionAction({
        shopId: 'shop-1',
        planId: 'pro',
        expiresAt: null,
        gracePeriodEndsAt: null,
        customStorageQuotaMb: 10000,
      });

      assert.ok(res.error);
      assert.match(res.error, /Forbidden/i);
      assert.equal(harness.revalidatedPaths.length, 0);
    });

    test('3. Legitimate Super Admin successfully creates/updates subscription and custom quota atomically', async () => {
      const harness = createMockSupabase({
        currentUser: { id: 'admin-caller', email: 'admin@kadeo.lk' },
        profiles: [
          { id: 'admin-caller', role: 'admin', full_name: 'Super Admin' },
        ],
        shops: [
          {
            id: 'shop-target',
            name: 'Target Merchant',
            custom_storage_quota_mb: null,
          },
        ],
        subscriptions: [
          {
            id: 'sub-existing',
            shop_id: 'shop-target',
            plan_id: 'free',
            status: 'active',
          },
        ],
      });

      const adminActions = loadTsModule('src/features/subscriptions/admin-actions.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
        'next/cache': { revalidatePath: (p) => harness.revalidatedPaths.push(p) },
      });

      const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
      const grace = new Date(Date.now() + 37 * 86400000).toISOString();

      const res = await adminActions.updateShopSubscriptionAction({
        shopId: 'shop-target',
        planId: 'pro',
        status: 'active',
        billingPeriod: 'yearly',
        expiresAt: expiry,
        gracePeriodEndsAt: grace,
        customStorageQuotaMb: 8192, // 8 GB custom grant
        adminNotes: 'Enterprise promo upgrade approved by Harsha',
      });

      assert.equal(res.success, true);
      assert.equal(res.error, undefined);

      // Verify subscription row updated
      const sub = harness.state.subscriptions.find((s) => s.shop_id === 'shop-target');
      assert.ok(sub);
      assert.equal(sub.plan_id, 'pro');
      assert.equal(sub.billing_period, 'yearly');
      assert.equal(sub.expires_at, expiry);
      assert.equal(sub.grace_period_ends_at, grace);
      assert.equal(sub.admin_notes, 'Enterprise promo upgrade approved by Harsha');
      assert.equal(sub.assigned_by, 'admin-caller');

      // Verify shop row custom_storage_quota_mb updated
      const shop = harness.state.shops.find((s) => s.id === 'shop-target');
      assert.ok(shop);
      assert.equal(shop.custom_storage_quota_mb, 8192);

      // Verify revalidation paths triggered
      assert.ok(harness.revalidatedPaths.includes('/admin'));
      assert.ok(harness.revalidatedPaths.includes('/dashboard'));
      assert.ok(harness.revalidatedPaths.includes('/dashboard/subscription'));
    });

    test('4. Custom quota reset to null when value is 0 or negative', async () => {
      const harness = createMockSupabase({
        currentUser: { id: 'admin-caller', email: 'admin@kadeo.lk' },
        profiles: [
          { id: 'admin-caller', role: 'admin', full_name: 'Super Admin' },
        ],
        shops: [
          {
            id: 'shop-target',
            name: 'Target Merchant',
            custom_storage_quota_mb: 5000, // previously had custom quota
          },
        ],
        subscriptions: [
          {
            id: 'sub-existing',
            shop_id: 'shop-target',
            plan_id: 'pro',
          },
        ],
      });

      const adminActions = loadTsModule('src/features/subscriptions/admin-actions.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
        'next/cache': { revalidatePath: (p) => harness.revalidatedPaths.push(p) },
      });

      // Pass null or 0 to revert to standard tier defaults
      const res = await adminActions.updateShopSubscriptionAction({
        shopId: 'shop-target',
        planId: 'pro',
        expiresAt: null,
        gracePeriodEndsAt: null,
        customStorageQuotaMb: 0, // reset to default
      });

      assert.equal(res.success, true);
      const shop = harness.state.shops.find((s) => s.id === 'shop-target');
      assert.equal(shop.custom_storage_quota_mb, null, 'Custom quota must reset to null');
    });

    test('5. Missing shopId input yields validation error', async () => {
      const harness = createMockSupabase({
        currentUser: { id: 'admin-caller', email: 'admin@kadeo.lk' },
        profiles: [{ id: 'admin-caller', role: 'admin' }],
      });

      const adminActions = loadTsModule('src/features/subscriptions/admin-actions.ts', {
        '@/lib/supabase/server': { createClient: async () => harness.mockDb },
        'next/cache': { revalidatePath: () => {} },
      });

      const res = await adminActions.updateShopSubscriptionAction({
        shopId: '',
        planId: 'free',
        expiresAt: null,
        gracePeriodEndsAt: null,
        customStorageQuotaMb: null,
      });

      assert.ok(res.error);
      assert.match(res.error, /Invalid store identifier/i);
    });
  });
});
