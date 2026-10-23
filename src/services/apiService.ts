import { Shop, Product, Category, Order, User } from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'kadeo_auth_token_v3';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const ApiService = {
  // Token Management
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Health and MongoDB Atlas connection status
  async checkHealth(): Promise<{
    status: string;
    database: {
      type: string;
      connected: boolean;
      readyState: number;
      name?: string | null;
      host?: string | null;
    };
  }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return {
        status: 'offline',
        database: {
          type: 'MongoDB Atlas',
          connected: false,
          readyState: 0,
          name: null,
          host: null,
        },
      };
    }
  },

  // SHOPS
  async getShops(): Promise<Shop[]> {
    const res = await fetch(`${API_BASE}/shops`);
    if (!res.ok) throw new Error('Failed to fetch shops');
    return await res.json();
  },

  async getShopByIdOrSlug(identifier: string): Promise<Shop> {
    const res = await fetch(`${API_BASE}/shops/${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('Shop not found');
    return await res.json();
  },

  async createShop(shop: Partial<Shop>): Promise<Shop> {
    const res = await fetch(`${API_BASE}/shops`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shop),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create shop');
    }
    return await res.json();
  },

  async updateShop(identifier: string, updates: Partial<Shop>): Promise<Shop> {
    const res = await fetch(`${API_BASE}/shops/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update shop');
    }
    return await res.json();
  },

  // PRODUCTS
  async getProducts(filter?: { shopId?: string; categoryId?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (filter?.shopId) query.set('shopId', filter.shopId);
    if (filter?.categoryId) query.set('categoryId', filter.categoryId);
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return await res.json();
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create product');
    }
    return await res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product');
    }
    return await res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete product');
    }
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cat),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create category');
    }
    return await res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }
    return await res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete category');
    }
    return true;
  },

  // ORDERS
  async getOrders(filter?: { shopId?: string; phone?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filter?.shopId) query.set('shopId', filter.shopId);
    if (filter?.phone) query.set('phone', filter.phone);
    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch orders');
    }
    return await res.json();
  },

  async getOrderByCode(code: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error('Order not found with this code');
    return await res.json();
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to place order');
    }
    return await res.json();
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update order status');
    }
    return await res.json();
  },

  // AUTHENTICATION
  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify session');
    }
    return await res.json();
  },

  async loginWithEmail(email: string, password?: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  },

  async loginWithGoogleToken(idToken: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Google login failed');
    }
    const data = await res.json();
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  },

  async registerUser(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role?: 'seller' | 'admin' | 'customer';
    shopId?: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const result = await res.json();
    if (result.token) {
      this.setAuthToken(result.token);
    }
    return result;
  },
};
