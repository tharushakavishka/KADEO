const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '../..');
const receiptPath = path.join(repoRoot, 'src/components/shared/OrderThermalReceipt.tsx');
const phonePath = path.join(repoRoot, 'src/lib/phone.ts');

function loadModule(filePath, mocks = {}) {
  const src = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const mod = { exports: {} };
  const sandbox = {
    exports: mod.exports,
    module: mod,
    require: (id) => (mocks[id] ? mocks[id] : require(id)),
    crypto: globalThis.crypto,
    console,
    process,
    Set,
    Map,
    URL,
    Array,
    Object,
  };
  vm.runInNewContext(transpiled, sandbox);
  return mod.exports;
}

const phone = loadModule(phonePath);

describe('Order Thermal Receipt Slip & WhatsApp Share Suite', () => {
  test('OrderThermalReceipt module exports component and formats slip properly with items and image share actions', () => {
    const React = {
      useState: (init) => [init, () => {}],
      useRef: (init) => ({ current: init }),
      createElement: (type, props, ...children) => {
        return { type, props: { ...props, children } };
      },
    };

    const mod = loadModule(receiptPath, {
      'react': React,
      'react/jsx-runtime': {
        jsx: (type, props) => ({ type, props }),
        jsxs: (type, props) => ({ type, props }),
        Fragment: 'Fragment',
      },
      '@/lib/utils': { formatCurrency: (v) => 'LKR ' + Number(v).toLocaleString() },
      '@/lib/phone': phone,
      'lucide-react': new Proxy({}, { get: () => () => ({}) }),
    });

    assert.ok(mod.OrderThermalReceipt, 'OrderThermalReceipt component must be exported');

    const sampleOrder = {
      orderCode: 'KAD-2026-9028',
      createdAt: '2026-11-06T10:00:00.000Z',
      shopName: 'Amarasri Hearath',
      shopSlug: 'amarasri-hearath',
      customerName: 'Victor Shoaga',
      customerPhone: '0771234567',
      customerAddress: '7953 Oakland St, Colombo 03',
      orderType: 'Cash on Delivery',
      items: [
        { name: 'Pure Linen Shirt', quantity: 2, unitPrice: 3500, lineTotal: 7000 },
        { name: 'Handcrafted Mug', quantity: 1, unitPrice: 1500, lineTotal: 1500 },
      ],
      subtotal: 8500,
      deliveryFee: 350,
      deliveryZone: 'Colombo & Suburbs',
      total: 8850,
      courierName: 'Domex Express',
      trackingNumber: 'DX-89218491',
      operatorName: 'Ade',
      showActions: true,
      recipientType: 'customer',
    };

    const tree = mod.OrderThermalReceipt(sampleOrder);
    assert.ok(tree, 'OrderThermalReceipt must return a render tree');

    // Recursive search in rendered tree to find elements
    function findInTree(node, predicate) {
      if (!node) return null;
      if (predicate(node)) return node;
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of ch) {
          const found = findInTree(child, predicate);
          if (found) return found;
        }
      }
      return null;
    }

    // Verify token code is rendered
    const tokenNode = findInTree(tree, (n) =>
      typeof n?.props?.children === 'string' && n.props.children.includes('KAD-2026-9028')
    );
    assert.ok(tokenNode, 'Order token code must be rendered in receipt slip');

    // Verify customer name is rendered
    const customerNode = findInTree(tree, (n) =>
      n?.props?.children === 'Victor Shoaga'
    );
    assert.ok(customerNode, 'Customer name must be rendered in receipt slip');

    // Verify purchased items are rendered in the slip
    const item1Node = findInTree(tree, (n) =>
      n?.props?.children === 'Pure Linen Shirt'
    );
    assert.ok(item1Node, 'Pure Linen Shirt item must be rendered in receipt slip breakdown');

    const item2Node = findInTree(tree, (n) =>
      n?.props?.children === 'Handcrafted Mug'
    );
    assert.ok(item2Node, 'Handcrafted Mug item must be rendered in receipt slip breakdown');

    // Verify torn zig-zag paper edge SVG is present
    const tornEdge = findInTree(tree, (n) =>
      n?.type === 'path' && n?.props?.d?.includes('M0,0 L10,14')
    );
    assert.ok(tornEdge, 'Realistic torn paper zig-zag edge must be rendered at bottom of slip');

    // Verify image sharing action button is present
    const imageShareBtn = findInTree(tree, (n) =>
      typeof n?.props?.children === 'string' && n.props.children.includes('Share Slip as Image')
    );
    assert.ok(imageShareBtn, 'Share Slip as Image button must be rendered');

    // Verify image download action button is present
    const imageDownloadBtn = findInTree(tree, (n) =>
      typeof n?.props?.children === 'string' && n.props.children.includes('Download Image')
    );
    assert.ok(imageDownloadBtn, 'Download Image button must be rendered');
  });

  test('WhatsApp message link to customer includes receipt URL, token, and item details', () => {
    const waUrl = phone.buildWhatsAppUrl(
      '0771234567',
      `🧾 *Official Order Receipt - Ceylon Craft*\n*Token:* KAD-2026-123456\n📦 *Items Purchased:*\n• Pure Linen Shirt × 2 = LKR 7,000\nTotal: LKR 7,000\nhttp://localhost:3000/shop/ceylon-craft/order-success?code=KAD-2026-123456`
    );

    assert.ok(waUrl.startsWith('https://wa.me/94771234567?text='), 'Must target customer normalized phone');
    assert.ok(waUrl.includes('KAD-2026-123456'), 'Must encode order token');
    assert.ok(waUrl.includes('order-success'), 'Must encode direct digital slip link');
    assert.ok(waUrl.includes('Pure%20Linen%20Shirt'), 'Must encode purchased item details');
  });
});
