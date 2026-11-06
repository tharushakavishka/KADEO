/**
 * Unit Tests for Sales Desk Draft Persistence, Cross-Shop Isolation,
 * and Phone Normalization Utilities.
 *
 * NOTE: Rigel owns the mounted Browser surface; these unit tests execute
 * the actual production SalesDesk.tsx component hooks and effect closures
 * within an in-memory lifecycle harness to verify state isolation and
 * catch regressions without modifying production files.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Locate paths relative to this test file
const repoRoot = path.resolve(__dirname, '../..');
const salesDeskStoragePath = path.join(repoRoot, 'src/lib/sales-desk-storage.ts');
const salesDeskComponentPath = path.join(repoRoot, 'src/components/dashboard/SalesDesk.tsx');
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
    require: (id) => {
      if (mocks[id]) return mocks[id];
      try {
        return require(id);
      } catch (e) {
        return {};
      }
    },
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
  getSalesDeskStorageKey,
  readStoredSalesDeskDraft,
  EMPTY_SALES_DESK_DRAFT,
} = loadModule(salesDeskStoragePath);

const {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneDisplay,
  buildWhatsAppUrl,
} = loadModule(phonePath);

// ---------------------------------------------------------------------------
// 1. Phone Normalization & WhatsApp Formatting
// ---------------------------------------------------------------------------
describe('Phone Normalization & WhatsApp Formatting (Unit Verification)', () => {
  test('normalizePhoneNumber handles local Sri Lankan 07X mobile formats', () => {
    assert.equal(normalizePhoneNumber('0771234567'), '94771234567');
    assert.equal(normalizePhoneNumber('0719876543'), '94719876543');
    assert.equal(normalizePhoneNumber('0701122334'), '94701122334');
  });

  test('normalizePhoneNumber handles 9-digit format starting with 7', () => {
    assert.equal(normalizePhoneNumber('771234567'), '94771234567');
  });

  test('normalizePhoneNumber normalizes international +94 and removes spaces/punctuation', () => {
    assert.equal(normalizePhoneNumber('+94 77 123 4567'), '94771234567');
    assert.equal(normalizePhoneNumber('+94 (71) 987-6543'), '94719876543');
    assert.equal(normalizePhoneNumber('94771234567'), '94771234567');
  });

  test('normalizePhoneNumber handles empty or whitespace input safely', () => {
    assert.equal(normalizePhoneNumber(''), '');
    assert.equal(normalizePhoneNumber('   '), '');
    assert.equal(normalizePhoneNumber(null), '');
    assert.equal(normalizePhoneNumber(undefined), '');
  });

  test('isValidPhoneNumber validates standard Sri Lankan mobile & landline numbers', () => {
    assert.equal(isValidPhoneNumber('0771234567'), true);
    assert.equal(isValidPhoneNumber('+94771234567'), true);
    assert.equal(isValidPhoneNumber('0112345678'), true);
    assert.equal(isValidPhoneNumber('123'), false);
    assert.equal(isValidPhoneNumber(''), false);
    assert.equal(isValidPhoneNumber(null), false);
  });

  test('formatPhoneDisplay formats Sri Lankan numbers with country and area code', () => {
    assert.equal(formatPhoneDisplay('0771234567'), '+94 77 123 4567');
  });

  test('buildWhatsAppUrl constructs wa.me links with encoded pre-filled text', () => {
    assert.equal(
      buildWhatsAppUrl('0771234567', 'Order #123 confirmed!'),
      'https://wa.me/94771234567?text=Order%20%23123%20confirmed!'
    );
    assert.equal(buildWhatsAppUrl('0771234567'), 'https://wa.me/94771234567');
    assert.equal(buildWhatsAppUrl(''), '#');
    assert.equal(buildWhatsAppUrl(null), '#');
  });
});

// ---------------------------------------------------------------------------
// 2. Sales Desk Storage Utilities & Boundary Protections
// ---------------------------------------------------------------------------
describe('Sales Desk Storage Utilities & Boundary Protections', () => {
  test('getSalesDeskStorageKey generates scoped keys per shopId', () => {
    assert.equal(getSalesDeskStorageKey('shop-alpha'), 'kadeo_pos_draft_shop-alpha');
    assert.equal(getSalesDeskStorageKey('shop-beta'), 'kadeo_pos_draft_shop-beta');
    assert.equal(getSalesDeskStorageKey(''), 'kadeo_pos_draft_default');
    assert.equal(getSalesDeskStorageKey(undefined), 'kadeo_pos_draft_default');
  });

  test('readStoredSalesDeskDraft returns empty draft on null, invalid JSON, or empty string', () => {
    assert.deepEqual(readStoredSalesDeskDraft(null), EMPTY_SALES_DESK_DRAFT);
    assert.deepEqual(readStoredSalesDeskDraft(''), EMPTY_SALES_DESK_DRAFT);
    assert.deepEqual(readStoredSalesDeskDraft('invalid json{'), EMPTY_SALES_DESK_DRAFT);
    assert.deepEqual(readStoredSalesDeskDraft('[]'), EMPTY_SALES_DESK_DRAFT);
    assert.deepEqual(readStoredSalesDeskDraft('123'), EMPTY_SALES_DESK_DRAFT);
  });

  test('readStoredSalesDeskDraft defensively bounds and sanitizes basket lines and stock quantity', () => {
    const payload = JSON.stringify({
      lines: [
        { id: 'p1', name: 'Linen Shirt', sku: 'LS-1', price: 3500, stock_quantity: 10, quantity: 2 },
        { id: 'p1', name: 'Duplicate item', price: 3500, stock_quantity: 10, quantity: 5 },
        { id: 'p2', name: 'Max stock exceeded', price: 1500, stock_quantity: 3, quantity: 10 },
        { id: 'p3', name: 'Out of stock item', price: 2000, stock_quantity: 0, quantity: 1 },
        { id: 'p4', name: 'Negative price', price: -50, stock_quantity: 5, quantity: 1 },
        { id: '', name: 'No ID', price: 500, stock_quantity: 5, quantity: 1 },
      ],
      customer: {
        name: 'Kasun Silva',
        phone: '0771234567',
        address: '123 Galle Road, Colombo 03',
        note: 'Urgent pickup today',
      },
    });

    const parsed = readStoredSalesDeskDraft(payload);

    assert.equal(parsed.lines.length, 2);
    assert.equal(parsed.lines[0].id, 'p1');
    assert.equal(parsed.lines[0].quantity, 2);
    assert.equal(parsed.lines[0].sku, 'LS-1');

    assert.equal(parsed.lines[1].id, 'p2');
    assert.equal(parsed.lines[1].quantity, 3);
    assert.equal(parsed.lines[1].stock_quantity, 3);

    assert.equal(parsed.customer.name, 'Kasun Silva');
    assert.equal(parsed.customer.phone, '0771234567');
    assert.equal(parsed.customer.address, '123 Galle Road, Colombo 03');
    assert.equal(parsed.customer.note, 'Urgent pickup today');
  });

  test('readStoredSalesDeskDraft enforces max string limits to prevent malicious storage bloat', () => {
    const payload = JSON.stringify({
      lines: [
        { id: 'p1', name: 'A'.repeat(500), sku: 'B'.repeat(200), price: 100, stock_quantity: 5, quantity: 1 },
      ],
      customer: {
        name: 'C'.repeat(300),
        phone: 'D'.repeat(100),
        address: 'E'.repeat(2000),
        note: 'F'.repeat(2000),
      },
    });

    const parsed = readStoredSalesDeskDraft(payload);
    assert.equal(parsed.lines[0].name.length, 200);
    assert.equal(parsed.lines[0].sku.length, 60);
    assert.equal(parsed.customer.name.length, 120);
    assert.equal(parsed.customer.phone.length, 30);
    assert.equal(parsed.customer.address.length, 1000);
    assert.equal(parsed.customer.note.length, 1000);
  });
});

// ---------------------------------------------------------------------------
// 3. Actual Production Component Lifecycle Harness & Hook Execution
// ---------------------------------------------------------------------------
/**
 * Creates a lifecycle execution harness around the transpiled SalesDesk component.
 * Executes actual React hook dispatcher calls (useState, useEffect, useRef) and
 * faithfully models React's commit phase closures and batched state updates.
 */
