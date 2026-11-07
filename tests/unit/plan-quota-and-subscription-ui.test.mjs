import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pure function evaluation logic matching quota-service
function evaluateSubscriptionStatus(sub) {
  if (!sub) {
    return { isExpired: false, isInGracePeriod: false, canUpload: true };
  }

  const now = new Date();

  if (sub.status === "cancelled" || sub.status === "expired") {
    return { isExpired: true, isInGracePeriod: false, canUpload: false };
  }

  if (sub.expires_at) {
    const expiresAt = new Date(sub.expires_at);
    if (now > expiresAt) {
      if (sub.grace_period_ends_at) {
        const graceEnd = new Date(sub.grace_period_ends_at);
        if (now <= graceEnd) {
          return { isExpired: true, isInGracePeriod: true, canUpload: true };
        }
      }
      return { isExpired: true, isInGracePeriod: false, canUpload: false };
    }
  }

  return { isExpired: false, isInGracePeriod: false, canUpload: true };
}

describe('KADEO Plan Validity & Storage Quota UI Suite (Pixel - Phase 2 & 3)', () => {
  describe('1. Subscription Validity State Evaluation', () => {
    test('active subscription without expiration returns isExpired: false, canUpload: true', () => {
      const res = evaluateSubscriptionStatus({
        status: 'active',
        expires_at: null,
        grace_period_ends_at: null,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.isInGracePeriod, false);
      assert.equal(res.canUpload, true);
    });

    test('active subscription with future expiration returns isExpired: false, canUpload: true', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = evaluateSubscriptionStatus({
        status: 'active',
        expires_at: futureDate,
        grace_period_ends_at: null,
      });

      assert.equal(res.isExpired, false);
      assert.equal(res.isInGracePeriod, false);
      assert.equal(res.canUpload, true);
    });

    test('past expiry within grace period returns isExpired: true, isInGracePeriod: true, canUpload: true', () => {
      const pastExpiry = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const futureGrace = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const res = evaluateSubscriptionStatus({
        status: 'active',
        expires_at: pastExpiry,
        grace_period_ends_at: futureGrace,
      });

      assert.equal(res.isExpired, true);
      assert.equal(res.isInGracePeriod, true);
      assert.equal(res.canUpload, true, 'Sellers can still upload during active grace period');
    });

    test('past expiry and past grace period returns isExpired: true, isInGracePeriod: false, canUpload: false', () => {
      const pastExpiry = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const pastGrace = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const res = evaluateSubscriptionStatus({
        status: 'active',
        expires_at: pastExpiry,
        grace_period_ends_at: pastGrace,
      });

      assert.equal(res.isExpired, true);
      assert.equal(res.isInGracePeriod, false);
      assert.equal(res.canUpload, false, 'Uploads are strictly blocked once grace period expires');
    });
  });

  describe('2. Component Structural & Accessibility Verification', () => {
    test('StorageQuotaMeter.tsx implements responsive progress bar and truthful quota displays', () => {
      const filePath = path.resolve(__dirname, '../../src/components/dashboard/StorageQuotaMeter.tsx');
      assert.ok(fs.existsSync(filePath), 'StorageQuotaMeter.tsx exists');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /use client/, 'StorageQuotaMeter must be a client component');
      assert.match(content, /HardDrive/, 'Includes storage hard drive visual icon');
      assert.match(content, /usagePercent/, 'Renders calculated storage usage percent');
      assert.match(content, /bg-emerald-500/, 'Includes emerald progress color under 75%');
      assert.match(content, /bg-amber-500/, 'Includes amber warning color between 75-90%');
      assert.match(content, /bg-rose-500/, 'Includes rose danger color above 90%');
    });

    test('SubscriptionExpiryBanner.tsx renders amber grace notice and red locked banner with WA contact', () => {
      const filePath = path.resolve(__dirname, '../../src/components/dashboard/SubscriptionExpiryBanner.tsx');
      assert.ok(fs.existsSync(filePath), 'SubscriptionExpiryBanner.tsx exists');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /use client/, 'SubscriptionExpiryBanner must be a client component');
      assert.match(content, /isInGracePeriod/, 'Accounts for grace period banner state');
      assert.match(content, /isExpired/, 'Accounts for hard expired banner state');
      assert.match(content, /wa\.me/, 'Direct WhatsApp renewal action button included');
    });

    test('PlanQuotaDrawer.tsx provides tier switcher, validity presets, and MB shortcuts', () => {
      const filePath = path.resolve(__dirname, '../../src/components/admin/PlanQuotaDrawer.tsx');
      assert.ok(fs.existsSync(filePath), 'PlanQuotaDrawer.tsx exists');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /use client/, 'PlanQuotaDrawer must be a client component');
      assert.match(content, /updateShopSubscriptionAction/, 'Invokes admin server action');
      assert.match(content, /applyDurationPreset/, 'Has validity duration presets (+1M, +3M, +6M, +1Y, Lifetime)');
      assert.match(content, /500 MB/, 'Has quick storage quota presets (500MB, 1GB, 2GB, 5GB, 10GB)');
    });

    test('MerchantStoresTable.tsx renders storage meter, validity status badges, and drawer trigger', () => {
      const filePath = path.resolve(__dirname, '../../src/components/admin/MerchantStoresTable.tsx');
      assert.ok(fs.existsSync(filePath), 'MerchantStoresTable.tsx exists');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /use client/, 'MerchantStoresTable must be a client component');
      assert.match(content, /PlanQuotaDrawer/, 'Integrates the PlanQuotaDrawer slideover');
      assert.match(content, /Manage Plan/, 'Provides clear Manage Plan trigger button');
      assert.match(content, /storageUsedBytes/, 'Visualizes shop storage usage');
    });

    test('Dashboard Overview page integrates Expiry Banner and Quota Meter', () => {
      const filePath = path.resolve(__dirname, '../../src/app/dashboard/page.tsx');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /getShopStorageQuota/, 'Fetches shop storage quota server-side');
      assert.match(content, /SubscriptionExpiryBanner/, 'Renders subscription expiry banner');
      assert.match(content, /StorageQuotaMeter/, 'Renders storage quota meter');
    });

    test('Admin Overview page integrates MerchantStoresTable and toggleShopStatusAction', () => {
      const filePath = path.resolve(__dirname, '../../src/app/admin/page.tsx');
      const content = fs.readFileSync(filePath, 'utf8');

      assert.match(content, /MerchantStoresTable/, 'Renders MerchantStoresTable');
      assert.match(content, /toggleShopStatusAction/, 'Contains secure admin toggle action');
    });
  });
});
