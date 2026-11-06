import { createSignedSession, verifySessionToken, type SessionPayload } from "./session.ts";
export { createSignedSession, verifySessionToken, type SessionPayload } from "./session.ts";

import { normalizePhoneNumber, buildWhatsAppUrl } from "../phone.ts";
import fs from "fs";
import path from "path";

// Local JSON Database path
const DB_FILE = path.join(process.cwd(), "kadeo-local-db.json");

export interface LocalDB {
  users: Array<{
    id: string;
    email: string;
    password_hash: string;
    full_name?: string;
  }>;
  profiles: Array<{
    id: string;
    full_name?: string;
    email: string;
    role: "seller" | "admin";
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }>;
  shops: Array<{
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string | null;
    banner_url?: string | null;
    whatsapp_number: string;
    contact_email?: string;
    address?: string;
    theme_id: string;
    storefront_content?: Record<string, string>;
    status?: "active" | "suspended" | "pending";
    created_at: string;
    updated_at: string;
  }>;
  shop_settings: Array<{
    id: string;
    shop_id: string;
    primary_color?: string;
    secondary_color?: string;
    currency?: string;
    delivery_information?: string;
    store_visibility?: boolean;
    created_at: string;
    updated_at: string;
  }>;
  categories: Array<{
    id: string;
    shop_id: string;
    name: string;
    slug: string;
    description?: string;
    sort_order?: number;
    created_at: string;
    updated_at: string;
  }>;
  products: Array<{
    id: string;
    shop_id: string;
    category_id?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    compare_at_price?: number | null;
    stock_quantity: number;
    status: "active" | "draft" | "out_of_stock";
    sku?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  product_images: Array<{
    id: string;
    product_id: string;
    shop_id?: string;
    storage_path: string;
    sort_order?: number;
    display_order?: number;
    alt_text?: string;
    created_at?: string;
  }>;
  orders: Array<{
    id: string;
    shop_id: string;
    customer_id?: string;
    order_code: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    total_amount?: number;
    currency?: string;
    status: "pending" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_email?: string;
    customer_name_snapshot?: string;
    customer_phone_snapshot?: string;
    delivery_address_snapshot?: string;
    customer_email_snapshot?: string;
    order_note?: string | null;
    order_notes?: string | null;
    order_notes_snapshot?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  order_items: Array<{
    id: string;
    order_id: string;
    shop_id?: string;
    product_id: string;
    product_name?: string;
    product_name_snapshot?: string;
    unit_price: number;
    quantity: number;
    line_total: number;
    created_at?: string;
  }>;
  customers: Array<{
    id: string;
    shop_id: string;
    full_name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  subscriptions?: Array<{
    id: string;
    shop_id: string;
    plan_id: string;
    status: string;
    billing_period: string;
    started_at?: string;
    expires_at?: string | null;
    created_at?: string;
    updated_at?: string;
  }>;
  order_payments?: Array<{
    id: string;
    order_id: string;
    shop_id: string;
    amount: number;
    payment_method: "cash" | "bank_transfer" | "other_manual";
    status: "recorded" | "voided";
    recorded_by: string;
    notes?: string | null;
    voided_at?: string | null;
    voided_by?: string | null;
    void_reason?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  admin_activity_logs?: Array<{
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id?: string;
    metadata?: any;
    created_at?: string;
  }>;
}

const INITIAL_DB: LocalDB = {
  users: [
    { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      email: "kasun@ceylonlinen.lk",
      password_hash: "123456",
      full_name: "Kasun Perera",
    },
    {
      id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      email: "admin@kadeo.lk",
      password_hash: "admin123",
      full_name: "Super Admin",
    },
  ],
  profiles: [
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      full_name: "Kasun Perera",
      email: "kasun@ceylonlinen.lk",
      role: "seller",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      full_name: "Super Admin",
      email: "admin@kadeo.lk",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  shops: [
    {
      id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      owner_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "Ceylon Linen",
      slug: "ceylon-linen",
      description: "Premium pure linen clothing and artisanal lifestyle essentials crafted in Sri Lanka.",
      logo_url: null,
      banner_url: null,
      whatsapp_number: "94771234567",
      contact_email: "hello@ceylonlinen.lk",
      address: "Colombo 03, Sri Lanka",
      theme_id: "minimal",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  shop_settings: [
    {
      id: "s0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      primary_color: "#18181b",
      secondary_color: "#71717a",
      currency: "LKR",
      delivery_information: "Island-wide cash on delivery (COD) available.",
      store_visibility: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  categories: [
    {
      id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      name: "Men's Linen",
      slug: "mens-linen",
      description: "Breathable pure linen shirts and casual trousers.",
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      name: "Women's Collection",
      slug: "womens-collection",
      description: "Artisanal dresses, tops and relaxed fits.",
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  products: [
    {
      id: "p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      category_id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      name: "Classic Resort White Linen Shirt",
      slug: "classic-resort-white-linen-shirt",
      description: "Tailored from 100% pure organic European flax linen. Lightweight, breathable, and designed for Sri Lanka's tropical climate.",
      price: 5800,
      compare_at_price: 6800,
      stock_quantity: 24,
      status: "active",
      sku: "LIN-WHT-01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      category_id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      name: "Sage Green Relaxed Linen Trouser",
      slug: "sage-green-relaxed-linen-trouser",
      description: "Comfortable elasticated waistband with internal drawstring. Styled with side pockets and a tapered casual hem.",
      price: 6400,
      compare_at_price: 7200,
      stock_quantity: 18,
      status: "active",
      sku: "LIN-TRS-02",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
      shop_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      category_id: "d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      name: "Oatmeal Linen Tiered Maxi Dress",
      slug: "oatmeal-linen-tiered-maxi-dress",
      description: "Effortless silhouette crafted from medium-weight unbleached linen with gentle tiered volume and functional pockets.",
      price: 8900,
      compare_at_price: null,
      stock_quantity: 12,
      status: "active",
      sku: "LIN-DRS-03",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  product_images: [
    {
      id: "img1",
      product_id: "p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      storage_path: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      display_order: 1,
    },
    {
      id: "img2",
      product_id: "p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      storage_path: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
      display_order: 1,
    },
    {
      id: "img3",
      product_id: "p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
      storage_path: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      display_order: 1,
    },
  ],
  orders: [],
  order_items: [],
  customers: [],
  subscriptions: [],
  order_payments: [],
  admin_activity_logs: [],
};

function readDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(INITIAL_DB);
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(content);
    if (!parsed.subscriptions) parsed.subscriptions = [];
    if (!parsed.admin_activity_logs) parsed.admin_activity_logs = [];
    if (!parsed.order_payments) parsed.order_payments = [];
    return parsed;
  } catch {
    return INITIAL_DB;
  }
}

function writeDB(data: LocalDB) {
  try {
    const tmp = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    try {
      fs.renameSync(tmp, DB_FILE);
    } catch {
      // Windows filesystem atomic rename fallback
      fs.copyFileSync(tmp, DB_FILE);
      try { fs.unlinkSync(tmp); } catch {}
    }
  } catch (err) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (innerErr) {
      console.error("Failed to write local database:", innerErr);
      throw innerErr;
    }
  }
}

export class LocalQueryBuilder {
  private table: keyof LocalDB;
  private filters: Array<{ col: string; val: any }> = [];
  private orFilters: string[] = [];
  private ilikeFilters: Array<{ col: string; pattern: string }> = [];
  private orderCol?: string;
  private ascending = true;
  private limitCount?: number;
  private rangeFrom?: number;
  private rangeTo?: number;
  private isSingle = false;
  private isCount = false;
  private isHead = false;
  private pendingUpdate?: any;
  private isDelete = false;

  constructor(table: keyof LocalDB) {
    this.table = table;
  }

  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    if (options?.count === "exact") {
      this.isCount = true;
    }
    if (options?.head) {
      this.isHead = true;
    }
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  ilike(col: string, pattern: string) {
    this.ilikeFilters.push({ col, pattern });
    return this;
  }

  or(filterStr: string) {
    this.orFilters.push(filterStr);
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.ascending = options?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  private filterRows(rows: any[]) {
    return rows.filter((r) => {
      for (const f of this.filters) {
        let val = r[f.col];
        if (f.col === "status" && (val === undefined || val === null)) {
          val = "active";
        }
        if (val !== f.val) return false;
      }

      for (const il of this.ilikeFilters) {
        const val = r[il.col]?.toString().toLowerCase() || "";
        const search = il.pattern.replace(/^%|%$/g, "").toLowerCase();
        if (!val.includes(search)) return false;
      }

      for (const orStr of this.orFilters) {
        const parts = orStr.split(",").map((p) => p.trim());
        const anyMatch = parts.some((part) => {
          const segments = part.split(".");
          if (segments.length >= 3) {
            const col = segments[0];
            const op = segments[1];
            const val = segments.slice(2).join(".");
            const rowVal = r[col]?.toString().toLowerCase() || "";
            if (op === "ilike" || op === "like") {
              const cleanVal = val.replace(/^%|%$/g, "").toLowerCase();
              return rowVal.includes(cleanVal);
            }
            if (op === "eq") {
              return rowVal === val.toLowerCase();
            }
          }
          return false;
        });
        if (!anyMatch) return false;
      }

      return true;
    });
  }

  private joinRelations(table: string, rows: any[], db: LocalDB) {
    if (table === "products") {
      return rows.map((p) => ({
        ...p,
        category: db.categories.find((c) => c.id === p.category_id) || null,
        images: (db.product_images || [])
          .filter((img) => img.product_id === p.id)
          .sort((a, b) => (a.sort_order ?? a.display_order ?? 0) - (b.sort_order ?? b.display_order ?? 0)),
      }));
    }
    if (table === "categories") {
      return rows.map((c) => ({
        ...c,
        products: [{ count: db.products.filter((p) => p.category_id === c.id).length }],
      }));
    }
    if (table === "shops") {
      return rows.map((s) => ({
        ...s,
        owner: db.profiles.find((pr) => pr.id === s.owner_id) || null,
        settings: db.shop_settings.filter((st) => st.shop_id === s.id),
      }));
    }
    if (table === "orders") {
      return rows.map((o) => ({
        ...o,
        items: db.order_items.filter((item) => item.order_id === o.id),
        order_items: db.order_items.filter((item) => item.order_id === o.id),
        shop: db.shops.find((s) => s.id === o.shop_id) || null,
      }));
    }
    if (table === "customers") {
      return rows.map((c) => ({
        ...c,
        orders: [{ count: db.orders.filter((o) => o.customer_id === c.id).length }],
      }));
    }
    return rows;
  }

  // Execute queries when awaited or chained with .then()
  then(resolve: any, reject?: any) {
    try {
      const db = readDB();

      // If this query is an UPDATE operation:
      if (this.pendingUpdate !== undefined) {
        if (!db[this.table]) {
          (db as any)[this.table] = [];
        }
        const table = (db[this.table] as any[]) || [];
        const updatedRows: any[] = [];
        for (let i = 0; i < table.length; i++) {
          let match = true;
          for (const f of this.filters) {
            if (table[i][f.col] !== f.val) {
              match = false;
              break;
            }
          }
          if (match) {
            table[i] = { ...table[i], ...this.pendingUpdate, updated_at: new Date().toISOString() };
            updatedRows.push(table[i]);
          }
        }
        writeDB(db);
        return resolve({ data: updatedRows, error: null });
      }

      // If this query is a DELETE operation:
      if (this.isDelete) {
        if (!db[this.table]) {
          (db as any)[this.table] = [];
        }
        let table = (db[this.table] as any[]) || [];
        db[this.table] = table.filter((row) => {
          if (this.filters.length === 0) return true;
          const matchesAll = this.filters.every((f) => row[f.col] === f.val);
          return !matchesAll;
        }) as any;
        writeDB(db);
        return resolve({ data: null, error: null });
      }

      // Default: SELECT operation
      const tableData = (db[this.table] || []) as any[];
      let filtered = this.filterRows(tableData);

      filtered = this.joinRelations(this.table, filtered, db);

      if (this.orderCol) {
        const col = this.orderCol;
        const asc = this.ascending;
        filtered.sort((a, b) => {
          const valA = a[col] ?? "";
          const valB = b[col] ?? "";
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }

      const totalCount = filtered.length;

      if (this.rangeFrom !== undefined && this.rangeTo !== undefined) {
        filtered = filtered.slice(this.rangeFrom, this.rangeTo + 1);
      } else if (this.limitCount !== undefined) {
        filtered = filtered.slice(0, this.limitCount);
      }

      if (this.isHead) {
        return resolve({ count: totalCount, data: null, error: null });
      }

      if (this.isSingle) {
        return resolve({
          data: filtered[0] || null,
          count: this.isCount ? totalCount : null,
          error: null,
        });
      }

      resolve({
        data: filtered,
        count: this.isCount ? totalCount : null,
        error: null,
      });
    } catch (err: any) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  insert(recordOrRecords: any) {
    const db = readDB();
    if (!db[this.table]) {
      (db as any)[this.table] = [];
    }
    const table = (db[this.table] as any[]);
    const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];

    if (this.table === "order_payments") {
      for (const r of records) {
        if (r.status === "recorded" && r.order_id) {
          const order = db.orders.find((o) => o.id === r.order_id);
          if (order) {
            const orderTotal = Number(order.total ?? (order as any).total_amount ?? 0);
            const currentPaid = (db.order_payments || [])
              .filter((p) => p.order_id === r.order_id && p.status === "recorded")
              .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            if (currentPaid + Number(r.amount || 0) > orderTotal) {
              const remaining = Math.max(0, orderTotal - currentPaid);
              const err = { message: "Payment amount exceeds remaining order balance of LKR " + remaining + "." };
              return {
                select: () => ({
                  single: async () => ({ data: null, error: err }),
                  then: (resolve: any) => resolve({ data: null, error: err }),
                }),
                single: async () => ({ data: null, error: err }),
                then: (resolve: any) => resolve({ data: null, error: err }),
              };
            }
          }
        }
      }
    }

    const inserted: any[] = [];
    for (const r of records) {
      const newRec = {
        id: r.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
        status: r.status || (['shops','products'].includes(this.table) ? 'active' : undefined),
      };
      table.push(newRec);
      inserted.push(newRec);
    }

    writeDB(db);

    return {
      select: () => ({
        single: async () => ({ data: inserted[0], error: null }),
        then: (resolve: any) => resolve({ data: inserted, error: null }),
      }),
      single: async () => ({ data: inserted[0], error: null }),
      then: (resolve: any) => resolve({ data: inserted, error: null }),
    };
  }

  async upsert(recordOrRecords: any, options?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    const db = readDB();
    if (!db[this.table]) {
      (db as any)[this.table] = [];
    }
    const table = (db[this.table] as any[]);
    const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];

    for (const record of records) {
      const idx = table.findIndex((r) => {
        if (options?.onConflict) {
          return r[options.onConflict] !== undefined && r[options.onConflict] === record[options.onConflict];
        }
        return (record.id && r.id === record.id) || (record.shop_id && r.shop_id === record.shop_id);
      });

      if (idx >= 0) {
        if (!options?.ignoreDuplicates) {
          table[idx] = { ...table[idx], ...record, updated_at: new Date().toISOString() };
        }
      } else {
        table.push({
          id: record.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...record,
        });
      }
    }

    writeDB(db);
    return { data: recordOrRecords, error: null };
  }

  // Supabase update: supabase.from('...').update({...}).eq('id', ...)
  update(updates: any) {
    this.pendingUpdate = updates;
    return this;
  }

  // Supabase delete: supabase.from('...').delete().eq('id', ...)
  delete() {
    this.isDelete = true;
    return this;
  }
}

export function createLocalClient(currentUser?: SessionPayload | null, setCookieFn?: (name: string, value: string) => void) {
  return {
    auth: {
            async getUser() {
        if (!currentUser || !currentUser.id || typeof currentUser.id !== "string") {
          return { data: { user: null } };
        }
        const db = readDB();
        // If users exist in the database, cross-verify identity to prevent forged identities
        if (Array.isArray(db.users) && db.users.length > 0) {
          const dbUser = db.users.find(
            (u) => u.id === currentUser.id && u.email.toLowerCase() === (currentUser.email || "").toLowerCase()
          );
          if (!dbUser) {
            return { data: { user: null }, error: { message: "Invalid or forged session identity." } };
          }
          if ((dbUser as any).last_sign_out_at && currentUser.iat) {
            if (currentUser.iat <= (dbUser as any).last_sign_out_at) {
              return { data: { user: null }, error: { message: "Session has been revoked." } };
            }
          }
          return { data: { user: { id: dbUser.id, email: dbUser.email } } };
        }
        return { data: { user: { id: currentUser.id, email: currentUser.email || "" } } };
      },

      async signUp({ email, password, options }: any) {
        const db = readDB();
        const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { data: { user: null }, error: { message: "An account with this email already exists." } };
        }

        const userId = crypto.randomUUID();
        const fullName = options?.data?.full_name || email.split("@")[0];

        const newUser = {
          id: userId,
          email,
          password_hash: password,
          full_name: fullName,
        };

        db.users.push(newUser);
        db.profiles.push({
          id: userId,
          full_name: fullName,
          email,
          role: "seller",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        writeDB(db);

        if (setCookieFn) {
          setCookieFn("kadeo_session", await createSignedSession({ id: userId, email, full_name: fullName }));
        }

        return { data: { user: { id: userId, email } }, error: null };
      },

      async signInWithPassword({ email, password }: any) {
        const db = readDB();
        const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!user || user.password_hash !== password) {
          return { data: { user: null }, error: { message: "Invalid email or password." } };
        }

        if (setCookieFn) {
          setCookieFn("kadeo_session", await createSignedSession({ id: user.id, email: user.email, full_name: user.full_name }));
        }

        return { data: { user: { id: user.id, email: user.email } }, error: null };
      },

      async signOut() {
        if (currentUser && currentUser.id) {
          const db = readDB();
          const user = db.users.find((u) => u.id === currentUser.id);
          if (user) {
            (user as any).last_sign_out_at = Date.now();
            writeDB(db);
          }
        }
        if (setCookieFn) {
          setCookieFn("kadeo_session", "");
        }
        return { error: null };
      },

      async updateUser({ password, data }: any) {
        const db = readDB();
        if (!currentUser) {
          return { data: { user: null }, error: { message: "Not authenticated" } };
        }
        const user = db.users.find((u) => u.id === currentUser.id);
        if (!user) {
          return { data: { user: null }, error: { message: "User not found" } };
        }
        if (password) {
          user.password_hash = password;
        }
        if (data?.full_name) {
          user.full_name = data.full_name;
        }
        writeDB(db);
        return { data: { user: { id: user.id, email: user.email } }, error: null };
      },

      async resetPasswordForEmail(_email: string) {
        // Truthful recovery: Local development environment does not have active SMTP / email transport infrastructure.
        // Never fabricate success or pretend an email was sent.
        return {
          data: null,
          error: {
            name: "AuthApiError",
            message: "Email delivery is not supported in the local mock environment. Direct password update is available at /reset-password for authenticated sessions.",
            status: 501,
          },
        };
      },

      async exchangeCodeForSession(_code: string) {
        return {
          data: null,
          error: {
            name: "AuthApiError",
            message: "Invalid or unsupported recovery code in local environment. Cannot authenticate arbitrary code.",
            status: 400,
          },
        };
      },
    },

    from(table: string) {
      return new LocalQueryBuilder(table as keyof LocalDB);
    },

    async rpc(func: string, params: any) {
      const db = readDB();

            if (func === "update_order_status") {
        const { p_order_id, p_new_status, p_shop_id } = params;

        // Authorization check: user must be authenticated
        if (!currentUser) {
          return { data: null, error: { message: "Authentication required." } };
        }

        // Ownership verification: caller must own the shop
        const shop = db.shops.find((s) => s.id === p_shop_id);
        if (!shop || shop.owner_id !== currentUser.id) {
          return {
            data: null,
            error: { message: "Permission denied: caller is not the owner of this shop." },
          };
        }

        const order = db.orders.find((o) => o.id === p_order_id && o.shop_id === p_shop_id);
        if (!order) {
          return { data: null, error: { message: "Order not found or permission denied." } };
        }

        const ALLOWED_TRANSITIONS: Record<string, string[]> = {
          pending: ["confirmed", "cancelled"],
          confirmed: ["processing", "cancelled"],
          processing: ["shipped", "cancelled"],
          shipped: ["completed", "cancelled"],
          completed: [],
          cancelled: [],
        };

        // Idempotent: same status is no-op
        if (order.status === p_new_status) {
          return {
            data: { success: true, idempotent: true, status: order.status },
            error: null,
          };
        }

        const allowed = ALLOWED_TRANSITIONS[order.status] || [];
        if (!allowed.includes(p_new_status)) {
          return {
            data: null,
            error: {
              message: `Cannot transition order status from "${order.status}" to "${p_new_status}".`,
            },
          };
        }

        // Atomic stock restoration when transitioning to cancelled for the first time
        if (p_new_status === "cancelled" && order.status !== "cancelled") {
          const items = db.order_items.filter((it) => it.order_id === order.id);
          for (const item of items) {
            const product = db.products.find((p) => p.id === item.product_id);
            if (product) {
              product.stock_quantity = (product.stock_quantity || 0) + Number(item.quantity);
            }
          }
        }

        const previousStatus = order.status;
        order.status = p_new_status as any;
        if (params.p_courier_name !== undefined) {
          (order as any).courier_name = params.p_courier_name;
        }
        if (params.p_tracking_number !== undefined) {
          (order as any).tracking_number = params.p_tracking_number;
        }
        order.updated_at = new Date().toISOString();
        writeDB(db);

        return {
          data: {
            success: true,
            previous_status: previousStatus,
            new_status: p_new_status,
            courier_name: (order as any).courier_name || null,
            tracking_number: (order as any).tracking_number || null,
          },
          error: null,
        };
      }

      if (func === "create_checkout_order") {
        const shop = db.shops.find((s) => s.slug === params.p_shop_slug && (s.status === "active" || !s.status));
        if (!shop) throw new Error(`Shop not found with slug ${params.p_shop_slug}`);

        // Durable duplicate-submit protection: if idempotency key matches an existing order for this store, return it idempotently without re-decrementing stock
        if (params.p_idempotency_key) {
          const existing = db.orders.find(
            (o) => o.shop_id === shop.id && (o as any).idempotency_key === params.p_idempotency_key
          );
          if (existing) {
            const shopPhone = normalizePhoneNumber(shop.whatsapp_number);
            const waText = encodeURIComponent(
              `Hello! A new order has been placed through your Kadeo store.\n\n*Order ID:* ${existing.order_code}\n*Customer:* ${existing.customer_name_snapshot || existing.customer_name}\n*Total:* LKR ${Number(existing.total || existing.total_amount || 0).toLocaleString()}`
            );
            return {
              data: {
                order_id: existing.id,
                order_code: existing.order_code,
                subtotal: Number(existing.subtotal || 0),
                total: Number(existing.total || existing.total_amount || 0),
                total_amount: Number(existing.total || existing.total_amount || 0),
                shop_name: shop.name,
                whatsapp_number: shop.whatsapp_number || "",
                whatsapp_url: `https://wa.me/${shopPhone}?text=${waText}`,
                idempotent: true,
              },
              error: null,
            };
          }
        }

        const shopSetting = db.shop_settings.find((s) => s.shop_id === shop.id);
        if (shopSetting && shopSetting.store_visibility === false) {
          throw new Error("This store is currently private and not accepting orders.");
        }

        let customer = db.customers.find((c) => c.shop_id === shop.id && c.phone === params.p_customer_phone);
        if (!customer) {
          customer = {
            id: crypto.randomUUID(),
            shop_id: shop.id,
            full_name: params.p_customer_name,
            phone: params.p_customer_phone,
            email: params.p_customer_email || null,
            address: params.p_customer_address,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          db.customers.push(customer);
        } else {
          customer.full_name = params.p_customer_name;
          customer.address = params.p_customer_address;
          if (params.p_customer_email) customer.email = params.p_customer_email;
          customer.updated_at = new Date().toISOString();
        }

        const year = new Date().getFullYear();
        let orderCode = "";
        let attempts = 0;
        do {
          const rand = Math.floor(100000 + Math.random() * 900000);
          orderCode = `KAD-${year}-${rand}`;
          attempts++;
        } while (db.orders.some((o) => o.order_code === orderCode) && attempts < 100);

        const orderId = crypto.randomUUID();

        let subtotal = 0;
        const createdItems: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number }> = [];
        for (const item of params.p_items) {
          if (!item.quantity || item.quantity <= 0) {
            throw new Error(`Invalid quantity for item`);
          }
          const product = db.products.find((p) => p.id === item.product_id && p.shop_id === shop.id);
          if (!product) throw new Error("Product not found");
          if (product.status && product.status !== "active") {
            throw new Error(`Product ${product.name} is not available for purchase`);
          }
          if (product.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          product.stock_quantity -= item.quantity;
          const lineTotal = product.price * item.quantity;
          subtotal += lineTotal;

          db.order_items.push({
            id: crypto.randomUUID(),
            order_id: orderId,
            shop_id: shop.id,
            product_id: product.id,
            product_name: product.name,
            product_name_snapshot: product.name,
            unit_price: product.price,
            quantity: item.quantity,
            line_total: lineTotal,
            created_at: new Date().toISOString(),
          });
          createdItems.push({
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal,
          });
        }

        const deliveryFee = typeof params.p_delivery_fee === "number" && !isNaN(params.p_delivery_fee)
          ? Math.max(0, params.p_delivery_fee)
          : 0;
        const deliveryZone = params.p_delivery_zone || "Standard Delivery";
        const totalAmount = subtotal + deliveryFee;
        const orderNotes = params.p_order_note || params.p_order_notes || null;

        const newOrder = {
          id: orderId,
          shop_id: shop.id,
          customer_id: customer.id,
          order_code: orderCode,
          subtotal,
          delivery_fee: deliveryFee,
          delivery_zone: deliveryZone,
          total: totalAmount,
          total_amount: totalAmount,
          currency: "LKR",
          status: "pending" as const,
          customer_name: params.p_customer_name,
          customer_phone: params.p_customer_phone,
          customer_address: params.p_customer_address,
          customer_email: params.p_customer_email,
          customer_name_snapshot: params.p_customer_name,
          customer_phone_snapshot: params.p_customer_phone,
          delivery_address_snapshot: params.p_customer_address,
          customer_email_snapshot: params.p_customer_email,
          order_note: orderNotes,
          order_notes: orderNotes,
          order_notes_snapshot: orderNotes,
          idempotency_key: params.p_idempotency_key || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        db.orders.push(newOrder);
        writeDB(db);

        const waText = encodeURIComponent(
          `Hello! A new order has been placed through your Kadeo store.\n\n*Order ID:* ${orderCode}\n*Customer:* ${params.p_customer_name}\n*Phone:* ${params.p_customer_phone}\n*Delivery Address:* ${params.p_customer_address}\n` +
            (orderNotes ? `*Note:* ${orderNotes}\n` : "") +
            `\n*Total:* LKR ${totalAmount.toLocaleString()}\n\nPlease check your Kadeo seller portal to confirm and dispatch.`
        );

        const shopPhone = normalizePhoneNumber(shop.whatsapp_number);
        const whatsappUrl = `https://wa.me/${shopPhone}?text=${waText}`;

        return {
          data: {
            order_id: orderId,
            order_code: orderCode,
            subtotal,
            total: totalAmount,
            total_amount: totalAmount,
            delivery_fee: deliveryFee,
            delivery_zone: deliveryZone,
            shop_name: shop.name,
            shop_slug: shop.slug,
            customer_name: params.p_customer_name,
            customer_phone: params.p_customer_phone,
            customer_address: params.p_customer_address,
            order_note: orderNotes,
            whatsapp_number: shop.whatsapp_number || "",
            whatsapp_url: whatsappUrl,
            items: createdItems,
            created_at: newOrder.created_at,
          },
          error: null,
        };
      }

      if (func === "track_customer_order") {
        const { p_shop_slug, p_order_code, p_normalized_phone } = params;

        if (!p_shop_slug || !p_order_code || !p_normalized_phone) {
          return {
            data: { success: false, error: "Missing required tracking parameters." },
            error: null,
          };
        }

        const shop = db.shops.find(
          (s) => s.slug === p_shop_slug.trim() && (s.status === "active" || !s.status)
        );
        if (!shop) {
          return {
            data: { success: false, error: "Store not found." },
            error: null,
          };
        }

        const cleanCode = p_order_code.trim().toUpperCase();
        const order = db.orders.find(
          (o) => o.shop_id === shop.id && o.order_code.trim().toUpperCase() === cleanCode
        );

        if (!order) {
          return {
            data: {
              success: false,
              error: "No order found matching this order code and phone number. Please verify your details.",
            },
            error: null,
          };
        }

        // Exact normalized phone match
        const orderPhoneRaw =
          order.customer_phone_snapshot ||
          order.customer_phone ||
          "";
        const orderPhoneNorm = normalizePhoneNumber(orderPhoneRaw);
        const inputPhoneNorm = normalizePhoneNumber(p_normalized_phone);

        if (orderPhoneNorm !== inputPhoneNorm) {
          return {
            data: {
              success: false,
              error: "No order found matching this order code and phone number. Please verify your details.",
            },
            error: null,
          };
        }

        const items = db.order_items
          .filter((it) => it.order_id === order.id)
          .map((it) => ({
            id: it.id,
            name: it.product_name_snapshot || it.product_name || "Item",
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unit_price || 0),
            lineTotal: Number(it.line_total || 0),
          }));

        return {
          data: {
            success: true,
            order: {
              orderCode: order.order_code,
              status: order.status,
              createdAt: order.created_at,
              updatedAt: order.updated_at,
              subtotal: Number(order.subtotal || 0),
              deliveryFee: Number(order.delivery_fee || 0),
              deliveryZone: (order as any).delivery_zone || null,
              courierName: (order as any).courier_name || null,
              trackingNumber: (order as any).tracking_number || null,
              total: Number(order.total || order.total_amount || 0),
              currency: order.currency || "LKR",
              customerName:
                order.customer_name_snapshot ||
                order.customer_name ||
                "Customer",
              deliveryAddress:
                order.delivery_address_snapshot ||
                order.customer_address ||
                "Provided on order",
              items,
              shopName: shop.name,
              whatsappNumber: normalizePhoneNumber(shop.whatsapp_number || ""),
            },
          },
          error: null,
        };
      }

      if (func === "increment_stock") {
        const prod = db.products.find((p) => p.id === params.p_product_id);
        if (prod) {
          prod.stock_quantity = (prod.stock_quantity || 0) + Number(params.p_quantity);
          writeDB(db);
        }
        return { data: null, error: null };
      }

      return { data: null, error: null };
    },
  };
}