function createSalesDeskComponentHarness(componentSource, mockSessionStorage) {
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

  const code = ts.transpileModule(componentSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const windowObj = {
    sessionStorage: mockSessionStorage,
  };

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (id) => {
      if (id === 'react') return React;
      if (id === 'react/jsx-runtime') return { jsx: () => ({}), jsxs: () => ({}), Fragment: 'Fragment' };
      if (id === 'next/link') return (p) => p.children;
      if (id === 'next/navigation') return { useRouter: () => ({ push() {}, replace() {}, refresh() {} }) };
      if (id === 'lucide-react') return new Proxy({}, { get: () => () => ({}) });
      if (id === '@/lib/utils') return { formatCurrency: (v) => 'LKR ' + v };
      if (id === '@/features/orders/desk-actions') return { createDeskOrderAction: async () => ({}) };
      if (id === '@/lib/sales-desk-storage') {
        return {
          getSalesDeskStorageKey,
          readStoredSalesDeskDraft,
          EMPTY_SALES_DESK_DRAFT,
        };
      }
      return {};
    },
    window: windowObj,
    sessionStorage: mockSessionStorage,
    console,
    process,
    Set,
    Map,
    Array,
    Object,
  };

  vm.runInNewContext(code, sandbox);
  const SalesDesk = sandbox.exports.SalesDesk || sandbox.module.exports.SalesDesk;

  let currentProps = null;

  function runEffects() {
    // In React commit phase, effects are evaluated in order of registration
    for (const h of hooks) {
      if (h.type === 'effect') {
        const changed =
          !h.prevDeps ||
          h.prevDeps.length !== h.deps.length ||
          h.prevDeps.some((d, i) => !Object.is(d, h.deps[i]));
        if (changed) {
          h.prevDeps = h.deps;
          h.effectFn();
        }
      }
    }

    // Process batched state updates queued by effects and trigger re-render
    if (pendingUpdates.length > 0) {
      const updates = pendingUpdates;
      pendingUpdates = [];
      for (const { idx, updater } of updates) {
        hooks[idx].value = typeof updater === 'function' ? updater(hooks[idx].value) : updater;
      }
      // Re-render component with new state
      hookIndex = 0;
      SalesDesk(currentProps);
      runEffects();
    }
  }

  function render(props) {
    currentProps = props;
    hookIndex = 0;
    SalesDesk(currentProps);
    runEffects();
  }

  return {
    render,
    getHydratedKey: () => hooks[0]?.value,
    getLines: () => hooks[1]?.value,
    getCustomer: () => hooks[2]?.value,
    setLines: (lines) => {
      pendingUpdates.push({ idx: 1, updater: lines });
      hookIndex = 0;
      SalesDesk(currentProps);
      runEffects();
    },
    setCustomer: (customer) => {
      pendingUpdates.push({ idx: 2, updater: customer });
      hookIndex = 0;
      SalesDesk(currentProps);
      runEffects();
    },
  };
}

