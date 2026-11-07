import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = "C:/Users/USER/.openmausbot/task-workspaces/037c1527-cae9-4d11-8acc-6f16ac86030a/70633e3b-54d9-42a8-9aac-cf24255d67e1";

describe("KADEO Frontend Enhancements & Shop App Theme Suite", () => {
  it("ShopAppTheme.tsx is created with Shop app UI features", () => {
    const file = path.join(root, "src/components/storefront/themes/ShopAppTheme.tsx");
    assert.ok(fs.existsSync(file), "ShopAppTheme.tsx must exist");
    const code = fs.readFileSync(file, "utf8");

    // Pill search bar & trending searches
    assert.ok(code.includes("Wireless Headphones"), "Should include trending search Wireless Headphones");
    assert.ok(code.includes("Linen Shirts"), "Should include trending search Linen Shirts");
    assert.ok(code.includes("Artisan Coffee"), "Should include trending search Artisan Coffee");
    assert.ok(code.includes("Glow Serum"), "Should include trending search Glow Serum");

    // Vibrant purple/indigo CTA accents (#5a31f4)
    assert.ok(code.includes("#5a31f4"), "Should use vibrant purple #5a31f4 accent");

    // Islandwide Package Tracking Spotlight
    assert.ok(code.includes("Track your packages in real-time"), "Should include tracking spotlight banner");

    // 1-Click WhatsApp direct chat floating button
    assert.ok(code.includes("Chat with Store"), "Should include WhatsApp floating button");
    assert.ok(code.includes("#25D366"), "Should use WhatsApp brand color #25D366");

    // Clean category pills & no placeholder text
    assert.ok(!code.includes("Image coming soon"), "Must not include ugly Image coming soon placeholder text");
  });

  it("ModernRetailTheme.tsx has category placeholder fixed and no 'Image coming soon'", () => {
    const file = path.join(root, "src/components/storefront/themes/ModernRetailTheme.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(!code.includes("Image coming soon"), "ModernRetailTheme must not contain 'Image coming soon'");
    assert.ok(code.includes("catGradients"), "ModernRetailTheme must use clean gradients for category fallback");
  });

  it("QuickStockAlert.tsx contains interactive green toast notification", () => {
    const file = path.join(root, "src/components/dashboard/QuickStockAlert.tsx");
    const code = fs.readFileSync(file, "utf8");
    assert.ok(code.includes("bg-emerald-600"), "Must include green background toast");
    assert.ok(code.includes("Stock Replenished!"), "Must confirm addition with message");
    assert.ok(code.includes("toast"), "Must manage toast state");
  });

  it("ThermalReceiptSlip.tsx and OrderThermalReceipt.tsx support Copy Image to Clipboard", () => {
    const slipFile = path.join(root, "src/components/dashboard/ThermalReceiptSlip.tsx");
    assert.ok(fs.existsSync(slipFile), "ThermalReceiptSlip.tsx must exist in dashboard");

    const receiptFile = path.join(root, "src/components/shared/OrderThermalReceipt.tsx");
    const receiptCode = fs.readFileSync(receiptFile, "utf8");
    assert.ok(receiptCode.includes("Copy Image to Clipboard"), "Must have Copy Image to Clipboard button");
    assert.ok(receiptCode.includes("handleCopyImageToClipboard"), "Must have handleCopyImageToClipboard function");
    assert.ok(receiptCode.includes("ClipboardItem"), "Must write to clipboard using ClipboardItem");
  });

  it("Theme is registered in design/page.tsx and shop/[slug]/page.tsx", () => {
    const designFile = path.join(root, "src/app/dashboard/design/page.tsx");
    const designCode = fs.readFileSync(designFile, "utf8");
    assert.ok(designCode.includes('"shop_app"'), "shop_app must be allowed in design page");

    const slugFile = path.join(root, "src/app/shop/[slug]/page.tsx");
    const slugCode = fs.readFileSync(slugFile, "utf8");
    assert.ok(slugCode.includes('case "shop_app"'), "shop_app must be handled in shop page");
  });
});
