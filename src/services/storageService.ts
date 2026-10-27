import { Shop, Product, Category, Order, User, Customer, SubscriptionPlan, OrderStatus } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SHOPS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  SUBSCRIPTION_PLANS,
} from '../data/initialData';

const STORAGE_KEYS = {
  SHOPS: 'kadeo_shops_v3',
  PRODUCTS: 'kadeo_products_v3',
  CATEGORIES: 'kadeo_categories_v3',
  ORDERS: 'kadeo_orders_v3',
  USERS: 'kadeo_users_v3',
  CUSTOMER_NOTES: 'kadeo_customer_notes_v3',
  CURRENT_USER_ID: 'kadeo_current_user_v3',
};

// In-memory fallback cache if window.localStorage is blocked, corrupted, or exceeds quota
const memoryStorageCache: Record<string, string> = {};

// Safe localStorage access with schema & array safety
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    let raw: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      raw = localStorage.getItem(key);
    }
    if (!raw && memoryStorageCache[key]) {
      raw = memoryStorageCache[key];
    }
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    // Guard against corrupted non-array values when an array is expected
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Corrupted storage array for ${key}, falling back to default`);
      return defaultValue;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`Failed to read from localStorage: ${key}`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const stringified = JSON.stringify(value);
    memoryStorageCache[key] = stringified;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, stringified);
    }
  } catch (err) {
    console.warn(`Failed to write to localStorage: ${key}. Using in-memory fallback.`, err);
  }
}

export const StorageService = {
  // Robust Sri Lankan WhatsApp number sanitization (removes +, spaces, leading 0 -> 94)
  formatWhatsAppNumber(phone?: string): string {
    if (!phone) return '94771234567';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '94' + cleaned.slice(1);
    } else if (cleaned.length === 9) {
      cleaned = '94' + cleaned;
    }
    return cleaned || '94771234567';
  },
  // Format currency consistently
  formatLKR(amount: number): string {
    return `Rs. ${Number(amount || 0).toLocaleString('en-LK')}`;
  },

  // Unique human-friendly order code (e.g. KAD-7X29P) with collision resistance
  generateOrderCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const existingOrders = this.getOrders();
    const existingCodes = new Set(existingOrders.map(o => o.orderCode.toUpperCase()));

    let attempts = 0;
    while (attempts < 500) {
      let code = 'KAD-';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!existingCodes.has(code)) {
        return code;
      }
      attempts++;
    }
    return `KAD-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  },

  // SHOPS
  getShops(): Shop[] {
    return loadFromStorage<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  },

  getShopById(id: string): Shop | undefined {
    return this.getShops().find(s => s.id === id);
  },

  getShopBySlug(slug: string): Shop | undefined {
    const shops = this.getShops();
    const found = shops.find(s => s.slug.toLowerCase() === slug.toLowerCase());
    if (found) return found;

    // Check seed shops in case localStorage was previously populated
    const seed = INITIAL_SHOPS.find(s => s.slug.toLowerCase() === slug.toLowerCase());
    if (seed) {
      shops.push(seed);
      saveToStorage(STORAGE_KEYS.SHOPS, shops);
      return seed;
    }

    if (slug.toLowerCase() === 'kavee-3') {
      const kaveeShop: Shop = {
        ...INITIAL_SHOPS[0],
        id: 'shop-kavee-3',
        name: 'Kadeo',
        slug: 'kavee-3',
        description: 'Discover amazing products from local sellers. Support small businesses. Shop with confidence.',
      };
      shops.push(kaveeShop);
      saveToStorage(STORAGE_KEYS.SHOPS, shops);
      return kaveeShop;
    }

    if (slug.toLowerCase() === 'kavee') {
      const kaveeShop: Shop = {
        ...INITIAL_SHOPS[0],
        id: 'shop-kavee',
        name: 'Kavee Boutique',
        slug: 'kavee',
      };
      shops.push(kaveeShop);
      saveToStorage(STORAGE_KEYS.SHOPS, shops);
      return kaveeShop;
    }
    return undefined;
  },

  updateShop(id: string, patch: Partial<Shop>): Shop {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Shop not found');
    const updated = { ...shops[index], ...patch };
    shops[index] = updated;
    saveToStorage(STORAGE_KEYS.SHOPS, shops);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('kadeo_shop_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    // Asynchronously push to MongoDB API
    try {
      fetch(`/api/shops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }).catch(() => {});
    } catch {}

    return updated;
  },

  createShop(shopData: Omit<Shop, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Shop {
    const shops = this.getShops();
    const newShop: Shop = {
      ...shopData,
      id: shopData.id || `shop-${Date.now()}`,
      createdAt: shopData.createdAt || new Date().toISOString(),
    };
    shops.push(newShop);
    saveToStorage(STORAGE_KEYS.SHOPS, shops);

    // Asynchronously push to MongoDB API
    try {
      fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShop),
      }).catch(() => {});
    } catch {}

    return newShop;
  },

  // PRODUCTS
  getProducts(): Product[] {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  },

  getProductsByShop(shopId: string): Product[] {
    const products = this.getProducts();
    const shopProds = products.filter(p => p.shopId === shopId);
    if (shopProds.length > 0) return shopProds;

    const seedProds = INITIAL_PRODUCTS.filter(p => p.shopId === shopId);
    if (seedProds.length > 0) {
      products.push(...seedProds);
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
      return seedProds;
    }
    if (shopId === 'shop-kavee' || shopId === 'shop-kavee-3') {
      return products.slice(0, 8);
    }
    return [];
  },

  getProductBySlug(shopSlug: string, productSlug: string): { product?: Product; shop?: Shop } {
    const shop = this.getShopBySlug(shopSlug);
    if (!shop) return {};
    const product = this.getProducts().find(
      p => p.shopId === shop.id && p.slug.toLowerCase() === productSlug.toLowerCase()
    );
    return { product, shop };
  },

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Asynchronously push to MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newProduct),
      }).catch(() => {});
    } catch {}

    return newProduct;
  },

  updateProduct(id: string, patch: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const updated = { ...products[index], ...patch, updatedAt: new Date().toISOString() };
    products[index] = updated;
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Asynchronously push to MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(patch),
      }).catch(() => {});
    } catch {}

    return updated;
  },

  deleteProduct(id: string): boolean {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Asynchronously push to MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    } catch {}

    return true;
  },

  // CATEGORIES
  getCategories(): Category[] {
    return loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  addCategory(categoryData: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    categories.push(newCat);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    // Asynchronously push creation to backend MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newCat),
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kadeo_categories_updated', { detail: { added: newCat } }));
      window.dispatchEvent(new Event('storage'));
    }

    return newCat;
  },

  updateCategory(id: string, patch: Partial<Category>): Category {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    const updated = { ...categories[index], ...patch };
    categories[index] = updated;
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    // Asynchronously push update to backend MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(patch),
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kadeo_categories_updated', { detail: { updated } }));
      window.dispatchEvent(new Event('storage'));
    }

    return updated;
  },

  deleteCategory(id: string): boolean {
    let categories = this.getCategories();
    categories = categories.filter(c => c.id !== id && c.slug !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    // Clean up or dissociate products from the deleted category
    const products = this.getProducts();
    let prodsChanged = false;
    products.forEach(p => {
      if (p.categoryId === id) {
        p.categoryId = '';
        prodsChanged = true;
      }
    });
    if (prodsChanged) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    // Asynchronously push deletion to backend MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kadeo_categories_updated', { detail: { deletedId: id } }));
      window.dispatchEvent(new Event('storage'));
    }

    return true;
  },

  // ORDERS
  getOrders(): Order[] {
    return loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  getOrdersByShop(shopId: string): Order[] {
    const orders = this.getOrders();
    const shopOrders = orders.filter(o => o.shopId === shopId);
    if (shopOrders.length > 0) return shopOrders;

    const seedOrders = INITIAL_ORDERS.filter(o => o.shopId === shopId);
    if (seedOrders.length > 0) {
      orders.push(...seedOrders);
      saveToStorage(STORAGE_KEYS.ORDERS, orders);
      return seedOrders;
    }
    return [];
  },

  getOrderByCode(orderCode: string): Order | undefined {
    return this.getOrders().find(o => o.orderCode.toUpperCase() === orderCode.toUpperCase());
  },

  // Atomic batch order creation: pre-validates ALL items across all boutiques before any modification
  createOrdersBatch(ordersData: Array<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Order[] {
    const products = this.getProducts();

    // 1. Calculate cumulative required quantity per product across all orders in batch
    const requiredQuantities: Record<string, number> = {};
    for (const orderData of ordersData) {
      for (const item of orderData.items) {
        requiredQuantities[item.productId] = (requiredQuantities[item.productId] || 0) + item.quantity;
      }
    }

    // 2. Strict atomic pre-validation: verify all products exist and have sufficient stock
    for (const [prodId, totalRequested] of Object.entries(requiredQuantities)) {
      const prod = products.find(p => p.id === prodId);
      if (!prod) {
        throw new Error('One or more selected products are no longer available in the catalog.');
      }
      if (prod.stockQuantity < totalRequested) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Total requested: ${totalRequested}, Available in boutique: ${prod.stockQuantity}.`
        );
      }
    }

    // 3. Decrement inventory in memory
    for (const [prodId, totalRequested] of Object.entries(requiredQuantities)) {
      const pIndex = products.findIndex(p => p.id === prodId);
      if (pIndex !== -1) {
        products[pIndex].stockQuantity -= totalRequested;
      }
    }

    // 4. Generate collision-resistant codes and create order instances
    const orders = this.getOrders();
    const existingCodes = new Set(orders.map(o => o.orderCode.toUpperCase()));
    const createdOrders: Order[] = [];

    for (const orderData of ordersData) {
      let finalCode = orderData.orderCode?.trim() || this.generateOrderCode();
      if (existingCodes.has(finalCode.toUpperCase())) {
        finalCode = this.generateOrderCode();
      }
      existingCodes.add(finalCode.toUpperCase());

      const newOrder: Order = {
        ...orderData,
        orderCode: finalCode,
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      createdOrders.push(newOrder);
      orders.unshift(newOrder);
    }

    // 5. Atomic persistence: single write for products and orders
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kadeo_orders_updated', { detail: createdOrders }));
    }

    // Asynchronously push to MongoDB API
    try {
      createdOrders.forEach(ord => {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ord),
        }).catch(() => {});
      });
    } catch {}

    return createdOrders;
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const created = this.createOrdersBatch([orderData]);
    return created[0];
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    const updated = { ...orders[index], status, updatedAt: new Date().toISOString() };
    orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kadeo_orders_updated', { detail: updated }));
    }

    // Asynchronously push to MongoDB API
    try {
      fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch {}

    return updated;
  },

  deleteOrder(orderId: string): boolean {
    let orders = this.getOrders();
    orders = orders.filter(o => o.id !== orderId && o.orderCode !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kadeo_orders_updated', { detail: { deletedId: orderId } }));
    }

    // Asynchronously push to MongoDB API
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kadeo_auth_token_v3') : null;
      fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    } catch {}

    return true;
  },

  uploadOrderPaymentSlip(orderCodeOrId: string, paymentSlipUrl: string): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex(
      o => o.orderCode.toUpperCase() === orderCodeOrId.toUpperCase() || o.id === orderCodeOrId
    );
    if (index === -1) return undefined;

    const updated: Order = {
      ...orders[index],
      paymentSlipUrl,
      paymentSlipUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kadeo_orders_updated', { detail: updated }));
    }

    // Asynchronously push to MongoDB API
    try {
      fetch(`/api/orders/${orderCodeOrId}/slip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentSlipUrl }),
      }).catch(() => {});
    } catch {}

    return updated;
  },

  removeOrderPaymentSlip(orderCodeOrId: string): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex(
      o => o.orderCode.toUpperCase() === orderCodeOrId.toUpperCase() || o.id === orderCodeOrId
    );
    if (index === -1) return undefined;

    const updated: Order = {
      ...orders[index],
      paymentSlipUrl: undefined,
      paymentSlipUploadedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('kadeo_orders_updated', { detail: updated }));
    }

    // Asynchronously push to MongoDB API
    try {
      fetch(`/api/orders/${orderCodeOrId}/slip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentSlipUrl: '' }),
      }).catch(() => {});
    } catch {}

    return updated;
  },

  // CUSTOMERS (Derived from actual orders for accurate multi-vendor metrics)
  getCustomers(shopId: string): Customer[] {
    const orders = this.getOrdersByShop(shopId);
    const customerMap = new Map<string, Customer>();
    const savedNotes = loadFromStorage<Record<string, string>>(STORAGE_KEYS.CUSTOMER_NOTES, {});

    for (const order of orders) {
      const phone = order.customerPhone.trim();
      const existing = customerMap.get(phone);
      if (!existing) {
        customerMap.set(phone, {
          id: `cust-${encodeURIComponent(phone)}`,
          shopId,
          name: order.customerName,
          phone,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
          notes: savedNotes[`${shopId}_${phone}`] || '',
          createdAt: order.createdAt,
        });
      } else {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
          existing.name = order.customerName; // update name to most recent
        }
      }
    }

    return Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  },

  saveCustomerNote(shopId: string, phone: string, note: string): void {
    const savedNotes = loadFromStorage<Record<string, string>>(STORAGE_KEYS.CUSTOMER_NOTES, {});
    savedNotes[`${shopId}_${phone}`] = note;
    saveToStorage(STORAGE_KEYS.CUSTOMER_NOTES, savedNotes);
  },

  // USERS & AUTH
  getUsers(): User[] {
    const rawUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return rawUsers.filter(u => u.id !== 'user-1' && u.id !== 'user-2' && u.id !== 'user-3');
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  addUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
    return user;
  },

  updateUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
    return user;
  },

  updateUserStatus(id: string, status: 'active' | 'suspended'): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index].status = status;
    saveToStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  getCurrentUserId(): string {
    return loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'guest');
  },

  setCurrentUserId(id: string): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  // SUBSCRIPTION
  getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  },

  updateShopPlan(shopId: string, planId: 'free' | 'starter' | 'pro'): Shop {
    return this.updateShop(shopId, { subscriptionPlanId: planId });
  },

  // CLOUD STORAGE & ASSET METRICS
  getShopStorageUsage(shopId: string) {
    const shop = this.getShopById(shopId);
    const products = this.getProductsByShop(shopId);
    const orders = this.getOrdersByShop(shopId);

    const planId = shop?.subscriptionPlanId || 'free';
    const quotaMap: Record<string, number> = {
      free: 1024 * 1024 * 1024, // 1 GB
      starter: 5 * 1024 * 1024 * 1024, // 5 GB
      pro: 25 * 1024 * 1024 * 1024, // 25 GB
    };
    const maxBytes = quotaMap[planId] || quotaMap.free;

    const files: Array<{
      id: string;
      name: string;
      url: string;
      sizeBytes: number;
      sizeFormatted: string;
      type: 'image' | 'video' | 'document';
      category: 'Product Media' | 'Boutique Asset' | 'System Report';
      uploadedAt: string;
      dimensions?: string;
    }> = [];

    // 1. Boutique branding assets
    let boutiqueAssetsBytes = 0;
    if (shop?.logo) {
      const logoSize = 680 * 1024; // ~680 KB
      boutiqueAssetsBytes += logoSize;
      files.push({
        id: `file-logo-${shop.id}`,
        name: `${shop.slug}-official-logo.png`,
        url: shop.logo,
        sizeBytes: logoSize,
        sizeFormatted: '680 KB',
        type: 'image',
        category: 'Boutique Asset',
        uploadedAt: shop.createdAt || new Date().toISOString(),
        dimensions: '800 × 800',
      });
    }

    if (shop?.coverImage) {
      const coverSize = 3400 * 1024; // ~3.4 MB
      boutiqueAssetsBytes += coverSize;
      files.push({
        id: `file-cover-${shop.id}`,
        name: `${shop.slug}-storefront-hero.jpg`,
        url: shop.coverImage,
        sizeBytes: coverSize,
        sizeFormatted: '3.4 MB',
        type: 'image',
        category: 'Boutique Asset',
        uploadedAt: shop.createdAt || new Date().toISOString(),
        dimensions: '1920 × 1080',
      });
    }

    if (shop?.coverVideo) {
      const videoSize = 14200 * 1024; // ~14.2 MB
      boutiqueAssetsBytes += videoSize;
      files.push({
        id: `file-video-${shop.id}`,
        name: `${shop.slug}-hero-reel.mp4`,
        url: shop.coverVideo,
        sizeBytes: videoSize,
        sizeFormatted: '14.2 MB',
        type: 'video',
        category: 'Boutique Asset',
        uploadedAt: shop.createdAt || new Date().toISOString(),
        dimensions: '1080p HD',
      });
    }

    // 2. Product Media assets
    let productImagesBytes = 0;
    let productImagesCount = 0;
    products.forEach((prod, pIdx) => {
      const images = prod.images && prod.images.length > 0 ? prod.images : [];
      images.forEach((imgUrl, iIdx) => {
        productImagesCount++;
        const imgSize = Math.floor(1350000 + ((pIdx * 7 + iIdx * 13) % 1100000));
        productImagesBytes += imgSize;
        files.push({
          id: `file-prod-${prod.id}-${iIdx}`,
          name: `${prod.slug}-${iIdx + 1}.webp`,
          url: imgUrl,
          sizeBytes: imgSize,
          sizeFormatted: `${(imgSize / (1024 * 1024)).toFixed(1)} MB`,
          type: 'image',
          category: 'Product Media',
          uploadedAt: prod.createdAt || new Date().toISOString(),
          dimensions: '1200 × 1200',
        });
      });
    });

    // 3. Invoices and Reports
    const documentFilesCount = Math.max(orders.length, 6);
    const documentsBytes = documentFilesCount * 85 * 1024;
    for (let i = 0; i < Math.min(documentFilesCount, 8); i++) {
      const ord = orders[i];
      const docSize = 85 * 1024;
      files.push({
        id: `file-doc-${i}`,
        name: ord ? `Invoice-${ord.orderCode}.pdf` : `Monthly-Sales-Report-2026-0${i + 1}.pdf`,
        url: '#',
        sizeBytes: docSize,
        sizeFormatted: '85 KB',
        type: 'document',
        category: 'System Report',
        uploadedAt: ord?.createdAt || new Date().toISOString(),
      });
    }

    // 4. Database records & cache metadata
    const databaseBytes = (products.length * 15 + orders.length * 25 + 120) * 1024;

    const totalBytes = boutiqueAssetsBytes + productImagesBytes + documentsBytes + databaseBytes;
    const percentage = Math.min(100, Math.round((totalBytes / maxBytes) * 100));

    const formatBytes = (bytes: number): string => {
      if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return {
      totalBytes,
      maxBytes,
      usedFormatted: formatBytes(totalBytes),
      maxFormatted: formatBytes(maxBytes),
      percentage,
      planName: planId.toUpperCase(),
      breakdown: {
        productImagesBytes,
        productImagesCount,
        boutiqueAssetsBytes,
        documentsBytes,
        databaseBytes,
        productImagesFormatted: formatBytes(productImagesBytes),
        boutiqueAssetsFormatted: formatBytes(boutiqueAssetsBytes),
        documentsFormatted: formatBytes(documentsBytes),
        databaseFormatted: formatBytes(databaseBytes),
      },
      files,
    };
  },

  // RESET TO ORIGINAL SEED
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.SHOPS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_NOTES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.location.reload();
  },

  // MONGODB ATLAS SYNCHRONIZATION
  async syncWithDatabase(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return false;
      const health = await res.json();
      if (!health?.database?.connected) {
        console.info('ℹ️ [Kadeo Sync] Running in local storage mode. MongoDB Atlas not yet configured in .env.');
        return false;
      }

      console.log('🔄 [Kadeo Sync] Syncing with MongoDB Atlas cluster...');
      const [remoteShops, remoteProducts, remoteOrders, remoteCategories] = await Promise.all([
        fetch('/api/shops').then(r => (r.ok ? r.json() : null)),
        fetch('/api/products').then(r => (r.ok ? r.json() : null)),
        fetch('/api/orders').then(r => (r.ok ? r.json() : null)),
        fetch('/api/categories').then(r => (r.ok ? r.json() : null)),
      ]);

      if (remoteShops && remoteShops.length > 0) {
        const localShops = this.getShops();
        const map = new Map<string, Shop>();
        localShops.forEach(s => map.set(s.id, s));
        remoteShops.forEach((s: Shop) => map.set(s.id, s));
        const merged = Array.from(map.values());
        saveToStorage(STORAGE_KEYS.SHOPS, merged);

        // Upload any local shops that don't exist in remoteShops to MongoDB
        const remoteIds = new Set(remoteShops.map((s: Shop) => s.id));
        for (const local of localShops) {
          if (!remoteIds.has(local.id)) {
            fetch('/api/shops', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(local),
            }).catch(() => {});
          }
        }
      }
      if (remoteProducts && remoteProducts.length > 0) {
        saveToStorage(STORAGE_KEYS.PRODUCTS, remoteProducts);
      }
      if (remoteOrders && remoteOrders.length > 0) {
        saveToStorage(STORAGE_KEYS.ORDERS, remoteOrders);
      }
      if (Array.isArray(remoteCategories) && remoteCategories.length > 0) {
        saveToStorage(STORAGE_KEYS.CATEGORIES, remoteCategories);
      }
      console.log('✅ [Kadeo Sync] Successfully synchronized with MongoDB Atlas.');
      return true;
    } catch (e: any) {
      console.warn('⚠️ [Kadeo Sync] Sync attempted but backend was unreachable:', e.message);
      return false;
    }
  },
};
