const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function firstFormWithAction(node) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = firstFormWithAction(item);
      if (found) return found;
    }
    return null;
  }
  if (node.type === 'form' && typeof node.props?.action === 'function') {
    return node;
  }
  return firstFormWithAction(node.props?.children);
}

function createMockSupabase(options = {}) {
  const {
    currentUser = { id: 'admin-1', email: 'admin@kadeo.lk' },
    userProfile = { id: 'admin-1', role: 'admin', full_name: 'Super Admin' },
    profiles = [
      { id: 'admin-1', role: 'admin', full_name: 'Super Admin', email: 'admin@kadeo.lk' },
      { id: 'seller-1', role: 'seller', full_name: 'Merchant One', email: 'seller1@kadeo.lk' },
    ],
    shops = [
      { id: 'shop-1', name: 'Store One', slug: 'store-one', status: 'active', owner_id: 'seller-1' },
      { id: 'shop-2', name: 'Store Two', slug: 'store-two', status: 'suspended', owner_id: 'seller-2' },
    ],
    products = [
      { id: 'p-1', name: 'Item 1', status: 'active', shop_id: 'shop-1' },
    ],
    orders = [
      { id: 'o-1', order_code: 'KAD-2026-0001', shop_id: 'shop-1' },
    ],
  } = options;

  let activeUser = currentUser ? { ...currentUser } : null;
  let activeProfile = userProfile ? { ...userProfile } : null;
  const shopsDb = shops.map(s => ({ ...s }));
  const revalidatedPaths = [];

  const mockDb = {
    auth: {
      async getUser() {
        return { data: { user: activeUser }, error: null };
      },
      signIn(user, profile) {
        activeUser = user ? { ...user } : null;
        activeProfile = profile ? { ...profile } : null;
      },
      signOut() {
        activeUser = null;
        activeProfile = null;
      },
    },
    from(table) {
      let selectFields = '*';
      let selectOpts = null;
      const eqFilters = {};
      let updatePayload = null;

      const builder = {
        select(fields, opts) {
          selectFields = fields;
          selectOpts = opts;
          return builder;
        },
        eq(col, val) {
          eqFilters[col] = val;
          return builder;
        },
        order() {
          return builder;
        },
        update(payload) {
          updatePayload = payload;
          return builder;
        },
        async single() {
          if (table === 'profiles') {
            if (!activeUser) return { data: null, error: { message: 'Not found' } };
            const profile = eqFilters.id === activeUser.id ? activeProfile : profiles.find(p => p.id === eqFilters.id);
            return { data: profile ? { ...profile } : null, error: profile ? null : { message: 'Not found' } };
          }
          if (table === 'shops') {
            const matched = shopsDb.find(s => Object.entries(eqFilters).every(([k, v]) => s[k] === v));
            return { data: matched ? { ...matched } : null, error: matched ? null : { message: 'Not found' } };
          }
          return { data: null, error: null };
        },
        async then(resolve, reject) {
          try {
            if (updatePayload && table === 'shops') {
              const matched = shopsDb.filter(s => Object.entries(eqFilters).every(([k, v]) => s[k] === v));
              for (const row of matched) {
                Object.assign(row, updatePayload);
              }
              return resolve({ data: matched, error: null });
            }

            if (selectOpts && selectOpts.head) {
              let count = 0;
              if (table === 'profiles') count = profiles.length;
              if (table === 'shops') {
                count = shopsDb.filter(s => Object.entries(eqFilters).every(([k, v]) => s[k] === v)).length;
              }
              if (table === 'products') count = products.length;
              if (table === 'orders') count = orders.length;
              return resolve({ count, data: null, error: null });
            }

            if (table === 'shops') {
              return resolve({ data: shopsDb.map(s => ({ ...s, owner: profiles.find(p => p.id === s.owner_id) })), error: null });
            }
            return resolve({ data: [], error: null });
          } catch (err) {
            if (reject) return reject(err);
            throw err;
          }
        },
      };
      return builder;
    },
  };

  return {
    mockDb,
    shopsDb,
    revalidatedPaths,
    signIn(user, profile) {
      activeUser = user ? { ...user } : null;
      activeProfile = profile ? { ...profile } : null;
    },
    signOut() {
      activeUser = null;
      activeProfile = null;
    },
  };
}

