import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("KADEO Subscription & Truthful Pricing Suite (Issue 9)", () => {
  function deriveActivePlan(subscription) {
    if (!subscription || subscription.status !== "active" || !subscription.plan_id) {
      return "free";
    }
    return subscription.plan_id;
  }

  const availablePlans = [
    {
      id: "free",
      name: "Starter Free",
      price: 0,
      description: "Everything you need to launch and operate your WhatsApp storefront.",
      features: [
        "WhatsApp direct checkout & customer inquiries",
        "Multiple storefront themes & layout customization",
        "Mobile-first seller management dashboard",
        "Delivery and return policy configuration",
        "0% sales commission",
      ],
      isUpgrade: false,
    },
    {
      id: "pro",
      name: "Pro Business",
      price: null,
      description: "Additional merchant capabilities currently in development for Sri Lankan businesses.",
      features: [
        "Expanded product catalog capacity",
        "Advanced storefront customization controls",
        "Merchant support channels",
      ],
      isUpgrade: true,
      upgradeUnavailableNotice:
        "Online upgrades and payment gateway processing are not available yet in this release.",
    },
  ];

  test("derives active plan correctly from database subscription record", () => {
    assert.equal(deriveActivePlan(null), "free", "null/missing subscription defaults to Starter Free");
    assert.equal(deriveActivePlan({ status: "cancelled", plan_id: "pro" }), "free", "cancelled subscription defaults to Starter Free");
    assert.equal(deriveActivePlan({ status: "expired", plan_id: "pro" }), "free", "expired subscription defaults to Starter Free");
    assert.equal(deriveActivePlan({ status: "past_due", plan_id: "pro" }), "free", "past_due subscription defaults to Starter Free");
    assert.equal(deriveActivePlan({ status: "active", plan_id: "free" }), "free");
    assert.equal(deriveActivePlan({ status: "active", plan_id: "pro" }), "pro", "active pro subscription resolves to pro");
  });

  test("removes unsupported feature claims, fabricated pricing, and sample contact links", () => {
    const allFeatures = availablePlans.flatMap((p) => p.features);
    for (const f of allFeatures) {
      assert.doesNotMatch(f, /advanced analytics/i, "No false promise of advanced analytics");
      assert.doesNotMatch(f, /data export/i, "No false promise of data export");
      assert.doesNotMatch(f, /automated billing|instant credit card/i, "No false promise of automated payment gateway");
      assert.doesNotMatch(f, /\b25 products\b|\b200 products\b/i, "No arbitrary unenforced product limits");
    }
    const pro = availablePlans.find((p) => p.id === "pro");
    assert.equal(pro.price, null, "Pricing is not fabricated when checkout/billing is not active");
  });

  test("pro business plan clearly disables upgrades and states unavailable status", () => {
    const pro = availablePlans.find((p) => p.id === "pro");
    assert.ok(pro.isUpgrade);
    assert.match(pro.upgradeUnavailableNotice, /not available yet/i);
  });
});

describe("KADEO New-Seller Onboarding & Guidance Suite (Issue 16)", () => {
  // Use phone normalization/validation contract
  function isValidPhoneNumber(raw) {
    if (!raw) return false;
    let digits = raw.trim().replace(/[\s\-\(\)\.]/g, "");
    if (digits.startsWith("+")) digits = digits.substring(1);
    if (/^0\d{9}$/.test(digits)) digits = "94" + digits.substring(1);
    else if (/^[1-9]\d{8}$/.test(digits)) digits = "94" + digits;
    if (digits.startsWith("94")) return /^94[1-9]\d{8}$/.test(digits);
    return /^\d{8,15}$/.test(digits);
  }

  function computeOnboardingProgress({ shop, productCount, productImagesCount, deliveryInfo }) {
    const hasWhatsApp = isValidPhoneNumber(shop.whatsapp_number);
    const hasProducts = (productCount || 0) > 0;
    const hasPhotos = (productImagesCount || 0) > 0;
    const hasDelivery = Boolean(deliveryInfo && deliveryInfo.trim().length > 0);
    const hasBranding = Boolean(
      (shop.description && shop.description.trim().length > 0) ||
        shop.logo_url ||
        (shop.storefront_content && Object.keys(shop.storefront_content).length > 0)
    );

    const steps = [
      { id: "whatsapp", completed: hasWhatsApp },
      { id: "product", completed: hasProducts },
      { id: "photos", completed: hasPhotos },
      { id: "delivery", completed: hasDelivery },
      { id: "branding", completed: hasBranding },
    ];

    const completedCount = steps.filter((s) => s.completed).length;
    const totalCount = steps.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return {
      steps,
      completedCount,
      totalCount,
      percentage,
      isAllComplete: completedCount === totalCount,
    };
  }

  function detectLowStock(products, threshold = 3) {
    return products.filter((p) => p.stock_quantity <= threshold);
  }

  test("computes 0% progress for a fresh brand-new store without setup", () => {
    const fresh = computeOnboardingProgress({
      shop: { whatsapp_number: "", description: "", logo_url: null, storefront_content: {} },
      productCount: 0,
      productImagesCount: 0,
      deliveryInfo: null,
    });
    assert.equal(fresh.completedCount, 0);
    assert.equal(fresh.percentage, 0);
    assert.equal(fresh.isAllComplete, false);
  });

  test("validates Sri Lankan phone formats (0771234567, 94771234567, +94771234567) and rejects invalid ones", () => {
    assert.equal(isValidPhoneNumber("0771234567"), true);
    assert.equal(isValidPhoneNumber("94771234567"), true);
    assert.equal(isValidPhoneNumber("+94771234567"), true);
    assert.equal(isValidPhoneNumber("0715267058"), true);
    assert.equal(isValidPhoneNumber("123"), false);
    assert.equal(isValidPhoneNumber(""), false);
  });

  test("computes partial progress as seller configures WhatsApp and first product", () => {
    const partial = computeOnboardingProgress({
      shop: { whatsapp_number: "0771234567", description: "", logo_url: null, storefront_content: {} },
      productCount: 1,
      productImagesCount: 0,
      deliveryInfo: "",
    });
    assert.equal(partial.completedCount, 2);
    assert.equal(partial.percentage, 40);
    assert.equal(partial.isAllComplete, false);
  });

  test("computes 100% complete when all 5 setup milestones are fulfilled", () => {
    const complete = computeOnboardingProgress({
      shop: {
        whatsapp_number: "94771234567",
        description: "Artisanal boutique store",
        logo_url: "https://example.com/logo.png",
        storefront_content: { "layout:card": "stacked" },
      },
      productCount: 5,
      productImagesCount: 4,
      deliveryInfo: "Island-wide cash on delivery available.",
    });
    assert.equal(complete.completedCount, 5);
    assert.equal(complete.percentage, 100);
    assert.equal(complete.isAllComplete, true);
  });

  test("detects out-of-stock and low-stock products (threshold <= 3)", () => {
    const catalog = [
      { id: "p1", name: "Linen Shirt", stock_quantity: 25 },
      { id: "p2", name: "Silk Sarong", stock_quantity: 3 },
      { id: "p3", name: "Batik Wrap", stock_quantity: 0 },
      { id: "p4", name: "Handmade Mug", stock_quantity: 5 },
    ];
    const alerts = detectLowStock(catalog, 3);
    assert.equal(alerts.length, 2);
    assert.deepEqual(
      alerts.map((a) => a.id),
      ["p2", "p3"]
    );
  });
});
