const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports: mod.exports, require: name => name in dependencies ? dependencies[name] : require(name), URL, Set, console, process, crypto: globalThis.crypto, Buffer });
  return mod.exports;
}

const phone = load('src/lib/phone.ts', {});
const session = load('src/lib/supabase/session.ts', {});
test('corrupt saved carts do not crash checkout or introduce invalid quantities', () => {
  const { readStoredCart } = load('src/lib/cart-storage.ts', {});
  for (const raw of ['broken json', '{}', 'null', '[null]']) assert.equal(readStoredCart(raw).length, 0);
  const item = { id: 'a', name: 'Item', price: 100, quantity: 9, maxStock: 2 };
  const restored = readStoredCart(JSON.stringify([item, item, { ...item, id: 'b', price: -1 }]));
  assert.equal(restored.length, 1); assert.equal(restored[0].quantity, 2);
});
function checkout({ rpcError = null, visible = true } = {}) {
  const calls = [];
  const chain = { select() { return this; }, eq() { return this; }, async single() { return { data: { id: 'shop-a', status: 'active', settings: [{ store_visibility: visible }] } }; } };
  const db = { from() { return chain; }, async rpc(name, payload) { calls.push({ name, payload }); return { data: { order_id: 'order-a', order_code: 'KAD-TEST', total: 500, whatsapp_number: '0771234567' }, error: rpcError }; } };
  return { calls, action: load('src/features/orders/actions.ts', { '@/lib/supabase/server': { createClient: async () => db }, '@/lib/utils': { formatCurrency: value => `LKR ${value}` }, '@/lib/phone': phone }).submitOrderAction };
}
const valid = { shopSlug: 'test-shop', customerName: 'Test Buyer', customerPhone: '0771234567', customerAddress: 'Test pickup counter', customerEmail: '', orderNote: '', items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }] };

test('actual checkout validates bounded fields and repeated items before any write', async () => {
  const { action, calls } = checkout();
  for (const payload of [{ ...valid, customerName: '  ' }, { ...valid, customerAddress: 'x'.repeat(1001) }, { ...valid, items: [...valid.items, ...valid.items] }, { ...valid, items: [{ ...valid.items[0], quantity: 0 }] }]) assert.ok((await action(payload)).error);
  assert.equal(calls.length, 0);
});
test('actual checkout normalizes phone, uses server-priced RPC, and returns recoverable receipt', async () => {
  const { action, calls } = checkout();
  const result = await action({ ...valid, total: 1, price: 1 });
  assert.equal(result.total, 500);
  assert.equal(result.orderCode, 'KAD-TEST');
  assert.equal(calls[0].payload.p_customer_phone, '94771234567');
  assert.equal(calls[0].payload.price, undefined);
  assert.match(result.whatsappUrl, /^https:\/\/wa.me\/94771234567/);
});
test('checkout returns inventory failure without success and rejects hidden store', async () => {
  const failed = await checkout({ rpcError: { message: 'Insufficient stock' } }).action(valid);
  assert.equal(failed.error, 'Insufficient stock'); assert.equal(failed.success, undefined);
  const hidden = checkout({ visible: false });
  assert.ok((await hidden.action(valid)).error); assert.equal(hidden.calls.length, 0);
});
test('sales desk resolves fresh seller identity and overrides caller store', async () => {
  let received; const paths = [];
  const chain = { select() { return this; }, eq(key, value) { assert.equal(key, 'owner_id'); assert.equal(value, 'seller-a'); return this; }, async single() { return { data: { id: 'shop-a', slug: 'own-store' } }; } };
  const action = load('src/features/orders/desk-actions.ts', {
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'seller-a' } } }) }, from: () => chain }) },
    './actions': { submitOrderAction: async payload => { received = payload; return { success: true, orderId: 'a' }; } },
    'next/cache': { revalidatePath: path => paths.push(path) },
  }).createDeskOrderAction;
  assert.equal((await action({ ...valid, shopSlug: 'foreign-store' })).success, true);
  assert.equal(received.shopSlug, 'own-store'); assert.ok(paths.includes('/dashboard/products'));
});
test('sales desk refuses signed-out requests before checkout', async () => {
  const action = load('src/features/orders/desk-actions.ts', {
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }) },
    './actions': { submitOrderAction: () => assert.fail('must not create order') },
    'next/cache': { revalidatePath: () => assert.fail('must not revalidate') },
  }).createDeskOrderAction;
  assert.ok((await action(valid)).error);
});
test('receipt link rejects executable and foreign URLs without double decoding', () => {
  const { safeWhatsAppLink } = load('src/lib/order-links.ts', {});
  for (const url of ['javascript:alert(1)', 'https://evil.example', 'https://wa.me@evil.example/94771234567', '%broken', 'https://wa.me/abc']) assert.equal(safeWhatsAppLink(url), null);
  assert.equal(safeWhatsAppLink('https://wa.me/94771234567?text=100%25'), 'https://wa.me/94771234567?text=100%25');
});

