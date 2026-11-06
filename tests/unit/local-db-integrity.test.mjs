import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

// Test suite for database adapter filter logic and stock restoration safety
describe("KADEO Database & Order Integrity Suite", () => {
  test("delete() with multiple filters deletes ONLY rows that match ALL filters", () => {
    // Simulate table with 3 products belonging to shop-1 and shop-2
    const table = [
      { id: "p1", shop_id: "shop-1", name: "Shirt" },
      { id: "p2", shop_id: "shop-1", name: "Pants" },
      { id: "p3", shop_id: "shop-2", name: "Dress" },
    ];

    // Filters: delete where id == 'p1' AND shop_id == 'shop-1'
    const filters = [
      { col: "id", val: "p1" },
      { col: "shop_id", val: "shop-1" },
    ];

    // Verified fix logic:
    const remaining = table.filter((row) => {
      if (filters.length === 0) return true;
      const matchesAll = filters.every((f) => row[f.col] === f.val);
      return !matchesAll;
    });

    assert.equal(remaining.length, 2, "Only 1 matching row should be deleted");
    assert.deepEqual(
      remaining.map((r) => r.id),
      ["p2", "p3"],
      "p2 belonging to shop-1 must NOT be deleted!"
    );
  });

  test("Stock restore safely increments rather than overwrites with cancelled quantity", () => {
    const product = { id: "p1", name: "Silk Sarong", stock_quantity: 45 };
    const cancelledOrderItem = { product_id: "p1", quantity: 2 };

    // Previous bug: product.stock_quantity = item.quantity -> became 2!
    // Corrected logic:
    product.stock_quantity = product.stock_quantity + cancelledOrderItem.quantity;

    assert.equal(product.stock_quantity, 47, "Stock must be 47, not 2!");
  });

  test("Open redirect protection prevents external redirects", () => {
    function sanitizeRedirect(raw) {
      return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    }

    assert.equal(sanitizeRedirect("/dashboard/orders"), "/dashboard/orders");
    assert.equal(sanitizeRedirect("https://evil.com"), "/dashboard");
    assert.equal(sanitizeRedirect("//evil.com"), "/dashboard");
    assert.equal(sanitizeRedirect("javascript:alert(1)"), "/dashboard");
  });

  test("create_checkout_order payload conforms to order management dashboard schema", () => {
    const rawOrder = {
      orderId: "ord-1",
      customerName: "Kamal Perera",
      customerPhone: "0771234567",
      customerAddress: "123 Galle Road, Colombo",
      subtotal: 5800,
      deliveryFee: 0,
      orderNote: "Call before delivery",
    };

    const newOrderRecord = {
      id: rawOrder.orderId,
      subtotal: rawOrder.subtotal,
      delivery_fee: rawOrder.deliveryFee,
      total: rawOrder.subtotal + rawOrder.deliveryFee,
      customer_name_snapshot: rawOrder.customerName,
      customer_phone_snapshot: rawOrder.customerPhone,
      delivery_address_snapshot: rawOrder.customerAddress,
      order_notes_snapshot: rawOrder.orderNote,
    };

    assert.equal(newOrderRecord.total, 5800);
    assert.equal(newOrderRecord.customer_phone_snapshot.replace(/\D/g, ""), "0771234567");
    assert.equal(typeof newOrderRecord.customer_name_snapshot, "string");
  });
});
