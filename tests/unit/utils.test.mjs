import { test, describe } from "node:test";
import assert from "node:assert/strict";

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrency(amount, currency = "LKR") {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

describe("KADEO Utility & Formatting Suite", () => {
  test("generateSlug generates clean URL slugs for shops and products", () => {
    assert.equal(generateSlug("Ceylon Linen"), "ceylon-linen");
    assert.equal(generateSlug("  Handloom & Silk Saree!!  "), "handloom-silk-saree");
    assert.equal(generateSlug("Store #123 - Colombo"), "store-123-colombo");
    assert.equal(generateSlug("---test---slug---"), "test-slug");
  });

  test("formatCurrency correctly formats LKR amounts", () => {
    const formatted = formatCurrency(5850);
    assert.ok(formatted.includes("5,850") || formatted.includes("5850"));
    assert.ok(formatted.includes("LKR") || formatted.includes("Rs"));
  });

  test("Order code regex matches KAD-YYYY-XXXXXX standard", () => {
    const orderCodeRegex = /^KAD-\d{4}-\d{6}$/;
    assert.ok(orderCodeRegex.test("KAD-2026-000123"));
    assert.ok(orderCodeRegex.test("KAD-2026-987654"));
    assert.equal(orderCodeRegex.test("INVALID-123"), false);
  });

  test("WhatsApp official wa.me link generation produces valid URL", () => {
    const phone = "94771234567";
    const orderCode = "KAD-2026-000123";
    const customer = "Kasun Perera";
    const total = "LKR 8,500";

    const msg = `Hello! A new order has been placed through your Kadeo store.\n\nOrder ID: ${orderCode}\nCustomer: ${customer}\nTotal: ${total}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    assert.ok(url.startsWith("https://wa.me/94771234567?text="));
    assert.ok(url.includes(encodeURIComponent(orderCode)));
    assert.ok(url.includes(encodeURIComponent(customer)));
  });
});
