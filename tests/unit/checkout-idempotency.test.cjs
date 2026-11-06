/**
 * Unit Tests for Checkout Idempotency, Retry Stability, Double-Submit Guards,
 * and Failure Recovery in SalesDesk and CartDrawer Components.
 *
 * NOTE: Rigel owns the mounted Browser surface; these tests execute actual
 * transpiled production SalesDesk.tsx and CartDrawer.tsx components and their
 * action submission handlers in a React hook lifecycle harness to verify
 * retry stability and key rotation without browser automation.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '../..');
const idempotencyPath = path.join(repoRoot, 'src/lib/checkout-idempotency.ts');
const salesDeskPath = path.join(repoRoot, 'src/components/dashboard/SalesDesk.tsx');
const cartDrawerPath = path.join(repoRoot, 'src/components/storefront/CartDrawer.tsx');
const storagePath = path.join(repoRoot, 'src/lib/sales-desk-storage.ts');
const cartStoragePath = path.join(repoRoot, 'src/lib/cart-storage.ts');

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

const {
  computeCheckoutPayloadDigest,
  generateCheckoutIdempotencyKey,
} = loadModule(idempotencyPath);

const storageMod = loadModule(storagePath);
const cartStorageMod = loadModule(cartStoragePath);

// ---------------------------------------------------------------------------
// 1. Checkout Idempotency Utilities Unit Tests
// ---------------------------------------------------------------------------
describe('Checkout Idempotency Utilities', () => {
  test('computeCheckoutPayloadDigest normalizes whitespace and ignores item order', () => {
    const payload1 = {
      shopSlug: '  shop-alpha  ',
      customerName: '  Kasun Perera ',
      customerPhone: ' 0771234567 ',
      customerAddress: '  10 Galle Road, Colombo  ',
      customerEmail: ' kasun@example.com ',
      orderNote: ' Deliver before 5pm ',
      items: [
        { productId: 'prod-b', quantity: 2 },
        { productId: 'prod-a', quantity: 1 },
      ],
    };

    const payload2 = {
      shopSlug: 'shop-alpha',
      customerName: 'Kasun Perera',
      customerPhone: '0771234567',
      customerAddress: '10 Galle Road, Colombo',
      customerEmail: 'kasun@example.com',
      orderNote: 'Deliver before 5pm',
      items: [
        { productId: 'prod-a', quantity: 1 },
        { productId: 'prod-b', quantity: 2 },
      ],
    };

    const digest1 = computeCheckoutPayloadDigest(payload1);
    const digest2 = computeCheckoutPayloadDigest(payload2);

    assert.equal(digest1, digest2, 'Digest must be identical regardless of item order or whitespace');
  });

  test('computeCheckoutPayloadDigest changes when order details or items change', () => {
    const base = {
      shopSlug: 'shop-alpha',
      customerName: 'Kasun Perera',
      customerPhone: '0771234567',
      customerAddress: '10 Galle Road',
      items: [{ productId: 'p1', quantity: 1 }],
    };

    const baseDigest = computeCheckoutPayloadDigest(base);

    // Change quantity
    assert.notEqual(
      baseDigest,
      computeCheckoutPayloadDigest({ ...base, items: [{ productId: 'p1', quantity: 2 }] })
    );

    // Change customer phone
    assert.notEqual(
      baseDigest,
      computeCheckoutPayloadDigest({ ...base, customerPhone: '0779999999' })
    );

    // Change delivery address
    assert.notEqual(
      baseDigest,
      computeCheckoutPayloadDigest({ ...base, customerAddress: '20 Kandy Road' })
    );

    // Change order note
    assert.notEqual(
      baseDigest,
      computeCheckoutPayloadDigest({ ...base, orderNote: 'Urgent gift wrap' })
    );
  });

  test('generateCheckoutIdempotencyKey generates scoped, collision-resistant keys within 100 char limit', () => {
    const keyCart = generateCheckoutIdempotencyKey('cart');
    const keyPos = generateCheckoutIdempotencyKey('pos');

    assert.ok(keyCart.startsWith('kadeo_cart_'), 'Cart key must start with kadeo_cart_');
    assert.ok(keyPos.startsWith('kadeo_pos_'), 'POS key must start with kadeo_pos_');
    assert.ok(keyCart.length <= 100, 'Cart key length must not exceed 100 characters');
    assert.ok(keyPos.length <= 100, 'POS key length must not exceed 100 characters');

    const keyCart2 = generateCheckoutIdempotencyKey('cart');
    assert.notEqual(keyCart, keyCart2, 'Successive calls must generate unique keys');
  });
});

// ---------------------------------------------------------------------------
// 2. SalesDesk Component Checkout Invocation & Retry Stability
// ---------------------------------------------------------------------------
function createSalesDeskHarness(deskOrderActionMock) {
  let hookIndex = 0;
  const hooks = [];
  let pendingUpdates = [];

  const React = {
    useState(init) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'state', value: typeof init === 'function' ? init() : init };
      }
      const setter = (updater) => {
        pendingUpdates.push({ idx, updater });
        applyUpdates();
      };
      return [hooks[idx].value, setter];
    },
    useRef(init) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'ref', value: { current: init } };
      }
      return hooks[idx].value;
    },
    useEffect(effectFn, deps) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'effect', effectFn, deps, prevDeps: undefined };
      } else {
        hooks[idx].effectFn = effectFn;
        hooks[idx].deps = deps;
      }
    },
  };

  const code = ts.transpileModule(fs.readFileSync(salesDeskPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const mockSessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  let renderedElement = null;
  const routerMock = { refresh() {} };

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (id) => {
      if (id === 'react') return React;
      if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' };
      if (id === 'next/link') return (p) => p.children;
      if (id === 'next/navigation') return { useRouter: () => routerMock };
      if (id === 'lucide-react') return new Proxy({}, { get: () => () => ({}) });
      if (id === '@/lib/utils') return { formatCurrency: (v) => 'LKR ' + v };
      if (id === '@/features/orders/desk-actions') return { createDeskOrderAction: deskOrderActionMock };
      if (id === '@/lib/sales-desk-storage') return storageMod;
      if (id === '@/lib/checkout-idempotency') return { computeCheckoutPayloadDigest, generateCheckoutIdempotencyKey };
      return {};
    },
    window: { sessionStorage: mockSessionStorage },
    sessionStorage: mockSessionStorage,
    crypto: globalThis.crypto,
    FormData: globalThis.FormData,
    console,
    process,
    Set,
    Map,
    Array,
    Object,
  };

  vm.runInNewContext(code, sandbox);
  const SalesDesk = sandbox.exports.SalesDesk || sandbox.module.exports.SalesDesk;

  function runEffects() {
    for (const h of hooks) {
      if (h.type === 'effect') {
        const changed = !h.prevDeps || h.prevDeps.length !== h.deps.length || h.prevDeps.some((d, i) => !Object.is(d, h.deps[i]));
        if (changed) {
          h.prevDeps = h.deps;
          h.effectFn();
        }
      }
    }
  }

  function applyUpdates() {
    if (pendingUpdates.length > 0) {
      const updates = pendingUpdates;
      pendingUpdates = [];
      for (const { idx, updater } of updates) {
        hooks[idx].value = typeof updater === 'function' ? updater(hooks[idx].value) : updater;
      }
      hookIndex = 0;
      renderedElement = SalesDesk(currentProps);
      runEffects();
    }
  }

  let currentProps = null;
  function render(props) {
    currentProps = props;
    hookIndex = 0;
    renderedElement = SalesDesk(currentProps);
    runEffects();
    applyUpdates();
    return renderedElement;
  }

  return {
    render,
    getLines: () => hooks[1].value,
    getCustomer: () => hooks[2].value,
    getPending: () => hooks[3].value,
    getLocked: () => hooks[4].value.current,
    getError: () => hooks[5].value,
    getReceipt: () => hooks[6].value,
    getCheckoutAttempt: () => hooks[7].value.current,
    setLines: (lines) => {
      pendingUpdates.push({ idx: 1, updater: lines });
      applyUpdates();
    },
    setCustomer: (customer) => {
      pendingUpdates.push({ idx: 2, updater: customer });
      applyUpdates();
    },
    getRendered: () => renderedElement,
  };
}

function findCheckoutForm(tree) {
  if (!tree || typeof tree !== 'object') return null;
  if (tree.type === 'form' && tree.props && tree.props.onSubmit && tree.props.className && tree.props.className.includes('space-y-3.5')) {
    return tree;
  }
  if (tree.props && tree.props.children) {
    const children = Array.isArray(tree.props.children) ? tree.props.children : [tree.props.children];
    for (const c of children) {
      const found = findCheckoutForm(c);
      if (found) return found;
    }
  }
  return null;
}

describe('SalesDesk Component Checkout Invocation & Retry Stability', () => {
  test('transient failure preserves form inputs and retrying submission retains exact same idempotencyKey', async () => {
    const deskCalls = [];
    let simulateFailure = true;

    const harness = createSalesDeskHarness(async (payload) => {
      deskCalls.push(payload);
      if (simulateFailure) {
        return { error: 'Database transient connection timeout' };
      }
      return { success: true, orderId: 'ord-pos-1', orderCode: 'KAD-POS-100', total: 7000 };
    });

    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-test' });
    harness.setLines([{ id: 'prod-1', name: 'Linen Shirt', price: 3500, stock_quantity: 10, quantity: 2 }]);
    harness.setCustomer({ name: 'Kasun Perera', phone: '0771234567', address: '123 Galle Rd', note: 'Fragile' });

    const form = findCheckoutForm(harness.getRendered());
    assert.ok(form, 'Checkout submission form must be rendered');

    // First submission (fails transiently)
    await form.props.onSubmit({ preventDefault: () => {} });

    assert.equal(deskCalls.length, 1);
    const key1 = deskCalls[0].idempotencyKey;
    assert.ok(key1.startsWith('kadeo_pos_'), 'Key must start with kadeo_pos_');
    assert.equal(harness.getError(), 'Database transient connection timeout');
    assert.equal(harness.getCustomer().name, 'Kasun Perera', 'Customer details must be preserved on failure');
    assert.equal(harness.getLines().length, 1, 'Lines must be preserved on failure');

    // Second submission (retry without modifying inputs)
    simulateFailure = false;
    await form.props.onSubmit({ preventDefault: () => {} });

    assert.equal(deskCalls.length, 2);
    const key2 = deskCalls[1].idempotencyKey;
    assert.equal(key2, key1, 'Transient retry must preserve the exact same idempotencyKey');
    assert.equal(harness.getReceipt().code, 'KAD-POS-100', 'Success receipt must be displayed');
    assert.equal(harness.getLines().length, 0, 'Lines must be cleared after successful order');
  });

  test('modifying basket lines or customer inputs rotates to a new idempotencyKey', async () => {
    const deskCalls = [];
    const harness = createSalesDeskHarness(async (payload) => {
      deskCalls.push(payload);
      return { error: 'Inventory stock reservation failed' };
    });

    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-test' });
    harness.setLines([{ id: 'prod-1', name: 'Linen Shirt', price: 3500, stock_quantity: 10, quantity: 1 }]);
    harness.setCustomer({ name: 'Kasun', phone: '0771111111', address: 'Colombo', note: '' });

    let form = findCheckoutForm(harness.getRendered());
    await form.props.onSubmit({ preventDefault: () => {} });
    const keyA = deskCalls[0].idempotencyKey;

    // Seller modifies quantity from 1 to 2 -> payload changes
    harness.setLines([{ id: 'prod-1', name: 'Linen Shirt', price: 3500, stock_quantity: 10, quantity: 2 }]);
    form = findCheckoutForm(harness.getRendered());
    await form.props.onSubmit({ preventDefault: () => {} });
    const keyB = deskCalls[1].idempotencyKey;

    assert.notEqual(keyA, keyB, 'Modifying basket items must rotate idempotency key');

    // Seller modifies delivery address -> payload changes
    harness.setCustomer({ name: 'Kasun', phone: '0771111111', address: 'Kandy Road', note: '' });
    form = findCheckoutForm(harness.getRendered());
    await form.props.onSubmit({ preventDefault: () => {} });
    const keyC = deskCalls[2].idempotencyKey;

    assert.notEqual(keyB, keyC, 'Modifying customer address must rotate idempotency key');
  });

  test('double-submit guard prevents multiple concurrent desk order action calls', async () => {
    let actionCalls = 0;
    const harness = createSalesDeskHarness(async () => {
      actionCalls++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { success: true, orderId: 'ord-pos-2', orderCode: 'KAD-POS-200', total: 3500 };
    });

    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-test' });
    harness.setLines([{ id: 'prod-1', name: 'Item', price: 3500, stock_quantity: 5, quantity: 1 }]);
    harness.setCustomer({ name: 'Kasun', phone: '0771234567', address: 'Colombo', note: '' });

    const form = findCheckoutForm(harness.getRendered());

    // Fire rapid concurrent submissions (simulating double click)
    const p1 = form.props.onSubmit({ preventDefault: () => {} });
    const p2 = form.props.onSubmit({ preventDefault: () => {} });
    await Promise.all([p1, p2]);

    assert.equal(actionCalls, 1, 'Double click must only invoke backend action once');
  });
});

// ---------------------------------------------------------------------------
// 3. CartDrawer Component Checkout Invocation & Retry Stability
// ---------------------------------------------------------------------------
function createCartDrawerHarness(submitOrderActionMock, initialCartItems = []) {
  let hookIndex = 0;
  const hooks = [];
  let pendingUpdates = [];

  let cartItems = [...initialCartItems];
  let cartCleared = false;
  let redirectedUrl = null;

  const mockCartContext = {
    items: cartItems,
    removeItem: () => {},
    updateQuantity: () => {},
    clearCart: () => {
      cartCleared = true;
      cartItems = [];
    },
    subtotal: 5000,
    isOpen: true,
    setIsOpen: () => {},
  };

  const React = {
    createContext: () => ({ Provider: (p) => p.children }),
    useContext: () => mockCartContext,
    useState(init) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'state', value: typeof init === 'function' ? init() : init };
      }
      const setter = (updater) => {
        pendingUpdates.push({ idx, updater });
        applyUpdates();
      };
      return [hooks[idx].value, setter];
    },
    useRef(init) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'ref', value: { current: init } };
      }
      return hooks[idx].value;
    },
    useEffect(effectFn, deps) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { type: 'effect', effectFn, deps, prevDeps: undefined };
      } else {
        hooks[idx].effectFn = effectFn;
        hooks[idx].deps = deps;
      }
    },
  };

  const code = ts.transpileModule(fs.readFileSync(cartDrawerPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  let renderedElement = null;
  const routerMock = {
    push(url) {
      redirectedUrl = url;
    },
    refresh() {},
  };

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (id) => {
      if (id === 'react') return React;
      if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' };
      if (id === 'next/link') return (p) => p.children;
      if (id === 'next/navigation') return { useRouter: () => routerMock };
      if (id === 'lucide-react') return new Proxy({}, { get: () => () => ({}) });
      if (id === '@/lib/utils') return { formatCurrency: (v) => 'LKR ' + v };
      if (id === '@/lib/cart-storage') return cartStorageMod;
      if (id === '@/features/orders/actions') return { submitOrderAction: submitOrderActionMock };
      if (id === '@/lib/checkout-idempotency') return { computeCheckoutPayloadDigest, generateCheckoutIdempotencyKey };
      return {};
    },
    window: {},
    document: { activeElement: null, body: { style: { overflow: '' } } },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    crypto: globalThis.crypto,
    FormData: class {
      constructor() {}
      get() {
        return null;
      }
    },
    URLSearchParams: globalThis.URLSearchParams,
    console,
    process,
    Set,
    Map,
    Array,
    Object,
  };

  vm.runInNewContext(code, sandbox);
  const CartDrawerContent = sandbox.exports.CartDrawerContent;

  function runEffects() {
    for (const h of hooks) {
      if (h.type === 'effect') {
        const changed = !h.prevDeps || h.prevDeps.length !== h.deps.length || h.prevDeps.some((d, i) => !Object.is(d, h.deps[i]));
        if (changed) {
          h.prevDeps = h.deps;
          h.effectFn();
        }
      }
    }
  }

  function applyUpdates() {
    if (pendingUpdates.length > 0) {
      const updates = pendingUpdates;
      pendingUpdates = [];
      for (const { idx, updater } of updates) {
        hooks[idx].value = typeof updater === 'function' ? updater(hooks[idx].value) : updater;
      }
      hookIndex = 0;
      renderedElement = CartDrawerContent(currentProps);
      runEffects();
    }
  }

  let currentProps = null;
  function render(props) {
    currentProps = props;
    hookIndex = 0;
    renderedElement = CartDrawerContent(currentProps);
    runEffects();
    applyUpdates();
    return renderedElement;
  }

  return {
    render,
    setStep: (step) => {
      pendingUpdates.push({ idx: 0, updater: step });
      applyUpdates();
    },
    getStep: () => hooks[0].value,
    getLoading: () => hooks[1].value,
    getError: () => hooks[2].value,
    getDetails: () => hooks[5].value,
    setDetails: (details) => {
      pendingUpdates.push({ idx: 5, updater: details });
      applyUpdates();
    },
    isCartCleared: () => cartCleared,
    getRedirectedUrl: () => redirectedUrl,
    getRendered: () => renderedElement,
  };
}

function findCartCheckoutForm(tree) {
  if (!tree || typeof tree !== 'object') return null;
  if (tree.type === 'form' && tree.props && tree.props.id === 'checkout-form') return tree;
  if (tree.props && tree.props.children) {
    const children = Array.isArray(tree.props.children) ? tree.props.children : [tree.props.children];
    for (const c of children) {
      const f = findCartCheckoutForm(c);
      if (f) return f;
    }
  }
  return null;
}

describe('CartDrawer Component Checkout Invocation & Retry Stability', () => {
  test('transient checkout failure preserves inputs and retrying uses exact same idempotencyKey', async () => {
    const cartCalls = [];
    let simulateFailure = true;

    const harness = createCartDrawerHarness(
      async (payload) => {
        cartCalls.push(payload);
        if (simulateFailure) return { error: 'Network socket closed unexpectedly' };
        return {
          success: true,
          orderId: 'ord-cart-1',
          orderCode: 'KAD-CART-100',
          total: 5000,
          whatsappUrl: 'https://wa.me/94771234567',
        };
      },
      [{ id: 'prod-1', name: 'Cotton Dress', price: 5000, quantity: 1, maxStock: 5 }]
    );

    harness.render({ shopSlug: 'silk-store' });
    harness.setStep('checkout');
    harness.setDetails({
      name: 'Nimali Silva',
      phone: '0771234567',
      address: '45 Lake Road, Colombo',
      email: 'nimali@example.com',
      note: 'Call before delivery',
    });

    const form = findCartCheckoutForm(harness.getRendered());
    assert.ok(form, 'Checkout form must be present when step=checkout');

    // First attempt fails transiently
    await form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });

    assert.equal(cartCalls.length, 1);
    const key1 = cartCalls[0].idempotencyKey;
    assert.ok(key1.startsWith('kadeo_cart_'), 'Cart key must start with kadeo_cart_');
    assert.equal(harness.getError(), 'Network socket closed unexpectedly');
    assert.equal(harness.getDetails().name, 'Nimali Silva', 'Customer inputs must be preserved on failure');
    assert.equal(harness.getDetails().phone, '0771234567');

    // Second attempt (retry with unchanged inputs)
    simulateFailure = false;
    await form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });

    assert.equal(cartCalls.length, 2);
    const key2 = cartCalls[1].idempotencyKey;
    assert.equal(key2, key1, 'CartDrawer retry must retain the exact same idempotencyKey');
    assert.equal(harness.isCartCleared(), true, 'Cart must be cleared after success');
    assert.ok(harness.getRedirectedUrl().includes('order-success'), 'Must redirect to order success page');
  });

  test('modifying customer input fields rotates to a new idempotencyKey', async () => {
    const cartCalls = [];
    const harness = createCartDrawerHarness(
      async (payload) => {
        cartCalls.push(payload);
        return { error: 'Validation error' };
      },
      [{ id: 'prod-1', name: 'Cotton Dress', price: 5000, quantity: 1, maxStock: 5 }]
    );

    harness.render({ shopSlug: 'silk-store' });
    harness.setStep('checkout');
    harness.setDetails({ name: 'Nimali', phone: '0771234567', address: '45 Lake Road', email: '', note: '' });

    let form = findCartCheckoutForm(harness.getRendered());
    await form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });
    const keyA = cartCalls[0].idempotencyKey;

    // Customer modifies phone number
    harness.setDetails({ name: 'Nimali', phone: '0779876543', address: '45 Lake Road', email: '', note: '' });
    form = findCartCheckoutForm(harness.getRendered());
    await form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });
    const keyB = cartCalls[1].idempotencyKey;

    assert.notEqual(keyA, keyB, 'Modifying phone number must rotate idempotency key');
  });

  test('double-submit guard prevents multiple concurrent cart order submissions', async () => {
    let actionCalls = 0;
    const harness = createCartDrawerHarness(
      async () => {
        actionCalls++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { success: true, orderId: 'ord-cart-3', orderCode: 'KAD-CART-300', total: 5000 };
      },
      [{ id: 'prod-1', name: 'Cotton Dress', price: 5000, quantity: 1, maxStock: 5 }]
    );

    harness.render({ shopSlug: 'silk-store' });
    harness.setStep('checkout');
    harness.setDetails({ name: 'Nimali', phone: '0771234567', address: '45 Lake Road', email: '', note: '' });

    const form = findCartCheckoutForm(harness.getRendered());

    // Fire rapid concurrent submissions (simulating double click)
    const p1 = form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });
    const p2 = form.props.onSubmit({ preventDefault: () => {}, currentTarget: {} });
    await Promise.all([p1, p2]);

    assert.equal(actionCalls, 1, 'Double click must only invoke backend action once');
  });
});

