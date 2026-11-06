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

function loadDesignPage(options = {}) {
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
  const PageComponent = moduleExports.default;

  return {
    PageComponent,
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

test('1. Unauthenticated (logged out) caller fails with unauthorized error/rejection without database writes', async () => {
  const env = loadDesignPage({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  // Render initial page while logged in
  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form, 'Page renders a theme selection form');

  // Seller signs out (e.g. session expires or logged out in another tab)
  env.signOut();
  const callsBefore = env.getUserCalls;
  const initialTheme = env.shopsDb[0].theme_id;

  // Invoking the captured server action must be rejected
  let threw = false;
  try {
    await form.props.action();
  } catch (err) {
    threw = true;
    assert.match(err.message, /NEXT_REDIRECT:\/login|Unauthorized/i);
  }

  assert.equal(threw, true, 'Unauthenticated server action invocation must throw or redirect');
  assert.equal(env.shopsDb[0].theme_id, initialTheme, 'Theme in database must NOT be modified');
  assert.ok(env.getUserCalls > callsBefore, 'Must perform fresh authentication check inside server action');
  assert.equal(env.revalidatedPaths.length, 0, 'No cache revalidation should occur on unauthorized call');
});

test('Failed theme persistence rejects without changing the theme or revalidating success', async () => {
  const env = loadDesignPage({ updateError: { message: 'Synthetic storage failure' } });
  const form = firstForm(await env.PageComponent());
  const before = JSON.stringify(env.shopsDb);
  await assert.rejects(form.props.action('modern_retail'), /Unable to save the store theme/);
  assert.equal(JSON.stringify(env.shopsDb), before);
  assert.deepEqual(env.revalidatedPaths, []);
});

test('2. Cross-tenant caller (seller B attempting to modify seller A shop) fails without mutating seller A shop', async () => {
  const env = loadDesignPage({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
      { id: 'shop-b-id', owner_id: 'seller-b-id', slug: 'shop-b', name: 'Shop B', theme_id: 'classic' },
    ],
  });

  // Render page for Seller A
  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form);

  // Now session switches to Seller B (cross-tenant invocation attempt)
  env.signIn({ id: 'seller-b-id', email: 'seller-b@example.com' });

  // Seller B attempts to execute the captured action from Seller A's page (which wanted 'modern_retail')
  await form.props.action();

  // Seller A's shop MUST remain untouched!
  const shopA = env.shopsDb.find(s => s.id === 'shop-a-id');
  const shopB = env.shopsDb.find(s => s.id === 'shop-b-id');

  assert.equal(shopA.theme_id, 'minimal', 'Seller A shop must NEVER be mutated by Seller B');
  // Seller B's own shop is updated because query was scoped to owner_id: user.id
  assert.equal(shopB.theme_id, 'modern_retail', 'Seller B update applies only to their own owned store');
  assert.ok(env.revalidatedPaths.includes('/shop/shop-b'), 'Revalidates Seller B slug, not Seller A slug');
  assert.ok(!env.revalidatedPaths.includes('/shop/shop-a'), 'Never revalidates victim tenant path');
});

test('3. Invalid theme ID rejects validation without modifying store database', async () => {
  const env = loadDesignPage({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form);

  // Directly attempt invalid theme inputs
  const invalidThemes = ['malicious_theme', '<script>alert(1)</script>', 'unknown_theme', '', 'drop table shops'];

  for (const badTheme of invalidThemes) {
    let threw = false;
    try {
      // action accepts themeInput string or FormData
      await form.props.action(badTheme);
    } catch (err) {
      threw = true;
      assert.match(err.message, /Invalid theme selected/i);
    }
    assert.equal(threw, true, `Invalid theme '${badTheme}' must throw validation error`);
    assert.equal(env.shopsDb[0].theme_id, 'minimal', 'Database must remain unchanged on invalid theme');
  }
});

test('4. Legitimate shop owner succeeds in changing theme to viva_glass and triggers proper revalidation', async () => {
  const env = loadDesignPage({
    currentUser: { id: 'seller-a-id', email: 'seller-a@example.com' },
    shops: [
      { id: 'shop-a-id', owner_id: 'seller-a-id', slug: 'shop-a', name: 'Shop A', theme_id: 'minimal' },
    ],
  });

  const pageVNode = await env.PageComponent();
  const form = firstForm(pageVNode);
  assert.ok(form);

  // Valid recognized themes: modern_retail, minimal, viva_glass, bold_editorial, modern_boutique, classic
  await form.props.action('viva_glass');

  assert.equal(env.shopsDb[0].theme_id, 'viva_glass', 'Legitimate owner successfully updates theme to viva_glass');
  assert.ok(env.shopsDb[0].updated_at, 'updated_at timestamp is set');
  assert.ok(env.revalidatedPaths.includes('/dashboard/design'), 'Revalidates dashboard design page');
  assert.ok(env.revalidatedPaths.includes('/shop/shop-a'), 'Revalidates owner shop storefront path');

  // Can also switch to bold_editorial
  await form.props.action('bold_editorial');
  assert.equal(env.shopsDb[0].theme_id, 'bold_editorial', 'Legitimate owner successfully updates to bold_editorial');

  // Can also switch to modern_retail
  await form.props.action('modern_retail');
  assert.equal(env.shopsDb[0].theme_id, 'modern_retail', 'Legitimate owner successfully updates to modern_retail');
});