function loadAdminLayout(supabaseClientMock, revalidatedPaths) {
  const layoutPath = path.resolve(__dirname, '../../src/app/admin/layout.tsx');
  const code = fs.readFileSync(layoutPath, 'utf8');
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
        return { createClient: async () => supabaseClientMock };
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
          revalidatePath(p) { revalidatedPaths.push(p); },
        };
      }
      if (pkg === 'next/link') {
        return function MockLink(props) { return { type: 'a', props }; };
      }
      if (pkg === 'lucide-react') {
        return new Proxy({}, {
          get(_, iconName) {
            return function MockIcon(props) { return { type: iconName, props }; };
          },
        });
      }
      if (pkg === '@/features/auth/actions') {
        return { logoutAction: async () => {} };
      }
      if (pkg.startsWith('react')) return require(pkg);
      return require(pkg);
    },
    console,
  };

  vm.runInNewContext(transpiled, context);
  return moduleExports.default;
}

function loadAdminOverviewPage(supabaseClientMock, revalidatedPaths) {
  const pagePath = path.resolve(__dirname, '../../src/app/admin/page.tsx');
  const code = fs.readFileSync(pagePath, 'utf8');
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
        return { createClient: async () => supabaseClientMock };
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
          revalidatePath(p) { revalidatedPaths.push(p); },
        };
      }
      if (pkg === 'next/link') {
        return function MockLink(props) { return { type: 'a', props }; };
      }
      if (pkg === 'lucide-react') {
        return new Proxy({}, {
          get(_, iconName) {
            return function MockIcon(props) { return { type: iconName, props }; };
          },
        });
      }
      if (pkg.startsWith('react')) return require(pkg);
      return require(pkg);
    },
    console,
  };

  vm.runInNewContext(transpiled, context);
  return moduleExports.default;
}

test('1. AdminLayout redirects unauthenticated visitors to /login', async () => {
  const env = createMockSupabase();
  env.signOut();

  const AdminLayout = loadAdminLayout(env.mockDb, env.revalidatedPaths);

  let threw = false;
  try {
    await AdminLayout({ children: { type: 'div' } });
  } catch (err) {
    threw = true;
    assert.match(err.message, /NEXT_REDIRECT:\/login/i, 'Unauthenticated user must redirect to /login');
  }
  assert.equal(threw, true, 'AdminLayout must throw redirect for unauthenticated user');
});

test('2. AdminLayout redirects non-admin (seller) user to /dashboard', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'seller-1', email: 'seller1@kadeo.lk' },
    { id: 'seller-1', role: 'seller', full_name: 'Merchant One' }
  );

  const AdminLayout = loadAdminLayout(env.mockDb, env.revalidatedPaths);

  let threw = false;
  try {
    await AdminLayout({ children: { type: 'div' } });
  } catch (err) {
    threw = true;
    assert.match(err.message, /NEXT_REDIRECT:\/dashboard/i, 'Seller role must redirect to /dashboard');
  }
  assert.equal(threw, true, 'AdminLayout must prevent non-admin access');
});

test('3. AdminLayout redirects user with missing role to /dashboard', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'user-without-role', email: 'user@kadeo.lk' },
    { id: 'user-without-role', role: null, full_name: 'Regular User' }
  );

  const AdminLayout = loadAdminLayout(env.mockDb, env.revalidatedPaths);

  let threw = false;
  try {
    await AdminLayout({ children: { type: 'div' } });
  } catch (err) {
    threw = true;
    assert.match(err.message, /NEXT_REDIRECT:\/dashboard/i);
  }
  assert.equal(threw, true, 'User without admin role must be redirected to /dashboard');
});

