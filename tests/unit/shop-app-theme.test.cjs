const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function firstForm(node) {
  if (!node) return null;
  if (Array.isArray(node)) return node.map(firstForm).find(Boolean);
  if (node.type === 'form' && typeof node.props?.action === 'function') return node;
  return firstForm(node.props?.children);
}

function loadDesignModule(options = {}) {
  const {
    currentUser = { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops = [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
      { id: 'shop-b-id', owner_id: 'seller-b-id', slug: 'shop-b', name: 'Shop B', theme_id: 'minimal' },
    ],
  } = options;

  let activeUser = currentUser ? { ...currentUser } : null;
  const shopsDb = shops.map(s => ({ ...s }));
  const revalidatedPaths = [];
  let getUserCallCount = 0;

  const mockDb = {
    auth: {
      async getUser() {
        getUserCallCount++;
        return { data: { user: activeUser }, error: null };
      },
      async signOut() {
        activeUser = null;
      },
      async signIn(user) {
        activeUser = user;
      },
    },
    from(tableName) {
      assert.equal(tableName, 'shops', 'Only shops table accessed');
      let selectFields = '*';
      const eqFilters = {};
      let updatePayload = null;

      const builder = {
        select(fields) {
          selectFields = fields;
          return builder;
        },
        eq(col, val) {
          eqFilters[col] = val;
          return builder;
        },
        update(payload) {
          updatePayload = payload;
          return builder;
        },
        async single() {
          const matched = shopsDb.filter(row => {
            return Object.entries(eqFilters).every(([k, v]) => row[k] === v);
          });
          if (matched.length === 0) {
            return { data: null, error: { message: 'Row not found' } };
          }
          return { data: { ...matched[0] }, error: null };
        },
        async then(resolve, reject) {
          try {
            if (updatePayload) {
              if (options.updateError) {
                return resolve({ data: null, error: options.updateError });
              }
              const matched = shopsDb.filter(row => {
                return Object.entries(eqFilters).every(([k, v]) => row[k] === v);
              });
              for (const row of matched) {
                Object.assign(row, updatePayload);
              }
              return resolve({ data: matched, error: null });
            }
            return resolve({ data: shopsDb, error: null });
          } catch (err) {
            if (reject) return reject(err);
            throw err;
          }
        },
      };
      return builder;
    },
  };

  const code = fs.readFileSync(path.resolve(__dirname, '../../src/app/dashboard/design/page.tsx'), 'utf8');
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
      if (pkg === '@/lib/supabase/server') {
        return { createClient: async () => mockDb };
      }
      if (pkg === 'next/navigation') {
        return {
          redirect(dest) {
            const err = new Error('NEXT_REDIRECT:' + dest);
            err.digest = 'NEXT_REDIRECT;' + dest;
            throw err;
          },
        };
      }
      if (pkg === 'next/cache') {
        return {
          revalidatePath(p) {
            revalidatedPaths.push(p);
          },
        };
      }
      if (pkg === 'next/link') {
        return function MockLink(props) {
          return { type: 'a', props };
        };
      }
      if (pkg === 'lucide-react') {
        return new Proxy({}, {
          get(_, iconName) {
            return function MockIcon(props) {
              return { type: iconName, props };
            };
          },
        });
      }
      if (pkg.startsWith('@/')) { return function MockComponent(props) { return { type: 'div', props }; }; }
      if (pkg.startsWith('react')) {
        return require(pkg);
      }
      return require(pkg);
    },
    URL,
    Set,
    Map,
    Date,
    console,
  };

  vm.runInNewContext(transpiled, context);

  return {
    PageComponent: moduleExports.default,
    ALLOWED_THEME_IDS: moduleExports.ALLOWED_THEME_IDS,
    mockDb,
    shopsDb,
    revalidatedPaths,
    get getUserCalls() {
      return getUserCallCount;
    },
    signOut() {
      activeUser = null;
    },
    signIn(user) {
      activeUser = user;
    },
  };
}