describe('Actual Production SalesDesk Component Lifecycle & Cross-Shop Isolation', () => {
  const productionSource = fs.readFileSync(salesDeskComponentPath, 'utf8');

  test('switching shops does not write shop A draft even once into shop B storageKey', () => {
    const store = new Map();
    const setItemHistory = []; // Audit log recording all setItem calls

    const mockSessionStorage = {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => {
        setItemHistory.push({ key, value });
        store.set(key, value);
      },
      removeItem: (key) => {
        store.delete(key);
      },
    };

    const harness = createSalesDeskComponentHarness(productionSource, mockSessionStorage);

    // 1. Initial mount for shop-alpha
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-alpha' });

    // 2. User enters draft in Shop Alpha
    harness.setLines([
      { id: 'p1', name: 'Alpha Linen Shirt', price: 3500, stock_quantity: 10, quantity: 2 },
    ]);
    harness.setCustomer({
      name: 'Alpha Buyer',
      phone: '0771111111',
      address: '10 Galle Road',
      note: 'Urgent Order',
    });

    const keyAlpha = getSalesDeskStorageKey('shop-alpha');
    const keyBeta = getSalesDeskStorageKey('shop-beta');

    // Confirm Shop Alpha was persisted
    assert.ok(store.has(keyAlpha), 'Shop Alpha draft should be persisted in sessionStorage');
    assert.ok(
      setItemHistory.some((c) => c.key === keyAlpha && c.value.includes('Alpha Buyer')),
      'Audit log must show write to Shop Alpha'
    );
    assert.equal(store.has(keyBeta), false, 'Shop Beta key must not exist yet');

    // 3. User switches to shop-beta (prop shopId changes)
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-beta' });

    // 4. VERIFY COMPLETE SETITEM AUDIT LOG:
    // Assert that keyBeta was NEVER written with Shop Alpha data (not even once!)
    const illegalBetaWrites = setItemHistory.filter(
      (c) => c.key === keyBeta && c.value.includes('Alpha Buyer')
    );
    assert.equal(
      illegalBetaWrites.length,
      0,
      `Regression Detected: Shop Alpha draft was written ${illegalBetaWrites.length} times to Shop Beta key!`
    );

    // Verify in-memory state is clean for Shop Beta
    assert.equal(harness.getLines().length, 0, 'In-memory lines for Shop Beta must be clean');
    assert.equal(harness.getCustomer().name, '', 'In-memory customer name for Shop Beta must be clean');
    assert.equal(harness.getCustomer().phone, '', 'In-memory customer phone for Shop Beta must be clean');

    // Verify Shop Alpha original draft remains intact in storage
    const restoredAlpha = JSON.parse(store.get(keyAlpha));
    assert.equal(restoredAlpha.lines[0].id, 'p1');
    assert.equal(restoredAlpha.customer.name, 'Alpha Buyer');
  });

  test('handles storage getItem throwing by resetting to clean state without retaining previous customer', () => {
    let shouldThrow = false;
    const store = new Map();
    const setItemHistory = [];

    const throwingStorage = {
      getItem: (key) => {
        if (shouldThrow) throw new Error('SecurityError: Storage access is denied');
        return store.get(key) || null;
      },
      setItem: (key, value) => {
        setItemHistory.push({ key, value });
        store.set(key, value);
      },
      removeItem: (key) => store.delete(key),
    };

    const harness = createSalesDeskComponentHarness(productionSource, throwingStorage);

    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-1' });
    harness.setLines([{ id: 'p1', name: 'Item 1', price: 500, stock_quantity: 5, quantity: 1 }]);
    harness.setCustomer({ name: 'John Doe', phone: '0770000000', address: 'City Center', note: '' });

    assert.equal(harness.getCustomer().name, 'John Doe');

    // Switch to shop-2 where storage access throws
    shouldThrow = true;
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-2' });

    // Lines and customer must be cleanly reset, not retaining John Doe
    assert.equal(harness.getLines().length, 0, 'Lines must be cleanly reset to [] on storage error');
    assert.equal(harness.getCustomer().name, '', 'Customer name must be reset on storage error');
    assert.equal(harness.getCustomer().phone, '', 'Customer phone must be reset on storage error');
  });
});