test('customer purchase flows through real local adapter to seller fulfillment and stock restoration', async () => {
  let fixture = JSON.stringify({ users: [], profiles: [], shops: [{ id: 'shop-a', owner_id: 'seller-a', slug: 'test-shop', status: 'active', name: 'Test Store', whatsapp_number: '0771234567' }], shop_settings: [], categories: [], products: [{ id: valid.items[0].productId, shop_id: 'shop-a', name: 'Fixture item', price: 250, stock_quantity: 5, status: 'active' }], product_images: [], customers: [], orders: [], order_items: [], subscriptions: [], admin_activity_logs: [] });
  const memoryFs = { existsSync: () => true, readFileSync: () => fixture, writeFileSync: (path, value) => { fixture = value; }, mkdirSync() {} };
  const { createLocalClient } = load('src/lib/supabase/local-adapter.ts', { fs: memoryFs, '../phone.ts': phone, './session.ts': session, './session': session });
  const buyer = createLocalClient(null);
  const seller = createLocalClient({ id: 'seller-a', email: 'seller@example.test' });
  const checkoutAction = load('src/features/orders/actions.ts', { '@/lib/supabase/server': { createClient: async () => buyer }, '@/lib/utils': { formatCurrency: value => `LKR ${value}` }, '@/lib/phone': phone }).submitOrderAction;
  const receipt = await checkoutAction(valid);
  assert.equal(receipt.success, true);
  assert.equal(receipt.total, 500);
  assert.equal(JSON.parse(fixture).products[0].stock_quantity, 3);
  const tracked = await buyer.rpc('track_customer_order', { p_shop_slug: 'test-shop', p_order_code: receipt.orderCode, p_normalized_phone: '94771234567' });
  assert.equal(tracked.data.order.status, 'pending');
  const wrongPhone = await buyer.rpc('track_customer_order', { p_shop_slug: 'test-shop', p_order_code: receipt.orderCode, p_normalized_phone: '94770000000' });
  assert.equal(wrongPhone.data.success, false);
  const statusAction = load('src/features/orders/seller-actions.ts', { '@/lib/supabase/server': { createClient: async () => seller }, 'next/cache': { revalidatePath() {} } }).updateOrderStatusAction;
  assert.equal((await statusAction(receipt.orderId, 'confirmed')).success, true);
  assert.ok((await statusAction(receipt.orderId, 'completed')).error);
  assert.equal((await statusAction(receipt.orderId, 'cancelled')).success, true);
  assert.equal((await statusAction(receipt.orderId, 'cancelled')).success, true);
  assert.equal(JSON.parse(fixture).products[0].stock_quantity, 5);
  const snapshot = fixture;
  assert.ok((await checkoutAction({ ...valid, items: [{ ...valid.items[0], quantity: 6 }] })).error);
  assert.equal(fixture, snapshot, 'stock failure must not persist customer, order, or stock changes');
});

for (const [table, component] of [['products', 'ProductListClient'], ['customers', 'CustomerListClient'], ['orders', 'OrderListClient']]) {
  test(`${table} page uses real Supabase builder with separate count and bounded data requests`, async () => {
    const { createClient } = require('@supabase/supabase-js');
    const requests = [];
    const db = createClient('https://fixture.invalid', 'fixture-key', { auth: { persistSession: false }, global: { fetch: async (input, options) => {
      const url = new URL(input); requests.push({ url, method: options.method });
      const body = url.pathname.endsWith('/shops') ? { id: 'shop-a' } : [];
      return new Response(options.method === 'HEAD' ? null : JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json', 'Content-Range': '0-0/1' } });
    } } });
    db.auth.getUser = async () => ({ data: { user: { id: 'seller-a' } } });
    const page = load(`src/app/dashboard/${table}/page.tsx`, {
      '@/lib/supabase/server': { createClient: async () => db },
      'next/navigation': { redirect: () => assert.fail('unexpected redirect') },
      'next/link': () => null,
      [`@/components/dashboard/${component}`]: { [component]: () => null },
    }).default;
    await page({ searchParams: Promise.resolve({ q: 'shirt),shop_id.eq.other', page: '999' }) });
    const target = requests.filter(request => request.url.pathname.endsWith(`/${table}`));
    assert.ok(target.some(request => request.method === 'HEAD'));
    const data = target.find(request => request.method === 'GET');
    assert.ok(data, 'data request must not retain HEAD method');
    assert.equal(data.url.searchParams.get('shop_id'), 'eq.shop-a');
    assert.equal(data.url.searchParams.get('limit'), '10');
    assert.equal(data.url.searchParams.get('offset'), '0');
    assert.ok(!data.url.searchParams.get('or').includes('),shop_id.eq.other'));
  });
}