test('1. ALLOWED_THEME_IDS contains shop_app and all standard platform theme IDs', () => {
  const env = loadDesignModule();
  const allowed = env.ALLOWED_THEME_IDS;

  assert.ok(allowed instanceof Set, 'ALLOWED_THEME_IDS must be an exported Set');
  assert.equal(allowed.has('shop_app'), true, 'ALLOWED_THEME_IDS must contain shop_app');
  assert.equal(allowed.has('modern_retail'), true, 'Must contain modern_retail');
  assert.equal(allowed.has('minimal'), true, 'Must contain minimal');
  assert.equal(allowed.has('modern_boutique'), true, 'Must contain modern_boutique');
  assert.equal(allowed.has('classic'), true, 'Must contain classic');
  assert.equal(allowed.has('viva_glass'), true, 'Must contain viva_glass');
  assert.equal(allowed.has('bold_editorial'), true, 'Must contain bold_editorial');
});

test('2. Legitimate store owner successfully switches theme to shop_app', async () => {
  const env = loadDesignModule({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form, 'Page renders theme form');

  // Switch to shop_app
  await form.props.action('shop_app');

  assert.equal(env.shopsDb[0].theme_id, 'shop_app', 'Shop theme must be updated to shop_app');
  assert.ok(env.shopsDb[0].updated_at, 'updated_at timestamp is populated');
  assert.ok(env.revalidatedPaths.includes('/dashboard/design'), 'Revalidates dashboard design page');
  assert.ok(env.revalidatedPaths.includes('/shop/shop-a'), 'Revalidates storefront path');
});

test('3. Theme switching action strictly rejects unknown and invalid theme IDs', async () => {
  const env = loadDesignModule({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form, 'Page renders theme form');

  const invalidThemeInputs = [
    'unknown_theme',
    'shop_app_fake',
    'malicious_theme',
    '<script>alert("xss")</script>',
    '',
    'drop table shops',
    'undefined',
    'null',
    'shopify_classic',
  ];

  for (const badTheme of invalidThemeInputs) {
    let threw = false;
    try {
      await form.props.action(badTheme);
    } catch (err) {
      threw = true;
      assert.match(err.message, /Invalid theme selected/i, 'Should throw Invalid theme error for: ' + badTheme);
    }

    assert.equal(threw, true, 'Theme ' + badTheme + ' must be rejected');
    assert.equal(env.shopsDb[0].theme_id, 'minimal', 'Shop theme in database must NOT be changed');
  }
});

test('4. Unauthenticated caller cannot switch theme to shop_app', async () => {
  const env = loadDesignModule({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form);

  // Sign out user
  env.signOut();

  let threw = false;
  try {
    await form.props.action('shop_app');
  } catch (err) {
    threw = true;
    assert.match(err.message, /NEXT_REDIRECT:\/login|Unauthorized/i);
  }

  assert.equal(threw, true, 'Unauthenticated user must be redirected or rejected');
  assert.equal(env.shopsDb[0].theme_id, 'minimal', 'Database must remain untouched');
});

test('5. Cross-tenant theme switching isolation is preserved with shop_app', async () => {
  const env = loadDesignModule({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
      { id: 'shop-b-id', owner_id: 'seller-b-id', slug: 'shop-b', name: 'Shop B', theme_id: 'classic' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form);

  // Seller B session attempts to execute Seller A's action
  env.signIn({ id: 'seller-b-id', email: 'seller-b@example.com' });
  await form.props.action('shop_app');

  const shopA = env.shopsDb.find(s => s.id === 'shop-a-id');
  const shopB = env.shopsDb.find(s => s.id === 'shop-b-id');

  assert.equal(shopA.theme_id, 'minimal', 'Victim shop A must NOT be mutated');
  assert.equal(shopB.theme_id, 'shop_app', 'Only seller B shop is modified');
  assert.ok(!env.revalidatedPaths.includes('/shop/shop-a'), 'Never revalidates victim tenant path');
  assert.ok(env.revalidatedPaths.includes('/shop/shop-b'), 'Revalidates caller tenant path');
});