// ---------------------------------------------------------------------------
// 4. In-Memory Mutation Testing & Regression Verification
// ---------------------------------------------------------------------------
describe('In-Memory Mutation Testing (Verifying Regressions are Detected)', () => {
  const productionSource = fs.readFileSync(salesDeskComponentPath, 'utf8');

  test('mutant with hydratedKey guard removed fails cross-shop isolation check (leak caught)', () => {
    // In-memory mutation: replace hydratedKey !== storageKey guard with boolean hydration check
    const guardPattern = 'if (hydratedKey !== storageKey || typeof window === "undefined") return;';
    assert.ok(productionSource.includes(guardPattern), 'Guard pattern must exist in production source');

    const mutantSource = productionSource.replace(
      guardPattern,
      'if (!hydratedKey || typeof window === "undefined") return;'
    );
    assert.notEqual(mutantSource, productionSource, 'Mutant 1 source must differ from production');

    const store = new Map();
    const setItemHistory = [];
    const mockStorage = {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => {
        setItemHistory.push({ key, value });
        store.set(key, value);
      },
      removeItem: (key) => store.delete(key),
    };

    const harness = createSalesDeskComponentHarness(mutantSource, mockStorage);

    // Mount Alpha and create draft
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-alpha' });
    harness.setLines([{ id: 'p1', name: 'Alpha Linen', price: 1000, stock_quantity: 5, quantity: 2 }]);
    harness.setCustomer({ name: 'Alpha Buyer', phone: '0771111111', address: 'Alpha St', note: '' });

    const keyBeta = getSalesDeskStorageKey('shop-beta');

    // Switch to Beta: Without the guard, Alpha data will be written into Beta key!
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-beta' });

    const leaks = setItemHistory.filter((c) => c.key === keyBeta && c.value.includes('Alpha Buyer'));

    // The test MUST detect that the mutant leaks data!
    assert.ok(
      leaks.length > 0,
      'Mutant 1 test verification failed: Removing hydratedKey guard MUST produce cross-shop leak in write history!'
    );
  });

  test('mutant with catch-block reset removed fails storage-throw recovery check (stale customer caught)', () => {
    // In-memory mutation: remove setLines([]) and setCustomer(...) in catch block
    const catchResetLines = 'setLines([]);';
    const catchResetCustomer = 'setCustomer(EMPTY_SALES_DESK_DRAFT.customer);';
    assert.ok(productionSource.includes(catchResetLines), 'Catch reset lines must exist in production source');
    assert.ok(productionSource.includes(catchResetCustomer), 'Catch reset customer must exist in production source');

    const mutantSource = productionSource
      .replace(catchResetLines, '/* setLines removed */')
      .replace(catchResetCustomer, '/* setCustomer removed */');
    assert.notEqual(mutantSource, productionSource, 'Mutant 2 source must differ from production');

    let shouldThrow = false;
    const store = new Map();
    const mockStorage = {
      getItem: (key) => {
        if (shouldThrow) throw new Error('AccessDenied');
        return store.get(key) || null;
      },
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    };

    const harness = createSalesDeskComponentHarness(mutantSource, mockStorage);

    // Mount shop-1 and enter customer
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-1' });
    harness.setCustomer({ name: 'Alpha Buyer', phone: '0771111111', address: 'Alpha St', note: '' });

    assert.equal(harness.getCustomer().name, 'Alpha Buyer');

    // Switch to shop-2 with throwing storage
    shouldThrow = true;
    harness.render({ products: [], query: '', page: 1, totalPages: 1, shopId: 'shop-2' });

    // In mutant 2, customer is NOT reset and retains 'Alpha Buyer'
    assert.equal(
      harness.getCustomer().name,
      'Alpha Buyer',
      'Mutant 2 test verification failed: Removing catch reset MUST preserve stale customer state!'
    );
  });
});