test('4. AdminLayout allows legitimate admin user and renders layout', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'admin-1', email: 'admin@kadeo.lk' },
    { id: 'admin-1', role: 'admin', full_name: 'Super Admin' }
  );

  const AdminLayout = loadAdminLayout(env.mockDb, env.revalidatedPaths);
  const vNode = await AdminLayout({ children: { type: 'span', props: { children: 'Admin Child' } } });

  assert.ok(vNode, 'AdminLayout renders for role admin');
  assert.equal(vNode.type, 'div');
});

test('5. toggleShopStatusAction throws Unauthorized when caller is unauthenticated', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'admin-1', email: 'admin@kadeo.lk' },
    { id: 'admin-1', role: 'admin', full_name: 'Super Admin' }
  );

  const AdminPage = loadAdminOverviewPage(env.mockDb, env.revalidatedPaths);
  const pageVNode = await AdminPage();
  const form = firstFormWithAction(pageVNode);
  assert.ok(form, 'Page renders shop action forms');

  // Caller signs out before invoking action
  env.signOut();

  await assert.rejects(
    async () => {
      await form.props.action();
    },
    /Unauthorized/i,
    'Unauthenticated toggleShopStatusAction must throw Unauthorized'
  );

  // Assert DB unchanged
  assert.equal(env.shopsDb[0].status, 'active', 'Shop status must not change on unauthenticated action');
  assert.equal(env.revalidatedPaths.length, 0, 'No revalidation on unauthorized invocation');
});

test('6. toggleShopStatusAction throws Forbidden when caller is non-admin (seller)', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'admin-1', email: 'admin@kadeo.lk' },
    { id: 'admin-1', role: 'admin', full_name: 'Super Admin' }
  );

  const AdminPage = loadAdminOverviewPage(env.mockDb, env.revalidatedPaths);
  const pageVNode = await AdminPage();
  const form = firstFormWithAction(pageVNode);
  assert.ok(form, 'Page renders shop action forms');

  // Caller is authenticated but is a seller, NOT an admin
  env.signIn(
    { id: 'seller-1', email: 'seller1@kadeo.lk' },
    { id: 'seller-1', role: 'seller', full_name: 'Merchant One' }
  );

  await assert.rejects(
    async () => {
      await form.props.action();
    },
    /Forbidden: Admin role required/i,
    'Non-admin caller must be rejected with Forbidden'
  );

  // Assert DB untouched
  assert.equal(env.shopsDb[0].status, 'active', 'Shop status must remain unchanged when non-admin calls action');
  assert.equal(env.revalidatedPaths.length, 0, 'No revalidation on forbidden invocation');
});

test('7. toggleShopStatusAction toggles status and revalidates /admin when invoked by admin', async () => {
  const env = createMockSupabase();
  env.signIn(
    { id: 'admin-1', email: 'admin@kadeo.lk' },
    { id: 'admin-1', role: 'admin', full_name: 'Super Admin' }
  );

  const AdminPage = loadAdminOverviewPage(env.mockDb, env.revalidatedPaths);
  const pageVNode = await AdminPage();
  const form = firstFormWithAction(pageVNode);
  assert.ok(form, 'Page renders shop action forms');

  // Toggle active -> suspended
  assert.equal(env.shopsDb[0].status, 'active');
  await form.props.action();

  assert.equal(env.shopsDb[0].status, 'suspended', 'Admin successfully toggles shop to suspended');
  assert.ok(env.shopsDb[0].updated_at, 'updated_at timestamp is recorded');
  assert.ok(env.revalidatedPaths.includes('/admin'), 'Revalidates /admin path');

  // Re-render and toggle back suspended -> active
  const updatedPageVNode = await AdminPage();
  const updatedForm = firstFormWithAction(updatedPageVNode);
  await updatedForm.props.action();

  assert.equal(env.shopsDb[0].status, 'active', 'Admin successfully toggles shop back to active');
});
